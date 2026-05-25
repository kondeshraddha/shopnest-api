import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';
import { WishlistRepository } from './wishlist.repository';
import { Wishlist } from './entities/wishlist.entity';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Wishlist]),
    ProductsModule,
  ],
  controllers: [WishlistController],
  providers: [WishlistService, WishlistRepository],
  exports: [WishlistService, WishlistRepository],
})
export class WishlistModule {}