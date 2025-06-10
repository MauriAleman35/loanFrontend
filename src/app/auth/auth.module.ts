import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "../material.module";
import { AuthRoutingModule } from "./auth-routing.module";



@NgModule({
  
    imports: [
      CommonModule,
      RouterModule,
      MaterialModule,
        AuthRoutingModule
        // Importa las rutas del módulo
    ]// Componente principal del módulo
  })
  export class AuthModule { }