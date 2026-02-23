import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Action, Resource, Role } from '../../Enums';
import { PERMISSION_KEY } from '../../Decorators';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly _reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions =
      this._reflector.getAllAndOverride<
        { resource: Resource; actions: Action[] }[]
      >(PERMISSION_KEY, [context.getHandler(), context.getClass()]) ?? [];

    if (requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException(
        'User not authenticated - PermissionGuard failed to find user on request',
      );
    }

    if (user.role === Role.ADMIN) {
      return true;
    }

    const userPermissions = user.permissions ?? [];

    const hasPermission = requiredPermissions.every((required) =>
      userPermissions.some(
        (userPerm) =>
          userPerm.resource === required.resource &&
          required.actions.every((action) => userPerm.actions.includes(action)),
      ),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
