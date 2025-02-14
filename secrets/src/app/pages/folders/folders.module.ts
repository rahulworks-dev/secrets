import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FoldersPageRoutingModule } from './folders-routing.module';

import { FoldersPage } from './folders.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FoldersPageRoutingModule,
    SharedModule
  ],
  declarations: [FoldersPage]
})
export class FoldersPageModule {}
