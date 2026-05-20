import {
  Table, Column, Model, DataType,
  BelongsTo, ForeignKey, HasMany,
  HasOne, Default, BeforeCreate,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus, PaymentMethod } from '../../../common/constants';

@Table({
  tableName: 'orders',
  paranoid:  true,
  timestamps: true,
})
export class Order extends Model {

  // ─── PRIMARY KEY ─────────────────────────────────────
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  // ─── ORDER NUMBER ────────────────────────────────────
  @Column({
    type: DataType.STRING(30),
    unique: true,
  })
  orderNumber!: string;

  // ─── USER ────────────────────────────────────────────
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  // ─── STATUS ──────────────────────────────────────────
  @Default(OrderStatus.PENDING)
  @Column({
    type: DataType.ENUM(...Object.values(OrderStatus)),
  })
  status!: OrderStatus;

  // ─── PRICING ─────────────────────────────────────────
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  subtotal!: number;

  @Default(0)
  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  tax!: number;

  @Default(0)
  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  shippingCost!: number;

  @Default(0)
  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  discount!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  totalAmount!: number;

  // ─── PAYMENT ─────────────────────────────────────────
  @Default(PaymentMethod.COD)
  @Column({
    type: DataType.ENUM(...Object.values(PaymentMethod)),
  })
  paymentMethod!: PaymentMethod;

  // ─── TRACKING ────────────────────────────────────────
  @Column({
    type: DataType.STRING(200),
    allowNull: true,
  })
  trackingNumber!: string;

  // ─── NOTES ───────────────────────────────────────────
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  cancellationReason!: string;

  // ─── SHIPPING ADDRESS SNAPSHOT ───────────────────────
  // Store address at time of order
  // Even if user changes address later
  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  shippingAddress!: {
    fullName:     string;
    phone:        string;
    addressLine1: string;
    addressLine2?: string;
    city:         string;
    state:        string;
    postalCode:   string;
    country:      string;
  };

  // ─── RELATIONS ───────────────────────────────────────
  @HasMany(() => OrderItem)
  items!: OrderItem[];

  // ─── AUTO ORDER NUMBER ───────────────────────────────
  @BeforeCreate
  static generateOrderNumber(instance: Order) {
    const timestamp = Date.now()
      .toString(36)
      .toUpperCase();
    const random = Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase();
    instance.orderNumber = `ORD-${timestamp}-${random}`;
  }
}