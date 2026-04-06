export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  cartId: string;
  status: "confirmed" | "cancelled";
  totalAmount: number;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}
