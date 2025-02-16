import { Component, OnInit } from '@angular/core';
import { collection } from 'src/app/constants/secret.constant';
import { HelperService } from 'src/app/services/helper.service';
import { IntermediateService } from 'src/app/services/intermediate.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.page.html',
  styleUrls: ['./favorites.page.scss'],
  standalone: false,
})
export class FavoritesPage implements OnInit {
  loggedInUserDetails: any;
  secrets: any;
  noSecretText = 'No Secrets Added to Favorite Yet';
  constructor(
    private helperService: HelperService,
    private loaderService: LoaderService,
    private intermediateService: IntermediateService,
    private toast: ToastService
  ) {}

  ngOnInit() {}

  async ionViewDidEnter() {
    this.loggedInUserDetails =
      await this.helperService.getLoggedInUserDetails();
    this.fetchSecrets();
  }

  fetchSecrets() {
    if (this.loggedInUserDetails) {
      this.loaderService.show();
      this.intermediateService.readAll(collection.SECRETS).subscribe({
        next: (resp) => {
          this.loaderService.hide();
          if (resp?.length > 0) {
            this.secrets = resp.filter((item: any) => item.isFavorite);
            this.secrets = this.helperService.sortByTime(this.secrets);
          } else {
            this.secrets = [];
          }
        },
        error: (e) => {
          console.error(e);
          this.toast.showErrorToast(
            'Error Fetching Your Favorites, Please try again later'
          );
        },
      });
    } else {
      this.toast.showErrorToast('Logged-In User Details Not Found');
      this.secrets = [];
    }
  }
}
