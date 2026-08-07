import { Controller, Get, Param, Query } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from "@nestjs/swagger";
import { AuditLogService } from "./audit-log.service";
import { GetAllAuditLogDto } from "./dto/request/get-all-audit-log.dto";
import { AuditLogResponseDto, PaginatedAuditLogResponseDto } from "./dto/response/audit-log-response.dto";
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
@ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing JWT token' })
@ApiForbiddenResponse({ description: 'Forbidden - Insufficient permissions' })
@AuthApply({ roles: [Role.ADMIN, Role.MANAGER] })
@Controller("audit-logs")
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @CheckPermissions({ resource: Resource.AUDIT_LOG, actions: [Action.READ] })
  @Get()
  @ApiOperation({ summary: 'Get all audit logs', description: 'Retrieves all system audit logs with pagination and filters.' })
  @ApiOkResponse({ type: PaginatedAuditLogResponseDto, description: 'List of audit logs retrieved successfully' })
  findAll(@Query() query: GetAllAuditLogDto) {
    return this.auditLogService.findAll(query);
  }

  @CheckPermissions({ resource: Resource.AUDIT_LOG, actions: [Action.READ] })
  @Get("entity/:entity/:entityId")
  @ApiOperation({ summary: 'Get history of an entity', description: 'Retrieves change history logs for a specific database entity by name and ID.' })
  @ApiOkResponse({ type: PaginatedAuditLogResponseDto, description: 'Entity history logs retrieved successfully' })
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
  @ApiOperation({ summary: 'Get single audit log details', description: 'Retrieves detailed data of a single audit log entry by ID.' })
  @ApiOkResponse({ type: AuditLogResponseDto, description: 'Audit log details' })
  @ApiNotFoundResponse({ description: 'Audit log entry not found' })
  findOne(@Param() { id }: ParamIdDto) {
    return this.auditLogService.findOne(id);
  }
}
