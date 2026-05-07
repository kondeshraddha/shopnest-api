import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MaxLength,
  IsDateString,
  IsEnum,
  IsUrl,
  IsEmail,
} from 'class-validator';

export class UpdateUserDto {

  @ApiPropertyOptional({ example: 'Shraddha' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Konde' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({ example: 'shraddha@gmail.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'I love coding!' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ example: '1995-01-15' })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    example: 'female',
    enum: ['male', 'female', 'other'],
  })
  @IsEnum(['male', 'female', 'other'])
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ example: 'https://mywebsite.com' })
  @IsUrl()
  @IsOptional()
  website?: string;
}