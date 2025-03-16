import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { storage } from '../constants/secret.constant';
import { HelperService } from '../services/helper.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private helperService: HelperService) {}

  canActivate() {
    const userDetails = this.helperService.getLoggedInUserDetails();
    if (!userDetails) {
      this.router.navigateByUrl('/login');
      return false;
    }
    return true;
  }
}

@Injectable({
  providedIn: 'root',
})
export class PreLoginGuard implements CanActivate {
  constructor(private router: Router, private helperService: HelperService) {}

  async canActivate() {
    const userDetails = this.helperService.getLoggedInUserDetails();
    if (userDetails) {
      this.router.navigateByUrl('/dashboard');
      return false;
    }
    return true;
  }
}
