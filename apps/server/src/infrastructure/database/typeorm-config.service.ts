import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { AllConfigType } from '@/config/config.type';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService<AllConfigType>) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const nodeEnv = this.configService.get('app.nodeEnv', { infer: true });
    const synchronize = this.configService.get('database.synchronize', {
      infer: true,
    });

    // 生产环境严禁开启 synchronize，防止意外 DDL 变更导致数据丢失
    if (nodeEnv === 'production' && synchronize) {
      throw new Error(
        '[TypeORM] DATABASE_SYNCHRONIZE=true 不允许在生产环境使用，请使用 migration:run 执行数据库迁移',
      );
    }

    return {
      type:
        (this.configService.get('database.type', {
          infer: true,
        }) as 'postgres') ?? 'postgres',
      url: this.configService.get('database.url', { infer: true }),
      host: this.configService.get('database.host', { infer: true }),
      port: this.configService.get('database.port', { infer: true }),
      username: this.configService.get('database.username', { infer: true }),
      password: this.configService.get('database.password', { infer: true }),
      database: this.configService.get('database.name', {
        infer: true,
      }) as string,
      synchronize,
      dropSchema: false,
      logging: nodeEnv === 'development',
      // 超过 1s 的查询自动打印日志，便于排查 N+1 和慢 SQL
      maxQueryExecutionTime: 1000,
      entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      extra: {
        // 连接池上限，防止高并发时耗尽数据库连接
        max: this.configService.get('database.maxConnections', { infer: true }),
        ssl: this.configService.get('database.sslEnabled', { infer: true })
          ? {
              rejectUnauthorized: this.configService.get(
                'database.rejectUnauthorized',
                { infer: true },
              ),
              ca:
                this.configService.get('database.ca', { infer: true }) ??
                undefined,
              key:
                this.configService.get('database.key', { infer: true }) ??
                undefined,
              cert:
                this.configService.get('database.cert', { infer: true }) ??
                undefined,
            }
          : undefined,
      },
    };
  }
}
