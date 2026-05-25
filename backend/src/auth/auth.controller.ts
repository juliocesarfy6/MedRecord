import { BadRequestException, Body, Controller, Get, Post, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { diskStorage } from 'multer';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('documentoCedula', {
    storage: diskStorage({
      destination: (_req: any, _file: any, cb: any) => {
        const uploadDir = join(process.cwd(), 'uploads', 'doctor-documents');
        if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
      },
      filename: (_req: any, file: any, cb: any) => {
        const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname || '')}`;
        cb(null, safeName);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req: any, file: any, cb: any) => {
      const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowed.includes(file.mimetype)) {
        return cb(new BadRequestException('El archivo de cédula debe ser PDF, JPG o PNG'), false);
      }
      cb(null, true);
    },
  }))
  register(@Body() dto: RegisterDto, @UploadedFile() file?: any) {
    return this.authService.register(dto, file);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.id);
  }
}
