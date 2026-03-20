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
exports.Doctor = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const medical_record_entity_1 = require("./medical-record.entity");
let Doctor = class Doctor {
    id;
    userId;
    especialidad;
    cedulaProfesional;
    validadoPorAdmin;
    fechaValidacion;
    createdAt;
    updatedAt;
    user;
    medicalRecords;
};
exports.Doctor = Doctor;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Doctor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", Number)
], Doctor.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Doctor.prototype, "especialidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true, unique: true, name: 'cedula_profesional' }),
    __metadata("design:type", String)
], Doctor.prototype, "cedulaProfesional", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'validado_por_admin', default: false }),
    __metadata("design:type", Boolean)
], Doctor.prototype, "validadoPorAdmin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true, name: 'fecha_validacion' }),
    __metadata("design:type", Date)
], Doctor.prototype, "fechaValidacion", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Doctor.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Doctor.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, (user) => user.doctor, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Doctor.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => medical_record_entity_1.MedicalRecord, (record) => record.doctor),
    __metadata("design:type", Array)
], Doctor.prototype, "medicalRecords", void 0);
exports.Doctor = Doctor = __decorate([
    (0, typeorm_1.Entity)('doctors')
], Doctor);
//# sourceMappingURL=doctor.entity.js.map