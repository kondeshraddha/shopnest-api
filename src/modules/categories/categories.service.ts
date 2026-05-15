import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly categoriesRepository: CategoriesRepository,
  ) {}

  // ─── GET ALL CATEGORIES ───────────────────────────────
  async findAll(includeInactive = false) {
    const categories =
      await this.categoriesRepository.findAll(
        includeInactive,
      );

    return {
      message: 'Categories fetched successfully',
      data: categories,
    };
  }

  // ─── GET SINGLE CATEGORY ──────────────────────────────
  async findById(id: string) {
    const category =
      await this.categoriesRepository.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return {
      message: 'Category fetched successfully',
      data: category,
    };
  }

  // ─── GET BY SLUG ──────────────────────────────────────
  async findBySlug(slug: string) {
    const category =
      await this.categoriesRepository.findBySlug(slug);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return {
      message: 'Category fetched successfully',
      data: category,
    };
  }

  // ─── CREATE CATEGORY ──────────────────────────────────
  async create(dto: CreateCategoryDto) {
    // Check name not already used
    const existing =
      await this.categoriesRepository.findByName(dto.name);

    if (existing) {
      throw new ConflictException(
        'Category with this name already exists',
      );
    }

    // Check parentId exists if provided
    if (dto.parentId) {
      const parent =
        await this.categoriesRepository.findById(
          dto.parentId,
        );

      if (!parent) {
        throw new NotFoundException(
          'Parent category not found',
        );
      }
    }

    const category =
      await this.categoriesRepository.create(dto);

    return {
      message: 'Category created successfully',
      data: category,
    };
  }

  // ─── UPDATE CATEGORY ──────────────────────────────────
  async update(id: string, dto: UpdateCategoryDto) {
    const category =
      await this.categoriesRepository.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check new name not taken by another category
    if (dto.name && dto.name !== category.name) {
      const existing =
        await this.categoriesRepository.findByName(
          dto.name,
        );

      if (existing) {
        throw new ConflictException(
          'Category with this name already exists',
        );
      }
    }

    // Prevent category being its own parent
    if (dto.parentId && dto.parentId === id) {
      throw new BadRequestException(
        'Category cannot be its own parent',
      );
    }

    const updated =
      await this.categoriesRepository.update(
        category,
        dto,
      );

    return {
      message: 'Category updated successfully',
      data: updated,
    };
  }

  // ─── DELETE CATEGORY ──────────────────────────────────
  async remove(id: string) {
    const category =
      await this.categoriesRepository.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check if category has children
    const childCount =
      await this.categoriesRepository.countChildren(id);

    if (childCount > 0) {
      throw new BadRequestException(
        `Cannot delete category. It has ${childCount} subcategories. Delete them first.`,
      );
    }

    await this.categoriesRepository.delete(category);

    return {
      message: 'Category deleted successfully',
    };
  }
}