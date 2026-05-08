import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../../users/entities/user.entity';

// Shape of data inside JWT token
export interface JwtPayload {
  sub:   string; // user id
  email: string;
  role:  string;
  iat?:  number; // issued at
  exp?:  number; // expires at
}

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  'jwt',
) {
  constructor(
    private configService: ConfigService,

    @InjectModel(User)
    private userModel: typeof User,
  ) {
    super({
      // Extract token from Authorization header
      // "Bearer eyJhbGci..."
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Do not ignore expired tokens
      ignoreExpiration: false,

      // Secret key to verify token signature
      secretOrKey: configService.get<string>(
        'jwt.accessSecret',
      ),
    });
  }

  // Runs after token signature is verified
  // payload = decoded token data
  async validate(payload: JwtPayload) {

    // Find user in database
    const user = await this.userModel.findOne({
      where: {
        id: payload.sub,
        isActive: true,
      },
      attributes: { exclude: ['password'] },
    });

    // User not found or deactivated
    if (!user) {
      throw new UnauthorizedException(
        'User not found or account deactivated',
      );
    }

    // Return user → stored in request.user
    // @CurrentUser() gets this
    return user;
  }
}