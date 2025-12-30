import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { NovelsModule } from './novels/novels.module';
import { ChaptersModule } from './chapters/chapters.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UserModule } from './user/user.module';
import { ReadingProgressModule } from './reading-progress/reading-progress.module';
import { AdminModule } from './admin/admin.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    NovelsModule,
    ChaptersModule,
    SubscriptionsModule,
    NotificationsModule,
    UserModule,
    ReadingProgressModule,
    AdminModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
