import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuditClient {
  private readonly logger = new Logger(AuditClient.name);
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    configService: ConfigService,
  ) {
    this.baseUrl =
      configService.get<string>('authService.baseUrl') ?? 'http://localhost:3004';
  }

  async log(params: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.baseUrl}/internal/audit-logs`, params),
      );
    } catch (error) {
      this.logger.warn(`Audit log failed: ${String(error)}`);
    }
  }
}
