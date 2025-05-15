import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { insertNotification, selectNotification } from 'src/db/schema';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // Get notifications for a recipient
  @Get(':recipientId')
  async getNotifications(@Param('recipientId') recipientId: number): Promise<selectNotification[]> {
    return this.notificationService.getNotificationsByRecipient(recipientId);
  }

  // Create a new notification
  @Post()
  async createNotification(@Body() data: insertNotification): Promise<selectNotification> {
    return this.notificationService.createNotification(data);
  }

  // Update the status of a notification (e.g., mark as "seen")
  @Put(':id')
  async updateNotificationStatus(
    @Param('id') id: number,
    @Body('status') status: string,
  ): Promise<selectNotification> {
    return this.notificationService.updateNotificationStatus(id, status);
  }

  @Post('notify-customer')
  async postEmailForOrderingProduct(@Body()createNotificationDto:CreateNotificationDto){
    try{
      const result= await this.notificationService.notifyOrder(createNotificationDto);
    }
    catch(error){console.error(error)}
  }
}
