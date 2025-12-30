import { Module } from '@nestjs/common';
import { ReadingProgressController } from './reading-progress.controller';
import { ReadingProgressService } from './reading-progress.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ReadingProgressController],
  providers: [ReadingProgressService],
  exports: [ReadingProgressService],
})
export class ReadingProgressModule {}
