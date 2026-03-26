import { v4 as uuid } from "uuid";
import {
  PaymentMethod,
  PaymentStrategy,
  PaymentInput,
  PaymentResult,
} from "./payment.strategy";

const CREDIT_CARD_FEE_RATE = 0.029;
const CREDIT_CARD_FIXED_FEE = 0.3;

export class CreditCardPaymentStrategy implements PaymentStrategy {
  readonly method = PaymentMethod.CREDIT_CARD;

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
    const { cardNumber, expiryMonth, expiryYear, cvv } = details;

    if (
      typeof cardNumber !== "string" ||
      typeof cvv !== "string" ||
      typeof expiryMonth !== "number" ||
      typeof expiryYear !== "number"
    ) {
      return false;
    }

    const sanitised = cardNumber.replace(/\s/g, "");
    if (sanitised.length < 13 || sanitised.length > 19) return false;
    if (cvv.length < 3 || cvv.length > 4) return false;

    const now = new Date();
    const expiry = new Date(expiryYear, expiryMonth);
    return expiry > now;
  }

  getTransactionFee(amount: number): number {
    return Number((amount * CREDIT_CARD_FEE_RATE + CREDIT_CARD_FIXED_FEE).toFixed(2));
  }
}
