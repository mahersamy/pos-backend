import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { AuditAction } from "../../Modules/audit-log/model/audit-log.model";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly eventEmitter: EventEmitter2) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, originalUrl, user, ip, headers } = request;

    // Only log modifying requests
    if (["POST", "PATCH", "PUT", "DELETE"].includes(method)) {
      return next.handle().pipe(
        tap((data) => {
          let action = AuditAction.UPDATE;
          if (method === "POST") action = AuditAction.CREATE;
          if (method === "DELETE") action = AuditAction.DELETE;

          // Robust entity detection:
          // filters out empty strings before grabbing the resource segment e.g., /api/v1/categories -> categories
          const entity = originalUrl.split("/").filter(Boolean)[2] || "unknown";

          // Opt out of interceptor logging for critical paths where service-level logging is used
          const manualLogEntities = [
            "refunds",
            "payments",
            "stock-updates",
            "notification"
          ];
          if (manualLogEntities.includes(entity)) {
            return; // Exit early, let the service handle the detailed audit log
          }

          // If there is no authenticated user (e.g. public routes like login/signup),
          // we cannot save an audit log that requires `performedBy`.
          const userId = user?._id || user?.id;
          if (!userId) {
            return; // Exit early
          }

          const entityId = data?._id || request.params?.id || null;

          void this.eventEmitter.emitAsync('auditLog.created', {
            action,
            entity,
            entityId,
            performedBy: userId,
            ipAddress: ip,
            userAgent: headers["user-agent"],
            description: `Successfully executed ${method} on ${originalUrl}`,
            newValue: method === "DELETE" ? null : data,
          })
        }),
      );
    }

    return next.handle();
  }
}
