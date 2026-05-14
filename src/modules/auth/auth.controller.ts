import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
} from './dto/auth.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  // ─── REGISTER ────────────────────────────────────────
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'Registered' })
  @ApiResponse({ status: 409, description: 'Email exists' })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
  ) {
    return this.authService.register(
      dto,
      req.headers['user-agent'],
      req.ip,
    );
  }

  // ─── LOGIN ────────────────────────────────────────────
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
  ) {
    return this.authService.login(
      dto,
      req.headers['user-agent'],
      req.ip,
    );
  }

  // ─── REFRESH TOKENS ───────────────────────────────────
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'New tokens generated',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
  })
  async refreshTokens(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
  ) {
    return this.authService.refreshTokens(
      dto,
      req.headers['user-agent'],
      req.ip,
    );
  }

  // ─── GET ME ──────────────────────────────────────────
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current logged in user' })
  getMe(@CurrentUser() user: User) {
    return {
      message: 'Profile fetched successfully',
      data:    user,
    };
  }

  // ─── LOGOUT ──────────────────────────────────────────
  @Post('logout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout from current device' })
  logout(
    @CurrentUser('id') userId: string,
    @Body() dto: RefreshTokenDto,
  ) {
    return this.authService.logout(userId, dto);
  }

  // ─── LOGOUT ALL ──────────────────────────────────────
  @Post('logout-all')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout from all devices' })
  logoutAll(@CurrentUser('id') userId: string) {
    return this.authService.logoutAll(userId);
  }
}