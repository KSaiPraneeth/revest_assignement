import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AuditClient } from './audit.client';

@Module({
  imports: [HttpModule.register({ timeout: 3000 })],
  providers: [AuditClient],
  exports: [AuditClient],
})
export class AuditClientModule {}
