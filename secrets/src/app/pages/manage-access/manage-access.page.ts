import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { arrayRemove } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { distinctUntilChanged, take, takeUntil, tap } from 'rxjs';
import { collection } from 'src/app/constants/secret.constant';
import { IntermediateService } from 'src/app/services/intermediate.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-manage-access',
  templateUrl: './manage-access.page.html',
  styleUrls: ['./manage-access.page.scss'],
  standalone: false,
})
export class ManageAccessPage implements OnInit {
  folderId: any;
  folderDetails: any;
  isShareModalOpen = false;
  constructor(
    private route: ActivatedRoute,
    private intermediateService: IntermediateService,
    private loaderService: LoaderService,
    private toast: ToastService,
    private alertCtrl: AlertController,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit() {}

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
    this.loaderService.show();
    const subscription = this.intermediateService
      .readById(this.folderId, collection.FOLDERS)
      .subscribe({
        next: (resp) => {
          this.loaderService.hide();
          if (resp) {
            console.log('resp: ', resp);
            if (resp?.sharedTo.length < 1) {
              this.location.back();
              subscription.unsubscribe();
              // this.noSecretText = mess
              // this.router.navigateByUrl('/dashboard');
            }
            this.folderDetails = resp;
          } else {
            // this.noSecretText = messages.FOLDER_NOT_FOUND;
          }
        },
        error: (err) => {
          this.loaderService.hide();
          // this.isAPIError = true;
          // this.noSecretText = messages.API_ERROR_MESSAGE;
          console.error(err);
        },
      });
  }

  addUser() {
    if (this.folderDetails?.sharedTo.length == 5) {
      this.toast.showErrorToast('Up to 5 people can have access to a folder.');
    } else {
      this.isShareModalOpen = true;
    }
  }

  removeUser(user: any) {
    if (!user) return;
    const payload = {
      sharedTo: arrayRemove(user),
    };
    this.intermediateService
      .update(this.folderDetails?.id, payload, collection.FOLDERS)
      .subscribe({
        next: (resp) => {
          this.toast.showSuccessToast(
            `${user?.username} no longer has access to this folder.`
          );
        },
      });
  }

  async showRemoveAlert(user: any) {
    const alert = await this.alertCtrl.create({
      header: 'Revoke Access',
      message: `Are you sure you want to revoke access for ${user?.username}?`,
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'alert-button-cancel',
          handler: () => {},
        },
        {
          text: 'Yes',
          role: 'confirm',
          cssClass: 'alert-button-confirm',
          handler: () => {
            this.removeUser(user);
          },
        },
      ],
    });

    await alert.present();
  }
}
