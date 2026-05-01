import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import {
  appConfig,
  dbConfig,
  jwtConfig,
  mailConfig,
  stripeConfig,
  uploadConfig,
  throttleConfig,
} from './config';

import { databaseConfig } from './database/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [
        appConfig,
        dbConfig,
        jwtConfig,
        mailConfig,
        stripeConfig,
        uploadConfig,
        throttleConfig,
      ],
    }),

    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: databaseConfig,
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}