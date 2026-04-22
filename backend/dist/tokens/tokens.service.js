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
const medical_record_entity_1 = require("../entities/medical-record.entity");
let TokensService = class TokensService {
    tokensRepository;
    recordsRepository;
    constructor(tokensRepository, recordsRepository) {
        this.tokensRepository = tokensRepository;
        this.recordsRepository = recordsRepository;
    }
    async generatePin(recordId) {
        const record = await this.recordsRepository.findOne({ where: { id: recordId } });
        if (!record)
            throw new common_1.NotFoundException('Historial médico no encontrado');
        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        const newToken = this.tokensRepository.create({
            pin: pin,
            expiresAt: expiresAt,
            isUsed: false,
            medicalRecord: record,
        });
        return this.tokensRepository.save(newToken);
    }
    async validatePin(pin) {
        const token = await this.tokensRepository.findOne({
            where: { pin: pin },
            relations: ['medicalRecord', 'medicalRecord.doctor', 'medicalRecord.patient'],
        });
        if (!token)
            throw new common_1.NotFoundException('PIN incorrecto');
        if (token.isUsed)
            throw new common_1.BadRequestException('Este PIN ya fue utilizado');
        if (new Date() > token.expiresAt)
            throw new common_1.BadRequestException('Este PIN ha expirado');
        token.isUsed = true;
        await this.tokensRepository.save(token);
        return {
            message: 'Acceso concedido',
            medicalRecord: token.medicalRecord,
        };
    }
};
exports.TokensService = TokensService;
exports.TokensService = TokensService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(token_entity_1.Token)),
    __param(1, (0, typeorm_1.InjectRepository)(medical_record_entity_1.MedicalRecord)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], TokensService);
//# sourceMappingURL=tokens.service.js.map