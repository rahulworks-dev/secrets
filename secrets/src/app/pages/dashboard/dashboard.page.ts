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
  constructor(
    private firebaseHandlerService: FirebaseHandlerService,
    private intermediateService: IntermediateService,
    private router: Router,
    private toast: ToastService,
    private actionSheet: ActionSheetController,
    private helperService: HelperService,
    public loaderService: LoaderService,
    private alertCtrl: AlertController
  ) {}

  async ionViewDidEnter() {
    console.log('DASHBOARD');
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
          console.log('resp: ', resp);
          this.loaderService.hide();
          if (resp?.length > 0) {
            this.secrets = resp;
            this.secrets = this.helperService.sortByTime(this.secrets);
          } else {
            this.secrets = [];
          }
        },
        error: (e) => {
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

  async fetchFolders() {
    try {
      this.folders = await this.readAllFolders();
      if (this.folders.length > 0) {
        this.folders = this.folders.filter(
          (item: any) => item.userId === this.loggedInUserDetails.id
        );
        this.folders = this.helperService.sortByTime(this.folders);
        // this.folders = this.folders.map((item: any) => {
        //   return {
        //     ...item,
        //     folderName:
        //       item?.folderName?.length > 10
        //         ? item?.folderName.substring(0, 10) + '...'
        //         : item?.folderName,
        //   };
        // });
      }
    } catch (err) {
      this.toast.showErrorToast('Error Fetching Folders');
      console.log(err);
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

  readAllFolders(): Promise<any> {
    this.loaderService.show();
    return new Promise((resolve, reject) => {
      this.intermediateService.readAll(collection.FOLDERS).subscribe({
        next: (resp) => {
          this.loaderService.hide();
          resolve(resp);
        },
        error: (err) => {
          this.loaderService.hide();
          reject(err);
        },
      });
    });
  }

  onWillDismiss(eve: any) {
    this.setOpenModal(false);
  }

  openFolder(folder: any) {
    const URL = `/folder?folderId=${folder?.id}&name=${folder?.folderName}`;
    this.router.navigateByUrl(URL);
  }
}
