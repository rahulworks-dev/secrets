import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddSecretPageRoutingModule } from './add-secret-routing.module';

import { AddSecretPage } from './add-secret.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddSecretPageRoutingModule
  ],
  declarations: [AddSecretPage]
})
export class AddSecretPageModule {}
