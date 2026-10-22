export interface IDateRangeResult {
  start: Date;
  endExclusive: Date;
  startDateStr: string;
  endDateStr: string;
  timezone: string;
  daysDifference: number;
}

export interface ITrendBucket {
  periodStart: string;
  periodLabel: string;
}
