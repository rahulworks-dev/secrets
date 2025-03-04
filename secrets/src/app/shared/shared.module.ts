import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { IonicModule } from '@ionic/angular';
import { SecretCardsComponent } from './components/secret-cards/secret-cards.component';
import { CreateFolderModalComponent } from './components/create-folder-modal/create-folder-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FoldersComponent } from './components/folders/folders.component';
import { SelectColorModalComponent } from './components/select-color-modal/select-color-modal.component';
import { RouterModule } from '@angular/router';
import { ShowUserIdComponent } from './components/show-user-id/show-user-id.component';
import { ForgotPasswordModalComponent } from './components/forgot-password-modal/forgot-password-modal.component';
import { BottomTabComponent } from './components/bottom-tab/bottom-tab.component';
import { DesktopSidebarComponent } from './components/desktop-sidebar/desktop-sidebar.component';
import { ShareComponent } from './components/share/share.component';
import { AutofocusDirective } from '../directives/autofocus.directive';
import { CommonInputComponent } from './components/common-input/common-input.component';
import { SortingAndFilterComponent } from './components/sorting-and-filter/sorting-and-filter.component';
import { BulkActionTabComponent } from './components/bulk-action-tab/bulk-action-tab.component';

@NgModule({
  declarations: [
    HeaderComponent,
    SecretCardsComponent,
    CreateFolderModalComponent,
    FoldersComponent,
    SelectColorModalComponent,
    ShowUserIdComponent,
    ForgotPasswordModalComponent,
    BottomTabComponent,
    DesktopSidebarComponent,
    ShareComponent,
    CommonInputComponent,
    SortingAndFilterComponent,
    BulkActionTabComponent,
    // Directives
    AutofocusDirective,
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  exports: [
    HeaderComponent,
    SecretCardsComponent,
    CreateFolderModalComponent,
    FoldersComponent,
    SelectColorModalComponent,
    ShowUserIdComponent,
    ForgotPasswordModalComponent,
    BottomTabComponent,
    DesktopSidebarComponent,
    ShareComponent,
    CommonInputComponent,
    SortingAndFilterComponent,
    BulkActionTabComponent,
    // Directives
    AutofocusDirective,
  ],
})
export class SharedModule {}
