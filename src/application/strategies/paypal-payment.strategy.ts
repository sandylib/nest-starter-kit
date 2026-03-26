import { v4 as uuid } from "uuid";
import {
  PaymentMethod,
  PaymentStrategy,
  PaymentInput,
  PaymentResult,
} from "./payment.strategy";

const PAYPAL_FEE_RATE = 0.0349;
const PAYPAL_FIXED_FEE = 0.49;

export class PayPalPaymentStrategy implements PaymentStrategy {
  readonly method = PaymentMethod.PAYPAL;

  async processPayment(input: PaymentInput): Promise<PaymentResult> {
    const fee = this.getTransactionFee(input.amount);
    const totalCharge = input.amount + fee;

    return {
      transactionId: uuid(),
      status: "completed",
      method: this.method,
      amount: totalCharge,
      currency: input.currency,
      processedAt: new Date(),
    };
  }

  validatePaymentDetails(details: Record<string, unknown>): boolean {
    const { email } = details;

    if (typeof email !== "string") return false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getTransactionFee(amount: number): number {
    return Number((amount * PAYPAL_FEE_RATE + PAYPAL_FIXED_FEE).toFixed(2));
  }
}
