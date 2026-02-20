import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Injectable,
} from '@nestjs/common';
import { TokenService } from '../services';
import { Reflector } from '@nestjs/core';
import { tokenTypeEnum } from '../Enums/tokeType.enum';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly _tokenService: TokenService,
    private readonly _reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const tokenType =
      this._reflector.getAllAndOverride<tokenTypeEnum>('tokenType', [
        context.getHandler(),
        context.getClass(),
      ]) ?? tokenTypeEnum.Access;

    let request;
    let authorization;
    switch (context.getType()) {
      case 'http':
        const httpCtx = context.switchToHttp();
        request = httpCtx.getRequest();
        authorization = request.headers.authorization;
        break;
      // case "ws":
      //     const wsCtx=context.switchToWs();
      //     break;
      default:
        break;
    }
    if (!authorization) {
      throw new UnauthorizedException('missing authorization');
    }
    const { user, decoded } = await this._tokenService.decodeToken({
      authorization,
      tokentype: tokenType,
    });
    request.user = user;
    request.decoded = decoded;
    return true;
  }
}
