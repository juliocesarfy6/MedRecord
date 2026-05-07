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
exports.MedicalRecordsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const medical_record_entity_1 = require("../entities/medical-record.entity");
const doctor_entity_1 = require("../entities/doctor.entity");
const patient_entity_1 = require("../entities/patient.entity");
const audit_service_1 = require("../audit/audit.service");
let MedicalRecordsService = class MedicalRecordsService {
    recordsRepository;
    doctorRepository;
    patientRepository;
    auditService;
    constructor(recordsRepository, doctorRepository, patientRepository, auditService) {
        this.recordsRepository = recordsRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.auditService = auditService;
    }
    async createRecord(userId, createDto) {
        const doctor = await this.doctorRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user']
        });
        if (!doctor)
            throw new common_1.NotFoundException('Perfil de médico no encontrado');
        if (!doctor.validadoPorAdmin) {
            throw new common_1.ForbiddenException('No puedes crear historiales hasta ser validado por un Administrador');
        }
        const patient = await this.patientRepository.findOne({
            where: { id: createDto.patientId },
            relations: ['user']
        });
        if (!patient)
            throw new common_1.NotFoundException('Paciente no encontrado');
        const newRecord = this.recordsRepository.create({
            motivo: createDto.motivoConsulta,
            diagnostico: createDto.diagnostico,
            tratamiento: createDto.tratamiento,
            observaciones: createDto.observaciones,
            fecha: new Date(),
            doctor: doctor,
            patient: patient,
        });
        const savedRecord = await this.recordsRepository.save(newRecord);
        this.auditService.log({
            user: doctor.user,
            accion: 'CREATE_MEDICAL_RECORD',
            detalles: `Médico ID ${doctor.id} creó historial para el Paciente ID ${patient.id}`,
            pacienteId: patient.id.toString(),
        }).catch(err => console.error('Error en auditoría:', err));
        return savedRecord;
    }
    async getMyRecords(userId) {
        const patient = await this.patientRepository.findOne({ where: { user: { id: userId } } });
        if (!patient)
            throw new common_1.NotFoundException('Paciente no encontrado');
        return this.recordsRepository.find({
            where: { patient: { id: patient.id } },
            relations: ['doctor', 'doctor.user'],
            order: { fecha: 'DESC' },
        });
    }
    async findByPatient(patientId) {
        const records = await this.recordsRepository.find({
            where: { patient: { id: patientId } },
            relations: ['doctor', 'doctor.user'],
            order: { fecha: 'DESC' },
        });
        return records;
    }
};
exports.MedicalRecordsService = MedicalRecordsService;
exports.MedicalRecordsService = MedicalRecordsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(medical_record_entity_1.MedicalRecord)),
    __param(1, (0, typeorm_1.InjectRepository)(doctor_entity_1.Doctor)),
    __param(2, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        audit_service_1.AuditService])
], MedicalRecordsService);
//# sourceMappingURL=medical-records.service.js.map