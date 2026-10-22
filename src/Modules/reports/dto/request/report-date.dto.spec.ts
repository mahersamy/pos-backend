import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ReportDateDto } from './report-date.dto';

describe('ReportDateDto', () => {
  it('should pass validation when valid YYYY-MM-DD dates are provided', async () => {
    const dto = plainToInstance(ReportDateDto, {
      startDate: '2026-10-01',
      endDate: '2026-10-20',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation when optional dates are omitted', async () => {
    const dto1 = plainToInstance(ReportDateDto, {});
    const errors1 = await validate(dto1);
    expect(errors1.length).toBe(0);

    const dto2 = plainToInstance(ReportDateDto, { startDate: '2026-10-01' });
    const errors2 = await validate(dto2);
    expect(errors2.length).toBe(0);

    const dto3 = plainToInstance(ReportDateDto, { endDate: '2026-10-20' });
    const errors3 = await validate(dto3);
    expect(errors3.length).toBe(0);
  });

  it('should reject date-time strings', async () => {
    const dto = plainToInstance(ReportDateDto, {
      startDate: '2026-10-01T10:00:00',
      endDate: '2026-10-20T10:00:00Z',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(2);
    expect(errors.some((e) => e.property === 'startDate')).toBe(true);
    expect(errors.some((e) => e.property === 'endDate')).toBe(true);
  });

  it('should reject invalid date format such as DD-MM-YYYY', async () => {
    const dto = plainToInstance(ReportDateDto, {
      startDate: '01-10-2026',
      endDate: '20-10-2026',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(2);
  });

  it('should reject invalid calendar dates such as 2026-02-30', async () => {
    const dto = plainToInstance(ReportDateDto, {
      startDate: '2026-02-30',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('startDate');
    expect(errors[0].constraints?.isDateString).toBeDefined();
  });
});
