/**
 * Common interfaces used across the application
 */

import { Status } from './types';
import { UserRole } from './enums';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: Status;
}

export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
}

