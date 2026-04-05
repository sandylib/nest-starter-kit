import { CreditCardRecordFactory } from "../credit-card-record.factory";
import {
  PaymentMethod,
  PaymentInput,
  PaymentResult,
} from "../../strategies/payment.strategy";

describe("CreditCardRecordFactory", () => {
  let factory: CreditCardRecordFactory;

  const input: PaymentInput = {
    amount: 100,
    currency: "USD",
    cartId: "cart-1",
    userId: "user-1",
  };

  const result: PaymentResult = {
    transactionId: "txn-cc-123",
    status: "completed",
    method: PaymentMethod.CREDIT_CARD,
    amount: 103.2,
    currency: "USD",
    processedAt: new Date("2026-04-05T00:00:00Z"),
  };

  const fee = 3.2;

  beforeEach(() => {
    factory = new CreditCardRecordFactory();
  });

  it("should have CREDIT_CARD as its method", () => {
    expect(factory.method).toBe(PaymentMethod.CREDIT_CARD);
  });

  describe("buildTransactionRecord", () => {
    it("should return a Payment with all common fields populated", () => {
      const record = factory.buildTransactionRecord(input, result, fee);

      expect(record.transactionId).toBe("txn-cc-123");
      expect(record.cartId).toBe("cart-1");
      expect(record.userId).toBe("user-1");
      expect(record.method).toBe(PaymentMethod.CREDIT_CARD);
      expect(record.status).toBe("completed");
      expect(record.amount).toBe(103.2);
      expect(record.currency).toBe("USD");
      expect(record.fee).toBe(3.2);
      expect(record.processedAt).toEqual(new Date("2026-04-05T00:00:00Z"));
    });

    it("should include credit-card-specific metadata", () => {
      const record = factory.buildTransactionRecord(input, result, fee);

      expect(record.metadata).toEqual({
        provider: "stripe",
        cardBrand: "visa",
        last4: "****",
      });
    });
  });
});
