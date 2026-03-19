import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('medical-records')
@UseGuards(JwtAuthGuard)
export class MedicalRecordsController {
  constructor(private readonly service: MedicalRecordsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCTOR)
  create(@Body() body: any, @Request() req: any) {
    return this.service.create({ ...body, doctorId: req.user.id });
  }

  @Get('me')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PATIENT)
  getMyRecords(@Request() req: any) {
    return this.service.findByUserId(req.user.id);
  }

  @Get('patient/:patientId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  findByPatient(@Param('patientId') patientId: string) {
    return this.service.findByPatient(patientId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
