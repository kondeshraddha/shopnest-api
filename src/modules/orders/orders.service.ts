import {
  Injectable, NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { OrdersRepository } from './orders.repository';
import { CartRepository } from '../cart/cart.repository';
import { ProductsRepository } from '../products/products.repository';
import {
  CreateOrderDto, CancelOrderDto,
  UpdateOrderStatusDto,
} from './dto/order.dto';
import { EVENTS, OrderStatus } from '../../common/constants';
import { paginate } from '../../common/utils/pagination.util';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '../users/entities/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly cartRepository: CartRepository,
    private readonly productsRepository: ProductsRepository,
    private readonly eventEmitter: EventEmitter2,

    // ─── Inject User Model ───────────────────────────
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  // ─── PLACE ORDER ─────────────────────────────────────
  async placeOrder(userId: string, dto: CreateOrderDto) {

    // Step 1: Get user cart
    const cart =
      await this.cartRepository.findCartByUserId(userId);

    if (!cart || !cart.items?.length) {
      throw new BadRequestException(
        'Your cart is empty. Add items before placing order.',
      );
    }

    // Step 2: Validate stock for all items
    for (const item of cart.items) {
      const product =
        await this.productsRepository.findById(
          item.productId,
        );

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `"${product.name}" has only ${product.stock} items left in stock`,
        );
      }
    }

    // Step 3: Calculate totals
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const tax          = parseFloat((subtotal * 0.18).toFixed(2));
    const shippingCost = subtotal > 500 ? 0 : 99;
    const totalAmount  = parseFloat(
      (subtotal + tax + shippingCost).toFixed(2),
    );

    // Step 4: Create order data
    const orderData = {
      userId,
      subtotal:        parseFloat(subtotal.toFixed(2)),
      tax,
      shippingCost,
      totalAmount,
      paymentMethod:   dto.paymentMethod,
      shippingAddress: dto.shippingAddress,
      notes:           dto.notes,
      status:          OrderStatus.PENDING,
    };

    // Step 5: Create order items from cart
    const orderItems = cart.items.map((item) => ({
      productId:   item.productId,
      productName: item.product.name,
      productSku:  item.product.sku,
      variantInfo: item.variant
        ? `${item.variant.name}: ${item.variant.value}`
        : null,
      quantity:   item.quantity,
      unitPrice:  item.price,
      totalPrice: parseFloat(
        (item.price * item.quantity).toFixed(2),
      ),
    }));

    // Step 6: Save order to database
    const order = await this.ordersRepository.createOrder(
      orderData,
      orderItems,
    );

    // Step 7: Update product stock
    for (const item of cart.items) {
      const product =
        await this.productsRepository.findById(
          item.productId,
        );
      if (product) {
        const newStock = product.stock - item.quantity;
        await this.productsRepository.updateStock(
          product,
          newStock,
        );
      }
    }

    // Step 8: Clear the cart
    await this.cartRepository.clearCart(cart.id);

    // Step 9: Get user for email
    const user = await this.userModel.findByPk(userId);

    // Step 10: Emit event → Mail sends confirmation
    if (user) {
      this.eventEmitter.emit(
        EVENTS.ORDER_PLACED,
        {
          user: {
            email:     user.email,
            firstName: user.firstName,
          },
          order: order,
        },
      );
    }

    return {
      message: `Order placed successfully! Order number: ${order!.orderNumber}`,
      data: order,
    };
  }

  // ─── GET MY ORDERS ───────────────────────────────────
  async getMyOrders(
    userId: string,
    page: number,
    limit: number,
  ) {
    const { count, rows } =
      await this.ordersRepository.findUserOrders(
        userId,
        page,
        limit,
      );

    return paginate(rows, count, page, limit);
  }

  // ─── GET SINGLE ORDER ─────────────────────────────────
  async findById(id: string, userId?: string) {
    const order =
      await this.ordersRepository.findById(id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (userId && order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    return {
      message: 'Order fetched successfully',
      data: order,
    };
  }

  // ─── CANCEL ORDER ─────────────────────────────────────
  async cancelOrder(
    userId: string,
    orderId: string,
    dto: CancelOrderDto,
  ) {
    const order =
      await this.ordersRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    const cancellableStatuses = [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
    ];

    if (!cancellableStatuses.includes(order.status)) {
      throw new BadRequestException(
        `Cannot cancel order with status "${order.status}"`,
      );
    }

    await this.ordersRepository.updateOrder(order, {
      status:             OrderStatus.CANCELLED,
      cancellationReason: dto.reason,
    });

    for (const item of order.items) {
      const product =
        await this.productsRepository.findById(
          item.productId,
        );
      if (product) {
        const restoredStock = product.stock + item.quantity;
        await this.productsRepository.updateStock(
          product,
          restoredStock,
        );
      }
    }

    return {
      message: 'Order cancelled successfully',
      data: await this.ordersRepository.findById(orderId),
    };
  }

  // ─── GET ALL ORDERS (Admin) ───────────────────────────
  async getAllOrders(
    page: number,
    limit: number,
    status?: OrderStatus,
  ) {
    const { count, rows } =
      await this.ordersRepository.findAllOrders(
        page,
        limit,
        status,
      );

    return paginate(rows, count, page, limit);
  }

  // ─── UPDATE ORDER STATUS (Admin) ──────────────────────
  async updateStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
  ) {
    const order =
      await this.ordersRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const validTransitions: Record<string, string[]> = {
      [OrderStatus.PENDING]:    [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]:  [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED],
      [OrderStatus.SHIPPED]:    [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]:  [OrderStatus.REFUNDED],
      [OrderStatus.CANCELLED]:  [],
      [OrderStatus.REFUNDED]:   [],
    };

    const allowedNext = validTransitions[order.status];

    if (!allowedNext.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot change from "${order.status}" to "${dto.status}". Allowed: ${allowedNext.join(', ') || 'none'}`,
      );
    }

    await this.ordersRepository.updateOrder(order, {
      status:         dto.status,
      trackingNumber: dto.trackingNumber,
    });

    // Emit status change event for email
    const updatedOrder =
      await this.ordersRepository.findById(orderId);

    if (updatedOrder?.user) {
      this.eventEmitter.emit(
        EVENTS.ORDER_STATUS_CHANGED,
        {
          user: {
            email:     updatedOrder.user.email,
            firstName: updatedOrder.user.firstName,
          },
          order: updatedOrder,
        },
      );
    }

    return {
      message: `Order status updated to "${dto.status}"`,
      data: updatedOrder,
    };
  }

  // ─── GET STATS (Admin) ───────────────────────────────
  async getStats() {
    const stats =
      await this.ordersRepository.getStats();

    return {
      message: 'Order statistics',
      data: stats,
    };
  }
}