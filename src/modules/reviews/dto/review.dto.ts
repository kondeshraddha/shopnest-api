import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsString, IsInt, IsOptional,
  IsArray, IsUUID, Min, Max,
  MaxLength, IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

// ─── CREATE REVIEW DTO ────────────────────────────────
export class CreateReviewDto {

  @ApiProperty({ example: 'product-uuid-here' })
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({
    example: 5,
    minimum: 1,
    maximum: 5,
    description: 'Rating from 1 to 5 stars',
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({
    example: 'Amazing product!',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    example: 'Very comfortable and durable. Highly recommend!',
  })
  @IsString()
  @IsOptional()
  body?: string;

  @ApiPropertyOptional({
    example: [
      'https://example.com/review1.jpg',
    ],
    description: 'Review image URLs',
  })
  @IsArray()
  @IsOptional()
  images?: string[];
}

// ─── UPDATE REVIEW DTO ────────────────────────────────
export class UpdateReviewDto {

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  body?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  images?: string[];
}