import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PaymentsRepository } from './payments.repository';
import { OrdersRepository } from '../orders/orders.repository';
import {
  CreatePaymentIntentDto,
  RefundPaymentDto,
} from './dto/payment.dto';
import {
  PaymentStatus,
  PaymentMethod,
  OrderStatus,
  EVENTS,
} from '../../common/constants';
import { paginate } from '../../common/utils/pagination.util';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(
    PaymentsService.name,
  );

  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly ordersRepository: OrdersRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ─── CREATE PAYMENT ORDER (Mock) ──────────────────────
  async createPaymentOrder(
    userId: string,
    dto: CreatePaymentIntentDto,
  ) {
    // Get order
    const order =
      await this.ordersRepository.findById(dto.orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check ownership
    if (order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    // Check order is pending
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        'Only pending orders can be paid',
      );
    }

    // Check already paid
    const existingPayment =
      await this.paymentsRepository.findByOrderId(
        dto.orderId,
      );

    if (
      existingPayment &&
      existingPayment.status === PaymentStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Order is already paid',
      );
    }

    // Generate mock payment ID
    const mockPaymentIntentId = `mock_${uuidv4()}`;

    // Save payment record
    const payment = await this.paymentsRepository.create({
      orderId:               order.id,
      status:                PaymentStatus.PENDING,
      method:                PaymentMethod.CARD,
      amount:                order.totalAmount,
      currency:              'INR',
      stripePaymentIntentId: mockPaymentIntentId,
    });

    this.logger.log(
      `Mock payment order created: ${mockPaymentIntentId}`,
    );

    return {
      message: 'Payment order created successfully',
      data: {
        paymentId:     payment.id,
        mockPaymentId: mockPaymentIntentId,
        amount:        order.totalAmount,
        currency:      'INR',
        orderNumber:   order.orderNumber,
        instructions:  'Use POST /payments/simulate to simulate payment success',
      },
    };
  }

  // ─── SIMULATE PAYMENT (Mock) ──────────────────────────
  // This simulates what payment gateway does
  async simulatePayment(
    paymentId: string,
    success: boolean,
  ) {
    const payment =
      await this.paymentsRepository.findById(paymentId);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(
        'Payment already processed',
      );
    }

    if (success) {
      // ─── Payment Success ──────────────────────────
      await this.paymentsRepository.update(payment, {
        status:         PaymentStatus.COMPLETED,
        stripeChargeId: `mock_charge_${uuidv4()}`,
        paidAt:         new Date(),
      });

      // Update order to confirmed
      const order =
        await this.ordersRepository.findById(
          payment.orderId,
        );

      if (order) {
        await this.ordersRepository.updateOrder(order, {
          status: OrderStatus.CONFIRMED,
        });
      }

      this.eventEmitter.emit(
        EVENTS.PAYMENT_SUCCESS,
        { payment, order },
      );

      return {
        message: '✅ Payment simulated successfully!',
        data: {
          paymentId:   payment.id,
          status:      PaymentStatus.COMPLETED,
          orderNumber: order?.orderNumber,
          paidAt:      new Date(),
        },
      };

    } else {
      // ─── Payment Failed ───────────────────────────
      await this.paymentsRepository.update(payment, {
        status:        PaymentStatus.FAILED,
        failureReason: 'Payment declined (simulated)',
      });

      this.eventEmitter.emit(
        EVENTS.PAYMENT_FAILED,
        { payment },
      );

      return {
        message: '❌ Payment simulation failed!',
        data: {
          paymentId: payment.id,
          status:    PaymentStatus.FAILED,
        },
      };
    }
  }

  // ─── GET PAYMENT BY ORDER ─────────────────────────────
  async getPaymentByOrder(
    orderId: string,
    userId: string,
  ) {
    const order =
      await this.ordersRepository.findById(orderId);

    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    const payment =
      await this.paymentsRepository.findByOrderId(orderId);

    if (!payment) {
      throw new NotFoundException(
        'No payment found for this order',
      );
    }

    return {
      message: 'Payment fetched successfully',
      data: payment,
    };
  }

  // ─── REFUND PAYMENT (Admin) ───────────────────────────
  async refundPayment(
    paymentId: string,
    dto: RefundPaymentDto,
  ) {
    const payment =
      await this.paymentsRepository.findById(paymentId);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException(
        'Only completed payments can be refunded',
      );
    }

    await this.paymentsRepository.update(payment, {
      status:     PaymentStatus.REFUNDED,
      refundedAt: new Date(),
      metadata:   { refundReason: dto.reason },
    });

    const order =
      await this.ordersRepository.findById(
        payment.orderId,
      );

    if (order) {
      await this.ordersRepository.updateOrder(order, {
        status: OrderStatus.REFUNDED,
      });
    }

    return {
      message: 'Payment refunded successfully',
      data: payment,
    };
  }

  // ─── GET ALL PAYMENTS (Admin) ─────────────────────────
  async getAllPayments(page: number, limit: number) {
    const { count, rows } =
      await this.paymentsRepository.findAll(page, limit);
    return paginate(rows, count, page, limit);
  }

  // ─── GET STATS (Admin) ───────────────────────────────
  async getStats() {
    const stats =
      await this.paymentsRepository.getStats();
    return { message: 'Payment statistics', data: stats };
  }
}