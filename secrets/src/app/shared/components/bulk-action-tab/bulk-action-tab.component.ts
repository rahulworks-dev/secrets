import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-bulk-action-tab',
  templateUrl: './bulk-action-tab.component.html',
  styleUrls: ['./bulk-action-tab.component.scss'],
  standalone: false,
})
export class BulkActionTabComponent implements OnInit {
  @Input() isModalOpen = false;
  @Input() bulkActionSecrets: any;
  @Input() isArchivePage = false;

  @Output() _bulkArchieve = new EventEmitter<any>();
  @Output() _showDeleteAlert = new EventEmitter<any>();
  constructor() {}

  ngOnInit() {}

  bulkArchive() {
    this._bulkArchieve.next(true);
  }

  showDeleteAlert() {
    this._showDeleteAlert.next(true);
  }
}
