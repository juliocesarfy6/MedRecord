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
exports.Patient = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const medical_record_entity_1 = require("./medical-record.entity");
const token_entity_1 = require("./token.entity");
const audit_log_entity_1 = require("./audit-log.entity");
let Patient = class Patient {
    id;
    userId;
    fechaNacimiento;
    sexo;
    telefono;
    direccion;
    curp;
    createdAt;
    updatedAt;
    user;
    medicalRecords;
    tokens;
    auditLogs;
};
exports.Patient = Patient;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Patient.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", Number)
], Patient.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', name: 'fecha_nacimiento' }),
    __metadata("design:type", Date)
], Patient.prototype, "fechaNacimiento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['masculino', 'femenino', 'otro'] }),
    __metadata("design:type", String)
], Patient.prototype, "sexo", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 20 }),
    __metadata("design:type", String)
], Patient.prototype, "telefono", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 255 }),
    __metadata("design:type", String)
], Patient.prototype, "direccion", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 18, unique: true }),
    __metadata("design:type", String)
], Patient.prototype, "curp", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Patient.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Patient.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, (user) => user.patient, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Patient.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => medical_record_entity_1.MedicalRecord, (record) => record.patient),
    __metadata("design:type", Array)
], Patient.prototype, "medicalRecords", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => token_entity_1.Token, (token) => token.patient),
    __metadata("design:type", Array)
], Patient.prototype, "tokens", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => audit_log_entity_1.AuditLog, (log) => log.patient),
    __metadata("design:type", Array)
], Patient.prototype, "auditLogs", void 0);
exports.Patient = Patient = __decorate([
    (0, typeorm_1.Entity)('patients')
], Patient);
//# sourceMappingURL=patient.entity.js.map