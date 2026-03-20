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
exports.AuditLog = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const patient_entity_1 = require("./patient.entity");
let AuditLog = class AuditLog {
    id;
    userId;
    patientId;
    accion;
    detalles;
    ip;
    fecha;
    user;
    patient;
};
exports.AuditLog = AuditLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AuditLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", Number)
], AuditLog.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'patient_id', nullable: true }),
    __metadata("design:type", Number)
], AuditLog.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 150, name: 'action' }),
    __metadata("design:type", String)
], AuditLog.prototype, "accion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'description' }),
    __metadata("design:type", String)
], AuditLog.prototype, "detalles", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 45, name: 'ip_address' }),
    __metadata("design:type", String)
], AuditLog.prototype, "ip", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AuditLog.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.auditLogs, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], AuditLog.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_entity_1.Patient, (patient) => patient.auditLogs, { onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", patient_entity_1.Patient)
], AuditLog.prototype, "patient", void 0);
exports.AuditLog = AuditLog = __decorate([
    (0, typeorm_1.Entity)('audit_logs')
], AuditLog);
//# sourceMappingURL=audit-log.entity.js.map