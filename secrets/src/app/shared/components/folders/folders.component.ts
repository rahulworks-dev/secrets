import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
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
  @Output() onFolderSelection = new EventEmitter<any>();
  @Output() _fetchFolders = new EventEmitter<any>();

  isModalOpen = false;
  isColorModalOpen = false;
  selectedFolder: any;
  constructor(
    private actionSheet: ActionSheetController,
    private toast: ToastService
  ) {}

  ngOnInit() {
  }

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
            this.toast.showInfoToast('This feature is coming soon');
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
}
