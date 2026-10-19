import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheHelperService {
  private readonly logger = new Logger(CacheHelperService.name);

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) { }

  async cacheOrSet<T>(
    key: string,
    cb: () => Promise<T>,
    ttl = 60_000,
  ): Promise<T> {
    const cached = await this.cacheManager.get<T>(key);

    if (cached !== undefined) {
      this.logger.debug(`CACHE HIT: ${key}`);
      return cached;
    }

    this.logger.debug(`CACHE MISS → FETCHING: ${key}`);
    const freshData = await cb();
    await this.cacheManager.set(key, freshData, ttl);
    return freshData;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
    } catch (err: any) {
      this.logger.error(`Failed to set cache key "${key}": ${err?.message || err}`);
    }
  }

  async get<T>(key: string): Promise<T | undefined> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (err: any) {
      this.logger.error(`Failed to get cache key "${key}": ${err?.message || err}`);
      return undefined;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (err: any) {
      this.logger.error(`Failed to delete cache key "${key}": ${err?.message || err}`);
    }
  }

  async blacklistToken(token: string, ttlMs: number): Promise<void> {
    await this.set(`blacklist:${token}`, true, ttlMs);
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const res = await this.get(`blacklist:${token}`);
    return Boolean(res);
  }

  /**
   * Runs fn() and returns fallback on failure instead of throwing.
   * Logs the swallowed error so failures are visible in monitoring
   * rather than silently looking like "genuinely zero/empty" data.
   */
  async safeMetric<T>(
    fn: () => Promise<T>,
    fallback: T,
    context?: string,
  ): Promise<T> {
    try {
      return await fn();
    } catch (err) {
      this.logger.error(
        `safeMetric failed${context ? ` [${context}]` : ''}: ${err instanceof Error ? err.message : err}`,
        err instanceof Error ? err.stack : undefined,
      );
      return fallback;
    }
  }
}