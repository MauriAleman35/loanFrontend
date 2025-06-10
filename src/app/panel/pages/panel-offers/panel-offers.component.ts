import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


import { FormControl } from '@angular/forms';
import { OfferFilters, PartnerOffer } from '../../models/offer';
import { PanelService } from '../../services/panel.service';
import { OffersFilterComponent } from '../../components/offers-filter/offers-filter.component';

@Component({
  selector: 'app-partner-offers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    OffersFilterComponent
  ],
  templateUrl: './panel-offers.component.html',
  styleUrls: ['./panel-offers.component.css']
})
export class PanelOffersComponent implements OnInit {
  // Usuario actual (en un caso real, lo obtendrías de un servicio de autenticación)

  
  // Datos y estado
  allOffers: PartnerOffer[] = [];
  filteredOffers: PartnerOffer[] = [];
  displayedOffers: PartnerOffer[] = [];
  loading = true;
  error: string | null = null;
  
  // Filtros
  filters: OfferFilters = {
    status: 'todas',
    searchTerm: ''
  };
  
  // Tabla y paginación
  displayedColumns: string[] = [
    'id', 
    'borrower', 
    'loanAmount', 
    'interest', 
    'term', 
    'monthlyPayment', 
    'totalRepayment', 
    'status', 
    'actions'
  ];
  pageSize = 10;
  currentPage = 0;
  totalItems = 0;
  
  // Estadísticas
  offerCounts = {
    total: 0,
    aceptada: 0,
    rechazada: 0,
    pendiente: 0
  };

  constructor(private partnerOffersService: PanelService) {}

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this.loading = true;
    
    this.partnerOffersService.getPartnerOffers().subscribe({
      next: (offers) => {
        this.allOffers = offers;
        this.calculateOfferCounts();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando ofertas:', err);
        this.error = 'Error al cargar las ofertas. Intente nuevamente.';
        this.loading = false;
      }
    });
  }

  calculateOfferCounts(): void {
    this.offerCounts = {
      total: this.allOffers.length,
      aceptada: this.allOffers.filter(o => o.status === 'aceptada').length,
      rechazada: this.allOffers.filter(o => o.status === 'rechazada').length,
      pendiente: this.allOffers.filter(o => o.status === 'pendiente').length
    };
  }

  onFilterChange(filters: OfferFilters): void {
    this.filters = filters;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.allOffers];
    
    // Filtrar por estado
    if (this.filters.status !== 'todas') {
      filtered = filtered.filter(offer => offer.status === this.filters.status);
    }
    
    // Filtrar por texto de búsqueda
    if (this.filters.searchTerm) {
      const term = this.filters.searchTerm.toLowerCase();
      filtered = filtered.filter(offer => 
        offer.solicitude.borrower.name.toLowerCase().includes(term) ||
        offer.solicitude.borrower.lastName.toLowerCase().includes(term) ||
        offer.id.includes(term) ||
        offer.solicitude.id.includes(term)
      );
    }
    
    // Filtrar por rango de fechas si está definido
    if (this.filters.dateFrom && this.filters.dateTo) {
      const fromDate = new Date(this.filters.dateFrom);
      const toDate = new Date(this.filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // Hasta el final del día
      
      filtered = filtered.filter(offer => {
        if (!offer.createdAt) return true;
        const offerDate = new Date(offer.createdAt);
        return offerDate >= fromDate && offerDate <= toDate;
      });
    }
    
    this.filteredOffers = filtered;
    this.totalItems = filtered.length;
    this.updateDisplayedOffers();
  }

  updateDisplayedOffers(): void {
    const startIndex = this.currentPage * this.pageSize;
    this.displayedOffers = this.filteredOffers.slice(startIndex, startIndex + this.pageSize);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.updateDisplayedOffers();
  }

  onSortChange(sort: Sort): void {
    const data = [...this.filteredOffers];
    if (!sort.active || sort.direction === '') {
      this.filteredOffers = data;
      this.updateDisplayedOffers();
      return;
    }

    this.filteredOffers = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id': return this.compare(a.id, b.id, isAsc);
        case 'borrower': return this.compare(
          a.solicitude.borrower.name + a.solicitude.borrower.lastName,
          b.solicitude.borrower.name + b.solicitude.borrower.lastName, 
          isAsc
        );
        case 'loanAmount': return this.compare(a.solicitude.loanAmount, b.solicitude.loanAmount, isAsc);
        case 'interest': return this.compare(a.interest, b.interest, isAsc);
        case 'term': return this.compare(a.loanTerm, b.loanTerm, isAsc);
        case 'monthlyPayment': return this.compare(a.monthlyPayment, b.monthlyPayment, isAsc);
        case 'totalRepayment': return this.compare(a.totalRepaymentAmount, b.totalRepaymentAmount, isAsc);
        case 'status': return this.compare(a.status, b.status, isAsc);
        default: return 0;
      }
    });
    
    this.updateDisplayedOffers();
  }

  private compare(a: string | number, b: string | number, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'aceptada': return 'text-green-600 bg-green-100 border-green-200';
      case 'rechazada': return 'text-red-600 bg-red-100 border-red-200';
      case 'pendiente': return 'text-amber-600 bg-amber-100 border-amber-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  }

  viewOfferDetails(offerId: string): void {
    // Implementar navegación al detalle de la oferta
    console.log(`Ver detalles de la oferta: ${offerId}`);
  }

  exportToCSV(): void {
    let csvData = 'ID,Prestatario,Monto solicitado,Interés,Plazo,Cuota mensual,Total a pagar,Estado\n';
    
    this.filteredOffers.forEach(offer => {
      csvData += `${offer.id},`;
      csvData += `"${offer.solicitude.borrower.name} ${offer.solicitude.borrower.lastName}",`;
      csvData += `${offer.solicitude.loanAmount},`;
      csvData += `${offer.interest}%,`;
      csvData += `${offer.loanTerm},`;
      csvData += `${offer.monthlyPayment},`;
      csvData += `${offer.totalRepaymentAmount},`;
      csvData += `${offer.status}\n`;
    });
    
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ofertas-prestamista-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}