import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { selectInventory, inventory, usersTable, insertInventory, selectUsers, inboxParticipantsTable } from 'src/db/schema';
import { eq, gt, inArray, not, sql } from 'drizzle-orm';
import { db } from 'src/db';
import { InventoryItemTracker } from './inventoryItem-tracker';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import { NotificationService } from 'src/notification/notification.service';
import { Inventory } from './entities/inventory.entity';

@Injectable()
export class InventoryService {
  private inventoryItemTracker: InventoryItemTracker;
  // User-specific cache for inventoryItems
  private userCaches: Map<number, (selectInventory & { username: string; lastname: string; profilepicture: string })[]> =
    new Map();

  constructor(
    
  private readonly notificationService: NotificationService,
  ) {
    
    v2.config({
      cloud_name: 'djhmilu3h',
      api_key: '719851176349863',
      api_secret: 'Xo1sUcugo5D8Pz-z9WOO1muFfZk',
    });
    this.inventoryItemTracker = new InventoryItemTracker();
    
  }
 

  async getInventories(
    userId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<(selectInventory & { username: string; lastname: string; profilepicture: string })[] | null> {
    try {
      const offset = (page - 1) * limit;
  
      const cachedInventoryItems = this.userCaches.get(userId) || [];
      
      // Filter out items that have already been sent
      const unsentCachedInventoryItems = cachedInventoryItems.filter(
        (inventoryItem) => !this.inventoryItemTracker.getSentInventoryItemIds(userId).includes(inventoryItem.id)
      );
  
      // If unsent inventoryItems are available in the cache, return them
      if (unsentCachedInventoryItems.length > 0) {
        //console.log(`Returning ${unsentCachedinventoryItems.length} cached inventoryItemss for user ${userId}`);
        const paginatedInventoryItems = unsentCachedInventoryItems.slice(offset, offset + limit);
        this.inventoryItemTracker.markInventoryItemsAsSent(userId, paginatedInventoryItems); // Mark inventoryItems as sent
        return paginatedInventoryItems;
      }
  
      // If no unsent inventoryItems are found, fetch new inventoryItems from the database
      //console.log(`No unsent cached inventoryItems for user ${userId}`);
      
      const results = await db
        .select()
        .from(inventory)
        .where(not(inArray(inventory.id, this.inventoryItemTracker.getSentInventoryItemIds(userId)))) // Filter out already sent inventoryItems
        .limit(limit)
        .offset(offset)
        .execute();
  
      if (results.length === 0) {
        //console.log(`No new inventoryItems available for user ${userId}. Clearing tracker.`);
        this.inventoryItemTracker.clearSentInventoryItems(userId); // Clear the tracker if no new inventoryItems are found
        return null; // Return null when no new inventoryItems are available
      }
  
      // Append new inventoryItems to the cache and mark them as sent
      const inventoryItemsWithUserDetails = await this.fetchInventoryItemsWithUserDetails(results);
      //console.log(`Updating cache and tracker for user ${userId}`);
      
      // Append the new inventoryItems to the existing cache (avoiding overwriting)
      const updatedCache = [...cachedInventoryItems, ...inventoryItemsWithUserDetails];
      this.userCaches.set(userId, updatedCache);
      this.inventoryItemTracker.markInventoryItemsAsSent(userId, results);
  
      return inventoryItemsWithUserDetails;
    } catch (error) {
      console.error(`Error fetching inventoryItems for user ${userId}:`, error);
      throw new InternalServerErrorException('Failed to retrieve inventoryItems');
    }
  }
  
  private async fetchInventoryItemsWithUserDetails(
    inventories: selectInventory[]
  ): Promise<(selectInventory & { username: string; lastname: string; profilepicture: string })[]> {
    return await Promise.all(
      inventories.map(async (inventory) => {
        const [user] = await db
          .select({
            firstname: usersTable.firstname,
            lastname: usersTable.lastname,
            profilepicture: usersTable.photoUrl,
          })
          .from(usersTable)
          .where(eq(usersTable.userid, inventory.user_id))
          .execute();

        return {
          ...inventory,
          username: user ? user.firstname : 'wonge enterprise',
          lastname: user ? user.lastname : '',
          profilepicture: user ? user.profilepicture : '',
        };
      })
    );
  }

  // Method to update the cache for all users
  async updateCache(): Promise<void> {
    //console.log('Updating inventoryItem caches for all users...');

    try {
      const allInventories = await db.select().from(inventory).execute();
      const inventoryItemssWithUserDetails = await this.fetchInventoryItemsWithUserDetails(allInventories);

      // Update cache for each user individually
      this.userCaches.forEach((_, userId) => {
        this.userCaches.set(
          userId,
          inventoryItemssWithUserDetails.filter(
            (inventoryItem) => !this.inventoryItemTracker.getSentInventoryItemIds(userId).includes(inventoryItem.id)
          )
        );
      });

      //console.log('InventoryItem caches updated successfully');
    } catch (error) {
      console.error('Failed to update inventoryItem caches:', error);
    }
  }

  // Schedule the cache update to run every minute
  @Cron(CronExpression.EVERY_5_MINUTES)
  async scheduledCacheUpdate(): Promise<void> {
    await this.updateCache();
  }

  // Clear the cache for a specific user
  clearUserCache(userId: number): void {
    //console.log(`Clearing cache for user ${userId}`);
    this.userCaches.delete(userId);
  }

  // Clear the caches for all users
  clearAllCaches(): void {
    //console.log('Clearing caches for all users');
    this.userCaches.clear();
  }



  //the previous implements
  

  
  async  uploadImage(fileBuffer: Buffer, fileName: string, quality: number): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = v2.uploader.upload_stream(
        {
          resource_type: 'auto',  // Automatically detect file type
          public_id: fileName,    // Use fileName as public_id
          folder: '',    // Optionally specify a folder
          transformation: [
            { width: 800, height: 600, crop: 'limit' },  // Resize to fit within 800x600
            { quality: quality },  // Specify custom quality (e.g., 80)
          ],
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(error);
          }
          if(result){
            resolve(result)
          }
        }
      );
  
