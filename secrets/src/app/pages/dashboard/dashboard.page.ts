import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { collection } from 'src/app/constants/secret.constant';
import { vibrantColors } from 'src/app/data/static-data';
import { Folder } from 'src/app/models/secret.interface';
import { FirebaseHandlerService } from 'src/app/services/firebase-handler.service';
import { HelperService } from 'src/app/services/helper.service';
import { IntermediateService } from 'src/app/services/intermediate.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false,
})
export class DashboardPage {
  secrets: any = [];
  revealText = 'Reveal All';
  isModalOpen = false;
  folderName: any;
  loggedInUserDetails: any;
  folders: any;
  hasNoSecrets = false;
  i = 0;
  constructor(
    private intermediateService: IntermediateService,
    private router: Router,
    private toast: ToastService,
    private actionSheet: ActionSheetController,
    private helperService: HelperService,
    public loaderService: LoaderService
  ) {}

  async ionViewDidEnter() {
    this.loggedInUserDetails =
      await this.helperService.getLoggedInUserDetails();
    this.fetchSecrets();
    this.fetchFolders();
  }

  fetchSecrets() {
    if (this.loggedInUserDetails) {
      this.loaderService.show();
      this.intermediateService.readAll(collection.SECRETS).subscribe({
        next: (resp) => {
          this.loaderService.hide();
          if (resp?.length > 0) {
            this.secrets = resp;
            this.secrets = this.helperService.sortByTime(this.secrets);
          } else {
            this.secrets = [];
          }
        },
        error: (e) => {
          console.error(e);
          this.toast.showErrorToast(
            'Error Fetching Your Secrets, Please try again later'
          );
        },
      });
    } else {
      this.toast.showErrorToast('Logged-In User Details Not Found');
      this.secrets = [];
    }
  }

  fetchFolders() {
    if (this.loggedInUserDetails) {
      this.loaderService.show();
      this.intermediateService.readAll(collection.FOLDERS).subscribe({
        next: (resp) => {
          this.loaderService.hide();
          if (resp?.length > 0) {
            this.folders = resp;
            this.folders = this.helperService.sortByTime(this.folders);
          } else {
            this.folders = [];
          }
        },
        error: (e) => {
          console.error(e);
          this.toast.showErrorToast(
            'Error Fetching Your Secrets, Please try again later'
          );
        },
      });
    } else {
      this.toast.showErrorToast('Logged-In User Details Not Found');
      this.folders = [];
    }
  }

  onCopy(textToCopy: any) {
    if (this.revealText === 'Reset') {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          this.toast.showErrorToast('Text copied to clipboard!');
        })
        .catch((err) => {
          console.error('Error copying text', err);
        });
    }
  }

  async onAdd() {
    const actionSheet = await this.actionSheet.create({
      header: '',
      buttons: [
        {
          text: 'Create New Folder',
          handler: () => {
            this.setOpenModal(true);
          },
        },
        {
          text: 'Add Secret',
          handler: () => {
            this.router.navigateByUrl('/add-secret');
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

  setOpenModal(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  onWillDismiss(eve: any) {
    this.setOpenModal(false);
  }

  openFolder(folder: any) {
    const URL = `/folder?folderId=${folder?.id}&name=${folder?.folderName}`;
    this.router.navigateByUrl(URL);
  }
}
