import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsStrongPassword } from '@/common/validators/password-strength.validator';

/** 超管重置管理员密码 DTO（无需旧密码） */
export class ResetAdminPasswordDto {
  @ApiProperty({ description: '新密码（至少 8 位，包含大小写字母和数字）' })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  newPassword: string;
}
