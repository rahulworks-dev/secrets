import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AboutSecretsPage } from './about-secrets.page';

const routes: Routes = [
  {
    path: '',
    component: AboutSecretsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AboutSecretsPageRoutingModule {}
