import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Wishlist } from './entities/wishlist.entity';
import { Product } from '../products/entities/product.entity';
import { ProductImage } from '../products/entities/product-image.entity';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class WishlistRepository {
  constructor(
    @InjectModel(Wishlist)
    private wishlistModel: typeof Wishlist,
  ) {}

  async findAllByUserId(
    userId: string,
    page: number,
    limit: number,
  ) {
    const offset = (page - 1) * limit;

    return this.wishlistModel.findAndCountAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: 'product',
          include: [
            {
              model: ProductImage,
              as: 'images',
              where: { isPrimary: true },
              required: false,
            },
            {
              model: Category,
              as: 'category',
              required: false,
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
  }

  async findByUserAndProduct(
    userId: string,
    productId: string,
  ) {
    return this.wishlistModel.findOne({
      where: { userId, productId },
    });
  }

  async countByUserId(userId: string) {
    return this.wishlistModel.count({
      where: { userId },
    });
  }


  async create(userId: string, productId: string) {
    return this.wishlistModel.create({
      userId,
      productId,
    } as any);
  }


  async delete(wishlistItem: Wishlist) {
    await wishlistItem.destroy();
  }

  async clearAll(userId: string) {
    await this.wishlistModel.destroy({
      where: { userId },
    });
  }
}