import { NotEmptyString } from 'utils/string.helper';

export class UploadOutput {
  path: string;
  fileName: string;
  originalName: string;
  timestamp: Date;
}

export class PresignedUrlOutput {
  @NotEmptyString()
  uploadUrl: string;
  @NotEmptyString()
  key: string;
  @NotEmptyString()
  fileName: string;
  @NotEmptyString()
  contentType: string;
}

export interface IUploadService {
  uploadFile(
    file: Express.Multer.File,
    path: string,
    type?: string[],
  ): Promise<UploadOutput>;
  uploadBuffer(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    path: string,
  ): Promise<UploadOutput>;
  uploadFiles(
    files: Express.Multer.File[],
    path: string,
  ): Promise<UploadOutput[]>;
  deleteFiles(filePaths: string[]): Promise<boolean>;
  deleteFile(filePath: string): Promise<boolean>;
  clearTempDirectoryFiles(): Promise<boolean>;
  generateUploadUrl(
    folder: string,
    fileName: string,
    contentType: string,
  ): Promise<PresignedUrlOutput>;
}

export interface IUploadServiceResponse {
  uploadedFileName: string;
  size: number;
  mimeType: string;
}

export const IUploadServiceToken = Symbol('IUploadService');
