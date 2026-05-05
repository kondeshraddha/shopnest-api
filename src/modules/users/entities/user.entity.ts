import {
  Table,
  Column,
  Model,
  DataType,
  BeforeCreate,
  BeforeUpdate,
  HasOne,
  HasMany,
  Default,
  Unique,
} from 'sequelize-typescript';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '../../../common/constants';

@Table({
  tableName: 'users',
  paranoid: true,    // soft delete
  timestamps: true,  // createdAt, updatedAt
})
export class User extends Model {

  // ─── PRIMARY KEY ─────────────────────────────────────
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  // ─── NAME ────────────────────────────────────────────
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  firstName: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  lastName: string;

  // ─── EMAIL ───────────────────────────────────────────
  @Unique
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  email: string;

  // ─── PASSWORD ────────────────────────────────────────
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  password: string;

  // ─── PHONE ───────────────────────────────────────────
  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  phone: string;

  // ─── ROLE ────────────────────────────────────────────
  @Default(UserRole.CUSTOMER)
  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
  })
  role: UserRole;

  // ─── STATUS ──────────────────────────────────────────
  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
  })
  isActive: boolean;

  // ─── EMAIL VERIFIED ───────────────────────────────────
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  isEmailVerified: boolean;

  // ─── AVATAR ──────────────────────────────────────────
  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  avatar: string;

  // ─── LAST LOGIN ──────────────────────────────────────
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastLoginAt: Date;

  // ─── HOOKS ───────────────────────────────────────────
  // Runs automatically before create
  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: User) {
    // Only hash if password was changed
    if (instance.changed('password')) {
      const salt = await bcrypt.genSalt(12);
      instance.password = await bcrypt.hash(
        instance.password,
        salt,
      );
    }
  }

  // ─── INSTANCE METHODS ─────────────────────────────────
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // ─── HIDE PASSWORD IN RESPONSE ────────────────────────
  toJSON() {
    const values = super.toJSON() as any;
    delete values.password;
    return values;
  }
}