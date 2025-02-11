import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';
import { collection, storage } from 'src/app/constants/secret.constant';
import { FirebaseHandlerService } from 'src/app/services/firebase-handler.service';
import { HelperService } from 'src/app/services/helper.service';
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
  vibrantColors = [
    '#007bff', // Electric Blue
    '#ff007f', // Neon Pink
    '#32ff7e', // Lime Green
    '#ff5733', // Sunset Orange
    '#ffcc00', // Bright Yellow
    '#9b59b6', // Purple Vibe
  ];
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
  constructor(
    private router: Router,
    private firebaseHandler: FirebaseHandlerService,
    private storageService: StorageService,
    private toast: ToastService,
    private loaderService: LoaderService,
    private helperService: HelperService,
    private route: ActivatedRoute
  ) {}

  async ionViewDidEnter() {
    this.loggedInUserDetails =
      await this.helperService.getLoggedInUserDetails();
    this.route.queryParams.subscribe((params) => {
      this.secretId = params['id'];
      if (this.secretId) {
        this.getSecret();
      }
    });
  }

  async getSecret() {
    this.firebaseHandler
      .getItemById(this.secretId, collection.SECRETS)
      .subscribe({
        next: (resp) => {
          console.log(resp);
          if (resp) {
            this.existingSecret = resp;
            this.title = resp?.title || '';
            this.secret = resp?.secret || '';
          }
        },
      });
  }

  async save() {
    if (this.loggedInUserDetails) {
      if (this.title && this.secret) {
        if (this.secretId) {
          this.saveEditedRecord();
        } else {
          this.saveFreshRecord();
        }
      } else {
        this.toast.showErrorToast('Kindly fill out the form before submitting');
      }
    } else {
      this.toast.showErrorToast(
        'Logged In User Details Not Found. Cannot Add Secret'
      );
    }
  }

  saveFreshRecord() {
    const payload = {
      title: this.title,
      secret: this.secret,
      userId: this.loggedInUserDetails.id,
      createdOn: new Date(),
      folderId: '',
    };
    this.loaderService.show();
    this.firebaseHandler
      .create(payload, collection.SECRETS)
      .then(() => {
        this.loaderService.hide();
        this.router.navigateByUrl('/dashboard');
      })
      .catch((error) => {
        this.loaderService.hide();
      });
  }

  saveEditedRecord() {
    if (
      this.title == this.existingSecret.title &&
      this.secret == this.existingSecret.secret
    ) {
      this.toast.showErrorToast(
        'Oops! Looks like nothing was modified. Please modify at least one field before saving.'
      );
    } else {
      const payload = {
        title: this.title,
        secret: this.secret,
        userId: this.loggedInUserDetails.id,
        createdOn: new Date(),
        folderId: '',
      };
      this.loaderService.show();
      this.firebaseHandler
        .updateItem(this.secretId, payload, collection.SECRETS)
        .then(() => {
          this.loaderService.hide();
          this.router.navigateByUrl('/dashboard');
        })
        .catch((error) => {
          this.loaderService.hide();
        });
    }
  }
}
