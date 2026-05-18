import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CategoriesRepository } from '../categories/categories.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { paginate } from '../../common/utils/pagination.util';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly categoriesRepository: CategoriesRepository,
  ) {}

  // ─── GET ALL PRODUCTS ─────────────────────────────────
  async findAll(filter: ProductFilterDto) {
    const { count, rows } =
      await this.productsRepository.findAll(filter);

    return paginate(
      rows,
      count,
      filter.page ?? 1,
      filter.limit ?? 10,
    );
  }

  // ─── GET FEATURED ─────────────────────────────────────
  async findFeatured(limit: number) {
    const products =
      await this.productsRepository.findFeatured(limit);

    return {
      message: 'Featured products fetched',
      data: products,
    };
  }

  // ─── GET BY ID ────────────────────────────────────────
  async findById(id: string) {
    const product =
      await this.productsRepository.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      message: 'Product fetched successfully',
      data: product,
    };
  }

  // ─── GET BY SLUG ──────────────────────────────────────
  async findBySlug(slug: string) {
    const product =
      await this.productsRepository.findBySlug(slug);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      message: 'Product fetched successfully',
      data: product,
    };
  }

  // ─── CREATE PRODUCT ───────────────────────────────────
  async create(dto: CreateProductDto) {
    // Validate category exists
    const category =
      await this.categoriesRepository.findById(
        dto.categoryId,
      );

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Validate sale price
    if (
      dto.salePrice &&
      dto.salePrice >= dto.price
    ) {
      throw new BadRequestException(
        'Sale price must be less than regular price',
      );
    }

    const product =
      await this.productsRepository.create(dto);

    return {
      message: 'Product created successfully',
      data: product,
    };
  }

  // ─── UPDATE PRODUCT ───────────────────────────────────
  async update(id: string, dto: UpdateProductDto) {
    const product =
      await this.productsRepository.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Validate category if changing
    if (dto.categoryId) {
      const category =
        await this.categoriesRepository.findById(
          dto.categoryId,
        );
      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    // Validate sale price
    const newPrice = dto.price ?? product.price;
    const newSalePrice = dto.salePrice ?? product.salePrice;

    if (newSalePrice && newSalePrice >= newPrice) {
      throw new BadRequestException(
        'Sale price must be less than regular price',
      );
    }

    const updated =
      await this.productsRepository.update(product, dto);

    return {
      message: 'Product updated successfully',
      data: updated,
    };
  }

  // ─── DELETE PRODUCT ───────────────────────────────────
  async remove(id: string) {
    const product =
      await this.productsRepository.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productsRepository.delete(product);

    return { message: 'Product deleted successfully' };
  }

  // ─── GET STATS ────────────────────────────────────────
  async getStats() {
    const stats =
      await this.productsRepository.getStats();

    return {
      message: 'Product statistics',
      data: stats,
    };
  }
}