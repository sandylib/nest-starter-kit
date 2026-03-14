export const PRODUCTS = {
  ROUTES: {
    BASE: "products",
    TAG: "products",
    PARAMS: {
      ID: ":id",
    },
  },
  DOCS: {
    LIST: {
      OPERATION: "List all products",
      RESPONSE: "Returns a list of all products",
    },
    GET: {
      OPERATION: "Get product by ID",
      RESPONSE: "Returns the product details",
    },
    CREATE: {
      OPERATION: "Create a new product",
      RESPONSE: "Product created successfully",
    },
    UPDATE: {
      OPERATION: "Update a product",
      RESPONSE: "Product updated successfully",
    },
    DELETE: {
      OPERATION: "Delete a product",
      RESPONSE: "Product deleted successfully",
    },
  },
} as const;
