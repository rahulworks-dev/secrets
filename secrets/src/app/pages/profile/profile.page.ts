import { Component, OnInit } from '@angular/core';
import { Auth, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { collection, storage } from 'src/app/constants/secret.constant';
import { profileExtrasOne, profileExtrasTwo } from 'src/app/data/static-data';
import { HelperService } from 'src/app/services/helper.service';
import { IntermediateService } from 'src/app/services/intermediate.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage {
  profileExtrasOne = profileExtrasOne;
  profileExtrasTwo = profileExtrasTwo;
  isModalOpen = false;
  loggedInUserDetails: any;
  firstScreenHeader: any;
  secondScreenHeader: any;
  constructor(
    private alertCtrl: AlertController,
    private storageService: StorageService,
    private router: Router,
    private toast: ToastService,
    private helperService: HelperService,
    private intermediateService: IntermediateService,
    private auth: Auth
  ) {}

  ionViewDidEnter() {
    this.getLoggedInUserDetails();
  }

  getLoggedInUserDetails() {
    this.loggedInUserDetails = this.helperService.getLoggedInUserDetails();
    // this.intermediateService
    //   .readById(this.loggedInUserDetails?.email, collection.USERS)
    //   .subscribe({
    //     next: (resp) => {
    //       console.log('resp: ', resp);
    //       sessionStorage.setItem(storage.IS_LOGGED_IN, JSON.stringify(resp));
    //       this.loggedInUserDetails = resp;
    //     },
    //   });
  }

  changePassword() {
    this.firstScreenHeader = 'Change Password';
    this.isModalOpen = true;
  }

  changeName() {
    this.firstScreenHeader = 'Change Full Name';
    this.isModalOpen = true;
  }

  onProfileExtra(extra: any) {
    if (extra?.name === 'Sign out') {
      this.logout();
    } else if (extra?.route) {
      this.router.navigateByUrl(extra?.route);
    } else {
      this.toast.showInfoToast('Coming Soon!');
    }
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Logout',
      subHeader: '',
      message: 'Are you sure you want to Logout ?',
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
            signOut(this.auth).then(() => {
              sessionStorage.clear();
              localStorage.clear();
              this.helperService.getLoggedInUserDetails();
              setTimeout(() => {
                this.router.navigateByUrl('/login');
              }, 500);
            })
          },
        },
      ],
    });

    await alert.present();
  }

  setModalOpenToFalse(eve: any) {
    this.isModalOpen = false;
  }
}
