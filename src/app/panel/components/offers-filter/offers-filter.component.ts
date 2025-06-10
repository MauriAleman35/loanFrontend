import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { debounceTime } from 'rxjs/operators';
import { OfferFilters, OfferStatus } from '../../models/offer';



@Component({
  selector: 'app-offers-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule
  ],
  templateUrl: './offers-filter.component.html'
})
export class OffersFilterComponent implements OnInit {
  @Input() offerCounts = {
    total: 0,
    aceptada: 0,
    rechazada: 0,
    pendiente: 0
  };
  
  @Output() filterChange = new EventEmitter<OfferFilters>();
  
  filterForm: FormGroup;
  
  statusOptions = [
    { value: 'todas', label: 'Todas' },
    { value: 'aceptada', label: 'Aceptadas' },
    { value: 'rechazada', label: 'Rechazadas' },
    { value: 'pendiente', label: 'Pendientes' }
  ];
  
  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      status: ['todas'],
      searchTerm: [''],
      dateFrom: [null],
      dateTo: [null]
    });
  }
  
  ngOnInit(): void {
    // Emitir filtros cuando cambien con un pequeño retraso para búsquedas
    this.filterForm.valueChanges
      .pipe(debounceTime(300))
      .subscribe(filters => {
        this.filterChange.emit(filters);
      });
  }
  
  resetFilters(): void {
    this.filterForm.reset({
      status: 'todas',
      searchTerm: '',
      dateFrom: null,
      dateTo: null
    });
  }
  
  setStatusFilter(status: OfferStatus): void {
    this.filterForm.patchValue({ status });
  }
}