import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokensService } from './tokens.service';
import { TokensController } from './tokens.controller';
import { Token } from '../entities/token.entity';
import { MedicalRecord } from '../entities/medical-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Token, MedicalRecord])
  ],
  controllers: [TokensController],
  providers: [TokensService],
  exports: [TokensService],
})
export class TokensModule { }