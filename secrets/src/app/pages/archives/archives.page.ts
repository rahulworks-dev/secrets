import { Component, OnInit } from '@angular/core';
import { collection, messages } from 'src/app/constants/secret.constant';
import { IntermediateService } from 'src/app/services/intermediate.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-archives',
  templateUrl: './archives.page.html',
  styleUrls: ['./archives.page.scss'],
  standalone: false,
})
export class ArchivesPage implements OnInit {
  secrets: any;
  noSecretText: any;
  hasNoFavorites: any;
  isAPIError: any;
  constructor(
    private loaderService: LoaderService,
    private intermediateService: IntermediateService
  ) {}

  ngOnInit() {}

  async ionViewDidEnter() {
    this.fetchSecrets();
  }

  fetchSecrets() {
    this.noSecretText = '';
    this.isAPIError = false;
    this.secrets = [];
    this.loaderService.show();
    this.intermediateService.readAll(collection.SECRETS).subscribe({
      next: (resp) => {
        this.loaderService.hide();
        if (resp?.length > 0) {
          const filteredSecrets = resp.filter((item: any) => item?.isArchived);
          if (filteredSecrets?.length > 0) {
            this.secrets = filteredSecrets;
          } else {
            this.noSecretText = messages.NO_ARCHIVES;
          }
        } else {
          this.noSecretText = messages.NO_SECRETS;
        }
      },
      error: (e) => {
        this.loaderService.hide();
        this.isAPIError = true;
        this.noSecretText = messages.API_ERROR_MESSAGE;
        console.error(e);
      },
    });
  }
}
