import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional, IsUUID, IsNumber,
  IsBoolean, IsEnum, Min, Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { SortDirection, PAGINATION } from '../../../common/constants';

export class ProductFilterDto {

  // ─── PAGINATION ──────────────────────────────────────
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsNumber() @Min(1) @IsOptional()
  page?: number = PAGINATION.DEFAULT_PAGE;

  @ApiPropertyOptional({ default: 10 })
  @Type(() => Number)
  @IsNumber() @Min(1) @Max(100) @IsOptional()
  limit?: number = PAGINATION.DEFAULT_LIMIT;

  // ─── SEARCH ──────────────────────────────────────────
  @ApiPropertyOptional({ example: 'nike' })
  @IsOptional()
  search?: string;

  // ─── FILTERS ─────────────────────────────────────────
  @ApiPropertyOptional()
  @IsUUID() @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ example: 100 })
  @Type(() => Number)
  @IsNumber() @IsOptional()
  minPrice?: number;

  @ApiPropertyOptional({ example: 5000 })
  @Type(() => Number)
  @IsNumber() @IsOptional()
  maxPrice?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean() @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean() @IsOptional()
  inStock?: boolean;

  @ApiPropertyOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean() @IsOptional()
  includeInactive?: boolean;

  // ─── SORTING ─────────────────────────────────────────
  @ApiPropertyOptional({ enum: SortDirection })
  @IsEnum(SortDirection) @IsOptional()
  sortDir?: SortDirection = SortDirection.DESC;

  @ApiPropertyOptional({
    example: 'price',
    description: 'price, name, createdAt, soldCount',
  })
  @IsOptional()
  sortBy?: string = 'createdAt';

  // ─── OFFSET CALCULATOR ───────────────────────────────
  get offset(): number {
    return (
      ((this.page ?? 1) - 1) *
      (this.limit ?? PAGINATION.DEFAULT_LIMIT)
    );
  }
}