import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { storage } from '../constants/secret.constant';

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  constructor(private storageService: StorageService) {}

  async getLoggedInUserDetails() {
    return await this.storageService.get(storage.IS_LOGGED_IN);
  }

  sortByTime(array: any) {
    if (!array) {
      return array;
    }
    return array.sort(
      (a: any, b: any) => b.createdOn.getTime() - a.createdOn.getTime()
    );
  }
}
