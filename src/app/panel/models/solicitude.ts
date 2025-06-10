// src/app/models/solicitude.model.ts
export interface Borrower {
  id: string;
  name: string;
  lastName: string;
  email: string;
  ci: string;
  phone: string;
  adressVerified: boolean;
  identityVerified: boolean;
  score: number;
}

export interface Solicitude {
  id: string;
  loanAmount: number;
  status: string;
  createdAt: string;
  borrower: Borrower;
}

export interface OfferInput {
  partnerId: number;
  interest: number;
  loanTerm: number;
  solicitudeId: number;
}

export interface OfferResult {
  id: string;
  interest: number;
  loanTerm: number;
  monthlyPayment: number;
  totalRepaymentAmount: number;
  status: string;
  createdAt: string;
}