      uploadStream.end(fileBuffer); // End the stream with the buffer
    });
  }
  
  

  // Create a new inventoryItem
  async createInventories(data: insertInventory): Promise<selectInventory | null> {
    try {
      const [newInventory] = await db
        .insert(inventory)
        .values(data)
        .returning(); // Returning the newly inserted inventoryItem

        //console.log(newInventoryItem);
        //destructuring the inventoryItem

        const {
          id,
          description,
          photo_url,
          photo_public_id,
          user_id,
          created_at,
        } = newInventory;
    
        // Optionally log the destructured values to check
        /*console.log('Destructured inventoryItem:', {
          id,
          description,
          photo_url,
          photo_public_id,
          user_id,
          created_at,
        });*/

        const friendsToRecieveNotifications=await this.getFriends(user_id);
        console.log('friendsToRecieveNotifications',friendsToRecieveNotifications);
// reminder, come back to this 
        //await this.notificationService.createNotificationsForFriends(friendsToRecieveNotifications);

      return newInventory; // Return the inserted inventoryItem data
    } catch (error) {
      throw new InternalServerErrorException('Failed to create inventoryItem', error);
    }
  }

  // Get a inventoryItem by its ID
  async getInventoryById(inventoryId: selectInventory['id']): Promise<selectInventory | null> {
    try {
      const [inventoryData] = await db
        .select()
        .from(inventory)
        .where(eq(inventory.id, inventoryId))
        .execute();
  
      if (!inventoryData) {
        throw new NotFoundException(`Inventory with ID ${inventoryId} not found`);
      }
  
      return inventoryData;
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve inventoryItem');
    }
  }

  // Get all inventoryItems by a user ID
  async getInventoryItemsByUser(userId: selectUsers['userid']): Promise<(selectInventory & { username: string, lastname: string, profilepicture: string })[] | null> {
    try {
      const results = await db
        .select()
        .from(inventory)
        .where(eq(inventory.user_id, userId))
        .execute();
  
      if (results.length === 0) {
        return null;
      }
  
      const userIdFromInventory = results[0].user_id; // Access user_id from the first inventoryItem
  
      // Fetching the username (firstname, lastname) and profile picture for that user
      const [user] = await db
        .select({
          firstname: usersTable.firstname,
          lastname: usersTable.lastname,
          profilepicture: usersTable.photoUrl,
        })
        .from(usersTable)
        .where(eq(usersTable.userid, userIdFromInventory))
        .execute();
  
      // Map inventoryItems and ensure that every inventoryItem has a username and other fields
      const inventoriesWithUserDetails = results.map(inventories => ({
        ...inventories, // Spread the existing inventoryItem/ fields
        username: user ? user.firstname : 'anonymous', // Query for username (firstname)
        lastname: user ? user.lastname : '', // Query for lastname
        profilepicture: user ? user.profilepicture : '', // Query for profilepicture
      }));
  
      return inventoriesWithUserDetails; // Return inventoryItems with username, lastname, and profile picture
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to retrieve inventory item');
    }
  }

  // Get inventoryItem liked by a user


  // Update a inventoryItem's description
  async updateInventoryItemDescription(inventoryId: selectInventory['id'], newDescription: string): Promise<void> {
    try {
      const result = await db
        .update(inventory)
        .set({ description: newDescription })
        .where(eq(inventory.id, inventoryId));
  
      if (result.count === 0) {
        throw new NotFoundException(`inventory item with ID ${inventoryId} not found`);
      }
  
      return;
    } catch (error) {
      throw new InternalServerErrorException('Failed to update item description');
    }
  }

  // Delete a inventoryItem by ID
  async deleteInventoryItem(inventoryId: selectInventory['id']): Promise<void> {
    try {
      const result = await db
        .delete(inventory)
        .where(eq(inventory.id, inventoryId));

      if (result.count === 0) {
        throw new NotFoundException(`inventoryItem with ID ${inventoryId} not found`);
      }
  
      return;
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete inventoryItem');
    }
  }


  // Delete image from Cloudinary
  async deleteImage(publicId: string): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
        v2.uploader.destroy(publicId, { invalidate: true }, (error, result) => {
            if (error) {
                console.error('Cloudinary delete error:', error); // Log detailed error
                return reject(error);
            }
            //console.log('Cloudinary delete result:', result);
            resolve(result);
        });
    });
  }

  // Update profile picture
  async updateProfilePicture(email: string, profilepicture: string) {
    try {
      if (!email || !profilepicture) {
        throw new Error('Invalid input data');
      }
      //console.log('chec', email, profilepicture);

      // Perform the update operation
      const result = await db
        .update(usersTable)
        .set({ photoUrl: profilepicture })
        .where(eq(usersTable.email, email));

      if (result.count === 0) {
        throw new Error(`No user found with the email: ${email}`);
      }

      return { message: 'Updated successfully', updatedRows: result.count };
    } catch (error) {
      console.error('Error updating :', error);
      throw new Error('Failed to update. Please try again later.');
    }
  }

  
    



    async getFriends(id: number) {
        try {
          // Execute the query
          const result = await db
            .select({
              friendId: sql`CASE 
                              WHEN ${inboxParticipantsTable.firstuserid} = ${id} THEN ${inboxParticipantsTable.seconduserid}
                              WHEN ${inboxParticipantsTable.seconduserid} = ${id} THEN ${inboxParticipantsTable.firstuserid}
                            END`
            })
            .from(inboxParticipantsTable)
            .where(
              sql`(${inboxParticipantsTable.firstuserid} = ${id} OR ${inboxParticipantsTable.seconduserid} = ${id})`
            )
            .execute();
      
          // If no results are found, throw an error
          if (result.length === 0) {
            throw new NotFoundException(`No friends found for user with id: ${id}`);
          }
      
          // Map over the result to extract the 'friendId'
          const friends = result.map((item: { friendId: number | null }) => item.friendId);
      
          // Filter out null values
          return friends.filter(friendId => friendId !== null);
      
        } catch (error) {
          // Handle any errors
          throw new InternalServerErrorException('Failed to retrieve friends');
        }
      }
      


  
}

