import { Component, inject, OnInit } from '@angular/core';
import { arrayRemove, doc, Firestore, getDoc } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { collection, messages } from 'src/app/constants/secret.constant';
import { FirebaseHandlerService } from 'src/app/services/firebase-handler.service';
import { HelperService } from 'src/app/services/helper.service';
import { IntermediateService } from 'src/app/services/intermediate.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-folders',
  templateUrl: './folders.page.html',
  styleUrls: ['./folders.page.scss'],
  standalone: false,
})
export class FoldersPage {
  private firestore = inject(Firestore);
  folders: any;
  action: any;
  secretId: any;
  existingFolderId: any;
  isModalOpen = false;
  noFolderText: any;
  isAPIError = false;
  activeFolderType = 'myFolders';
  allAvailableFolders: any;
  loggedInUserDetails: any;
  duplicateFolders: any;
  isShared: boolean = false;
  constructor(
    private router: Router,
    private helperService: HelperService,
    public loaderService: LoaderService,
    private intermediateService: IntermediateService,
    private firebaseHandlerService: FirebaseHandlerService,
    private route: ActivatedRoute,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.getLoggedInUserDetails();
  }

  async getLoggedInUserDetails() {
    this.loggedInUserDetails =
      await this.helperService.getLoggedInUserDetails();
  }

  async ionViewDidEnter() {
    this.activeFolderType = 'myFolders';
    this.isShared = false;
    this.fetchFolders();
    this.readActionFromURL();
  }

  readActionFromURL() {
    this.route.queryParams.subscribe((param: any) => {
      this.action = param['action'];
      this.secretId = param['secretId'];
      this.existingFolderId = param['existingFolderId'];
    });
  }

  async fetchFolders() {
    this.isAPIError = false;
    this.noFolderText = '';
    this.folders = [];
    this.loaderService.show();
    this.intermediateService.readAll(collection.FOLDERS, '').subscribe({
      next: (resp) => {
        this.loaderService.hide();
        if (resp?.length > 0) {
          this.allAvailableFolders = resp;
          this.folders = this.allAvailableFolders?.filter(
            (item: any) => item?.userId == this.loggedInUserDetails?.id
          );
          this.folders = this.helperService.sortByTime(this.folders);
          this.duplicateFolders = this.folders;
        } else {
          this.noFolderText = messages.NO_FOLDERS;
        }
      },
      error: (e) => {
        this.loaderService.hide();
        this.isAPIError = true;
        this.noFolderText = messages.API_ERROR_MESSAGE;
      },
    });
  }

  onFolderType(folderType: any) {
    this.activeFolderType = folderType;
    if (this.activeFolderType === 'myFolders') {
      this.folders = this.duplicateFolders;
      this.isShared = false;
      // this.router.navigateByUrl('/my-folders');
    } else {
      this.isShared = true;
      this.folders = this.allAvailableFolders.filter(
        (item: any) => item?.sharedTo == this.loggedInUserDetails.id
      );
      // this.router.navigateByUrl('/shared');
    }
  }

  onAdd() {
    // this.secrets = this.originalSecrets;
    // this.revealText = 'Reveal All';
    this.router.navigateByUrl('/add-secret');
  }

  onSelectingFolder(folder: any) {
    if (this.secretId) {
      if (folder.secrets.includes(this.secretId)) {
        this.toast.showErrorToast('You cannot move to the same folder!');
        return;
      }

      const payload = {
        secrets: [...folder.secrets, this.secretId],
      };

      this.loaderService.show();
      this.intermediateService
        .update(folder?.id, payload, collection.FOLDERS)
        .subscribe({
          next: () => {
            this.updateFolderIdInSecret(folder);
          },
          error: (err) => {
            console.error(err);
            this.loaderService.hide();
            this.toast.showErrorToast(
              'Error Moving secrets to destination folder'
            );
          },
        });
    } else {
      this.loaderService.hide();
      const URL = `/folder?folderId=${folder?.id}&name=${
        folder?.folderName
      }&isSharedFolder=${this.activeFolderType === 'shared' ? true : false}`;
      this.router.navigateByUrl(URL);
    }
  }

  updateFolderIdInSecret(folder: any) {
    const payload = {
      folderId: folder.id,
    };
    this.loaderService.show();
    this.intermediateService
      .update(this.secretId, payload, collection.SECRETS)
      .subscribe({
        next: () => {
          if (this.existingFolderId) {
            this.updatePreviousFolderSecretsArray(folder);
          } else {
            this.showSuccessMsg(folder);
          }
        },
        error: (err) => {
          console.error(err);
          this.toast.showErrorToast(
            'Error Moving secrets to destination folder'
          );
        },
      });
  }

  async updatePreviousFolderSecretsArray(folder: any) {
    const payload = {
      secrets: arrayRemove(this.secretId),
    };

    // Check if Previous Folder exists

    const folderDocRef = doc(
      this.firestore,
      collection.FOLDERS,
      this.existingFolderId
    );
    const folderSnapshot = await getDoc(folderDocRef);

    if (!folderSnapshot.exists()) {
      console.warn('Folder does not exist in the database. Skipping update.');
      this.showSuccessMsg(folder);
      return;
    }

    this.intermediateService
      .update(this.existingFolderId, payload, collection.FOLDERS)
      .subscribe({
        next: (resp) => {
          this.showSuccessMsg(folder);
        },
        error: (err) => {
          console.error(err);
        },
      });
  }

  showSuccessMsg(folder: any) {
    this.toast.showSuccessToast('Successfully Moved to ' + folder?.folderName);
    const URL = `/folder?folderId=${folder?.id}&name=${folder?.folderName}`;
    this.router.navigateByUrl(URL);
  }

  onNewFolder() {
    this.isModalOpen = true;
  }
}
