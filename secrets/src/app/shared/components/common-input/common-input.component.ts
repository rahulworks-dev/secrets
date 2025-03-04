import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-common-input',
  templateUrl: './common-input.component.html',
  styleUrls: ['./common-input.component.scss'],
  standalone: false,
})
export class CommonInputComponent implements OnInit {
  @Input() placeholder: any;
  @Input() type = 'text';
  @Input() maxlength: any;
  @Input() control!: FormControl;
  @Input() controlName: any;
  @Input() showErrors = true;
  @Output() expandHeight = new EventEmitter<any>();

  constructor() {}

  ngOnInit() {}

  ngOnChanges() {
    console.log(this.control);
  }

  isControlInvalid() {
    const isInvalid =
      this.control.invalid && (this.control.dirty || this.control.touched);
    if (isInvalid && this.showErrors) {
      this.expandHeight.next(true);
    }
    return isInvalid && this.showErrors;
  }

  getErrorType(): string | null {
    if (!this.control || !this.control.errors) return null;

    const errorKeys = Object.keys(this.control.errors);
    return errorKeys.length > 0 ? errorKeys[0] : null;
  }
}
