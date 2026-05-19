import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { ProductImage } from '../products/entities/product-image.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';

@Injectable()
export class CartRepository {
  constructor(
    @InjectModel(Cart)
    private cartModel: typeof Cart,

    @InjectModel(CartItem)
    private cartItemModel: typeof CartItem,
  ) {}

  // ─── GET CART WITH ALL ITEMS ──────────────────────────
  async findCartByUserId(userId: string) {
    return this.cartModel.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          as: 'items',
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
              ],
            },
            {
              model: ProductVariant,
              as: 'variant',
              required: false,
            },
          ],
        },
      ],
    });
  }

  // ─── CREATE EMPTY CART ────────────────────────────────
  async createCart(userId: string) {
    return this.cartModel.create({ userId } as any);
  }

  // ─── GET OR CREATE CART ───────────────────────────────
  async getOrCreateCart(userId: string) {
    let cart = await this.cartModel.findOne({
      where: { userId },
    });

    if (!cart) {
      cart = await this.createCart(userId);
    }

    return cart;
  }

  // ─── FIND CART ITEM ───────────────────────────────────
  async findCartItem(
    cartId: string,
    productId: string,
    variantId?: string,
  ) {
    const where: any = { cartId, productId };
    if (variantId) {
      where.variantId = variantId;
    } else {
      where.variantId = null;
    }

    return this.cartItemModel.findOne({ where });
  }

  // ─── FIND CART ITEM BY ID ─────────────────────────────
  async findCartItemById(id: string, cartId: string) {
    return this.cartItemModel.findOne({
      where: { id, cartId },
      include: [
        {
          model: Product,
          as: 'product',
        },
      ],
    });
  }

  // ─── ADD ITEM TO CART ─────────────────────────────────
  async addItem(
    cartId: string,
    productId: string,
    quantity: number,
    price: number,
    variantId?: string,
  ) {
    return this.cartItemModel.create({
      cartId,
      productId,
      variantId: variantId || null,
      quantity,
      price,
    } as any);
  }

  // ─── UPDATE ITEM QUANTITY ─────────────────────────────
  async updateItemQuantity(
    item: CartItem,
    quantity: number,
  ) {
    return item.update({ quantity });
  }

  // ─── REMOVE ITEM ─────────────────────────────────────
  async removeItem(item: CartItem) {
    await item.destroy();
  }

  // ─── CLEAR CART ──────────────────────────────────────
  async clearCart(cartId: string) {
    await this.cartItemModel.destroy({
      where: { cartId },
    });
  }

  // ─── COUNT ITEMS ─────────────────────────────────────
  async countItems(userId: string) {
    const cart = await this.cartModel.findOne({
      where: { userId },
    });

    if (!cart) return 0;

    const result = await this.cartItemModel.sum(
      'quantity',
      { where: { cartId: cart.id } },
    );

    return result || 0;
  }
}