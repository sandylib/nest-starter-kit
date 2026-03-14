import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { CartsService } from "../carts.service";
import { PrismaAdapter } from "../../../infrastructure/adapters/prisma.adapter";
import { LoggerProvider } from "../../../infrastructure/logging/logger.provider";

describe("CartsService", () => {
  let service: CartsService;
  let prisma: jest.Mocked<PrismaAdapter>;

  const mockProduct = {
    id: "product-1",
    name: "Test Product",
    description: "A test product",
    price: 29.99,
    stock: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCart = {
    id: "cart-1",
    userId: "user-1",
    status: "active",
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCartItem = {
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
      product: {
        findUnique: jest.fn(),
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
        CartsService,
        { provide: PrismaAdapter, useValue: mockPrisma },
        { provide: LoggerProvider, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<CartsService>(CartsService);
    prisma = module.get(PrismaAdapter);
  });

  describe("create", () => {
    it("should create a new cart", async () => {
      prisma.cart.create.mockResolvedValue(mockCart);

      const result = await service.create("user-1");

      expect(result).toEqual(mockCart);
      expect(prisma.cart.create).toHaveBeenCalledWith({
        data: { userId: "user-1", status: "active" },
        include: { items: { include: { product: true } } },
      });
    });
  });

  describe("findById", () => {
    it("should return a cart with items", async () => {
      const cartWithItems = { ...mockCart, items: [mockCartItem] };
      prisma.cart.findUnique.mockResolvedValue(cartWithItems);

      const result = await service.findById("cart-1");

      expect(result).toEqual(cartWithItems);
      expect(result.items).toHaveLength(1);
    });

    it("should throw NotFoundException when cart not found", async () => {
      prisma.cart.findUnique.mockResolvedValue(null);

      await expect(service.findById("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("addItem", () => {
    it("should add a new item to the cart", async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart);
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.cartItem.findUnique.mockResolvedValue(null);
      prisma.cartItem.create.mockResolvedValue(mockCartItem);

      const result = await service.addItem("cart-1", "product-1", 2);

      expect(result).toEqual(mockCartItem);
      expect(prisma.cartItem.create).toHaveBeenCalledWith({
        data: { cartId: "cart-1", productId: "product-1", quantity: 2 },
        include: { product: true },
      });
    });

    it("should update quantity when item already exists in cart", async () => {
      const existingItem = { ...mockCartItem, quantity: 1 };
      prisma.cart.findUnique.mockResolvedValue({
        ...mockCart,
        items: [existingItem],
      });
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.cartItem.findUnique.mockResolvedValue(existingItem);
      prisma.cartItem.update.mockResolvedValue({
        ...existingItem,
        quantity: 3,
      });

      const result = await service.addItem("cart-1", "product-1", 2);

      expect(result.quantity).toBe(3);
      expect(prisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: "item-1" },
        data: { quantity: 3 },
        include: { product: true },
      });
    });

    it("should throw NotFoundException when product not found", async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart);
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(service.addItem("cart-1", "nonexistent", 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw BadRequestException when insufficient stock", async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart);
      prisma.product.findUnique.mockResolvedValue({
        ...mockProduct,
        stock: 0,
      });

      await expect(service.addItem("cart-1", "product-1", 5)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw BadRequestException when cart is not active", async () => {
      prisma.cart.findUnique.mockResolvedValue({
        ...mockCart,
        status: "completed",
      });

      await expect(service.addItem("cart-1", "product-1", 1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("removeItem", () => {
    it("should remove an item from the cart", async () => {
      prisma.cart.findUnique.mockResolvedValue({
        ...mockCart,
        items: [mockCartItem],
      });
      prisma.cartItem.delete.mockResolvedValue(mockCartItem);

      const result = await service.removeItem("cart-1", "item-1");

      expect(result).toEqual(mockCartItem);
      expect(prisma.cartItem.delete).toHaveBeenCalledWith({
        where: { id: "item-1" },
      });
    });

    it("should throw NotFoundException when item not found", async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart);

      await expect(service.removeItem("cart-1", "nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw BadRequestException when cart is not active", async () => {
      prisma.cart.findUnique.mockResolvedValue({
        ...mockCart,
        status: "completed",
        items: [mockCartItem],
      });

      await expect(service.removeItem("cart-1", "item-1")).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("remove", () => {
    it("should delete a cart", async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart);
      prisma.cart.delete.mockResolvedValue(mockCart);

      const result = await service.remove("cart-1");

      expect(result).toEqual(mockCart);
      expect(prisma.cart.delete).toHaveBeenCalledWith({
        where: { id: "cart-1" },
      });
    });

    it("should throw NotFoundException when cart not found", async () => {
      prisma.cart.findUnique.mockResolvedValue(null);

      await expect(service.remove("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
