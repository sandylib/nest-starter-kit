import { Test, TestingModule } from "@nestjs/testing";
import { ProductsController } from "../products/products.controller";
import { ProductsService } from "../../../../application/use-cases/products.service";

describe("ProductsController", () => {
  let controller: ProductsController;
  let service: jest.Mocked<ProductsService>;

  const mockProduct = {
    id: "test-uuid",
    name: "Test Product",
    description: "A test product",
    price: 29.99,
    stock: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: mockService }],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get(ProductsService);
  });

  describe("findAll", () => {
    it("should return all products", async () => {
      service.findAll.mockResolvedValue([mockProduct]);

      const result = await controller.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("test-uuid");
    });
  });

  describe("findById", () => {
    it("should return a product by ID", async () => {
      service.findById.mockResolvedValue(mockProduct);

      const result = await controller.findById("test-uuid");

      expect(result.id).toBe("test-uuid");
      expect(service.findById).toHaveBeenCalledWith("test-uuid");
    });
  });

  describe("create", () => {
    it("should create a product", async () => {
      const createDto = { name: "New Product", price: 19.99 };
      service.create.mockResolvedValue({ ...mockProduct, ...createDto });

      const result = await controller.create(createDto);

      expect(result.name).toBe("New Product");
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe("update", () => {
    it("should update a product", async () => {
      const updateDto = { name: "Updated Product" };
      service.update.mockResolvedValue({ ...mockProduct, ...updateDto });

      const result = await controller.update("test-uuid", updateDto);

      expect(result.name).toBe("Updated Product");
      expect(service.update).toHaveBeenCalledWith("test-uuid", updateDto);
    });
  });

  describe("remove", () => {
    it("should delete a product", async () => {
      service.remove.mockResolvedValue(mockProduct);

      await controller.remove("test-uuid");

      expect(service.remove).toHaveBeenCalledWith("test-uuid");
    });
  });
});
