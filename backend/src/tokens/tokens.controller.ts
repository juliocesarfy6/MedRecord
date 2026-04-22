import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) { }

  // 1. Un Doctor o Admin solicita generar el PIN para una receta
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  @Post('generate')
  generatePin(@Body('recordId') recordId: number) {
    return this.tokensService.generatePin(recordId);
  }

  // 2. Cualquier usuario logueado (Paciente/Médico) ingresa el PIN para verlo
  @UseGuards(JwtAuthGuard)
  @Post('validate')
  validatePin(@Body('pin') pin: string) {
    return this.tokensService.validatePin(pin);
  }
}