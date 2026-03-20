"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = __importStar(require("bcryptjs"));
const user_entity_1 = require("../entities/user.entity");
const patient_entity_1 = require("../entities/patient.entity");
async function seed() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const userRepo = app.get((0, typeorm_1.getRepositoryToken)(user_entity_1.User));
    const patientRepo = app.get((0, typeorm_1.getRepositoryToken)(patient_entity_1.Patient));
    const users = [
        {
            nombre: 'Paciente Demo',
            email: 'paciente@test.com',
            password: 'Paciente123*',
            role: user_entity_1.UserRole.PATIENT,
            status: user_entity_1.UserStatus.ACTIVE,
        },
        {
            nombre: 'Dr. Médico Demo',
            email: 'medico@test.com',
            password: 'Medico123*',
            role: user_entity_1.UserRole.DOCTOR,
            status: user_entity_1.UserStatus.ACTIVE,
        },
        {
            nombre: 'Administrador',
            email: 'admin@test.com',
            password: 'Admin123*',
            role: user_entity_1.UserRole.ADMIN,
            status: user_entity_1.UserStatus.ACTIVE,
        },
    ];
    for (const userData of users) {
        const existing = await userRepo.findOne({ where: { email: userData.email } });
        if (existing) {
            console.log(`✅ User already exists: ${userData.email}`);
            continue;
        }
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        const user = userRepo.create({ ...userData, password: hashedPassword });
        const saved = await userRepo.save(user);
        console.log(`✅ Created user: ${saved.email} (${saved.role})`);
        if (saved.role === user_entity_1.UserRole.PATIENT) {
            const patient = patientRepo.create({
                user: saved,
                sexo: 'masculino',
                telefono: '555-1234',
                curp: 'PADM800101HDFXXX01',
                direccion: 'CDMX, México',
                fechaNacimiento: new Date('1980-01-01'),
            });
            await patientRepo.save(patient);
            console.log(`✅ Created patient profile for: ${saved.email}`);
        }
    }
    await app.close();
    console.log('🌱 Seed completed successfully!');
}
seed().catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map