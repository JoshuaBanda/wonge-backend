import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { EmailModule } from 'src/email/email.module';
import { EmailService } from 'src/email/email.service';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService,EmailService],
  imports:[EmailModule]
})
export class NotificationModule {}
