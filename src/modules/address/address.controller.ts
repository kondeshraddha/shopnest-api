import {
  Controller, Get, Post, Patch,
  Delete, Body, Param,
  ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiBearerAuth, ApiOperation,
} from '@nestjs/swagger';
import { AddressService } from './address.service';
import {
  CreateAddressDto,
  UpdateAddressDto,
} from './dto/address.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Addresses')
@ApiBearerAuth()
@Controller('addresses')
export class AddressController {
  constructor(
    private readonly addressService: AddressService,
  ) {}

  // ─── GET ALL MY ADDRESSES ─────────────────────────────
  @Get()
  @ApiOperation({ summary: 'Get all my addresses' })
  findAll(@CurrentUser('id') userId: string) {
    return this.addressService.findAll(userId);
  }

  // ─── GET DEFAULT ADDRESS ──────────────────────────────
  @Get('default')
  @ApiOperation({ summary: 'Get my default address' })
  getDefault(@CurrentUser('id') userId: string) {
    return this.addressService.getDefault(userId);
  }

  // ─── GET SINGLE ADDRESS ───────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Get address by ID' })
  findOne(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.addressService.findOne(id, userId);
  }

  // ─── ADD NEW ADDRESS ──────────────────────────────────
  @Post()
  @ApiOperation({ summary: 'Add new address' })
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAddressDto,
  ) {
    return this.addressService.create(userId, dto);
  }

  // ─── UPDATE ADDRESS ───────────────────────────────────
  @Patch(':id')
  @ApiOperation({ summary: 'Update address' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressService.update(id, userId, dto);
  }

  // ─── SET DEFAULT ─────────────────────────────────────
  @Patch(':id/default')
  @ApiOperation({ summary: 'Set as default address' })
  setDefault(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.addressService.setDefault(id, userId);
  }

  // ─── DELETE ADDRESS ───────────────────────────────────
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete address' })
  remove(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.addressService.remove(id, userId);
  }
}
