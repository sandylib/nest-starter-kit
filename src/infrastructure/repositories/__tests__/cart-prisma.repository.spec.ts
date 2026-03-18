import { Test, TestingModule } from "@nestjs/testing";
import { CartPrismaRepository } from "../cart-prisma.repository";
import { PrismaAdapter } from "../../adapters/prisma.adapter";
import { LoggerProvider } from "../../logging/logger.provider";

describe("CartPrismaRepository", () => {
  let repository: CartPrismaRepository;
  let prisma: any;
  let logger: jest.Mocked<LoggerProvider>;

  const mockProduct = {
    id: "product-1",
    name: "Test Product",
    description: "A test product",
    price: 29.99,
    stock: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaCart = {
    id: "cart-1",
    userId: "user-1",
    status: "active",
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaCartItem = {
    id: "item-1",
    cartId: "cart-1",
    productId: "product-1",
    quantity: 2,
    product: mockProduct,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrisma = {
      cart: {
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
      cartItem: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartPrismaRepository,
        { provide: PrismaAdapter, useValue: mockPrisma },
        { provide: LoggerProvider, useValue: mockLogger },
      ],
    }).compile();

    repository = module.get<CartPrismaRepository>(CartPrismaRepository);
    prisma = module.get(PrismaAdapter);
    logger = module.get(LoggerProvider);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a cart with active status and include items", async () => {
      prisma.cart.create.mockResolvedValue(mockPrismaCart);

      const result = await repository.create("user-1");

      expect(result).toEqual(mockPrismaCart);
      expect(prisma.cart.create).toHaveBeenCalledWith({
        data: { userId: "user-1", status: "active" },
        include: expect.objectContaining({
          items: expect.objectContaining({
            include: { product: true },
          }),
        }),
      });
    });
  });

  describe("findById", () => {
    it("should return a cart with items", async () => {
      const cartWithItems = { ...mockPrismaCart, items: [mockPrismaCartItem] };
      prisma.cart.findUnique.mockResolvedValue(cartWithItems);

      const result = await repository.findById("cart-1");

      expect(result).toBeTruthy();
      expect(result!.items).toHaveLength(1);
      expect(result!.items[0].product).toBeTruthy();
    });

    it("should return null when cart not found", async () => {
      prisma.cart.findUnique.mockResolvedValue(null);

      const result = await repository.findById("nonexistent");

      expect(result).toBeNull();
    });

    it("should log the operation", async () => {
      prisma.cart.findUnique.mockResolvedValue(mockPrismaCart);

      await repository.findById("cart-1");

      expect(logger.info).toHaveBeenCalledWith(
        "Fetching cart",
        "api",
        expect.objectContaining({ id: "cart-1" }),
      );
    });
  });

  describe("findCartItem", () => {
    it("should find a cart item by composite key", async () => {
      prisma.cartItem.findUnique.mockResolvedValue(mockPrismaCartItem);

      const result = await repository.findCartItem("cart-1", "product-1");

      expect(result).toBeTruthy();
      expect(prisma.cartItem.findUnique).toHaveBeenCalledWith({
        where: {
          cartId_productId: { cartId: "cart-1", productId: "product-1" },
        },
        include: { product: true },
      });
    });

    it("should return null when cart item not found", async () => {
      prisma.cartItem.findUnique.mockResolvedValue(null);

      const result = await repository.findCartItem("cart-1", "nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("createCartItem", () => {
    it("should create a cart item", async () => {
      prisma.cartItem.create.mockResolvedValue(mockPrismaCartItem);

      const result = await repository.createCartItem("cart-1", "product-1", 2);

      expect(result).toEqual(
        expect.objectContaining({
          cartId: "cart-1",
          productId: "product-1",
          quantity: 2,
        }),
      );
      expect(prisma.cartItem.create).toHaveBeenCalledWith({
        data: { cartId: "cart-1", productId: "product-1", quantity: 2 },
        include: { product: true },
      });
    });
  });

  describe("updateCartItemQuantity", () => {
    it("should update the quantity of a cart item", async () => {
      prisma.cartItem.update.mockResolvedValue({
        ...mockPrismaCartItem,
        quantity: 5,
      });

      const result = await repository.updateCartItemQuantity("item-1", 5);

      expect(result.quantity).toBe(5);
      expect(prisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: "item-1" },
        data: { quantity: 5 },
        include: { product: true },
      });
    });
  });

  describe("removeCartItem", () => {
    it("should delete a cart item", async () => {
      prisma.cartItem.delete.mockResolvedValue(mockPrismaCartItem);

      const result = await repository.removeCartItem("item-1");

      expect(result).toEqual(expect.objectContaining({ id: "item-1" }));
      expect(prisma.cartItem.delete).toHaveBeenCalledWith({
        where: { id: "item-1" },
        include: { product: true },
      });
    });
  });

  describe("remove", () => {
    it("should delete a cart", async () => {
      prisma.cart.delete.mockResolvedValue(mockPrismaCart);

      const result = await repository.remove("cart-1");

      expect(result).toEqual(mockPrismaCart);
    });

    it("should log error and rethrow on failure", async () => {
      const error = new Error("DB error");
      prisma.cart.delete.mockRejectedValue(error);

      await expect(repository.remove("cart-1")).rejects.toThrow("DB error");
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
