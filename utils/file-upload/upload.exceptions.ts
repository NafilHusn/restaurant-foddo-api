import { HttpException, HttpStatus } from '@nestjs/common';

export class FileTypeNotAllowedException extends HttpException {
  constructor(fileType: string) {
    super(
      `File type ${fileType} is not allowed`,
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

export class FileSizeTooLargeException extends HttpException {
  constructor(size: number, limit: number) {
    super(
      `File size ${size} bytes exceeds limit of ${limit} bytes`,
      HttpStatus.PAYLOAD_TOO_LARGE,
    );
  }
}
