import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from 'src/db';  // Assuming 'db' is the instance of Drizzle ORM
import { insertNotification, notification, selectNotification } from 'src/db/schema';

@Injectable()
export class NotificationService {
  // Fetch all notifications for a specific recipient
  async getNotificationsByRecipient(recipientId: number): Promise<selectNotification[]> {
    try {
      // Query notifications where the recipient matches the provided ID
      return await db
        .select()
        .from(notification)
        .where(eq(notification.recipientId,recipientId))
        .orderBy(notification.created_at); // Optionally order by creation date
    } catch (error) {
      throw new Error(`Error fetching notifications: ${error.message}`);
    }
  }

  // Create a new notification for a recipient
  async createNotification(data: insertNotification): Promise<selectNotification> {
    try {
      // Insert a new notification record into the database
      const [newNotification] = await db
        .insert(notification)
        .values(data)
        .returning();  // Return the inserted notification record
      return newNotification;
    } catch (error) {
      throw new Error(`Error creating notification: ${error.message}`);
    }
  }

  // Update the status of a notification (e.g., mark as "seen")
  async updateNotificationStatus(id: number, status: string): Promise<selectNotification> {
    try {
      // Update the status of the notification
      const [updatedNotification] = await db
        .update(notification)
        .set({ status })
        .where(eq(notification.id,id))
        .returning(); // Return the updated notification
      return updatedNotification;
    } catch (error) {
      throw new Error(`Error updating notification status: ${error.message}`);
    }
  }


  // Function to create notifications for a list of friends (passed as an argument)
async createNotificationsForFriends(friendsToRecieveNotifications: number[]) {
  const notificationMessage = "You have a new notification";  // Notification message
  const status = "sent";  // Status for the notification

 // console.log('createNotificationsForFriends to :',friendsToRecieveNotifications);

  try {
    // Loop through the list of user IDs and create a notification for each
    const notifications = await Promise.all(
      friendsToRecieveNotifications.map(async (recipientId) => {
        const data = {
          recipientId,    // The recipient's user ID
          notification: notificationMessage, // The notification message
          status: status, // The status of the notification
        };

        // Call the createNotification function to create the notification for each user
        return await this.createNotification(data);
      })
    );

  //  console.log('Notifications created:', notifications);
  } catch (error) {
    console.error('Error creating notifications:', error);
  }
}


}
