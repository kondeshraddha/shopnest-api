import {
  Controller, Post, Get, Body,
  Param, Query, UseGuards,
  ParseUUIDPipe, HttpCode, HttpStatus,
  Headers, RawBodyRequest, Req,
} from '@nestjs/common';
import {
  ApiTags, ApiBearerAuth, ApiOperation,
} from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import {
  CreatePaymentIntentDto,
  RefundPaymentDto,
} from './dto/payment.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/constants';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
  ) {}

  // ─── CREATE PAYMENT INTENT ────────────────────────────
  @Post('create-intent')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Stripe payment intent for order',
  })
  createPaymentIntent(
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePaymentIntentDto,
  ) {
    return this.paymentsService.createPaymentIntent(
      userId, dto,
    );
  }

  // ─── STRIPE WEBHOOK ───────────────────────────────────
  // Public because Stripe calls this
  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Stripe webhook handler (called by Stripe)',
  })
  handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhook(
      req.rawBody as Buffer,
      signature,
    );
  }

  // ─── GET PAYMENT BY ORDER ─────────────────────────────
  @Get('order/:orderId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment for an order' })
  getPaymentByOrder(
    @CurrentUser('id') userId: string,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ) {
    return this.paymentsService.getPaymentByOrder(
      orderId, userId,
    );
  }

  // ─── ADMIN — ALL PAYMENTS ─────────────────────────────
  @Get()
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Get all payments' })
  getAllPayments(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.paymentsService.getAllPayments(
      parseInt(page) || 1,
      parseInt(limit) || 10,
    );
  }

  // ─── ADMIN — STATS ────────────────────────────────────
  @Get('stats')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '[Admin] Get payment statistics',
  })
  getStats() {
    return this.paymentsService.getStats();
  }

  // ─── ADMIN — REFUND ───────────────────────────────────
  @Post(':id/refund')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Refund a payment' })
  refundPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RefundPaymentDto,
  ) {
    return this.paymentsService.refundPayment(id, dto);
  }
}