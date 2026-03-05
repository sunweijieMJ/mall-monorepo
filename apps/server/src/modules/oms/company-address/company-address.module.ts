import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyAddressEntity } from './infrastructure/persistence/relational/entities/company-address.entity';
import { CompanyAddressService } from './company-address.service';
import { CompanyAddressController } from './company-address.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyAddressEntity])],
  controllers: [CompanyAddressController],
  providers: [CompanyAddressService],
})
export class CompanyAddressModule {}
