import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';
import {
  IUploadService,
  PresignedUrlOutput,
  UploadOutput,
} from './IUploadService';
import {
  ALLOWED_FILE_TYPES,
  FILE_SIZE_LIMIT,
  mediaExtensions,
} from './upload.constants';
import {
  FileSizeTooLargeException,
  FileTypeNotAllowedException,
} from './upload.exceptions';
import { randomUUID } from 'crypto';
import { getErrorMessage } from '../error.helper';

@Injectable()
export class LocalUploadService
  implements Omit<IUploadService, 'uploadBuffer'>, OnModuleInit
{
  constructor(private readonly logger: Logger) {}

  private readonly mediaExtensions = mediaExtensions;

  private uploadDir = 'uploads';
  private tempDir = 'temp';

  checkDirectoryExists(directory: string): boolean {
    const exists = fs.existsSync(directory);
    if (!exists) {
      throw new BadRequestException('Directory does not exist');
    }
    return exists;
  }
  async getAllMediaFiles(directory: string): Promise<string[]> {
    return this.getFilesRecursively(directory);
  }

  private async getFilesRecursively(
    directory: string,
    fileList: string[] = [],
  ): Promise<string[]> {
    // Get base path
    const basePath = path.join(this.uploadDir, directory);

    if (!fs.existsSync(basePath)) {
      throw new BadRequestException('Directory does not exist');
    }

    // First, check files in the current directory
    const baseFiles = fs.readdirSync(basePath, { withFileTypes: true });

    // Process files in current directory
    for (const file of baseFiles) {
      if (file.isFile() && this.isMediaFile(file.name)) {
        const filePath = path.join(basePath, file.name);
        fileList.push(filePath);
      }
    }

    // Then process subdirectories
    const folders = baseFiles
      .filter((dir) => dir.isDirectory())
      .map((dir) => dir.name);

    // Process each folder
    for (const folder of folders) {
      await this.getFilesRecursively(path.join(directory, folder), fileList);
    }
    return fileList;
  }

  async fetchMediaFiles(path: string): Promise<string[]> {
    return this.getFilesRecursively(path);
  }

  private isMediaFile(fileName: string): boolean {
    return this.mediaExtensions.some((ext) =>
      fileName.toLowerCase().endsWith(ext),
    );
  }

  onModuleInit() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir);
    }
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir);
    }
  }

  private generateFileName(originalName: string): string {
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:.]/g, '')
      .substring(6);
    const randomString = Math.random().toString(36).substring(2);
    const extension = path.extname(originalName);
    return `${timestamp}-${randomString}${extension}`;
  }

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

  private makeUploadPath(filePath: string) {
    const uploadPath = path.join(this.uploadDir, filePath);
    if (!fs.existsSync(uploadPath))
      fs.mkdirSync(uploadPath, { recursive: true });
    return uploadPath;
  }

  async uploadFile(
    file: Express.Multer.File,
    filePath: string,
    type?: string[],
  ): Promise<UploadOutput> {
    try {
      // Validate file
      this.validateFile(file, type);
      const uploadPath = this.makeUploadPath(filePath);
      // Generate unique filename
      const fileName = this.generateFileName(file.originalname);
      const finalPath = path.join(uploadPath, fileName);
      // Write file to disk
      await fs.promises.writeFile(finalPath, file.buffer);
      return {
        fileName,
        originalName: file.originalname,
        timestamp: new Date(),
        path: finalPath.toString(),
      };
    } catch (error) {
      this.logger.error(
        `File upload failed: ${getErrorMessage(error)}`,
        getErrorMessage(error, 'stack'),
      );
      throw error;
    }
  }

  async deleteFile(filePath: string): Promise<boolean> {
    if (!fs.existsSync(filePath)) return false;
    await fs.promises.unlink(filePath);
    return true;
  }

  async uploadFiles(
    files: Express.Multer.File[],
    path: string,
  ): Promise<UploadOutput[]> {
    const uploadedPaths: UploadOutput[] = [];
    for (const eachFile of files) {
      const uploadOutput = await this.uploadFile(eachFile, path);
      uploadedPaths.push(uploadOutput);
    }
    return uploadedPaths;
  }

  async deleteFiles(filePaths: string[]): Promise<boolean> {
    for (const eachPath of filePaths) await this.deleteFile(eachPath);
    return true;
  }

  generateUploadUrl(
    folder: string,
    fileName: string,
    contentType: string,
  ): Promise<PresignedUrlOutput> {
    const fileKey = `${folder}/${randomUUID()}-${fileName}`;

    return Promise.resolve({
      uploadUrl: '',
      key: fileKey,
      fileName,
      contentType,
    });
  }

  deleteDirectory(folderPath: string) {
    if (fs.existsSync(folderPath)) fs.rmdirSync(folderPath);
    return true;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async clearTempDirectoryFiles() {
    fs.rmSync(this.tempDir, {
      recursive: true,
      maxRetries: 5,
      retryDelay: 1500,
    });
    return Promise.resolve(true);
  }
}
