import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, Matches } from 'class-validator';

export class ReportDateDto {
  @ApiPropertyOptional({
    description: 'Inclusive start date in ISO format (YYYY-MM-DD)',
    example: '2026-10-01',
  })
  @IsOptional()
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Inclusive end date in ISO format (YYYY-MM-DD)',
    example: '2026-10-20',
  })
  @IsOptional()
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  endDate?: string;
}
