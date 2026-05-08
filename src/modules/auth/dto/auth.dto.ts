import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';

// ─── REGISTER DTO ─────────────────────────────────────
export class RegisterDto {

  @ApiProperty({ example: 'Shraddha' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: 'Konde' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;

  @ApiProperty({ example: 'shraddha@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'Shraddha@123' })
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
    {
      message:
        'Password must contain uppercase, lowercase, number and special character',
    },
  )
  password!: string;

  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @IsOptional()
  phone?: string;
}

// ─── LOGIN DTO ────────────────────────────────────────
export class LoginDto {

  @ApiProperty({ example: 'shraddha@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'Shraddha@123' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}