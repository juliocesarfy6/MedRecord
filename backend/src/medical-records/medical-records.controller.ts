import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
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
}