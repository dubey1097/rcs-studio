import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AppState } from './store';
import { LoggerService } from '@gogl-rcs/shared/logger';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = environment.appName;

  constructor(private logger: LoggerService) {}

  ngOnInit(): void {
    this.logger.info('Application initialized', { environment: environment.production ? 'production' : 'development' });
  }
}

