import { toProductDto, toProductDtos } from "../products.mapper";

describe("ProductsMapper", () => {
  const now = new Date();

  const mockProduct = {
    id: "test-uuid",
    name: "Test Product",
    description: "A test product",
    price: 29.99,
    stock: 10,
    createdAt: now,
    updatedAt: now,
  };

  describe("toProductDto", () => {
    it("should map a product to a response DTO", () => {
      const result = toProductDto(mockProduct);

      expect(result).toEqual({
        id: "test-uuid",
        name: "Test Product",
        description: "A test product",
        price: 29.99,
        stock: 10,
        createdAt: now,
        updatedAt: now,
      });
    });

    it("should handle Decimal price from Prisma", () => {
      const productWithDecimal = {
        ...mockProduct,
        price: { toNumber: () => 29.99, toString: () => "29.99" },
      };

      const result = toProductDto(productWithDecimal);

      expect(typeof result.price).toBe("number");
    });

    it("should handle null description", () => {
      const result = toProductDto({ ...mockProduct, description: null });

      expect(result.description).toBeNull();
    });
  });

  describe("toProductDtos", () => {
    it("should map an array of products", () => {
      const result = toProductDtos([mockProduct, mockProduct]);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("test-uuid");
    });

    it("should return empty array for empty input", () => {
      const result = toProductDtos([]);

      expect(result).toEqual([]);
    });
  });
});
