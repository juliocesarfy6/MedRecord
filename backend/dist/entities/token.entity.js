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
exports.Token = exports.AccessLevel = exports.TokenStatus = void 0;
const typeorm_1 = require("typeorm");
const patient_entity_1 = require("./patient.entity");
var TokenStatus;
(function (TokenStatus) {
    TokenStatus["ACTIVE"] = "activo";
    TokenStatus["EXPIRED"] = "expirado";
    TokenStatus["REVOKED"] = "revocado";
})(TokenStatus || (exports.TokenStatus = TokenStatus = {}));
var AccessLevel;
(function (AccessLevel) {
    AccessLevel["READ"] = "lectura";
    AccessLevel["EDIT"] = "edicion";
})(AccessLevel || (exports.AccessLevel = AccessLevel = {}));
let Token = class Token {
    id;
    token;
    patientId;
    nivelAcceso;
    estado;
    fechaExpiracion;
    createdAt;
    updatedAt;
    patient;
};
exports.Token = Token;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Token.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 100, name: 'token_code' }),
    __metadata("design:type", String)
], Token.prototype, "token", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'patient_id' }),
    __metadata("design:type", Number)
], Token.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: AccessLevel, default: AccessLevel.READ, name: 'access_level' }),
    __metadata("design:type", String)
], Token.prototype, "nivelAcceso", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TokenStatus, default: TokenStatus.ACTIVE }),
    __metadata("design:type", String)
], Token.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', name: 'expires_at' }),
    __metadata("design:type", Date)
], Token.prototype, "fechaExpiracion", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Token.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Token.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_entity_1.Patient, (patient) => patient.tokens, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", patient_entity_1.Patient)
], Token.prototype, "patient", void 0);
exports.Token = Token = __decorate([
    (0, typeorm_1.Entity)('access_tokens')
], Token);
//# sourceMappingURL=token.entity.js.map