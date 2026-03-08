import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CompanyAddressVo } from './vo/company-address.vo';
import { AuthGuard } from '@nestjs/passport';
import { CompanyAddressService } from './company-address.service';
import { CreateCompanyAddressDto } from './dto/create-company-address.dto';
import { UpdateCompanyAddressDto } from './dto/update-company-address.dto';

@ApiTags('admin-company-address')
@ApiBearerAuth('admin-jwt')
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'admin/oms/company-addresses', version: '1' })
export class CompanyAddressController {
  constructor(private readonly service: CompanyAddressService) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '添加公司收发货地址' })
  @ApiOkResponse({ type: CompanyAddressVo })
  create(@Body() dto: CreateCompanyAddressDto) {
    return this.service.create(dto);
  }

  @Put('update/:id')
  @ApiOperation({ summary: '修改公司收发货地址' })
  @ApiParam({ name: 'id', description: '收货地址ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCompanyAddressDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: '删除公司收发货地址' })
  @ApiParam({ name: 'id', description: '收货地址ID', type: 'integer' })
  @ApiOkResponse({ type: Number, description: '受影响的行数' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }

  @Get('list')
  @ApiOperation({ summary: '获取公司收发货地址列表' })
  @ApiOkResponse({ type: [CompanyAddressVo] })
  list() {
    return this.service.list();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取公司收发货地址详情' })
  @ApiParam({ name: 'id', description: '收货地址ID', type: 'integer' })
  @ApiOkResponse({ type: CompanyAddressVo })
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.getItem(id);
  }
}
