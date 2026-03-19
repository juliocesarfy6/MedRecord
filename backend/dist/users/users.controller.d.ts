import { UsersService } from './users.service';
import { UserRole } from '../entities/user.entity';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(role?: UserRole): Promise<import("../entities/user.entity").User[]>;
    findOne(id: string): Promise<import("../entities/user.entity").User>;
    changeRole(id: string, role: UserRole): Promise<import("../entities/user.entity").User>;
    toggleStatus(id: string): Promise<import("../entities/user.entity").User>;
    approve(id: string): Promise<import("../entities/user.entity").User>;
    reject(id: string): Promise<import("../entities/user.entity").User>;
}
