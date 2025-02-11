import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { db } from 'src/db';
import { comments, insertComments, selectComments, usersTable, inventory, selectInventory, selectUsers } from 'src/db/schema';
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class PostCommentsService {
  
  // Add a comment to a post
  async addComment(data: insertComments): Promise<selectComments> {
    try {
      // Insert a new comment and return the inserted comment
      const [comment] = await db
        .insert(comments)
        .values({
          comment: data.comment,  // Only include the necessary fields
          inventory_id: data.inventory_id,  // Make sure to pass the post ID
          user_id: data.user_id,  // Make sure to pass the user ID
        })
        .returning();  // Return the inserted row, including `comment_id`
  
      return comment;  // Return the created comment
    } catch (error) {
      console.error('Error inserting comment:', error);  // Log the error for debugging
      throw new InternalServerErrorException('Failed to add comment');
    }
  }
  

  // Get all comments for a specific post
  async getCommentsByPost(postId: selectInventory['id']): Promise<any | null> {
    try {
      // Retrieve all comments for the given post
      const commentsResult = await db
        .select()
        .from(comments)
        .where(eq(comments.inventory_id, postId)) // Filter by post_id
        .execute();
  
      // If no comments are found, return null
      if (commentsResult.length === 0) {
        return null;
      }
  
      // Fetch user information for each comment
      const commentsWithUserInfo = await Promise.all(
        commentsResult.map(async (comment) => {
          const [user] = await db
            .select({ username: usersTable.firstname, lastname: usersTable.lastname, profilepicture: usersTable.profilepicture })
            .from(usersTable)
            .where(eq(usersTable.userid, comment.user_id)) // Join with usersTable to get the user's info
            .execute();
  
          return {
            ...comment, // Add all comment fields
            username: user ? `${user.username} ${user.lastname}` : 'Anonymous', // Use username and lastname
            profilepicture: user ? user.profilepicture : null, // Include profile picture
          };
        })
      );
  
      return commentsWithUserInfo; // Return comments along with the user info
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve comments with user information');
    }
  }
  

  // Get a comment by its ID
  async getCommentById(commentId: selectComments['comment_id']): Promise<selectComments | null> {
    try {
      const [comment] = await db
        .select()
        .from(comments)
        .where(eq(comments.comment_id, commentId))
        .execute();

      return comment || null; // Return the comment if found, else null
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve comment');
    }
  }

  // Get comments by a user
  async getCommentsByUser(userId: selectUsers['userid']): Promise<selectComments[] | null> {
    try {
      const result = await db
        .select()
        .from(comments)
        .where(eq(comments.user_id, userId)) // Filter by user_id
        .execute();

      return result.length > 0 ? result : null; // Return user's comments or null
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve comments by user');
    }
  }

  // Delete a comment by ID
async deleteComment(commentId: selectComments['comment_id']): Promise<void> {
  try {
    const result = await db
      .delete(comments) // Specify the table (comments)
      .where(eq(comments.comment_id, commentId)) // Add the where condition
      .execute(); // Execute the delete query

    if (result.count === 0) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }
  } catch (error) {
    throw new InternalServerErrorException('Failed to delete comment');
  }
}


  // Edit a comment
  async updateComment(
    commentId: selectComments['comment_id'],
    newComment: string
  ): Promise<selectComments | null> {
    try {
      // Update the comment content
      const result = await db
        .update(comments)
        .set({ comment: newComment })
        .where(eq(comments.comment_id, commentId))
        .returning();

      if (result.length === 0) {
        throw new NotFoundException(`Comment with ID ${commentId} not found`);
      }

      return result[0]; // Return the updated comment
    } catch (error) {
      throw new InternalServerErrorException('Failed to update comment');
    }
  }

  // Get comments for a post with user info (join users table)
  async getCommentsWithUserInfo(postId: selectInventory['id']): Promise<any> {
    try {
      const result = await db
        .select({
          comment_id: comments.comment_id,
          comment: comments.comment,
          user_id: comments.user_id,
          firstname: usersTable.firstname,
          lastname: usersTable.lastname,
          profilepicture: usersTable.profilepicture,
        })
        .from(comments)
        .leftJoin(usersTable, eq(comments.user_id, usersTable.userid)) // Left join to get user info
        .where(eq(comments.inventory_id, postId)) // Filter by post ID
        .execute();

      return result.length > 0 ? result : null; // Return comments with user info or null
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve comments with user info');
    }
  }
}
