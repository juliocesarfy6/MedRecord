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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const user_entity_1 = require("../entities/user.entity");
const patient_entity_1 = require("../entities/patient.entity");
let AuthService = class AuthService {
    usersRepository;
    patientsRepository;
    jwtService;
    constructor(usersRepository, patientsRepository, jwtService) {
        this.usersRepository = usersRepository;
        this.patientsRepository = patientsRepository;
        this.jwtService = jwtService;
    }
    async register(dto) {
        const existing = await this.usersRepository.findOne({ where: { email: dto.email } });
        if (existing) {
            throw new common_1.ConflictException('El email ya está registrado');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 12);
        const status = dto.role === user_entity_1.UserRole.DOCTOR ? user_entity_1.UserStatus.PENDING : user_entity_1.UserStatus.ACTIVE;
        const user = this.usersRepository.create({
            nombre: dto.nombre,
            email: dto.email,
            password: hashedPassword,
            role: dto.role || user_entity_1.UserRole.PATIENT,
            status,
        });
        const saved = await this.usersRepository.save(user);
        if (saved.role === user_entity_1.UserRole.PATIENT) {
            const patient = this.patientsRepository.create({ user: saved });
            await this.patientsRepository.save(patient);
        }
        const { password, ...result } = saved;
        return result;
    }
    async login(dto) {
        const user = await this.usersRepository.findOne({ where: { email: dto.email } });
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const isValid = await bcrypt.compare(dto.password, user.password);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        if (user.status === user_entity_1.UserStatus.INACTIVE) {
            throw new common_1.UnauthorizedException('Cuenta desactivada');
        }
        if (user.status === user_entity_1.UserStatus.PENDING) {
            throw new common_1.UnauthorizedException('Cuenta pendiente de aprobación por el administrador');
        }
        const payload = { sub: user.id, email: user.email, role: user.role };
        const access_token = this.jwtService.sign(payload);
        return {
            access_token,
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                role: user.role,
                status: user.status,
            },
        };
    }
    async getProfile(userId) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            relations: ['patient'],
        });
        if (!user)
            throw new common_1.UnauthorizedException();
        const { password, ...result } = user;
        return result;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map