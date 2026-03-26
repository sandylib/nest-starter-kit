import { BadRequestException } from "@nestjs/common";
import { PaymentStrategyRegistry } from "../payment-strategy.registry";
import { PaymentMethod } from "../payment.strategy";
import { CreditCardPaymentStrategy } from "../credit-card-payment.strategy";
import { PayPalPaymentStrategy } from "../paypal-payment.strategy";
import { BankTransferPaymentStrategy } from "../bank-transfer-payment.strategy";

describe("PaymentStrategyRegistry", () => {
  let registry: PaymentStrategyRegistry;

  beforeEach(() => {
    registry = new PaymentStrategyRegistry();
  });

  describe("resolve", () => {
    it("should resolve CreditCardPaymentStrategy for CREDIT_CARD", () => {
      const strategy = registry.resolve(PaymentMethod.CREDIT_CARD);
      expect(strategy).toBeInstanceOf(CreditCardPaymentStrategy);
      expect(strategy.method).toBe(PaymentMethod.CREDIT_CARD);
    });

    it("should resolve PayPalPaymentStrategy for PAYPAL", () => {
      const strategy = registry.resolve(PaymentMethod.PAYPAL);
      expect(strategy).toBeInstanceOf(PayPalPaymentStrategy);
      expect(strategy.method).toBe(PaymentMethod.PAYPAL);
    });

    it("should resolve BankTransferPaymentStrategy for BANK_TRANSFER", () => {
      const strategy = registry.resolve(PaymentMethod.BANK_TRANSFER);
      expect(strategy).toBeInstanceOf(BankTransferPaymentStrategy);
      expect(strategy.method).toBe(PaymentMethod.BANK_TRANSFER);
    });

    it("should throw BadRequestException for unknown method", () => {
      expect(() => registry.resolve("crypto" as PaymentMethod)).toThrow(
        BadRequestException,
      );
    });
  });

  describe("getSupportedMethods", () => {
    it("should return all three payment methods", () => {
      const methods = registry.getSupportedMethods();
      expect(methods).toHaveLength(3);
      expect(methods).toContain(PaymentMethod.CREDIT_CARD);
      expect(methods).toContain(PaymentMethod.PAYPAL);
      expect(methods).toContain(PaymentMethod.BANK_TRANSFER);
    });
  });
});
