import { ConfigService } from '@nestjs/config';
import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { User } from '../modules/users/entities/user.entity';
import { UserProfile } from '../modules/users/entities/user-profile.entity';

export const databaseConfig = (
  configService: ConfigService,
): SequelizeModuleOptions => ({
  dialect: 'postgres',
  host:     configService.get<string>('db.host'),
  port:     configService.get<number>('db.port'),
  username: configService.get<string>('db.username'),
  password: configService.get<string>('db.password'),
  database: configService.get<string>('db.database'),
  models: [User, UserProfile],   // ← add here
  synchronize: true,
  autoLoadModels: true,
  logging: configService.get<boolean>('db.logging')
    ? console.log
    : false,
  define: {
    underscored: true,
    timestamps: true,
    paranoid: true,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});