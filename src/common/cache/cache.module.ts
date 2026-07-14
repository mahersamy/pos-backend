import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import KeyvRedis, { Keyv } from '@keyv/redis';
import { CacheHelperService } from './cache.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        stores: [
          new Keyv({
            store: new KeyvRedis({
              username: config.get<string>('REDIS_USERNAME'),
              password: config.get<string>('REDIS_PASSWORD'),
              socket: {
                host: config.get<string>('REDIS_HOST'),
                port: config.get<number>('REDIS_PORT'),
              },
            }),
          }),
        ],
      }),
    }),
  ],
  exports: [CacheHelperService],
  providers: [CacheHelperService],
})
export class AppCacheModule { }
