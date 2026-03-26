export enum PaymentMethod {
  CREDIT_CARD = "credit_card",
  PAYPAL = "paypal",
  BANK_TRANSFER = "bank_transfer",
}

export interface PaymentInput {
  amount: number;
  currency: string;
  cartId: string;
  userId: string;
}

export interface PaymentResult {
  transactionId: string;
  status: "completed" | "pending" | "failed";
  method: PaymentMethod;
  amount: number;
  currency: string;
  processedAt: Date;
}

export interface PaymentStrategy {
  readonly method: PaymentMethod;
  processPayment(input: PaymentInput): Promise<PaymentResult>;
  validatePaymentDetails(details: Record<string, unknown>): boolean;
  getTransactionFee(amount: number): number;
}
