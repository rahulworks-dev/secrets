import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { storage } from '../constants/secret.constant';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private storageService: StorageService) {}

  async canActivate() {
    const isLoggedIn = await this.storageService.get(storage.IS_LOGGED_IN);
    if (!isLoggedIn) {
      await this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}

@Injectable({
  providedIn: 'root',
})
export class PreLoginGuard implements CanActivate {
  constructor(private router: Router, private storageService: StorageService) {}

  async canActivate() {
    const isLoggedIn = await this.storageService.get(storage.IS_LOGGED_IN);
    if (isLoggedIn) {
      await this.router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }
}
