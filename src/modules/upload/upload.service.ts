import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

// Folder types for organization
export type UploadFolder =
  | 'avatars'
  | 'products'
  | 'categories'
  | 'reviews'
  | 'misc';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(
    private configService: ConfigService,
  ) {
    this.uploadDir = path.join(
      process.cwd(), 'uploads',
    );
    this.baseUrl = `http://localhost:${
      this.configService.get('app.port') || 3000
    }`;

    // Create upload directories on startup
    this.createDirectories();
  }

  // ─── CREATE DIRECTORIES ───────────────────────────────
  private createDirectories() {
    const folders: UploadFolder[] = [
      'avatars', 'products',
      'categories', 'reviews', 'misc',
    ];

    folders.forEach((folder) => {
      const dirPath = path.join(this.uploadDir, folder);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        this.logger.log(`Created directory: ${dirPath}`);
      }
    });
  }

  // ─── UPLOAD SINGLE IMAGE ──────────────────────────────
  async uploadImage(
    file: Express.Multer.File,
    folder: UploadFolder = 'misc',
    options?: {
      width?: number;
      height?: number;
      quality?: number;
    },
  ): Promise<string> {

    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const {
      width = 1200,
      height,
      quality = 80,
    } = options || {};

    // Generate unique filename
    const filename = `${uuidv4()}.webp`;
    const outputPath = path.join(
      this.uploadDir, folder, filename,
    );

    try {
      // Process image with Sharp
      const sharpInstance = sharp(file.buffer)
        .resize(width, height, {
          fit: 'inside',          // maintain aspect ratio
          withoutEnlargement: true, // don't upscale small images
        })
        .webp({ quality });       // convert to WebP format

      await sharpInstance.toFile(outputPath);

      // Return public URL
      const fileUrl = `/uploads/${folder}/${filename}`;

      this.logger.log(
        `Image uploaded: ${fileUrl} (${this.getFileSize(file.size)})`,
      );

      return fileUrl;

    } catch (error) {
      this.logger.error('Image processing failed', error);
      throw new BadRequestException(
        'Image processing failed. Please try again.',
      );
    }
  }

  // ─── UPLOAD MULTIPLE IMAGES ───────────────────────────
  async uploadImages(
    files: Express.Multer.File[],
    folder: UploadFolder = 'products',
  ): Promise<string[]> {

    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    // Process all images in parallel
    const urls = await Promise.all(
      files.map((file) =>
        this.uploadImage(file, folder),
      ),
    );

    return urls;
  }

  // ─── DELETE IMAGE ─────────────────────────────────────
  async deleteImage(fileUrl: string): Promise<void> {
    try {
      // Convert URL to file path
      // /uploads/products/abc.webp → uploads/products/abc.webp
      const relativePath = fileUrl.replace('/uploads/', '');
      const fullPath = path.join(
        this.uploadDir, relativePath,
      );

      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        this.logger.log(`Deleted file: ${relativePath}`);
      }
    } catch (error) {
      this.logger.warn(
        `Could not delete file: ${fileUrl}`,
      );
    }
  }

  // ─── GET FILE SIZE STRING ─────────────────────────────
  private getFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // ─── GET IMAGE DIMENSIONS ─────────────────────────────
  async getImageInfo(file: Express.Multer.File) {
    const metadata = await sharp(file.buffer).metadata();
    return {
      width:  metadata.width,
      height: metadata.height,
      format: metadata.format,
      size:   this.getFileSize(file.size),
    };
  }
}