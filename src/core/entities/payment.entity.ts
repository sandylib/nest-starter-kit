export interface Payment {
  transactionId: string;
  cartId: string;
  userId: string;
  method: string;
  status: "completed" | "pending" | "failed";
  amount: number;
  currency: string;
  fee: number;
  processedAt: Date;
}
