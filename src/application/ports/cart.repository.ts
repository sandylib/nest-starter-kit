import { Cart, CartItem } from "../../core/entities/cart.entity";

export interface CartRepository {
  create(userId: string): Promise<Cart>;
  findById(id: string): Promise<Cart | null>;
  remove(id: string): Promise<Cart>;
  findCartItem(cartId: string, productId: string): Promise<CartItem | null>;
  createCartItem(
    cartId: string,
    productId: string,
    quantity: number,
  ): Promise<CartItem>;
  updateCartItemQuantity(itemId: string, quantity: number): Promise<CartItem>;
  removeCartItem(itemId: string): Promise<CartItem>;
}
