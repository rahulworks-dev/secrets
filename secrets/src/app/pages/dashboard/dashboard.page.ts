import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { collection, messages } from 'src/app/constants/secret.constant';
import { vibrantColors } from 'src/app/data/static-data';
import { Folder } from 'src/app/models/secret.interface';
import { FirebaseHandlerService } from 'src/app/services/firebase-handler.service';
import { HelperService } from 'src/app/services/helper.service';
import { IntermediateService } from 'src/app/services/intermediate.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false,
})
export class DashboardPage {
  secrets: any = [];
  revealText = 'Reveal All';
  isCreateFolderModalOpen = false;
  folderName: any;
  folders: any;
  hasNoFolders = false;
  isAPIError = false;
  noSecretText: any;
  noFolderText: any;
  constructor(
    private intermediateService: IntermediateService,
    private router: Router,
    private toast: ToastService,
    private actionSheet: ActionSheetController,
    private helperService: HelperService,
    public loaderService: LoaderService
  ) {}

  async ionViewDidEnter() {
    console.log('hi');
    this.fetchSecrets();
    this.fetchFolders();
  }

  fetchSecrets() {
    this.isAPIError = false;
    this.noSecretText = '';
    this.secrets = [];
    this.loaderService.show();

    this.intermediateService.readAll(collection.SECRETS).subscribe({
      next: (resp) => {
        this.loaderService.hide();
        const hasSecrets = Boolean(resp?.length);
        this.noSecretText = hasSecrets ? '' : messages.NO_SECRETS;
        if (hasSecrets) {
          this.secrets = resp.filter((item: any) => !item?.isArchived);
          if (this.secrets?.length > 0) {
            this.secrets = this.helperService.sortByTime(this.secrets);
          } else {
            this.noSecretText = messages.NO_SECRETS;
          }
        } else {
          this.secrets = [];
        }
      },
      error: (e) => {
        this.loaderService.hide();
        this.isAPIError = true;
        this.noSecretText = messages.API_ERROR_MESSAGE;
        console.error(e);
      },
    });
  }

  fetchFolders() {
    this.folders = [];
    this.loaderService.show();

    this.intermediateService.readAll(collection.FOLDERS).subscribe({
      next: (resp) => {
        this.loaderService.hide();
        const hasFolders = Boolean(resp?.length);
        this.hasNoFolders = !hasFolders;
        this.isAPIError = false;
        this.noFolderText = hasFolders ? '' : messages.NO_FOLDERS;
        this.folders = hasFolders ? this.helperService.sortByTime(resp) : [];
      },
      error: (e) => {
        this.loaderService.hide();
        this.hasNoFolders = false;
        this.isAPIError = true;
        this.noFolderText = messages.API_ERROR_MESSAGE;
        console.error(e);
      },
    });
  }

  openFolder(folder: any) {
    const URL = `/folder?folderId=${folder?.id}&name=${folder?.folderName}`;
    this.router.navigateByUrl(URL);
  }
}
