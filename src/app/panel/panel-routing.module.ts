import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/guard/auth.guard';
import { PanelLayoutComponent } from '../layouts/panel-layout/panel-layout.component';
import { PanelDashboardComponent } from './pages/panel-dashboard/panel-dashboard.component';
import { PanelSolicitudeComponent } from './pages/panel-solicitude/panel-solicitude.component';
import { PanelPaymentsComponent } from './pages/panel-payments/panel-payments.component';
import { PanelLoansComponent } from './pages/panel-loans/panel-loans.component';
import { PanelOffersComponent } from './pages/panel-offers/panel-offers.component';



const routes: Routes = [
  {
    path:'',
    component: PanelLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: PanelDashboardComponent },
      {path:'loans',component:PanelLoansComponent},

     { path: 'solicitudes', component: PanelSolicitudeComponent },
     { path: 'payments', component: PanelPaymentsComponent},
     {path: 'offers',component:PanelOffersComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PanelRoutingModule { }