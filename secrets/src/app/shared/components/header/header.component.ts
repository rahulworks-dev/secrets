import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { HelperService } from 'src/app/services/helper.service';
import { LoaderService } from 'src/app/services/loader.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false,
})
export class HeaderComponent implements OnInit {
  isLoading = this.loaderService.isLoading$;
  heroText: any = '';
  enableDom:any;
  constructor(
    private loaderService: LoaderService,
    private helperService: HelperService,
    private router: Router,
    private location: Location,
    private alertCtrl: AlertController,
    private storageService: StorageService
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.configureHeader(event.url);
      }
    });
  }

  ngOnInit() {
    console.log('HI');
    this.enableDom = true;
  }

  ionViewDidEnter(){
    
  }

  async GoToDashboard() {
    const isLoggedIn = await this.helperService.getLoggedInUserDetails();
    if (isLoggedIn) {
      this.router.navigateByUrl('/dashboard');
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  configureHeader(currentUrl: any) {
    this.heroText = currentUrl.split('/').at(-1);
    console.log('this.heroText: ', this.heroText);
    if (this.heroText.includes('?')) {
      const [beforeQuestionMark, queryString] = this.heroText.split('?');
      const params = new URLSearchParams(queryString);
      this.heroText = params.get('name') || beforeQuestionMark;
    }

    this.heroText = this.heroText
      .split('-')
      .map((word: any) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  goBack() {
    this.location.back();
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
          handler: () => {
            console.log('Alert canceled');
          },
        },
        {
          text: 'Yes',
          role: 'confirm',
          cssClass: 'alert-button-confirm',
          handler: () => {
            console.log('Alert confirmed');
            this.storageService.clear();
            this.router.navigateByUrl('/login');
          },
        },
      ],
    });

    await alert.present();
  }
}
