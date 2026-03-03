import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUploadService, UploadOutput } from './IUploadService';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { CacheService } from 'utils/cache/cache.service';
import { ALLOWED_FILE_TYPES, FILE_SIZE_LIMIT } from './upload.constants';
import { FileSizeTooLargeException, FileTypeNotAllowedException } from './upload.exceptions';
import path from 'path';
@Injectable()
export class S3UploadService implements IUploadService, OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
  ) {}

  private s3Client: S3Client;
  private bucketName: string;
  private tempPath = 'temp';

  private validateFile(file: Express.Multer.File, type?: string[]): void {
    // Check file size
    if (file.size > FILE_SIZE_LIMIT)
      throw new FileSizeTooLargeException(file.size, FILE_SIZE_LIMIT);

    // Check file type
    const fileExtension = path.extname(file.originalname).toLowerCase();
    let isAllowedType = false;
    if (type) {
      isAllowedType = type.includes(fileExtension);
    } else {
      isAllowedType = ALLOWED_FILE_TYPES.includes(fileExtension);
    }
    if (!isAllowedType) throw new FileTypeNotAllowedException(fileExtension);
  }

  onModuleInit() {
    this.bucketName = this.configService.get('AWS_S3_BUCKET_NAME') as string;
    const AWS_REGION = this.configService.get('AWS_REGION') as string;
    const AWS_IAM_ACCESS_KEY_ID = this.configService.get(
      'AWS_IAM_ACCESS_KEY_ID',
    ) as string;
    const AWS_IAM_SECRET_ACCESS_KEY = this.configService.get(
      'AWS_IAM_SECRET_ACCESS_KEY',
    ) as string;
    this.s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_IAM_ACCESS_KEY_ID,
        secretAccessKey: AWS_IAM_SECRET_ACCESS_KEY,
      },
    });
  }

  private generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const fileExtension = originalName.split('.').pop();
    return `${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
  }

  async uploadFile(
    file: Express.Multer.File,
    path: string,
    type?: string[],
  ): Promise<UploadOutput> {
    this.validateFile(file, type);
    const fileName = this.generateFileName(file.originalname);
    // remove leading slash if exists
    path = path.startsWith('/') ? path.slice(1) : path;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: `${path}/${fileName}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    await this.s3Client.send(command);
    return {
      fileName,
      originalName: file.originalname,
      path: `uploads/${path}/${fileName}`,
      timestamp: new Date(),
    };
  }

  async uploadFiles(
    files: Express.Multer.File[],
    path: string,
  ): Promise<UploadOutput[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, path));
    return Promise.all(uploadPromises);
  }

  private getS3FilePath(filePath: string): string {
    // remove the leading 'uploads' string
    return filePath.startsWith('uploads/') ? filePath.slice(8) : filePath;
  }

  async deleteFile(filePath: string): Promise<boolean> {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: this.getS3FilePath(filePath),
    });
    await this.s3Client.send(deleteCommand);
    return true;
  }

  async deleteFiles(filePaths: string[]): Promise<boolean> {
    const deleteCommands = filePaths.map((filePath) => ({
      Key: this.getS3FilePath(filePath),
    }));
    const command = new DeleteObjectsCommand({
      Bucket: this.bucketName,
      Delete: {
        Objects: deleteCommands,
      },
    });
    await this.s3Client.send(command);
    return true;
  }

  private async listAllUnderPath(prefix: string): Promise<string[]> {
    const command = new ListObjectsCommand({
      Bucket: this.bucketName,
      Prefix: `/${prefix}`,
    });

    const response = await this.s3Client.send(command);
    if (!response.Contents) return [];
    return response.Contents.map((item) => item.Key).filter(
      (key) => key !== undefined,
    );
  }

  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async clearTempDirectoryFiles(): Promise<boolean> {
    const response = await this.listAllUnderPath(this.tempPath);
    if (response.length > 0) {
      const deleteCommands = response.map((item) => ({
        Key: item,
      }));
      const deleteCommand = new DeleteObjectsCommand({
        Bucket: this.bucketName,
        Delete: {
          Objects: deleteCommands,
        },
      });
      await this.s3Client.send(deleteCommand);
      return true;
    }
    return false;
  }

  async deleteDirectory(folderPath: string): Promise<boolean> {
    const response = await this.listAllUnderPath(folderPath);
    if (response.length > 0) {
      const deleteCommands = response.map((item) => ({
        Key: item,
      }));
      const deleteCommand = new DeleteObjectsCommand({
        Bucket: this.bucketName,
        Delete: {
          Objects: deleteCommands,
        },
      });
      await this.s3Client.send(deleteCommand);
      return true;
    }
    return false;
  }

  async uploadBuffer(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    path: string,
  ): Promise<UploadOutput> {
    path = path.startsWith('/') ? path.slice(1) : path;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: `${path}/${fileName}`,
      Body: buffer,
      ContentType: mimeType,
    });

    await this.s3Client.send(command);

    return {
      fileName,
      originalName: fileName,
      path: `uploads/${path}/${fileName}`,
      timestamp: new Date(),
    };
  }

  async generateUploadUrl(
    folder: string,
    fileName: string,
    contentType: string,
  ) {
    const env = this.configService.get('NODE_ENV') as string;
    const fileKey = `${env}/${folder}/${randomUUID()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 300, // 5 minutes
    });

    return {
      uploadUrl,
      key: fileKey,
      fileName,
      contentType,
    };
  }

  async generateViewUrl(key: string) {
    const cachedUrl = await this.cacheService.get(key);
    if (cachedUrl) {
      return cachedUrl;
    }
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const expiresIn = 3000;

    const url = await getSignedUrl(this.s3Client, command, { expiresIn });
    await this.cacheService.set(key, url, expiresIn);
    return url;
  }
}
