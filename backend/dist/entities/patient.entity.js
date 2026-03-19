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
let Patient = class Patient {
    id;
    curp;
    fechaNacimiento;
    sexo;
    telefono;
    direccion;
    grupoSanguineo;
    alergias;
    user;
    medicalRecords;
    tokens;
};
exports.Patient = Patient;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Patient.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 20 }),
    __metadata("design:type", String)
], Patient.prototype, "curp", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Patient.prototype, "fechaNacimiento", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 10 }),
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
    (0, typeorm_1.Column)({ nullable: true, length: 30 }),
    __metadata("design:type", String)
], Patient.prototype, "grupoSanguineo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Patient.prototype, "alergias", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, (user) => user.patient),
    (0, typeorm_1.JoinColumn)(),
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
exports.Patient = Patient = __decorate([
    (0, typeorm_1.Entity)('patients')
], Patient);
//# sourceMappingURL=patient.entity.js.map