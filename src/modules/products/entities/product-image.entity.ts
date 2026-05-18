import {
  Table, Column, Model, DataType,
  BelongsTo, ForeignKey, Default,
} from 'sequelize-typescript';
import { Product } from './product.entity';

@Table({
  tableName: 'product_images',
  timestamps: true,
})
export class ProductImage extends Model {

  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  productId!: string;

  @BelongsTo(() => Product)
  product!: Product;

  // ─── IMAGE URL ───────────────────────────────────────
  @Column({
    type: DataType.STRING(500),
    allowNull: false,
  })
  url!: string;

  // ─── ALT TEXT ────────────────────────────────────────
  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  altText!: string;

  // ─── PRIMARY IMAGE ───────────────────────────────────
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  isPrimary!: boolean;

  // ─── SORT ORDER ──────────────────────────────────────
  @Default(0)
  @Column({
    type: DataType.INTEGER,
  })
  sortOrder!: number;
}