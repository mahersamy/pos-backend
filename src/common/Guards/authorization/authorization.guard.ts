import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Role } from '../../Enums';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private readonly _reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const accessRoles =
      this._reflector.getAllAndOverride<Role[]>('roles', [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    let role: Role = Role.USER;

    switch (context.getType()) {
      case 'http':
        const httpCtx = context.switchToHttp();
        const request = httpCtx.getRequest();
        role = request.user?.role;
        break;
    }
    if (accessRoles.length > 0) {
      // console.log(accessRoles.includes(role));
      if (!role || !accessRoles.includes(role)) return false;
    }
    return true;
  }
}
