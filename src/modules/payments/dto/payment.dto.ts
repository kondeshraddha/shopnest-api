import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID, IsNotEmpty,
  IsString, IsBoolean,
} from 'class-validator';

export class CreatePaymentIntentDto {
  @ApiProperty({ example: 'order-uuid-here' })
  @IsUUID() @IsNotEmpty()
  orderId!: string;
}

export class SimulatePaymentDto {
  @ApiProperty({ example: 'payment-uuid-here' })
  @IsUUID() @IsNotEmpty()
  paymentId!: string;

  @ApiProperty({
    example: true,
    description: 'true = success, false = failed',
  })
  @IsBoolean()
  success!: boolean;
}

export class RefundPaymentDto {
  @ApiProperty({ example: 'Customer requested refund' })
  @IsString() @IsNotEmpty()
  reason!: string;
}