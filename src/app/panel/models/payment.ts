// src/app/models/payment.ts
export interface Loan {
  id: string;
  loanAmount: number;
  offer: {
    loanTerm: number;
  };
}

export interface Payment {
  id: string;
  dueDate: string;
  paymentStatus: string;
  borrowVerified: boolean;
  partnerVerified: boolean;
  comprobantFile: string;
  loan: Loan;
  cuotaNumber?: number;  // Calculado en el frontend
  totalCuotas?: number;  // Calculado en el frontend
}

// Estructura corregida para la respuesta
export interface PaymentsResponse {
  paymentsToVerify: Payment[];
}

export interface VerifyPaymentResponse {
  verifyPayment: {
    id: string;
    paymentStatus: string;
    borrowVerified: boolean;
    partnerVerified: boolean;
  };
}

export interface PaymentGroup {
  loanAmount: number;
  term: number;
  payments: Payment[];
}