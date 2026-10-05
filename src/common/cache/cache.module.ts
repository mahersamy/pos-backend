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
      useFactory: async (config: ConfigService) => {
        const redis = new KeyvRedis({
          username: config.get<string>('REDIS_USERNAME'),
          password: config.get<string>('REDIS_PASSWORD'),

          socket: {
            host: config.get<string>('REDIS_HOST'),
            port: config.get<number>('REDIS_PORT'),
            connectTimeout: 20000,
          },
        });

        redis.client.on('error', (err) => {
          console.error('REDIS ERROR:', err);
        });

        redis.client.on('connect', () => {
          console.log('REDIS CONNECT');
        });

        redis.client.on('ready', () => {
          console.log('REDIS READY');
        });

        redis.client.on('reconnecting', () => {
          console.log('REDIS RECONNECTING');
        });

        // Force connection on startup so we can see the connection logs
        try {
          await redis.getClient();
        } catch (err) {
          // The error event listener will catch this
        }

        return {
          stores: [
            new Keyv({
              store: redis,
            }),
          ],
        };
      },
    }),
  ],
  exports: [CacheHelperService],
  providers: [CacheHelperService],
})
export class AppCacheModule { }