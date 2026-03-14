export const CARTS = {
  ROUTES: {
    BASE: "carts",
    TAG: "carts",
    PARAMS: {
      ID: ":id",
      ITEM_ID: ":itemId",
    },
    ITEMS: "items",
  },
  DOCS: {
    CREATE: {
      OPERATION: "Create a new cart",
      RESPONSE: "Cart created successfully",
    },
    GET: {
      OPERATION: "Get cart by ID with items",
      RESPONSE: "Returns the cart with all its items",
    },
    ADD_ITEM: {
      OPERATION: "Add an item to the cart",
      RESPONSE: "Item added to cart successfully",
    },
    REMOVE_ITEM: {
      OPERATION: "Remove an item from the cart",
      RESPONSE: "Item removed from cart successfully",
    },
    DELETE: {
      OPERATION: "Delete a cart",
      RESPONSE: "Cart deleted successfully",
    },
  },
  STATUS: {
    ACTIVE: "active",
    COMPLETED: "completed",
    ABANDONED: "abandoned",
  },
} as const;
