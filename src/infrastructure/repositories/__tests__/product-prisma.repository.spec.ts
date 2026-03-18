import { Test, TestingModule } from "@nestjs/testing";
import { ProductPrismaRepository } from "../product-prisma.repository";
import { PrismaAdapter } from "../../adapters/prisma.adapter";
import { LoggerProvider } from "../../logging/logger.provider";

describe("ProductPrismaRepository", () => {
  let repository: ProductPrismaRepository;
  let prisma: any;
  let logger: jest.Mocked<LoggerProvider>;

  const mockPrismaProduct = {
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
        ProductPrismaRepository,
        { provide: PrismaAdapter, useValue: mockPrisma },
        { provide: LoggerProvider, useValue: mockLogger },
      ],
    }).compile();

    repository = module.get<ProductPrismaRepository>(ProductPrismaRepository);
    prisma = module.get(PrismaAdapter);
    logger = module.get(LoggerProvider);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return all products ordered by createdAt desc", async () => {
      prisma.product.findMany.mockResolvedValue([mockPrismaProduct]);

      const result = await repository.findAll();

      expect(result).toEqual([mockPrismaProduct]);
      expect(prisma.product.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" },
      });
    });

    it("should log before and after the operation", async () => {
      prisma.product.findMany.mockResolvedValue([]);

      await repository.findAll();

      expect(logger.info).toHaveBeenCalledWith(
        "Fetching all products",
        "api",
        expect.any(Object),
      );
      expect(logger.info).toHaveBeenCalledWith(
        "Successfully fetching all products",
        "api",
        expect.objectContaining({
          responseTime: expect.stringMatching(/\d+ms/),
        }),
      );
    });

    it("should log error and rethrow on failure", async () => {
      const error = new Error("DB error");
      prisma.product.findMany.mockRejectedValue(error);

      await expect(repository.findAll()).rejects.toThrow("DB error");
      expect(logger.error).toHaveBeenCalledWith(
        "Failed to fetching all products",
        error,
        "api",
        expect.objectContaining({
          responseTime: expect.stringMatching(/\d+ms/),
        }),
      );
    });
  });

  describe("findById", () => {
    it("should return a product by ID", async () => {
      prisma.product.findUnique.mockResolvedValue(mockPrismaProduct);

      const result = await repository.findById("test-uuid");

      expect(result).toEqual(mockPrismaProduct);
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: "test-uuid" },
      });
    });

    it("should return null when product not found", async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      const result = await repository.findById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create a product with default stock of 0", async () => {
      const createData = { name: "New Product", price: 19.99 };
      prisma.product.create.mockResolvedValue({
        ...mockPrismaProduct,
        ...createData,
        stock: 0,
      });

      const result = await repository.create(createData);

      expect(result.name).toBe("New Product");
      expect(prisma.product.create).toHaveBeenCalledWith({
        data: {
          name: "New Product",
          description: undefined,
          price: 19.99,
          stock: 0,
        },
      });
    });

    it("should create a product with provided stock", async () => {
      const createData = {
        name: "New Product",
        description: "Desc",
        price: 19.99,
        stock: 5,
      };
      prisma.product.create.mockResolvedValue({
        ...mockPrismaProduct,
        ...createData,
      });

      await repository.create(createData);

      expect(prisma.product.create).toHaveBeenCalledWith({
        data: createData,
      });
    });
  });

  describe("update", () => {
    it("should update a product", async () => {
      const updateData = { name: "Updated" };
      prisma.product.update.mockResolvedValue({
        ...mockPrismaProduct,
        ...updateData,
      });

      const result = await repository.update("test-uuid", updateData);

      expect(result.name).toBe("Updated");
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: "test-uuid" },
        data: updateData,
      });
    });
  });

  describe("remove", () => {
    it("should delete a product", async () => {
      prisma.product.delete.mockResolvedValue(mockPrismaProduct);

      const result = await repository.remove("test-uuid");

      expect(result).toEqual(mockPrismaProduct);
      expect(prisma.product.delete).toHaveBeenCalledWith({
        where: { id: "test-uuid" },
      });
    });
  });
});
