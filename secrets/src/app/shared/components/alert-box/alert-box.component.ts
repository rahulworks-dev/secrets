import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-alert-box',
  templateUrl: './alert-box.component.html',
  styleUrls: ['./alert-box.component.scss'],
  standalone: false,
})
export class AlertBoxComponent implements OnInit {
  @Input() contentText: any;
  @Input() headerTitle: any;
  @Input() headerIcon: any;
  @Input() alertColor: any;
  @Output() _depressAlert = new EventEmitter<boolean>(false);
  constructor() {}

  ngOnInit() {}

  close() {
    this._depressAlert.next(true);
  }
}
