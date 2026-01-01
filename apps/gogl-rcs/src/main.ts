import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { enableProdMode, ErrorHandler } from '@angular/core';

import { GlobalErrorHandlerService } from './app/core/services/error-handler.service';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule, {
    providers: [
      {
        provide: ErrorHandler,
        useClass: GlobalErrorHandlerService,
      },
    ],
  })
  .catch((err) => console.error(err));

