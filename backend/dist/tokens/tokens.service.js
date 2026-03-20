"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokensService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const token_entity_1 = require("../entities/token.entity");
const patient_entity_1 = require("../entities/patient.entity");
const uuid_1 = require("uuid");
let TokensService = class TokensService {
    tokensRepository;
    patientsRepository;
    constructor(tokensRepository, patientsRepository) {
        this.tokensRepository = tokensRepository;
        this.patientsRepository = patientsRepository;
    }
    async generate(userId, data) {
        const patient = await this.patientsRepository.findOne({ where: { user: { id: +userId } } });
        if (!patient)
            throw new common_1.NotFoundException('Paciente no encontrado');
        const hours = data.horasExpiracion || 24;
        const fechaExpiracion = new Date();
        fechaExpiracion.setHours(fechaExpiracion.getHours() + hours);
        const token = this.tokensRepository.create({
            token: (0, uuid_1.v4)().replace(/-/g, '').toUpperCase().substring(0, 12),
            nivelAcceso: data.nivelAcceso || token_entity_1.AccessLevel.READ,
            estado: token_entity_1.TokenStatus.ACTIVE,
            fechaExpiracion,
            patient,
        });
        return this.tokensRepository.save(token);
    }
    async validate(tokenValue) {
        const token = await this.tokensRepository.findOne({
            where: { token: tokenValue },
            relations: ['patient', 'patient.user'],
        });
        if (!token)
            throw new common_1.NotFoundException('Token no encontrado');
        if (token.estado === token_entity_1.TokenStatus.REVOKED) {
            throw new common_1.BadRequestException('Token revocado');
        }
        if (token.estado === token_entity_1.TokenStatus.EXPIRED || new Date() > token.fechaExpiracion) {
            if (token.estado !== token_entity_1.TokenStatus.EXPIRED) {
                token.estado = token_entity_1.TokenStatus.EXPIRED;
                await this.tokensRepository.save(token);
            }
            throw new common_1.BadRequestException('Token expirado');
        }
        return {
            valid: true,
            patientId: token.patient.id,
            nivelAcceso: token.nivelAcceso,
            patient: token.patient,
        };
    }
    async revoke(tokenId, userId) {
        const patient = await this.patientsRepository.findOne({ where: { user: { id: +userId } } });
        const token = await this.tokensRepository.findOne({
            where: { id: +tokenId, patient: { id: patient?.id } },
        });
        if (!token)
            throw new common_1.NotFoundException('Token no encontrado');
        token.estado = token_entity_1.TokenStatus.REVOKED;
        return this.tokensRepository.save(token);
    }
    async findByPatient(userId) {
        const patient = await this.patientsRepository.findOne({ where: { user: { id: +userId } } });
        if (!patient)
            throw new common_1.NotFoundException('Paciente no encontrado');
        return this.tokensRepository.find({
            where: { patient: { id: patient.id } },
            order: { createdAt: 'DESC' },
        });
    }
};
exports.TokensService = TokensService;
exports.TokensService = TokensService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(token_entity_1.Token)),
    __param(1, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], TokensService);
//# sourceMappingURL=tokens.service.js.map