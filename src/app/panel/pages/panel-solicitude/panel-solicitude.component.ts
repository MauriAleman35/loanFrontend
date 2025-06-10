// src/app/panel/requests/requests.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PanelService } from '../../services/panel.service';


import { CreateOfferDialogComponent } from '../../components/create-offer-dialog-component/create-offer-dialog-component.component';
import { Borrower,Solicitude } from '../../models/solicitude';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTable, MatTableModule } from '@angular/material/table';
import { MatButtonToggleModule } from '@angular/material/button-toggle';


@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonToggleModule,
    MatDialogModule
  ],
  templateUrl: './panel-solicitude.component.html',
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
    .mat-column-actions {
      text-align: right;
      justify-content: flex-end;
    }
  `]
})
export class PanelSolicitudeComponent implements OnInit {
  solicitudes: Solicitude[] = [];
  displayedColumns: string[] = ['id', 'loanAmount', 'borrower', 'status', 'createdAt', 'verification', 'score', 'actions'];
  isLoading: boolean = true;
  error: string | null = null;
  
  // Paginación
  totalItems: number = 0;
  pageSize: number = 6;
  currentPage: number = 0;
  pageSizeOptions: number[] = [3, 6, 9, 12];
  daysBack: number = 7;
  
  // Vista
  viewMode: 'cards' | 'table' = 'cards';
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Solicitude>;

  constructor(
    private panelService: PanelService, 
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadSolicitudes();
  }

  loadSolicitudes(): void {
    this.isLoading = true;
    this.panelService.getAvailableSolicitudes(this.currentPage, this.pageSize, this.daysBack).subscribe({
      next: (data) => {
        this.solicitudes = data;
        this.totalItems = 30; // En un entorno real, este valor vendría del API
        this.isLoading = false;
      },
      error: (err) => {
        this.error = `Error al cargar solicitudes: ${err.message}`;
        this.isLoading = false;
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

  handlePageEvent(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadSolicitudes();
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
    this.loadSolicitudes();
  }

  getTimeAgo(dateString: string): string {
    const now = new Date();
    const past = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - past.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Hoy';
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
    } else {
      return this.formatDate(dateString);
    }
  }

  openCreateOfferDialog(solicitude: Solicitude): void {
    const dialogRef = this.dialog.open(CreateOfferDialogComponent, {
      width: '500px',
      data: { solicitude: solicitude }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Recargar solicitudes para reflejar cambios
        this.loadSolicitudes();
      }
    });
  }

  getTrustBadge(borrower: Borrower): string {
    if (borrower.identityVerified && borrower.adressVerified) {
      return 'Verificado';
    } else if (borrower.identityVerified || borrower.adressVerified) {
      return 'Parcial';
    } else {
      return 'No verificado';
    }
  }

  getTrustBadgeClass(borrower: Borrower): string {
    if (borrower.identityVerified && borrower.adressVerified) {
      return 'bg-green-100 text-green-800 border border-green-200';
    } else if (borrower.identityVerified || borrower.adressVerified) {
      return 'bg-amber-100 text-amber-800 border border-amber-200';
    } else {
      return 'bg-red-100 text-red-800 border border-red-200';
    }
  }

  getScoreBadgeClass(score: number): string {
    if (score >= 80) {
      return 'bg-green-500 text-white';
    } else if (score >= 50) {
      return 'bg-amber-500 text-white';
    } else if (score > 0) {
      return 'bg-red-500 text-white';
    } else {
      return 'bg-gray-200 text-gray-800';
    }
  }

  getScoreStars(score: number): boolean[] {
    if (score === 0) {
      return [false, false, false, false, false];
    }
    
    const normalizedScore = Math.min(Math.max(score, 0), 100);
    const starCount = Math.round(normalizedScore / 20);
    
    return Array(5).fill(false).map((_, index) => index < starCount);
  }

  getScoreLabel(score: number): string {
    if (score === 0) {
      return 'Sin calificación';
    } else if (score >= 80) {
      return 'Excelente';
    } else if (score >= 60) {
      return 'Bueno';
    } else if (score >= 40) {
      return 'Regular';
    } else {
      return 'Bajo';
    }
  }

  viewBorrowerProfile(borrowerId: string): void {
    this.router.navigate(['/panel/borrowers', borrowerId]);
  }

  getVerificationStatusText(borrower: Borrower): string {
    if (borrower.identityVerified && borrower.adressVerified) {
      return 'Completa';
    } else if (borrower.identityVerified || borrower.adressVerified) {
      return borrower.identityVerified ? 'ID verificada' : 'Dirección verificada';
    } else {
      return 'No verificado';
    }
  }
}