import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.auditService.findAll();
  }

  @Get('me')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PATIENT)
  myLogs(@Request() req: any) {
    return this.auditService.findByUser(req.user.id);
  }

  @Get('patient/:patientId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PATIENT)
  byPatient(@Param('patientId') patientId: string) {
    return this.auditService.findByPatient(patientId);
  }
}
