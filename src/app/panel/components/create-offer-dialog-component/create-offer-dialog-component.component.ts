// src/app/panel/requests/create-offer-dialog/create-offer-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PanelService } from '../../services/panel.service';
import { Solicitude } from '../../models/solicitude';


@Component({
  selector: 'app-create-offer-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSliderModule,
    MatSelectModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  templateUrl: './create-offer-dialog-component.component.html'
})
export class CreateOfferDialogComponent implements OnInit {
  offerForm: FormGroup;
  isLoading: boolean = false;
  estimatedMonthlyPayment: number = 0;
  estimatedTotalRepayment: number = 0;
  loanTermOptions = [3, 6, 9, 12, 18, 24, 36];
  
  constructor(
    private fb: FormBuilder,
    private panelService: PanelService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<CreateOfferDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { solicitude: Solicitude }
  ) {
    this.offerForm = this.fb.group({
      interest: [5.0, [Validators.required, Validators.min(1), Validators.max(50)]],
      loanTerm: [12, Validators.required]
    });
    
    // Recalcular estimaciones cuando cambian los valores
    this.offerForm.valueChanges.subscribe(() => {
      this.calculateEstimates();
    });
  }

  ngOnInit(): void {
    this.calculateEstimates();
  }

  calculateEstimates(): void {
    if (this.offerForm.valid) {
      const principal = this.data.solicitude.loanAmount;
      const interestRate = this.offerForm.value.interest / 100 / 12; // Mensual
      const loanTerm = this.offerForm.value.loanTerm; // Meses
      
      // Fórmula de amortización: M = P [ i(1+i)^n ] / [ (1+i)^n - 1]
      if (interestRate === 0) {
        this.estimatedMonthlyPayment = principal / loanTerm;
      } else {
        const x = Math.pow(1 + interestRate, loanTerm);
        this.estimatedMonthlyPayment = (principal * interestRate * x) / (x - 1);
      }
      
      this.estimatedTotalRepayment = this.estimatedMonthlyPayment * loanTerm;
    }
  }

  onSubmit(): void {
    if (this.offerForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    
    const partnerId = this.panelService.getUserIdFromToken();
    const offerInput = {
      partnerId: partnerId,
      interest: this.offerForm.value.interest,
      loanTerm: this.offerForm.value.loanTerm,
      solicitudeId: parseInt(this.data.solicitude.id, 10)
    };
    
    this.panelService.createOffer(offerInput).subscribe({
      next: (result) => {
        this.isLoading = false;
        this.snackBar.open('Oferta enviada correctamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['bg-green-100', 'text-green-800']
        });
        this.dialogRef.close(result);
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open(`Error al enviar oferta: ${err.message}`, 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['bg-red-100', 'text-red-800']
        });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}