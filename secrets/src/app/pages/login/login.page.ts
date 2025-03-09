import { trigger, transition, style, animate } from '@angular/animations';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  collection,
  LoginCred,
  storage,
} from 'src/app/constants/secret.constant';
import { signup } from 'src/app/models/secret.interface';
import { FirebaseHandlerService } from 'src/app/services/firebase-handler.service';
import { IntermediateService } from 'src/app/services/intermediate.service';
import { LoaderService } from 'src/app/services/loader.service';
import { MakePageNonInteractiveService } from 'src/app/services/make-page-non-interactive.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  @ViewChild('loginContainer', { static: false }) loginContainer!: ElementRef;
  username: any;
  password: any;
  fullname: any;
  confirmPassword: any;
  isSliding = false;
  isUserNameValid: any;
  showSpinner = false;
  showSucessIcon = false;
  isUserIdModalOpen = false;
  isForgotPasswordModalOpen = false;
  signUpUserId: any;
  loginAndSignupForm!: FormGroup;
  constructor(
    public loaderService: LoaderService,

    private router: Router,
    private toast: ToastService,
    private storageService: StorageService,
    private intermediateService: IntermediateService,
    private makePageNonInteractive: MakePageNonInteractiveService
  ) {
    // this.initializeForm();
  }

  ngOnInit() {}

  ionViewDidEnter() {
    this.showSpinner = false;
    this.showSucessIcon = false;
    this.username = '';
    this.password = '';
    this.confirmPassword = '';
    this.setDynamicHeight();
  }

  setDynamicHeight() {
    setTimeout(() => {
      if (this.loginContainer) {
        this.loginContainer.nativeElement.style.height = this.isSliding
          ? `${
              this.loginContainer.nativeElement.querySelector('.signup-animate')
                .scrollHeight
            }px`
          : `${
              this.loginContainer.nativeElement.querySelector('.login-animate')
                .scrollHeight
            }px`;
      }
    }, 50);
  }

  async login() {
    if (this.username && this.password) {
      try {
        const users = await this.readAllUsers();
        if (users.length > 0) {
          const isExistingMember = users.find(
            (item: any) =>
              item?.username === this.username &&
              item?.password === this.password
          );
          if (isExistingMember) {
            this.storageService.set(
              storage.IS_LOGGED_IN,
              JSON.stringify(isExistingMember)
            );
            this.router.navigateByUrl('/dashboard');
          } else {
            this.toast.showErrorToast(
              "Either Username or Password is incorrect, Please Sign up if you're new to SECRETS"
            );
          }
        } else {
          this.toast.showErrorToast('No Records Found, Please Sign Up!');
          console.error('Returned Empty Array For Some reason');
        }
      } catch (error) {
        console.error(error);
        this.toast.showErrorToast('Something went wrong!');
      }
    } else {
      this.toast.showErrorToast('Please enter Username & Password to Login');
    }
  }

  toggle() {
    this.isUserIdModalOpen = false;
    this.username = '';
    this.password = '';
    this.confirmPassword = '';
    this.showSucessIcon = false;
    this.showSpinner = false;
    this.fullname = '';
    this.isSliding = !this.isSliding;
    this.setDynamicHeight();
  }

  onTypingUsername(eve: any) {
    this.showSucessIcon = false;
    this.showSpinner = false;
  }

  async onInputBlur() {
    this.showSucessIcon = false;
    this.showSpinner = true;
    try {
      const users = await this.readAllUsers();
      this.showSpinner = false;
      if (users.length > 0) {
        const isUserNameAvailable = users.find(
          (item: any) => item?.username === this.username
        );
        if (isUserNameAvailable) {
          this.toast.showErrorToast('Username already taken');
          this.isUserNameValid = false;
        } else {
          this.isUserNameValid = true;
          this.showSucessIcon = true;
        }
      } else {
        this.showSucessIcon = true;
        this.isUserNameValid = true;
      }
    } catch (error) {
      this.showSpinner = false;
      this.isUserNameValid = false;
      console.error(error);
      this.toast.showErrorToast(
        "Username Availability couldn't be checked due to some technical issue, Please try again later"
      );
    }
  }

  readAllUsers(): Promise<any> {
    this.loaderService.show();
    this.makePageNonInteractive.activate();
    return new Promise((resolve, reject) => {
      this.intermediateService.readAll(collection.USERS).subscribe({
        next: (resp) => {
          this.loaderService.hide();
          this.makePageNonInteractive.deactivate();
          resolve(resp);
        },
        error: (err) => {
          this.loaderService.hide();
          this.makePageNonInteractive.deactivate();
          reject(err);
        },
      });
    });
  }

  signup() {
    if (this.isSignUpValid()) {
      const data: signup = {
        username: this.username,
        password: this.password,
        fullname: this.fullname,
        createdOn: new Date(),
        avatar: this.fullname
          ?.split(' ')
          .map((item: any) => item?.charAt(0).toUpperCase())
          .join(''),
      };
      this.loaderService.show();
      this.makePageNonInteractive.activate();
      this.intermediateService.create(data, collection.USERS).subscribe({
        next: (resp) => {
          this.signUpUserId = resp;
          this.makePageNonInteractive.deactivate();
          this.toast.showSuccessToast('Successful Registeration');
          this.loaderService.hide();
          this.isUserIdModalOpen = true;
        },
        error: (err) => {
          console.error(err);
          this.makePageNonInteractive.deactivate();
          this.toast.showSuccessToast(
            'UnSuccessful Registeration, Please try again'
          );
          this.loaderService.hide();
        },
      });
    }
  }

  isSignUpValid() {
    if (
      this.username &&
      this.password &&
      this.confirmPassword &&
      this.fullname
    ) {
      if (this.fullname.length < 4) {
        this.toast.showErrorToast('Full Name cannot be less than 4 Characters');
      } else if (!/^[A-Za-z ]+$/.test(this.fullname)) {
        this.toast.showErrorToast(
          'Full Name can only contain Alphabetical Characters'
        );
      } else if (this.username.length < 4) {
        this.toast.showErrorToast('Username cannot be less than 4 Characters');
      } else if (!/^[A-Za-z0-9]+$/.test(this.username)) {
        this.toast.showErrorToast('Username cannot contain special characters');
      } else if (!this.isUserNameValid) {
        this.toast.showErrorToast(
          'Username already taken, Please use different username'
        );
      } else if (this.password.length < 5) {
        this.toast.showErrorToast('Password cannot be less than 5 characters');
      } else if (this.password !== this.confirmPassword) {
        this.toast.showErrorToast(
          'Password & Confirm Password are not matching'
        );
      } else {
        return true;
      }
    } else {
      this.toast.showErrorToast('Please fill all required fields');
      return false;
    }
    return false;
  }

  forgotPassword() {
    this.isForgotPasswordModalOpen = true;
  }

  scrollToAdvertise() {
    const element = document.getElementById('advertise');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
