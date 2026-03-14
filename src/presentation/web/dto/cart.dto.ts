import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNumber, Min } from "class-validator";
import { ProductResponseDto } from "./product.dto";

export class AddToCartDto {
  @ApiProperty({ description: "Product ID to add to cart" })
  @IsString()
  productId: string;

  @ApiProperty({ description: "Quantity to add", example: 1, minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CartItemResponseDto {
  @ApiProperty({ description: "Cart item ID" })
  id: string;

  @ApiProperty({ description: "Cart ID" })
  cartId: string;

  @ApiProperty({ description: "Product ID" })
  productId: string;

  @ApiProperty({ description: "Quantity" })
  quantity: number;

  @ApiPropertyOptional({
    description: "Product details",
    type: ProductResponseDto,
  })
  product?: ProductResponseDto;

  @ApiProperty({ description: "Created timestamp" })
  createdAt: Date;

  @ApiProperty({ description: "Updated timestamp" })
  updatedAt: Date;
}

export class CartResponseDto {
  @ApiProperty({ description: "Cart ID" })
  id: string;

  @ApiProperty({ description: "User ID" })
  userId: string;

  @ApiProperty({
    description: "Cart status",
    enum: ["active", "completed", "abandoned"],
  })
  status: string;

  @ApiProperty({ description: "Cart items", type: [CartItemResponseDto] })
  items: CartItemResponseDto[];

  @ApiProperty({ description: "Created timestamp" })
  createdAt: Date;

  @ApiProperty({ description: "Updated timestamp" })
  updatedAt: Date;
}
