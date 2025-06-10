import { Component } from '@angular/core';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout-loan',
  standalone: true,
  imports: [FooterComponent,HeaderComponent,RouterOutlet,RouterModule],
  templateUrl: './main-layout-loan.component.html',
  styleUrl: './main-layout-loan.component.css'
})
export class MainLayoutLoanComponent {

}
