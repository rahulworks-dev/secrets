import { ChangeDetectorRef, Component } from '@angular/core';
import { LoaderService } from './services/loader.service';
import { HelperService } from './services/helper.service';
import { MakePageNonInteractiveService } from './services/make-page-non-interactive.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  isOnline = navigator.onLine;
  isLoading = this.loaderService.isLoading$;
  isLoggedIn$ = this.helperService.isLoggedIn$;
  makePageNonInteractive = this._makePageNonInteractive.makePageNonInteractive$;
  constructor(
    private loaderService: LoaderService,
    private helperService: HelperService,
    private cdr: ChangeDetectorRef,
    private _makePageNonInteractive: MakePageNonInteractiveService
  ) {}

  ngOnInit() {
    this.helperService.getLoggedInUserDetails();
  }
}
