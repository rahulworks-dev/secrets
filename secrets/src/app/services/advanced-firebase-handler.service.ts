import { inject, Injectable } from '@angular/core';
import {
  arrayRemove,
  arrayUnion,
  doc,
  Firestore,
  runTransaction,
  writeBatch,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class AdvancedFirebaseHandlerService {
  private firestore = inject(Firestore);

  constructor() {}

  async moveSecret(
    folderId: string,
    secretId: string,
    existingFolderId: string
  ) {
    const secretRef = doc(this.firestore, `secrets/${secretId}`);
    const newFolderRef = doc(this.firestore, `folders/${folderId}`);
    const oldFolderRef = existingFolderId
      ? doc(this.firestore, `folders/${existingFolderId}`)
      : null;

    await runTransaction(this.firestore, async (transaction: any) => {
      // Push SecretId to Folder
      transaction.update(newFolderRef, {
        secrets: arrayUnion(secretId),
      });

      // Update folderId in Secret
      transaction.update(secretRef, {
        folderId: folderId,
      });

      // Remove SecretId from previoud folder if exists
      if (existingFolderId) {
        transaction.update(oldFolderRef, {
          secrets: arrayRemove(secretId),
        });
      }
    });
  }

  async removeSecretFromFolder(
    secretId: string,
    folderId: string
  ): Promise<void> {
    const secretRef = doc(this.firestore, `secrets/${secretId}`);
    const folderRef = doc(this.firestore, `folders/${folderId}`);

    await runTransaction(this.firestore, async (transaction: any) => {
      // Make folderId Empty in secret
      transaction.update(secretRef, {
        folderId: '',
      });

      // Remove secretId from the folder's secrets array
      transaction.update(folderRef, {
        secrets: arrayRemove(secretId),
      });
    });
  }

  async deleteFolder(folderId: string, secretsId: any[]) {
    const folderRef = folderId
      ? doc(this.firestore, `folders/${folderId}`)
      : null;

    await runTransaction(this.firestore, async (transaction: any) => {
      if (secretsId.length > 0) {
        this.updateInBulk(secretsId, 'secrets', { folderId: '' });
      }
      transaction.delete(folderRef);
    });
  }

  async updateInBulk(
    ids: any[],
    collectionName: string,
    updateObj: any = { isRead: true }
  ): Promise<void> {
    const batch = writeBatch(this.firestore); // Create a batch

    ids.forEach((id) => {
      const docRef = doc(this.firestore, collectionName, id); // Reference to the document
      batch.update(docRef, updateObj); // Add update operation to batch
    });

    await batch.commit(); // Execute all updates in one go
  }

  async deleteSecret(secretId: string, folderId: string): Promise<void> {
    const secretRef = doc(this.firestore, `secrets/${secretId}`);
    const folderRef = folderId
      ? doc(this.firestore, `folders/${folderId}`)
      : null;

    await runTransaction(this.firestore, async (transaction: any) => {
      // Remove secret document
      transaction.delete(secretRef);

      if (folderId) {
        // Remove secretId from the folder's secrets array
        transaction.update(folderRef, {
          secrets: arrayRemove(secretId),
        });
      }
    });
  }

  async deleteSecrets(secrets: any[]) {
    if (secrets.length < 1) {
      return;
    }
    await runTransaction(this.firestore, async (transanction: any) => {
      const secretIds = secrets.map((i) => i.id);
      this.removeSecretsFromFolderInBulk(secrets);
      this.deleteInBulk(secretIds, 'secrets');
    });
  }

  async removeSecretsFromFolderInBulk(secrets: any) {
    const batch = writeBatch(this.firestore); // Create a batch

    secrets.forEach((secret: any) => {
      const docRef = doc(this.firestore, 'folders', secret?.folderId);
      batch.update(docRef, { secrets: arrayRemove(secret?.id) });
    });

    await batch.commit();
  }

  async deleteInBulk(ids: any[], collectionName: any): Promise<void> {
    if (ids.length < 1) {
      return;
    }
    const batch = writeBatch(this.firestore);
    ids.forEach((id) => {
      const notificationRef = doc(this.firestore, `${collectionName}/${id}`);
      batch.delete(notificationRef);
    });
    await batch.commit();
  }
}
