import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { ProductsService } from "../products.service";
import { PRODUCT_REPOSITORY } from "../../ports/injection-tokens";
import { ProductRepository } from "../../ports/product.repository";

describe("ProductsService", () => {
  let service: ProductsService;
  let productRepository: jest.Mocked<ProductRepository>;

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
    const mockRepository: jest.Mocked<ProductRepository> = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PRODUCT_REPOSITORY, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get(PRODUCT_REPOSITORY);
  });

  describe("findAll", () => {
    it("should return all products from the repository", async () => {
      productRepository.findAll.mockResolvedValue([mockProduct]);

      const result = await service.findAll();

      expect(result).toEqual([mockProduct]);
      expect(productRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no products exist", async () => {
      productRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe("findById", () => {
    it("should return a product by ID", async () => {
      productRepository.findById.mockResolvedValue(mockProduct);

      const result = await service.findById("test-uuid");

      expect(result).toEqual(mockProduct);
      expect(productRepository.findById).toHaveBeenCalledWith("test-uuid");
    });

    it("should throw NotFoundException when product not found", async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(service.findById("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("create", () => {
    it("should create a product", async () => {
      const createData = {
        name: "New Product",
        description: "A new product",
        price: 19.99,
        stock: 5,
      };

      productRepository.create.mockResolvedValue({
        ...mockProduct,
        ...createData,
      });

      const result = await service.create(createData);

      expect(result.name).toBe(createData.name);
      expect(productRepository.create).toHaveBeenCalledWith(createData);
    });
  });

  describe("update", () => {
    it("should update a product", async () => {
      const updateData = { name: "Updated Product" };
      productRepository.findById.mockResolvedValue(mockProduct);
      productRepository.update.mockResolvedValue({
        ...mockProduct,
        ...updateData,
      });

      const result = await service.update("test-uuid", updateData);

      expect(result.name).toBe("Updated Product");
      expect(productRepository.update).toHaveBeenCalledWith(
        "test-uuid",
        updateData,
      );
    });

    it("should throw NotFoundException when product not found", async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(
        service.update("nonexistent", { name: "Test" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should delete a product", async () => {
      productRepository.findById.mockResolvedValue(mockProduct);
      productRepository.remove.mockResolvedValue(mockProduct);

      const result = await service.remove("test-uuid");

      expect(result).toEqual(mockProduct);
      expect(productRepository.remove).toHaveBeenCalledWith("test-uuid");
    });

    it("should throw NotFoundException when product not found", async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(service.remove("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
