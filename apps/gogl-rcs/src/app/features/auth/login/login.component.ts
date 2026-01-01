import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AppState } from '../../../store';
import * as AuthActions from '../../../store/actions/auth.actions';
import { AuthService } from '../../../core/services/auth.service';
import { LoggerService } from '@gogl-rcs/shared/logger';
import { environment } from 'apps/gogl-rcs/src/environments/environment';

/**
 * Login Component
 * Handles Google OAuth authentication
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('googleSignInButton', { static: false }) googleSignInButton!: ElementRef<HTMLDivElement>;

  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  private destroy$ = new Subject<void>();
  appName = environment.appName;

  constructor(
    private store: Store<AppState>,
    private authService: AuthService,
    private logger: LoggerService
  ) {
    this.loading$ = this.store.select((state) => state.auth.loading);
    this.error$ = this.store.select((state) => state.auth.error);
  }

  ngOnInit(): void {
    // Subscribe to auth service to dispatch actions
    this.authService.token$.pipe(takeUntil(this.destroy$)).subscribe((token) => {
      if (token) {
        const user = this.authService.getUser();
        if (user) {
          this.store.dispatch(AuthActions.login({ token, user }));
        }
      }
    });

    // Check if already authenticated
    if (this.authService.isAuthenticated()) {
      const token = this.authService.getToken();
      const user = this.authService.getUser();
      if (token && user) {
        this.store.dispatch(AuthActions.login({ token, user }));
      }
    }
  }

  ngAfterViewInit(): void {
    // Render Google Sign-In button after view init
    setTimeout(() => {
      if (this.googleSignInButton?.nativeElement) {
        this.authService.renderSignInButton(this.googleSignInButton.nativeElement, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
        });
      }
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handles manual sign-in trigger
   */
  onSignIn(): void {
    this.authService.signIn();
  }
}

