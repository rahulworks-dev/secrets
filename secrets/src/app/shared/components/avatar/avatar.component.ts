import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
  standalone: false,
})
export class AvatarComponent implements OnInit {
  @Input() avatar: any = 'U';
  @Input() size: number = 30;
  @Input() fontSize: number = 16;
  @Input() fontColor: string = '#fff';
  constructor() {}

  ngOnInit() {}
}
