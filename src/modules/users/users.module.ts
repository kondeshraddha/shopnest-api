import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';

@Module({
  imports: [
    // Register models for this module
    SequelizeModule.forFeature([User, UserProfile]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
  ],
  exports: [
    // Export so other modules can use
    UsersService,
    UsersRepository,
  ],
})
export class UsersModule {}