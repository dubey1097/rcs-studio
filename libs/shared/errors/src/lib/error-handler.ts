/**
 * Global error handler utility
 */

import { AppError } from './app-error';

export class ErrorHandler {
  /**
   * Handles and processes errors consistently
   */
  static handleError(error: Error | AppError): AppError {
    if (error instanceof AppError) {
      return error;
    }

    // Convert unknown errors to AppError
    return new AppError(
      error.message || 'An unexpected error occurred',
      500,
      error,
      false
    );
  }

  /**
   * Creates a standardized error response
   */
  static createErrorResponse(error: AppError): {
    error: {
      code: string;
      message: string;
      statusCode: number;
      timestamp: string;
      details?: unknown;
    };
  } {
    return {
      error: {
        code: error.name,
        message: error.message,
        statusCode: error.statusCode,
        timestamp: error.timestamp,
        details: error.details,
      },
    };
  }
}

