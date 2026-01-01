import { NgModule } from '@angular/core';
import { LoggerService } from './logger.service';

/**
 * Logger Module
 * Provides logging functionality across the application
 */
@NgModule({
  providers: [LoggerService],
})
export class LoggerModule {}

