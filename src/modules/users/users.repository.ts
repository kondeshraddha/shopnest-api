import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../../common/utils/pagination.util';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,

    @InjectModel(UserProfile)
    private profileModel: typeof UserProfile,
  ) {}

  // ─── FIND ALL USERS ──────────────────────────────────
  async findAll(pagination: PaginationDto) {
    const {
      limit,
      offset,
      search,
      sortBy,
      sortDir,
    } = pagination;

    const where: any = {};

    // Search by name or email
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName:  { [Op.iLike]: `%${search}%` } },
        { email:     { [Op.iLike]: `%${search}%` } },
      ];
    }

    return this.userModel.findAndCountAll({
      where,
      include: [
        {
          model: UserProfile,
          as: 'profile',
          required: false,
        },
      ],
      limit,
      offset,
      order: [[sortBy || 'createdAt', sortDir || 'DESC']],
      attributes: { exclude: ['password'] },
    });
  }

  // ─── FIND BY ID ──────────────────────────────────────
  async findById(id: string) {
    return this.userModel.findByPk(id, {
      include: [
        {
          model: UserProfile,
          as: 'profile',
          required: false,
        },
      ],
      attributes: { exclude: ['password'] },
    });
  }

  // ─── FIND BY EMAIL ───────────────────────────────────
  async findByEmail(email: string) {
    return this.userModel.findOne({
      where: { email },
    });
  }

  // ─── CHECK EMAIL EXISTS ──────────────────────────────
  async emailExists(
    email: string,
    excludeId?: string,
  ) {
    const where: any = { email };
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }
    const user = await this.userModel.findOne({ where });
    return !!user;
  }

  // ─── CREATE USER ─────────────────────────────────────
  async create(dto: CreateUserDto) {
    return this.userModel.create(dto as any);
  }

  // ─── UPDATE USER ─────────────────────────────────────
  async update(user: User, dto: Partial<UpdateUserDto>) {
    const {
      bio,
      dateOfBirth,
      gender,
      website,
      ...userFields
    } = dto;

    // Update user table
    await user.update(userFields);

    // Update profile table if profile fields sent
    if (bio || dateOfBirth || gender || website) {
      await this.profileModel.upsert({
        userId: user.id,
        bio,
        dateOfBirth,
        gender,
        website,
      });
    }

    // Return updated user with profile
    return this.findById(user.id);
  }

  // ─── UPDATE AVATAR ───────────────────────────────────
  async updateAvatar(user: User, avatarUrl: string) {
    return user.update({ avatar: avatarUrl });
  }

  // ─── TOGGLE STATUS ───────────────────────────────────
  async toggleStatus(user: User) {
    return user.update({ isActive: !user.isActive });
  }

  // ─── DELETE USER ─────────────────────────────────────
  async delete(user: User) {
    await user.destroy();
  }

  // ─── GET STATS ───────────────────────────────────────
  async getStats() {
    const [total, active, admins, customers, vendors] =
      await Promise.all([
        this.userModel.count(),
        this.userModel.count({
          where: { isActive: true },
        }),
        this.userModel.count({
          where: { role: 'admin' },
        }),
        this.userModel.count({
          where: { role: 'customer' },
        }),
        this.userModel.count({
          where: { role: 'vendor' },
        }),
      ]);

    return {
      total,
      active,
      inactive: total - active,
      admins,
      customers,
      vendors,
    };
  }
}