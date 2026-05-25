import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../entities/user.entity';
import { CreateLinkRequestDto } from './dto/create-link-request.dto';
import { RespondLinkRequestDto } from './dto/respond-link-request.dto';
import { PatientDoctorLinksService } from './patient-doctor-links.service';

type AuthRequest = { user: { id: number } };

@Controller('patient-doctor-links')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientDoctorLinksController {
  constructor(private readonly linksService: PatientDoctorLinksService) {}

  @Get('directory')
  @Roles(UserRole.PATIENT)
  directory(@Req() req: AuthRequest, @Query('search') search?: string) {
    return this.linksService.searchDoctorsForPatient(req.user.id, search);
  }

  @Get('my-doctors')
  @Roles(UserRole.PATIENT)
  myDoctors(@Req() req: AuthRequest) {
    return this.linksService.findAcceptedDoctorsForPatient(req.user.id);
  }

  @Post('request')
  @Roles(UserRole.PATIENT)
  requestLink(@Req() req: AuthRequest, @Body() dto: CreateLinkRequestDto) {
    return this.linksService.requestLink(req.user.id, dto);
  }

  @Get('doctor/requests')
  @Roles(UserRole.DOCTOR)
  doctorRequests(@Req() req: AuthRequest) {
    return this.linksService.findRequestsForDoctor(req.user.id);
  }

  @Patch(':id/accept')
  @Roles(UserRole.DOCTOR)
  accept(@Req() req: AuthRequest, @Param('id', ParseIntPipe) id: number, @Body() dto: RespondLinkRequestDto) {
    return this.linksService.acceptRequest(req.user.id, id, dto);
  }

  @Patch(':id/reject')
  @Roles(UserRole.DOCTOR)
  reject(@Req() req: AuthRequest, @Param('id', ParseIntPipe) id: number, @Body() dto: RespondLinkRequestDto) {
    return this.linksService.rejectRequest(req.user.id, id, dto);
  }
}
