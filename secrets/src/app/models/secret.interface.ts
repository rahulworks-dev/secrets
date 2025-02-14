export interface Secret {
  title: string;
  secret: string;
  userId: string;
  createdOn: Date;
  lastUpdatedOn?: Date;
  folderId: string;
}

export interface Folder {
  userId: string;
  folderName: string;
  folderColor: string;
  secrets: string[];
  createdOn: Date;
}
