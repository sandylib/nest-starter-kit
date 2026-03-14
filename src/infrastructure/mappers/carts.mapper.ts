import {
  CartResponseDto,
  CartItemResponseDto,
} from "../../presentation/web/dto/cart.dto";
import { toProductDto } from "./products.mapper";

export function toCartItemDto(item: any): CartItemResponseDto {
  return {
    id: item.id,
    cartId: item.cartId,
    productId: item.productId,
    quantity: item.quantity,
    product: item.product ? toProductDto(item.product) : undefined,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export function toCartDto(cart: any): CartResponseDto {
  return {
    id: cart.id,
    userId: cart.userId,
    status: cart.status,
    items: (cart.items || []).map(toCartItemDto),
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
}
