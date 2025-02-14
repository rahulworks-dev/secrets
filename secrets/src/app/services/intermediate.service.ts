import { Injectable } from '@angular/core';
import { FirebaseHandlerService } from './firebase-handler.service';
import { CryptoService } from './crypto.service';
import { collection } from '../constants/secret.constant';
import { from, map, Observable } from 'rxjs';
import { HelperService } from './helper.service';
import { Timestamp } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class IntermediateService {
  loggedInUserDetails: any;
  constructor(
    private firebaseHandlerService: FirebaseHandlerService,
    private cryptoService: CryptoService,
    private helperService: HelperService
  ) {
    this.initializeUserDetails();
  }

  private async initializeUserDetails() {
    this.loggedInUserDetails =
      await this.helperService.getLoggedInUserDetails();
  }

  create(data: any, collectionName: string): Observable<any> {
    if (data.hasOwnProperty('secret')) {
      data = {
        ...data,
        secret: this.cryptoService.encrypt(data?.secret),
      };
    }
    return from(this.firebaseHandlerService.create(data, collectionName));
  }

  update(id: string, data: any, collectionName: string): Observable<any> {
    if (data.hasOwnProperty('secret')) {
      data = {
        ...data,
        secret: this.cryptoService.encrypt(data?.secret),
      };
    }
    return from(
      this.firebaseHandlerService.updateItem(id, data, collectionName)
    );
  }

  readAll(collectionName: string): Observable<any[]> {
    return this.firebaseHandlerService.readAll(collectionName).pipe(
      map((resp: any[]) =>
        resp
          .filter((item) => item?.userId === this.loggedInUserDetails?.id)
          .map((item) => {
            // Convert Firestore Timestamps to Date if they exist
            if (item.createdOn instanceof Timestamp) {
              item.createdOn = item.createdOn.toDate();
            }
            if (item.lastUpdatedOn instanceof Timestamp) {
              item.lastUpdatedOn = item.lastUpdatedOn.toDate();
            }

            // Decrypt secret if it exists
            if (item.secret) {
              item.secret = this.cryptoService.decrypt(item.secret);
            }

            return item;
          })
      )
    );
  }

  readById(id: string, collectionName: string): Observable<any> {
    return this.firebaseHandlerService.getItemById(id, collectionName).pipe(
      map((item: any) => {
        if (!item) return null;

        // Convert Firestore Timestamps to Date if they exist
        if (item.createdOn instanceof Timestamp) {
          item.createdOn = item.createdOn.toDate();
        }
        if (item.lastUpdatedOn instanceof Timestamp) {
          item.lastUpdatedOn = item.lastUpdatedOn.toDate();
        }

        // Decrypt secret if it exists
        if (item.secret) {
          item.secret = this.cryptoService.decrypt(item.secret);
        }

        return item;
      })
    );
  }
}
