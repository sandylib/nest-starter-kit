export interface Invoice {
  id: string;
  orderId: string;
  invoiceNo: string;
  totalAmount: number;
  issuedAt: Date;
}
