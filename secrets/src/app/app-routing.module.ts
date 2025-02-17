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
    data: { activeIndex: 2 },
    loadChildren: () =>
      import('./pages/add-secret/add-secret.module').then(
        (m) => m.AddSecretPageModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'edit-secret',
    data: { activeIndex: 2 },
    loadChildren: () =>
      import('./pages/add-secret/add-secret.module').then(
        (m) => m.AddSecretPageModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard',
    data: { activeIndex: 0 },
    loadChildren: () =>
      import('./pages/dashboard/dashboard.module').then(
        (m) => m.DashboardPageModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'my-folders',
    data: { activeIndex: 1 },
    loadChildren: () =>
      import('./pages/folders/folders.module').then((m) => m.FoldersPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'move-to',
    data: { activeIndex: 1 },
    loadChildren: () =>
      import('./pages/folders/folders.module').then((m) => m.FoldersPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'folder',
    data: { activeIndex: 1 },
    loadChildren: () =>
      import('./pages/secrets/secrets.module').then((m) => m.SecretsPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'favorites',
    data: { activeIndex: 3 },
    loadChildren: () =>
      import('./pages/favorites/favorites.module').then(
        (m) => m.FavoritesPageModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    data: { activeIndex: 4 },
    loadChildren: () =>
      import('./pages/profile/profile.module').then((m) => m.ProfilePageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'archives',
    data: { activeIndex: 4 },
    loadChildren: () =>
      import('./pages/archives/archives.module').then(
        (m) => m.ArchivesPageModule
      ),
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
