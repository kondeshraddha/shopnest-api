import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Op } from 'sequelize';
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
    const existingUser = await this.userModel.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException(
        'Email is already registered. Please login.',
      );
    }

    const user = await this.userModel.create({
      firstName: dto.firstName,
      lastName:  dto.lastName,
      email:     dto.email,
      password:  dto.password,
      phone:     dto.phone,
    } as any);

    const tokens = await this.generateTokens(user);

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
    const user = await this.userModel.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Your account has been deactivated. Contact support.',
      );
    }

    const isPasswordValid = await user.validatePassword(
      dto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    await user.update({ lastLoginAt: new Date() });

    const tokens = await this.generateTokens(user);

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

  // ─── REFRESH TOKENS ───────────────────────────────────
  async refreshTokens(
    dto: RefreshTokenDto,
    userAgent?: string,
    ipAddress?: string,
  ) {
    // Step 1: Verify refresh token signature
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify<JwtPayload>(
        dto.refreshToken,
        {
          secret: this.configService.get<string>(
            'jwt.refreshSecret',
          ),
        },
      );
    } catch (error) {
      throw new UnauthorizedException(
        'Refresh token is invalid or expired',
      );
    }

    // Step 2: Find token in database
    const tokenRecord = await this.refreshTokenModel.findOne({
      where: {
        token:     dto.refreshToken,
        userId:    payload.sub,
        isRevoked: false,
      },
    });

    // Token not in DB or already revoked
    if (!tokenRecord) {
      throw new UnauthorizedException(
        'Refresh token has been revoked or does not exist',
      );
    }

    // Step 3: Check token not expired
    const isExpired = dayjs().isAfter(
      dayjs(tokenRecord.expiresAt),
    );

    if (isExpired) {
      // Mark as revoked
      await tokenRecord.update({ isRevoked: true });
      throw new UnauthorizedException(
        'Refresh token has expired. Please login again.',
      );
    }

    // Step 4: Find user
    const user = await this.userModel.findOne({
      where: {
        id:       payload.sub,
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'User not found or account deactivated',
      );
    }

    // Step 5: Revoke OLD refresh token (Token Rotation)
    await tokenRecord.update({ isRevoked: true });

    // Step 6: Generate NEW tokens
    const tokens = await this.generateTokens(user);

    // Step 7: Save NEW refresh token
    await this.saveRefreshToken(
      user.id,
      tokens.refreshToken,
      userAgent,
      ipAddress,
    );

    this.logger.log(`Tokens refreshed for: ${user.email}`);

    return {
      message: 'Tokens refreshed successfully',
      data: {
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
      data: { devicesLoggedOut: revokedCount[0] },
    };
  }

  // ─── GENERATE TOKENS (private) ───────────────────────
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

  // ─── SAVE REFRESH TOKEN (private) ────────────────────
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

    const days    = parseInt(refreshExpiresIn) || 7;
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