import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../../users/entities/user.entity';

export interface JwtPayload {
  sub:   string;
  email: string;
  role:  string;
  iat?:  number;
  exp?:  number;
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
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'jwt.accessSecret',
      ),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userModel.findOne({
      where: {
        id:       payload.sub,
        isActive: true,
      },
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      throw new UnauthorizedException(
        'User not found or account deactivated',
      );
    }

    return user;
  }
}