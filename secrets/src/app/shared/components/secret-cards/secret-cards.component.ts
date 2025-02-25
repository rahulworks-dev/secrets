import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { arrayRemove } from '@angular/fire/firestore';
import { NavigationEnd, Router } from '@angular/router';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { collection } from 'src/app/constants/secret.constant';
import { FirebaseHandlerService } from 'src/app/services/firebase-handler.service';
import { IntermediateService } from 'src/app/services/intermediate.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-secret-cards',
  templateUrl: './secret-cards.component.html',
  styleUrls: ['./secret-cards.component.scss'],
  standalone: false,
})
export class SecretCardsComponent implements OnInit {
  @Input() secrets: any = [];
  @Input() isAPIError = false;
  @Input() noSecretText: any;
  @Input() showTitle = true;
  @Output() _fetchSecrets = new EventEmitter<any>();
  isRevealed = false;
  filteredSecrets: any[] = [];
  isArchivePage = false;
  isSharedFolder = false;
  constructor(
    public loaderService: LoaderService,
    private router: Router,
    private toast: ToastService,
    private alertCtrl: AlertController,
    private firebaseHandlerService: FirebaseHandlerService,
    private actionSheet: ActionSheetController,
    private intermediateService: IntermediateService
  ) {}

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isRevealed = false; // Reset when route changes
      }
    });
  }

  ngOnChanges() {
    this.isArchivePage = this.router.url.includes('archives');
    this.isSharedFolder = this.router.url.includes('isSharedFolder=true');
  }

  onReveal() {
    this.isRevealed = !this.isRevealed;
  }

  onEdit(secretId: any) {
    if (!this.isRevealed) {
      this.toast.showInfoToast(
        'We recommend revealing the secret before performing any actions to ensure they are executed correctly.'
      );
      return;
    }
    if (secretId) {
      this.router.navigateByUrl('/edit-secret?id=' + secretId);
    } else {
      this.toast.showErrorToast('System Error, Could not initiate Edit Action');
    }
  }

  async onDelete(secret: any) {
    console.log(this.router.url);
    if (this.router.url.includes('folder')) {
      this.showActionSheet(secret);
    } else {
      this.showDeleteAlert(secret);
    }
  }

  async showActionSheet(secret: any) {
    if (!this.isRevealed) {
      this.toast.showInfoToast(
        'We recommend revealing the secret before performing any actions to ensure they are executed correctly.'
      );
      return;
    }
    const actionSheet = await this.actionSheet.create({
      header:
        'Do you want to delete this secret permanently or remove it from this folder?',
      buttons: [
        {
          text: 'Remove from Folder',
          handler: () => {
            this.removeFolderIdFromSecret(secret);
          },
        },
        {
          text: 'Delete',
          handler: () => {
            this.deleteSecret(secret);
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
      cssClass: ['custom-action-sheet', 'need-header'],
    });

    await actionSheet.present();
  }

  removeFolderIdFromSecret(secret: any) {
    const payload = {
      folderId: '',
    };
    this.intermediateService
      .update(secret?.id, payload, collection.SECRETS)
      .subscribe({
        next: () => {
          this.removeSecretIdInFolderAsWell(
            secret,
            'Successfully removed from this folder ! You can still find it in Home'
          );
        },
        error: (e) => {
          console.error(e);
        },
      });
  }

  async showDeleteAlert(secret: any) {
    if (!this.isRevealed) {
      this.toast.showInfoToast(
        'We recommend revealing the secret before performing any actions to ensure they are executed correctly.'
      );
      return;
    }
    const alert = await this.alertCtrl.create({
      header: 'Delete Secret',
      subHeader: 'This action cannot be undone!',
      message: 'Are you sure you want to delete this secret permanently ?',
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
            this.deleteSecret(secret);
          },
        },
      ],
    });

    await alert.present();
  }

  async deleteSecret(secret: any) {
    this.loaderService.show();
    try {
      await this.firebaseHandlerService
        .deleteItem(secret?.id, collection.SECRETS)
        .then(() => {
          if (secret?.folderId) {
            this.removeSecretIdInFolderAsWell(secret);
          } else {
            this.toast.showSuccessToast('Deleted Successfully');
          }
        });
    } catch (err) {
      console.error('Error deleting item', err);
    } finally {
      this.loaderService.hide(); // Ensures loader hides even if an error occurs
    }
  }

  removeSecretIdInFolderAsWell(
    secret: any,
    customErrorMsg = 'Deleted Successfully'
  ) {
    const payload = {
      secrets: arrayRemove(secret?.id),
    };
    this.intermediateService
      .update(secret?.folderId, payload, collection.FOLDERS)
      .subscribe({
        next: () => {
          this.loaderService.hide();
          this.toast.showSuccessToast(customErrorMsg);
        },
        error: (err) => {
          console.log(err);
          this.loaderService.hide();
          this.toast.showErrorToast('Partially Deleted');
        },
      });
  }

  async on3Dots(secret: any) {
    if (!this.isRevealed) {
      this.toast.showInfoToast(
        'We recommend revealing the secret before performing any actions to ensure they are executed correctly.'
      );
      return;
    }
    let buttons: any[] = [];
    if (this.router.url.includes('archives')) {
      buttons = [
        {
          text: 'Unarchive',
          handler: () => {
            this.archive(secret, false);
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ];
    } else {
      buttons = [
        {
          text: 'Move',
          handler: () => {
            let url = `/move-to?action=move&secretId=${secret?.id}`;
            if (secret?.folderId) {
              url += `&existingFolderId=${secret.folderId}`;
            }
            this.router.navigateByUrl(url);
          },
        },
        {
          text: 'Archive',
          handler: () => {
            this.archive(secret);
          },
        },
        {
          text: 'View in Full Screen',
          handler: () => {
            this.router.navigateByUrl(`/view-secret?id=${secret?.id}`);
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ];
    }
    const actionSheet = await this.actionSheet.create({
      header: '',
      buttons: buttons,
      cssClass: 'custom-action-sheet',
    });

    await actionSheet.present();
  }

  archive(secret: any, isArchive = true) {
    if (!this.isRevealed) {
      this.toast.showInfoToast(
        'We recommend revealing the secret before performing any actions to ensure they are executed correctly.'
      );
      return;
    }
    // this.loaderService.show();
    const payload = {
      isArchived: isArchive,
    };
    this.intermediateService
      .update(secret?.id, payload, collection.SECRETS)
      .subscribe({
        next: (resp) => {
          const message = isArchive
            ? 'Archived Succesfully, You can find Archives under Profile section.'
            : 'Unarchived Successfully';
          this.toast.showSuccessToast(message);
        },
        error: (e) => {
          console.error(e);
          this.toast.showErrorToast(
            'Something Went Wrong, We Could not Add to favorites'
          );
        },
      });
  }

  addToFavorite(secret: any) {
    if (!this.isRevealed) {
      this.toast.showInfoToast(
        'We recommend revealing the secret before performing any actions to ensure they are executed correctly.'
      );
      return;
    }
    // this.loaderService.show();
    const payload = {
      isFavorite: !secret?.isFavorite,
    };
    this.intermediateService
      .update(secret?.id, payload, collection.SECRETS)
      .subscribe({
        next: (resp) => {
          // this._fetchSecrets.next(true);
          // this.loaderService.hide();
          // this.toast.showSuccessToast('Added to Favorites');
        },
        error: (e) => {
          // this.loaderService.hide();
          console.error(e);
          this.toast.showErrorToast(
            'Something Went Wrong, We Could not Add to favorites'
          );
        },
      });
  }

  onCopy(text: any) {
    if (this.isRevealed) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          this.toast.showSuccessToast('Successfully Copied to Clipboard!');
        })
        .catch((err) => {
          console.error('Error copying text', err);
        });
    }
  }

  trackById(index: number, item: any) {
    return item.id;
  }
}
