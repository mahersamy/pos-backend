import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuditLogRepository } from "../../DB/Repository/audit-log.repository";
import { AuditLog, AuditLogSchema } from "../../DB/Models/aduit-loggs.model";
import { AuditLogService } from "./audit-log.service";
import { AuditLogController } from "./audit-log.controller";
import { AuditLogEvent } from "./event/audit-log.event";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [AuditLogController],
  providers: [AuditLogService, AuditLogRepository, AuditLogEvent],
  exports: [AuditLogService, AuditLogRepository],
})
export class AuditLogModule {}
