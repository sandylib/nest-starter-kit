import { BankTransferRecordFactory } from "../bank-transfer-record.factory";
import {
  PaymentMethod,
  PaymentInput,
  PaymentResult,
} from "../../strategies/payment.strategy";

describe("BankTransferRecordFactory", () => {
  let factory: BankTransferRecordFactory;

  const input: PaymentInput = {
    amount: 200,
    currency: "USD",
    cartId: "cart-3",
    userId: "user-3",
  };

  const result: PaymentResult = {
    transactionId: "txn-bt-789",
    status: "pending",
    method: PaymentMethod.BANK_TRANSFER,
    amount: 201.5,
    currency: "USD",
    processedAt: new Date("2026-04-05T00:00:00Z"),
  };

  const fee = 1.5;

  beforeEach(() => {
    factory = new BankTransferRecordFactory();
  });

  it("should have BANK_TRANSFER as its method", () => {
    expect(factory.method).toBe(PaymentMethod.BANK_TRANSFER);
  });

  describe("buildTransactionRecord", () => {
    it("should return a Payment with all common fields populated", () => {
      const record = factory.buildTransactionRecord(input, result, fee);

      expect(record.transactionId).toBe("txn-bt-789");
      expect(record.cartId).toBe("cart-3");
      expect(record.userId).toBe("user-3");
      expect(record.method).toBe(PaymentMethod.BANK_TRANSFER);
      expect(record.status).toBe("pending");
      expect(record.amount).toBe(201.5);
      expect(record.currency).toBe("USD");
      expect(record.fee).toBe(1.5);
      expect(record.processedAt).toEqual(new Date("2026-04-05T00:00:00Z"));
    });

    it("should include bank-transfer-specific metadata with settlement date", () => {
      const record = factory.buildTransactionRecord(input, result, fee);

      const expectedSettlement = new Date("2026-04-08T00:00:00Z");
      expect(record.metadata.provider).toBe("bank");
      expect(record.metadata.reference).toBe("txn-bt-789");
      expect(record.metadata.estimatedSettlement).toEqual(expectedSettlement);
    });
  });
});
