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
let TokensService = class TokensService {
    tokensRepository;
    patientRepository;
    constructor(tokensRepository, patientRepository) {
        this.tokensRepository = tokensRepository;
        this.patientRepository = patientRepository;
    }
    async generateToken(userId, data) {
        const patient = await this.patientRepository.findOne({ where: { userId } });
        if (!patient)
            throw new common_1.NotFoundException('Paciente no encontrado');
        const horasExpiracion = data.horasExpiracion ? Number(data.horasExpiracion) : 24;
        if (!Number.isFinite(horasExpiracion) || horasExpiracion <= 0 || horasExpiracion > 168) {
            throw new common_1.BadRequestException('El tiempo de validez debe estar entre 1 hora y 1 semana');
        }
        const pin = await this.generateUniquePin();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + horasExpiracion);
        const newToken = this.tokensRepository.create({
            pin,
            expiresAt,
            isUsed: false,
            usedByUserId: null,
            revokedAt: null,
            nivelAcceso: data.nivelAcceso || 'lectura',
            descripcion: data.descripcion || '',
            patient,
        });
        const saved = await this.tokensRepository.save(newToken);
        return this.toResponse(saved);
    }
    async validateToken(doctorUserId, pin) {
        const normalizedPin = pin?.toUpperCase().trim();
        if (!normalizedPin)
            throw new common_1.BadRequestException('Token requerido');
        const token = await this.tokensRepository.findOne({
            where: { pin: normalizedPin },
            relations: ['patient'],
        });
        if (!token)
            throw new common_1.NotFoundException('Token incorrecto');
        if (token.revokedAt)
            throw new common_1.BadRequestException('Este Token fue revocado');
        if (new Date() > token.expiresAt)
            throw new common_1.BadRequestException('Este Token ha expirado');
        if (token.isUsed)
            throw new common_1.BadRequestException('Este Token ya fue utilizado');
        token.isUsed = true;
        token.usedByUserId = doctorUserId;
        await this.tokensRepository.save(token);
        return {
            message: 'Acceso concedido',
            patientId: token.patient.id,
            nivelAcceso: token.nivelAcceso,
        };
    }
    async getMyTokens(userId) {
        const patient = await this.patientRepository.findOne({ where: { userId } });
        if (!patient)
            throw new common_1.NotFoundException('Paciente no encontrado');
        const tokens = await this.tokensRepository.find({
            where: { patient: { id: patient.id } },
            order: { createdAt: 'DESC' },
        });
        return tokens.map((token) => this.toResponse(token));
    }
    async revokeToken(userId, tokenId) {
        if (!Number.isInteger(tokenId) || tokenId <= 0) {
            throw new common_1.BadRequestException('Token inválido');
        }
        const patient = await this.patientRepository.findOne({ where: { userId } });
        if (!patient)
            throw new common_1.NotFoundException('Paciente no encontrado');
        const token = await this.tokensRepository.findOne({
            where: { id: tokenId, patient: { id: patient.id } },
            relations: ['patient'],
        });
        if (!token)
            throw new common_1.NotFoundException('Token no encontrado');
        if (!token.revokedAt) {
            token.revokedAt = new Date();
            await this.tokensRepository.save(token);
        }
        return this.toResponse(token);
    }
    async generateUniquePin() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        for (let attempt = 0; attempt < 5; attempt++) {
            let pin = '';
            for (let i = 0; i < 12; i++) {
                pin += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            const existing = await this.tokensRepository.exists({ where: { pin } });
            if (!existing)
                return pin;
        }
        throw new common_1.BadRequestException('No se pudo generar un token único, intenta de nuevo');
    }
    getEstado(token) {
        if (token.revokedAt)
            return 'revocado';
        if (new Date() > token.expiresAt)
            return 'expirado';
        if (token.isUsed)
            return 'usado';
        return 'activo';
    }
    toResponse(token) {
        return {
            id: token.id,
            token: token.pin,
            nivelAcceso: token.nivelAcceso || 'lectura',
            descripcion: token.descripcion || '',
            createdAt: token.createdAt,
            fechaExpiracion: token.expiresAt,
            expiresAt: token.expiresAt,
            isUsed: token.isUsed,
            usedByUserId: token.usedByUserId,
            revokedAt: token.revokedAt,
            estado: this.getEstado(token),
        };
    }
    async hasDoctorAccess(doctorUserId, patientId) {
        const accessToken = await this.tokensRepository.findOne({
            where: {
                patient: { id: patientId },
                usedByUserId: doctorUserId,
                isUsed: true,
            },
            relations: ['patient'],
            order: { createdAt: 'DESC' },
        });
        if (!accessToken)
            return false;
        return !accessToken.revokedAt && new Date() <= accessToken.expiresAt;
    }
    async findAuthorizedPatientIds(doctorUserId) {
        const tokens = await this.tokensRepository.find({
            where: {
                usedByUserId: doctorUserId,
                isUsed: true,
            },
            relations: ['patient'],
            order: { createdAt: 'DESC' },
        });
        const now = new Date();
        const patientIds = tokens
            .filter((token) => token.patient && !token.revokedAt && now <= token.expiresAt)
            .map((token) => token.patient.id);
        return [...new Set(patientIds)];
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