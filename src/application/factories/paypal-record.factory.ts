import { Payment } from "../../core/entities/payment.entity";
import {
  PaymentMethod,
  PaymentInput,
  PaymentResult,
} from "../strategies/payment.strategy";
import {
  PaymentRecordFactory,
  buildBaseRecord,
} from "./payment-record.factory";

export class PayPalRecordFactory implements PaymentRecordFactory {
  readonly method = PaymentMethod.PAYPAL;

  buildTransactionRecord(
    input: PaymentInput,
    result: PaymentResult,
    fee: number,
  ): Payment {
    return {
      ...buildBaseRecord(input, result, fee),
      metadata: {
        provider: "paypal",
        payerEmail: null,
        paypalOrderId: result.transactionId,
      },
    };
  }
}
