import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { MulterField } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { ApiConsumes } from '@nestjs/swagger';

export const ReceiveFiles = (uploadFields: MulterField[]) => {
  return applyDecorators(
    UseInterceptors(FileFieldsInterceptor(uploadFields)),
    ApiConsumes('multipart/form-data'),
  );
};

export const ReceiveFile = (fieldName: string, maxCount = 1) =>
  ReceiveFiles([{ name: fieldName, maxCount }]);

export const FileField = (fieldName: string) =>
  createParamDecorator((_, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.files?.[fieldName]?.[0] ?? null;
  })();

export const FilesField = (fieldName: string) =>
  createParamDecorator((_, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.files?.[fieldName] ?? null;
  })();
