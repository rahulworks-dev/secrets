import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { distinctUntilChanged } from 'rxjs';
import { collection } from 'src/app/constants/secret.constant';
import { FirebaseHandlerService } from 'src/app/services/firebase-handler.service';
import { HelperService } from 'src/app/services/helper.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-secrets',
  templateUrl: './secrets.page.html',
  styleUrls: ['./secrets.page.scss'],
  standalone: false,
})
export class SecretsPage {
  folderId: any;
  folderDetails: any;
  loggedInUserDetails: any;
  secretsList!: any[];
  noSecretText = "No Secrets Added to this Folder, Click on '+' to Add Secret";
  constructor(
    private route: ActivatedRoute,
    private firebaseHandlerService: FirebaseHandlerService,
    private helperService: HelperService,
    private loaderService: LoaderService,
    private toast: ToastService
  ) {}

  async ionViewDidEnter() {
    this.loggedInUserDetails =
      await this.helperService.getLoggedInUserDetails();
    this.readActionFromURL();
  }

  readActionFromURL() {
    console.log('READ QUERY PARAM');
    this.route.queryParams
      .pipe(
        distinctUntilChanged(
          (prev, curr) => prev['folderId'] === curr['folderId']
        )
      )
      .subscribe((param: any) => {
        this.folderId = param['folderId'];
        this.getSelectedFolderDetails();
      });
  }

  getSelectedFolderDetails() {
    this.firebaseHandlerService
      .getItemById(this.folderId, collection.FOLDERS)
      .subscribe({
        next: (resp) => {
          this.folderDetails = resp;
          this.getSecrets(resp?.secrets);
          console.log(resp);
        },
      });
  }

  getSecrets(secrets: any) {
    if (secrets.length < 1) {
      this.secretsList = [];
      return;
    }
    if (this.loggedInUserDetails) {
      this.secretsList = [];
      this.loaderService.show();
      this.firebaseHandlerService.readAll(collection.SECRETS).subscribe({
        next: (resp) => {
          console.log('resp: ', resp);
          this.loaderService.hide();
          if (resp?.length > 0) {
            this.secretsList = resp.filter(
              (item: any) =>
                
                this.folderDetails.secrets.includes(item.id)
            );
            // this.secretsList
            this.secretsList = this.helperService.sortByTime(this.secretsList);
            console.log(this.secretsList);
          } else {
            this.secretsList = [];
          }
        },
      });
    } else {
      this.secretsList = [];
      this.toast.showErrorToast('Logged-In User Details Not Found');
    }
  }
}
