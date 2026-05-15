import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CategoriesRepository } from './categories.repository';
import { Category } from './entities/category.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([Category]),
  ],
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    CategoriesRepository,
  ],
  exports: [
    CategoriesService,
    CategoriesRepository,
  ],
})
export class CategoriesModule {}