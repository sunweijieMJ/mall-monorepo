import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';
import { HandleReturnApplyDto } from './handle-return-apply.dto';

/** 更新退货申请状态 DTO（通过 body 传递 ID，复用 HandleReturnApplyDto 字段） */
export class UpdateReturnStatusDto extends HandleReturnApplyDto {
  @ApiProperty({ description: '退货申请ID', type: 'integer' })
  @IsInt()
  @IsNotEmpty()
  id: number;
}
