import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from './entities/category.entity';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/category.dto';

@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectModel(Category)
    private categoryModel: typeof Category,
  ) {}

  // ─── FIND ALL (tree structure) ────────────────────────
  async findAll(includeInactive = false) {
    const where: any = { parentId: null };

    if (!includeInactive) {
      where.isActive = true;
    }

    return this.categoryModel.findAll({
      where,
      include: [
        {
          model: Category,
          as: 'children',
          where: includeInactive
            ? {}
            : { isActive: true },
          required: false,
          include: [
            {
              model: Category,
              as: 'children',
              where: includeInactive
                ? {}
                : { isActive: true },
              required: false,
            },
          ],
        },
      ],
      order: [
        ['sortOrder', 'ASC'],
        ['name', 'ASC'],
      ],
    });
  }

  // ─── FIND BY ID ──────────────────────────────────────
  async findById(id: string) {
    return this.categoryModel.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'children',
          required: false,
        },
        {
          model: Category,
          as: 'parent',
          required: false,
        },
      ],
    });
  }

  // ─── FIND BY SLUG ────────────────────────────────────
  async findBySlug(slug: string) {
    return this.categoryModel.findOne({
      where: { slug, isActive: true },
      include: [
        {
          model: Category,
          as: 'children',
          where: { isActive: true },
          required: false,
        },
        {
          model: Category,
          as: 'parent',
          required: false,
        },
      ],
    });
  }

  // ─── FIND BY NAME ────────────────────────────────────
  async findByName(name: string) {
    return this.categoryModel.findOne({
      where: { name },
    });
  }

  // ─── CREATE ──────────────────────────────────────────
  async create(dto: CreateCategoryDto) {
    return this.categoryModel.create(dto as any);
  }

  // ─── UPDATE ──────────────────────────────────────────
  async update(
    category: Category,
    dto: UpdateCategoryDto,
  ) {
    return category.update(dto);
  }

  // ─── DELETE ──────────────────────────────────────────
  async delete(category: Category) {
    await category.destroy();
  }

  // ─── COUNT CHILDREN ──────────────────────────────────
  async countChildren(parentId: string) {
    return this.categoryModel.count({
      where: { parentId },
    });
  }
}