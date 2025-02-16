import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { storage } from '../constants/secret.constant';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  public isAddClickedFromTab = new BehaviorSubject<boolean>(false);
  constructor(private storageService: StorageService) {}

  async getLoggedInUserDetails() {
    const userDetails = await this.storageService.get(storage.IS_LOGGED_IN);
    this.isLoggedInSubject.next(!!userDetails);
    return userDetails;
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
