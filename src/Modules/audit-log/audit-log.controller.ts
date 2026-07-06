import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuditLogService } from "./audit-log.service";
import { GetAllAuditLogDto } from "./dto/get-all-audit-log.dto";
import {
  Action,
  Resource,
  Role,
  CheckPermissions,
  ParamIdDto,
} from "../../common";
import { AuthApply } from "../../common/Decorators/authApply.decorator";

@ApiTags('Audit Logs')
@ApiBearerAuth('access-token')
@AuthApply({ roles: [Role.ADMIN, Role.MANAGER] })
@Controller("audit-logs")
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @CheckPermissions({ resource: Resource.AUDIT_LOG, actions: [Action.READ] })
  @Get()
  findAll(@Query() query: GetAllAuditLogDto) {
    return this.auditLogService.findAll(query);
  }

  @CheckPermissions({ resource: Resource.AUDIT_LOG, actions: [Action.READ] })
  @Get("entity/:entity/:entityId")
  getEntityHistory(
    @Param("entity") entity: string,
    @Param("entityId") entityId: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    return this.auditLogService.getEntityHistory(
      entity,
      entityId,
      parsedPage,
      parsedLimit,
    );
  }

  @CheckPermissions({ resource: Resource.AUDIT_LOG, actions: [Action.READ] })
  @Get(":id")
  findOne(@Param() { id }: ParamIdDto) {
    return this.auditLogService.findOne(id);
  }
}
