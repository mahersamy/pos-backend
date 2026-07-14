import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "../../../common/database/base.repository";
import { AuditLog, AuditLogDocument } from "../model/audit-log.model";
import { AUDIT_LOG_SELECT, AUDIT_LOG_POPULATE } from "../constants/audit-log.constants";

@Injectable()
export class AuditLogRepository extends BaseRepository<AuditLogDocument> {
  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLogDocument>,
  ) {
    super(auditLogModel);
  }

  async createAndReturn(
    data: Partial<AuditLogDocument>,
  ): Promise<AuditLogDocument> {
    const created = await this.auditLogModel.create(data);
    return this.auditLogModel
      .findById(created._id)
      .select(AUDIT_LOG_SELECT)
      .populate(AUDIT_LOG_POPULATE)
      .lean() as Promise<AuditLogDocument>;
  }
}
