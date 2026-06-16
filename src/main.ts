import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SwaggerModule,
  DocumentBuilder,
} from '@nestjs/swagger';
import * as compression from 'compression';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  const configService = app.get(ConfigService);
  const port      = configService.get<number>('app.port') || 3000;
  const apiPrefix = configService.get<string>('app.apiPrefix') || 'api/v1';
  const appName   = configService.get<string>('app.appName') || 'ShopNest API';

  // ─── Global Prefix ───────────────────────────────────
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['/uploads/(.*)'],
  });

  // ─── Compression ─────────────────────────────────────
  app.use(compression());

  // ─── CORS ────────────────────────────────────────────
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ─── Validation Pipe ─────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:            true,
      forbidNonWhitelisted: true,
      transform:            true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ─── Swagger Setup ───────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle(`${appName}`)
    .setDescription(
      `## ShopNest E-Commerce REST API Documentation

### How to Use
1. **Register** → \`POST /auth/register\`
2. **Login** → \`POST /auth/login\` → copy \`accessToken\`
3. Click **Authorize** button → enter \`Bearer your_token\`
4. Now you can test all protected routes!

### Features
- 🔐 JWT Authentication with Refresh Tokens
- 🛍️ Products with variants and images
- 🛒 Shopping cart with tax calculation
- 📦 Orders with status tracking
- 💳 Payment processing
- ⭐ Product reviews
- ❤️ Wishlist
- 📧 Email notifications
      `,
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type:         'http',
        scheme:       'bearer',
        bearerFormat: 'JWT',
        name:         'JWT',
        description:  'Enter your JWT access token',
        in:           'header',
      },
      'access-token',
    )
    .addTag('Auth',       '🔐 Authentication & Authorization')
    .addTag('Users',      '👤 User management')
    .addTag('Categories', '🗂️ Product categories')
    .addTag('Products',   '📦 Product catalog')
    .addTag('Cart',       '🛒 Shopping cart')
    .addTag('Orders',     '📋 Order management')
    .addTag('Payments',   '💳 Payment processing')
    .addTag('Reviews',    '⭐ Product reviews')
    .addTag('Addresses',  '📍 User addresses')
    .addTag('Wishlist',   '❤️ Product wishlist')
    .addTag('Upload',     '📸 File uploads')
    .build();

  const document = SwaggerModule.createDocument(
    app,
    swaggerConfig,
  );

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // remember token after refresh
      tagsSorter:           'alpha',
    },
    customSiteTitle: 'ShopNest API Docs',
    customfavIcon:   'https://nestjs.com/img/logo_text.svg',
  });

  // ─── Start Server ─────────────────────────────────────
  await app.listen(port);

  logger.log(`🚀 App running: http://localhost:${port}`);
  logger.log(`📚 API Docs:    http://localhost:${port}/api/docs`);
  logger.log(`📁 Uploads:     http://localhost:${port}/uploads`);
  logger.log(`🌍 Environment: ${configService.get('app.nodeEnv')}`);
}

bootstrap();