import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNumber, IsEnum, IsOptional, Min } from "class-validator";

export class CheckoutDto {
  @ApiProperty({ description: "Cart ID to checkout" })
  @IsString()
  cartId: string;

  @ApiProperty({
    description: "Payment method",
    enum: ["credit_card", "paypal", "bank_transfer"],
  })
  @IsEnum(["credit_card", "paypal", "bank_transfer"])
  paymentMethod: string;

  @ApiProperty({ description: "Payment amount", minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: "Currency code", example: "USD" })
  @IsString()
  currency: string;

  @ApiPropertyOptional({
    description: "Payment-method-specific details (card info, email, account)",
  })
  @IsOptional()
  paymentDetails?: Record<string, unknown>;
}

export class PaymentResponseDto {
  @ApiProperty({ description: "Transaction ID" })
  transactionId: string;

  @ApiProperty({
    description: "Payment status",
    enum: ["completed", "pending", "failed"],
  })
  status: string;

  @ApiProperty({ description: "Payment method used" })
  method: string;

  @ApiProperty({ description: "Total amount charged (including fees)" })
  amount: number;

  @ApiProperty({ description: "Currency code" })
  currency: string;

  @ApiProperty({ description: "Transaction fee" })
  fee: number;

  @ApiProperty({ description: "Timestamp of payment processing" })
  processedAt: Date;
}

export class PaymentMethodResponseDto {
  @ApiProperty({ description: "Payment method identifier" })
  method: string;

  @ApiProperty({
    description: "Sample transaction fee for $100",
    example: 3.2,
  })
  sampleFee: number;
}
