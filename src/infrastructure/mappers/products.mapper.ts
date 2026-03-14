import { ProductResponseDto } from "../../presentation/web/dto/product.dto";

export function toProductDto(product: any): ProductResponseDto {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    stock: product.stock,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export function toProductDtos(products: any[]): ProductResponseDto[] {
  return products.map(toProductDto);
}
