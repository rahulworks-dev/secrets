import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { IonicModule } from '@ionic/angular';
import { SecretCardsComponent } from './components/secret-cards/secret-cards.component';
import { CreateFolderModalComponent } from './components/create-folder-modal/create-folder-modal.component';
import { FormsModule } from '@angular/forms';
import { FoldersComponent } from './components/folders/folders.component';
import { ColorChromeModule } from 'ngx-color/chrome'; // ✅ Import the Chrome color picker module
import { SelectColorModalComponent } from './components/select-color-modal/select-color-modal.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    HeaderComponent,
    SecretCardsComponent,
    CreateFolderModalComponent,
    FoldersComponent,
    SelectColorModalComponent,
  ],
  imports: [CommonModule, IonicModule, FormsModule, ColorChromeModule, RouterModule],
  exports: [
    HeaderComponent,
    SecretCardsComponent,
    CreateFolderModalComponent,
    FoldersComponent,
    SelectColorModalComponent,
  ],
})
export class SharedModule {}
