import { Body, Controller, Get, Param, ParseIntPipe, Put, Query, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../entities/user.entity';
import { AppointmentsService } from './appointments.service';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

type AuthRequest = { user: { id: number } };

@Controller('availability')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AvailabilityController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get('doctors')
  @Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN)
  getDoctors() {
    return this.appointmentsService.findAvailableDoctors();
  }

  @Get('doctor/:doctorId/slots')
  @Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN)
  getDoctorSlots(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Query('date') date: string,
  ) {
    return this.appointmentsService.findDoctorSlots(doctorId, date);
  }

  @Get('me')
  @Roles(UserRole.DOCTOR)
  getMyAvailability(@Req() req: AuthRequest) {
    return this.appointmentsService.findMyAvailability(req.user.id);
  }

  @Put('me')
  @Roles(UserRole.DOCTOR)
  updateMyAvailability(@Req() req: AuthRequest, @Body() dto: UpdateAvailabilityDto) {
    return this.appointmentsService.updateMyAvailability(req.user.id, dto);
  }
}
