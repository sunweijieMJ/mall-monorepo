import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CompanyAddressService } from './company-address.service';
import { CreateCompanyAddressDto } from './dto/create-company-address.dto';
import { UpdateCompanyAddressDto } from './dto/update-company-address.dto';

@ApiTags('管理端-公司收发货地址')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'companyAddress', version: '1' })
export class CompanyAddressController {
  constructor(private readonly service: CompanyAddressService) {}

  @Post('create')
  @ApiOperation({ summary: '添加公司收发货地址' })
  create(@Body() dto: CreateCompanyAddressDto) {
    return this.service.create(dto);
  }

  @Post('update/:id')
  @ApiOperation({ summary: '修改公司收发货地址' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCompanyAddressDto,
  ) {
    return this.service.update(id, dto);
  }

  @Post('delete/:id')
  @ApiOperation({ summary: '删除公司收发货地址' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }

  @Get('list')
  @ApiOperation({ summary: '获取公司收发货地址列表' })
  list() {
    return this.service.list();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取公司收发货地址详情' })
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.getItem(id);
  }
}
