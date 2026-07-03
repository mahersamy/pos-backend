import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class DashboardHelpers {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async cacheOrSet<T>(
    key: string,
    cb: () => Promise<T>,
    ttl = 60_000,
  ): Promise<T> {
    const cached = await this.cacheManager.get<T>(key);

    if (cached !== undefined) {
      console.log('CACHE HIT:', key);
      return cached;
    }

    console.log('CACHE MISS → FETCHING:', key);
    const freshData = await cb();
    await this.cacheManager.set(key, freshData, ttl);
    return freshData;
  }

  
  async safeMetric<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
    try {
      return await fn();
    } catch {
      return fallback;
    }
  }


  buildNonCancelledDateMatch(start: Date, end: Date) {
    return {
      createdAt: { $gte: start, $lte: end },
      status: { $ne: 'cancelled' },
    };
  }
}
