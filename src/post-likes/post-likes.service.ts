import { Injectable, InternalServerErrorException, NotFoundException, ConflictException } from '@nestjs/common';
import { db } from 'src/db';
import { likes, selectLikes } from 'src/db/schema';  // Assuming selectLikes is a type, not a function
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class LikesService {
  // Add a like to a post
  async addLike(postId: number, userId: number): Promise<any> { try {
    // Perform the select query to check if a like exists for the given postId and userId
    const [existingLike] = await db
      .select()
      .from(likes)
      .where(
        sql`${likes.inventory_id} = ${postId} AND ${likes.user_id} = ${userId}`
      )
      .execute();

    if (existingLike) {
      console.log("Like exists for this post and user");
      return true; // User has already liked this post
    } else {
      console.log("No like exists for this post and user");
      
      console.log("liked post");
      const [newLike] = await db
        .insert(likes)
        .values({
          inventory_id: postId,
          user_id: userId,
        })
        .returning(); // This will return the inserted like

      return newLike;
    }
  } catch (error) {
    console.error("Error checking like for the post:", error);
    throw new InternalServerErrorException("Failed to check like for the post");
  }
  }

  // Get all likes for a post
  async getLikesForPost(postId: number): Promise<selectLikes[] | null> {
    console.log(postId);
    try {
      const likesForPost = await db
        .select()
        .from(likes)
        .where(eq(likes.inventory_id, postId)) // Filter likes by post_id
        .execute();
        if(likesForPost.length<1){
          console.log('null');
        }
        
      return likesForPost.length > 0 ? likesForPost : null;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch likes for the post');
    }
  }

  // Delete a like for a post (by post_id and user_id)
  async deleteLike(postId: number, userId: number): Promise<void> {
    try {
      const result = await db
        .delete(likes) // Specify the 'likes' table
        .where(eq(likes.inventory_id, postId) && eq(likes.user_id, userId)) // Combine the conditions using `&&`
        .execute();

      if (result.count === 0) {
        throw new NotFoundException(`Like not found for post ${postId} by user ${userId}`);
      }
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete like');
    }
  }

  // Check if a user has liked a post
  async hasUserLikedPost(postId: number, userId: number): Promise<boolean> {
    try {
      // Check if the like exists for the given post_id and user_id
          const result = await db
              .select()
              .from(likes)
              .where(
                sql`${likes.inventory_id} = (${postId}) AND ${likes.user_id} = (${userId})`
              )
              .execute();

      // If result.length > 0, it means the user has liked the post
      return result.length > 0;
    } catch (error) {
      throw new InternalServerErrorException('Failed to check like status');
    }
  }
}
