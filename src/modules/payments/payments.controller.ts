import {
  Controller, Post, Get, Body,
  Param, Query, UseGuards,
  ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiBearerAuth, ApiOperation,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import {
  CreatePaymentIntentDto,
  SimulatePaymentDto,
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

  // ─── CREATE PAYMENT ORDER ─────────────────────────────
  @Post('create-order')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment order' })
  createPaymentOrder(
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePaymentIntentDto,
  ) {
    return this.paymentsService.createPaymentOrder(
      userId, dto,
    );
  }

  // ─── SIMULATE PAYMENT ─────────────────────────────────
  @Public()
  @Post('simulate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Simulate payment success or failure (for testing)',
  })
  simulatePayment(@Body() dto: SimulatePaymentDto) {
    return this.paymentsService.simulatePayment(
      dto.paymentId,
      dto.success,
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
  @ApiOperation({ summary: '[Admin] Payment statistics' })
  getStats() {
    return this.paymentsService.getStats();
  }

  // ─── ADMIN — REFUND ───────────────────────────────────
  @Post(':id/refund')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Refund payment' })
  refundPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RefundPaymentDto,
  ) {
    return this.paymentsService.refundPayment(id, dto);
  }
}