import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { arrayRemove } from '@angular/fire/firestore';
import { NavigationEnd, Router } from '@angular/router';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { collection, messages } from 'src/app/constants/secret.constant';
import { AdvancedFirebaseHandlerService } from 'src/app/services/advanced-firebase-handler.service';
import { FirebaseHandlerService } from 'src/app/services/firebase-handler.service';
import { HelperService } from 'src/app/services/helper.service';
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
  @ViewChild('popover') popover!: HTMLIonPopoverElement;
  filteredSecrets: any[] = [];
  originalSecrets: any[] = [];
  @Input() set secrets(value: any) {
    if (value) {
      this.filteredSecrets = value;
      this.originalSecrets = value;
    }
  }
  @Input() isAPIError = false;
  @Input() noSecretText: any;
  @Input() showTitle = true;
  @Output() _fetchSecrets = new EventEmitter<any>();
  isRevealed = false;
  isArchivePage = false;
  isSharedFolder = false;
  isSortingAndFilterOpen = false;

  // Bulk Actions
  isBulkActionActivated = false;
  bulkActionSecrets: any[] = [];
  isPopoverOpen = false;
  isHomePage = false;
  selectAll = false;
  constructor(
    public loaderService: LoaderService,
    private router: Router,
    private toast: ToastService,
    private alertCtrl: AlertController,
    private firebaseHandlerService: FirebaseHandlerService,
    private advancedFirebaseHandleService: AdvancedFirebaseHandlerService,
    private actionSheet: ActionSheetController,
    private intermediateService: IntermediateService,
    private helperService: HelperService
  ) {}

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isRevealed = false; // Reset when route changes
        this.isBulkActionActivated = false;
        this.helperService.hideBottomTab$.next(false);
        this.bulkActionSecrets = [];
        this.isPopoverOpen = false;
        this.selectAll = false;
      }
    });
  }

  ngOnChanges() {
    this.isArchivePage = this.router.url.includes('archives');
    this.isSharedFolder = this.router.url.includes('isSharedFolder=true');
    this.isHomePage = this.router.url.includes('dashboard');
  }

  onReveal() {
    this.isRevealed = !this.isRevealed;
  }

  onEdit(secretId: any) {
    if (secretId) {
      this.router.navigateByUrl('/edit-secret?id=' + secretId);
    } else {
      this.toast.showErrorToast('System Error, Could not initiate Edit Action');
    }
  }

  async onDelete(secret: any) {
    if (this.router.url.includes('folder')) {
      this.showActionSheet(secret);
    } else {
      this.showDeleteAlert(secret);
    }
  }

  async showActionSheet(secret: any) {
    const actionSheet = await this.actionSheet.create({
      header:
        'Do you want to delete this secret permanently or remove it from this folder?',
      buttons: [
        {
          text: 'Remove from Folder',
          handler: () => {
            this.removeSecretFromFolder(secret);
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

  async showDeleteAlert(secret?: any) {
    const pronoun =
      this.bulkActionSecrets.length > 1 ? 'these secrets' : 'this secret';
    const noun = this.bulkActionSecrets.length > 1 ? 'Secrets' : 'Secret';
    const alert = await this.alertCtrl.create({
      header: `Delete ${noun}`,
      subHeader: 'This action cannot be undone!',
      message: `Are you sure you want to delete ${pronoun} permanently ?`,
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
            if (secret) {
              this.deleteSecret(secret);
            } else {
              this.bulkDelete();
            }
          },
        },
      ],
    });

    await alert.present();
  }

  removeSecretFromFolder(secret: any) {
    this.advancedFirebaseHandleService
      .removeSecretFromFolder(secret?.id, secret?.folderId)
      .then(() => {
        this.toast.showSuccessToast(
          'Successfully removed from this folder ! You can still find it in Home Page'
        );
        this._fetchSecrets;
      })
      .catch(() => {
        this.toast.showErrorToast(
          'System Error! Could not remove Remove Secret from this folder'
        );
      });
  }

  async deleteSecret(secret: any) {
    this.loaderService.show();
    try {
      await this.advancedFirebaseHandleService
        .deleteSecret(secret?.id, secret?.folderId)
        .then(() => {
          this.toast.showSuccessToast('Deleted Successfully');
        });
    } catch (err) {
      this.toast.showErrorToast('System Error!');
      console.error('Error deleting item', err);
    } finally {
      this.loaderService.hide(); // Ensures loader hides even if an error occurs
    }
  }

  async on3Dots(secret: any) {
    const isArchivePage = this.router.url.includes('archives');

    const buttons: any = isArchivePage
      ? [
          {
            text: 'Unarchive',
            handler: () => this.archive(secret, false),
          },
        ]
      : [
          {
            text: 'Move',
            handler: () => {
              let url = `/move-to?action=move&secretId=${secret?.id}`;
              if (secret?.folderId)
                url += `&existingFolderId=${secret.folderId}`;
              this.router.navigateByUrl(url);
            },
          },
          {
            text: 'Archive',
            handler: () => this.archive(secret),
          },
          {
            text: 'View in Full Screen',
            handler: () =>
              this.router.navigateByUrl(`/view-secret?id=${secret?.id}`),
          },
        ];

    // Common cancel button
    buttons.push({
      text: 'Cancel',
      role: 'cancel',
      data: { action: 'cancel' },
    });

    const actionSheet = await this.actionSheet.create({
      header: '',
      buttons,
      cssClass: 'custom-action-sheet',
    });

    await actionSheet.present();
  }

  archive(secret: any, isArchive = true) {
    const payload = {
      isArchived: isArchive,
    };
    this.intermediateService
      .update(secret?.id, payload, collection.SECRETS)
      .subscribe({
        next: () => {
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
    const payload = {
      isFavorite: !secret?.isFavorite,
    };
    this.intermediateService
      .update(secret?.id, payload, collection.SECRETS)
      .subscribe({
        next: () => {},
        error: (e) => {
          console.error(e);
          this.toast.showErrorToast(
            'Something Went Wrong, We Could not Add to favorites'
          );
        },
      });
  }

  onCopy(text: any) {
    this.helperService.copyToClipboard(text);
  }

  trackById(index: number, item: any) {
    return item.id;
  }

  async handleSearchInput(eve: any) {
    const loggedInUserDetails =
      await this.helperService.getLoggedInUserDetails();
    const searchInput = eve.target.value;
    this.filteredSecrets = this.originalSecrets.filter((item: any) =>
      item.title.toLowerCase().startsWith(searchInput.toLowerCase())
    );
    this.filteredSecrets = this.helperService.sortBy(this.filteredSecrets, {
      sortingPreferenceType: loggedInUserDetails?.sortingPreferenceType || 0,
      sortingPreferenceOrder: loggedInUserDetails?.sortingPreferenceOrder,
    });
    if (this.filteredSecrets.length < 1) {
      this.noSecretText = messages.NO_SECRETS_FOUND_ON_SEARCH;
    } else {
      this.noSecretText = '';
    }
  }

  openSortModal() {
    this.isSortingAndFilterOpen = true;
  }

  closeModal(payload: any) {
    this.isSortingAndFilterOpen = false;
    if (Object.values(payload)?.length > 0) {
      this.filteredSecrets = this.helperService.sortBy(
        this.filteredSecrets,
        payload
      );
    }
  }

  // Bulk Action Start
  onSelectSecrets() {
    this.isRevealed = true;
    this.isBulkActionActivated = true;
  }

  onCancelBulkAction() {
    this.helperService.hideBottomTab$.next(false);
    this.bulkActionSecrets = [];
    this.isBulkActionActivated = false;
    this.isRevealed = false;
    this.isPopoverOpen = false;
    this.filteredSecrets = this.originalSecrets;
    this.selectAll = false;
  }

  onCheckBox(event: any, secret: any) {
    const isChecked = event.detail.checked;

    if (isChecked) {
      this.bulkActionSecrets.push(secret);
    } else {
      this.bulkActionSecrets = this.bulkActionSecrets.filter(
        (b_secret) => b_secret.id !== secret.id
      );
    }

    this.helperService.hideBottomTab$.next(this.bulkActionSecrets?.length > 0);

    // Update selectAll state
    this.selectAll =
      this.bulkActionSecrets.length === this.filteredSecrets.length;
  }

  onCheckBoxAll(event: any) {
    const isChecked = event.detail.checked;
    this.selectAll = isChecked;

    if (isChecked) {
      // Select all secrets
      this.bulkActionSecrets = [...this.filteredSecrets];
    } else {
      // Deselect all secrets
      this.bulkActionSecrets = [];
    }
    this.helperService.hideBottomTab$.next(this.bulkActionSecrets?.length > 0);
  }

  bulkDelete() {
    this.advancedFirebaseHandleService
      .deleteSecrets(this.bulkActionSecrets)
      .then(() => {
        // this.removeSecretIdFromFolder();
        this.toast.showSuccessToast('Successfully Deleted Selected Secrets');
        this.isBulkActionActivated = false;
        this.bulkActionSecrets = [];
        this.helperService.hideBottomTab$.next(false);
        this.isPopoverOpen = false;
      })
      .catch(() => {
        this.toast.showErrorToast(
          'We Could not delete selected secrets due to technical issue, Please try again'
        );
      });
  }

  bulkArchive() {
    this.loaderService.show();
    this.advancedFirebaseHandleService
      .updateInBulk(
        this.bulkActionSecrets.map((i) => i?.id),
        collection.SECRETS,
        { isArchived: this.isArchivePage ? false : true }
      )
      .then(() => {
        this.loaderService.hide();
        const errorMsg = this.isArchivePage
          ? 'Unarchived Successfully'
          : 'Archived Selected Secrets Succesfully, You can find Archives under Profile section.';
        this.toast.showSuccessToast(errorMsg);
        this.isBulkActionActivated = false;
        this.bulkActionSecrets = [];
        this.helperService.hideBottomTab$.next(false);
        this.isPopoverOpen = false;
      })
      .catch((e) => {
        this.loaderService.hide();
        console.error(e);
        this.toast.showErrorToast('System Error');
      });
  }

  presentPopover(e: Event) {
    this.popover.event = e;
    this.isPopoverOpen = true;
  }

  // onCheckBoxAll(eve: any) {
  //   console.log('HI');
  //   const isChecked = eve.detail.checked;
  //   if (isChecked) {
  //     this.bulkActionSecrets = [...this.filteredSecrets];
  //     console.log('this.bulkActionSecrets: ', this.bulkActionSecrets);
  //     this.isCheckedAll = true;
  //     this.helperService.hideBottomTab$.next(true);
  //     this.showBulkActionTab = true;
  //   } else {
  //     this.isCheckedAll = false;
  //     this.bulkActionSecrets = [];
  //   }
  // }

  isChecked(secretId: any) {
    return this.bulkActionSecrets.some((i: any) => i.id === secretId);
  }
}
