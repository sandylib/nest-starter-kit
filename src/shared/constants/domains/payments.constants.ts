export const PAYMENTS = {
  ROUTES: {
    BASE: "payments",
    TAG: "payments",
    CHECKOUT: "checkout",
    METHODS: "methods",
  },
  DOCS: {
    CHECKOUT: {
      OPERATION: "Process payment for a cart",
      RESPONSE: "Payment processed successfully",
    },
    METHODS: {
      OPERATION: "Get supported payment methods",
      RESPONSE: "Returns list of supported payment methods",
    },
  },
} as const;
