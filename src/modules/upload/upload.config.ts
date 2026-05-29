import { memoryStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

// ─── ALLOWED FILE TYPES ───────────────────────────────
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

// ─── MAX FILE SIZE: 5MB ───────────────────────────────
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// ─── MULTER OPTIONS ───────────────────────────────────
export const imageUploadOptions: MulterOptions = {
  // Store in memory (not disk)
  // Sharp processes from memory
  storage: memoryStorage(),

  // File size limit
  limits: {
    fileSize: MAX_FILE_SIZE,
  },

  // File type validation
  fileFilter: (
    _req: any,
    file: Express.Multer.File,
    callback: Function,
  ) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return callback(
        new BadRequestException(
          `Invalid file type "${file.mimetype}". Allowed: JPEG, PNG, WEBP, GIF`,
        ),
        false,
      );
    }
    callback(null, true);
  },
};

// ─── MULTIPLE IMAGES OPTIONS ──────────────────────────
export const multipleImageUploadOptions: MulterOptions = {
  storage: memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5, // max 5 files at once
  },
  fileFilter: (
    _req: any,
    file: Express.Multer.File,
    callback: Function,
  ) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return callback(
        new BadRequestException(
          `Invalid file type. Allowed: JPEG, PNG, WEBP, GIF`,
        ),
        false,
      );
    }
    callback(null, true);
  },
};