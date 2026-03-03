import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IUploadServiceToken } from './IUploadService';
import { UploadsController } from './file-upload.controller';
import { LocalUploadService } from './LocalUpload.service';

const UploadProvider = {
  provide: IUploadServiceToken,
  useClass: LocalUploadService,
};

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [UploadsController],
  providers: [Logger, UploadProvider],
  exports: [UploadProvider],
})
export class FileUploadModule {}
