import {
  Controller, Post, Delete, Body,
  UseInterceptors, UploadedFile,
  UploadedFiles, BadRequestException,
} from '@nestjs/common';
import {
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import {
  ApiTags, ApiBearerAuth, ApiOperation,
  ApiConsumes, ApiBody,
} from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UploadService, UploadFolder } from './upload.service';
import {
  imageUploadOptions,
  multipleImageUploadOptions,
} from './upload.config';

// ─── DELETE DTO ───────────────────────────────────────
class DeleteImageDto {
  @ApiProperty({ example: '/uploads/products/abc.webp' })
  @IsString()
  @IsNotEmpty()
  fileUrl!: string;
}

@ApiTags('Upload')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
  ) {}

  // ─── UPLOAD SINGLE IMAGE ──────────────────────────────
  @Post('image')
  @ApiOperation({ summary: 'Upload a single image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type:   'string',
          format: 'binary',
        },
        folder: {
          type:    'string',
          example: 'products',
          enum: [
            'avatars', 'products',
            'categories', 'reviews', 'misc',
          ],
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', imageUploadOptions),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder: UploadFolder = 'misc',
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const url = await this.uploadService.uploadImage(
      file, folder,
    );

    const info = await this.uploadService.getImageInfo(
      file,
    );

    return {
      message: 'Image uploaded successfully',
      data: {
        url,
        ...info,
      },
    };
  }

  // ─── UPLOAD MULTIPLE IMAGES ───────────────────────────
  @Post('images')
  @ApiOperation({
    summary: 'Upload multiple images (max 5)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type:  'array',
          items: { type: 'string', format: 'binary' },
        },
        folder: {
          type:    'string',
          example: 'products',
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', 5, multipleImageUploadOptions),
  )
  async uploadImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('folder') folder: UploadFolder = 'products',
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const urls = await this.uploadService.uploadImages(
      files, folder,
    );

    return {
      message: `${urls.length} image(s) uploaded successfully`,
      data: { urls, count: urls.length },
    };
  }


  @Delete()
  @ApiOperation({
    summary: 'Delete an uploaded image by URL',
  })
  async deleteImage(@Body() dto: DeleteImageDto) {
    await this.uploadService.deleteImage(dto.fileUrl);

    return {
      message: 'Image deleted successfully',
    };
  }
}