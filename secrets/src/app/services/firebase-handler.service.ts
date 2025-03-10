import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  Firestore,
  getDocs,
  runTransaction,
  setDoc,
  Timestamp,
  Transaction,
  updateDoc,
  writeBatch,
} from '@angular/fire/firestore';
import { from, map, Observable, of, throwError } from 'rxjs';
import { CryptoService } from './crypto.service';
import { HelperService } from './helper.service';

@Injectable({
  providedIn: 'root',
})
export class FirebaseHandlerService {
  private firestore = inject(Firestore);
  private cryptoService = inject(CryptoService);
  private helperService = inject(HelperService);

  create(data: any, collectionName: string): Observable<any> {
    return from(
      (async () => {
        if (!this.firestore) throw new Error('Firestore not initialized');
        const itemsCollection = collection(this.firestore, collectionName);
        const docRef = await addDoc(itemsCollection, data);
        return docRef.id;
      })()
    );
  }

  readAll(collectionName: string): Observable<any[]> {
    if (!this.firestore) {
      console.warn('Firestore is not initialized');
      return of([]);
    }
    // return throwError(() => new Error('Failed to fetch data from Firestore'));
    const itemsCollection = collection(this.firestore, collectionName);
    return collectionData(itemsCollection, { idField: 'id' });
  }

  getItemById(id: string, collectionName: string): Observable<any> {
    if (!this.firestore) return of(null);

    const itemDoc = doc(this.firestore, `${collectionName}/${id}`);
    return docData(itemDoc, { idField: 'id' });
  }

  updateItem(id: string, data: any, collectionName: string): Observable<void> {
    return from(
      (async () => {
        if (!this.firestore) throw new Error('Firestore not initialized');
        const itemDoc = doc(this.firestore, `${collectionName}/${id}`);
        await setDoc(itemDoc, data, { merge: true });
      })()
    );
  }

  async deleteItem(id: string, collectionName: string): Promise<void> {
    if (!this.firestore) return;

    const itemDoc = doc(this.firestore, `${collectionName}/${id}`);
    await deleteDoc(itemDoc);
  }
}
