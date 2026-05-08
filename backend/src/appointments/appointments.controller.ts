import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../entities/user.entity';
import { AppointmentsService } from './appointments.service';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';

type AuthRequest = { user: { id: number } };

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get('my')
  @Roles(UserRole.PATIENT)
  getMyAppointments(@Req() req: AuthRequest) {
    return this.appointmentsService.findMyAppointments(req.user.id);
  }

  @Post()
  @Roles(UserRole.PATIENT)
  create(@Req() req: AuthRequest, @Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(req.user.id, dto);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.PATIENT)
  cancel(@Req() req: AuthRequest, @Param('id', ParseIntPipe) id: number, @Body() dto: CancelAppointmentDto) {
    return this.appointmentsService.cancel(req.user.id, id, dto);
  }

  @Get('doctor/schedule')
  @Roles(UserRole.DOCTOR)
  getDoctorSchedule(@Req() req: AuthRequest, @Query('date') date?: string) {
    return this.appointmentsService.findDoctorSchedule(req.user.id, date);
  }

  @Patch(':id/confirm')
  @Roles(UserRole.DOCTOR)
  confirm(@Req() req: AuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.appointmentsService.confirm(req.user.id, id);
  }

  @Patch(':id/reschedule')
  @Roles(UserRole.DOCTOR)
  reschedule(@Req() req: AuthRequest, @Param('id', ParseIntPipe) id: number, @Body() dto: RescheduleAppointmentDto) {
    return this.appointmentsService.reschedule(req.user.id, id, dto);
  }

  @Patch(':id/complete')
  @Roles(UserRole.DOCTOR)
  complete(@Req() req: AuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.appointmentsService.complete(req.user.id, id);
  }

  @Get('admin')
  @Roles(UserRole.ADMIN)
  getAdminAppointments(@Query('estado') estado?: string) {
    return this.appointmentsService.findAllForAdmin(estado);
  }
}
