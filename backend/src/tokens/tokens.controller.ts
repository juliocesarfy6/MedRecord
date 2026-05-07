import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) { }

  // 1. Un Paciente genera el Token de acceso
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PATIENT)
  @Post('generate')
  generateToken(@Request() req: any, @Body() data: any) {
    return this.tokensService.generateToken(req.user.id, data);
  }

  // 2. Cualquier usuario logueado (Médico) ingresa el Token para verlo
  @UseGuards(JwtAuthGuard)
  @Post('validate')
  validateToken(@Body('token') token: string) {
    return this.tokensService.validateToken(token);
  }

  // 3. El paciente obtiene sus tokens generados
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PATIENT)
  @Get('my-tokens')
  getMyTokens(@Request() req: any) {
    return this.tokensService.getMyTokens(req.user.id);
  }
}