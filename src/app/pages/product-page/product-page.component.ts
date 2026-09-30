import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-product-page',
  imports: [MatButtonModule],
  templateUrl: './product-page.component.html',
  styleUrl: './product-page.component.scss',
})
export class ProductPageComponent {
    constructor(private router: Router) {}
  
    goToHomePage() {
      this.router.navigate(['/']);
    }
}
