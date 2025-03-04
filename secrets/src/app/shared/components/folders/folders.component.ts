import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { collection } from 'src/app/constants/secret.constant';
import { AdvancedFirebaseHandlerService } from 'src/app/services/advanced-firebase-handler.service';
import { FirebaseHandlerService } from 'src/app/services/firebase-handler.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-folders-reusable',
  templateUrl: './folders.component.html',
  styleUrls: ['./folders.component.scss'],
  standalone: false,
})
export class FoldersComponent implements OnInit {
  @Input() folders!: any[];
  @Input() setScrollableX = false;
  @Input() showHeader = true;
  @Input() noFolderText: any;
  @Input() isAPIError = false;
  @Input() isShared = false;
  @Output() onFolderSelection = new EventEmitter<any>();
  @Output() _fetchFolders = new EventEmitter<any>();
  @Output() onNewFolder = new EventEmitter<any>();
  isModalOpen = false;
  isColorModalOpen = false;
  selectedFolder: any;
  finalFolders: any[] = [];
  isShareModalOpen = false;
  constructor(
    private actionSheet: ActionSheetController,
    private toast: ToastService,
    public loaderService: LoaderService,
    private firebaseService: FirebaseHandlerService,
    private advancedFirebaseHandlerService: AdvancedFirebaseHandlerService,
    private alertCtrl: AlertController,
    private router: Router
  ) {}

  ngOnInit() {}

  ngOnChanges() {
    if (this.setScrollableX && this.folders) {
      this.finalFolders = this.folders.slice(0, 4);
    } else {
      this.finalFolders = this.folders;
    }
  }

  onSelectingFolder(folder: any) {
    this.onFolderSelection.next(folder);
  }

  fetchFolders(eve: any) {
    this._fetchFolders.next(true);
  }

  createNewFolder() {
    this.onNewFolder.next(true);
  }

  async on3Dots(folder: any, event: Event) {
    event.stopPropagation();
    console.log('3-dots clicked for:', folder);
    const actionSheet = await this.actionSheet.create({
      header: '',
      buttons: [
        {
          text: 'Rename',
          cssClass: 'icon',
          handler: () => {
            this.selectedFolder = folder;
            this.isModalOpen = true;
          },
        },
        {
          text: 'Change Color',
          cssClass: 'icon',
          handler: () => {
            this.selectedFolder = folder;
            this.isColorModalOpen = true;
          },
        },
        {
          text: folder?.sharedTo?.length > 0 ? 'Manage Access' : 'Share',
          cssClass: 'icon',
          handler: () => {
            if (folder?.sharedTo?.length > 0) {
              this.router.navigateByUrl(
                '/manage-access?folderId=' + folder?.id
              );
            } else {
              this.selectedFolder = folder;
              this.isShareModalOpen = true;
            }
          },
        },
        {
          text: 'Delete',
          cssClass: 'icon',
          handler: () => {
            this.showDeleteAlert(folder);
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

  async showDeleteAlert(folder: any) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Folder',
      message:
        'The secrets inside this folder will not be deleted; only the folder will be removed. Are you sure you want to proceed with deleting this folder ?',
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
            this.deleteFolder(folder);
          },
        },
      ],
    });

    await alert.present();
  }

  deleteFolder(folder: any) {
    if (!folder?.id) {
      this.toast.showErrorToast(
        'Something Went Wrong, We Could not delete the selected folder'
      );
      return;
    }

    this.advancedFirebaseHandlerService
      .deleteFolder(folder?.id, folder?.secrets)
      .then((item: any) => {
        this.toast.showSuccessToast('Successfully Deleted Folder');
        this._fetchFolders.next(true);
      });
  }

  trackById(index: number, item: any) {
    return item.id;
  }
}
