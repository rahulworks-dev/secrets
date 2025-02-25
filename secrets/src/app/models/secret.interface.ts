export interface signup {
  name?: string;
  username: string;
  password: string;
  createdOn: Date;
}
export interface Secret {
  title: string;
  secret: string;
  userId: string;
  createdOn: Date;
  lastUpdatedOn?: Date;
  folderId: string;
  isFavorite: boolean;
  isArchived: boolean;
}

export interface Folder {
  userId: string;
  folderName: string;
  folderColor: string;
  secrets: string[];
  sharedTo: object[];
  createdOn: Date;
}

export interface Notification {
  recipientId: string;
  senderId: string;
  folderId: string;
  message: string;
  isRead: boolean;
  createdOn: Date;
  redirectTo: string;
}
