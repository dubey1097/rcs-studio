/**
 * Logger Service
 * Provides centralized logging functionality with different log levels
 * Follows Singleton pattern for consistent logging across the application
 */

import { Injectable } from '@angular/core';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
  stack?: string;
}

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private logLevel: LogLevel = LogLevel.DEBUG;
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  /**
   * Sets the minimum log level
   * @param level - The minimum log level to display
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Logs a debug message
   * @param message - The message to log
   * @param data - Optional additional data
   */
  debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Logs an info message
   * @param message - The message to log
   * @param data - Optional additional data
   */
  info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Logs a warning message
   * @param message - The message to log
   * @param data - Optional additional data
   */
  warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Logs an error message
   * @param message - The message to log
   * @param error - Optional error object or additional data
   */
  error(message: string, error?: unknown): void {
    const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : error;
    this.log(LogLevel.ERROR, message, errorData, error instanceof Error ? error.stack : undefined);
  }

  /**
   * Gets all logs
   * @returns Array of log entries
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clears all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Internal method to handle logging
   * @param level - The log level
   * @param message - The message to log
   * @param data - Optional additional data
   * @param stack - Optional stack trace
   */
  private log(level: LogLevel, message: string, data?: unknown, stack?: string): void {
    if (level < this.logLevel) {
      return;
    }

    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      stack,
    };

    this.logs.push(logEntry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Output to console based on level
    const consoleMethod = this.getConsoleMethod(level);
    if (data) {
      consoleMethod(`[${this.getLevelName(level)}] ${message}`, data);
    } else {
      consoleMethod(`[${this.getLevelName(level)}] ${message}`);
    }

    if (stack && level === LogLevel.ERROR) {
      console.error(stack);
    }
  }

  /**
   * Gets the appropriate console method for the log level
   * @param level - The log level
   * @returns The console method to use
   */
  private getConsoleMethod(level: LogLevel): typeof console.log {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug;
      case LogLevel.INFO:
        return console.info;
      case LogLevel.WARN:
        return console.warn;
      case LogLevel.ERROR:
        return console.error;
      default:
        return console.log;
    }
  }

  /**
   * Gets the string name of the log level
   * @param level - The log level
   * @returns The string name
   */
  private getLevelName(level: LogLevel): string {
    return LogLevel[level];
  }
}

