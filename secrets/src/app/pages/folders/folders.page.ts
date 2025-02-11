import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { collection } from 'src/app/constants/secret.constant';
import { FirebaseHandlerService } from 'src/app/services/firebase-handler.service';
import { HelperService } from 'src/app/services/helper.service';
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
  constructor(
    private router: Router,
    private helperService: HelperService,
    private loaderService: LoaderService,
    private firebaseHandlerService: FirebaseHandlerService,
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
      console.log(this.action);
    });
  }

  async fetchFolders() {
    console.log('HI');
    try {
      this.folders = await this.readAllFolders();
      console.log('this.folders: ', this.folders);
      if (this.folders.length > 0) {
        this.folders = this.folders.filter(
          (item: any) => item.userId === this.loggedInUserDetails.id
        );
        this.folders = this.helperService.sortByTime(this.folders);
      }
    } catch (err) {
      // this.toast.showErrorToast('')
      console.log(err);
    }
  }

  readAllFolders(): Promise<any> {
    this.loaderService.show();
    return new Promise((resolve, reject) => {
      this.firebaseHandlerService.readAll(collection.FOLDERS).subscribe({
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
    console.log('folder: ', folder);
    if (this.secretId) {
      console.log(this.secretId);
      console.log(folder.secrets.includes(this.secretId));
      if (folder.secrets.includes(this.secretId)) {
        this.toast.showErrorToast('You cannot move to the same folder!');
        return;
      }

      const payload = {
        ...folder,
        secrets: [...folder.secrets, this.secretId],
      };

      this.loaderService.show();
      this.firebaseHandlerService
        .updateItem(folder?.id, payload, collection.FOLDERS)
        .then(() => {
          this.loaderService.hide();
          this.toast.showSuccessToast(
            'Successfully Moved to ' + folder?.folderName
          );
          this.router.navigateByUrl('/secrets?folderId=' + folder?.id);
          // this.updateFolderIdInSecret(folder);
        })
        .catch((err) => {
          this.loaderService.hide();
          console.error('Error Moving secrets to destination folder', err);
        });
    } else {
      this.loaderService.hide();
      this.router.navigateByUrl('/secrets?folderId=' + folder?.id);
    }
  }

  updateFolderIdInSecret(folder: any) {
    const payload = {
      folderId: folder.id,
    };
    this.firebaseHandlerService
      .updateItem(this.secretId, payload, collection.SECRETS)
      .then(() => {
        this.toast.showSuccessToast(
          'Successfully Moved to ' + folder?.folderName
        );
        this.router.navigateByUrl('/secrets?folderId=' + folder?.id);
      })
      .catch((err) => {
        console.error('Error Moving secrets to destination folder', err);
      });
  }
}
