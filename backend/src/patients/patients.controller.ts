import { Controller, Get, Param, Put, Body, UseGuards, Request } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.patientsService.findAll();
  }

  @Get('authorized')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCTOR)
  findAuthorized(@Request() req: any) {
    return this.patientsService.findAuthorizedForDoctor(req.user.id);
  }

  @Get('me')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PATIENT)
  getMyProfile(@Request() req: any) {
    return this.patientsService.findByUserId(req.user.id);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.patientsService.findOneForUser(id, req.user);
  }

  @Put('me')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PATIENT)
  updateMyProfile(@Request() req: any, @Body() data: UpdatePatientDto) {
    return this.patientsService.updateByUserId(req.user.id, data);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() data: UpdatePatientDto) {
    return this.patientsService.update(id, data);
  }
}
