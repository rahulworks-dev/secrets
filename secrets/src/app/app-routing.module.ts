import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard, PreLoginGuard } from './guards/all.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/login/login.module').then((m) => m.LoginPageModule),
    canActivate: [PreLoginGuard],
  },
  {
    path: 'add-secret',
    loadChildren: () =>
      import('./pages/add-secret/add-secret.module').then(
        (m) => m.AddSecretPageModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./pages/dashboard/dashboard.module').then(
        (m) => m.DashboardPageModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'folders',
    loadChildren: () =>
      import('./pages/folders/folders.module').then((m) => m.FoldersPageModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
