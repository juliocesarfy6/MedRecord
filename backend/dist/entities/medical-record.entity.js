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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalRecord = void 0;
const typeorm_1 = require("typeorm");
const patient_entity_1 = require("./patient.entity");
const user_entity_1 = require("./user.entity");
let MedicalRecord = class MedicalRecord {
    id;
    fecha;
    motivo;
    diagnostico;
    tratamiento;
    observaciones;
    medicamentos;
    patient;
    doctor;
    createdAt;
};
exports.MedicalRecord = MedicalRecord;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MedicalRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], MedicalRecord.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500 }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "motivo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "diagnostico", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "tratamiento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "observaciones", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 100 }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "medicamentos", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_entity_1.Patient, (patient) => patient.medicalRecords),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", patient_entity_1.Patient)
], MedicalRecord.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: false }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", user_entity_1.User)
], MedicalRecord.prototype, "doctor", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MedicalRecord.prototype, "createdAt", void 0);
exports.MedicalRecord = MedicalRecord = __decorate([
    (0, typeorm_1.Entity)('medical_records')
], MedicalRecord);
//# sourceMappingURL=medical-record.entity.js.map