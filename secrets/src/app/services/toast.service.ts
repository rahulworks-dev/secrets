import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private toastController: ToastController) {}

  async showErrorToast(message: any) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2500,
      color: 'danger',
      icon: 'bug',
      position: 'top',
    });

    await toast.present();
  }

  async showSuccessToast(message: any) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2500,
      color: 'success',
      icon: 'checkmark-done',
      position: 'top',
    });

    await toast.present();
  }

  async showInfoToast(message: any) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2500,
      color: 'warning',
      icon: 'information-circle',
      position: 'top',
    });

    await toast.present();
  }
}
