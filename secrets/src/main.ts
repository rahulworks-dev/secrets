import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  console.log = function () {}; // Disable all logs
  console.error = function () {}; //  Disable errors
  // console.warn = function () {}; //  Disable warnings

  fetch('/assets/config.json')
    .then((response) => response.json())
    .then((config) => {
      environment.firebaseConfig.apiKey = config.apiKey;
      environment.firebaseConfig.authDomain = config.authDomain;
      environment.firebaseConfig.projectId = config.projectId;
      environment.firebaseConfig.storageBucket = config.storageBucket;
      environment.firebaseConfig.messagingSenderId = config.messagingSenderId;
      environment.firebaseConfig.appId = config.appId;
      environment.firebaseConfig.measurementId = config.measurementId;
      environment.secretKey = config.secretKey;
    })
    .catch((error) => {
      console.error('Error loading config:', error);
    })
    .finally(() => {
      platformBrowserDynamic()
        .bootstrapModule(AppModule)
        .catch((err) => console.error(err));
    });
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.log(err));
