import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Payment } from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';
import { PaymentStatus } from '../../common/constants';

@Injectable()
export class PaymentsRepository {
  constructor(
    @InjectModel(Payment)
    private paymentModel: typeof Payment,
  ) {}

  // ─── CREATE PAYMENT ───────────────────────────────────
  async create(data: any) {
    return this.paymentModel.create(data);
  }

  // ─── FIND BY ID ──────────────────────────────────────
  async findById(id: string) {
    return this.paymentModel.findByPk(id, {
      include: [{ model: Order, as: 'order' }],
    });
  }

  // ─── FIND BY ORDER ID ─────────────────────────────────
  async findByOrderId(orderId: string) {
    return this.paymentModel.findOne({
      where: { orderId },
      include: [{ model: Order, as: 'order' }],
    });
  }

  // ─── FIND BY STRIPE INTENT ID ─────────────────────────
  async findByStripeIntentId(
    stripePaymentIntentId: string,
  ) {
    return this.paymentModel.findOne({
      where: { stripePaymentIntentId },
    });
  }

  // ─── FIND ALL ─────────────────────────────────────────
  async findAll(page: number, limit: number) {
    const offset = (page - 1) * limit;
    return this.paymentModel.findAndCountAll({
      include: [{ model: Order, as: 'order' }],
      order:   [['createdAt', 'DESC']],
      limit,
      offset,
    });
  }

  // ─── UPDATE PAYMENT ───────────────────────────────────
  async update(payment: Payment, data: any) {
    return payment.update(data);
  }

  // ─── GET STATS ───────────────────────────────────────
  async getStats() {
    const [
      total, pending, completed,
      failed, refunded,
    ] = await Promise.all([
      this.paymentModel.count(),
      this.paymentModel.count({
        where: { status: PaymentStatus.PENDING },
      }),
      this.paymentModel.count({
        where: { status: PaymentStatus.COMPLETED },
      }),
      this.paymentModel.count({
        where: { status: PaymentStatus.FAILED },
      }),
      this.paymentModel.count({
        where: { status: PaymentStatus.REFUNDED },
      }),
    ]);

    return {
      total, pending,
      completed, failed, refunded,
    };
  }
}