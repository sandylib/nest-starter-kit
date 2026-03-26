import { PayPalPaymentStrategy } from "../paypal-payment.strategy";
import { PaymentMethod } from "../payment.strategy";

describe("PayPalPaymentStrategy", () => {
  let strategy: PayPalPaymentStrategy;

  beforeEach(() => {
    strategy = new PayPalPaymentStrategy();
  });

  it("should have PAYPAL as its method", () => {
    expect(strategy.method).toBe(PaymentMethod.PAYPAL);
  });

  describe("processPayment", () => {
    it("should return a completed payment result", async () => {
      const result = await strategy.processPayment({
        amount: 50,
        currency: "USD",
        cartId: "cart-1",
        userId: "user-1",
      });

      expect(result.status).toBe("completed");
      expect(result.method).toBe(PaymentMethod.PAYPAL);
      expect(result.transactionId).toBeDefined();
    });
  });

  describe("validatePaymentDetails", () => {
    it("should accept valid email", () => {
      expect(strategy.validatePaymentDetails({ email: "user@example.com" })).toBe(true);
    });

    it("should reject invalid email", () => {
      expect(strategy.validatePaymentDetails({ email: "not-an-email" })).toBe(false);
    });

    it("should reject missing email", () => {
      expect(strategy.validatePaymentDetails({})).toBe(false);
    });
  });

  describe("getTransactionFee", () => {
    it("should calculate 3.49% + $0.49 fee", () => {
      const fee = strategy.getTransactionFee(100);
      expect(fee).toBe(3.98);
    });
  });
});
