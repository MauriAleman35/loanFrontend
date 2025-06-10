import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AuthSignupComponent  } from "./pages/auth-singup/auth-singup.component";
import { AuthSigninComponent } from "./pages/auth-singin/auth-singin.component";


const routes: Routes = [
    {
      path: 'login', 
      component:AuthSigninComponent,
    },{
        path:'register',
        component:AuthSignupComponent 
    }
    
    ];
    
  @NgModule({
      imports: [RouterModule.forChild(routes)],
      exports: [RouterModule]
   })
    export class AuthRoutingModule {}