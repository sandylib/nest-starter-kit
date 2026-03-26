export const BUSINESS_ERROR_MESSAGES = {
  RESOURCE_NOT_FOUND: "Requested resource not found",
  OPERATION_NOT_ALLOWED: "Operation not allowed for current state",
  DUPLICATE_ENTRY: "Resource already exists",
  QUOTA_EXCEEDED: "Usage quota exceeded",
  INSUFFICIENT_STOCK: "Insufficient stock for requested quantity",
  CART_NOT_ACTIVE: "Cart is no longer active",
  PRODUCT_NOT_FOUND: "Product not found",
  CART_ITEM_NOT_FOUND: "Cart item not found",
  UNSUPPORTED_PAYMENT_METHOD: "Unsupported payment method",
  INVALID_PAYMENT_DETAILS: "Invalid payment details for the selected method",
  PAYMENT_PROCESSING_FAILED: "Payment processing failed",
} as const;
