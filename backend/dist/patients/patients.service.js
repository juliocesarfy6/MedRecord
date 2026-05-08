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
exports.PatientsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const patient_entity_1 = require("../entities/patient.entity");
const audit_service_1 = require("../audit/audit.service");
const tokens_service_1 = require("../tokens/tokens.service");
const user_entity_1 = require("../entities/user.entity");
let PatientsService = class PatientsService {
    patientsRepository;
    auditService;
    tokensService;
    constructor(patientsRepository, auditService, tokensService) {
        this.patientsRepository = patientsRepository;
        this.auditService = auditService;
        this.tokensService = tokensService;
    }
    async findAll() {
        return this.patientsRepository.find({
            relations: ['user'],
            select: { user: { id: true, nombre: true, email: true, status: true } },
        });
    }
    async findOne(id) {
        const patient = await this.patientsRepository.findOne({
            where: { id: +id },
            relations: ['user'],
        });
        if (!patient)
            throw new common_1.NotFoundException('Paciente no encontrado');
        return patient;
    }
    async findOneForUser(id, user) {
        if (user.role === user_entity_1.UserRole.ADMIN)
            return this.findOne(id);
        if (user.role === user_entity_1.UserRole.DOCTOR) {
            const patientId = +id;
            const hasAccess = await this.tokensService.hasDoctorAccess(user.id, patientId);
            if (!hasAccess) {
                throw new common_1.ForbiddenException('Necesitas validar un token vigente de este paciente');
            }
            return this.findOne(id);
        }
        throw new common_1.ForbiddenException('No tienes permiso para consultar este paciente');
    }
    async findAuthorizedForDoctor(userId) {
        const patientIds = await this.tokensService.findAuthorizedPatientIds(userId);
        if (patientIds.length === 0)
            return [];
        return this.patientsRepository.find({
            where: { id: (0, typeorm_2.In)(patientIds) },
            relations: ['user'],
            select: { user: { id: true, nombre: true, email: true, status: true } },
        });
    }
    async findByUserId(userId) {
        const patient = await this.patientsRepository.findOne({
            where: { user: { id: +userId } },
            relations: ['user'],
        });
        if (!patient)
            throw new common_1.NotFoundException('Perfil de paciente no encontrado');
        this.auditService.log({
            user: patient.user,
            accion: 'VIEW_PROFILE',
            detalles: 'El paciente consultó su expediente personal',
            pacienteId: patient.id.toString(),
        }).catch(console.error);
        return patient;
    }
    async update(id, data) {
        const patient = await this.findOne(id);
        Object.assign(patient, data);
        return this.patientsRepository.save(patient);
    }
    async updateByUserId(userId, data) {
        const patient = await this.findByUserId(userId);
        Object.assign(patient, data);
        const updatedPatient = await this.patientsRepository.save(patient);
        this.auditService.log({
            user: patient.user,
            accion: 'UPDATE_PROFILE',
            detalles: 'El paciente actualizó su información personal',
            pacienteId: patient.id.toString(),
        }).catch(console.error);
        return updatedPatient;
    }
};
exports.PatientsService = PatientsService;
exports.PatientsService = PatientsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        audit_service_1.AuditService,
        tokens_service_1.TokensService])
], PatientsService);
//# sourceMappingURL=patients.service.js.map