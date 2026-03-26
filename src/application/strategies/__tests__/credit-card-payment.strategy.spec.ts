import { CreditCardPaymentStrategy } from "../credit-card-payment.strategy";
import { PaymentMethod } from "../payment.strategy";

describe("CreditCardPaymentStrategy", () => {
  let strategy: CreditCardPaymentStrategy;

  beforeEach(() => {
    strategy = new CreditCardPaymentStrategy();
  });

  it("should have CREDIT_CARD as its method", () => {
    expect(strategy.method).toBe(PaymentMethod.CREDIT_CARD);
  });

  describe("processPayment", () => {
    it("should return a completed payment result", async () => {
      const result = await strategy.processPayment({
        amount: 100,
        currency: "USD",
        cartId: "cart-1",
        userId: "user-1",
      });

      expect(result.status).toBe("completed");
      expect(result.method).toBe(PaymentMethod.CREDIT_CARD);
      expect(result.currency).toBe("USD");
      expect(result.transactionId).toBeDefined();
      expect(result.processedAt).toBeInstanceOf(Date);
    });

    it("should include the transaction fee in the amount", async () => {
      const result = await strategy.processPayment({
        amount: 100,
        currency: "USD",
        cartId: "cart-1",
        userId: "user-1",
      });

      const expectedFee = strategy.getTransactionFee(100);
      expect(result.amount).toBe(100 + expectedFee);
    });
  });

  describe("validatePaymentDetails", () => {
    it("should accept valid card details", () => {
      const valid = strategy.validatePaymentDetails({
        cardNumber: "4111 1111 1111 1111",
        expiryMonth: 12,
        expiryYear: 2030,
        cvv: "123",
      });
      expect(valid).toBe(true);
    });

    it("should reject missing card number", () => {
      expect(
        strategy.validatePaymentDetails({
          expiryMonth: 12,
          expiryYear: 2030,
          cvv: "123",
        }),
      ).toBe(false);
    });

    it("should reject expired card", () => {
      expect(
        strategy.validatePaymentDetails({
          cardNumber: "4111111111111111",
          expiryMonth: 1,
          expiryYear: 2020,
          cvv: "123",
        }),
      ).toBe(false);
    });

    it("should reject card number that is too short", () => {
      expect(
        strategy.validatePaymentDetails({
          cardNumber: "411111",
          expiryMonth: 12,
          expiryYear: 2030,
          cvv: "123",
        }),
      ).toBe(false);
    });
  });

  describe("getTransactionFee", () => {
    it("should calculate 2.9% + $0.30 fee", () => {
      const fee = strategy.getTransactionFee(100);
      expect(fee).toBe(3.2);
    });

    it("should return $0.30 for zero amount", () => {
      expect(strategy.getTransactionFee(0)).toBe(0.3);
    });
  });
});
