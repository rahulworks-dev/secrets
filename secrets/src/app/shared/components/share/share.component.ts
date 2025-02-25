import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { arrayUnion } from '@angular/fire/firestore';
import { collection } from 'src/app/constants/secret.constant';
import { FirebaseHandlerService } from 'src/app/services/firebase-handler.service';
import { HelperService } from 'src/app/services/helper.service';
import { IntermediateService } from 'src/app/services/intermediate.service';
import { ToastService } from 'src/app/services/toast.service';
import { Notification } from 'src/app/models/secret.interface';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
  standalone: false,
})
export class ShareComponent implements OnInit {
  presentingElement!: HTMLElement | null;
  allUsers: any;
  filteredUsers: any;
  @Input() isModalOpen = false;
  @Input() selectedFolder: any;
  @Output() setModalOpenToFalse = new EventEmitter<any>();
  noResultsFound: boolean = false;
  iconName = 'copy-outline';
  isSelected = false;
  hideSearchBar = false;
  selectedUser: any;
  loggedInUserDetails: any;
  shareTo: any[] = [];
  constructor(
    private firebaseHandlerService: FirebaseHandlerService,
    private toast: ToastService,
    private intermediateService: IntermediateService,
    private helperService: HelperService
  ) {}

  ngOnInit() {
    this.presentingElement = document.querySelector('.dashboard');
    this.fetchLoggedInUserDetails();
  }

  async fetchLoggedInUserDetails() {
    this.loggedInUserDetails =
      await this.helperService.getLoggedInUserDetails();
    this.firebaseHandlerService.readAll(collection.USERS).subscribe({
      next: (resp) => {
        console.log(resp);
        if (resp?.length > 0) {
          this.allUsers = resp?.filter(
            (item: any) => item?.id !== this.loggedInUserDetails?.id
          );
        }
      },
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.noResultsFound = false;
    this.filteredUsers = [];
    this.shareTo = [];
  }

  handleInput(event: Event) {
    const enteredUsername = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();

    if (!enteredUsername) {
      this.filteredUsers = [];
      this.noResultsFound = false;
      return;
    }

    this.filteredUsers = this.allUsers.filter((user: any) =>
      user?.username?.toLowerCase().startsWith(enteredUsername)
    );
    this.noResultsFound = this.filteredUsers.length === 0;
  }

  onCopy() {
    const url = 'https://secretz.netlify.app';
    navigator.clipboard
      .writeText(url)
      .then(() => {
        this.iconName = 'copy';
        this.toast.showSuccessToast('Successfully Copied to Clipboard!');
      })
      .catch((err) => {
        console.error('Error copying text', err);
      });
  }

  close() {
    this.setModalOpenToFalse.next(true);
  }

  onSelectingUser(user: any, index: any) {
    if (this.selectedFolder) {
      let length = 0;
      if (this.selectedFolder?.sharedTo) {
        length = this.selectedFolder.sharedTo.length + this.shareTo.length;
      }

      if (
        this.selectedFolder?.sharedTo &&
        this.selectedFolder.sharedTo.some((u: any) => u.id === user.id)
      ) {
        this.toast.showErrorToast(
          `${user?.username} already has access to this folder!`
        );
      } else if (this.shareTo.some((u: any) => u.id === user.id)) {
        this.toast.showErrorToast('This user has been already selected');
      } else if (length == 5) {
        this.toast.showErrorToast(
          'Up to 5 people can have access to a folder.'
        );
      } else {
        this.shareTo.push({
          username: user?.username,
          id: user?.id,
        });
      }
    }
  }

  remove(index: any) {
    this.shareTo.splice(index, 1);
  }

  share() {
    const notifyUsers = this.shareTo;
    let grantedUsers: any = this.shareTo.map((item: any) => item?.username);
    grantedUsers =
      grantedUsers?.length > 2
        ? grantedUsers.slice(0, -1).join(', ') + ' & ' + grantedUsers.slice(-1)
        : grantedUsers?.length == 2
        ? grantedUsers.join(' & ')
        : grantedUsers;

    const payload = {
      sharedTo: this.selectedFolder?.sharedTo
        ? [...this.selectedFolder.sharedTo, ...this.shareTo]
        : [...this.shareTo],
    };

    this.intermediateService
      .update(this.selectedFolder?.id, payload, collection.FOLDERS)
      .subscribe({
        next: (resp) => {
          console.log(this.shareTo);
          this.toast.showInfoToast(
            'Successfully granted access to ' + grantedUsers
          );
          this.notifyUser(notifyUsers);
          this.setModalOpenToFalse.next(true);
          console.log(resp);
        },
      });
  }

  notifyUser(sharedTo: any) {
    if (sharedTo?.length < 1) {
      return;
    }

    const sharedUsers: Notification[] = sharedTo.map((user: any) => ({
      recipientId: user.id,
      senderId: this.loggedInUserDetails.id,
      folderId: this.selectedFolder?.id,
      message: `${this.loggedInUserDetails.username} shared a folder with you.`,
      isRead: false,
      createdOn: new Date(),
      redirectTo: `/folder?folderId=${this.selectedFolder?.id}&name=${this.selectedFolder?.folderName}&isSharedFolder=true`,
    }));
    sharedUsers.forEach((notif) => {
      this.intermediateService
        .create(notif, collection.NOTIFICATIONS)
        .subscribe();
    });
  }

  @HostListener('window:popstate', ['$event'])
  onPopState() {
    if (this.isModalOpen) {
      this.setModalOpenToFalse.next(true);
    }
  }
}
