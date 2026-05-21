import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ReviewsRepository } from './reviews.repository';
import { ProductsRepository } from '../products/products.repository';
import { OrdersRepository } from '../orders/orders.repository';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
import { OrderStatus } from '../../common/constants';
import { paginate } from '../../common/utils/pagination.util';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly productsRepository: ProductsRepository,
    private readonly ordersRepository: OrdersRepository,
  ) {}

  // ─── GET PRODUCT REVIEWS ─────────────────────────────
  async getProductReviews(
    productId: string,
    page: number,
    limit: number,
  ) {
    // Check product exists
    const product =
      await this.productsRepository.findById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const { count, rows } =
      await this.reviewsRepository.findProductReviews(
        productId, page, limit,
      );

    // Get rating stats
    const stats =
      await this.reviewsRepository.getProductRatingStats(
        productId,
      );

    const result = paginate(rows, count, page, limit);

    return {
      ...result,
      stats,
    };
  }

  // ─── CREATE REVIEW ───────────────────────────────────
  async create(userId: string, dto: CreateReviewDto) {

    // Check product exists
    const product =
      await this.productsRepository.findById(dto.productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check user already reviewed this product
    const existingReview =
      await this.reviewsRepository.findUserProductReview(
        userId, dto.productId,
      );

    if (existingReview) {
      throw new ConflictException(
        'You have already reviewed this product',
      );
    }

    // Check if verified purchase
    // User must have a delivered order with this product
    const userOrders =
      await this.ordersRepository.findUserOrders(
        userId, 1, 100,
      );

    const isVerifiedPurchase = userOrders.rows.some(
      (order) =>
        order.status === OrderStatus.DELIVERED &&
        order.items.some(
          (item) => item.productId === dto.productId,
        ),
    );

    // Create review
    const review = await this.reviewsRepository.create({
      userId,
      productId:          dto.productId,
      rating:             dto.rating,
      title:              dto.title,
      body:               dto.body,
      images:             dto.images,
      isVerifiedPurchase,
      isApproved:         true, // auto approve for simplicity
    });

    // Update product average rating
    await this.updateProductRating(dto.productId);

    return {
      message: 'Review submitted successfully',
      data: review,
    };
  }

  // ─── UPDATE REVIEW ───────────────────────────────────
  async update(
    userId: string,
    reviewId: string,
    dto: UpdateReviewDto,
  ) {
    const review =
      await this.reviewsRepository.findById(reviewId);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Check ownership
    if (review.userId !== userId) {
      throw new ForbiddenException(
        'You can only edit your own reviews',
      );
    }

    const updated =
      await this.reviewsRepository.update(review, dto);

    // Update product rating if rating changed
    if (dto.rating) {
      await this.updateProductRating(review.productId);
    }

    return {
      message: 'Review updated successfully',
      data: updated,
    };
  }

  // ─── DELETE REVIEW ───────────────────────────────────
  async remove(
    userId: string,
    reviewId: string,
    isAdmin: boolean,
  ) {
    const review =
      await this.reviewsRepository.findById(reviewId);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Only owner or admin can delete
    if (!isAdmin && review.userId !== userId) {
      throw new ForbiddenException(
        'You can only delete your own reviews',
      );
    }

    const productId = review.productId;
    await this.reviewsRepository.delete(review);

    // Update product rating
    await this.updateProductRating(productId);

    return { message: 'Review deleted successfully' };
  }

  // ─── GET MY REVIEWS ──────────────────────────────────
  async getMyReviews(
    userId: string,
    page: number,
    limit: number,
  ) {
    const { count, rows } =
      await this.reviewsRepository.findUserReviews(
        userId, page, limit,
      );

    return paginate(rows, count, page, limit);
  }

  // ─── APPROVE REVIEW (Admin) ───────────────────────────
  async approve(reviewId: string) {
    const review =
      await this.reviewsRepository.findById(reviewId);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    await this.reviewsRepository.approve(review);
    await this.updateProductRating(review.productId);

    return {
      message: 'Review approved successfully',
      data: review,
    };
  }

  // ─── REJECT REVIEW (Admin) ────────────────────────────
  async reject(reviewId: string) {
    const review =
      await this.reviewsRepository.findById(reviewId);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    await this.reviewsRepository.reject(review);
    await this.updateProductRating(review.productId);

    return {
      message: 'Review rejected successfully',
      data: review,
    };
  }

  // ─── GET ALL REVIEWS (Admin) ──────────────────────────
  async getAllReviews(page: number, limit: number) {
    const { count, rows } =
      await this.reviewsRepository.findAllReviews(
        page, limit,
      );

    return paginate(rows, count, page, limit);
  }

  // ─── UPDATE PRODUCT RATING (private) ─────────────────
  private async updateProductRating(productId: string) {
    const stats =
      await this.reviewsRepository.getProductRatingStats(
        productId,
      );

    const product =
      await this.productsRepository.findById(productId);

    if (product) {
      await product.update({
        avgRating:   stats.avgRating,
        reviewCount: stats.reviewCount,
      });
    }
  }
}