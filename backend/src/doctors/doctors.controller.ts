import { Controller, Put, Param, UseGuards, Request, Post, Body } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('doctors')
@UseGuards(JwtAuthGuard)
export class DoctorsController {
    constructor(private readonly doctorsService: DoctorsService) { }

    @Post()
    async createProfile(@Body() body: any, @Request() req: any) {
        return this.doctorsService.createProfile(req.user.id, body);
    }

    @Put(':id/validate')
    async validateDoctor(@Param('id') doctorId: string, @Request() req: any) {
        return this.doctorsService.validateDoctor(doctorId, req.user.id);
    }
}