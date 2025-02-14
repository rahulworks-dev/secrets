import { Component, OnInit } from '@angular/core';
import { arrayRemove } from '@angular/fire/firestore';
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
  vibrantColors = [
    '#007bff', // Electric Blue
    '#ff007f', // Neon Pink
    '#32ff7e', // Lime Green
    '#ff5733', // Sunset Orange
    '#ffcc00', // Bright Yellow
    '#9b59b6', // Purple Vibe
  ];
  folders: any;
  loggedInUserDetails: any;
  action: any;
  secretId: any;
  existingFolderId: any;
  isModalOpen = false;
  constructor(
    private router: Router,
    private helperService: HelperService,
    private loaderService: LoaderService,
    private firebaseHandlerService: FirebaseHandlerService,
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
      console.log(this.action);
    });
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
        // this.folders = this.folders.map((item: any) => {
        //   return {
        //     ...item,
        //     folderName:
        //       item?.folderName?.length > 15
        //         ? item?.folderName.substring(0, 15) + '...'
        //         : item?.folderName,
        //   };
        // });
      }
    } catch (err) {
      // this.toast.showErrorToast('')
      console.log(err);
    }
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
          error: () => {
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
        error: () => {
          this.toast.showErrorToast(
            'Error Moving secrets to destination folder'
          );
        },
      });
  }

  updatePreviousFolderSecretsArray(folder: any) {
    const payload = {
      secrets: arrayRemove(this.secretId),
    };
    this.intermediateService
      .update(this.existingFolderId, payload, collection.FOLDERS)
      .subscribe({
        next: (resp) => {
          this.showSuccessMsg(folder);
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
