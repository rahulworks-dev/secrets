import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  Firestore,
  Timestamp,
  updateDoc,
} from '@angular/fire/firestore';
import { map, Observable, of } from 'rxjs';
import { CryptoService } from './crypto.service';
import { HelperService } from './helper.service';

@Injectable({
  providedIn: 'root',
})
export class FirebaseHandlerService {
  private firestore = inject(Firestore);
  private cryptoService = inject(CryptoService);
  private helperService = inject(HelperService);

  async create(data: any, collectionName: string): Promise<void> {
    if (!this.firestore) return;

    if (collectionName === 'secrets') {
      data = {
        ...data,
        secret: this.cryptoService.encrypt(data?.secret),
      };
    }
    const itemsCollection = collection(this.firestore, collectionName);
    await addDoc(itemsCollection, data);
  }

  readAll(collectionName: string): Observable<any[]> {
    if (!this.firestore) {
      console.warn('Firestore is not initialized');
      return of([]);
    }

    const itemsCollection = collection(this.firestore, collectionName);
    return collectionData(itemsCollection, { idField: 'id' }).pipe(
      map((items) =>
        items.map((item) => {
          let newItem = { ...item };

          if (newItem['createdOn'] instanceof Timestamp) {
            newItem['createdOn'] = newItem['createdOn'].toDate();
          }

          if (newItem['secret']) {
            newItem['secret'] = this.cryptoService.decrypt(newItem['secret']);
          }

          return newItem;
        })
      )
    );
  }

  getItemById(id: string, collectionName: string): Observable<any> {
    if (!this.firestore) return of(null);

    const itemDoc = doc(this.firestore, `${collectionName}/${id}`);
    return docData(itemDoc, { idField: 'id' }).pipe(
      map((item: any) => {
        if (!item) return null;

        let newItem = { ...item };

        if (newItem['secret']) {
          newItem['secret'] = this.cryptoService.decrypt(newItem.secret);
        }

        if (newItem['createdOn'] instanceof Timestamp) {
          newItem['createdOn'] = newItem['createdOn'].toDate();
        }

        return newItem;
      })
    );
  }

  async updateItem(
    id: string,
    data: any,
    collectionName: string
  ): Promise<void> {
    if (!this.firestore) return;

    if (collectionName === 'secrets') {
      data = {
        ...data,
        secret: this.cryptoService.encrypt(data?.secret),
      };
    }

    const itemDoc = doc(this.firestore, `${collectionName}/${id}`);
    await updateDoc(itemDoc, data);
  }

  async deleteItem(id: string, collectionName: string): Promise<void> {
    if (!this.firestore) return;

    const itemDoc = doc(this.firestore, `${collectionName}/${id}`);
    await deleteDoc(itemDoc);
  }
}
