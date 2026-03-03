import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@Controller('uploads')
export class UploadsController {
  @Get('*path')
  getFile(@Param() params: { path: string[] }, @Res() res: Response) {
    if (!params.path || params.path.length === 0) {
      return res.status(404).send('Not Found');
    }
    const encodedPath = params.path.map((p) => encodeURIComponent(p)).join('/');

    const filePath = join(process.cwd(), 'uploads', encodedPath);

    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    return res.sendFile(filePath);
  }
}
