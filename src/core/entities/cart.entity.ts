import { Product } from "./product.entity";

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  version: number;
  product?: Product;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cart {
  id: string;
  userId: string;
  status: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}
