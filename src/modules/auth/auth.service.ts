import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email, isActive: true },
      select: ['id', 'email', 'name', 'role', 'password'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`User ${user.email} logged in`);

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Tạo tài khoản admin mặc định nếu chưa có user nào trong DB
   */
  async seed() {
    const count = await this.usersRepository.count();
    if (count > 0) {
      return { message: 'Database đã có dữ liệu, bỏ qua seed' };
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = this.usersRepository.create({
      name: 'Admin',
      email: 'admin@doublebakery.com',
      password: hashedPassword,
      role: 'admin',
    });
    await this.usersRepository.save(admin);

    const staffPassword = await bcrypt.hash('staff123', 10);
    const staff = this.usersRepository.create({
      name: 'Nhân viên',
      email: 'staff@doublebakery.com',
      password: staffPassword,
      role: 'staff',
    });
    await this.usersRepository.save(staff);

    this.logger.log('Seed completed: admin + staff created');
    return {
      message: 'Seed thành công',
      accounts: [
        { email: 'admin@doublebakery.com', password: 'admin123', role: 'admin' },
        { email: 'staff@doublebakery.com', password: 'staff123', role: 'staff' },
      ],
    };
  }

  async register(registerDto: RegisterDto) {
    const existing = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.usersRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    const saved = await this.usersRepository.save(user);
    this.logger.log(`New user registered: ${saved.email}`);

    const { password, ...result } = saved as any;
    return result;
  }
}
