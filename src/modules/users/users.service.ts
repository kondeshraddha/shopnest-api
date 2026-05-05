import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  PaginationDto,
  paginate,
} from '../../common/utils/pagination.util';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
  ) {}

  // ─── GET ALL USERS (Admin) ───────────────────────────
  async findAll(pagination: PaginationDto) {
    const { count, rows } =
      await this.usersRepository.findAll(pagination);

    return paginate(
      rows,
      count,
      pagination.page ?? 1,
      pagination.limit ?? 10,
    );
  }

  // ─── GET USER BY ID ──────────────────────────────────
  async findById(id: string) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // ─── GET MY PROFILE ──────────────────────────────────
  async getMyProfile(userId: string) {
    return this.findById(userId);
  }

  // ─── UPDATE PROFILE ──────────────────────────────────
  async updateProfile(userId: string, dto: UpdateUserDto) {
    const user = await this.findById(userId);

    // Check if new email already used by another user
    if (dto.email && dto.email !== user.email) {
      const emailTaken =
        await this.usersRepository.emailExists(
          dto.email,
          userId,
        );

      if (emailTaken) {
        throw new ConflictException(
          'Email is already in use',
        );
      }
    }

    const updated =
      await this.usersRepository.update(user, dto);

    return {
      message: 'Profile updated successfully',
      data: updated,
    };
  }

  // ─── UPDATE AVATAR ───────────────────────────────────
  async updateAvatar(userId: string, avatarUrl: string) {
    const user = await this.findById(userId);
    await this.usersRepository.updateAvatar(
      user,
      avatarUrl,
    );
    return {
      message: 'Avatar updated successfully',
      data: { avatar: avatarUrl },
    };
  }

  // ─── TOGGLE USER STATUS (Admin) ──────────────────────
  async toggleStatus(id: string) {
    const user = await this.findById(id);
    const updated =
      await this.usersRepository.toggleStatus(user);

    return {
      message: `User ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updated,
    };
  }

  // ─── DELETE USER (Admin) ─────────────────────────────
  async remove(id: string) {
    const user = await this.findById(id);
    await this.usersRepository.delete(user);
    return {
      message: 'User deleted successfully',
    };
  }

  // ─── GET STATS (Admin) ───────────────────────────────
  async getStats() {
    const stats = await this.usersRepository.getStats();
    return {
      message: 'User statistics',
      data: stats,
    };
  }
}