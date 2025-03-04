import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { arrayRemove } from '@angular/fire/firestore';
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
  isShareModalOpen = false;
  isShared = 'true';
  sharedBy: any;
  constructor(
    private route: ActivatedRoute,
    private firebaseHandlerService: FirebaseHandlerService,
    private helperService: HelperService,
    private loaderService: LoaderService,
    private toast: ToastService,
    private intermediateService: IntermediateService,
    private actionSheet: ActionSheetController,
    private router: Router,
    private location: Location
  ) {}

  async ionViewDidEnter() {
    this.loggedInUserDetails =
      await this.helperService.getLoggedInUserDetails();
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
        this.isShared = param['isSharedFolder'];
        if (!this.isShared) {
          this.isShared = 'false';
        }

        this.getSelectedFolderDetails();
      });
  }

  getSelectedFolderDetails() {
    this.intermediateService
      .readById(this.folderId, collection.FOLDERS)
      .subscribe({
        next: (resp) => {
          console.log('resp: ', resp);
          this.secretsList = [];
          this.isAPIError = false;
          this.noSecretText = '';
          if (resp) {
            this.folderDetails = resp;
            if (this.isShared === 'true') {
              this.getFolderOwnerDetails();
            }
            if (resp?.secrets?.length < 1) {
              this.noSecretText =
                this.isShared === 'false'
                  ? messages.NO_SECRETS_IN_FOLDER
                  : messages.NO_SECRETS_IN_SHARED_FOLDER;
            } else {
              this.getSecrets(resp?.secrets);
            }
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
    this.loaderService.show();
    this.intermediateService.readAll(collection.SECRETS, '').subscribe({
      next: (resp) => {
        this.loaderService.hide();
        if (resp?.length > 0) {
          this.secretsList = resp.filter(
            (item: any) =>
              this.folderDetails?.secrets.includes(item.id) && !item?.isArchived
          );
          if (this.secretsList.length < 1) {
            this.noSecretText =
              this.isShared === 'false'
                ? messages.NO_SECRETS_IN_FOLDER
                : messages.NO_SECRETS_IN_SHARED_FOLDER;
          } else {
            // this.secretsList = this.helperService.sortByTime(this.secretsList);
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

  getFolderOwnerDetails() {
    this.intermediateService
      .readById(this.folderDetails.userId, collection.USERS)
      .subscribe({
        next: (resp) => {
          this.sharedBy = resp;
          console.log(resp);
        },
      });
  }

  onAdd() {
    this.router.navigateByUrl('/add-secret?folderId=' + this.folderId);
  }

  onManageAccess() {
    this.router.navigateByUrl(
      '/manage-access?folderId=' + this.folderDetails?.id
    );
  }

  onAddPeople() {
    this.isShareModalOpen = true;
  }

  async leaveFolder() {
    const payload = {
      sharedTo: arrayRemove({
        id: this.loggedInUserDetails?.id,
        username: this.loggedInUserDetails?.username,
        avatar: this.loggedInUserDetails?.avatar,
        fullname: this.loggedInUserDetails?.fullname,
      }),
    };
    this.intermediateService
      .update(this.folderDetails?.id, payload, collection.FOLDERS)
      .subscribe({
        next: () => {
          this.toast.showErrorToast(
            `Successfully Left the folder ${this.folderDetails?.folderName} Shared by ${this.sharedBy?.username}`
          );
          this.location.back();
          // this.router.navigateByUrl('/folders');
        },
      });
  }
}
