import {
  Table, Column, Model, DataType,
  BelongsTo, ForeignKey,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

@Table({
  tableName: 'wishlists',
  timestamps: true,
})
export class Wishlist extends Model {

  
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;


  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  productId!: string;

  @BelongsTo(() => Product)
  product!: Product;
}