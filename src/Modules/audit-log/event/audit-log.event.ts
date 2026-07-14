import { OnEvent } from '@nestjs/event-emitter'
import { Injectable } from "@nestjs/common";
import { AuditLogService } from "../audit-log.service";
import type { AuditLogDocument } from '../model/audit-log.model';

@Injectable()
export class AuditLogEvent {
    constructor(
        private readonly auditLogService: AuditLogService,
    ) { }

    @OnEvent("auditLog.created")
    async handleAuditLog(log: AuditLogDocument) {
        await this.auditLogService.createLog(log).catch((err) =>
            console.error(
                "Failed to create basic audit log",
                err,
            ),
        );
    }
}   