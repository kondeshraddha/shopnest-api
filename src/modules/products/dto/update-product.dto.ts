import {
  IsString, IsNumber, IsOptional, IsBoolean,
  IsUUID, IsEnum, IsArray, ValidateNested,
  Min, MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '../../../common/constants';
import { ProductImageDto, ProductVariantDto } from './create-product.dto';

export class UpdateProductDto {

  @ApiPropertyOptional()
  @IsString() @IsOptional() @MaxLength(255)
  name?: string;

  @ApiPropertyOptional()
  @IsString() @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString() @IsOptional()
  shortDescription?: string;

  @ApiPropertyOptional()
  @IsNumber() @Min(0) @IsOptional()
  price?: number;

  @ApiPropertyOptional()
  @IsNumber() @Min(0) @IsOptional()
  salePrice?: number;

  @ApiPropertyOptional()
  @IsString() @IsOptional()
  sku?: string;

  @ApiPropertyOptional()
  @IsNumber() @Min(0) @IsOptional()
  stock?: number;

  @ApiPropertyOptional({ enum: ProductStatus })
  @IsEnum(ProductStatus) @IsOptional()
  status?: ProductStatus;

  @ApiPropertyOptional()
  @IsBoolean() @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsUUID() @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsNumber() @IsOptional()
  weight?: number;

  @ApiPropertyOptional()
  @IsArray() @IsOptional()
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  attributes?: Record<string, string>;

  @ApiPropertyOptional({ type: [ProductImageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  @IsOptional()
  images?: ProductImageDto[];

  @ApiPropertyOptional({ type: [ProductVariantDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  @IsOptional()
  variants?: ProductVariantDto[];
}