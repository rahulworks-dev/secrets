import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  @ViewChild('loginContainer', { static: false }) loginContainer!: ElementRef;
  isSignUpPage = false;
  constructor() {}

  ngOnInit() {}

  ionViewDidEnter() {
    this.setDynamicHeight();
  }

  setDynamicHeight() {
    setTimeout(() => {
      if (this.loginContainer) {
        this.loginContainer.nativeElement.style.height = this.isSignUpPage
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

  toggle() {
    this.isSignUpPage = !this.isSignUpPage;
    this.setDynamicHeight();
  }
}
