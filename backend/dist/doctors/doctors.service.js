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
exports.DoctorsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const doctor_entity_1 = require("../entities/doctor.entity");
const audit_service_1 = require("../audit/audit.service");
let DoctorsService = class DoctorsService {
    doctorRepository;
    auditService;
    constructor(doctorRepository, auditService) {
        this.doctorRepository = doctorRepository;
        this.auditService = auditService;
    }
    async validateDoctor(doctorId, adminId) {
        const doctor = await this.doctorRepository.findOne({
            where: { id: +doctorId },
            relations: ['user'],
        });
        if (!doctor)
            throw new common_1.NotFoundException('Médico no encontrado');
        if (doctor.validadoPorAdmin)
            throw new common_1.BadRequestException('El médico ya estaba validado');
        doctor.validadoPorAdmin = true;
        doctor.fechaValidacion = new Date();
        const updatedDoctor = await this.doctorRepository.save(doctor);
        this.auditService.log({
            accion: 'VALIDATE_DOCTOR',
            detalles: `El Admin ID ${adminId} validó al Médico ID ${doctor.id} (${doctor.cedulaProfesional})`,
        }).catch(console.error);
        return {
            message: 'Médico validado exitosamente',
            doctor: updatedDoctor,
        };
    }
};
exports.DoctorsService = DoctorsService;
exports.DoctorsService = DoctorsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(doctor_entity_1.Doctor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        audit_service_1.AuditService])
], DoctorsService);
//# sourceMappingURL=doctors.service.js.map