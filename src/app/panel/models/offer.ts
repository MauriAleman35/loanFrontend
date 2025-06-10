export interface Borrower {
  id: string;
  name: string;
  lastName: string;
  email: string;
  score: number;
}

export interface Solicitude {
  id: string;
  loanAmount: number;
  status: string;
  createdAt?: string;
  borrower: Borrower;
}

export interface PartnerOffer {
  id: string;
  interest: number;
  loanTerm: number;
  monthlyPayment: number;
  totalRepaymentAmount: number;
  status: string;
  createdAt?: string;
  solicitude: Solicitude;
}

export type OfferStatus = 'todas' | 'aceptada' | 'rechazada' | 'pendiente';

export interface OfferFilters {
  status: OfferStatus;
  searchTerm: string;
  dateFrom?: Date;
  dateTo?: Date;
}