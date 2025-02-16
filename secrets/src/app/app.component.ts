import { ChangeDetectorRef, Component } from '@angular/core';
import { LoaderService } from './services/loader.service';
import { HelperService } from './services/helper.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  isLoading = this.loaderService.isLoading$;
  isLoggedIn$ = this.helperService.isLoggedIn$;
  constructor(
    private loaderService: LoaderService,
    private helperService: HelperService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.helperService.getLoggedInUserDetails();
  }
}
