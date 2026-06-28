import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditInternalController } from './audit-internal.controller';
import { AuditLogEntity } from './entities/audit-log.entity';
import { AuditService } from './audit.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLogEntity])],
  controllers: [AuditInternalController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
