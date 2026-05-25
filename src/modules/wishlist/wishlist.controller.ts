import {
  Controller, Get, Post, Delete,
  Param, Query, ParseUUIDPipe,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiBearerAuth, ApiOperation,
} from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Wishlist')
@ApiBearerAuth()
@Controller('wishlist')
export class WishlistController {
  constructor(
    private readonly wishlistService: WishlistService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get my wishlist with product details',
  })
  getWishlist(
    @CurrentUser('id') userId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.wishlistService.getWishlist(
      userId,
      parseInt(page) || 1,
      parseInt(limit) || 10,
    );
  }

  @Get('count')
  @ApiOperation({
    summary: 'Get total items in wishlist',
  })
  getCount(@CurrentUser('id') userId: string) {
    return this.wishlistService.getCount(userId);
  }

  @Get('check/:productId')
  @ApiOperation({
    summary: 'Check if product is in wishlist',
  })
  checkWishlist(
    @CurrentUser('id') userId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.wishlistService.checkWishlist(
      userId, productId,
    );
  }

  @Post(':productId')
  @ApiOperation({ summary: 'Add product to wishlist' })
  addToWishlist(
    @CurrentUser('id') userId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.wishlistService.addToWishlist(
      userId, productId,
    );
  }

  @Post('toggle/:productId')
  @ApiOperation({
    summary: 'Toggle product in wishlist (add/remove)',
  })
  toggleWishlist(
    @CurrentUser('id') userId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.wishlistService.toggleWishlist(
      userId, productId,
    );
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove product from wishlist',
  })
  removeFromWishlist(
    @CurrentUser('id') userId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.wishlistService.removeFromWishlist(
      userId, productId,
    );
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear entire wishlist' })
  clearWishlist(@CurrentUser('id') userId: string) {
    return this.wishlistService.clearWishlist(userId);
  }
}