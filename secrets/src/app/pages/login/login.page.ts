import { trigger, transition, style, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  collection,
  LoginCred,
  storage,
} from 'src/app/constants/secret.constant';
import { FirebaseHandlerService } from 'src/app/services/firebase-handler.service';
import { IntermediateService } from 'src/app/services/intermediate.service';
import { LoaderService } from 'src/app/services/loader.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  animations: [
    trigger('slideAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate(
          '500ms ease-in-out',
          style({ transform: 'translateX(0%)', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        animate(
          '500ms ease-in-out',
          style({ transform: 'translateX(-100%)', opacity: 0 })
        ),
      ]),
    ]),
  ],
  standalone: false,
})
export class LoginPage implements OnInit {
  username: any;
  password: any;
  confirmPassword: any;
  isSliding = false;
  isUserNameValid: any;
  showSpinner = false;
  showSucessIcon = false;
  constructor(
    private router: Router,
    private firebaseHandlerService: FirebaseHandlerService,
    private intermediateService: IntermediateService,
    private toast: ToastService,
    private loaderService: LoaderService,
    private storageService: StorageService
  ) {}

  ngOnInit() {}

  async login() {
    try {
      const users = await this.readAllUsers();
      if (users.length > 0) {
        const isExistingMember = users.find(
          (item: any) =>
            item?.username === this.username && item?.password === this.password
        );
        if (isExistingMember) {
          this.storageService.set(
            storage.IS_LOGGED_IN,
            JSON.stringify(isExistingMember)
          );
          this.router.navigateByUrl('/dashboard');
        } else {
          this.toast.showErrorToast('Either Username or Password is incorrect');
        }
      }
      else{
        console.log('Returned Empty Array For Some reason');
      }
    } catch (error) {
      console.log(error);
      this.toast.showErrorToast('Something went wrong!');
    }
  }

  toggle() {
    this.username = '';
    this.password = '';
    this.confirmPassword = '';
    this.isSliding = !this.isSliding;
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
      console.log(error);
      this.toast.showErrorToast(
        "Username Availability couldn't be checked due to some technical issue, Please try again later"
      );
    }
  }

  readAllUsers(): Promise<any> {
    this.loaderService.show();
    return new Promise((resolve, reject) => {
      this.intermediateService.readAll(collection.USERS).subscribe({
        next: (resp) => {
          console.log('resp: ', resp);
          this.loaderService.hide();
          resolve(resp);
        },
        error: (err) => {
          this.loaderService.hide();
          reject(err);
        },
      });
    });
  }

  signup() {
    if (this.isSignUpValid()) {
      const data = {
        username: this.username,
        password: this.password,
      };
      this.loaderService.show();
      this.intermediateService.create(data, collection.USERS).subscribe({
        next: (resp) => {
          this.toast.showSuccessToast(
            'Successful Registeration, Please login now'
          );
          this.loaderService.hide();
          this.toggle();
        },
        error: (err) => {
          this.toast.showSuccessToast(
            'UnSuccessful Registeration, Please try again'
          );
          this.loaderService.hide();
        },
      });
    }
  }

  isSignUpValid() {
    if (this.username && this.password && this.confirmPassword) {
      if (this.username.length < 4) {
        this.toast.showErrorToast('Username cannot be less than 4 Characters');
      } else if (!/^[A-Za-z0-9]+$/.test(this.username)) {
        this.toast.showErrorToast('Username cannot contain special characters');
      } else if (!this.isUserNameValid) {
        this.toast.showErrorToast('Username already taken');
      } else if (this.password.length < 5) {
        this.toast.showErrorToast('Password cannot be less than 4 characters');
      } else if (this.password !== this.confirmPassword) {
        this.toast.showErrorToast(
          'Password & Confirm Password are not matching'
        );
      } else {
        return true;
      }
    } else {
      this.toast.showErrorToast('Please fill the form');
      return false;
    }
    return false;
  }
}
