import {
  Table, Column, Model, DataType,
  BelongsTo, ForeignKey, HasMany,
  Default, BeforeCreate, BeforeUpdate,
} from 'sequelize-typescript';
import { Category } from '../../categories/entities/category.entity';
import { ProductImage } from './product-image.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductStatus } from '../../../common/constants';

@Table({
  tableName: 'products',
  paranoid:  true,
  timestamps: true,
})
export class Product extends Model {

  // ─── PRIMARY KEY ─────────────────────────────────────
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  // ─── BASIC INFO ──────────────────────────────────────
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING(300),
    allowNull: true,
    unique: true,
  })
  slug!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description!: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  shortDescription!: string;

  // ─── PRICING ─────────────────────────────────────────
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  price!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  salePrice!: number;

  // ─── INVENTORY ───────────────────────────────────────
  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    unique: true,
  })
  sku!: string;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
  })
  stock!: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
  })
  soldCount!: number;

  // ─── STATUS ──────────────────────────────────────────
  @Default(ProductStatus.ACTIVE)
  @Column({
    type: DataType.ENUM(...Object.values(ProductStatus)),
  })
  status!: ProductStatus;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  isFeatured!: boolean;

  // ─── RATINGS ─────────────────────────────────────────
  @Default(0)
  @Column({
    type: DataType.DECIMAL(3, 2),
  })
  avgRating!: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
  })
  reviewCount!: number;

  // ─── PHYSICAL ────────────────────────────────────────
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  weight!: number;

  // ─── EXTRA INFO ──────────────────────────────────────
  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  tags!: string[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  attributes!: Record<string, string>;

  // ─── CATEGORY ────────────────────────────────────────
  @ForeignKey(() => Category)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  categoryId!: string;

  @BelongsTo(() => Category)
  category!: Category;

  // ─── RELATIONS ───────────────────────────────────────
  @HasMany(() => ProductImage)
  images!: ProductImage[];

  @HasMany(() => ProductVariant)
  variants!: ProductVariant[];

  // ─── AUTO SLUG ───────────────────────────────────────
  @BeforeCreate
  @BeforeUpdate
  static generateSlug(instance: Product) {
    if (instance.changed('name') || !instance.slug) {
      const baseSlug = instance.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      // Add random string to ensure uniqueness
      const random = Math.random()
        .toString(36)
        .substring(2, 6);
      instance.slug = `${baseSlug}-${random}`;
    }
  }

  // ─── COMPUTED ────────────────────────────────────────
  get isOnSale(): boolean {
    return (
      !!this.salePrice &&
      this.salePrice < this.price
    );
  }

  get discountPercentage(): number {
    if (!this.isOnSale) return 0;
    return Math.round(
      ((this.price - this.salePrice) / this.price) * 100,
    );
  }

  get effectivePrice(): number {
    return this.isOnSale ? this.salePrice : this.price;
  }
}