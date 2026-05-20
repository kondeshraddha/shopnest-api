import {
  Controller, Get, Post, Patch, Body,
  Param, Query, UseGuards,
  ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiBearerAuth,
  ApiOperation, ApiQuery,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { OrdersService } from './orders.service';
import {
  CreateOrderDto, CancelOrderDto,
  UpdateOrderStatusDto,
} from './dto/order.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole, OrderStatus } from '../../common/constants';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
  ) {}

  // ─── PLACE ORDER ─────────────────────────────────────
  @Post()
  @ApiOperation({ summary: 'Place order from cart' })
  placeOrder(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.placeOrder(userId, dto);
  }

  // ─── MY ORDERS ───────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'Get my order history' })
  getMyOrders(
    @CurrentUser('id') userId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.ordersService.getMyOrders(
      userId,
      parseInt(page) || 1,
      parseInt(limit) || 10,
    );
  }

  // ─── SINGLE ORDER ─────────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Get order details' })
  getOrder(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ordersService.findById(id, userId);
  }

  // ─── CANCEL ORDER ─────────────────────────────────────
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel my order' })
  cancelOrder(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelOrderDto,
  ) {
    return this.ordersService.cancelOrder(userId, id, dto);
  }

  // ─── ADMIN — ALL ORDERS ───────────────────────────────
  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Get all orders' })
  getAllOrders(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status?: OrderStatus,
  ) {
    return this.ordersService.getAllOrders(
      parseInt(page) || 1,
      parseInt(limit) || 10,
      status,
    );
  }

  // ─── ADMIN — STATS ────────────────────────────────────
  @Get('admin/stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Get order statistics' })
  getStats() {
    return this.ordersService.getStats();
  }

  // ─── ADMIN — UPDATE STATUS ────────────────────────────
  @Patch('admin/:id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Update order status' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto);
  }
}