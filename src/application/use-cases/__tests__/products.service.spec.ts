import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { ProductsService } from "../products.service";
import { PrismaAdapter } from "../../../infrastructure/adapters/prisma.adapter";
import { LoggerProvider } from "../../../infrastructure/logging/logger.provider";

describe("ProductsService", () => {
  let service: ProductsService;
  let prisma: jest.Mocked<PrismaAdapter>;

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
    const mockPrisma = {
      product: {
        findMany: jest.fn(),
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
        ProductsService,
        { provide: PrismaAdapter, useValue: mockPrisma },
        { provide: LoggerProvider, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get(PrismaAdapter);
  });

  describe("findAll", () => {
    it("should return all products", async () => {
      prisma.product.findMany.mockResolvedValue([mockProduct]);

      const result = await service.findAll();

      expect(result).toEqual([mockProduct]);
      expect(prisma.product.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("findById", () => {
    it("should return a product by ID", async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findById("test-uuid");

      expect(result).toEqual(mockProduct);
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: "test-uuid" },
      });
    });

    it("should throw NotFoundException when product not found", async () => {
      prisma.product.findUnique.mockResolvedValue(null);

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

      prisma.product.create.mockResolvedValue({
        ...mockProduct,
        ...createData,
      });

      const result = await service.create(createData);

      expect(result.name).toBe(createData.name);
      expect(prisma.product.create).toHaveBeenCalledWith({
        data: createData,
      });
    });

    it("should default stock to 0 when not provided", async () => {
      const createData = { name: "New Product", price: 19.99 };

      prisma.product.create.mockResolvedValue({
        ...mockProduct,
        ...createData,
        stock: 0,
      });

      await service.create(createData);

      expect(prisma.product.create).toHaveBeenCalledWith({
        data: {
          name: "New Product",
          price: 19.99,
          stock: 0,
          description: undefined,
        },
      });
    });
  });

  describe("update", () => {
    it("should update a product", async () => {
      const updateData = { name: "Updated Product" };
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.product.update.mockResolvedValue({
        ...mockProduct,
        ...updateData,
      });

      const result = await service.update("test-uuid", updateData);

      expect(result.name).toBe("Updated Product");
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: "test-uuid" },
        data: updateData,
      });
    });

    it("should throw NotFoundException when product not found", async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(
        service.update("nonexistent", { name: "Test" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should delete a product", async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.product.delete.mockResolvedValue(mockProduct);

      const result = await service.remove("test-uuid");

      expect(result).toEqual(mockProduct);
      expect(prisma.product.delete).toHaveBeenCalledWith({
        where: { id: "test-uuid" },
      });
    });

    it("should throw NotFoundException when product not found", async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(service.remove("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
