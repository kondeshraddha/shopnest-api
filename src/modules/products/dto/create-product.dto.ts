import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsNumber, IsOptional, IsBoolean,
  IsUUID, IsEnum, IsArray, ValidateNested,
  Min, MaxLength, IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '../../../common/constants';

// ─── IMAGE DTO ────────────────────────────────────────
export class ProductImageDto {

  @ApiProperty({ example: 'https://example.com/img.jpg' })
  @IsString()
  @IsNotEmpty()
  url!: string;

  @ApiPropertyOptional({ example: 'Nike Shirt Front' })
  @IsString()
  @IsOptional()
  altText?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}

// ─── VARIANT DTO ──────────────────────────────────────
export class ProductVariantDto {

  @ApiProperty({ example: 'Size' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'XL' })
  @IsString()
  @IsNotEmpty()
  value!: string;

  @ApiPropertyOptional({ example: 50 })
  @IsNumber()
  @IsOptional()
  priceModifier?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiPropertyOptional({ example: 'NIKE-SHIRT-XL' })
  @IsString()
  @IsOptional()
  sku?: string;
}

// ─── CREATE PRODUCT DTO ───────────────────────────────
export class CreateProductDto {

  @ApiProperty({ example: 'Nike Air Max 2024' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({
    example: 'The most comfortable running shoe',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 'Comfortable running shoe',
  })
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiProperty({ example: 5999.99 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ example: 4999.99 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  salePrice?: number;

  @ApiPropertyOptional({ example: 'NIKE-AM-2024' })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiPropertyOptional({ enum: ProductStatus })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiProperty({ example: 'category-uuid-here' })
  @IsUUID()
  @IsNotEmpty()
  categoryId!: string;

  @ApiPropertyOptional({ example: 500 })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({
    example: ['running', 'nike', 'shoes'],
  })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    example: { brand: 'Nike', material: 'Mesh' },
  })
  @IsOptional()
  attributes?: Record<string, string>;

  @ApiPropertyOptional({
    type: [ProductImageDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  @IsOptional()
  images?: ProductImageDto[];

  @ApiPropertyOptional({
    type: [ProductVariantDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  @IsOptional()
  variants?: ProductVariantDto[];
}