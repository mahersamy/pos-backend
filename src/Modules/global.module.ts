import { Global, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '../common';
import { UserModule } from './feature.modules';
@Global()
@Module({
  imports: [
    UserModule
  ],
  providers: [TokenService, JwtService],
  exports: [TokenService, JwtService],
})
export class GlobalModule {}
