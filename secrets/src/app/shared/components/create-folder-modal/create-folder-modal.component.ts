import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { collection } from 'src/app/constants/secret.constant';
import { vibrantColors } from 'src/app/data/static-data';
import { Folder } from 'src/app/models/secret.interface';
import { HelperService } from 'src/app/services/helper.service';
import { IntermediateService } from 'src/app/services/intermediate.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-create-folder-modal',
  templateUrl: './create-folder-modal.component.html',
  styleUrls: ['./create-folder-modal.component.scss'],
  standalone: false,
})
export class CreateFolderModalComponent implements OnInit {
  _selectedFolder: any;
  folderName: any;
  disableSubmitBtn = false;
  @Input() isModalOpen = false;
  @Input() folders: any;
  @Input() set selectedFolder(value: any) {
    if (value) {
      this._selectedFolder = value;
      this.folderName = value.folderName;
    }
  }
  @Output() fetchFolders = new EventEmitter<any>();
  @Output() setModalFalse = new EventEmitter<any>();
  constructor(
    private toast: ToastService,
    private loaderService: LoaderService,
    private intermediateService: IntermediateService,
    private helperService: HelperService
  ) {}

  ngOnInit() {
    this.disableSubmitBtn = false;
  }

  ngOnChanges() {
    this.disableSubmitBtn = false;
  }

  onWillDismiss(eve: any) {
    this.isModalOpen = false;
    this.setModalFalse.next(true);
  }

  async onFolderCreation() {
    this.folderName = this.folderName ? this.folderName.trim() : '';
    if (this.folderName) {
      if (
        this._selectedFolder &&
        this.folderName == this._selectedFolder?.folderName
      ) {
        this.toast.showErrorToast(
          'Oops! Looks Like No Changes are made to the Name'
        );
        return;
      }

      if (this.folderName.length > 20) {
        this.toast.showErrorToast(
          'Username cannot contain more than 20 Characters'
        );
      } else if (!/^[A-Za-z0-9 ]+$/.test(this.folderName)) {
        this.toast.showErrorToast('Username cannot contain special characters');
      } else if (this.checkIfFolderNameIsAlreadyPresent()) {
        this.toast.showErrorToast(
          `Folder with name '${this.folderName}' is already present, Please enter different Folder name`
        );
      } else {
        if (this._selectedFolder && this._selectedFolder.id) {
          this.updateFolder();
        } else {
          this.createFolder();
        }
      }
    } else {
      this.toast.showErrorToast('Please Enter Folder Name');
    }
  }

  checkIfFolderNameIsAlreadyPresent() {
    if (this.folders.length > 0) {
      const isFolderNameAlreadyPresent = this.folders.find(
        (item: any) =>
          item.folderName.toLowerCase() == this.folderName.toLowerCase()
      );
      if (isFolderNameAlreadyPresent) {
        return true;
      }
    } else {
      return false;
    }
    return false;
  }

  async createFolder() {
    this.disableSubmitBtn = true;
    const loggedInUserDetails =
      await this.helperService.getLoggedInUserDetails();
    const payload: Folder = {
      userId: loggedInUserDetails?.id,
      folderName: this.folderName,
      folderColor: this.getRandomColor(),
      secrets: [],
      createdOn: new Date(),
    };
    this.loaderService.show();
    this.intermediateService.create(payload, collection.FOLDERS).subscribe({
      next: () => {
        this.disableSubmitBtn = false;
        this.loaderService.hide();
        this.toast.showSuccessToast('Successfully Created New Folder');
        this.isModalOpen = false;
        this.folderName = '';
        this.fetchFolders.next(true);
        this.setModalFalse.next(true);
      },
      error: (err) => {
        console.error(err);
        this.setModalFalse.next(true);
        this.toast.showErrorToast('Something Went Wrong!');
        this.loaderService.hide();
        this.disableSubmitBtn = false;
      },
    });
  }

  updateFolder() {
    this.disableSubmitBtn = true;
    this.loaderService.show();
    const payload = {
      folderName: this.folderName,
    };
    this.intermediateService
      .update(this._selectedFolder?.id, payload, collection.FOLDERS)
      .subscribe({
        next: () => {
          this.disableSubmitBtn = false;
          this.loaderService.hide();
          this.toast.showSuccessToast('Successfully Renamed Folder');
          this.isModalOpen = false;
          this.fetchFolders.next(true);
          this.setModalFalse.next(true);
        },
        error: (err) => {
          console.log(err);
          this.disableSubmitBtn = false;
          this.setModalFalse.next(true);
          this.toast.showErrorToast('Something Went Wrong!');
          this.loaderService.hide();
        },
      });
  }

  getRandomColor() {
    const randomIndex = Math.floor(Math.random() * vibrantColors.length);
    return vibrantColors[randomIndex];
  }
}
