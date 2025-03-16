import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import {
  collection,
  messages,
  storage,
} from 'src/app/constants/secret.constant';
import { AdvancedFirebaseHandlerService } from 'src/app/services/advanced-firebase-handler.service';
import { AuthErrorHandlerService } from 'src/app/services/auth-error-handler.service';
import { IntermediateService } from 'src/app/services/intermediate.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ToastService } from 'src/app/services/toast.service';
import { user } from 'src/app/models/secret.interface';
@Component({
  selector: 'app-login-component',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false,
})
export class LoginComponent implements OnInit {
  userDetails = {
    email: '',
    password: '',
  };
  emailVerificationPending = '';
  emailVerificationResent = false;
  isForgotPasswordScreen = false;
  passwordResetEmailSent = false;
  provider = new GoogleAuthProvider();
  @Output() _toggle = new EventEmitter<boolean>(false);
  @Output() _setDynamicHeight = new EventEmitter<boolean>(false);

  constructor(
    private auth: Auth,
    private toast: ToastService,
    private advancedFirebase: AdvancedFirebaseHandlerService,
    private router: Router,
    private loaderService: LoaderService,
    private intermediateService: IntermediateService,
    private authErrorHandlerService: AuthErrorHandlerService
  ) {}

  ngOnInit() {}

  ngOnChanges() {
    this.emailVerificationPending = '';
    this.emailVerificationResent = false;
    this.isForgotPasswordScreen = false;
    this.passwordResetEmailSent = false;
    this.userDetails = {
      email: '',
      password: '',
    };
  }

  closeEVP() {
    this.emailVerificationPending = '';
    this._setDynamicHeight.next(true);
  }

  closeEVS() {
    this.emailVerificationResent = false;
    this._setDynamicHeight.next(true);
  }

  closePRE() {
    this.passwordResetEmailSent = false;
    this._setDynamicHeight.next(true);
  }

  async login() {
    if (this.userDetails.email && this.userDetails.password) {
      try {
        this.loaderService.show();
        const userCredential = await signInWithEmailAndPassword(
          this.auth,
          this.userDetails.email,
          this.userDetails.password
        );
        const user = userCredential.user;
        if (user.emailVerified) {
          this.emailVerificationPending = '';
          this.startSession(user);
        } else {
          this.loaderService.hide();
          this.emailVerificationPending = messages.EMAIL_VERIFICAION_PENDING;
          this._setDynamicHeight.next(true);
        }
      } catch (error) {
        this.loaderService.hide();
        this.emailVerificationPending = '';
        this.authErrorHandlerService.handleAuthError(error);
      }
    }
  }

  startSession(user: any) {
    this.intermediateService.readById(user.email, collection.USERS).subscribe({
      next: (resp) => {
        this.loaderService.hide();
        if (resp) {
          sessionStorage.setItem(storage.IS_LOGGED_IN, JSON.stringify(resp));
          this.router.navigateByUrl('/dashboard');
        }
      },
      error: (e) => {
        this.loaderService.hide();
        this.toast.showErrorToast(messages.GENERAL_ERROR);
      },
    });
  }

  onSignInWithGoogle() {
    signInWithPopup(this.auth, this.provider)
      .then((response) => {
        this.saveUserToFireStore(response?.user);
      })
      .catch((error) => {
        this.authErrorHandlerService.handleAuthError(error);
      });
  }

  saveUserToFireStore(user: any) {
    const _user: user = {
      email: user.email,
      uid: user.uid,
      photoURL: user.photoURL,
      fullname: user?.displayName,
      createdOn: new Date(),
      sortingPreferenceOrder: -1,
      sortingPreferenceType: 1,
    };
    this.loaderService.show();
    this.advancedFirebase.createUser(_user).then(() => {
      const subscription = this.intermediateService
        .readById(user.email, collection.USERS)
        .subscribe({
          next: (resp) => {
            this.loaderService.hide();
            sessionStorage.clear();
            setTimeout(() => {
              sessionStorage.setItem(
                storage.IS_LOGGED_IN,
                JSON.stringify(resp)
              );
              this.router.navigateByUrl('/dashboard');
            }, 100);
            subscription.unsubscribe();
          },
          error: () => {
            this.loaderService.hide();
            this.toast.showErrorToast(messages.GENERAL_ERROR);
          },
        });
    });
  }

  toggle() {
    this._toggle.next(true);
  }

  resendEmailVerification() {
    if (this.auth.currentUser) {
      this.loaderService.show();
      sendEmailVerification(this.auth.currentUser)
        .then(() => {
          this.loaderService.hide();
          this.emailVerificationPending = '';
          this.emailVerificationResent = true;
          setTimeout(() => {
            this.emailVerificationResent = false;
            this._setDynamicHeight.next(true);
          }, 5000);
        })
        .catch((error) => {
          this.loaderService.hide();
          this.authErrorHandlerService.handleAuthError(error);
        });
    } else {
      this.toast.showErrorToast(messages.GENERAL_ERROR);
    }
  }

  forgotPassword() {
    this.isForgotPasswordScreen = true;
    this._setDynamicHeight.next(true);
    this.emailVerificationPending = '';
    this.emailVerificationResent = false;
    this.passwordResetEmailSent = false;
    this.userDetails.email = '';
  }

  backToLogin() {
    this.isForgotPasswordScreen = false;
    this._setDynamicHeight.next(true);
    this.emailVerificationPending = '';
    this.emailVerificationResent = false;
    this.passwordResetEmailSent = false;
    this.userDetails.email = '';
  }

  async resetPassword() {
    if (this.userDetails.email) {
      this.loaderService.show();
      sendPasswordResetEmail(this.auth, this.userDetails.email)
        .then(() => {
          this.loaderService.hide();
          this.passwordResetEmailSent = true;
          this._setDynamicHeight.next(true);
          setTimeout(() => {
            this.backToLogin();
          }, 5000);
        })
        .catch((error) => {
          this.loaderService.hide();
          this.authErrorHandlerService.handleAuthError(error);
        });
    }
  }
}
