import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { profileExtrasOne, profileExtrasTwo } from 'src/app/data/static-data';
import { HelperService } from 'src/app/services/helper.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  profileExtrasOne = profileExtrasOne;
  profileExtrasTwo = profileExtrasTwo;
  isModalOpen = false;
  loggedInUserDetails: any;
  constructor(
    private alertCtrl: AlertController,
    private storageService: StorageService,
    private router: Router,
    private toast: ToastService,
    private helperService: HelperService
  ) {}

  ngOnInit() {
    this.getLoggedInUserDetails();
  }

  async getLoggedInUserDetails() {
    this.loggedInUserDetails =
      await this.helperService.getLoggedInUserDetails();
    this.loggedInUserDetails = {
      ...this.loggedInUserDetails,
      avatar:
        this.loggedInUserDetails?.username?.charAt(0)?.toUpperCase() ?? 'U',
      maskedPassword: this.loggedInUserDetails?.password?.replace(/./g, '*'),
    };
  }

  changePassword() {
    this.isModalOpen = true;
  }

  onProfileExtra(extra: any) {
    if (extra?.name === 'Sign out') {
      this.logout();
    } else if (extra?.name === 'Archives') {
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
            this.storageService.clear();
            this.helperService.getLoggedInUserDetails();
            this.router.navigateByUrl('/login');
          },
        },
      ],
    });

    await alert.present();
  }
}
