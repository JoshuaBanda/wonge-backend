import { Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { db } from 'src/db';  // Assuming 'db' is the instance of Drizzle ORM
import { cart, insertNotification, inventory, notification, selectNotification, usersTable } from 'src/db/schema';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class NotificationService {
  constructor(
      private emailService: EmailService){}
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


async notifyOrder(data: { user_id: number; inventory_ids: number[] }) {
  const { user_id, inventory_ids } = data;
  console.log(`Processing order for user: ${user_id}, inventory items: ${inventory_ids}`);

  try {
    // Step 1: Fetch user details (username and email)
    
    const user = await this.getUserNameAndEmail(user_id);

    // Step 2: Fetch product names, quantities, and costs
 const products = await this.getInventoryData(inventory_ids);

if (products && products.length > 0) {
  const updatedCarts = await db
    .update(cart)
    .set({ notification: true })
    .where(
      and(
        eq(cart.user_id, user_id),
        inArray(cart.inventory_id, inventory_ids),
        eq(cart.status, 'ordered') // ✅ Optional: ensure only ordered carts are updated
      )
    )
    .returning();

  console.log('Notification status updated for cart items:', updatedCarts.length);
}

    // Default fallback values for customer data
    let customer_name: string = 'Unknown Customer';
    let customer_email: string | null = null;

    // Step 3: Extract user data if available
    if (user) {
      const { username, email } = user;
      customer_name = username;
      customer_email = email || null;
    } else {
      console.error(`User with ID ${user_id} not found.`);
    }

    // Step 4: Ensure products exist and have data
    if (products && products.length > 0) {
      // Step 5: Calculate total cost
      const totalCost = products.reduce((sum, product) => {
        return sum + product.quantity * product.cost; // Calculate total cost for each product
      }, 0);

      // Step 6: Format the product list as "Product Name (xQuantity)"
      //19 may we have added photo to product description
      /*const productDescriptions = products
        .map(p => `{
          description:${p.name} (x${p.quantity})
          photo:${p.photo_url}
          }`)
        .join(', ');
*/
      //console.log(`User: ${customer_name}, Products: ${productDescriptions}, Total Cost: ${totalCost}`);
      
      // Step 7: Ensure customer email is present, then send the email
      if (customer_email) {
        await this.emailService.notifyOrder(
          customer_email,
          //productDescriptions,
          products,
          customer_name,
          totalCost // Send the total cost to email
        );
        //console.log('Order confirmation email sent successfully.');
      } else {
        console.error(`Email is missing for the customer (user: ${customer_name}).`);
      }
    } else {
      console.error('No products found for the given cart IDs.');
    }

  } catch (error) {
    console.error('Error notifying order:', error);
  }
}


async getUserNameAndEmail(user_id: number): Promise<{ username: string; email: string|null } | null> {
  try {
    const result = await db
      .select({
        firstname: usersTable.firstname,
        lastname: usersTable.lastname,
        email: usersTable.email,
      })
      .from(usersTable)
      .where(eq(usersTable.userid, user_id));

    if (result.length > 0) {
      const { firstname, lastname, email } = result[0];
      const username = `${firstname} ${lastname}`;
      return { username, email };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching username and email:", error);
    return null;
  }
}




async getInventoryData(inventory_ids: number[]): Promise<{ name: string; quantity: number; cost: number,photo_url:string }[]> {
  try {
    // Step 1: Get quantities from the cart
    const quantitiesAndIds = await db
      .select({
        quantity: cart.quantity,
        inventoryId: cart.inventory_id, // Ensure inventoryId is selected here
      })
      .from(cart)
      .where(
        and(
          inArray(cart.inventory_id, inventory_ids),
          eq(cart.notification,false)
        )
      );
      


  // Using inventory_ids
      console.log(quantitiesAndIds,"kkkkkkkkkkkkkkkkkk");
    // Step 2: Get inventory details with cost
        //19 may include picture url
    const inventoryDetails = await db
      .select({
        id: inventory.id,
        name: inventory.name,
        cost: inventory.price, 
        photo_url:inventory.photo_url,
      })
      .from(inventory)
      .where(inArray(inventory.id, inventory_ids));  
    // Step 3: Create a lookup map from inventory ID to details

    const inventoryMap = new Map(inventoryDetails.map(item => [item.id, item]));

    // Step 4: Combine quantity with item name and cost (ensuring cost is a number)
    const result = quantitiesAndIds.map(item => {
      const inventoryItem = inventoryMap.get(item.inventoryId);  // Reference the correct field
      return {
        name: inventoryItem?.name || 'Unknown Item',
        quantity: item.quantity,
        cost: Number(inventoryItem?.cost ?? 0),  // Ensure cost is a number
        photo_url:inventoryItem?.photo_url ??'',
      };
    });

    // Return an empty array instead of null
    return result.length > 0 ? result : [];  // Return empty array instead of null
  } catch (error) {
    console.error("Error fetching inventory item names, quantities, and costs:", error);
    return [];  // Return an empty array on error
  }
}



}
