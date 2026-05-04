import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ─── Global Prefix ─────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ─── Global Validation Pipe ────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:            true, // remove unknown fields
      forbidNonWhitelisted: true, // error if unknown fields
      transform:            true, // auto convert types
    }),
  );

  // ─── CORS ──────────────────────────────────────────────
  app.enableCors();

  await app.listen(3000);
  console.log('🚀 ShopNest API running on: http://localhost:3000');
}

bootstrap();