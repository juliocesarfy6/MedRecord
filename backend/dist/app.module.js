"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const patients_module_1 = require("./patients/patients.module");
const medical_records_module_1 = require("./medical-records/medical-records.module");
const tokens_module_1 = require("./tokens/tokens.module");
const audit_module_1 = require("./audit/audit.module");
const user_entity_1 = require("./entities/user.entity");
const patient_entity_1 = require("./entities/patient.entity");
const medical_record_entity_1 = require("./entities/medical-record.entity");
const token_entity_1 = require("./entities/token.entity");
const audit_log_entity_1 = require("./entities/audit-log.entity");
const doctor_entity_1 = require("./entities/doctor.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'mysql',
                    host: config.get('DB_HOST', 'localhost'),
                    port: config.get('DB_PORT', 3306),
                    username: config.get('DB_USERNAME', 'root'),
                    password: config.get('DB_PASSWORD', 'root'),
                    database: config.get('DB_NAME', 'historial_medico_db'),
                    entities: [user_entity_1.User, patient_entity_1.Patient, doctor_entity_1.Doctor, medical_record_entity_1.MedicalRecord, token_entity_1.Token, audit_log_entity_1.AuditLog],
                    synchronize: false,
                    charset: 'utf8mb4',
                    logging: config.get('NODE_ENV') === 'development',
                }),
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            patients_module_1.PatientsModule,
            medical_records_module_1.MedicalRecordsModule,
            tokens_module_1.TokensModule,
            audit_module_1.AuditModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map