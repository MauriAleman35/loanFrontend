// panel-layout.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../auth/services/auth.service';
import { Apollo, gql } from 'apollo-angular';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

interface UserProfile {
  id: string;
  name: string;
  lastName: string;
  email: string;
  userType: string;
}

// Query para obtener datos del usuario
const GET_USER_PROFILE = gql`
  query GetUserProfile {
    userProfile {
      id
      name
      lastName
      email
      userType
    }
  }
`;

@Component({
  selector: 'app-panel-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatMenuModule,
    MatBadgeModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './panel-layout.component.html',
  styleUrl: './panel-layout.component.css'
})
export class PanelLayoutComponent implements OnInit {
  sidebarCollapsed: boolean = false;
  isMobile: boolean = false;
  mobileSidebarOpen: boolean = false;
  userProfile: UserProfile | null = null;
  menuItems: MenuItem[] = [];
  isLoading: boolean = true;
  
  constructor(
    private apollo: Apollo,
    private authService: AuthService,
    private router: Router
  ) {
    this.checkScreenSize();
  }

  ngOnInit(): void {
    this.loadUserProfile();
    this.initMenu();
  }

  @HostListener('window:resize')
  checkScreenSize(): void {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) {
      this.sidebarCollapsed = true;
      this.mobileSidebarOpen = false;
    }
  }

  toggleSidebar(): void {
    if (this.isMobile) {
      this.mobileSidebarOpen = !this.mobileSidebarOpen;
    } else {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }

  closeMobileSidebar(): void {
    if (this.isMobile) {
      this.mobileSidebarOpen = false;
    }
  }

  loadUserProfile(): void {
    this.isLoading = true;
    
    this.apollo.watchQuery<any>({
      query: GET_USER_PROFILE
    }).valueChanges.subscribe({
      next: (result) => {
        this.isLoading = false;
        if (result.data?.userProfile) {
          this.userProfile = result.data.userProfile;
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al cargar el perfil de usuario:', err);
      }
    });
  }

  initMenu(): void {
    // Menús para sistema de préstamos
    this.menuItems = [
      { icon: 'dashboard', label: 'Dashboard', route: '/panel/dashboard' },
      { icon: 'monetization_on', label: 'Préstamos', route: '/panel/loans', badge: 5 },
      { icon: 'description', label: 'Solicitudes', route: '/panel/solicitudes', badge: 3 },
      { icon: 'payments', label: 'Pagos', route: '/panel/payments' },
      { icon: 'people', label: 'Ofertas', route: '/panel/offers' },

    ];
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  getInitials(name: string, lastName: string = ''): string {
    if (!name) return '?';
    
    const firstInitial = name.charAt(0).toUpperCase();
    const secondInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    
    return secondInitial ? firstInitial + secondInitial : firstInitial;
  }

  getAvatarColor(name: string): string {
    if (!name) return '#d4a017';
    const colors = ['#d4a017', '#a58d65', '#e6b325', '#8a7553', '#c49c3f'];
    const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charSum % colors.length];
  }
  
  get fullName(): string {
    if (!this.userProfile) return 'Usuario';
    return `${this.userProfile.name} ${this.userProfile.lastName}`;
  }
  
  get userTypeLabel(): string {
    if (!this.userProfile?.userType) return 'Usuario';
    
    // Traducir tipos de usuario a etiquetas más amigables
    const types: {[key: string]: string} = {
      'prestamista': 'Prestamista',
      'cliente': 'Cliente',
      'admin': 'Administrador'
    };
    
    return types[this.userProfile.userType.toLowerCase()] || this.userProfile.userType;
  }
}