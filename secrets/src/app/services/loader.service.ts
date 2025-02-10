import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  constructor() {}
  public loading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.loading.asObservable(); // Observable to track loader state

  show() {
    this.loading.next(true);
  }

  hide() {
    this.loading.next(false);
  }
}
