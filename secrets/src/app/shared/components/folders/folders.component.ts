import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { collection } from 'src/app/constants/secret.constant';
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
  @Output() onFolderSelection = new EventEmitter<any>();
  @Output() _fetchFolders = new EventEmitter<any>();

  isModalOpen = false;
  isColorModalOpen = false;
  selectedFolder: any;
  constructor(
    private actionSheet: ActionSheetController,
    private toast: ToastService,
    public loaderService: LoaderService,
    private firebaseService: FirebaseHandlerService,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {}

  onSelectingFolder(folder: any) {
    this.onFolderSelection.next(folder);
  }

  fetchFolders(eve: any) {
    this._fetchFolders.next(true);
  }

  async on3Dots(folder: any, event: Event) {
    event.stopPropagation();
    console.log('3-dots clicked for:', folder);
    const actionSheet = await this.actionSheet.create({
      header: '',
      buttons: [
        {
          text: 'Rename',
          handler: () => {
            this.selectedFolder = folder;
            this.isModalOpen = true;
          },
        },
        {
          text: 'Change Color',
          handler: () => {
            this.selectedFolder = folder;
            this.isColorModalOpen = true;
          },
        },
        {
          text: 'Delete',
          handler: () => {
            this.showDeleteAlert(folder?.id);
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

  async showDeleteAlert(folderId: any) {
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
            this.deleteFolder(folderId);
          },
        },
      ],
    });

    await alert.present();
  }

  deleteFolder(folderId: any) {
    if (!folderId) {
      this.toast.showErrorToast(
        'Something Went Wrong, We Could not delete the selected folder'
      );
      return;
    }
    this.firebaseService
      .deleteItem(folderId, collection.FOLDERS)
      .then((item: any) => {
        this.toast.showSuccessToast('Successfully Deleted Folder');
      });
  }
}
