import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CheckoutService } from "../checkout.service";
import { PrismaAdapter } from "../../../infrastructure/adapters/prisma.adapter";
import { LoggerProvider } from "../../../infrastructure/logging/logger.provider";
import { PaymentStrategyRegistry } from "../../strategies/payment-strategy.registry";
import { PaymentMethod } from "../../strategies/payment.strategy";

describe("CheckoutService", () => {
  let service: CheckoutService;
  let mockTx: any;
  let mockPrisma: any;
  let mockRegistry: any;

  const mockProduct = {
    id: "product-1",
    name: "Test Product",
    price: 29.99,
    stock: 10,
  };

  const mockCart = {
    id: "cart-1",
    userId: "user-1",
    status: "active",
    items: [
      {
        id: "item-1",
        cartId: "cart-1",
        productId: "product-1",
        quantity: 2,
        product: mockProduct,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  };

  const mockOrder = {
    id: "order-1",
    userId: "user-1",
    cartId: "cart-1",
    status: "confirmed",
    totalAmount: 59.98,
    items: [
      {
        id: "order-item-1",
        orderId: "order-1",
        productId: "product-1",
        quantity: 2,
        unitPrice: 29.99,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockInvoice = {
    id: "invoice-1",
    orderId: "order-1",
    invoiceNo: "INV-20260406-ABC123",
    totalAmount: 59.98,
    issuedAt: new Date(),
  };

  const mockPaymentResult = {
    transactionId: "txn-123",
    status: "completed" as const,
    method: PaymentMethod.CREDIT_CARD,
    amount: 59.98,
    currency: "USD",
    processedAt: new Date(),
  };

  const mockPaymentRecord = {
    transactionId: "txn-123",
    cartId: "cart-1",
    userId: "user-1",
    method: "credit_card",
    status: "completed",
    amount: 59.98,
    currency: "USD",
    fee: 1.92,
    processedAt: new Date(),
    metadata: { provider: "stripe" },
  };

  beforeEach(async () => {
    mockTx = {
      cart: {
        findUnique: jest.fn().mockResolvedValue(mockCart),
        update: jest.fn().mockResolvedValue({ ...mockCart, status: "completed" }),
      },
      product: {
        update: jest.fn().mockResolvedValue({ ...mockProduct, stock: 8 }),
      },
      order: {
        create: jest.fn().mockResolvedValue(mockOrder),
      },
      invoice: {
        create: jest.fn().mockResolvedValue(mockInvoice),
      },
    };

    mockPrisma = {
      $transaction: jest.fn((callback: (tx: any) => Promise<any>) =>
        callback(mockTx),
      ),
    };

    const mockStrategy = {
      method: PaymentMethod.CREDIT_CARD,
      validatePaymentDetails: jest.fn().mockReturnValue(true),
      processPayment: jest.fn().mockResolvedValue(mockPaymentResult),
      getTransactionFee: jest.fn().mockReturnValue(1.92),
    };

    const mockFactory = {
      method: PaymentMethod.CREDIT_CARD,
      buildTransactionRecord: jest.fn().mockReturnValue(mockPaymentRecord),
    };

    mockRegistry = {
      resolve: jest.fn().mockReturnValue(mockStrategy),
      resolveFactory: jest.fn().mockReturnValue(mockFactory),
    };

    const mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        { provide: PrismaAdapter, useValue: mockPrisma },
        { provide: PaymentStrategyRegistry, useValue: mockRegistry },
        { provide: LoggerProvider, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<CheckoutService>(CheckoutService);
  });

  describe("processCheckout", () => {
    it("should complete checkout with order, invoice, and payment", async () => {
      const result = await service.processCheckout(
        "user-1",
        "cart-1",
        PaymentMethod.CREDIT_CARD,
        "USD",
      );

      expect(result.order.id).toBe("order-1");
      expect(result.order.totalAmount).toBe(59.98);
      expect(result.invoice.invoiceNo).toBe("INV-20260406-ABC123");
      expect(result.payment.transactionId).toBe("txn-123");
    });

    it("should deduct stock for each cart item inside the transaction", async () => {
      await service.processCheckout(
        "user-1",
        "cart-1",
        PaymentMethod.CREDIT_CARD,
        "USD",
      );

      expect(mockTx.product.update).toHaveBeenCalledWith({
        where: { id: "product-1" },
        data: { stock: { decrement: 2 } },
      });
    });

    it("should mark cart as completed inside the transaction", async () => {
      await service.processCheckout(
        "user-1",
        "cart-1",
        PaymentMethod.CREDIT_CARD,
        "USD",
      );

      expect(mockTx.cart.update).toHaveBeenCalledWith({
        where: { id: "cart-1" },
        data: { status: "completed" },
      });
    });

    it("should create order with correct items", async () => {
      await service.processCheckout(
        "user-1",
        "cart-1",
        PaymentMethod.CREDIT_CARD,
        "USD",
      );

      expect(mockTx.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "user-1",
            cartId: "cart-1",
            items: {
              create: [
                expect.objectContaining({
                  productId: "product-1",
                  quantity: 2,
                }),
              ],
            },
          }),
        }),
      );
    });

    it("should throw NotFoundException when cart does not exist", async () => {
      mockTx.cart.findUnique.mockResolvedValue(null);

      await expect(
        service.processCheckout(
          "user-1",
          "nonexistent",
          PaymentMethod.CREDIT_CARD,
          "USD",
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException when cart is not active", async () => {
      mockTx.cart.findUnique.mockResolvedValue({
        ...mockCart,
        status: "completed",
      });

      await expect(
        service.processCheckout(
          "user-1",
          "cart-1",
          PaymentMethod.CREDIT_CARD,
          "USD",
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when cart is empty", async () => {
      mockTx.cart.findUnique.mockResolvedValue({
        ...mockCart,
        items: [],
      });

      await expect(
        service.processCheckout(
          "user-1",
          "cart-1",
          PaymentMethod.CREDIT_CARD,
          "USD",
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when stock is insufficient", async () => {
      mockTx.cart.findUnique.mockResolvedValue({
        ...mockCart,
        items: [
          {
            ...mockCart.items[0],
            quantity: 100,
          },
        ],
      });

      await expect(
        service.processCheckout(
          "user-1",
          "cart-1",
          PaymentMethod.CREDIT_CARD,
          "USD",
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException for invalid payment details", async () => {
      const strategy = mockRegistry.resolve(PaymentMethod.CREDIT_CARD);
      strategy.validatePaymentDetails.mockReturnValue(false);

      await expect(
        service.processCheckout(
          "user-1",
          "cart-1",
          PaymentMethod.CREDIT_CARD,
          "USD",
          { invalid: true },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("should roll back all changes if any transaction step fails", async () => {
      mockTx.order.create.mockRejectedValue(new Error("DB write failed"));

      await expect(
        service.processCheckout(
          "user-1",
          "cart-1",
          PaymentMethod.CREDIT_CARD,
          "USD",
        ),
      ).rejects.toThrow("DB write failed");
    });
  });
});
