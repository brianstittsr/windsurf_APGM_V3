export interface InvoiceData {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  serviceName: string;
  servicePrice: number;
  tax: number;
  processingFee: number;
  total: number;
  depositPaid: number;
  remainingBalance: number;
  appointmentDate: string;
  appointmentTime: string;
  businessName: string;
  businessPhone: string;
  businessEmail: string;
  businessAddress?: string;
  paymentIntentId: string;
}
