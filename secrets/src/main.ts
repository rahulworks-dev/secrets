import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  console.log = function () {}; // Disable all logs
  console.error = function () {}; //  Disable errors
  console.warn = function () {}; //  Disable warnings
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.log(err));
