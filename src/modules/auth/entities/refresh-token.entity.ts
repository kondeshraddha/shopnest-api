import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
  Default,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';

@Table({
  tableName: 'refresh_tokens',
  timestamps: true,
})
export class RefreshToken extends Model {

  // ─── PRIMARY KEY ─────────────────────────────────────
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  // ─── FOREIGN KEY → users ──────────────────────────────
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  // ─── TOKEN STRING ────────────────────────────────────
  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  token!: string;

  // ─── DEVICE INFO ─────────────────────────────────────
  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  userAgent!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  ipAddress!: string;

  // ─── STATUS ──────────────────────────────────────────
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  isRevoked!: boolean;

  // ─── EXPIRY ──────────────────────────────────────────
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  expiresAt!: Date;
}