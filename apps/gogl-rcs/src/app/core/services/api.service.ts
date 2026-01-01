import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LoggerService } from '@gogl-rcs/shared/logger';
import { AppError } from '@gogl-rcs/shared/errors';

/**
 * API Service
 * Base service for HTTP operations
 * Implements Template Method pattern for API calls
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl: string;

  constructor(
    private http: HttpClient,
    private logger: LoggerService
  ) {
    this.baseUrl = environment.apiUrl;
  }

  /**
   * Performs a GET request
   * @param endpoint - API endpoint
   * @param params - Query parameters
   * @returns Observable of the response
   */
  get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    const httpParams = this.buildParams(params);

    this.logger.debug(`GET ${url}`, { params });

    return this.http.get<T>(url, { params: httpParams }).pipe(
      map((response) => this.handleResponse<T>(response)),
      catchError((error) => this.handleError(error, 'GET', url))
    );
  }

  /**
   * Performs a POST request
   * @param endpoint - API endpoint
   * @param body - Request body
   * @returns Observable of the response
   */
  post<T>(endpoint: string, body?: unknown): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;

    this.logger.debug(`POST ${url}`, { body });

    return this.http.post<T>(url, body, this.getHeaders()).pipe(
      map((response) => this.handleResponse<T>(response)),
      catchError((error) => this.handleError(error, 'POST', url))
    );
  }

  /**
   * Performs a PUT request
   * @param endpoint - API endpoint
   * @param body - Request body
   * @returns Observable of the response
   */
  put<T>(endpoint: string, body?: unknown): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;

    this.logger.debug(`PUT ${url}`, { body });

    return this.http.put<T>(url, body, this.getHeaders()).pipe(
      map((response) => this.handleResponse<T>(response)),
      catchError((error) => this.handleError(error, 'PUT', url))
    );
  }

  /**
   * Performs a PATCH request
   * @param endpoint - API endpoint
   * @param body - Request body
   * @returns Observable of the response
   */
  patch<T>(endpoint: string, body?: unknown): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;

    this.logger.debug(`PATCH ${url}`, { body });

    return this.http.patch<T>(url, body, this.getHeaders()).pipe(
      map((response) => this.handleResponse<T>(response)),
      catchError((error) => this.handleError(error, 'PATCH', url))
    );
  }

  /**
   * Performs a DELETE request
   * @param endpoint - API endpoint
   * @returns Observable of the response
   */
  delete<T>(endpoint: string): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;

    this.logger.debug(`DELETE ${url}`);

    return this.http.delete<T>(url, this.getHeaders()).pipe(
      map((response) => this.handleResponse<T>(response)),
      catchError((error) => this.handleError(error, 'DELETE', url))
    );
  }

  /**
   * Builds HTTP parameters from object
   * @param params - Parameters object
   * @returns HttpParams instance
   */
  private buildParams(params?: Record<string, string | number | boolean>): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        const value = params[key];
        if (value !== null && value !== undefined) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return httpParams;
  }

  /**
   * Gets default HTTP headers
   * @returns HttpHeaders instance
   */
  private getHeaders(): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }),
    };
  }

  /**
   * Handles successful response
   * @param response - HTTP response
   * @returns Processed response
   */
  private handleResponse<T>(response: unknown): T {
    return response as T;
  }

  /**
   * Handles HTTP errors
   * @param error - Error object
   * @param method - HTTP method
   * @param url - Request URL
   * @returns Error observable
   */
  private handleError(error: unknown, method: string, url: string): Observable<never> {
    this.logger.error(`API Error [${method} ${url}]`, error);
    return throwError(() => error);
  }
}

