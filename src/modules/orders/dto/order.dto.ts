import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum, IsString, IsOptional,
  IsObject, ValidateNested, IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod, OrderStatus } from '../../../common/constants';

// ─── SHIPPING ADDRESS DTO ─────────────────────────────
export class ShippingAddressDto {

  @ApiProperty({ example: 'Shraddha Konde' })
  @IsString() @IsNotEmpty()
  fullName!: string;

  @ApiProperty({ example: '+919876543210' })
  @IsString() @IsNotEmpty()
  phone!: string;

  @ApiProperty({ example: '123 MG Road' })
  @IsString() @IsNotEmpty()
  addressLine1!: string;

  @ApiPropertyOptional({ example: 'Near City Mall' })
  @IsString() @IsOptional()
  addressLine2?: string;

  @ApiProperty({ example: 'Mumbai' })
  @IsString() @IsNotEmpty()
  city!: string;

  @ApiProperty({ example: 'Maharashtra' })
  @IsString() @IsNotEmpty()
  state!: string;

  @ApiProperty({ example: '400001' })
  @IsString() @IsNotEmpty()
  postalCode!: string;

  @ApiProperty({ example: 'India' })
  @IsString() @IsNotEmpty()
  country!: string;
}

// ─── CREATE ORDER DTO ─────────────────────────────────
export class CreateOrderDto {

  @ApiProperty({ type: ShippingAddressDto })
  @IsObject()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress!: ShippingAddressDto;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod = PaymentMethod.COD;

  @ApiPropertyOptional({
    example: 'Please deliver before 6 PM',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

// ─── CANCEL ORDER DTO ─────────────────────────────────
export class CancelOrderDto {

  @ApiProperty({
    example: 'Changed my mind',
  })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

// ─── UPDATE ORDER STATUS DTO (Admin) ──────────────────
export class UpdateOrderStatusDto {

  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status!: OrderStatus;

  @ApiPropertyOptional({
    example: 'TRK123456789',
  })
  @IsString()
  @IsOptional()
  trackingNumber?: string;
}