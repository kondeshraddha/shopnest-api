import {
  Table, Column, Model, DataType,
  BelongsTo, ForeignKey, Default,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

@Table({
  tableName: 'reviews',
  paranoid:  true,
  timestamps: true,
})
export class Review extends Model {

  // ─── PRIMARY KEY ─────────────────────────────────────
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  // ─── USER ────────────────────────────────────────────
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  // ─── PRODUCT ─────────────────────────────────────────
  @ForeignKey(() => Product)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  productId!: string;

  @BelongsTo(() => Product)
  product!: Product;

  // ─── RATING ──────────────────────────────────────────
  // 1 to 5 stars
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  rating!: number;

  // ─── REVIEW CONTENT ──────────────────────────────────
  @Column({
    type: DataType.STRING(200),
    allowNull: true,
  })
  title!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  body!: string;

  // ─── IMAGES ──────────────────────────────────────────
  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  images!: string[];

  // ─── VERIFIED PURCHASE ───────────────────────────────
  // True if user actually bought this product
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  isVerifiedPurchase!: boolean;

  // ─── APPROVAL ────────────────────────────────────────
  // Admin must approve before shown publicly
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  isApproved!: boolean;
}