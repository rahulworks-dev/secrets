import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { collection } from 'src/app/constants/secret.constant';
import { FirebaseHandlerService } from 'src/app/services/firebase-handler.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-secret-cards',
  templateUrl: './secret-cards.component.html',
  styleUrls: ['./secret-cards.component.scss'],
  standalone: false,
})
export class SecretCardsComponent implements OnInit {
  @Input() secrets: any;
  @Input() noSecretText: any =
    "No Secrets Added yet, Click on '+' to add your first secret";
  @Input() showTitle = true;
  isRevealed = false;
  constructor(
    public loaderService: LoaderService,
    private router: Router,
    private toast: ToastService,
    private alertCtrl: AlertController,
    private firebaseHandlerService: FirebaseHandlerService,
    private actionSheet: ActionSheetController
  ) {}

  ngOnInit() {}

  ngOnChanges() {
    // console.log(this.secrets);
    this.isRevealed = false;
  }

  onReveal() {
    this.isRevealed = !this.isRevealed;
  }

  onEdit(secretId: any) {
    if (secretId) {
      this.router.navigateByUrl('/edit-secret?id=' + secretId);
    } else {
      this.toast.showErrorToast('System Error, Could not initiate Edit Action');
    }
  }

  async onDelete(secretId: any) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Secret',
      subHeader: 'This action cannot be undone!',
      message: 'Are you sure you want to delete this secret ?',
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
            this.deleteSecret(secretId);
          },
        },
      ],
    });

    await alert.present();
  }

  async deleteSecret(secretId: string) {
    console.log('delete');
    this.loaderService.show();

    try {
      await this.firebaseHandlerService.deleteItem(
        secretId,
        collection.SECRETS
      );
      this.toast.showSuccessToast('Deleted Successfully');
    } catch (err) {
      console.error('Error deleting item', err);
    } finally {
      this.loaderService.hide(); // Ensures loader hides even if an error occurs
    }
  }

  async on3Dots(secretId: any) {
    const actionSheet = await this.actionSheet.create({
      header: '',
      buttons: [
        {
          text: 'Move',
          handler: () => {
            this.router.navigateByUrl(
              '/move-to?action=move&secretId=' + secretId
            );
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ],
      cssClass: 'custom-action-sheet',
    });

    await actionSheet.present();
  }
}
