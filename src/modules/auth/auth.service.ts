import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
} from './dto/auth.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import * as dayjs from 'dayjs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User)
    private userModel: typeof User,

    @InjectModel(RefreshToken)
    private refreshTokenModel: typeof RefreshToken,

    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // ─── REGISTER ────────────────────────────────────────
  async register(
    dto: RegisterDto,
    userAgent?: string,
    ipAddress?: string,
  ) {
    // Check email not already registered
    const existingUser = await this.userModel.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException(
        'Email is already registered. Please login.',
      );
    }

    // Create user (password auto hashed by entity hook)
    const user = await this.userModel.create({
      firstName: dto.firstName,
      lastName:  dto.lastName,
      email:     dto.email,
      password:  dto.password,
      phone:     dto.phone,
    } as any);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Save refresh token to database
    await this.saveRefreshToken(
      user.id,
      tokens.refreshToken,
      userAgent,
      ipAddress,
    );

    this.logger.log(`New user registered: ${user.email}`);

    return {
      message: 'Registration successful! Welcome to ShopNest.',
      data: {
        user:         user.toJSON(),
        accessToken:  tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }

  // ─── LOGIN ────────────────────────────────────────────
  async login(
    dto: LoginDto,
    userAgent?: string,
    ipAddress?: string,
  ) {
    // Find user by email
    const user = await this.userModel.findOne({
      where: { email: dto.email },
    });

    // User not found
    if (!user) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    // Account deactivated
    if (!user.isActive) {
      throw new UnauthorizedException(
        'Your account has been deactivated. Please contact support.',
      );
    }

    // Wrong password
    const isPasswordValid = await user.validatePassword(
      dto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    // Update last login time
    await user.update({ lastLoginAt: new Date() });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Save refresh token
    await this.saveRefreshToken(
      user.id,
      tokens.refreshToken,
      userAgent,
      ipAddress,
    );

    this.logger.log(`User logged in: ${user.email}`);

    return {
      message: 'Login successful! Welcome back.',
      data: {
        user:         user.toJSON(),
        accessToken:  tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }

  // ─── LOGOUT (single device) ───────────────────────────
  async logout(
    userId: string,
    dto: RefreshTokenDto,
  ) {
    const tokenRecord = await this.refreshTokenModel.findOne({
      where: {
        userId,
        token:     dto.refreshToken,
        isRevoked: false,
      },
    });

    if (!tokenRecord) {
      return { message: 'Logged out successfully' };
    }

    await tokenRecord.update({ isRevoked: true });

    this.logger.log(`User logged out: ${userId}`);

    return { message: 'Logged out successfully' };
  }

  // ─── LOGOUT ALL (all devices) ─────────────────────────
  async logoutAll(userId: string) {
    const revokedCount = await this.refreshTokenModel.update(
      { isRevoked: true },
      {
        where: {
          userId,
          isRevoked: false,
        },
      },
    );

    this.logger.log(
      `User logged out from all devices: ${userId}`,
    );

    return {
      message: 'Logged out from all devices successfully',
      data: {
        devicesLoggedOut: revokedCount[0],
      },
    };
  }

  // ─── GENERATE TOKENS ─────────────────────────────────
  private async generateTokens(user: User) {
    const payload: JwtPayload = {
      sub:   user.id,
      email: user.email,
      role:  user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>(
          'jwt.accessSecret',
        ),
        expiresIn: this.configService.get<string>(
          'jwt.accessExpiresIn',
        ),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>(
          'jwt.refreshSecret',
        ),
        expiresIn: this.configService.get<string>(
          'jwt.refreshExpiresIn',
        ),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  // ─── SAVE REFRESH TOKEN ──────────────────────────────
  private async saveRefreshToken(
    userId:     string,
    token:      string,
    userAgent?: string,
    ipAddress?: string,
  ) {
    const refreshExpiresIn =
      this.configService.get<string>(
        'jwt.refreshExpiresIn',
      ) ?? '7d';

    const days = parseInt(refreshExpiresIn) || 7;
    const expiresAt = dayjs().add(days, 'day').toDate();

    await this.refreshTokenModel.create({
      userId,
      token,
      userAgent,
      ipAddress,
      isRevoked: false,
      expiresAt,
    } as any);
  }
}