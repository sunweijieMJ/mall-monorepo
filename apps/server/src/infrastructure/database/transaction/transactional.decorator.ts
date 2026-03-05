import { SetMetadata } from '@nestjs/common';

export const TRANSACTIONAL_KEY = 'transactional';

/**
 * 声明式事务装饰器 — 标记在 Controller 方法上，自动包裹事务
 *
 * 用法:
 * ```typescript
 * @Post()
 * @Transactional()
 * create(@Body() dto: CreateProductDto) {
 *   return this.productService.create(dto);
 * }
 * ```
 *
 * 注意：配合 TransactionInterceptor 使用，Service 层需通过
 * TransactionService.getManager() 获取当前事务的 EntityManager
 */
export const Transactional = () => SetMetadata(TRANSACTIONAL_KEY, true);
