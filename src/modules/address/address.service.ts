import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AddressRepository } from './address.repository';
import {
  CreateAddressDto,
  UpdateAddressDto,
} from './dto/address.dto';

@Injectable()
export class AddressService {
  // Max addresses per user
  private readonly MAX_ADDRESSES = 10;

  constructor(
    private readonly addressRepository: AddressRepository,
  ) {}

  // ─── GET ALL MY ADDRESSES ─────────────────────────────
  async findAll(userId: string) {
    const addresses =
      await this.addressRepository.findAllByUserId(userId);

    return {
      message: 'Addresses fetched successfully',
      data: addresses,
    };
  }

  // ─── GET SINGLE ADDRESS ───────────────────────────────
  async findOne(id: string, userId: string) {
    const address =
      await this.addressRepository.findUserAddress(
        id, userId,
      );

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return {
      message: 'Address fetched successfully',
      data: address,
    };
  }

  // ─── ADD NEW ADDRESS ──────────────────────────────────
  async create(userId: string, dto: CreateAddressDto) {

    // Check max addresses limit
    const count =
      await this.addressRepository.countUserAddresses(
        userId,
      );

    if (count >= this.MAX_ADDRESSES) {
      throw new BadRequestException(
        `Maximum ${this.MAX_ADDRESSES} addresses allowed. Please delete one first.`,
      );
    }

    // If setting as default remove other defaults first
    if (dto.isDefault) {
      await this.addressRepository.removeAllDefaults(
        userId,
      );
    }

    // If first address, auto set as default
    const isFirstAddress = count === 0;
    const address = await this.addressRepository.create(
      userId,
      {
        ...dto,
        isDefault: dto.isDefault || isFirstAddress,
      },
    );

    return {
      message: 'Address added successfully',
      data: address,
    };
  }

  // ─── UPDATE ADDRESS ───────────────────────────────────
  async update(
    id: string,
    userId: string,
    dto: UpdateAddressDto,
  ) {
    const address =
      await this.addressRepository.findUserAddress(
        id, userId,
      );

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    // If setting as default remove others first
    if (dto.isDefault) {
      await this.addressRepository.removeAllDefaults(
        userId,
      );
    }

    const updated =
      await this.addressRepository.update(address, dto);

    return {
      message: 'Address updated successfully',
      data: updated,
    };
  }

  // ─── SET DEFAULT ADDRESS ──────────────────────────────
  async setDefault(id: string, userId: string) {
    const address =
      await this.addressRepository.findUserAddress(
        id, userId,
      );

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    // Remove default from all addresses first
    await this.addressRepository.removeAllDefaults(userId);

    // Set this address as default
    await this.addressRepository.setDefault(address);

    return {
      message: 'Default address updated successfully',
      data: await this.addressRepository.findUserAddress(
        id, userId,
      ),
    };
  }

  // ─── DELETE ADDRESS ───────────────────────────────────
  async remove(id: string, userId: string) {
    const address =
      await this.addressRepository.findUserAddress(
        id, userId,
      );

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    const wasDefault = address.isDefault;
    await this.addressRepository.delete(address);

    // If deleted address was default
    // set another address as default
    if (wasDefault) {
      const remaining =
        await this.addressRepository.findAllByUserId(
          userId,
        );

      if (remaining.length > 0) {
        await this.addressRepository.setDefault(
          remaining[0],
        );
      }
    }

    return {
      message: 'Address deleted successfully',
    };
  }

  // ─── GET DEFAULT ADDRESS ──────────────────────────────
  async getDefault(userId: string) {
    const address =
      await this.addressRepository.findDefault(userId);

    if (!address) {
      throw new NotFoundException(
        'No default address found. Please add an address.',
      );
    }

    return {
      message: 'Default address fetched',
      data: address,
    };
  }
}