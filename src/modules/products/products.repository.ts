import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Category } from '../categories/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { ProductStatus } from '../../common/constants';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectModel(Product)
    private productModel: typeof Product,

    @InjectModel(ProductImage)
    private imageModel: typeof ProductImage,

    @InjectModel(ProductVariant)
    private variantModel: typeof ProductVariant,
  ) {}

  // ─── FIND ALL WITH FILTERS ────────────────────────────
  async findAll(filter: ProductFilterDto) {
    const {
      limit, search, sortBy,
      sortDir, categoryId,
    } = filter;

    const offset = filter.offset;
    const where: any = {};

    // Status filter
    if (!filter.includeInactive) {
      where.status = ProductStatus.ACTIVE;
    }

    // Category filter
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Featured filter
    if (filter.isFeatured !== undefined) {
      where.isFeatured = filter.isFeatured;
    }

    // Price range filter
    if (filter.minPrice || filter.maxPrice) {
      where.price = {};
      if (filter.minPrice) {
        where.price[Op.gte] = filter.minPrice;
      }
      if (filter.maxPrice) {
        where.price[Op.lte] = filter.maxPrice;
      }
    }

    // In stock filter
    if (filter.inStock) {
      where.stock = { [Op.gt]: 0 };
    }

    // Search filter
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } },
      ];
    }

    return this.productModel.findAndCountAll({
      where,
      include: [
        {
          model: ProductImage,
          as: 'images',
          where: { isPrimary: true },
          required: false,
        },
        {
          model: Category,
          as: 'category',
          required: false,
        },
      ],
      limit,
      offset,
      order: [[sortBy || 'createdAt', sortDir || 'DESC']],
      distinct: true,
    });
  }

  // ─── FIND ONE WITH ALL DETAILS ────────────────────────
  async findById(id: string) {
    return this.productModel.findByPk(id, {
      include: [
        {
          model: ProductImage,
          as: 'images',
          order: [['sortOrder', 'ASC']],
        },
        {
          model: ProductVariant,
          as: 'variants',
          where: { isActive: true },
          required: false,
        },
        {
          model: Category,
          as: 'category',
        },
      ],
    });
  }

  // ─── FIND BY SLUG ────────────────────────────────────
  async findBySlug(slug: string) {
    return this.productModel.findOne({
      where: { slug },
      include: [
        {
          model: ProductImage,
          as: 'images',
          order: [['sortOrder', 'ASC']],
        },
        {
          model: ProductVariant,
          as: 'variants',
          where: { isActive: true },
          required: false,
        },
        {
          model: Category,
          as: 'category',
        },
      ],
    });
  }

  // ─── FIND FEATURED ───────────────────────────────────
  async findFeatured(limit = 8) {
    return this.productModel.findAll({
      where: {
        isFeatured: true,
        status: ProductStatus.ACTIVE,
      },
      include: [
        {
          model: ProductImage,
          as: 'images',
          where: { isPrimary: true },
          required: false,
        },
        {
          model: Category,
          as: 'category',
        },
      ],
      limit,
      order: [['createdAt', 'DESC']],
    });
  }

  // ─── CREATE ──────────────────────────────────────────
  async create(dto: CreateProductDto) {
    const { images, variants, ...productData } = dto;

    // Create product
    const product = await this.productModel.create(
      productData as any,
    );

    // Create images if provided
    if (images && images.length > 0) {
      await this.imageModel.bulkCreate(
        images.map((img, index) => ({
          ...img,
          productId: product.id,
          sortOrder: index,
        })),
      );
    }

    // Create variants if provided
    if (variants && variants.length > 0) {
      await this.variantModel.bulkCreate(
        variants.map((v) => ({
          ...v,
          productId: product.id,
        })),
      );
    }

    return this.findById(product.id);
  }

  // ─── UPDATE ──────────────────────────────────────────
  async update(product: Product, dto: UpdateProductDto) {
    const { images, variants, ...productData } = dto;

    await product.update(productData);

    // Replace images if provided
    if (images) {
      await this.imageModel.destroy({
        where: { productId: product.id },
      });
      await this.imageModel.bulkCreate(
        images.map((img, index) => ({
          ...img,
          productId: product.id,
          sortOrder: index,
        })),
      );
    }

    // Replace variants if provided
    if (variants) {
      await this.variantModel.destroy({
        where: { productId: product.id },
      });
      await this.variantModel.bulkCreate(
        variants.map((v) => ({
          ...v,
          productId: product.id,
        })),
      );
    }

    return this.findById(product.id);
  }

  // ─── DELETE ──────────────────────────────────────────
  async delete(product: Product) {
    await product.destroy();
  }

  // ─── GET STATS ───────────────────────────────────────
  async getStats() {
    const [total, active, inactive, outOfStock, featured] =
      await Promise.all([
        this.productModel.count(),
        this.productModel.count({
          where: { status: ProductStatus.ACTIVE },
        }),
        this.productModel.count({
          where: { status: ProductStatus.INACTIVE },
        }),
        this.productModel.count({
          where: { status: ProductStatus.OUT_OF_STOCK },
        }),
        this.productModel.count({
          where: { isFeatured: true },
        }),
      ]);

    return { total, active, inactive, outOfStock, featured };
  }

  // ─── UPDATE STOCK ─────────────────────────────────────
  async updateStock(product: Product, quantity: number) {
    return product.update({ stock: quantity });
  }
}