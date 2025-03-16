import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import {
  Auth,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  GoogleAuthProvider,
  linkWithPopup,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithPopup,
  updateProfile,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import {
  collection,
  messages,
  passwordHealth,
  storage,
} from 'src/app/constants/secret.constant';
import { user } from 'src/app/models/secret.interface';
import { AdvancedFirebaseHandlerService } from 'src/app/services/advanced-firebase-handler.service';
import { AuthErrorHandlerService } from 'src/app/services/auth-error-handler.service';
import { IntermediateService } from 'src/app/services/intermediate.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  standalone: false,
})
export class SignupComponent implements OnInit {
  userDetails = {
    fullName: '',
    email: '',
    password: '',
  };
  emailVerificationSent = false;
  checkInterval: any;
  passwordHealth: any = passwordHealth;
  activePasswordHealth: any = '';
  @Output() _toggle = new EventEmitter<boolean>(false);
  @Output() _setDynamicHeight = new EventEmitter<boolean>(false);
  user: any;
  constructor(
    private toast: ToastService,
    private auth: Auth,
    private advancedFirebase: AdvancedFirebaseHandlerService,
    private router: Router,
    private loaderService: LoaderService,
    private authErrorHandlerService: AuthErrorHandlerService,
    private intermediateService: IntermediateService
  ) {}

  ngOnInit() {}

  ngOnChanges() {
    this.emailVerificationSent = false;
    this.userDetails = {
      fullName: '',
      email: '',
      password: '',
    };
  }

  toggle() {
    this._toggle.next(true);
  }

  onPassword() {
    const password = this.userDetails.password;
    if (!password) {
      this.activePasswordHealth = '';
      return;
    }
    if (this.passwordHealth.strong.regex.test(password)) {
      this.activePasswordHealth = 'strong';
    } else if (this.passwordHealth.medium.regex.test(password)) {
      this.activePasswordHealth = 'medium';
    } else if (this.passwordHealth.weak.regex.test(password)) {
      this.activePasswordHealth = 'weak';
    } else if (this.passwordHealth.veryWeak.regex.test(password)) {
      this.activePasswordHealth = 'veryWeak';
    }
  }

  async signUpWithEmailAndPassword() {
    if (this.isFormValid()) {
      try {
        this.loaderService.show();
        const userCredential = await createUserWithEmailAndPassword(
          this.auth,
          this.userDetails.email,
          this.userDetails.password
        );
        this.loaderService.hide();
        this.user = userCredential.user;
        if (this.user) {
          await updateProfile(userCredential.user, {
            displayName: this.userDetails.fullName,
          });
          await sendEmailVerification(this.user);
          this.emailVerificationSent = true;
          this._setDynamicHeight.next(true);
          this.startVerificationCheck(this.user);
        }
      } catch (error: unknown) {
        this.loaderService.hide();
        this.authErrorHandlerService.handleAuthError(error);
      }
    }
  }

  async resendEmailVerification() {
    try {
      clearInterval(this.checkInterval);
      await sendEmailVerification(this.user);
      this.toast.showSuccessToast(messages.EMAIL_VERIFICATION_RESENT);
      this.startVerificationCheck(this.user);
    } catch (error) {
      this.authErrorHandlerService.handleAuthError(error);
      this.startVerificationCheck(this.user);
    }
  }

  startVerificationCheck(user: any) {
    this.checkInterval = setInterval(async () => {
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          clearInterval(this.checkInterval);
          this.loaderService.show();
          setTimeout(() => {
            this.loaderService.hide();
            this.toast.showSuccessToast(messages.EMAIL_VERIFIED);
            this.toggle();
          }, 500);
          this.saveUserToFireStore(user);
        }
      }
    }, 5000);
  }

  saveUserToFireStore(user: any, navigateToDashboard = false) {
    const _user: user = {
      email: user.email,
      uid: user.uid,
      photoURL:
        user.photoURL ||
        this.userDetails.fullName
          .split(' ')
          .map((w) => w.charAt(0))
          .join(''),
      fullname: this.userDetails.fullName || user?.displayName,
      createdOn: new Date(),
      sortingPreferenceOrder: -1,
      sortingPreferenceType: 1,
    };

    this.advancedFirebase.createUser(_user).then(() => {
      if (!navigateToDashboard) {
        return;
      }
      this.loaderService.show();
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

  onSignInWithGoogle() {
    signInWithPopup(this.auth, new GoogleAuthProvider())
      .then((response) => {
        this.saveUserToFireStore(response?.user, true);
      })
      .catch((error) => {
        this.authErrorHandlerService.handleAuthError(error);
      });
  }

  isFormValid() {
    if (Object.values(this.userDetails).some((item) => item.trim() === '')) {
      this.toast.showErrorToast(messages.INVALID_FORM);
    } else if (!/^[A-Za-z ]+$/.test(this.userDetails.fullName)) {
      this.toast.showErrorToast(messages.INVALID_FULL_NAME);
    } else if (
      Number(this.passwordHealth[this.activePasswordHealth].width) < 66
    ) {
      this.toast.showErrorToast(messages.PASSWORD_STRENGTH_ERROR);
    } else {
      return true;
    }
    return false;
  }

  // Format FullName on KeyPress
  onFullName() {
    const fullName = this.userDetails.fullName;
    this.userDetails.fullName = fullName
      .split(' ')
      .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
      .join(' ');
  }
}
