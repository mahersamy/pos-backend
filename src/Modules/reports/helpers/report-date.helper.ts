import { BadRequestException, Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { TrendGroupByType } from '../enums';
import { IDateRangeResult, ITrendBucket } from '../interfaces';

@Injectable()
export class ReportDateHelper {
  private readonly timezone = 'Africa/Cairo';
  private readonly maxDays = 366;
  private readonly defaultDays = 30;

  validateAndParseRange(
    startDateInput?: string,
    endDateInput?: string,
  ): IDateRangeResult {
    const today = DateTime.now()
      .setZone(this.timezone)
      .startOf('day');

    const end = endDateInput
      ? DateTime.fromISO(endDateInput, { zone: this.timezone })
      : today;

    if (!end.isValid || (endDateInput && end.toISODate() !== endDateInput)) {
      throw new BadRequestException('Invalid endDate.');
    }

    const start = startDateInput
      ? DateTime.fromISO(startDateInput, { zone: this.timezone })
      : end.minus({ days: this.defaultDays - 1 });

    if (!start.isValid || (startDateInput && start.toISODate() !== startDateInput)) {
      throw new BadRequestException('Invalid startDate.');
    }

    const startOfDay = start.startOf('day');
    const endOfDay = end.startOf('day');

    if (startOfDay.toMillis() > endOfDay.toMillis()) {
      throw new BadRequestException(
        'startDate cannot be after endDate.',
      );
    }

    // Inclusive calendar-day count: 1 Oct through 20 Oct = 20 days.
    const daysDifference =
      Math.round(endOfDay.diff(startOfDay, 'days').days) + 1;

    if (daysDifference > this.maxDays) {
      throw new BadRequestException(
        `Date range cannot exceed ${this.maxDays} days.`,
      );
    }

    const endExclusive = endOfDay.plus({ days: 1 }).startOf('day');

    return {
      start: startOfDay.toJSDate(),
      endExclusive: endExclusive.toJSDate(),
      startDateStr: startOfDay.toISODate()!,
      endDateStr: endOfDay.toISODate()!,
      timezone: this.timezone,
      daysDifference,
    };
  }

  /**
   * Formats a given UTC Date into the period bucket label according to timezone and granularity.
   */
  formatPeriodLabel(
    date: Date | string,
    groupBy: TrendGroupByType,
    timeZone: string = this.timezone,
  ): string {
    const dt =
      typeof date === 'string'
        ? DateTime.fromISO(date, { zone: timeZone })
        : DateTime.fromJSDate(date, { zone: timeZone });

    switch (groupBy) {
      case 'day':
        return dt.toFormat('yyyy-MM-dd');
      case 'week': {
        const week = String(dt.weekNumber).padStart(2, '0');
        return `${dt.weekYear}-W${week}`;
      }
      case 'month':
        return dt.toFormat('yyyy-MM');
      default:
        return dt.toFormat('yyyy-MM-dd');
    }
  }

  /**
   * Generates a complete sequence of period intervals for trend zero-filling.
   */
  generateBuckets(
    start: Date,
    endExclusive: Date,
    groupBy: TrendGroupByType,
    timeZone: string = this.timezone,
  ): ITrendBucket[] {
    const buckets: ITrendBucket[] = [];
    let current = DateTime.fromJSDate(start, { zone: timeZone });
    const end = DateTime.fromJSDate(endExclusive, { zone: timeZone });

    while (current < end) {
      const periodStart = current.toJSDate().toISOString();
      const periodLabel = this.formatPeriodLabel(current.toJSDate(), groupBy, timeZone);

      buckets.push({ periodStart, periodLabel });

      switch (groupBy) {
        case 'day':
          current = current.plus({ days: 1 });
          break;
        case 'week':
          current = current.plus({ weeks: 1 });
          break;
        case 'month':
          current = current.plus({ months: 1 }).startOf('month');
          break;
        default:
          current = current.plus({ days: 1 });
          break;
      }
    }

    return buckets;
  }
}
