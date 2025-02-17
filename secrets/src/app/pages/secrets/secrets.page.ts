import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { distinctUntilChanged } from 'rxjs';
import { collection, messages } from 'src/app/constants/secret.constant';
import { FirebaseHandlerService } from 'src/app/services/firebase-handler.service';
import { HelperService } from 'src/app/services/helper.service';
import { IntermediateService } from 'src/app/services/intermediate.service';
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
  noSecretText: any;
  isAPIError = false;
  constructor(
    private route: ActivatedRoute,
    private firebaseHandlerService: FirebaseHandlerService,
    private helperService: HelperService,
    private loaderService: LoaderService,
    private toast: ToastService,
    private intermediateService: IntermediateService,
    private actionSheet: ActionSheetController,
    private router: Router
  ) {}

  async ionViewDidEnter() {
    this.readActionFromURL();
  }

  readActionFromURL() {
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
    this.secretsList = [];
    this.isAPIError = false;
    this.noSecretText = '';
    this.intermediateService
      .readById(this.folderId, collection.FOLDERS)
      .subscribe({
        next: (resp) => {
          if (resp) {
            this.folderDetails = resp;
            this.getSecrets(resp?.secrets);
          } else {
            this.noSecretText = messages.FOLDER_NOT_FOUND;
          }
        },
        error: (err) => {
          this.isAPIError = true;
          this.noSecretText = messages.API_ERROR_MESSAGE;
          console.error(err);
        },
      });
  }

  getSecrets(secrets: any) {
    if (secrets?.length < 1) {
      this.noSecretText = messages.NO_SECRETS_IN_FOLDER;
      return;
    }
    this.loaderService.show();
    this.intermediateService.readAll(collection.SECRETS).subscribe({
      next: (resp) => {
        this.loaderService.hide();
        if (resp?.length > 0) {
          this.secretsList = resp.filter(
            (item: any) =>
              this.folderDetails?.secrets.includes(item.id) && !item?.isArchived
          );
          if (this.secretsList.length < 1) {
            this.noSecretText = messages.NO_SECRETS_IN_FOLDER;
          } else {
            this.secretsList = this.helperService.sortByTime(this.secretsList);
          }
        } else {
          this.noSecretText = messages.NO_SECRETS;
        }
      },
      error: (err) => {
        this.isAPIError = true;
        this.noSecretText = messages.API_ERROR_MESSAGE;
        console.error(err);
      },
    });
  }

  async onAdd() {
    const actionSheet = await this.actionSheet.create({
      header: '',
      buttons: [
        {
          text: 'Add Secret',
          handler: () => {
            this.router.navigateByUrl('/add-secret?folderId=' + this.folderId);
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ],
      cssClass: 'custom-action-sheet',
    });

    await actionSheet.present();
  }
}
