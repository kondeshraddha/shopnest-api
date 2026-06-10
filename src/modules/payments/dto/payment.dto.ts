import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID, IsNotEmpty, IsString,
} from 'class-validator';

// ─── CREATE PAYMENT INTENT ────────────────────────────
export class CreatePaymentIntentDto {

  @ApiProperty({
    description: 'Order UUID to pay for',
    example: 'order-uuid-here',
  })
  @IsUUID()
  @IsNotEmpty()
  orderId!: string;
}

// ─── REFUND ───────────────────────────────────────────
export class RefundPaymentDto {

  @ApiProperty({
    description: 'Reason for refund',
    example: 'Customer requested refund',
  })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}