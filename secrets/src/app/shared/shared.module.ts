import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { IonicModule } from '@ionic/angular';
import { SecretCardsComponent } from './components/secret-cards/secret-cards.component';
import { CreateFolderModalComponent } from './components/create-folder-modal/create-folder-modal.component';
import { FormsModule } from '@angular/forms';
import { FoldersComponent } from './components/folders/folders.component';
import { SelectColorModalComponent } from './components/select-color-modal/select-color-modal.component';
import { RouterModule } from '@angular/router';
import { ShowUserIdComponent } from './components/show-user-id/show-user-id.component';
import { ForgotPasswordModalComponent } from './components/forgot-password-modal/forgot-password-modal.component';

@NgModule({
  declarations: [
    HeaderComponent,
    SecretCardsComponent,
    CreateFolderModalComponent,
    FoldersComponent,
    SelectColorModalComponent,
    ShowUserIdComponent,
    ForgotPasswordModalComponent,
  ],
  imports: [CommonModule, IonicModule, FormsModule, RouterModule],
  exports: [
    HeaderComponent,
    SecretCardsComponent,
    CreateFolderModalComponent,
    FoldersComponent,
    SelectColorModalComponent,
    ShowUserIdComponent,
    ForgotPasswordModalComponent,
  ],
})
export class SharedModule {}
