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

export class CreditCardRecordFactory implements PaymentRecordFactory {
  readonly method = PaymentMethod.CREDIT_CARD;

  buildTransactionRecord(
    input: PaymentInput,
    result: PaymentResult,
    fee: number,
  ): Payment {
    return {
      ...buildBaseRecord(input, result, fee),
      metadata: {
        provider: "stripe",
        cardBrand: "visa",
        last4: "****",
      },
    };
  }
}
