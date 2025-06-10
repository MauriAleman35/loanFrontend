// src/app/models/loan.model.ts
// Importamos los tipos compartidos para evitar duplicación

import { Borrower } from "./solicitude";


export interface Solicitude {
  borrower: Borrower;
}

export interface Offer {
  interest: number;
  loanTerm: number;
  solicitude: Solicitude;
}

export interface Loan {
  id: string;
  loanAmount: number;
  currentStatus: string;
  startDate: string;
  endDate: string;
  latePaymentCount: number;
  offer: Offer;
}