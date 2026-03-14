import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  MaxLength,
} from "class-validator";

export class CreateProductDto {
  @ApiProperty({ description: "Product name", example: "Wireless Headphones" })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: "Product description",
    example: "Noise-cancelling over-ear headphones",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "Product price", example: 149.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: "Stock quantity",
    example: 50,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;
}

export class UpdateProductDto {
  @ApiPropertyOptional({
    description: "Product name",
    example: "Updated Headphones",
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: "Product description" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: "Product price", example: 129.99 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: "Stock quantity", example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;
}

export class ProductResponseDto {
  @ApiProperty({ description: "Product ID" })
  id: string;

  @ApiProperty({ description: "Product name" })
  name: string;

  @ApiPropertyOptional({ description: "Product description" })
  description: string | null;

  @ApiProperty({ description: "Product price" })
  price: number;

  @ApiProperty({ description: "Stock quantity" })
  stock: number;

  @ApiProperty({ description: "Created timestamp" })
  createdAt: Date;

  @ApiProperty({ description: "Updated timestamp" })
  updatedAt: Date;
}
