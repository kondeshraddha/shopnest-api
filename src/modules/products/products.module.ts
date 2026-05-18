import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductsRepository } from './products.repository';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Product,
      ProductImage,
      ProductVariant,
    ]),
    CategoriesModule,
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductsRepository,
  ],
  exports: [
    ProductsService,
    ProductsRepository,
  ],
})
export class ProductsModule {}