import { v4 as uuid } from "uuid";
import {
  PaymentMethod,
  PaymentStrategy,
  PaymentInput,
  PaymentResult,
} from "./payment.strategy";

const BANK_TRANSFER_FLAT_FEE = 1.5;

export class BankTransferPaymentStrategy implements PaymentStrategy {
  readonly method = PaymentMethod.BANK_TRANSFER;

  async processPayment(input: PaymentInput): Promise<PaymentResult> {
    const fee = this.getTransactionFee(input.amount);
    const totalCharge = input.amount + fee;

    return {
      transactionId: uuid(),
      status: "pending",
      method: this.method,
      amount: totalCharge,
      currency: input.currency,
      processedAt: new Date(),
    };
  }

  validatePaymentDetails(details: Record<string, unknown>): boolean {
    const { accountNumber, routingNumber } = details;

    if (
      typeof accountNumber !== "string" ||
      typeof routingNumber !== "string"
    ) {
      return false;
    }

    return accountNumber.length >= 8 && routingNumber.length >= 9;
  }

  getTransactionFee(_amount: number): number {
    return BANK_TRANSFER_FLAT_FEE;
  }
}
