import { Injectable } from '@angular/core';
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
import { map, Observable } from 'rxjs';
import { CryptoService } from './crypto.service';
import { HelperService } from './helper.service';
@Injectable({
  providedIn: 'root',
})
export class FirebaseHandlerService {
  constructor(
    private firestore: Firestore,
    private cryptoService: CryptoService,
    private helperService: HelperService
  ) {}

  async create(data: any, collectionName: any): Promise<void> {
    if (collectionName === 'secrets') {
      data = {
        ...data,
        secret: this.cryptoService.encrypt(data?.secret),
      };
    }
    const itemsCollection = collection(this.firestore, collectionName);
    await addDoc(itemsCollection, data);
  }

  readAll(collectionName: any): Observable<any[]> {
    const itemsCollection = collection(this.firestore, collectionName);
    return collectionData(itemsCollection, { idField: 'id' }).pipe(
      map((items) =>
        items.map((item) => {
          if (item['createdOn'] instanceof Timestamp) {
            item = { ...item, createdOn: item['createdOn'].toDate() };
          }
          if (item['secret']) {
            item = {
              ...item,
              secret: this.cryptoService.decrypt(item['secret']),
            };
          }
          return item;
        })
      )
    );
  }

  getItemById(id: string, collectionName: any): Observable<any> {
    const itemDoc = doc(this.firestore, `${collectionName}/${id}`);
    return docData(itemDoc, { idField: 'id' }).pipe(
      map((item: any) => {
        if (!item) return null;
        if (item['secret']) {
          return {
            ...item,
            secret: this.cryptoService.decrypt(item.secret),
          };
        } else {
          return item;
        }
      })
    );
  }

  async updateItem(id: string, data: any, collectionName: any): Promise<void> {
    if (collectionName === 'secrets') {
      data = {
        ...data,
        secret: this.cryptoService.encrypt(data?.secret),
      };
    }
    const itemDoc = doc(this.firestore, `${collectionName}/${id}`);
    await updateDoc(itemDoc, data);
  }

  async deleteItem(id: string, collectionName: any): Promise<void> {
    const itemDoc = doc(this.firestore, `${collectionName}/${id}`);
    await deleteDoc(itemDoc);
  }
}
