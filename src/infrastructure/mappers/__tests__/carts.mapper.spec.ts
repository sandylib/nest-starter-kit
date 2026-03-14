import { toCartDto, toCartItemDto } from "../carts.mapper";

describe("CartsMapper", () => {
  const now = new Date();

  const mockProduct = {
    id: "product-1",
    name: "Test Product",
    description: "A test product",
    price: 29.99,
    stock: 10,
    createdAt: now,
    updatedAt: now,
  };

  const mockCartItem = {
    id: "item-1",
    cartId: "cart-1",
    productId: "product-1",
    quantity: 2,
    product: mockProduct,
    createdAt: now,
    updatedAt: now,
  };

  const mockCart = {
    id: "cart-1",
    userId: "user-1",
    status: "active",
    items: [mockCartItem],
    createdAt: now,
    updatedAt: now,
  };

  describe("toCartItemDto", () => {
    it("should map a cart item to a response DTO", () => {
      const result = toCartItemDto(mockCartItem);

      expect(result).toEqual({
        id: "item-1",
        cartId: "cart-1",
        productId: "product-1",
        quantity: 2,
        product: expect.objectContaining({ id: "product-1" }),
        createdAt: now,
        updatedAt: now,
      });
    });

    it("should handle cart item without product", () => {
      const itemWithoutProduct = { ...mockCartItem, product: undefined };
      const result = toCartItemDto(itemWithoutProduct);

      expect(result.product).toBeUndefined();
    });
  });

  describe("toCartDto", () => {
    it("should map a cart to a response DTO", () => {
      const result = toCartDto(mockCart);

      expect(result.id).toBe("cart-1");
      expect(result.userId).toBe("user-1");
      expect(result.status).toBe("active");
      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe("item-1");
    });

    it("should handle cart with no items", () => {
      const emptyCart = { ...mockCart, items: [] };
      const result = toCartDto(emptyCart);

      expect(result.items).toEqual([]);
    });

    it("should handle cart with undefined items", () => {
      const cartNoItems = { ...mockCart, items: undefined };
      const result = toCartDto(cartNoItems);

      expect(result.items).toEqual([]);
    });
  });
});
