import { validate } from 'class-validator';
import { IsStrongPassword } from '@/common/validators/password-strength.validator';

class TestDto {
  @IsStrongPassword()
  password: unknown;
}

function createDto(password: unknown): TestDto {
  const dto = new TestDto();
  dto.password = password;
  return dto;
}

describe('IsStrongPassword', () => {
  it('合规密码 → 通过', async () => {
    const errors = await validate(createDto('Admin123'));
    expect(errors).toHaveLength(0);
  });

  it('包含特殊字符的合规密码 → 通过', async () => {
    const errors = await validate(createDto('Admin@123456'));
    expect(errors).toHaveLength(0);
  });

  it('缺少大写字母 → 失败', async () => {
    const errors = await validate(createDto('admin123'));
    expect(errors).toHaveLength(1);
  });

  it('缺少小写字母 → 失败', async () => {
    const errors = await validate(createDto('ADMIN123'));
    expect(errors).toHaveLength(1);
  });

  it('缺少数字 → 失败', async () => {
    const errors = await validate(createDto('AdminPass'));
    expect(errors).toHaveLength(1);
  });

  it('长度不足 8 位 → 失败', async () => {
    const errors = await validate(createDto('Ad1'));
    expect(errors).toHaveLength(1);
  });

  it('null → 失败', async () => {
    const errors = await validate(createDto(null));
    expect(errors).toHaveLength(1);
  });

  it('undefined → 失败', async () => {
    const errors = await validate(createDto(undefined));
    expect(errors).toHaveLength(1);
  });

  it('空字符串 → 失败', async () => {
    const errors = await validate(createDto(''));
    expect(errors).toHaveLength(1);
  });

  it('错误消息正确', async () => {
    const errors = await validate(createDto('weak'));
    expect(errors[0].constraints).toBeDefined();
    const msg = Object.values(errors[0].constraints!)[0];
    expect(msg).toContain('8 位');
  });
});
