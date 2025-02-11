import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HelperService } from 'src/app/services/helper.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false,
})
export class HeaderComponent implements OnInit {
  isLoading = this.loaderService.isLoading$;
  constructor(
    private loaderService: LoaderService,
    private helperService: HelperService,
    private router: Router
  ) {}

  ngOnInit() {}

  async GoToDashboard() {
    const isLoggedIn = await this.helperService.getLoggedInUserDetails();
    if (isLoggedIn) {
      this.router.navigateByUrl('/dashboard');
    } else {
      this.router.navigateByUrl('/login');
    }
  }
}
