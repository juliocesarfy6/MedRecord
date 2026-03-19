import { Controller, Get, Param, Put, Body, UseGuards, Request } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  findAll() {
    return this.patientsService.findAll();
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
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Put('me')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PATIENT)
  updateMyProfile(@Request() req: any, @Body() data: any) {
    return this.patientsService.updateByUserId(req.user.id, data);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() data: any) {
    return this.patientsService.update(id, data);
  }
}
