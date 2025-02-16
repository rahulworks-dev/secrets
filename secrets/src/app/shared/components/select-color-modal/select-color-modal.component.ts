import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { collection } from 'src/app/constants/secret.constant';
import { vibrantColors } from 'src/app/data/static-data';
import { IntermediateService } from 'src/app/services/intermediate.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-select-color-modal',
  templateUrl: './select-color-modal.component.html',
  styleUrls: ['./select-color-modal.component.scss'],
  standalone: false,
})
export class SelectColorModalComponent implements OnInit {
  vibrantColors = vibrantColors;
  showPicker = false;
  selectedColor = '#ff0000'; // Default color
  @Input() isModalOpen = false;
  @Input() selectedFolder: any;
  @Output() setModalFalse = new EventEmitter<any>();
  @Output() fetchFolders = new EventEmitter<any>();
  constructor(
    private intermediateService: IntermediateService,
    private toast: ToastService,
    private loaderService: LoaderService
  ) {}

  ngOnInit() {}

  onWillDismiss(eve: any) {
    this.closeModal();
  }

  openColorPicker() {
    this.showPicker = !this.showPicker;
  }

  onColorChange(event: any) {
    this.selectedColor = event.color.hex; // Get selected color
  }

  updateFolderColor(color: any) {
    if (this.selectedFolder && this.selectedFolder?.folderColor !== color) {
      const payload = {
        folderColor: color,
      };
      this.loaderService.show();
      this.intermediateService
        .update(this.selectedFolder?.id, payload, collection.FOLDERS)
        .subscribe({
          next: () => {
            this.loaderService.hide();
            this.closeModal();
            this.fetchFolders.next(true);
          },
          error: (e) => {
            this.loaderService.hide();
            this.closeModal();
            console.log(e);
            this.toast.showErrorToast(
              'We Could not change color of the selected folder due to technical issue'
            );
          },
        });
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.setModalFalse.next(true);
  }
}
