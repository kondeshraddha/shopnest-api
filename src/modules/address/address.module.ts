import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { AddressRepository } from './address.repository';
import { Address } from './entities/address.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([Address]),
  ],
  controllers: [AddressController],
  providers: [AddressService, AddressRepository],
  exports: [AddressService, AddressRepository],
})
export class AddressModule {}