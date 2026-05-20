import {
  Table, Column, Model, DataType,
  BelongsTo, ForeignKey,
} from 'sequelize-typescript';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

@Table({
  tableName: 'order_items',
  timestamps: true,
})
export class OrderItem extends Model {

  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  // ─── BELONGS TO ORDER ─────────────────────────────────
  @ForeignKey(() => Order)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  orderId!: string;

  @BelongsTo(() => Order)
  order!: Order;

  // ─── PRODUCT SNAPSHOT ────────────────────────────────
  @ForeignKey(() => Product)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  productId!: string;

  @BelongsTo(() => Product)
  product!: Product;

  // Store product name at time of order
  // Product name may change later
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  productName!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  productSku!: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
  })
  variantInfo!: string;

  // ─── PRICING ─────────────────────────────────────────
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  quantity!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  unitPrice!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  totalPrice!: number;
}