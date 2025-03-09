import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  console.log = function () {}; // Disable all logs
  console.error = function () {}; //  Disable errors
  console.warn = function () {}; //  Disable warnings

  fetch('/assets/config.json')
    .then((response) => response.json())
    .then((config) => {
      environment.firebaseConfig.apiKey = config.apiKey;
    })
    .catch((error) => {
      console.error('Error loading config:', error);
    })
    .finally(() => {
      document.getElementById('app-loader')?.remove();
      platformBrowserDynamic()
        .bootstrapModule(AppModule)
        .catch((err) => console.error(err));
    });
}

if (!environment.production) {
  document.getElementById('app-loader')?.remove();
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.log(err));
}
