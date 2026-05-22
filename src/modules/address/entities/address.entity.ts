import {
  Table, Column, Model, DataType,
  BelongsTo, ForeignKey, Default,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';

@Table({
  tableName: 'addresses',
  paranoid:  true,
  timestamps: true,
})
export class Address extends Model {

  // ─── PRIMARY KEY ─────────────────────────────────────
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  // ─── BELONGS TO USER ──────────────────────────────────
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  // ─── LABEL ───────────────────────────────────────────
  // e.g. "Home", "Office", "Other"
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  label!: string;

  // ─── RECIPIENT INFO ───────────────────────────────────
  @Column({
    type: DataType.STRING(150),
    allowNull: false,
  })
  fullName!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
  })
  phone!: string;

  // ─── ADDRESS ─────────────────────────────────────────
  @Column({
    type: DataType.STRING(500),
    allowNull: false,
  })
  addressLine1!: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  addressLine2!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  city!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  state!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
  })
  postalCode!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  country!: string;

  // ─── DEFAULT ADDRESS ──────────────────────────────────
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  isDefault!: boolean;
}