import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { SignatureLevelEnum } from '../../Enums/signature.enum';
import { tokenTypeEnum } from '../../Enums/tokeType.enum';
import { UserRepository } from '../../../DB/Repository/user.repository';

export interface JwtPayload {
  _id: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly _jwtService: JwtService,
    private readonly userRepo: UserRepository,
  ) {}

  async generateToken(payload: object, options: JwtSignOptions) {
    return this._jwtService.sign(payload, options);
  }
  async verifyToken(token: string, options: JwtVerifyOptions) {
    return this._jwtService.verify(token, options);
  }

  async decodeToken({
    authorization,
    tokentype = tokenTypeEnum.Access,
  }: {
    authorization: string;
    tokentype?: tokenTypeEnum;
  }) {
    const [signature, token] = authorization.split(' ');
    if (!signature || !token) {
      throw new UnauthorizedException('missing authorization');
    }
    const signatures = await this.getSignatureLevel(
      signature as SignatureLevelEnum,
    );
    let decoded: JwtPayload;
    try {
      decoded = await this.verifyToken(token, {
        secret:
          tokentype === tokenTypeEnum.Refresh
            ? signatures.secretRefreshKey
            : signatures.secretAccessKey,
      });
    } catch (error) {
      throw new BadRequestException('Invalid Token');
    }

    const user = await this.userRepo.findById(decoded._id);

    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    return { user, decoded };
  }

  async getSignatureLevel(
    SignatureLevel: SignatureLevelEnum = SignatureLevelEnum.Bearer,
  ) {
    let secretAccessKey = process.env.JWT_SECRET_BEARER_ACCESS;
    let AccessExpiresIn = process.env.JWT_ACCESS_BEARER_EXP;
    let secretRefreshKey = process.env.JWT_SECRET_BEARER_REFRESH;
    let RefreshExpiresIn = process.env.JWT_REFRESH_BEARER_EXP;
    switch (SignatureLevel) {
      case SignatureLevelEnum.System:
        secretAccessKey = process.env.JWT_SECRET_SYSTEM_ACCESS;
        AccessExpiresIn = process.env.JWT_ACCESS_SYSTEM_EXP;
        secretRefreshKey = process.env.JWT_SECRET_SYSTEM_REFRESH;
        RefreshExpiresIn = process.env.JWT_REFRESH_SYSTEM_EXP;
        break;
    }
    return {
      secretAccessKey,
      AccessExpiresIn: Number(AccessExpiresIn),
      secretRefreshKey,
      RefreshExpiresIn: Number(RefreshExpiresIn),
    };
  }
}
