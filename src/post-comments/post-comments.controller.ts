import { Controller, Get, Post, Body, Param, Delete, HttpException, HttpStatus, Patch } from '@nestjs/common';
import { PostCommentsService } from './post-comments.service';
import { insertComments, selectComments } from 'src/db/schema';

@Controller('post-comments')
export class PostCommentsController {
  constructor(private readonly postCommentsService: PostCommentsService) {}

  @Post('create')
  async createPostComment(@Body() createPostCommentDto: insertComments) {
    try {
      const result = await this.postCommentsService.addComment(createPostCommentDto);
      return result;
    } catch (error) {
      throw new HttpException('Failed to create post comment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':postId')
  async getPostComments(@Param('postId') postId: number): Promise<selectComments[]> {
    try {
      return await this.postCommentsService.getCommentsByPost(postId);
    } catch (error) {
      throw new HttpException('No comments found for this post', HttpStatus.NOT_FOUND);
    }
  }

  @Delete(':commentId')
  async deletePostComment(@Param('commentId') commentId: number) {
    try {
      await this.postCommentsService.deleteComment(commentId);
      return { message: 'Comment deleted successfully' };
    } catch (error) {
      throw new HttpException('Failed to delete comment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
 
  }

    // Add updateComment method
    @Patch(':commentId')
    async updatePostComment(
      @Param('commentId') commentId: number,   // ID of the comment to update
      @Body('comment') newComment: string      // New comment content
    ): Promise<selectComments | null> {
      try {
        const updatedComment = await this.postCommentsService.updateComment(commentId, newComment);
        return updatedComment;
      } catch (error) {
        throw new HttpException('Failed to update comment', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
}
