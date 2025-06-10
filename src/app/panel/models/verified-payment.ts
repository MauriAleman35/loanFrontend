export interface VerifiedPayment {
  id: string;
  dueDate: string;
  paymentStatus: string;
  borrowVerified: boolean;
  partnerVerified: boolean;
  comprobantFile: string;
  loan: {
    id: string;
    loanAmount: number;
    currentStatus: string;
    offer: {
      loanTerm: number;
    };
  };
}

export interface PaymentFilters {
  status: string;
  loanId: string;
  searchTerm: string;
  dateFrom?: Date;
  dateTo?: Date;
}