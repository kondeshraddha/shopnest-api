import {
  Table, Column, Model, DataType,
  BelongsTo, ForeignKey, Default,
} from 'sequelize-typescript';
import { Cart } from './cart.entity';
import { Product } from '../../products/entities/product.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';

@Table({
  tableName: 'cart_items',
  timestamps: true,
})
export class CartItem extends Model {

  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  // ─── BELONGS TO CART ──────────────────────────────────
  @ForeignKey(() => Cart)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  cartId!: string;

  @BelongsTo(() => Cart)
  cart!: Cart;

  // ─── WHICH PRODUCT ───────────────────────────────────
  @ForeignKey(() => Product)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  productId!: string;

  @BelongsTo(() => Product)
  product!: Product;

  // ─── WHICH VARIANT (optional) ────────────────────────
  @ForeignKey(() => ProductVariant)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  variantId!: string;

  @BelongsTo(() => ProductVariant)
  variant!: ProductVariant;

  // ─── QUANTITY ────────────────────────────────────────
  @Default(1)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  quantity!: number;

  // ─── PRICE AT TIME OF ADDING ─────────────────────────
  // Stored separately because product price may change
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  price!: number;
}