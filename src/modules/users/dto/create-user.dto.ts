import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
  IsEnum,
} from 'class-validator';
import { UserRole } from '../../../common/constants';

export class CreateUserDto {

  // ─── FIRST NAME ──────────────────────────────────────
  @ApiProperty({ example: 'Shraddha' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  // ─── LAST NAME ───────────────────────────────────────
  @ApiProperty({ example: 'Konde' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  // ─── EMAIL ───────────────────────────────────────────
  @ApiProperty({ example: 'shraddha@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  // ─── PASSWORD ────────────────────────────────────────
  @ApiProperty({
    example: 'Shraddha@123',
    description: 'Min 8 chars, uppercase, lowercase, number, special char'
  })
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
    {
      message:
        'Password must have uppercase, lowercase, number and special character',
    },
  )
  password: string;

  // ─── PHONE ───────────────────────────────────────────
  @ApiPropertyOptional({ example: '+919876543210' })
  @IsString()
  @IsOptional()
  phone?: string;
}