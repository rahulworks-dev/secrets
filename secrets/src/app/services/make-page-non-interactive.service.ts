import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MakePageNonInteractiveService {
  constructor() {}
  public makePageNonInteractive = new BehaviorSubject<boolean>(false);
  makePageNonInteractive$ = this.makePageNonInteractive.asObservable(); // Observable to track loader state

  activate() {
    this.makePageNonInteractive.next(true);
  }

  deactivate() {
    this.makePageNonInteractive.next(false);
  }
}
