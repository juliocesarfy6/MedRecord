import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    findAll(role?: UserRole): Promise<User[]>;
    findOne(id: string): Promise<User>;
    changeRole(id: string, role: UserRole): Promise<User>;
    toggleStatus(id: string): Promise<User>;
    approveDoctor(id: string): Promise<User>;
    rejectDoctor(id: string): Promise<User>;
}
