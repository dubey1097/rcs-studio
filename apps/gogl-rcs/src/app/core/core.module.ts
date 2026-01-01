import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { ErrorInterceptor } from './interceptors/error.interceptor';
import { LoggerService } from '@gogl-rcs/shared/logger';
import { ApiService } from './services/api.service';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './guards/auth.guard';
import { UserResolver } from './resolvers/user.resolver';

/**
 * Core Module
 * Contains singleton services, guards, resolvers, and interceptors
 * Should be imported only once in AppModule
 */
@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [
    LoggerService,
    ApiService,
    AuthService,
    AuthGuard,
    UserResolver,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
  ],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only.');
    }
  }
}

