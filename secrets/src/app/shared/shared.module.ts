import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { IonicModule } from '@ionic/angular';
import { SecretCardsComponent } from './components/secret-cards/secret-cards.component';

@NgModule({
  declarations: [HeaderComponent, SecretCardsComponent],
  imports: [CommonModule, IonicModule],
  exports: [HeaderComponent, SecretCardsComponent],
})
export class SharedModule {}
