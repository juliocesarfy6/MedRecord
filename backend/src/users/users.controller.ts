import { Body, Controller, Get, Param, Patch, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll(@Query('role') role?: UserRole) {
    return this.usersService.findAll(role);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/role/:role')
  @Roles(UserRole.ADMIN)
  changeRole(@Param('id') id: string, @Param('role') role: UserRole) {
    return this.usersService.changeRole(id, role);
  }

  @Patch(':id/toggle-status')
  @Roles(UserRole.ADMIN)
  toggleStatus(@Param('id') id: string) {
    return this.usersService.toggleStatus(id);
  }

  @Patch(':id/approve')
  @Roles(UserRole.ADMIN)
  approve(@Param('id') id: string, @Body('notasValidacion') notasValidacion?: string) {
    return this.usersService.approveDoctor(id, notasValidacion);
  }

  @Patch(':id/reject')
  @Roles(UserRole.ADMIN)
  reject(@Param('id') id: string, @Body('motivoRechazo') motivoRechazo?: string) {
    return this.usersService.rejectDoctor(id, motivoRechazo);
  }

  @Get(':id/doctor-document')
  @Roles(UserRole.ADMIN)
  async getDoctorDocument(@Param('id') id: string, @Res() res: Response) {
    const document = await this.usersService.getDoctorDocument(id);
    res.type(document.mime);
    res.download(document.path, document.originalName);
  }
}
