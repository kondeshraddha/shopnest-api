import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { User } from '../users/entities/user.entity';
import { OrderStatus } from '../../common/constants';

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectModel(Order)
    private orderModel: typeof Order,

    @InjectModel(OrderItem)
    private orderItemModel: typeof OrderItem,
  ) {}

  // ─── CREATE ORDER ─────────────────────────────────────
  async createOrder(orderData: any, items: any[]) {
    // Create order
    const order = await this.orderModel.create(
      orderData,
    );

    // Create order items
    await this.orderItemModel.bulkCreate(
      items.map((item) => ({
        ...item,
        orderId: order.id,
      })),
    );

    return this.findById(order.id);
  }

  // ─── FIND BY ID ──────────────────────────────────────
  async findById(id: string) {
    return this.orderModel.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
        },
        {
          model: User,
          as: 'user',
          attributes: [
            'id', 'firstName',
            'lastName', 'email',
          ],
        },
      ],
    });
  }

  // ─── FIND BY ORDER NUMBER ─────────────────────────────
  async findByOrderNumber(orderNumber: string) {
    return this.orderModel.findOne({
      where: { orderNumber },
      include: [{ model: OrderItem, as: 'items' }],
    });
  }

  // ─── FIND USER ORDERS ─────────────────────────────────
  async findUserOrders(
    userId: string,
    page: number,
    limit: number,
  ) {
    const offset = (page - 1) * limit;

    return this.orderModel.findAndCountAll({
      where: { userId },
      include: [{ model: OrderItem, as: 'items' }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
  }

  // ─── FIND ALL ORDERS (Admin) ──────────────────────────
  async findAllOrders(
    page: number,
    limit: number,
    status?: OrderStatus,
  ) {
    const offset = (page - 1) * limit;
    const where: any = {};

    if (status) where.status = status;

    return this.orderModel.findAndCountAll({
      where,
      include: [
        { model: OrderItem, as: 'items' },
        {
          model: User,
          as: 'user',
          attributes: [
            'id', 'firstName',
            'lastName', 'email',
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
  }

  // ─── UPDATE ORDER ─────────────────────────────────────
  async updateOrder(order: Order, data: any) {
    return order.update(data);
  }

  // ─── GET STATS ───────────────────────────────────────
  async getStats() {
    const [
      total, pending, confirmed,
      processing, shipped, delivered,
      cancelled,
    ] = await Promise.all([
      this.orderModel.count(),
      this.orderModel.count({
        where: { status: OrderStatus.PENDING },
      }),
      this.orderModel.count({
        where: { status: OrderStatus.CONFIRMED },
      }),
      this.orderModel.count({
        where: { status: OrderStatus.PROCESSING },
      }),
      this.orderModel.count({
        where: { status: OrderStatus.SHIPPED },
      }),
      this.orderModel.count({
        where: { status: OrderStatus.DELIVERED },
      }),
      this.orderModel.count({
        where: { status: OrderStatus.CANCELLED },
      }),
    ]);

    return {
      total, pending, confirmed,
      processing, shipped, delivered,
      cancelled,
    };
  }
}
