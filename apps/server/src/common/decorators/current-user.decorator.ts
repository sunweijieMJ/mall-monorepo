import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 提取当前用户（JWT Payload）
 *
 * @example
 * @Get('me')
 * getProfile(@CurrentUser() user: JwtPayload) { ... }
 *
 * @Get('me')
 * getProfile(@CurrentUser('sub') userId: number) { ... }
 */
export const CurrentUser = createParamDecorator(
  (field: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return field ? user?.[field] : user;
  },
);
