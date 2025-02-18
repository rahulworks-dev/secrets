import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { collection } from 'src/app/constants/secret.constant';
import { FirebaseHandlerService } from 'src/app/services/firebase-handler.service';
import { IntermediateService } from 'src/app/services/intermediate.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
  standalone: false,
})
export class ShareComponent implements OnInit {
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
  constructor(
    private firebaseHandlerService: FirebaseHandlerService,
    private toast: ToastService,
    private intermediateService: IntermediateService
  ) {}

  ngOnInit() {
    this.firebaseHandlerService.readAll(collection.USERS).subscribe({
      next: (resp) => {
        console.log(resp);
        if (resp?.length > 0) {
          this.allUsers = resp;
        }
      },
    });
  }

  ngOnChanges() {
    this.noResultsFound = false;
    this.filteredUsers = [];
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
    if (this.filteredUsers?.length > 0) {
      this.filteredUsers = this.filteredUsers.map((item: any) => {
        return {
          ...item,
          isSelected: false,
        };
      });
    }
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
    this.selectedUser = user;
    this.filteredUsers[index].isSelected =
      !this.filteredUsers[index].isSelected;
    this.hideSearchBar = !this.hideSearchBar;
  }

  share() {
    const payload = {
      sharedTo: this.selectedUser.id,
    };
    this.intermediateService
      .update(this.selectedFolder?.id, payload, collection.FOLDERS)
      .subscribe({
        next: (resp) => {
          this.toast.showInfoToast(
            'Successfully Shared to ' + this.selectedUser.username
          );
          this.setModalOpenToFalse.next(true);
          console.log(resp);
        },
      });
  }
}
