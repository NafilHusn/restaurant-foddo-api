import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from '../utils/swagger/swagger.config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const devMode = configService.get<string>('NODE_ENV') === 'development';
  const port = configService.get<number>('PORT') || 3000;
  if (devMode) {
    setupSwagger(app, configService);
  } else {
    app.use(helmet());
  }

  const corsOptions: CorsOptions = {
    origin: '*',
    methods: 'GET,POST, PUT, DELETE',
    allowedHeaders:
      'Content-Type, Accept, Authorization, cache-control, x-refresh-token',
    credentials: true,
  };

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
    }),
  );

  app.enableCors(corsOptions);
  await app.listen(port);

  const url = await app.getUrl();
  Logger.log(`Application is running on: ${url}`);
  if (devMode) {
    Logger.log(`Swagger documentation is available at: ${url}/docs`);
  }
}
bootstrap();
