import { Component, OnInit } from '@angular/core';
import { collection, messages } from 'src/app/constants/secret.constant';
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
  secrets: any;
  noSecretText: any;
  hasNoFavorites: any;
  isAPIError: any;
  constructor(
    private helperService: HelperService,
    private loaderService: LoaderService,
    private intermediateService: IntermediateService,
    private toast: ToastService
  ) {}

  ngOnInit() {}

  async ionViewDidEnter() {
    this.fetchSecrets();
  }

  fetchSecrets() {
    this.loaderService.show();
    this.intermediateService.readAll(collection.SECRETS).subscribe({
      next: (resp) => {
        this.resetVariables();
        this.loaderService.hide();
        if (resp?.length > 0) {
          const filteredSecrets = resp.filter(
            (item: any) => item?.isFavorite && !item?.isArchived
          );
          if (filteredSecrets?.length > 0) {
            this.secrets = filteredSecrets;
          } else {
            this.noSecretText = messages.NO_FAVORITES;
          }
        } else {
          this.noSecretText = messages.NO_SECRETS;
        }
      },
      error: (e) => {
        this.resetVariables();
        this.loaderService.hide();
        this.isAPIError = true;
        this.noSecretText = messages.API_ERROR_MESSAGE;
        console.error(e);
      },
    });
  }

  resetVariables() {
    this.noSecretText = '';
    this.isAPIError = false;
    this.secrets = [];
  }
}
