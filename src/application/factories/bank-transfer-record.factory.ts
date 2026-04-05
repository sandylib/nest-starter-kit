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

const SETTLEMENT_DAYS = 3;

export class BankTransferRecordFactory implements PaymentRecordFactory {
  readonly method = PaymentMethod.BANK_TRANSFER;

  buildTransactionRecord(
    input: PaymentInput,
    result: PaymentResult,
    fee: number,
  ): Payment {
    const estimatedSettlement = new Date(result.processedAt);
    estimatedSettlement.setDate(
      estimatedSettlement.getDate() + SETTLEMENT_DAYS,
    );

    return {
      ...buildBaseRecord(input, result, fee),
      metadata: {
        provider: "bank",
        estimatedSettlement,
        reference: result.transactionId,
      },
    };
  }
}
