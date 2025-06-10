import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MainLayoutLoanComponent } from "../layouts/main-layout-loan/main-layout-loan.component";
import { LandingHomeComponent } from "./pages/landing-home/landing-home.component";


const routes: Routes = [
  // Rutas con layout principal
  {
    path: '', 
    component: MainLayoutLoanComponent,
    children: [
      { path: '', component: LandingHomeComponent },

    ]
  },




];

    
  @NgModule({
      imports: [RouterModule.forChild(routes)],
      exports: [RouterModule]
   })
    export class LandingComponentRoutingModule {}