import { Controller, Post, Get, Param, Body, UseGuards, Request, Delete } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('tokens')
@UseGuards(JwtAuthGuard)
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Post('generate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PATIENT)
  generate(@Request() req: any, @Body() body: any) {
    return this.tokensService.generate(req.user.id, body);
  }

  @Post('validate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCTOR)
  validate(@Body('token') token: string) {
    return this.tokensService.validate(token);
  }

  @Get('my-tokens')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PATIENT)
  getMyTokens(@Request() req: any) {
    return this.tokensService.findByPatient(req.user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PATIENT)
  revoke(@Param('id') id: string, @Request() req: any) {
    return this.tokensService.revoke(id, req.user.id);
  }
}
