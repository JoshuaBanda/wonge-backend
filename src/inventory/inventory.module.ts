import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { NotificationService } from 'src/notification/notification.service';
import { JwtAuthGuard } from './guard';
import { JwtModule } from '@nestjs/jwt';

@Module({  imports: [
  JwtModule.register({
    secret: 'your-jwt-secret', // Make sure to configure your JWT module with the secret or use .env variables
    signOptions: { expiresIn: '1h' },
  }),
],
  controllers: [InventoryController],
  providers: [InventoryService,NotificationService,JwtAuthGuard],
})
export class InventoryModule {}
