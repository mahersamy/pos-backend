import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "./base.repository";
import { AuditLog, AuditLogDocument } from "../Models/aduit-loggs.model";

export const AUDIT_LOG_SELECT =
  "action entity entityId performedBy oldValue newValue ipAddress userAgent description createdAt";

export const AUDIT_LOG_POPULATE = [
  { path: 'performedBy', select: 'firstName lastName email profilePicture role' },
];

export const AUDIT_LOG_QUERY_OPTIONS = {
  select: AUDIT_LOG_SELECT,
  populate: AUDIT_LOG_POPULATE,
};

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
