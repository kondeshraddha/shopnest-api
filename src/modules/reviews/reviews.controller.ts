import {
  Controller, Get, Post, Patch,
  Delete, Body, Param, Query,
  UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiBearerAuth, ApiOperation,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/constants';
import { User } from '../users/entities/user.entity';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
  ) {}

  // ══════════════════════════════════════════════════════
  // PUBLIC ROUTES
  // ══════════════════════════════════════════════════════

  @Public()
  @Get('product/:productId')
  @ApiOperation({
    summary: 'Get reviews for a product',
  })
  getProductReviews(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.reviewsService.getProductReviews(
      productId,
      parseInt(page) || 1,
      parseInt(limit) || 10,
    );
  }

  // ══════════════════════════════════════════════════════
  // USER ROUTES
  // ══════════════════════════════════════════════════════

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Write a product review' })
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(userId, dto);
  }

  @Get('my')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my reviews' })
  getMyReviews(
    @CurrentUser('id') userId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.reviewsService.getMyReviews(
      userId,
      parseInt(page) || 1,
      parseInt(limit) || 10,
    );
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit my review' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete my review' })
  remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const isAdmin = user.role === UserRole.ADMIN;
    return this.reviewsService.remove(user.id, id, isAdmin);
  }

  // ══════════════════════════════════════════════════════
  // ADMIN ROUTES
  // ══════════════════════════════════════════════════════

  @Get('admin/all')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Get all reviews' })
  getAllReviews(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.reviewsService.getAllReviews(
      parseInt(page) || 1,
      parseInt(limit) || 10,
    );
  }

  @Patch('admin/:id/approve')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Approve a review' })
  approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.approve(id);
  }

  @Patch('admin/:id/reject')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Reject a review' })
  reject(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.reject(id);
  }
}