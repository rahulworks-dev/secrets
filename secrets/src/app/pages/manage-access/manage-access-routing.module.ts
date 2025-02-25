import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageAccessPage } from './manage-access.page';

const routes: Routes = [
  {
    path: '',
    component: ManageAccessPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageAccessPageRoutingModule {}
