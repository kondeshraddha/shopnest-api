import { registerAs } from '@nestjs/config';

// ─── APP CONFIG ──────────────────────────────────────────────
export const appConfig = registerAs('app', () => ({
  nodeEnv:       process.env['NODE_ENV']      ?? 'development',
  port:          parseInt(process.env['PORT'] ?? '3000', 10),
  apiPrefix:     process.env['API_PREFIX']    ?? 'api/v1',
  appName:       process.env['APP_NAME']      ?? 'ShopNest API',
  frontendUrl:   process.env['FRONTEND_URL']  ?? 'http://localhost:4000',
  isProduction:  process.env['NODE_ENV'] === 'production',
  isDevelopment: process.env['NODE_ENV'] === 'development',
}));

// ─── DATABASE CONFIG ─────────────────────────────────────────
export const dbConfig = registerAs('db', () => ({
  host:     process.env['DB_HOST']     ?? 'localhost',
  port:     parseInt(process.env['DB_PORT'] ?? '5432', 10),
  username: process.env['DB_USERNAME'] ?? 'postgres',
  password: process.env['DB_PASSWORD'] ?? '',
  database: process.env['DB_NAME']     ?? 'shopnest_db',
  logging:  process.env['DB_LOGGING']  === 'true',
}));

// ─── JWT CONFIG ──────────────────────────────────────────────
export const jwtConfig = registerAs('jwt', () => ({
  accessSecret:     process.env['JWT_ACCESS_SECRET']      ?? '',
  accessExpiresIn:  process.env['JWT_ACCESS_EXPIRES_IN']  ?? '15m',
  refreshSecret:    process.env['JWT_REFRESH_SECRET']     ?? '',
  refreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] ?? '7d',
}));

// ─── MAIL CONFIG ─────────────────────────────────────────────
export const mailConfig = registerAs('mail', () => ({
  host:     process.env['MAIL_HOST']     ?? '',
  port:     parseInt(process.env['MAIL_PORT'] ?? '587', 10),
  user:     process.env['MAIL_USER']     ?? '',
  password: process.env['MAIL_PASSWORD'] ?? '',
  from:     process.env['MAIL_FROM']     ?? '',
}));

// ─── STRIPE CONFIG ───────────────────────────────────────────
export const stripeConfig = registerAs('stripe', () => ({
  secretKey:     process.env['STRIPE_SECRET_KEY']     ?? '',
  webhookSecret: process.env['STRIPE_WEBHOOK_SECRET'] ?? '',
}));

// ─── UPLOAD CONFIG ───────────────────────────────────────────
export const uploadConfig = registerAs('upload', () => ({
  dest:        process.env['UPLOAD_DEST']    ?? './uploads',
  maxFileSize: parseInt(process.env['MAX_FILE_SIZE'] ?? '5242880', 10),
}));

// ─── THROTTLE CONFIG ─────────────────────────────────────────
export const throttleConfig = registerAs('throttle', () => ({
  ttl:   parseInt(process.env['THROTTLE_TTL']   ?? '60',  10),
  limit: parseInt(process.env['THROTTLE_LIMIT'] ?? '100', 10),
}));