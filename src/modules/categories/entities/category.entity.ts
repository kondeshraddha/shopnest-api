import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  BelongsTo,
  ForeignKey,
  Default,
  BeforeCreate,
  BeforeUpdate,
} from 'sequelize-typescript';

@Table({
  tableName: 'categories',
  paranoid:  true,
  timestamps: true,
})
export class Category extends Model {

  // ─── PRIMARY KEY ─────────────────────────────────────
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  // ─── NAME ────────────────────────────────────────────
  @Column({
    type: DataType.STRING(150),
    allowNull: false,
  })
  name!: string;

  // ─── SLUG ────────────────────────────────────────────
  @Column({
    type: DataType.STRING(200),
    allowNull: true,
    unique: true,
  })
  slug!: string;

  // ─── DESCRIPTION ─────────────────────────────────────
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description!: string;

  // ─── IMAGE ───────────────────────────────────────────
  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  image!: string;

  // ─── STATUS ──────────────────────────────────────────
  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
  })
  isActive!: boolean;

  // ─── SORT ORDER ──────────────────────────────────────
  @Default(0)
  @Column({
    type: DataType.INTEGER,
  })
  sortOrder!: number;

  // ─── PARENT ID (self referencing) ────────────────────
  @ForeignKey(() => Category)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  parentId!: string;

  // ─── RELATIONS ───────────────────────────────────────
  @BelongsTo(() => Category, 'parentId')
  parent!: Category;

  @HasMany(() => Category, 'parentId')
  children!: Category[];

  // ─── AUTO GENERATE SLUG ──────────────────────────────
  @BeforeCreate
  @BeforeUpdate
  static generateSlug(instance: Category) {
    if (instance.changed('name') || !instance.slug) {
      instance.slug = instance.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    }
  }
}