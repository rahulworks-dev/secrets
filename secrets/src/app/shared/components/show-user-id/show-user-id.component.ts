import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-show-user-id',
  templateUrl: './show-user-id.component.html',
  styleUrls: ['./show-user-id.component.scss'],
  standalone: false,
})
export class ShowUserIdComponent implements OnInit {
  @Input() isModalOpen = false;
  @Input() userId: any;
  @Output() continueToLogin = new EventEmitter<any>();
  iconName = 'copy-outline';
  constructor(private toast: ToastService) {}

  ngOnInit() {
    this.iconName = 'copy-outline';
  }

  onCopy() {
    if (this.userId) {
      navigator.clipboard
        .writeText(this.userId)
        .then(() => {
          this.iconName = 'copy';
          this.toast.showSuccessToast('Successfully Copied to Clipboard!');
        })
        .catch((err) => {
          console.error('Error copying text', err);
        });
    }
  }

  login() {
    this.continueToLogin.next(true);
  }
}
