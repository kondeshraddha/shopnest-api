import {
  Table, Column, Model, DataType,
  BelongsTo, ForeignKey, Default,
} from 'sequelize-typescript';
import { Order } from '../../orders/entities/order.entity';
import {
  PaymentStatus,
  PaymentMethod,
} from '../../../common/constants';

@Table({
  tableName: 'payments',
  timestamps: true,
})
export class Payment extends Model {

  // ─── PRIMARY KEY ─────────────────────────────────────
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  // ─── ORDER ───────────────────────────────────────────
  @ForeignKey(() => Order)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  orderId!: string;

  @BelongsTo(() => Order)
  order!: Order;

  // ─── PAYMENT INFO ─────────────────────────────────────
  @Default(PaymentStatus.PENDING)
  @Column({
    type: DataType.ENUM(...Object.values(PaymentStatus)),
  })
  status!: PaymentStatus;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentMethod)),
  })
  method!: PaymentMethod;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  amount!: number;

  @Column({
    type: DataType.STRING(10),
    defaultValue: 'inr',
  })
  currency!: string;

  // ─── STRIPE FIELDS ────────────────────────────────────
  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  stripePaymentIntentId!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  stripeChargeId!: string;

  // ─── TIMESTAMPS ──────────────────────────────────────
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  paidAt!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  refundedAt!: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  failureReason!: string;

  // ─── METADATA ────────────────────────────────────────
  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  metadata!: Record<string, any>;
}