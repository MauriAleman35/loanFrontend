// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Apollo, gql } from 'apollo-angular';

// Definición de tipos para autenticación
export interface LoginResponse {
  token: string;
  userType: string;
  roles: string[];
}

// Definición de tipos para usuarios
export interface UserInput {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  ci: string;
  password: string;
  score?: number;
  status?: string;
  userType?: string;
  adressVerified?: boolean;
  identityVerified?: boolean;
}

export interface User {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  ci: string;
  userType: string;
  status: string;
  score: number;
  adressVerified: boolean;
  identityVerified: boolean;
}

// Definiciones de consultas GraphQL
const LOGIN_MUTATION = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      userType
      roles
    }
  }
`;

const CREATE_USER_MUTATION = gql`
  mutation createUser(
    $name: String!, 
    $lastName: String!, 
    $email: String!, 
    $phone: String!, 
    $ci: String!, 
    $password: String!,
    $score: Int!,
    $status: String!,
    $userType: String!,
    $adressVerified: Boolean!,
    $identityVerified: Boolean!
  ) {
    createUser(input: {
      name: $name,
      lastName: $lastName,
      email: $email,
      phone: $phone,
      ci: $ci,
      password: $password,
      score: $score,
      status: $status,
      userType: $userType,
      adressVerified: $adressVerified,
      identityVerified: $identityVerified
    }) {
      id
      name
      lastName
      email
      ci
      userType
    }
  }
`;

const GET_USER_PROFILE = gql`
  query getUserProfile {
    userProfile {
      id
      name
      lastName
      email
      phone
      ci
      userType
      status
      score
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Variables para seguimiento del estado de autenticación
  private _isLoggedIn = false;
  private _userType: string | null = null;
  private _roles: string[] = [];
  private _userId: string | null = null;
  private _userProfile: User | null = null;

  // Token storage keys
  private readonly TOKEN_KEY = 'token';
  private readonly USER_TYPE_KEY = 'userType';
  private readonly ROLES_KEY = 'roles';
  private readonly USER_ID_KEY = 'userId';

  constructor(
    private apollo: Apollo,
    private router: Router
  ) {
    this.checkAuthStatus();
  }

  /**
   * Verifica si hay información de autenticación guardada al iniciar
   */
  private checkAuthStatus(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      this._isLoggedIn = true;
      this._userType = localStorage.getItem(this.USER_TYPE_KEY);
      this._userId = localStorage.getItem(this.USER_ID_KEY);
      
      const roles = localStorage.getItem(this.ROLES_KEY);
      this._roles = roles ? JSON.parse(roles) : [];
    }
  }

  /**
   * Realiza el inicio de sesión mediante GraphQL
   */
  login(username: string, password: string): Observable<LoginResponse> {
    return this.apollo.mutate<{ login: LoginResponse }>({
      mutation: LOGIN_MUTATION,
      variables: { username, password }
    }).pipe(
      map(result => {
        if (!result.data?.login) {
          throw new Error('No se recibió respuesta del servidor');
        }
        return result.data.login;
      }),
      tap(data => {
        // Guardar token y datos de usuario
        localStorage.setItem(this.TOKEN_KEY, data.token);
        localStorage.setItem(this.USER_TYPE_KEY, data.userType);
        localStorage.setItem(this.ROLES_KEY, JSON.stringify(data.roles));
          
        // Actualizar estado
        this._isLoggedIn = true;
        this._userType = data.userType;
        this._roles = data.roles;
          
        // Cargar perfil del usuario después de login exitoso
        this.loadUserProfile().subscribe();
         // Redirección directa al panel
     
      }),
      catchError(error => {
        console.error('Error durante login:', error);
        const errorMsg = error.graphQLErrors?.[0]?.message || 
                        'Error de autenticación. Por favor, verifica tus credenciales.';
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  /**
   * Carga el perfil del usuario autenticado
   */
  loadUserProfile(): Observable<User | null> {
    if (!this._isLoggedIn) {
      return of(null);
    }
    
    return this.apollo.query<{ userProfile: User }>({
      query: GET_USER_PROFILE,
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => result.data.userProfile),
      tap(profile => {
        if (profile) {
          this._userProfile = profile;
          localStorage.setItem(this.USER_ID_KEY, profile.id);
          this._userId = profile.id;
        }
      }),
      catchError(error => {
        console.error('Error cargando perfil:', error);
        return of(null);
      })
    );
  }

  /**
   * Crea un nuevo usuario (prestamista)
   */
  createUser(userData: UserInput): Observable<User> {
    return this.apollo.mutate<{ createUser: User }>({
      mutation: CREATE_USER_MUTATION,
      variables: {
        name: userData.name,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        ci: userData.ci,
        password: userData.password,
        score: userData.score || 0,
        status: userData.status || 'activo',
        userType: 'prestamista', // Siempre prestamista
        adressVerified: userData.adressVerified || false,
        identityVerified: userData.identityVerified || false
      }
    }).pipe(
      map(result => {
        if (!result.data?.createUser) {
          throw new Error('Error al crear usuario: respuesta vacía');
        }
        return result.data.createUser;
      }),
      catchError(error => {
        console.error('Error creando usuario:', error);
        const errorMsg = error.message || 'Error al crear usuario. Por favor intenta nuevamente.';
        return throwError(() => new Error(errorMsg));
      })
    );
  }
  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    // Limpiar almacenamiento local
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_TYPE_KEY);
    localStorage.removeItem(this.ROLES_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
    
    // Restablecer estado
    this._isLoggedIn = false;
    this._userType = null;
    this._roles = [];
    this._userId = null;
    this._userProfile = null;
    
    // Limpiar caché de Apollo
    this.apollo.client.resetStore().then(() => {
      // Redireccionar a la página de inicio después de limpiar la caché
      this.router.navigate(['/']);
    });
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isLoggedIn(): boolean {
    return this._isLoggedIn;
  }

  /**
   * Obtiene el token de autenticación
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtiene el tipo de usuario (prestamista/prestatario)
   */
  getUserType(): string | null {
    return this._userType;
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    return this._roles.includes(role);
  }

  /**
   * Obtiene los roles del usuario
   */
  getRoles(): string[] {
    return [...this._roles];
  }

  /**
   * Obtiene el ID del usuario
   */
  getUserId(): string | null {
    return this._userId;
  }
  
  /**
   * Obtiene el perfil completo del usuario
   */
  getUserProfile(): Observable<User | null> {
    if (this._userProfile) {
      return of(this._userProfile);
    }
    
    return this.loadUserProfile();
  }
}