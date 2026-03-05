import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity } from '@/core/auth/infrastructure/persistence/relational/entities/session.entity';
import { CleanupSessionsTask } from './tasks/cleanup-sessions.task';
import { CleanupTokenBlacklistTask } from './tasks/cleanup-token-blacklist.task';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([SessionEntity]),
  ],
  providers: [CleanupSessionsTask, CleanupTokenBlacklistTask],
})
export class SchedulerModule {}
