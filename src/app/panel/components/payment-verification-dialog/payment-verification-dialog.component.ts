import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Payment } from '../../models/payment';

import { HttpClient } from '@angular/common/http';
import { environmentRest } from '../../../environments/environments';

@Component({
  selector: 'app-payment-verification-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './payment-verification-dialog.component.html'
})
export class PaymentVerificationDialogComponent implements OnInit {
  isImageLoading: boolean = true;
  imageError: boolean = false;
  sanitizedComprobantUrl: SafeUrl = '';
  originalUrl: string = '';
  proxyUrl: string = '';
  
  constructor(
    public dialogRef: MatDialogRef<PaymentVerificationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { payment: Payment },
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {}

  ngOnInit() {
    console.log('Payment data:', this.data.payment);
    if (this.data.payment?.comprobantFile && this.data.payment.comprobantFile !== 'pendiente') {
      // Guardar la URL original para mostrarla o usarla como alternativa
      this.originalUrl = this.data.payment.comprobantFile;
      console.log('URL de comprobante original:', this.originalUrl);
      
      // Usar el proxy de Spring Boot
      this.proxyUrl = `${environmentRest.apiUrl}/api/proxy-image?url=${encodeURIComponent(this.originalUrl)}`;
      console.log('URL de proxy:', this.proxyUrl);
      
      // Verificar que el proxy funciona antes de asignar la URL
      this.verifyProxyEndpoint();
    } else {
      this.imageError = true;
      this.isImageLoading = false;
    }
  }

  verifyProxyEndpoint() {
    // Hacer una petición HEAD para verificar que el endpoint existe
    this.http.get(this.proxyUrl, { responseType: 'blob' }).subscribe({
      next: (response) => {
        console.log('Proxy endpoint funcionando correctamente', response);
        // Crear un blob URL para la imagen
        const blob = new Blob([response], { type: 'image/jpeg' });
        const unsafeImageUrl = URL.createObjectURL(blob);
        this.sanitizedComprobantUrl = this.sanitizer.bypassSecurityTrustUrl(unsafeImageUrl);
        this.isImageLoading = false;
      },
      error: (error) => {
        console.error('Error al verificar el proxy:', error);
        // Si falla el proxy, intentar directamente (probablemente no funcionará por CORS)
        this.sanitizedComprobantUrl = this.sanitizer.bypassSecurityTrustUrl(this.originalUrl);
        this.isImageLoading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  onImageLoad() {
    console.log('Imagen cargada con éxito');
    this.isImageLoading = false;
    this.imageError = false;
  }

  onImageError() {
    console.error('Error al cargar la imagen del comprobante');
    this.isImageLoading = false;
    this.imageError = true;
    
    // Mostrar mensaje de error
    this.snackBar.open('No se pudo cargar la imagen del comprobante', 'Cerrar', {
      duration: 5000
    });
  }

  verifyPayment(verified: boolean): void {
    this.dialogRef.close({ verified });
  }

  openInNewTab(): void {
    window.open(this.originalUrl, '_blank');
  }

  openProxyInNewTab(): void {
    window.open(this.proxyUrl, '_blank');
  }

  copyIPFSLink() {
    if (this.originalUrl) {
      navigator.clipboard.writeText(this.originalUrl)
        .then(() => {
          this.snackBar.open('Enlace copiado al portapapeles', 'Cerrar', {
            duration: 2000
          });
        });
    }
  }
}