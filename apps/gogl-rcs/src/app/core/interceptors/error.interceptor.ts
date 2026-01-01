import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { LoggerService } from '@gogl-rcs/shared/logger';
import { AppError } from '@gogl-rcs/shared/errors';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private logger: LoggerService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        const appError = new AppError(
          error.message || 'An unexpected error occurred',
          error.status || 500,
          error.error
        );

        this.logger.error('HTTP Error', {
          url: request.url,
          method: request.method,
          status: error.status,
          error: appError,
        });

        return throwError(() => appError);
      })
    );
  }
}

