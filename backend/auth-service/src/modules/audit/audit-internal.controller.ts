import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service';

@ApiTags('Internal')
@Controller('internal/audit-logs')
export class AuditInternalController {
  constructor(private readonly auditService: AuditService) {}

  @Post()
  create(
    @Body()
    body: {
      userId?: string;
      action: string;
      entity: string;
      entityId?: string;
      metadata?: Record<string, unknown>;
      ip?: string;
    },
  ) {
    return this.auditService.log(body);
  }
}
