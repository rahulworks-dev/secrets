import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, Event } from '@angular/router';
import { filter, takeUntil } from 'rxjs';
import { bottomTabs } from 'src/app/data/static-data';
import { HelperService } from 'src/app/services/helper.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-bottom-tab',
  templateUrl: './bottom-tab.component.html',
  styleUrls: ['./bottom-tab.component.scss'],
  standalone: false,
})
export class BottomTabComponent implements OnInit {
  bottomsTabs = bottomTabs;
  activeIndex = 0;
  constructor(
    private router: Router,
    private toast: ToastService,
    private route: ActivatedRoute,
    private helperService: HelperService
  ) {}

  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateActiveIndex();
      });
    this.updateActiveIndex();
  }

  updateActiveIndex() {
    const data =
      this.route.snapshot.data['activeIndex'] ||
      this.route.root.firstChild?.snapshot.data['activeIndex'];
    this.activeIndex = data !== undefined ? data : null;
  }

  navigate(tabDetails: any, index: any) {
    this.activeIndex = index;
    // if (tabDetails?.name === 'Add') {
    //   this.helperService.isAddClickedFromTab.next(true);
    // }
    this.router.navigateByUrl(tabDetails?.route);
  }

  calculateIndicatorPosition(index: number): string {
    const totalTabs = this.bottomsTabs.length;
    const tabWidth = 100 / totalTabs;
    const indicatorWidth = 70;

    return `calc(${
      index * tabWidth
    }% + (${tabWidth}% / 2) - (${indicatorWidth}px / 2))`;
  }
}
