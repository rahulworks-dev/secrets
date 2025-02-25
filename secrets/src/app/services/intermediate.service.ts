import { Injectable } from '@angular/core';
import { FirebaseHandlerService } from './firebase-handler.service';
import { CryptoService } from './crypto.service';
import { collection } from '../constants/secret.constant';
import { firstValueFrom, from, map, Observable, switchMap, tap } from 'rxjs';
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
  ) {}

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

  readAll(collectionName: string, comparisonKey = 'userId'): Observable<any[]> {
    return from(this.helperService.getLoggedInUserDetails()).pipe(
      tap((userDetails) => {
        this.loggedInUserDetails = userDetails;
      }),
      switchMap(() => this.firebaseHandlerService.readAll(collectionName)),
      tap((item: any) => {}),
      map((resp: any[]) => {
        let filteredResp = resp;
        if (comparisonKey) {
          filteredResp = resp.filter(
            (item) => item?.[comparisonKey] === this.loggedInUserDetails?.id
          );
        }

        return filteredResp.map((item) => {
          if (item.createdOn instanceof Timestamp) {
            item['createdOnWithoutFormat'] = item.createdOn.toDate();
            item.createdOn = this.helperService.formatDate(
              item.createdOn,
              collectionName === 'notifications' ? '' : 'Created'
            );
            //   item.createdOn = this.helperService.formatDate(
            //     Timestamp.fromDate(new Date(2025, 1, 23, 0, 0)),
            //     'Created'
            //   );
          }
          if (item.lastUpdatedOn instanceof Timestamp) {
            item['lastUpdatedOnWithoutFormat'] = item.lastUpdatedOn.toDate();
            item.lastUpdatedOn = this.helperService.formatDate(
              item.lastUpdatedOn,
              'Last Updated'
            );
          }

          // Decrypt secret if it exists
          if (item.secret) {
            item.secret = this.cryptoService.decrypt(item.secret);
          }

          return item;
        });
      })
    );
  }

  readById(id: string, collectionName: string): Observable<any> {
    return this.firebaseHandlerService.getItemById(id, collectionName).pipe(
      map((item: any) => {
        if (!item) return null;

        if (item.createdOn instanceof Timestamp) {
          item['createdOnWithoutFormat'] = item.createdOn.toDate();
          item.createdOn = this.helperService.formatDate(
            item.createdOn,
            collectionName === 'notifications' ? '' : 'Created'
          );
        }
        if (item.lastUpdatedOn instanceof Timestamp) {
          item['lastUpdatedOnWithoutFormat'] = item.lastUpdatedOn.toDate();
          item.lastUpdatedOn = this.helperService.formatDate(
            item.lastUpdatedOn,
            'Last Updated'
          );
        }

        if (item.secret) {
          item.secret = this.cryptoService.decrypt(item.secret);
        }

        return item;
      })
    );
  }
}
