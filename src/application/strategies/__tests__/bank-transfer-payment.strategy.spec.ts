import { BankTransferPaymentStrategy } from "../bank-transfer-payment.strategy";
import { PaymentMethod } from "../payment.strategy";

describe("BankTransferPaymentStrategy", () => {
  let strategy: BankTransferPaymentStrategy;

  beforeEach(() => {
    strategy = new BankTransferPaymentStrategy();
  });

  it("should have BANK_TRANSFER as its method", () => {
    expect(strategy.method).toBe(PaymentMethod.BANK_TRANSFER);
  });

  describe("processPayment", () => {
    it("should return a pending payment result", async () => {
      const result = await strategy.processPayment({
        amount: 200,
        currency: "USD",
        cartId: "cart-1",
        userId: "user-1",
      });

      expect(result.status).toBe("pending");
      expect(result.method).toBe(PaymentMethod.BANK_TRANSFER);
      expect(result.transactionId).toBeDefined();
    });
  });

  describe("validatePaymentDetails", () => {
    it("should accept valid bank details", () => {
      expect(
        strategy.validatePaymentDetails({
          accountNumber: "12345678",
          routingNumber: "123456789",
        }),
      ).toBe(true);
    });

    it("should reject short account number", () => {
      expect(
        strategy.validatePaymentDetails({
          accountNumber: "123",
          routingNumber: "123456789",
        }),
      ).toBe(false);
    });

    it("should reject missing fields", () => {
      expect(strategy.validatePaymentDetails({})).toBe(false);
    });
  });

  describe("getTransactionFee", () => {
    it("should return flat $1.50 fee regardless of amount", () => {
      expect(strategy.getTransactionFee(100)).toBe(1.5);
      expect(strategy.getTransactionFee(1000)).toBe(1.5);
      expect(strategy.getTransactionFee(1)).toBe(1.5);
    });
  });
});
