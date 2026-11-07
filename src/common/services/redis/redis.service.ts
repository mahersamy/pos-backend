import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/** Raw ioredis client for operations cache-manager can't express (e.g. SET NX). */
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  readonly client: Redis;

  constructor(config: ConfigService) {
    this.client = new Redis({
      host: config.get<string>('REDIS_HOST'),
      port: config.get<number>('REDIS_PORT'),
      username: config.get<string>('REDIS_USERNAME'),
      password: config.get<string>('REDIS_PASSWORD'),
      connectTimeout: 5000,
      maxRetriesPerRequest: 1, // fail fast instead of hanging the request
    });
    this.client.on('error', (err) =>
      this.logger.error(`Redis connection error: ${err.message}`),
    );
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}

