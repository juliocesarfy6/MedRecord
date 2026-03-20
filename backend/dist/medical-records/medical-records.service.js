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
const patient_entity_1 = require("../entities/patient.entity");
const doctor_entity_1 = require("../entities/doctor.entity");
let MedicalRecordsService = class MedicalRecordsService {
    recordsRepository;
    patientsRepository;
    doctorsRepository;
    constructor(recordsRepository, patientsRepository, doctorsRepository) {
        this.recordsRepository = recordsRepository;
        this.patientsRepository = patientsRepository;
        this.doctorsRepository = doctorsRepository;
    }
    async create(data) {
        const patient = await this.patientsRepository.findOne({ where: { id: +data.patientId } });
        if (!patient)
            throw new common_1.NotFoundException('Paciente no encontrado');
        const doctor = await this.doctorsRepository.findOne({ where: { user: { id: +data.doctorId } } });
        const record = this.recordsRepository.create({
            fecha: new Date(data.fecha),
            motivo: data.motivo,
            diagnostico: data.diagnostico,
            tratamiento: data.tratamiento,
            observaciones: data.observaciones,
            patient: { id: patient.id },
            doctor: doctor ? { id: doctor.id } : undefined,
        });
        return this.recordsRepository.save(record);
    }
    async findByPatient(patientId) {
        return this.recordsRepository.find({
            where: { patient: { id: +patientId } },
            relations: ['doctor', 'doctor.user'],
            order: { fecha: 'DESC' },
        });
    }
    async findByUserId(userId) {
        const patient = await this.patientsRepository.findOne({ where: { user: { id: +userId } } });
        if (!patient)
            throw new common_1.NotFoundException('Paciente no encontrado');
        return this.findByPatient(patient.id.toString());
    }
    async findOne(id) {
        const record = await this.recordsRepository.findOne({
            where: { id: +id },
            relations: ['patient', 'patient.user', 'doctor', 'doctor.user'],
        });
        if (!record)
            throw new common_1.NotFoundException('Registro no encontrado');
        return record;
    }
};
exports.MedicalRecordsService = MedicalRecordsService;
exports.MedicalRecordsService = MedicalRecordsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(medical_record_entity_1.MedicalRecord)),
    __param(1, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __param(2, (0, typeorm_1.InjectRepository)(doctor_entity_1.Doctor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MedicalRecordsService);
//# sourceMappingURL=medical-records.service.js.map