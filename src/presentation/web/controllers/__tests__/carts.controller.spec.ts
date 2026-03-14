import { Test, TestingModule } from "@nestjs/testing";
import { CartsController } from "../carts/carts.controller";
import { CartsService } from "../../../../application/use-cases/carts.service";

describe("CartsController", () => {
  let controller: CartsController;
  let service: jest.Mocked<CartsService>;

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
    product: {
      id: "product-1",
      name: "Test Product",
      description: "A test",
      price: 29.99,
      stock: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findById: jest.fn(),
      addItem: jest.fn(),
      removeItem: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartsController],
      providers: [{ provide: CartsService, useValue: mockService }],
    }).compile();

    controller = module.get<CartsController>(CartsController);
    service = module.get(CartsService);
  });

  describe("create", () => {
    it("should create a new cart", async () => {
      service.create.mockResolvedValue(mockCart);

      const result = await controller.create("user-1");

      expect(result.id).toBe("cart-1");
      expect(service.create).toHaveBeenCalledWith("user-1");
    });
  });

  describe("findById", () => {
    it("should return a cart with items", async () => {
      service.findById.mockResolvedValue({
        ...mockCart,
        items: [mockCartItem],
      });

      const result = await controller.findById("cart-1");

      expect(result.id).toBe("cart-1");
      expect(result.items).toHaveLength(1);
    });
  });

  describe("addItem", () => {
    it("should add an item to the cart", async () => {
      service.addItem.mockResolvedValue(mockCartItem);

      const result = await controller.addItem("cart-1", {
        productId: "product-1",
        quantity: 2,
      });

      expect(result.id).toBe("item-1");
      expect(service.addItem).toHaveBeenCalledWith("cart-1", "product-1", 2);
    });
  });

  describe("removeItem", () => {
    it("should remove an item from the cart", async () => {
      service.removeItem.mockResolvedValue(mockCartItem);

      await controller.removeItem("cart-1", "item-1");

      expect(service.removeItem).toHaveBeenCalledWith("cart-1", "item-1");
    });
  });

  describe("remove", () => {
    it("should delete a cart", async () => {
      service.remove.mockResolvedValue(mockCart);

      await controller.remove("cart-1");

      expect(service.remove).toHaveBeenCalledWith("cart-1");
    });
  });
});
