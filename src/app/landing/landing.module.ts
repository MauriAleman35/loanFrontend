import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "../material.module";
import { LandingComponentRoutingModule } from "./landing-routing.module";


@NgModule({
  
    imports: [
      CommonModule,
      RouterModule,
      MaterialModule,
        LandingComponentRoutingModule
        // Importa las rutas del módulo
    ]// Componente principal del módulo
  })
  export class LandingModule { }