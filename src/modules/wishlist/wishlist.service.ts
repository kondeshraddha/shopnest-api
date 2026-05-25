import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { WishlistRepository } from './wishlist.repository';
import { ProductsRepository } from '../products/products.repository';
import { paginate } from '../../common/utils/pagination.util';

@Injectable()
export class WishlistService {
  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly productsRepository: ProductsRepository,
  ) {}

  async getWishlist(
    userId: string,
    page: number,
    limit: number,
  ) {
    const { count, rows } =
      await this.wishlistRepository.findAllByUserId(
        userId, page, limit,
      );

    return paginate(rows, count, page, limit);
  }

  async addToWishlist(
    userId: string,
    productId: string,
  ) {
   
    const product =
      await this.productsRepository.findById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existing =
      await this.wishlistRepository.findByUserAndProduct(
        userId, productId,
      );

    if (existing) {
      throw new ConflictException(
        'Product is already in your wishlist',
      );
    }

    await this.wishlistRepository.create(
      userId, productId,
    );

    return {
      message: 'Product added to wishlist',
      data: { productId, isWishlisted: true },
    };
  }

  async removeFromWishlist(
    userId: string,
    productId: string,
  ) {
    const wishlistItem =
      await this.wishlistRepository.findByUserAndProduct(
        userId, productId,
      );

    if (!wishlistItem) {
      throw new NotFoundException(
        'Product not found in wishlist',
      );
    }

    await this.wishlistRepository.delete(wishlistItem);

    return {
      message: 'Product removed from wishlist',
      data: { productId, isWishlisted: false },
    };
  }

  async checkWishlist(
    userId: string,
    productId: string,
  ) {
    const wishlistItem =
      await this.wishlistRepository.findByUserAndProduct(
        userId, productId,
      );

    return {
      message: 'Wishlist status fetched',
      data: {
        productId,
        isWishlisted: !!wishlistItem,
      },
    };
  }

  async getCount(userId: string) {
    const count =
      await this.wishlistRepository.countByUserId(userId);

    return {
      message: 'Wishlist count fetched',
      data: { count },
    };
  }

  async clearWishlist(userId: string) {
    await this.wishlistRepository.clearAll(userId);

    return {
      message: 'Wishlist cleared successfully',
    };
  }

  async toggleWishlist(
    userId: string,
    productId: string,
  ) {
    const product =
      await this.productsRepository.findById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existing =
      await this.wishlistRepository.findByUserAndProduct(
        userId, productId,
      );

    if (existing) {

      await this.wishlistRepository.delete(existing);
      return {
        message: 'Product removed from wishlist',
        data: { productId, isWishlisted: false },
      };
    } else {
  
      await this.wishlistRepository.create(
        userId, productId,
      );
      return {
        message: 'Product added to wishlist',
        data: { productId, isWishlisted: true },
      };
    }
  }
}