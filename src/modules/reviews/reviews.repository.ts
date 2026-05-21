import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Review } from './entities/review.entity';
import { User } from '../users/entities/user.entity';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewsRepository {
  constructor(
    @InjectModel(Review)
    private reviewModel: typeof Review,
  ) {}

  // ─── FIND PRODUCT REVIEWS ────────────────────────────
  async findProductReviews(
    productId: string,
    page: number,
    limit: number,
  ) {
    const offset = (page - 1) * limit;

    return this.reviewModel.findAndCountAll({
      where: {
        productId,
        isApproved: true,
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: [
            'id', 'firstName',
            'lastName', 'avatar',
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
  }

  // ─── FIND USER REVIEWS ────────────────────────────────
  async findUserReviews(
    userId: string,
    page: number,
    limit: number,
  ) {
    const offset = (page - 1) * limit;

    return this.reviewModel.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
  }

  // ─── FIND ALL REVIEWS (Admin) ─────────────────────────
  async findAllReviews(page: number, limit: number) {
    const offset = (page - 1) * limit;

    return this.reviewModel.findAndCountAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
  }

  // ─── FIND BY ID ──────────────────────────────────────
  async findById(id: string) {
    return this.reviewModel.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: [
            'id', 'firstName',
            'lastName', 'avatar',
          ],
        },
      ],
    });
  }

  // ─── CHECK EXISTING REVIEW ───────────────────────────
  async findUserProductReview(
    userId: string,
    productId: string,
  ) {
    return this.reviewModel.findOne({
      where: { userId, productId },
    });
  }

  // ─── CREATE ──────────────────────────────────────────
  async create(data: any) {
    return this.reviewModel.create(data);
  }

  // ─── UPDATE ──────────────────────────────────────────
  async update(review: Review, dto: UpdateReviewDto) {
    return review.update(dto);
  }

  // ─── DELETE ──────────────────────────────────────────
  async delete(review: Review) {
    await review.destroy();
  }

  // ─── APPROVE ─────────────────────────────────────────
  async approve(review: Review) {
    return review.update({ isApproved: true });
  }

  // ─── REJECT ──────────────────────────────────────────
  async reject(review: Review) {
    return review.update({ isApproved: false });
  }

  // ─── GET PRODUCT RATING STATS ─────────────────────────
  async getProductRatingStats(productId: string) {
    const reviews = await this.reviewModel.findAll({
      where: { productId, isApproved: true },
      attributes: ['rating'],
    });

    if (!reviews.length) {
      return { avgRating: 0, reviewCount: 0 };
    }

    const total = reviews.reduce(
      (sum, r) => sum + r.rating, 0,
    );
    const avgRating = parseFloat(
      (total / reviews.length).toFixed(2),
    );

    return {
      avgRating,
      reviewCount: reviews.length,
    };
  }
}