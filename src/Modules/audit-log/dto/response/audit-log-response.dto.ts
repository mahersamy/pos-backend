import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../../../common';
import { AuditAction } from '../../model/audit-log.model';

export class AuditLogResponseDto {
  @ApiProperty({ description: 'Audit Log ID', example: '60d21b4967d0d8992e610c85' })
  id: string;

  @ApiProperty({ description: 'Performed action', enum: AuditAction, example: AuditAction.CREATE })
  action: string;

  @ApiProperty({ description: 'Target entity/collection name', example: 'Staff' })
  entity: string;

  @ApiPropertyOptional({ description: 'Target entity record ID', example: '60d21b4967d0d8992e610c86' })
  entityId?: string;

  @ApiProperty({ description: 'User ID who performed the action', example: '60d21b4967d0d8992e610c87' })
  performedBy: string;

  @ApiPropertyOptional({ description: 'Old state of the record before change', example: { salary: 4000 } })
  oldValue?: any;

  @ApiPropertyOptional({ description: 'New state of the record after change', example: { salary: 5000 } })
  newValue?: any;

  @ApiPropertyOptional({ description: 'Client IP address', example: '127.0.0.1' })
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'Client User Agent header details', example: 'Mozilla/5.0...' })
  userAgent?: string;

  @ApiPropertyOptional({ description: 'Text explanation of the log action', example: 'Staff salary updated from 4000 to 5000' })
  description?: string;

  @ApiProperty({ description: 'Log entry creation timestamp' })
  createdAt: Date;
}

export class PaginatedAuditLogResponseDto extends PaginatedResponseDto<AuditLogResponseDto> {
  @ApiProperty({ type: [AuditLogResponseDto], description: 'List of audit logs' })
  data: AuditLogResponseDto[];
}
