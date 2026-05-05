import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from './user.entity';

@Table({
  tableName: 'user_profiles',
  paranoid: true,
  timestamps: true,
})
export class UserProfile extends Model {

  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  // ─── FOREIGN KEY → users table ───────────────────────
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  @BelongsTo(() => User)
  user: User;

  // ─── PROFILE FIELDS ──────────────────────────────────
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  bio: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  dateOfBirth: Date;

  @Column({
    type: DataType.STRING(10),
    allowNull: true,
  })
  gender: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  website: string;
}