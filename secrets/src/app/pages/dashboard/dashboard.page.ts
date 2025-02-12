import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { collection } from 'src/app/constants/secret.constant';
import { vibrantColors } from 'src/app/data/static-data';
import { FirebaseHandlerService } from 'src/app/services/firebase-handler.service';
import { HelperService } from 'src/app/services/helper.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false,
})
export class DashboardPage {
  secrets: any;
  revealText = 'Reveal All';
  isModalOpen = false;
  folderName: any;
  loggedInUserDetails: any;
  folders: any;
  hasNoSecrets = false;
  constructor(
    private firebaseHandlerService: FirebaseHandlerService,
    private router: Router,
    private toast: ToastService,
    private actionSheet: ActionSheetController,
    private helperService: HelperService,
    public loaderService: LoaderService,
    private alertCtrl: AlertController
  ) {}

  async ionViewDidEnter() {
    this.loggedInUserDetails =
      await this.helperService.getLoggedInUserDetails();
    this.fetchSecrets();
    this.fetchFolders();
  }

  fetchSecrets() {
    console.log('FETCHING SECRETS');
    if (this.loggedInUserDetails) {
      this.loaderService.show();
      this.firebaseHandlerService.readAll(collection.SECRETS).subscribe({
        next: (resp) => {
          this.loaderService.hide();
          if (resp?.length > 0) {
            this.hasNoSecrets = false;
            this.secrets = resp.filter(
              (item: any) => item?.userId == this.loggedInUserDetails.id
            );
            if (this.secrets.length > 0) {
              this.secrets = this.helperService.sortByTime(this.secrets);
            } else {
              this.hasNoSecrets = true;
            }
          } else {
            this.hasNoSecrets = true;
            this.secrets = [];
          }
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
        this.folders = this.folders.map((item: any) => {
          return {
            ...item,
            folderName:
              item?.folderName?.length > 15
                ? item?.folderName.substring(0, 15) + '...'
                : item?.folderName,
          };
        });
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

  async onFolderCreation() {
    this.folderName = this.folderName ? this.folderName.trim() : '';
    if (this.folderName) {
      if (this.folderName.length > 20) {
        this.toast.showErrorToast('Folder Name cannot exceed 15 Characters');
      } else if (!/^[A-Za-z0-9 ]+$/.test(this.folderName)) {
        this.toast.showErrorToast('Username cannot contain special characters');
      } else if (await this.checkIfFolderNameIsAlreadyPresent()) {
        this.toast.showErrorToast(
          `Folder with name '${this.folderName}' is already present, Please enter different Folder name`
        );
      } else {
        if (this.loggedInUserDetails) {
          const payload = {
            userId: this.loggedInUserDetails?.id,
            folderName: this.folderName,
            folderColor: this.getRandomColor(),
            secrets: [],
            createdOn: new Date(),
          };
          this.loaderService.show();
          this.firebaseHandlerService
            .create(payload, collection.FOLDERS)
            .then(() => {
              this.loaderService.hide();
              this.toast.showSuccessToast('Successfully Created New Folder');
              this.setOpenModal(false);
              this.folderName = '';
              this.fetchFolders();
            })
            .catch((error) => {
              this.toast.showErrorToast('Something Went Wrong!');
              this.loaderService.hide();
            });
        } else {
          this.toast.showErrorToast(
            'Logged-in User details Not found, Folder cannot be created'
          );
        }
      }
    } else {
      this.toast.showErrorToast('Please Enter Folder Name');
    }
  }

  readAllFolders(): Promise<any> {
    this.loaderService.show();
    return new Promise((resolve, reject) => {
      this.firebaseHandlerService.readAll(collection.FOLDERS).subscribe({
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

  async checkIfFolderNameIsAlreadyPresent() {
    try {
      let folders = await this.readAllFolders();
      if (folders.length > 0) {
        folders = folders.filter(
          (item: any) => item.userId === this.loggedInUserDetails.id
        );
        const isFolderNameAlreadyPresent = folders.find(
          (item: any) =>
            item.folderName.toLowerCase() == this.folderName.toLowerCase()
        );
        if (isFolderNameAlreadyPresent) {
          return true;
        }
      } else {
        return false;
      }
    } catch (err) {
      return false;
    }
    return false;
  }

  onWillDismiss(eve: any) {
    this.setOpenModal(false);
  }

  getRandomColor() {
    const randomIndex = Math.floor(Math.random() * vibrantColors.length);
    return vibrantColors[randomIndex];
  }

  openFolder(folder: any) {
    const URL = `/folder?folderId=${folder?.id}&name=${folder?.folderName}`;
    this.router.navigateByUrl(URL);
  }
}
