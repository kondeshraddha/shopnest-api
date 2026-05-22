import { ConfigService } from '@nestjs/config';
import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { User } from '../modules/users/entities/user.entity';
import { UserProfile } from '../modules/users/entities/user-profile.entity';
import { RefreshToken } from '../modules/auth/entities/refresh-token.entity';
import { Category } from '../modules/categories/entities/category.entity';
import { Product } from '../modules/products/entities/product.entity';
import { ProductImage } from '../modules/products/entities/product-image.entity';
import { ProductVariant } from '../modules/products/entities/product-variant.entity';
import { Cart } from '../modules/cart/entities/cart.entity';
import { CartItem } from '../modules/cart/entities/cart-item.entity';
import { Order } from '../modules/orders/entities/order.entity';
import { OrderItem } from '../modules/orders/entities/order-item.entity';
import { Review } from '@/modules/reviews/entities/review.entity';
import { Address } from '@/modules/address/entities/address.entity';

export const databaseConfig = (
  configService: ConfigService,
): SequelizeModuleOptions => ({
  dialect: 'postgres',
  host:     configService.get<string>('db.host'),
  port:     configService.get<number>('db.port'),
  username: configService.get<string>('db.username'),
  password: configService.get<string>('db.password'),
  database: configService.get<string>('db.database'),
  models: [
    User, UserProfile, RefreshToken,
    Category,
    Product, ProductImage, ProductVariant,
    Cart, CartItem,
    Order, OrderItem, 
    Review,
    Address,   // ← add
  ],
  synchronize:    true,
  autoLoadModels: true,
  logging: configService.get<boolean>('db.logging')
    ? console.log
    : false,
  define: {
    underscored: true,
    timestamps:  true,
    paranoid:    true,
  },
  pool: {
    max: 10, min: 0,
    acquire: 30000, idle: 10000,
  },
});