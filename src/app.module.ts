import { Module } from '@nestjs/common';
import { RestaurantModule } from './restaurant/restaurant.module';
import { DatabaseModule } from 'utils/db/db.module';
import { RoleModule } from './roles/role.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { configValidationSchema } from '../utils/config/config.schema';
import { SessionModule } from './session/session.module';
import { SwaggerModule } from './swagger/swagger.module';
import { PermissionModule } from './permission/permission.module';
import { SharedCacheModule } from '../utils/cache/cache.module';
import { MenuModule } from './menu/menu.module';
import { OrderModule } from './orders/orders.module';
import { FileUploadModule } from '../utils/file-upload/file-upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
    }),
    DatabaseModule,
    SharedCacheModule,
    SwaggerModule,
    RoleModule,
    UsersModule,
    AuthModule,
    SessionModule,
    PermissionModule,
    RestaurantModule,
    MenuModule,
    OrderModule,
    FileUploadModule,
  ],
})
export class AppModule {}
