import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AboutSecretsPageRoutingModule } from './about-secrets-routing.module';
import { AboutSecretsPage } from './about-secrets.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AboutSecretsPageRoutingModule,
  ],
  declarations: [AboutSecretsPage]
})
export class AboutSecretsPageModule {}
