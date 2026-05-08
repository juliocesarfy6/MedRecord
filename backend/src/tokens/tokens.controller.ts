import { Controller, Post, Get, Body, UseGuards, Request, Delete, Param } from '@nestjs/common';
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

  // 2. El médico valida el token recibido para abrir el expediente
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  @Post('validate')
  validateToken(@Request() req: any, @Body('token') token: string) {
    return this.tokensService.validateToken(req.user.id, token);
  }

  // 3. El paciente obtiene sus tokens generados
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PATIENT)
  @Get('my-tokens')
  getMyTokens(@Request() req: any) {
    return this.tokensService.getMyTokens(req.user.id);
  }

  // 4. El paciente revoca uno de sus tokens
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PATIENT)
  @Delete(':id')
  revokeToken(@Request() req: any, @Param('id') id: string) {
    return this.tokensService.revokeToken(req.user.id, +id);
  }
}
