import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID, IsInt, IsOptional,
  IsNotEmpty, Min, Max,
} from 'class-validator';

// ─── ADD TO CART ──────────────────────────────────────
export class AddToCartDto {

  @ApiProperty({ description: 'Product UUID' })
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @ApiPropertyOptional({
    description: 'Product variant UUID (optional)',
  })
  @IsUUID()
  @IsOptional()
  variantId?: string;

  @ApiProperty({ example: 1, minimum: 1, maximum: 100 })
  @IsInt()
  @Min(1)
  @Max(100)
  quantity!: number;
}

// ─── UPDATE CART ITEM ─────────────────────────────────
export class UpdateCartItemDto {

  @ApiProperty({
    example: 2,
    minimum: 1,
    maximum: 100,
    description: 'New quantity',
  })
  @IsInt()
  @Min(1)
  @Max(100)
  quantity!: number;
}