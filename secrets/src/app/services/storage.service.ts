import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  public set(key: string, value: any) {
    this._storage?.set(key, value);
  }

  public async get(key: string): Promise<any> {
    if (!this._storage) {
      await this.init();
    }
    const response = await this._storage?.get(key);
    if (response) {
      return JSON.parse(response);
    } else {
      return response;
    }
  }

  public remove(key: string) {
    this._storage?.remove(key);
  }

  public clear() {
    this._storage?.clear();
  }
}
