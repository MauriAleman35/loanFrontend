// src/app/panel/loans/loans.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { PanelService } from '../../services/panel.service';
import { Loan } from '../../models/loan';
import { MatTable, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonToggleModule } from '@angular/material/button-toggle';


@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonToggleModule
  ],
  templateUrl: './panel-loans.component.html',
  styles: [`
    .view-toggle {
      border-radius: 9999px;
    }
    .view-toggle .mat-button-toggle-button {
      border-radius: 9999px !important;
    }
    .table-container {
      overflow-x: auto;
    }
  `]

})
export class PanelLoansComponent implements OnInit {
  loans: Loan[] = [];
  displayedColumns: string[] = ['id', 'loanAmount', 'borrower', 'interestRate', 'term', 'startDate', 'endDate', 'status', 'progress', 'actions'];
  isLoading: boolean = true;
  error: string | null = null;
  
  // Paginación
  totalItems: number = 0;
  pageSize: number = 6;
  currentPage: number = 0;
  pageSizeOptions: number[] = [3, 6, 9, 12];
  
  // Vista
  viewMode: 'cards' | 'table' = 'cards';
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Loan>;

  constructor(
    private panelService: PanelService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadLoans();
  }

  loadLoans(): void {
    this.isLoading = true;
    this.panelService.getActiveLoans().subscribe({
      next: (data) => {
        this.loans = data;
        this.totalItems = data.length; // En un entorno real, este valor vendría del API
        this.isLoading = false;
      },
      error: (err) => {
        this.error = `Error al cargar préstamos: ${err.message}`;
        this.isLoading = false;
      }
    });
  }

  handlePageEvent(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    // En un entorno real, aquí llamaríamos al API con la nueva página
  }

  toggleView(view: 'cards' | 'table'): void {
    this.viewMode = view;
    // Reajustar paginación según el tipo de vista
    if (view === 'table') {
      this.pageSize = 10;
    } else {
      this.pageSize = 6;
    }
    this.currentPage = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
      this.paginator.pageSize = this.pageSize;
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

  calculateProgress(startDate: string, endDate: string): number {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    
    // Calcula el porcentaje de tiempo transcurrido
    if (now <= start) return 0;
    if (now >= end) return 100;
    
    return Math.round(((now - start) / (end - start)) * 100);
  }

  getStatusLabel(status: string): string {
    const statusMap: {[key: string]: string} = {
      'al_dia': 'Al día',
      'atrasado': 'Atrasado',
      'mora': 'En mora',
      'finalizado': 'Finalizado',
      'cancelado': 'Cancelado'
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: string): string {
    const colorMap: {[key: string]: string} = {
      'al_dia': 'bg-green-100 text-green-800 border border-green-200',
      'atrasado': 'bg-amber-100 text-amber-800 border border-amber-200',
      'mora': 'bg-red-100 text-red-800 border border-red-200',
      'finalizado': 'bg-blue-100 text-blue-800 border border-blue-200',
      'cancelado': 'bg-gray-100 text-gray-800 border border-gray-200'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
  }

  getTotalAmount(): number {
    return this.loans.reduce((sum, loan) => sum + loan.loanAmount, 0);
  }

  viewLoanDetails(id: string): void {
    this.router.navigate(['/panel/loans', id]);
  }

  viewLoanPayments(id: string): void {
    this.router.navigate(['/panel/loans', id, 'payments']);
  }

  goToRequests(): void {
    this.router.navigate(['/panel/requests']);
  }
}