import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import {
  appConfig, dbConfig, jwtConfig,
  mailConfig, stripeConfig,
  uploadConfig, throttleConfig,
} from './config';
import { databaseConfig } from './database/database.config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

// ─── Feature Modules ─────────────────────────────────
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [
        appConfig, dbConfig, jwtConfig,
        mailConfig, stripeConfig,
        uploadConfig, throttleConfig,
      ],
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: databaseConfig,
      inject: [ConfigService],
    }),

    // ─── Feature Modules ───────────────────────────
    UsersModule,
  ],
  providers: [
    { provide: APP_FILTER,       useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR,  useClass: ResponseInterceptor },
    { provide: APP_GUARD,        useClass: JwtAuthGuard },
  ],
})
export class AppModule {}