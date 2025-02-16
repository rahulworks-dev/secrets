import { Component, inject, OnInit } from '@angular/core';
import { arrayRemove, doc, Firestore, getDoc } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { collection } from 'src/app/constants/secret.constant';
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
  loggedInUserDetails: any;
  action: any;
  secretId: any;
  existingFolderId: any;
  isModalOpen = false;
  constructor(
    private router: Router,
    private helperService: HelperService,
    public loaderService: LoaderService,
    private intermediateService: IntermediateService,
    private route: ActivatedRoute,
    private toast: ToastService
  ) {}

  async ionViewDidEnter() {
    this.loggedInUserDetails =
      await this.helperService.getLoggedInUserDetails();
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
    try {
      this.folders = await this.readAllFolders();
      if (this.folders.length > 0) {
        this.folders = this.folders.filter(
          (item: any) => item.userId === this.loggedInUserDetails.id
        );
        this.folders = this.helperService.sortByTime(this.folders);
      }
    } catch (err) {}
  }

  readAllFolders(): Promise<any> {
    this.loaderService.show();
    return new Promise((resolve, reject) => {
      this.intermediateService.readAll(collection.FOLDERS).subscribe({
        next: (resp) => {
          this.loaderService.hide();
          resolve(resp);
        },
        error: (err) => {
          console.error(err);
          this.loaderService.hide();
          reject(err);
        },
      });
    });
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
      const URL = `/folder?folderId=${folder?.id}&name=${folder?.folderName}`;
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
