import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { collection } from 'src/app/constants/secret.constant';
import { FirebaseHandlerService } from 'src/app/services/firebase-handler.service';
import { HelperService } from 'src/app/services/helper.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-folders',
  templateUrl: './folders.page.html',
  styleUrls: ['./folders.page.scss'],
  standalone: false,
})
export class FoldersPage implements OnInit {
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
  constructor(
    private router: Router,
    private helperService: HelperService,
    private loaderService: LoaderService,
    private firebaseHandlerService: FirebaseHandlerService
  ) {}

  async ngOnInit() {
    this.loggedInUserDetails =
      await this.helperService.getLoggedInUserDetails();
    this.fetchFolders();
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
}
