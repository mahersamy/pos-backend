import { BadRequestException } from '@nestjs/common';
import { DateTime } from 'luxon';
import { ReportDateHelper } from './report-date.helper';

describe('ReportDateHelper', () => {
  let helper: ReportDateHelper;
  const timezone = 'Africa/Cairo';

  beforeEach(() => {
    helper = new ReportDateHelper();
  });

  it('should accept valid YYYY-MM-DD date range and calculate inclusive calendar days', () => {
    const res = helper.validateAndParseRange('2026-10-01', '2026-10-20');

    expect(res.startDateStr).toBe('2026-10-01');
    expect(res.endDateStr).toBe('2026-10-20');
    expect(res.timezone).toBe(timezone);
    expect(res.daysDifference).toBe(20);
    expect(res.start.getTime()).toBeLessThan(res.endExclusive.getTime());
  });

  it('should default missing endDate to today in Cairo', () => {
    const today = DateTime.now().setZone(timezone).startOf('day');
    const res = helper.validateAndParseRange('2026-10-01');

    expect(res.startDateStr).toBe('2026-10-01');
    expect(res.endDateStr).toBe(today.toISODate());
    const expectedDays = Math.round(today.diff(DateTime.fromISO('2026-10-01', { zone: timezone }).startOf('day'), 'days').days) + 1;
    expect(res.daysDifference).toBe(expectedDays);
  });

  it('should default missing startDate to 30 inclusive calendar days ending at endDate', () => {
    const res = helper.validateAndParseRange(undefined, '2026-10-20');

    expect(res.endDateStr).toBe('2026-10-20');
    expect(res.startDateStr).toBe('2026-09-21');
    expect(res.daysDifference).toBe(30);
  });

  it('should default both dates to 30 inclusive calendar days ending today in Cairo', () => {
    const today = DateTime.now().setZone(timezone).startOf('day');
    const res = helper.validateAndParseRange();

    expect(res.endDateStr).toBe(today.toISODate());
    expect(res.startDateStr).toBe(today.minus({ days: 29 }).toISODate());
    expect(res.daysDifference).toBe(30);
  });

  it('should return daysDifference === 1 for a single-day range', () => {
    const res = helper.validateAndParseRange('2026-10-20', '2026-10-20');

    expect(res.daysDifference).toBe(1);
    expect(res.startDateStr).toBe('2026-10-20');
    expect(res.endDateStr).toBe('2026-10-20');
  });

  it('should ensure endExclusive equals midnight of the next calendar day in Cairo', () => {
    const res = helper.validateAndParseRange('2026-10-01', '2026-10-20');

    const expectedEndExclusive = DateTime.fromISO('2026-10-21', { zone: timezone })
      .startOf('day')
      .toJSDate();

    expect(res.endExclusive.getTime()).toBe(expectedEndExclusive.getTime());
  });

  it('should accept a range of 366 days (inclusive)', () => {
    // 2024 is a leap year (366 days)
    const res = helper.validateAndParseRange('2024-01-01', '2024-12-31');

    expect(res.daysDifference).toBe(366);
  });

  it('should throw BadRequestException when range exceeds 366 days', () => {
    expect(() => {
      helper.validateAndParseRange('2024-01-01', '2025-01-01');
    }).toThrow(new BadRequestException('Date range cannot exceed 366 days.'));
  });

  it('should throw BadRequestException when startDate > endDate', () => {
    expect(() => {
      helper.validateAndParseRange('2026-10-20', '2026-10-10');
    }).toThrow(new BadRequestException('startDate cannot be after endDate.'));
  });

  it('should throw BadRequestException for invalid calendar dates', () => {
    expect(() => {
      helper.validateAndParseRange('2026-02-31', '2026-03-10');
    }).toThrow(new BadRequestException('Invalid startDate.'));

    expect(() => {
      helper.validateAndParseRange('2026-10-01', '2026-02-30');
    }).toThrow(new BadRequestException('Invalid endDate.'));
  });

  it('should throw BadRequestException for invalid date strings', () => {
    expect(() => {
      helper.validateAndParseRange('not-a-date', '2026-10-10');
    }).toThrow(new BadRequestException('Invalid startDate.'));

    expect(() => {
      helper.validateAndParseRange('2026-10-01', 'not-a-date');
    }).toThrow(new BadRequestException('Invalid endDate.'));
  });

  it('should reject date-time strings passed directly to helper', () => {
    expect(() => {
      helper.validateAndParseRange('2026-10-01T10:30:00Z', '2026-10-20');
    }).toThrow(new BadRequestException('Invalid startDate.'));

    expect(() => {
      helper.validateAndParseRange('2026-10-01', '2026-10-20T23:59:59Z');
    }).toThrow(new BadRequestException('Invalid endDate.'));
  });

  it('should generate trend buckets and format labels for day granularity', () => {
    const res = helper.validateAndParseRange('2026-10-01', '2026-10-03');
    const buckets = helper.generateBuckets(res.start, res.endExclusive, 'day');

    expect(buckets.length).toBe(3);
    expect(buckets[0].periodLabel).toBe('2026-10-01');
    expect(buckets[1].periodLabel).toBe('2026-10-02');
    expect(buckets[2].periodLabel).toBe('2026-10-03');
  });

  it('should generate trend buckets and format labels for week granularity', () => {
    const res = helper.validateAndParseRange('2026-10-05', '2026-10-18');
    const buckets = helper.generateBuckets(res.start, res.endExclusive, 'week');

    expect(buckets.length).toBe(2);
    expect(buckets[0].periodLabel).toMatch(/^\d{4}-W\d{2}$/);
    expect(buckets[1].periodLabel).toMatch(/^\d{4}-W\d{2}$/);
  });

  it('should generate trend buckets and format labels for month granularity', () => {
    const res = helper.validateAndParseRange('2026-01-01', '2026-03-31');
    const buckets = helper.generateBuckets(res.start, res.endExclusive, 'month');

    expect(buckets.length).toBe(3);
    expect(buckets[0].periodLabel).toBe('2026-01');
    expect(buckets[1].periodLabel).toBe('2026-02');
    expect(buckets[2].periodLabel).toBe('2026-03');
  });
});
