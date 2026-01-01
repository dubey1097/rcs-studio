/**
 * Global application error class
 * Provides consistent error handling across the application
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly timestamp: string;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    details?: unknown,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where our error was thrown
    // Note: captureStackTrace is Node.js specific, not available in browser
    if ('captureStackTrace' in Error && typeof (Error as unknown as { captureStackTrace: (error: Error, constructor: Function) => void }).captureStackTrace === 'function') {
      (Error as unknown as { captureStackTrace: (error: Error, constructor: Function) => void }).captureStackTrace(this, this.constructor);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      details: this.details,
      isOperational: this.isOperational,
    };
  }
}

