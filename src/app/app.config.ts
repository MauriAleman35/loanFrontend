// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom, inject } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { HttpHandlerFn, HttpRequest, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { setContext } from '@apollo/client/link/context';
const routes: Routes = [
  { path: '', loadChildren: () => import('./landing/landing.module').then(l => l.LandingModule) },
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(a => a.AuthModule) },
  {
    path:'panel',loadChildren:()=>import('./panel/panel.module').then(p=>p.PanelModule)
  }
];
// Interceptor para manejar CORS
export function corsInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  // Para peticiones a pinata/ipfs
  if (req.url.includes('gateway.pinata.cloud')) {
    const modifiedReq = req.clone({
      setHeaders: {
        'Access-Control-Allow-Origin': '*'
      }
    });
    return next(modifiedReq);
  }
  return next(req);
}
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch(),withInterceptors([corsInterceptor])),
    importProvidersFrom(BrowserAnimationsModule),
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      
      // Crear un middleware para añadir el token de autenticación
      const authLink = setContext((_, { headers }) => {
        // Obtener el token desde localStorage
        const token = localStorage.getItem('token');
        
        // Retornar los headers con el token en formato Bearer
        return {
          headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : '',
          }
        };
      });
      
      const link = httpLink.create({
        uri: 'http://localhost:8081/graphql',
      });
      
      return {
        cache: new InMemoryCache(),
        link: authLink.concat(link), // Combinar el authLink con el httpLink
        defaultOptions: {
          watchQuery: {
            errorPolicy: 'all'
          },
          mutate: {
            errorPolicy: 'all'
          }
        }
      };
    })
  ]
};