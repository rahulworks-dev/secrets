import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { bottomTabs } from 'src/app/data/static-data';

@Component({
  selector: 'app-desktop-sidebar',
  templateUrl: './desktop-sidebar.component.html',
  styleUrls: ['./desktop-sidebar.component.scss'],
  standalone: false,
})
export class DesktopSidebarComponent implements OnInit {
  sidebarTabs = bottomTabs;
  activeIndex = 0;
  constructor(private router: Router, private route: ActivatedRoute) {}

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
    this.router.navigateByUrl(tabDetails?.route);
  }

  calculateIndicatorPosition(index: number): string {
    // const totalTabs = this.sidebarTabs.length;
    return `calc(${50 * this.activeIndex}px `;
  }
}
