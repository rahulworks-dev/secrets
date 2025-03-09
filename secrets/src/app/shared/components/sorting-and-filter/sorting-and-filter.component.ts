import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { collection, storage } from 'src/app/constants/secret.constant';
import { sortingList } from 'src/app/data/static-data';
import { sortingPreference } from 'src/app/models/secret.interface';
import { HelperService } from 'src/app/services/helper.service';
import { IntermediateService } from 'src/app/services/intermediate.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-sorting-and-filter',
  templateUrl: './sorting-and-filter.component.html',
  styleUrls: ['./sorting-and-filter.component.scss'],
  standalone: false,
})
export class SortingAndFilterComponent implements OnInit {
  sortingList = sortingList;
  activeSortingIndex = 0;

  @Input() isModalOpen = false;
  @Output() closeModal = new EventEmitter<any>();
  constructor(
    private intermediateService: IntermediateService,
    private helperService: HelperService,
    private storageService: StorageService
  ) {}

  ngOnInit() {}

  ngOnChanges() {
    this.setActiveSortIfPresent();
  }

  async setActiveSortIfPresent() {
    const loggedInUserDetails =
      await this.helperService.getLoggedInUserDetails();
    this.activeSortingIndex = loggedInUserDetails?.sortingPreferenceType || 0;
    if (this.activeSortingIndex !== 0) {
      this.sortingList[this.activeSortingIndex].sort_criteria =
        loggedInUserDetails?.sortingPreferenceOrder == 1
          ? 'ascending'
          : 'descending';
    }
  }

  onSortingSelection(sort: any, index: any) {
    this.activeSortingIndex = index;
  }

  onSortCriteria(index: any) {
    this.sortingList[index].sort_criteria =
      this.sortingList[index].sort_criteria === 'ascending'
        ? 'descending'
        : 'ascending';
  }

  async onSortSelection() {
    const loggedInUserDetails =
      await this.helperService.getLoggedInUserDetails();
    const sortingPreferenceOrder =
      this.sortingList[this.activeSortingIndex].sort_criteria === 'ascending'
        ? 1
        : -1;
    const payload: sortingPreference = {
      sortingPreferenceType: this.activeSortingIndex,
      sortingPreferenceOrder: sortingPreferenceOrder,
    };
    this.intermediateService
      .update(loggedInUserDetails.id, payload, collection.USERS)
      .subscribe(() => {
        this.updateLoggedInUserDetailsInStorage(loggedInUserDetails, payload);
      });
  }

  updateLoggedInUserDetailsInStorage(loggedInUserDetails: any, payload: any) {
    this.intermediateService
      .readById(loggedInUserDetails?.id, collection.USERS)
      .subscribe({
        next: (resp) => {
          this.storageService.set(storage.IS_LOGGED_IN, JSON.stringify(resp));
          this.closeModal.next(payload);
        },
      });
  }
  willDismiss() {
    this.closeModal.next({});
  }
}
