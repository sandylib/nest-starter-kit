import { PayPalRecordFactory } from "../paypal-record.factory";
import {
  PaymentMethod,
  PaymentInput,
  PaymentResult,
} from "../../strategies/payment.strategy";

describe("PayPalRecordFactory", () => {
  let factory: PayPalRecordFactory;

  const input: PaymentInput = {
    amount: 50,
    currency: "USD",
    cartId: "cart-2",
    userId: "user-2",
  };

  const result: PaymentResult = {
    transactionId: "txn-pp-456",
    status: "completed",
    method: PaymentMethod.PAYPAL,
    amount: 52.24,
    currency: "USD",
    processedAt: new Date("2026-04-05T00:00:00Z"),
  };

  const fee = 2.24;

  beforeEach(() => {
    factory = new PayPalRecordFactory();
  });

  it("should have PAYPAL as its method", () => {
    expect(factory.method).toBe(PaymentMethod.PAYPAL);
  });

  describe("buildTransactionRecord", () => {
    it("should return a Payment with all common fields populated", () => {
      const record = factory.buildTransactionRecord(input, result, fee);

      expect(record.transactionId).toBe("txn-pp-456");
      expect(record.cartId).toBe("cart-2");
      expect(record.userId).toBe("user-2");
      expect(record.method).toBe(PaymentMethod.PAYPAL);
      expect(record.status).toBe("completed");
      expect(record.amount).toBe(52.24);
      expect(record.currency).toBe("USD");
      expect(record.fee).toBe(2.24);
      expect(record.processedAt).toEqual(new Date("2026-04-05T00:00:00Z"));
    });

    it("should include PayPal-specific metadata with order ID matching transaction", () => {
      const record = factory.buildTransactionRecord(input, result, fee);

      expect(record.metadata).toEqual({
        provider: "paypal",
        payerEmail: null,
        paypalOrderId: "txn-pp-456",
      });
    });
  });
});
