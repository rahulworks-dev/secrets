import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { storage } from '../constants/secret.constant';
import { BehaviorSubject } from 'rxjs';
import { DatePipe } from '@angular/common';
import { sortingPreference } from '../models/secret.interface';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  public isAddClickedFromTab = new BehaviorSubject<boolean>(false);
  public hideBottomTab$ = new BehaviorSubject<boolean>(false);
  constructor(
    private storageService: StorageService,
    private toast: ToastService
  ) {}

  async getLoggedInUserDetails() {
    const userDetails = await this.storageService.get(storage.IS_LOGGED_IN);
    this.isLoggedInSubject.next(!!userDetails);
    return userDetails;
  }

  sortBy(array: any[], sortPreference: sortingPreference) {
    if (!array || !Array.isArray(array)) return array;

    switch (sortPreference.sortingPreferenceType) {
      case 0:
        return this.sortByDefault(array); //Always Descending for Default
      case 1:
        return this.sortByCreatedDate(
          array,
          sortPreference.sortingPreferenceOrder
        );
      case 2:
        return this.sortByModifiedDate(
          array,
          sortPreference.sortingPreferenceOrder
        );
      case 3:
        return this.sortByTitle(array, sortPreference.sortingPreferenceOrder);
    }

    return array;
  }

  sortByDefault(array: any[]) {
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

  sortByModifiedDate(array: any[], order: 1 | -1) {
    if (!array || !Array.isArray(array)) return array;

    return array.sort((a: any, b: any) => {
      const timeA = a.lastUpdatedOnWithoutFormat?.getTime() || -1; // Modified items come first
      const timeB = b.lastUpdatedOnWithoutFormat?.getTime() || -1;

      if (timeA === -1 && timeB === -1) {
        // If both are unmodified, sort by created date
        const createdA = a.createdOnWithoutFormat?.getTime() || 0;
        const createdB = b.createdOnWithoutFormat?.getTime() || 0;
        return (createdA - createdB) * order;
      }

      return (timeA - timeB) * order; // Modified items first
    });
  }

  sortByCreatedDate(array: any[], order: 1 | -1) {
    if (!array || !Array.isArray(array)) return array;

    return array.sort((a: any, b: any) => {
      const timeA = a.createdOnWithoutFormat?.getTime() || 0;
      const timeB = b.createdOnWithoutFormat?.getTime() || 0;
      return (timeA - timeB) * order;
    });
  }

  sortByTitle(array: any[], order: 1 | -1) {
    return array.sort((a: any, b: any) => {
      const titleA = a.title?.toLowerCase() || '';
      const titleB = b.title?.toLowerCase() || '';
      return titleA.localeCompare(titleB) * order;
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

  copyToClipboard(text: any) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.toast.showSuccessToast('Successfully Copied to Clipboard!');
      })
      .catch((err) => {
        console.error('Error copying text', err);
      });
  }
}
