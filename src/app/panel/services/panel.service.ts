// src/app/services/panel.service.ts
import { Injectable, inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';

import { map } from 'rxjs/operators';
import { decodeJwt } from '../../utils/jwt.utils';
import { Loan,  } from '../models/loan';
import { OfferInput, OfferResult,Solicitude } from '../models/solicitude';
import { Observable } from 'rxjs';
import { Payment, PaymentsResponse, VerifyPaymentResponse } from '../models/payment';
import { PartnerOffer } from '../models/offer';
import { VerifiedPayment } from '../models/verified-payment';
const GET_PAYMENTS_TO_VERIFY = gql`
  query paymentsToVerify($partnerId: ID!) {
    paymentsToVerify(partnerId: $partnerId) {
      id
      dueDate
      paymentStatus
      borrowVerified
      partnerVerified
      comprobantFile
      loan {
        id
        loanAmount
        offer {
          loanTerm
        }
      }
    }
  }
`;


const VERIFY_PAYMENT = gql`
  mutation verifyPayment($id: ID!, $verified: Boolean!) {
    verifyPayment(id: $id, verified: $verified) {
      id
      paymentStatus
      borrowVerified
      partnerVerified
    }
  }
`;
const GET_ACTIVE_LOANS = gql`
  query activeLoansByPartner($userId: ID!) {
    activeLoansByPartner(userId: $userId) {
      id
      loanAmount
      currentStatus
      startDate
      endDate
      latePaymentCount
      offer {
        interest
        loanTerm
        solicitude {
          borrower {
            name
            lastName
            phone
            ci
            score
          }
        }
      }
    }
  }
`;
const GET_AVAILABLE_SOLICITUDES = gql`
  query availableSolicitudes($page: Int, $size: Int, $daysBack: Int) {
    availableSolicitudes(page: $page, size: $size, daysBack: $daysBack) {
      id
      loanAmount
      status
      createdAt
      borrower {
        id
        name
        lastName
        email
        ci
        phone
        adressVerified
        identityVerified
        score
      }
    }
  }
`;

const CREATE_OFFER = gql`
  mutation CreateOffer($input: OfferInput!) {
    createOffer(input: $input) {
      id
      interest
      loanTerm
      monthlyPayment
      totalRepaymentAmount
      status
      createdAt
    }
  }
`;
@Injectable({
  providedIn: 'root'
})
export class PanelService {
  private apollo = inject(Apollo);

  getUserIdFromToken(): number {
    const token = localStorage.getItem('token');
    if (!token) return 0;
    
    const decodedToken = decodeJwt(token);
    return decodedToken?.user_id || 0;
  }

  getActiveLoans(): Observable<Loan[]> {
    const userId = this.getUserIdFromToken();
    
    return this.apollo.watchQuery<{ activeLoansByPartner: Loan[] }>({
      query: GET_ACTIVE_LOANS,
      variables: { userId }
    }).valueChanges.pipe(
      map(result => result.data?.activeLoansByPartner || [])
    );
  }
  getPartnerOffers(): Observable<PartnerOffer[]> {
      const partnerId = this.getUserIdFromToken();
    return this.apollo
      .watchQuery<{ offersByPartner: PartnerOffer[] }>({
        query: gql`
          query GetPartnerOffers($partnerId: ID!) {
            offersByPartner(partnerId: $partnerId) {
              id
              interest
              loanTerm
              monthlyPayment
              totalRepaymentAmount
              status
              createdAt
              solicitude {
                id
                loanAmount
                status
                createdAt
                borrower {
                  id
                  name
                  lastName
                  email
                  score
                }
              }
            }
          }
        `,
        variables: {
          partnerId: partnerId
        },
        fetchPolicy: 'network-only'
      })
      .valueChanges.pipe(map((result) => result.data.offersByPartner));
  }
  // Método corregido para obtener pagos
  getPaymentsToVerify(): Observable<Payment[]> {
  const partnerId = this.getUserIdFromToken();
  console.log('Obteniendo pagos para partnerId:', partnerId);
  
  return this.apollo.watchQuery<{ paymentsToVerify: Payment[] }>({
    query: GET_PAYMENTS_TO_VERIFY,
    variables: { partnerId },
    fetchPolicy: 'network-only',
    errorPolicy: 'all' // Para capturar errores y aún así recibir datos parciales si hay
  }).valueChanges.pipe(
    map(result => {
      console.log('Respuesta GraphQL completa:', result);
      // Si hay errores pero también datos, podemos continuar
      if (result.errors) {
        console.error('Errores GraphQL:', result.errors);
      }
      const payments = result.data?.paymentsToVerify || [];
      console.log('Pagos recibidos:', payments);
      return this.processPayments(payments);
    })
  );
}
 getVerifiedPayments(): Observable<VerifiedPayment[]> {
    const partnerId = this.getUserIdFromToken();
    return this.apollo
      .watchQuery<{ verifiedPaymentsByPartner: VerifiedPayment[] }>({
        query: gql`
          query GetVerifiedPayments($partnerId: ID!) {
            verifiedPaymentsByPartner(partnerId: $partnerId) {
              id
              dueDate
              paymentStatus
              borrowVerified
              partnerVerified
              comprobantFile
              loan {
                id
                loanAmount
                currentStatus
                offer {
                  loanTerm
                }
              }
            }
          }
        `,
        variables: {
          partnerId: partnerId
        },
        fetchPolicy: 'network-only'
      })
      .valueChanges.pipe(map((result) => result.data.verifiedPaymentsByPartner));
  }
   verifyPayment(id: string, verified: boolean): Observable<any> {
    return this.apollo.mutate({
      mutation: VERIFY_PAYMENT,
      variables: { id, verified },
      refetchQueries: [
        { 
          query: GET_PAYMENTS_TO_VERIFY,
          variables: { partnerId: this.getUserIdFromToken() }
        }
      ]
    }).pipe(
      map(result => {
        console.log('Resultado de verificación:', result);
        return result.data;
      })
    );
  }
  private processPayments(payments: Payment[]): Payment[] {
    console.log('Procesando pagos:', payments);
    if (!payments || payments.length === 0) return [];
    
    // Agrupar pagos por ID de préstamo para mejor organización
    const loanGroups = new Map<string, Payment[]>();
    
    // Primero agrupamos por ID de préstamo
    payments.forEach(payment => {
      const loanId = payment.loan.id;
      if (!loanGroups.has(loanId)) {
        loanGroups.set(loanId, []);
      }
      loanGroups.get(loanId)?.push(payment);
    });
    
    // Ordenamos cada grupo por fecha y asignamos números de cuota
    const processedPayments: Payment[] = [];
    
    loanGroups.forEach((groupPayments, loanId) => {
      // Ordenar por fecha de vencimiento
      groupPayments.sort((a, b) => 
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );
      
      // Asignar números de cuota
      groupPayments.forEach((payment, index) => {
        processedPayments.push({
          ...payment,
          cuotaNumber: index + 1,
          totalCuotas: payment.loan.offer.loanTerm
        });
      });
    });
    
    console.log('Pagos procesados:', processedPayments);
    return processedPayments;
  }
   getAvailableSolicitudes(page: number = 0, size: number = 10, daysBack: number = 7): Observable<Solicitude[]> {
    return this.apollo.watchQuery<{ availableSolicitudes: Solicitude[] }>({
      query: GET_AVAILABLE_SOLICITUDES,
      variables: { page, size, daysBack },
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(
      map(result => result.data?.availableSolicitudes || [])
    );
  }

  createOffer(offer: OfferInput): Observable<any> {
    return this.apollo.mutate<{ createOffer: OfferResult }>({
      mutation: CREATE_OFFER,
      variables: { input: offer },
      refetchQueries: [
        { 
          query: GET_AVAILABLE_SOLICITUDES, 
          variables: { page: 0, size: 10, daysBack: 7 } 
        }
      ]
    }).pipe(
      map(result => result.data?.createOffer)
    );
  }

}