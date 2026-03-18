import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { CartsService } from "../carts.service";
import {
  CART_REPOSITORY,
  PRODUCT_REPOSITORY,
} from "../../ports/injection-tokens";
import { CartRepository } from "../../ports/cart.repository";
import { ProductRepository } from "../../ports/product.repository";

describe("CartsService", () => {
  let service: CartsService;
  let cartRepository: jest.Mocked<CartRepository>;
  let productRepository: jest.Mocked<ProductRepository>;

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
    const mockCartRepo: jest.Mocked<CartRepository> = {
      create: jest.fn(),
      findById: jest.fn(),
      remove: jest.fn(),
      findCartItem: jest.fn(),
      createCartItem: jest.fn(),
      updateCartItemQuantity: jest.fn(),
      removeCartItem: jest.fn(),
    };

    const mockProductRepo: jest.Mocked<ProductRepository> = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartsService,
        { provide: CART_REPOSITORY, useValue: mockCartRepo },
        { provide: PRODUCT_REPOSITORY, useValue: mockProductRepo },
      ],
    }).compile();

    service = module.get<CartsService>(CartsService);
    cartRepository = module.get(CART_REPOSITORY);
    productRepository = module.get(PRODUCT_REPOSITORY);
  });

  describe("create", () => {
    it("should create a new cart", async () => {
      cartRepository.create.mockResolvedValue(mockCart);

      const result = await service.create("user-1");

      expect(result).toEqual(mockCart);
      expect(cartRepository.create).toHaveBeenCalledWith("user-1");
    });
  });

  describe("findById", () => {
    it("should return a cart with items", async () => {
      const cartWithItems = { ...mockCart, items: [mockCartItem] };
      cartRepository.findById.mockResolvedValue(cartWithItems);

      const result = await service.findById("cart-1");

      expect(result).toEqual(cartWithItems);
      expect(result.items).toHaveLength(1);
    });

    it("should throw NotFoundException when cart not found", async () => {
      cartRepository.findById.mockResolvedValue(null);

      await expect(service.findById("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("addItem", () => {
    it("should add a new item to the cart", async () => {
      cartRepository.findById.mockResolvedValue(mockCart);
      productRepository.findById.mockResolvedValue(mockProduct);
      cartRepository.findCartItem.mockResolvedValue(null);
      cartRepository.createCartItem.mockResolvedValue(mockCartItem);

      const result = await service.addItem("cart-1", "product-1", 2);

      expect(result).toEqual(mockCartItem);
      expect(cartRepository.createCartItem).toHaveBeenCalledWith(
        "cart-1",
        "product-1",
        2,
      );
    });

    it("should update quantity when item already exists in cart", async () => {
      const existingItem = { ...mockCartItem, quantity: 1 };
      cartRepository.findById.mockResolvedValue({
        ...mockCart,
        items: [existingItem],
      });
      productRepository.findById.mockResolvedValue(mockProduct);
      cartRepository.findCartItem.mockResolvedValue(existingItem);
      cartRepository.updateCartItemQuantity.mockResolvedValue({
        ...existingItem,
        quantity: 3,
      });

      const result = await service.addItem("cart-1", "product-1", 2);

      expect(result.quantity).toBe(3);
      expect(cartRepository.updateCartItemQuantity).toHaveBeenCalledWith(
        "item-1",
        3,
      );
    });

    it("should throw NotFoundException when product not found", async () => {
      cartRepository.findById.mockResolvedValue(mockCart);
      productRepository.findById.mockResolvedValue(null);

      await expect(service.addItem("cart-1", "nonexistent", 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw BadRequestException when insufficient stock", async () => {
      cartRepository.findById.mockResolvedValue(mockCart);
      productRepository.findById.mockResolvedValue({
        ...mockProduct,
        stock: 0,
      });

      await expect(service.addItem("cart-1", "product-1", 5)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw BadRequestException when cart is not active", async () => {
      cartRepository.findById.mockResolvedValue({
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
      cartRepository.findById.mockResolvedValue({
        ...mockCart,
        items: [mockCartItem],
      });
      cartRepository.removeCartItem.mockResolvedValue(mockCartItem);

      const result = await service.removeItem("cart-1", "item-1");

      expect(result).toEqual(mockCartItem);
      expect(cartRepository.removeCartItem).toHaveBeenCalledWith("item-1");
    });

    it("should throw NotFoundException when item not found", async () => {
      cartRepository.findById.mockResolvedValue(mockCart);

      await expect(service.removeItem("cart-1", "nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw BadRequestException when cart is not active", async () => {
      cartRepository.findById.mockResolvedValue({
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
      cartRepository.findById.mockResolvedValue(mockCart);
      cartRepository.remove.mockResolvedValue(mockCart);

      const result = await service.remove("cart-1");

      expect(result).toEqual(mockCart);
      expect(cartRepository.remove).toHaveBeenCalledWith("cart-1");
    });

    it("should throw NotFoundException when cart not found", async () => {
      cartRepository.findById.mockResolvedValue(null);

      await expect(service.remove("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
