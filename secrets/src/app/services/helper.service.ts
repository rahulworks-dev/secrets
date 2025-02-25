import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { storage } from '../constants/secret.constant';
import { BehaviorSubject } from 'rxjs';
import { DatePipe } from '@angular/common';

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

  sortByTime(array: any[]) {
    if (!array || !Array.isArray(array)) return array;

    return array.sort((a: any, b: any) => {
      const timeA =
        a.lastUpdatedOnWithoutFormat?.getTime() ||
        a.createdOnWithoutFormat?.getTime() ||
        0;
      const timeB =
        b.lastUpdatedOnWithoutFormat?.getTime() ||
        b.createdOnWithoutFormat?.getTime() ||
        0;

      return timeB - timeA; // Sort in descending order (latest first)
    });
  }

  formatDate(date: any, prefix: any) {
    if (!date) return '';

    let formatDate = date?.toDate();
    let currentDate = new Date();
    let oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const diffInMs = currentDate.getTime() - formatDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (formatDate.toDateString() === currentDate.toDateString()) {
      if (diffInMinutes < 1) return `${prefix} Just now`;
      if (diffInMinutes < 60) return `${prefix} ${diffInMinutes}m ago`;
      return `${prefix} ${Math.floor(diffInMinutes / 60)}h ago`;
    }

    if (formatDate > oneDayAgo && formatDate < currentDate) {
      const hours = formatDate.getHours() % 12 || 12;
      const minutes = formatDate.getMinutes().toString().padStart(2, '0');
      const ampm = formatDate.getHours() >= 12 ? 'PM' : 'AM';
      return `${prefix} Yesterday at ${hours}:${minutes} ${ampm}`;
    }

    return `${prefix} on ${new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(formatDate)}`;
  }
}
