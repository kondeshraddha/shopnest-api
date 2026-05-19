import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiBearerAuth, ApiOperation,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
  ) {}

  // ─── GET MY CART ─────────────────────────────────────
  @Get()
  @ApiOperation({
    summary: 'Get my cart with all items and totals',
  })
  getCart(@CurrentUser('id') userId: string) {
    return this.cartService.getCart(userId);
  }

  // ─── GET ITEM COUNT ───────────────────────────────────
  @Get('count')
  @ApiOperation({ summary: 'Get total items count in cart' })
  getCount(@CurrentUser('id') userId: string) {
    return this.cartService.getItemCount(userId);
  }

  // ─── ADD TO CART ─────────────────────────────────────
  @Post('items')
  @ApiOperation({ summary: 'Add product to cart' })
  addToCart(
    @CurrentUser('id') userId: string,
    @Body() dto: AddToCartDto,
  ) {
    return this.cartService.addToCart(userId, dto);
  }

  // ─── UPDATE QUANTITY ──────────────────────────────────
  @Patch('items/:id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  updateItem(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(
      userId,
      itemId,
      dto,
    );
  }

  // ─── REMOVE ITEM ─────────────────────────────────────
  @Delete('items/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove item from cart' })
  removeItem(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) itemId: string,
  ) {
    return this.cartService.removeCartItem(userId, itemId);
  }

  // ─── CLEAR CART ──────────────────────────────────────
  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear entire cart' })
  clearCart(@CurrentUser('id') userId: string) {
    return this.cartService.clearCart(userId);
  }
}