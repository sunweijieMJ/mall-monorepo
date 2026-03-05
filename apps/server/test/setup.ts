// 必须在任何 entity 被 import 之前引入，保证 TypeORM 装饰器元数据正确注册
import 'reflect-metadata';

// 集成测试所需的最小环境变量（ConfigModule.forRoot 校验时使用）
process.env.AUTH_JWT_SECRET = 'test-jwt-secret-do-not-use-in-production';
process.env.AUTH_JWT_TOKEN_EXPIRES_IN = '1h';
