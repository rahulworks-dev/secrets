import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { arrayRemove } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { GestureController } from '@ionic/angular';
import { collection, messages } from 'src/app/constants/secret.constant';
import { FirebaseHandlerService } from 'src/app/services/firebase-handler.service';
import { HelperService } from 'src/app/services/helper.service';
import { IntermediateService } from 'src/app/services/intermediate.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: false,
})
export class NotificationsPage implements OnInit {
  isAPIError = false;
  noNotificationText = '';
  notifications: any[] = [];
  loggedInUserDetails: any;
  constructor(
    private intermediateService: IntermediateService,
    private helperService: HelperService,
    private toast: ToastService,
    private firebaseHandlerService: FirebaseHandlerService,
    private router: Router,
    private gestureCtrl: GestureController
  ) {}

  ngOnInit() {}

  async ionViewDidEnter() {
    this.loggedInUserDetails =
      await this.helperService.getLoggedInUserDetails();
    this.fetchNotifications();
  }
  async fetchNotifications() {
    const subscription = this.intermediateService.readAll(collection.NOTIFICATIONS, '').subscribe({
      next: (resp) => {
        this.noNotificationText = '';
        this.isAPIError = false;
        console.log(resp);
        this.notifications =
          resp?.filter(
            (item: any) => item?.recipientId == this.loggedInUserDetails?.id
          ) || [];
        if (this.notifications?.length < 1) {
          this.noNotificationText = messages.NO_NOTIFICATION_TEXT;
        } else {
          this.updateToRead();
          subscription.unsubscribe();
        }
      },
      error: (e) => {
        this.isAPIError = true;
        console.error(e);
      },
    });
  }

  updateToRead() {
    this.firebaseHandlerService.updateInBulk(
      this.notifications,
      collection.NOTIFICATIONS
    );
  }

  deleteNotification(notification: any, eve: Event) {
    eve.stopPropagation();
    this.firebaseHandlerService
      .deleteItem(notification?.id, collection.NOTIFICATIONS)
      .then(() => this.toast.showSuccessToast('Deleted Successfully'))
      .catch((e) =>
        this.toast.showErrorToast(
          "We couldn't delete notification due to technical issue"
        )
      );
  }

  route(notification: any) {
    if (notification) {
      const subscription = this.intermediateService
        .readById(notification.folderId, collection.FOLDERS)
        .subscribe({
          next: (resp) => {
            if (resp) {
              if (resp?.sharedTo && resp?.sharedTo?.length > 0) {
                const isAuthenticatedToView = resp.sharedTo.some(
                  (item: any) => this.loggedInUserDetails?.id == item?.id
                );
                if (isAuthenticatedToView) {
                  this.router.navigateByUrl(notification?.redirectTo);
                } else {
                  subscription.unsubscribe();
                  this.toast.showErrorToast(
                    'You may have left the folder, or the owner may have revoked your access.'
                  );
                }
              } else {
                subscription.unsubscribe();
                this.toast.showErrorToast(
                  'You may have left the folder, or the owner may have revoked your access.'
                );
              }
            } else {
              this.toast.showErrorToast('Something Went Wrong!');
            }
          },
          error: (err) => {
            this.toast.showErrorToast('Something Went Wrong!');
          },
        });
    }
  }

  clearAll() {
    const notificationIds = this.notifications.map((item: any) => item?.id);
    this.firebaseHandlerService
      .deleteInBulk(notificationIds, collection.NOTIFICATIONS)
      .then(() =>
        this.toast.showSuccessToast('Deleted All Notifications Successfully')
      );
  }
}
