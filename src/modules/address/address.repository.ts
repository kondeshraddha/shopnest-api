import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Address } from './entities/address.entity';
import {
  CreateAddressDto,
  UpdateAddressDto,
} from './dto/address.dto';

@Injectable()
export class AddressRepository {
  constructor(
    @InjectModel(Address)
    private addressModel: typeof Address,
  ) {}

  // ─── FIND ALL USER ADDRESSES ──────────────────────────
  async findAllByUserId(userId: string) {
    return this.addressModel.findAll({
      where: { userId },
      order: [
        ['isDefault', 'DESC'], // default first
        ['createdAt', 'DESC'],
      ],
    });
  }

  // ─── FIND BY ID ──────────────────────────────────────
  async findById(id: string) {
    return this.addressModel.findByPk(id);
  }

  // ─── FIND USER ADDRESS BY ID ──────────────────────────
  async findUserAddress(id: string, userId: string) {
    return this.addressModel.findOne({
      where: { id, userId },
    });
  }

  // ─── FIND DEFAULT ADDRESS ─────────────────────────────
  async findDefault(userId: string) {
    return this.addressModel.findOne({
      where: { userId, isDefault: true },
    });
  }

  // ─── REMOVE DEFAULT FROM ALL ──────────────────────────
  // Call before setting new default
  async removeAllDefaults(userId: string) {
    await this.addressModel.update(
      { isDefault: false },
      { where: { userId } },
    );
  }

  // ─── COUNT USER ADDRESSES ─────────────────────────────
  async countUserAddresses(userId: string) {
    return this.addressModel.count({
      where: { userId },
    });
  }

  // ─── CREATE ──────────────────────────────────────────
  async create(userId: string, dto: CreateAddressDto) {
    return this.addressModel.create({
      ...dto,
      userId,
    } as any);
  }

  // ─── UPDATE ──────────────────────────────────────────
  async update(address: Address, dto: UpdateAddressDto) {
    return address.update(dto);
  }

  // ─── SET DEFAULT ─────────────────────────────────────
  async setDefault(address: Address) {
    return address.update({ isDefault: true });
  }

  // ─── DELETE ──────────────────────────────────────────
  async delete(address: Address) {
    await address.destroy();
  }
}