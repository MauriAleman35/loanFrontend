
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

 // Importa el módulo de marketing

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule, provideHttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';


import { MaterialModule } from './material.module';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';




@NgModule({
  declarations: [
    AppComponent,FooterComponent,HeaderComponent
  ],
  imports: [
    BrowserModule,
    
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,BehaviorSubject,HttpClient // Asegúrate de importar el módulo de marketing
  ],
  providers: [provideHttpClient(),Apollo,HttpLink],
  bootstrap: [AppComponent]
})
export class AppModule { }
