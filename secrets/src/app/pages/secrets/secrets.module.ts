import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SecretsPageRoutingModule } from './secrets-routing.module';

import { SecretsPage } from './secrets.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SecretsPageRoutingModule,
    SharedModule
  ],
  declarations: [SecretsPage]
})
export class SecretsPageModule {}
