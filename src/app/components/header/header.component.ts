import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../auth/services/auth.service';

interface Tab {
  label: string;
  route: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,       
    RouterModule,       
    MatIconModule,      
    MatMenuModule,      
    MatButtonModule,    
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  tabs: Tab[] = [];
  tenants: any[] = [];
  isMobileMenuOpen = false;
  
  constructor(
    public router: Router,
    public authService: AuthService // Inyecta el servicio de autenticación
  ) {}
  
  ngOnInit(): void {
    // Re-armar tabs cada vez que cambie el usuario (login/logout)
   
  }
  
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
  
  openLogin(): void {
    this.router.navigate(['/auth/login']);
  }
  
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
  
  openAccount(): void {
    this.router.navigate(['/perfil']);
  }
  
  logout(): void {
    // Implementa el método logout
    this.authService.logout();
    this.router.navigate(['/']);
  }
}