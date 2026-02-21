import { SetMetadata } from '@nestjs/common';
import { Action, Resource } from '../Enums';

export interface RequiredPermission {
  resource: Resource;
  actions: Action[];
}

export const PERMISSION_KEY = 'permission';
export const CheckPermissions = (...permissions: RequiredPermission[]) =>
  SetMetadata(PERMISSION_KEY, permissions);
