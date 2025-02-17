import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ArchivesPage } from './archives.page';

const routes: Routes = [
  {
    path: '',
    component: ArchivesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ArchivesPageRoutingModule {}
