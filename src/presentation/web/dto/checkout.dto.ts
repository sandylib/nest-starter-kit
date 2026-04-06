import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsEnum, IsOptional } from "class-validator";

export class CheckoutRequestDto {
  @ApiProperty({ description: "Cart ID to checkout" })
  @IsString()
  cartId: string;

  @ApiProperty({
    description: "Payment method",
    enum: ["credit_card", "paypal", "bank_transfer"],
  })
  @IsEnum(["credit_card", "paypal", "bank_transfer"])
  paymentMethod: string;

  @ApiProperty({ description: "Currency code", example: "USD" })
  @IsString()
  currency: string;

  @ApiPropertyOptional({
    description: "Payment-method-specific details",
  })
  @IsOptional()
  paymentDetails?: Record<string, unknown>;
}

export class OrderItemResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() productId: string;
  @ApiProperty() quantity: number;
  @ApiProperty() unitPrice: number;
}

export class OrderResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() userId: string;
  @ApiProperty() cartId: string;
  @ApiProperty() status: string;
  @ApiProperty() totalAmount: number;
  @ApiProperty({ type: [OrderItemResponseDto] }) items: OrderItemResponseDto[];
  @ApiProperty() createdAt: Date;
}

export class InvoiceResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() orderId: string;
  @ApiProperty() invoiceNo: string;
  @ApiProperty() totalAmount: number;
  @ApiProperty() issuedAt: Date;
}

export class CheckoutResponseDto {
  @ApiProperty({ type: OrderResponseDto })
  order: OrderResponseDto;

  @ApiProperty({ type: InvoiceResponseDto })
  invoice: InvoiceResponseDto;

  @ApiProperty({ description: "Transaction ID from payment provider" })
  transactionId: string;

  @ApiProperty({ description: "Payment status" })
  paymentStatus: string;

  @ApiProperty({ description: "Payment method used" })
  paymentMethod: string;

  @ApiProperty({ description: "Transaction fee" })
  fee: number;
}
