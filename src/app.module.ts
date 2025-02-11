import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InventoryModule } from './inventory/inventory.module';
import { NotificationModule } from './notification/notification.module';
import { UsersModule } from './users/users.module';
import { OtpModule } from './otp/otp.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [InventoryModule, NotificationModule, UsersModule, OtpModule, EmailModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
