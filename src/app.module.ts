import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InventoryModule } from './inventory/inventory.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [InventoryModule, NotificationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
