import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Payment } from '../../models/payment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-payment-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './payment-detail-dialog.component.html'  
})
export class PaymentDetailDialogComponent {
  safeImageUrl: SafeResourceUrl | null = null;  

  constructor(
    public dialogRef: MatDialogRef<PaymentDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { payment: Payment },
    private sanitizer: DomSanitizer
  ) {
    // Inicializar safeImageUrl con el comprobante si está disponible
    if (data.payment.comprobantFile && data.payment.comprobantFile !== 'pendiente') {
      this.safeImageUrl = this.sanitizer.bypassSecurityTrustResourceUrl(data.payment.comprobantFile);
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  openComprobante(): void {
    if (this.data.payment.comprobantFile && this.data.payment.comprobantFile !== 'pendiente') {
      window.open(this.data.payment.comprobantFile, '_blank');
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}