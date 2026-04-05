import { Payment } from "../../core/entities/payment.entity";
import {
  PaymentMethod,
  PaymentInput,
  PaymentResult,
} from "../strategies/payment.strategy";

export interface PaymentRecordFactory {
  readonly method: PaymentMethod;
  buildTransactionRecord(
    input: PaymentInput,
    result: PaymentResult,
    fee: number,
  ): Payment;
}

export function buildBaseRecord(
  input: PaymentInput,
  result: PaymentResult,
  fee: number,
): Omit<Payment, "metadata"> {
  return {
    transactionId: result.transactionId,
    cartId: input.cartId,
    userId: input.userId,
    method: result.method,
    status: result.status,
    amount: result.amount,
    currency: result.currency,
    fee,
    processedAt: result.processedAt,
  };
}
