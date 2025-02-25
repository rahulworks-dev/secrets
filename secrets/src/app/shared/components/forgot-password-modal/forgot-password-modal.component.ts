import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { take } from 'rxjs';
import { collection } from 'src/app/constants/secret.constant';
import { IntermediateService } from 'src/app/services/intermediate.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-forgot-password-modal',
  templateUrl: './forgot-password-modal.component.html',
  styleUrls: ['./forgot-password-modal.component.scss'],
  standalone: false,
})
export class ForgotPasswordModalComponent implements OnInit {
  username: any;
  @Input() isModalOpen = false;
  @Input() isChangePassword = false;
  @Output() setModalOpenToFalse = new EventEmitter<any>();
  secureId: any;
  isSuccessfullVerification = false;
  password: any;
  confirmPassword: any;
  isUserAvailable: any;

  currentPassword: any;
  isUserAvailableForChangePassword: any;
  constructor(
    private intermediateService: IntermediateService,
    private toast: ToastService
  ) {}

  ngOnInit() {}

  ngOnChanges() {
    this.resetForm();
  }

  resetForm() {
    this.password = '';
    this.confirmPassword = '';
    this.currentPassword = '';
    this.secureId = '';
    this.isUserAvailable = null;
    this.username = '';
    this.isSuccessfullVerification = false;
  }

  onContinue() {
    if (this.username && this.secureId) {
      this.isUserAvailable = null;
      this.intermediateService
        .readAll(collection.USERS)
        .pipe(take(1))
        .subscribe({
          next: (resp) => {
            if (resp?.length > 0) {
              this.isUserAvailable = resp?.find((item: any) => {
                return (
                  item.username == this.username && item.id == this.secureId
                );
              });

              if (this.isUserAvailable) {
                this.toast.showSuccessToast('Successfull Verification');
                this.isSuccessfullVerification = true;
              } else {
                this.toast.showErrorToast(
                  'Either Username or Security ID is incorrect'
                );
                this.isSuccessfullVerification = false;
              }
            } else {
              this.toast.showErrorToast(
                'We Could not verify due to technical issues, Please try again'
              );
            }
          },
        });
    } else {
      this.toast.showErrorToast('Please Enter Username & Security Id.')
    }
  }

  onContinueWithCurrentPassword() {
    if (this.currentPassword) {
      this.isUserAvailable = null;
      this.intermediateService
        .readAll(collection.USERS, 'id')
        .pipe(take(1))
        .subscribe({
          next: (resp) => {
            console.log('resp: ', resp);
            if (resp?.length > 0) {
              this.isUserAvailable = resp?.find((item: any) => {
                return item.password == this.currentPassword;
              });

              if (this.isUserAvailable) {
                this.toast.showSuccessToast('Successfull Verification');
                this.isSuccessfullVerification = true;
              } else {
                this.toast.showErrorToast('Incorrect Password');
                this.isSuccessfullVerification = false;
              }
            } else {
              this.toast.showErrorToast(
                'We Could not verify due to technical issues, Please try again'
              );
            }
          },
        });
    }
  }

  onUpdatePassword() {
    if (this.password && this.confirmPassword) {
      if (this.password == this.isUserAvailable?.password) {
        this.toast.showErrorToast(
          'New password cannot be the same as the previous one. Please choose a different password.'
        );
      } else if (this.password.length < 5) {
        this.toast.showErrorToast('Password cannot be less than 4 characters');
      } else if (this.password !== this.confirmPassword) {
        this.toast.showErrorToast(
          'Password & Confirm Password are not matching'
        );
      } else {
        this.onUpdatePasswordInDB();
      }
    }
  }

  onUpdatePasswordInDB() {
    const payload = {
      password: this.password,
    };
    this.intermediateService
      .update(this.isUserAvailable.id, payload, collection.USERS)
      .subscribe({
        next: (resp) => {
          this.resetForm();
          const successMsg = this.isChangePassword
            ? 'Successfully Changed Your Password'
            : 'Successfully Updated Your Password, Please Login with the Updated Password now';
          this.toast.showSuccessToast(successMsg);
          this.setModalOpenToFalse.next(true);
        },
        error: (e) => {
          console.error(e);
          this.toast.showErrorToast(
            'Could not updated your password due to technical issue, Please retry'
          );
        },
      });
  }

  close() {
    this.resetForm();
    this.setModalOpenToFalse.next(true);
  }
}
