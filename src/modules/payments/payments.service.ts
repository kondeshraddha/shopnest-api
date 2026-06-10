import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(
    PaymentsService.name,
  );
  private stripe: Stripe;

  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly ordersRepository: OrdersRepository,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    // Initialize Stripe
    this.stripe = new Stripe(
      this.configService.get<string>(
        'stripe.secretKey',
      ) || '',
      { apiVersion: '2024-04-10' },
    );
  }

  // ─── CREATE PAYMENT INTENT ────────────────────────────
  async createPaymentIntent(
    userId: string,
    dto: CreatePaymentIntentDto,
  ) {
    // Get order
    const order =
      await this.ordersRepository.findById(dto.orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check order belongs to user
    if (order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    // Check order status
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        'Only pending orders can be paid',
      );
    }

    // Check if payment already exists
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

    // Amount in smallest currency unit (paise for INR)
    const amount = Math.round(order.totalAmount * 100);
    const currency =
      this.configService.get<string>('stripe.currency')
      || 'inr';

    // Create Stripe Payment Intent
    const paymentIntent =
      await this.stripe.paymentIntents.create({
        amount,
        currency,
        metadata: {
          orderId:     order.id,
          orderNumber: order.orderNumber,
          userId,
        },
      });

    // Save payment record in database
    const payment = await this.paymentsRepository.create({
      orderId:              order.id,
      status:               PaymentStatus.PENDING,
      method:               PaymentMethod.CARD,
      amount:               order.totalAmount,
      currency,
      stripePaymentIntentId: paymentIntent.id,
    });

    this.logger.log(
      `Payment intent created: ${paymentIntent.id}`,
    );

    return {
      message: 'Payment intent created successfully',
      data: {
        paymentId:    payment.id,
        clientSecret: paymentIntent.client_secret,
        amount:       order.totalAmount,
        currency,
        orderNumber:  order.orderNumber,
      },
    };
  }

  // ─── HANDLE STRIPE WEBHOOK ────────────────────────────
  async handleWebhook(
    payload: Buffer,
    signature: string,
  ) {
    const webhookSecret =
      this.configService.get<string>(
        'stripe.webhookSecret',
      ) || '';

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (err) {
      throw new BadRequestException(
        `Webhook signature verification failed`,
      );
    }

    // Handle different event types
    switch (event.type) {

      // ─── Payment Successful ──────────────────────────
      case 'payment_intent.succeeded': {
        const paymentIntent =
          event.data.object as Stripe.PaymentIntent;

        await this.handlePaymentSuccess(paymentIntent);
        break;
      }

      // ─── Payment Failed ──────────────────────────────
      case 'payment_intent.payment_failed': {
        const paymentIntent =
          event.data.object as Stripe.PaymentIntent;

        await this.handlePaymentFailed(paymentIntent);
        break;
      }

      default:
        this.logger.log(
          `Unhandled webhook event: ${event.type}`,
        );
    }

    return { received: true };
  }

  // ─── HANDLE PAYMENT SUCCESS ───────────────────────────
  private async handlePaymentSuccess(
    paymentIntent: Stripe.PaymentIntent,
  ) {
    const payment =
      await this.paymentsRepository.findByStripeIntentId(
        paymentIntent.id,
      );

    if (!payment) return;

    // Update payment status
    await this.paymentsRepository.update(payment, {
      status:         PaymentStatus.COMPLETED,
      stripeChargeId: paymentIntent.latest_charge as string,
      paidAt:         new Date(),
    });

    // Update order status to confirmed
    const order =
      await this.ordersRepository.findById(
        payment.orderId,
      );

    if (order) {
      await this.ordersRepository.updateOrder(order, {
        status: OrderStatus.CONFIRMED,
      });
    }

    this.logger.log(
      `Payment successful: ${paymentIntent.id}`,
    );

    // Emit payment success event
    this.eventEmitter.emit(
      EVENTS.PAYMENT_SUCCESS,
      { payment, order },
    );
  }

  // ─── HANDLE PAYMENT FAILED ────────────────────────────
  private async handlePaymentFailed(
    paymentIntent: Stripe.PaymentIntent,
  ) {
    const payment =
      await this.paymentsRepository.findByStripeIntentId(
        paymentIntent.id,
      );

    if (!payment) return;

    await this.paymentsRepository.update(payment, {
      status:        PaymentStatus.FAILED,
      failureReason:
        paymentIntent.last_payment_error?.message ||
        'Payment failed',
    });

    this.logger.log(
      `Payment failed: ${paymentIntent.id}`,
    );

    this.eventEmitter.emit(
      EVENTS.PAYMENT_FAILED,
      { payment },
    );
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

    // Create refund in Stripe
    await this.stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      reason: 'requested_by_customer',
    });

    // Update payment status
    await this.paymentsRepository.update(payment, {
      status:     PaymentStatus.REFUNDED,
      refundedAt: new Date(),
      metadata: {
        refundReason: dto.reason,
      },
    });

    // Update order status
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

    return {
      message: 'Payment statistics',
      data: stats,
    };
  }
}