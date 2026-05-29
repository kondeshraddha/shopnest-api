import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:            true,
      forbidNonWhitelisted: true,
      transform:            true,
    }),
  );

  app.enableCors();

  // ─── Increase file upload limit ──────────────────────
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('json limit', '10mb');

  await app.listen(3000);
  console.log('🚀 ShopNest API running on: http://localhost:3000');
  console.log('📁 Uploads served at: http://localhost:3000/uploads');
}

bootstrap();