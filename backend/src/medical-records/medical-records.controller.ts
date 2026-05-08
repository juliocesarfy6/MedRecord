import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('medical-records')
@UseGuards(JwtAuthGuard) // 🔒 Todo requiere token
export class MedicalRecordsController {
  constructor(private readonly recordsService: MedicalRecordsService) { }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCTOR) // 🔒 SOLO un médico validado entra aquí
  create(@Request() req: any, @Body() createDto: CreateMedicalRecordDto) {
    // Llamamos exactamente al método que construimos en el servicio
    return this.recordsService.createRecord(req.user.id, createDto);
  }

  @Get('me')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PATIENT)
  getMyRecords(@Request() req: any) {
    return this.recordsService.getMyRecords(req.user.id);
  }

  @Get('patient/:patientId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCTOR)
  findAllByPatient(@Request() req: any, @Param('patientId') patientId: string) {
    return this.recordsService.findByPatient(req.user.id, +patientId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCTOR)
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.recordsService.findOneForDoctor(req.user.id, +id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCTOR)
  update(@Request() req: any, @Param('id') id: string, @Body() updateDto: UpdateMedicalRecordDto) {
    return this.recordsService.updateRecord(req.user.id, +id, updateDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCTOR)
  remove(@Request() req: any, @Param('id') id: string) {
    return this.recordsService.deleteRecord(req.user.id, +id);
  }
}
