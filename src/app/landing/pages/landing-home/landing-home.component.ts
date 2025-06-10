import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing-home',
  standalone: true,
  imports: [ CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
],
  templateUrl: './landing-home.component.html',
  styleUrl: './landing-home.component.css'
})
export class LandingHomeComponent {
  constructor(private router: Router) { }

  ngOnInit(): void {
    // Cualquier inicialización que necesites
  }

  navigateToSignup(): void {
    this.router.navigate(['/auth/signup']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  scheduleDemo(): void {
    // Implementar lógica para programar una demo
    console.log('Demo solicitada');
  }
}
