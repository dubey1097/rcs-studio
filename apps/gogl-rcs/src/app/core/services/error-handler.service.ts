import { Injectable, ErrorHandler, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { LoggerService } from '@gogl-rcs/shared/logger';
import { AppError, ErrorHandler as AppErrorHandler } from '@gogl-rcs/shared/errors';

/**
 * Global Error Handler Service
 * Handles unhandled errors and exceptions
 * Implements Angular ErrorHandler interface
 */
@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandlerService implements ErrorHandler {
  private logger?: LoggerService;

  constructor(private injector: Injector) {
    // Inject LoggerService lazily to avoid circular dependency
    setTimeout(() => {
      this.logger = this.injector.get(LoggerService);
    });
  }

  /**
   * Handles errors globally
   * @param error - The error to handle
   */
  handleError(error: Error | HttpErrorResponse): void {
    let appError: AppError;

    if (error instanceof HttpErrorResponse) {
      // HTTP Error
      appError = new AppError(
        error.message || 'An HTTP error occurred',
        error.status || 500,
        error.error
      );
    } else if (error instanceof AppError) {
      // Application Error
      appError = error;
    } else {
      // Unknown Error
      appError = AppErrorHandler.handleError(error);
    }

    // Log the error
    if (this.logger) {
      this.logger.error('Global error handler', {
        error: appError,
        message: appError.message,
        stack: error instanceof Error ? error.stack : undefined,
      });
    } else {
      console.error('Global error handler', appError);
    }

    // TODO: Show user-friendly error notification
    // this.notificationService.showError(appError.message);
  }
}

