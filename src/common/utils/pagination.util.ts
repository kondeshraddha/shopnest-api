import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SortDirection, PAGINATION } from '../constants';

// ─── Pagination DTO ───────────────────────────────────────────
export class PaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = PAGINATION.DEFAULT_PAGE;

  @ApiPropertyOptional({ default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(PAGINATION.MAX_LIMIT)
  @IsOptional()
  limit?: number = PAGINATION.DEFAULT_LIMIT;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: SortDirection })
  @IsEnum(SortDirection)
  @IsOptional()
  sortDir?: SortDirection = SortDirection.DESC;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  // Calculate how many records to skip
  get offset(): number {
    return ((this.page ?? 1) - 1) * (this.limit ?? PAGINATION.DEFAULT_LIMIT);
  }
}

// ─── Paginated Result Interface ───────────────────────────────
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total:      number;
    page:       number;
    limit:      number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// ─── Paginate Helper Function ─────────────────────────────────
export function paginate<T>(
  data:  T[],
  total: number,
  page:  number,
  limit: number,
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}