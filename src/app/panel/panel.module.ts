import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "../material.module";
import { PanelLayoutComponent } from "../layouts/panel-layout/panel-layout.component";
import { PanelRoutingModule } from "./panel-routing.module";




@NgModule({
  declarations: [


  ],
  imports: [

    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
   
    MaterialModule,
    PanelLayoutComponent,
    PanelRoutingModule
    

    
  ]
})
export class PanelModule { }