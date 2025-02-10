import { Component, OnInit } from '@angular/core';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false,
})
export class HeaderComponent implements OnInit {
  isLoading = this.loaderService.isLoading$;
  constructor(private loaderService: LoaderService) {}

  ngOnInit() {}
}
