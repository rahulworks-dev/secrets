import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginPageRoutingModule } from './login-routing.module';

import { LoginPage } from './login.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { AdvertiseComponent } from './components/advertise/advertise.component';
import { SignupComponent } from './components/signup/signup.component';
import { LoginComponent } from './components/login/login.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginPageRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    TooltipModule.forRoot()
  ],
  declarations: [
    LoginPage,
    AdvertiseComponent,
    SignupComponent,
    LoginComponent,
  ],
})
export class LoginPageModule {}
