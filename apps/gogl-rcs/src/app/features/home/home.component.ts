import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { AppState } from '../../store';
import * as fromApp from '../../store/reducers/app.reducer';
import * as AuthActions from '../../store/actions/auth.actions';
import { AuthService } from '../../core/services/auth.service';

/**
 * Home Component
 * Demonstrates UI components and application features
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  appState$: Observable<fromApp.State>;
  showModal = false;
  formGroup: FormGroup;

  user$: Observable<unknown | null>;

  constructor(
    private store: Store<AppState>,
    private authService: AuthService
  ) {
    this.appState$ = this.store.select((state) => state.app);
    this.user$ = this.store.select((state) => state.auth.user);
    this.formGroup = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      name: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    // Component initialization
  }

  /**
   * Opens the demo modal
   */
  openModal(): void {
    this.showModal = true;
  }

  /**
   * Closes the demo modal
   */
  closeModal(): void {
    this.showModal = false;
  }

  /**
   * Handles form submission
   */
  onSubmit(): void {
    if (this.formGroup.valid) {
      console.log('Form submitted:', this.formGroup.value);
      // Handle form submission
    }
  }

  /**
   * Handles logout
   */
  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  /**
   * Gets user display name
   * @param user - User object
   * @returns Display name
   */
  getUserDisplayName(user: unknown): string {
    if (!user) {
      return '';
    }
    const userObj = user as { name?: string; email?: string };
    return userObj.name || userObj.email || 'User';
  }
}

