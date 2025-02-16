import { Component, OnInit } from '@angular/core';
import { arrayUnion } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';
import { collection, storage } from 'src/app/constants/secret.constant';
import { Secret } from 'src/app/models/secret.interface';
import { FirebaseHandlerService } from 'src/app/services/firebase-handler.service';
import { HelperService } from 'src/app/services/helper.service';
import { IntermediateService } from 'src/app/services/intermediate.service';
import { LoaderService } from 'src/app/services/loader.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-add-secret',
  templateUrl: './add-secret.page.html',
  styleUrls: ['./add-secret.page.scss'],
  standalone: false,
})
export class AddSecretPage {
  customModalOptions = {
    header: 'Yours Folders',
    breakpoints: [0, 0.5],
    initialBreakpoint: 0.5,
    cssClass: 'custom-alert',
  };
  title: any;
  secret: any;
  secretId: any;
  existingSecret: any;
  loggedInUserDetails: any;
  folderId: any;
  isSaveButtonDisabled = false;
  constructor(
    private router: Router,
    private intermediateService: IntermediateService,
    private toast: ToastService,
    private loaderService: LoaderService,
    private helperService: HelperService,
    private route: ActivatedRoute
  ) {}

  async ionViewDidEnter() {
    this.isSaveButtonDisabled = false;
    this.loggedInUserDetails =
      await this.helperService.getLoggedInUserDetails();
    this.route.queryParams.subscribe((params) => {
      this.secretId = params['id'];
      this.folderId = params['folderId'];
      if (this.secretId) {
        this.getSecret();
      }
    });
  }

  async getSecret() {
    this.intermediateService
      .readById(this.secretId, collection.SECRETS)
      .subscribe({
        next: (resp) => {
          if (resp) {
            this.existingSecret = resp;
            this.title = resp?.title || '';
            this.secret = resp?.secret || '';
          }
        },
        error: (err) => {
          console.error(err);
          this.toast.showErrorToast(
            'Error fetching your secret to edit, Please try again later'
          );
        },
      });
  }

  async save() {
    if (this.loggedInUserDetails) {
      if (this.title && this.secret) {
        this.isSaveButtonDisabled = true;
        if (this.secretId) {
          this.saveEditedRecord();
        } else {
          this.saveFreshRecord();
        }
      } else {
        this.isSaveButtonDisabled = false;
        this.toast.showErrorToast(
          "Oops! Looks like you haven't added your secret, Please fill out the required fields"
        );
      }
    } else {
      this.isSaveButtonDisabled = false;
      this.toast.showErrorToast(
        'Logged In User Details Not Found. Cannot Add Secret'
      );
    }
  }

  saveFreshRecord() {
    this.loaderService.show();
    const payload: Secret = {
      title: this.title,
      secret: this.secret,
      userId: this.loggedInUserDetails.id,
      createdOn: new Date(),
      folderId: this.folderId ? this.folderId : '',
      isFavorite: false,
      isArchived: false,
    };
    this.intermediateService.create(payload, collection.SECRETS).subscribe({
      next: (secretId: any) => {
        this.loaderService.hide();
        if (secretId) {
          if (this.folderId) {
            this.updateSecretIdInFolder(secretId);
          } else {
            this.isSaveButtonDisabled = false;
            this.router.navigateByUrl('/dashboard');
            this.toast.showSuccessToast('Successfully added your Secret');
          }
        }
      },
      error: (err) => {
        console.error(err);
        this.isSaveButtonDisabled = false;
        this.loaderService.hide();
      },
    });
  }

  updateSecretIdInFolder(secretId: any) {
    const payload = {
      secrets: arrayUnion(secretId),
    };
    this.intermediateService
      .update(this.folderId, payload, collection.FOLDERS)
      .subscribe({
        next: () => {
          this.isSaveButtonDisabled = false;
          this.toast.showSuccessToast('Successfully added your Secret');
          this.router.navigateByUrl('/folder?folderId=' + this.folderId);
        },
        error: (err) => {
          console.error(err);
          this.isSaveButtonDisabled = false;
          this.toast.showErrorToast('Something went wrong');
        },
      });
  }

  saveEditedRecord() {
    if (
      this.title == this.existingSecret.title &&
      this.secret == this.existingSecret.secret
    ) {
      this.isSaveButtonDisabled = false;
      this.toast.showErrorToast(
        'Oops! Looks like nothing was modified. Please modify at least one field before saving.'
      );
    } else {
      this.isSaveButtonDisabled = true;
      const payload = {
        title: this.title,
        secret: this.secret,
        lastUpdatedOn: new Date(),
      };
      this.loaderService.show();
      this.intermediateService
        .update(this.secretId, payload, collection.SECRETS)
        .subscribe({
          next: () => {
            this.isSaveButtonDisabled = false;
            this.loaderService.hide();
            this.router.navigateByUrl('/dashboard');
          },
          error: (err) => {
            console.error(err);
            this.isSaveButtonDisabled = false;
            this.loaderService.hide();
          },
        });
    }
  }
}
