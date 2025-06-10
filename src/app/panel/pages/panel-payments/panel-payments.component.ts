import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { Payment } from '../../models/payment';
import { PanelService } from '../../services/panel.service';
import { PaymentVerificationDialogComponent } from '../../components/payment-verification-dialog/payment-verification-dialog.component';
import { PaymentDetailDialogComponent } from '../../components/payment-detail-dialog/payment-detail-dialog.component';

interface LoanGroup {
  loanId: string;
  loanAmount: number;
  totalCuotas: number;
  payments: Payment[];
}

@Component({
  selector: 'app-panel-payments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './panel-payments.component.html'
})
export class PanelPaymentsComponent implements OnInit {
  // Datos
  allPayments: Payment[] = [];
  pendingVerificationPayments: Payment[] = []; // borrowVerified = true, partnerVerified = false
  pendingPayments: Payment[] = []; // borrowVerified = false
  verifiedPayments: Payment[] = []; // borrowVerified = true, partnerVerified = true
  loanGroups: LoanGroup[] = [];
  
  // Filtrado
  availableLoans: { id: string, loanAmount: number }[] = [];
  selectedLoanId: string = '';
  
  // Estado
  isLoading: boolean = true;
  error: string | null = null;
  
  // Configuración de tabla
  displayedColumnsVerify: string[] = ['loan', 'cuota', 'id', 'fecha', 'estado', 'comprobante', 'acciones'];
  displayedColumnsVerified: string[] = ['loan', 'cuota', 'id', 'fecha', 'comprobante', 'acciones']; 
  
  @ViewChild('verifiedPaginator') verifiedPaginator!: MatPaginator;
  @ViewChild('verifiedSort') verifiedSort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  constructor(
    private panelService: PanelService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.loadPayments();
  }
  
  loadPayments(): void {
    this.isLoading = true;
    this.error = null;
    
    console.log('Iniciando carga de pagos...');
    
    // Cargar pagos pendientes y por verificar
    this.panelService.getPaymentsToVerify().subscribe({
      next: (data) => {
        console.log('Pagos recibidos en componente:', data);
        this.allPayments = data;
        this.extractAvailableLoans();
        this.filterPayments();
        
        // Cargar pagos verificados
        this.loadVerifiedPayments();
      },
      error: (err) => {
        console.error('Error al cargar pagos:', err);
        this.error = `Error al cargar los pagos: ${err.message}`;
        this.isLoading = false;
      }
    });
  }
  
