import { Injectable, NotFoundException } from "@nestjs/common";
import { AuditLogRepository } from "./repository/audit-log.repository";
import { AUDIT_LOG_QUERY_OPTIONS } from "./constants/audit-log.constants";
import { AuditLogDocument } from "./model/audit-log.model";
import { GetAllAuditLogDto } from "./dto/request/get-all-audit-log.dto";

@Injectable()
export class AuditLogService {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  /**
   * Create a new audit log entry.
   * This is typically called programmatically by other services in the application.
   */
  async createLog(data: Partial<AuditLogDocument>): Promise<AuditLogDocument> {
    return this.auditLogRepository.createAndReturn(data);
  }

  /**
   * Retrieve all audit logs with optional filtering and pagination.
   */
  async findAll(query: GetAllAuditLogDto) {
    const {
      page,
      limit,
      sort,
      action,
      entity,
      performedBy,
      startDate,
      endDate,
      search,
    } = query;

    const filter: Record<string, any> = {};

    if (action) filter.action = action;
    if (entity) filter.entity = entity;
    if (performedBy) filter.performedBy = performedBy;

    if (search) {
      filter.$or = [
        { action: { $regex: search, $options: "i" } },
        { entity: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    return this.auditLogRepository.paginate(filter, {
      page,
      limit,
      sort: sort === "asc" ? { createdAt: 1 } : { createdAt: -1 },
      ...AUDIT_LOG_QUERY_OPTIONS,
    });
  }

  /**
   * Get a specific audit log by ID.
   */
  async findOne(id: string) {
    const auditLog = await this.auditLogRepository.findById(
      id,
      {},
      AUDIT_LOG_QUERY_OPTIONS,
    );
    if (!auditLog) throw new NotFoundException("Audit log not found");
    return auditLog;
  }

  /**
   * Retrieve the audit history for a specific entity.
   */
  async getEntityHistory(
    entity: string,
    entityId: string,
    page = 1,
    limit = 20,
  ) {
    return this.auditLogRepository.paginate(
      { entity, entityId },
      {
        page,
        limit,
        sort: { createdAt: -1 },
        ...AUDIT_LOG_QUERY_OPTIONS,
      },
    );
  }
}
