import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { ProductsRepository } from '../products/products.repository';
import { AddToCartDto } from './dto/cart.dto';
import { UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productsRepository: ProductsRepository,
  ) {}

  // ─── GET CART ────────────────────────────────────────
  async getCart(userId: string) {
    const cart =
      await this.cartRepository.findCartByUserId(userId);

    if (!cart || !cart.items?.length) {
      return {
        message: 'Cart fetched successfully',
        data: {
          items:       [],
          subtotal:    0,
          tax:         0,
          shipping:    0,
          total:       0,
          itemCount:   0,
        },
      };
    }

    // Calculate totals
    const totals = this.calculateTotals(cart.items);

    return {
      message: 'Cart fetched successfully',
      data: {
        id:        cart.id,
        items:     cart.items,
        ...totals,
      },
    };
  }

  // ─── ADD TO CART ─────────────────────────────────────
  async addToCart(userId: string, dto: AddToCartDto) {
    // Step 1: Get or create cart
    const cart =
      await this.cartRepository.getOrCreateCart(userId);

    // Step 2: Find product
    const product =
      await this.productsRepository.findById(dto.productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Step 3: Check product is active
    if (product.status !== 'active') {
      throw new BadRequestException(
        'Product is not available',
      );
    }

    // Step 4: Determine price
    let price = product.salePrice || product.price;

    // Step 5: Handle variant
    if (dto.variantId) {
      const variant = product.variants?.find(
        (v) => v.id === dto.variantId,
      );

      if (!variant) {
        throw new NotFoundException(
          'Product variant not found',
        );
      }

      if (!variant.isActive) {
        throw new BadRequestException(
          'This variant is not available',
        );
      }

      // Check variant stock
      if (variant.stock < dto.quantity) {
        throw new BadRequestException(
          `Only ${variant.stock} items available for this variant`,
        );
      }

      // Add variant price modifier
      price += variant.priceModifier || 0;
    } else {
      // Check product stock
      if (product.stock < dto.quantity) {
        throw new BadRequestException(
          `Only ${product.stock} items available in stock`,
        );
      }
    }

    // Step 6: Check if item already in cart
    const existingItem =
      await this.cartRepository.findCartItem(
        cart.id,
        dto.productId,
        dto.variantId,
      );

    if (existingItem) {
      // Update quantity if already in cart
      const newQuantity =
        existingItem.quantity + dto.quantity;

      // Check total quantity vs stock
      const stockToCheck = dto.variantId
        ? product.variants?.find(
            (v) => v.id === dto.variantId,
          )?.stock || 0
        : product.stock;

      if (newQuantity > stockToCheck) {
        throw new BadRequestException(
          `Cannot add more. Only ${stockToCheck} items available`,
        );
      }

      await this.cartRepository.updateItemQuantity(
        existingItem,
        newQuantity,
      );
    } else {
      // Add new item to cart
      await this.cartRepository.addItem(
        cart.id,
        dto.productId,
        dto.quantity,
        price,
        dto.variantId,
      );
    }

    // Return updated cart
    return this.getCart(userId);
  }

  // ─── UPDATE CART ITEM ─────────────────────────────────
  async updateCartItem(
    userId: string,
    itemId: string,
    dto: UpdateCartItemDto,
  ) {
    // Get user cart
    const cart =
      await this.cartRepository.findCartByUserId(userId);

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Find the item
    const item =
      await this.cartRepository.findCartItemById(
        itemId,
        cart.id,
      );

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    // Check stock
    if (item.product.stock < dto.quantity) {
      throw new BadRequestException(
        `Only ${item.product.stock} items available`,
      );
    }

    // Update quantity
    await this.cartRepository.updateItemQuantity(
      item,
      dto.quantity,
    );

    return this.getCart(userId);
  }

  // ─── REMOVE CART ITEM ─────────────────────────────────
  async removeCartItem(userId: string, itemId: string) {
    const cart =
      await this.cartRepository.findCartByUserId(userId);

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item =
      await this.cartRepository.findCartItemById(
        itemId,
        cart.id,
      );

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartRepository.removeItem(item);

    return this.getCart(userId);
  }

  // ─── CLEAR CART ──────────────────────────────────────
  async clearCart(userId: string) {
    const cart =
      await this.cartRepository.findCartByUserId(userId);

    if (!cart) {
      return { message: 'Cart is already empty' };
    }

    await this.cartRepository.clearCart(cart.id);

    return { message: 'Cart cleared successfully' };
  }

  // ─── GET ITEM COUNT ───────────────────────────────────
  async getItemCount(userId: string) {
    const count =
      await this.cartRepository.countItems(userId);

    return {
      message: 'Cart count fetched',
      data: { count },
    };
  }

  // ─── CALCULATE TOTALS ─────────────────────────────────
  private calculateTotals(items: any[]) {

    // Subtotal = sum of (price × quantity)
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Tax = 18% GST
    const taxRate  = 0.18;
    const tax      = subtotal * taxRate;

    // Shipping = free above ₹500, else ₹99
    const shipping = subtotal > 500 ? 0 : 99;

    // Total = subtotal + tax + shipping
    const total = subtotal + tax + shipping;

    // Item count = sum of quantities
    const itemCount = items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    return {
      subtotal:  parseFloat(subtotal.toFixed(2)),
      tax:       parseFloat(tax.toFixed(2)),
      shipping:  parseFloat(shipping.toFixed(2)),
      total:     parseFloat(total.toFixed(2)),
      itemCount,
    };
  }
}