  loadVerifiedPayments(): void {
    this.panelService.getVerifiedPayments().subscribe({
      next: (data) => {
        console.log('Pagos verificados recibidos:', data);
        this.verifiedPayments = data;
        
        // Actualizar loans disponibles con los de pagos verificados
        this.updateAvailableLoansFromVerified();
        
        // Aplicar filtro también a pagos verificados
        if (this.selectedLoanId) {
          this.verifiedPayments = this.verifiedPayments.filter(
            payment => payment.loan.id === this.selectedLoanId
          );
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar pagos verificados:', err);
        this.error = `Error al cargar los pagos verificados: ${err.message}`;
        this.isLoading = false;
      }
    });
  }
  
  // Actualiza la lista de préstamos disponibles añadiendo los de pagos verificados
  updateAvailableLoansFromVerified(): void {
    const existingLoanIds = new Set(this.availableLoans.map(loan => loan.id));
    
    this.verifiedPayments.forEach(payment => {
      const loanId = payment.loan.id;
      if (!existingLoanIds.has(loanId)) {
        existingLoanIds.add(loanId);
        this.availableLoans.push({
          id: loanId,
          loanAmount: payment.loan.loanAmount
        });
      }
    });
    
    // Ordenar por ID
    this.availableLoans.sort((a, b) => a.id.localeCompare(b.id));
  }
  
  // Procesa los pagos y asigna números de cuota
  processPayments(payments: Payment[]): Payment[] {
    // Agrupar por préstamo
    const paymentsByLoan = new Map<string, Payment[]>();
    
    payments.forEach(payment => {
      const loanId = payment.loan.id;
      if (!paymentsByLoan.has(loanId)) {
        paymentsByLoan.set(loanId, []);
      }
      paymentsByLoan.get(loanId)?.push(payment);
    });
    
    // Ordenar y asignar número de cuota para cada préstamo
    const processedPayments: Payment[] = [];
    
    paymentsByLoan.forEach((loanPayments, loanId) => {
      // Ordenar por fecha
      loanPayments.sort((a, b) => 
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );
      
      // Asignar número de cuota
      loanPayments.forEach((payment, index) => {
        processedPayments.push({
          ...payment,
          cuotaNumber: index + 1,
          totalCuotas: payment.loan.offer.loanTerm
        });
      });
    });
    
    return processedPayments;
  }
  
  // Extrae la lista de préstamos disponibles para el filtro
  extractAvailableLoans(): void {
    const loansMap = new Map<string, number>();
    
    this.allPayments.forEach(payment => {
      loansMap.set(payment.loan.id, payment.loan.loanAmount);
    });
    
    this.availableLoans = Array.from(loansMap.entries()).map(([id, loanAmount]) => ({
      id,
      loanAmount
    }));
  }
  
  // Filtra los pagos según el ID del préstamo seleccionado
  filterPayments(): void {
    // Filtra primero por estado de verificación
    this.pendingVerificationPayments = this.allPayments.filter(payment => 
      payment.borrowVerified === true && payment.partnerVerified === false
    );
    
    this.pendingPayments = this.allPayments.filter(payment => 
      payment.borrowVerified === false
    );
    
    // Luego aplica el filtro por ID de préstamo si está seleccionado
    if (this.selectedLoanId) {
      this.pendingVerificationPayments = this.pendingVerificationPayments.filter(
        payment => payment.loan.id === this.selectedLoanId
      );
      
      this.pendingPayments = this.pendingPayments.filter(
        payment => payment.loan.id === this.selectedLoanId
      );
      
      // También aplicar a pagos verificados si ya están cargados
      if (this.verifiedPayments.length > 0) {
        this.verifiedPayments = this.verifiedPayments.filter(
          payment => payment.loan.id === this.selectedLoanId
        );
      }
    }
    
    // Genera grupos de préstamo para la pestaña de pendientes
    this.createLoanGroups();
  }
  
  // Crear grupos de préstamos para mostrarlos agrupados
  createLoanGroups(): void {
    // Agrupar por préstamo
    const groupsMap = new Map<string, LoanGroup>();
    
    this.pendingPayments.forEach(payment => {
      const loanId = payment.loan.id;
      
      if (!groupsMap.has(loanId)) {
        groupsMap.set(loanId, {
          loanId,
          loanAmount: payment.loan.loanAmount,
          totalCuotas: payment.loan.offer.loanTerm,
          payments: []
        });
      }
      
      groupsMap.get(loanId)?.payments.push(payment);
    });
    
    // Convertir a array y ordenar los pagos en cada grupo
    this.loanGroups = Array.from(groupsMap.values()).map(group => {
      // Ordenar pagos por número de cuota
      group.payments.sort((a, b) => 
        (a.cuotaNumber || 0) - (b.cuotaNumber || 0)
      );
      return group;
    });
    
    // Ordenar grupos por ID de préstamo
    this.loanGroups.sort((a, b) => {
      if (a.loanId < b.loanId) return -1;
      if (a.loanId > b.loanId) return 1;
      return 0;
    });
  }
  
  // Limpiar el filtro de préstamo
  clearFilter(): void {
    this.selectedLoanId = '';
    this.filterPayments();
    
    // También resetear los pagos verificados al estado original
    if (this.verifiedPayments.length > 0) {
      this.loadVerifiedPayments();
    }
  }
  
  // Formatear fecha
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  // Calcular días restantes hasta el vencimiento
  getRemainingDays(dateString: string): number {
    const today = new Date();
    const due = new Date(dateString);
    
    // Normalizar las fechas
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  // Texto para días restantes
  getRemainingDaysText(dateString: string): string {
    const days = this.getRemainingDays(dateString);
    
    if (days < 0) {
      return `Vencido hace ${Math.abs(days)} días`;
    } else if (days === 0) {
      return 'Vence hoy';
    } else if (days === 1) {
      return 'Vence mañana';
    } else {
      return `Vence en ${days} días`;
    }
  }
  
  // Clase CSS para días restantes
  getRemainingDaysClass(dateString: string): string {
    const days = this.getRemainingDays(dateString);
    
    if (days < 0) {
      return 'bg-red-100 text-red-800';
    } else if (days <= 3) {
      return 'bg-amber-100 text-amber-800';
    } else {
      return 'bg-green-100 text-green-800';
    }
  }
  
  // Obtener clase CSS para el estado del pago
  getStatusClass(payment: Payment): string {
    if (payment.partnerVerified) {
      return 'bg-green-100 text-green-800';
    } else if (payment.borrowVerified && payment.comprobantFile !== 'pendiente') {
      return 'bg-blue-100 text-blue-800';
    } else if (payment.borrowVerified) {
      return 'bg-amber-100 text-amber-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  }
  
  // Obtener texto para el estado del pago
  getStatusText(payment: Payment): string {
    if (payment.partnerVerified) {
      return 'Verificado';
    } else if (payment.borrowVerified && payment.comprobantFile !== 'pendiente') {
      return 'Pendiente de verificación';
    } else if (payment.borrowVerified) {
      return 'Esperando comprobante';
    } else {
      return 'Pendiente de pago';
    }
  }
  
  // Abrir el diálogo de verificación
  openVerificationDialog(payment: Payment): void {
    if (payment.comprobantFile === 'pendiente') return;
    
    const dialogRef = this.dialog.open(PaymentVerificationDialogComponent, {
      width: '600px',
      data: { payment }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result?.verified !== undefined) {
        this.verifyPayment(payment.id, result.verified);
      }
    });
  }
  
  // Abrir el diálogo de detalles para un pago verificado
  viewPaymentDetails(payment: Payment): void {
    this.dialog.open(PaymentDetailDialogComponent, {
      width: '600px',
      data: { payment }
    });
  }
  
  // Verificar un pago
  verifyPayment(id: string, verified: boolean): void {
    this.panelService.verifyPayment(id, verified).subscribe({
      next: () => {
        this.snackBar.open(
          verified ? 'Pago verificado correctamente' : 'Pago rechazado',
          'Cerrar',
          { duration: 3000 }
        );
        this.loadPayments();
      },
      error: (err) => {
        this.snackBar.open(
          `Error al procesar el pago: ${err.message}`,
          'Cerrar',
          { duration: 5000 }
        );
      }
    });
  }
}