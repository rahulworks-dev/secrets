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
export class DashboardPage implements OnInit {
  secrets: any;
  revealText = 'Reveal All';
  isModalOpen = false;
  folderName: any;
  isRevealed = false;
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

  async ionViewWillEnter() {
    this.isRevealed = false;
    this.loggedInUserDetails =
      await this.helperService.getLoggedInUserDetails();
    this.fetchSecrets();
    this.fetchFolders();
  }

  async ngOnInit() {}

  fetchSecrets() {
    if (this.loggedInUserDetails) {
      this.loaderService.show();
      this.firebaseHandlerService.readAll(collection.SECRETS).subscribe({
        next: (resp) => {
          console.log('resp: ', resp);
          this.loaderService.hide();
          if (resp?.length > 0) {
            this.hasNoSecrets = false;
            this.secrets = resp.filter(
              (item: any) => item?.userId == this.loggedInUserDetails.id
            );
            this.secrets = this.helperService.sortByTime(this.secrets);
            console.log(this.secrets);
          } else {
            this.hasNoSecrets = true;
          }
        },
      });
    } else {
      this.toast.showErrorToast('Logged-In User Details Not Found');
    }
  }

  async fetchFolders() {
    try {
      this.folders = await this.readAllFolders();
      console.log('this.folders: ', this.folders);
      if (this.folders.length > 0) {
        this.folders = this.folders.filter(
          (item: any) => item.userId === this.loggedInUserDetails.id
        );
        this.folders = this.helperService.sortByTime(this.folders);
      }
    } catch (err) {
      this.toast.showErrorToast('Error Fetching Folders');
      console.log(err);
    }
  }

  onReveal() {
    this.isRevealed = !this.isRevealed;
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
            this.isRevealed = false;
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
    if (this.folderName) {
      if (!/^[A-Za-z0-9 ]+$/.test(this.folderName)) {
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
      const folders = await this.readAllFolders();
      if (folders.length > 0) {
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

  onEdit(secretId: any) {
    if (secretId) {
      this.router.navigateByUrl('/add-secret?id=' + secretId);
    } else {
      this.toast.showErrorToast('System Error, Could not initiate Edit Action');
    }
  }

  async onDelete(secretId: any) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Secret',
      subHeader: 'This action cannot be undone!',
      message: 'Are you sure you want to delete this secret ?',
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'alert-button-cancel',
          handler: () => {
            console.log('Alert canceled');
          },
        },
        {
          text: 'Yes',
          role: 'confirm',
          cssClass: 'alert-button-confirm',
          handler: () => {
            console.log('Alert confirmed');
            this.firebaseHandlerService
              .deleteItem(secretId, collection.SECRETS)
              .then(() => {
                this.toast.showSuccessToast('Deleted Successfully');
              })
              .catch((err) => {
                console.error('Error copying text', err);
              });
          },
        },
      ],
    });

    await alert.present();
  }
}
