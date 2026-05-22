import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsString, IsOptional, IsBoolean,
  IsNotEmpty, MaxLength,
} from 'class-validator';

// ─── CREATE ADDRESS DTO ───────────────────────────────
export class CreateAddressDto {

  @ApiProperty({
    example: 'Home',
    description: 'Home, Office, Other',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  label!: string;

  @ApiProperty({ example: 'Shraddha Konde' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  fullName!: string;

  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone!: string;

  @ApiProperty({ example: '123 MG Road' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  addressLine1!: string;

  @ApiPropertyOptional({ example: 'Near City Mall' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  addressLine2?: string;

  @ApiProperty({ example: 'Mumbai' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city!: string;

  @ApiProperty({ example: 'Maharashtra' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  state!: string;

  @ApiProperty({ example: '400001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  postalCode!: string;

  @ApiProperty({ example: 'India' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  country!: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Set as default address',
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

// ─── UPDATE ADDRESS DTO ───────────────────────────────
export class UpdateAddressDto {

  @ApiPropertyOptional({ example: 'Office' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  label?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(150)
  fullName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(500)
  addressLine1?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(500)
  addressLine2?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(20)
  postalCode?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}