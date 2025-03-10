import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { collection } from 'src/app/constants/secret.constant';
import { HelperService } from 'src/app/services/helper.service';
import { IntermediateService } from 'src/app/services/intermediate.service';
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
  enableDom: any;
  activateNotification = false;
  enableVerticalEllipsis = false;
  constructor(
    private loaderService: LoaderService,
    private helperService: HelperService,
    private router: Router,
    private location: Location,
    private alertCtrl: AlertController,
    private storageService: StorageService,
    private intermediateService: IntermediateService
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.configureHeader(event.url);
      }
    });
  }

  ngOnInit() {
    this.enableDom = true;
  }

  ionViewDidEnter() {}

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
    if (this.heroText.includes('?')) {
      const [beforeQuestionMark, queryString] = this.heroText.split('?');
      const params = new URLSearchParams(queryString);
      // this.heroText = params.get('name') || beforeQuestionMark;
      this.heroText = beforeQuestionMark;
    }

    this.heroText = this.heroText
      .split('-')
      .map((word: any) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    if (this.heroText === 'Dashboard') {
      this.fetchNotifications();
    }
  }

  async fetchNotifications() {
    const isLoggedIn = await this.helperService.getLoggedInUserDetails();
    this.intermediateService.readAll(collection.NOTIFICATIONS, '').subscribe({
      next: (resp) => {
        const loggedInUserNotifications =
          resp?.filter((item: any) => item?.recipientId == isLoggedIn.id && !item?.isRead) || [];
        this.activateNotification = loggedInUserNotifications?.length > 0;
      },
    });
  }

  goBack() {
    this.location.back();
  }
}
