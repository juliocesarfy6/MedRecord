import { Body, Controller, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';

@Controller('doctors')
@UseGuards(JwtAuthGuard)
export class DoctorsController {
    constructor(private readonly doctorsService: DoctorsService) { }

    @Post()
    async createProfile(@Body() body: any, @Request() req: any) {
        return this.doctorsService.createProfile(req.user.id, body);
    }

    @Get('me')
    @UseGuards(RolesGuard)
    @Roles(UserRole.DOCTOR)
    async getMyProfile(@Request() req: any) {
        return this.doctorsService.getMyProfile(req.user.id);
    }

    @Put('me')
    @UseGuards(RolesGuard)
    @Roles(UserRole.DOCTOR)
    async updateMyProfile(@Body() dto: UpdateDoctorProfileDto, @Request() req: any) {
        return this.doctorsService.updateMyProfile(req.user.id, dto);
    }

    @Put(':id/validate')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async validateDoctor(@Param('id') doctorId: string, @Request() req: any) {
        return this.doctorsService.validateDoctor(doctorId, req.user.id);
    }
}
