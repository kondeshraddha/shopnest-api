import {
  Table, Column, Model, DataType,
  BelongsTo, ForeignKey, HasMany,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { CartItem } from './cart-item.entity';

@Table({
  tableName: 'carts',
  timestamps: true,
})
export class Cart extends Model {

  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  // ─── ONE USER → ONE CART ──────────────────────────────
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
  })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  // ─── CART HAS MANY ITEMS ──────────────────────────────
  @HasMany(() => CartItem)
  items!: CartItem[];
}