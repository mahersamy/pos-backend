import { SetMetadata } from '@nestjs/common';
import { tokenTypeEnum } from '../Enums/tokeType.enum';

const TokenKey = 'tokenType';
export const Token = (tokenType: tokenTypeEnum) =>
  SetMetadata(TokenKey, tokenType);
