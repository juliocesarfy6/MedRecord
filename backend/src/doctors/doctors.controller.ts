import { Controller, Put, Param, UseGuards, Request } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('doctors')
@UseGuards(JwtAuthGuard) // 🔒 Requiere estar logueado
export class DoctorsController {
    constructor(private readonly doctorsService: DoctorsService) { }

    @Put(':id/validate')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN) // 🔒 SOLO el administrador puede hacer esto
    validateDoctor(@Param('id') doctorId: string, @Request() req: any) {
        // req.user.id contiene el ID del administrador logueado, gracias a nuestro JWT
        return this.doctorsService.validateDoctor(doctorId, req.user.id);
    }
}