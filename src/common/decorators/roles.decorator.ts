import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../constants';

// Key to store required roles
export const ROLES_KEY = 'roles';

// @Roles() decorator
// Use to restrict route to specific roles
export const Roles = (...roles: UserRole[]) =>
  SetMetadata(ROLES_KEY, roles);