import {
  Table, Column, Model, DataType,
  BelongsTo, ForeignKey, Default,
} from 'sequelize-typescript';
import { Product } from './product.entity';

@Table({
  tableName: 'product_variants',
  timestamps: true,
})
export class ProductVariant extends Model {

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

  // ─── VARIANT INFO ─────────────────────────────────────
  // e.g. name: "Size", value: "XL"
  // e.g. name: "Color", value: "Red"
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  value!: string;

  // ─── PRICING ─────────────────────────────────────────
  // Added to base price
  // e.g. XL size costs 50 more
  @Default(0)
  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  priceModifier!: number;

  // ─── INVENTORY ───────────────────────────────────────
  @Default(0)
  @Column({
    type: DataType.INTEGER,
  })
  stock!: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  sku!: string;

  // ─── STATUS ──────────────────────────────────────────
  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
  })
  isActive!: boolean;
}