import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about-secrets',
  templateUrl: './about-secrets.page.html',
  styleUrls: ['./about-secrets.page.scss'],
  standalone: false,
})
export class AboutSecretsPage implements OnInit {
  slideOpts = {
    initialSlide: 0, // Start from the first slide
    speed: 400, // Transition speed
    autoplay: { delay: 3000 }, // Auto-slide every 3s
    loop: true, // Enable infinite looping
  };
  constructor() {}

  ngOnInit() {}
}
