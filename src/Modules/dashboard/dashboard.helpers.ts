import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class DashboardHelpers {

  buildNonCancelledDateMatch(start: Date, end: Date) {
    return {
      createdAt: { $gte: start, $lte: end },
      status: { $ne: 'cancelled' },
    };
  }
}
