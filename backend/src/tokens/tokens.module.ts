import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokensService } from './tokens.service';
import { TokensController } from './tokens.controller';
import { Token } from '../entities/token.entity';
import { Patient } from '../entities/patient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Token, Patient])],
  controllers: [TokensController],
  providers: [TokensService],
  exports: [TokensService],
})
export class TokensModule {}
