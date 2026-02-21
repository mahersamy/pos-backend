import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard, AuthorizationGuard, PermissionGuard } from '../Guards';
import { Role, tokenTypeEnum } from '../Enums';
import { Token } from './token.decorator';
import { Roles } from './roles.decorator';

export const AuthApply = ({
  tokenType = tokenTypeEnum.Access,
  roles = [],
}: {
  tokenType?: tokenTypeEnum;
  roles?: Role[];
}) => {
  return applyDecorators(
    UseGuards(AuthGuard, AuthorizationGuard,PermissionGuard),
    Token(tokenType),
    Roles(roles),
    
  );
};
