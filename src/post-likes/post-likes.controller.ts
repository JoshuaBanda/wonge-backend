import { Controller, Get, Post, Body, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { LikesService } from './post-likes.service';
import { insertLikes, selectLikes } from 'src/db/schema';

@Controller('post-likes')
export class PostLikesController {
  constructor(private readonly postLikesService: LikesService) {}

  @Post('like')
  async likePost(@Body() createPostLikeDto: any) {
    const {postId,userId}=createPostLikeDto;
    try {
      const result = await this.postLikesService.addLike(postId,userId);
      return result;
    } catch (error) {
      throw new HttpException('Failed to like post', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':postId')
  async getPostLikes(@Param('postId') postId: number): Promise<selectLikes[]> {
    try {
      const result= await this.postLikesService.getLikesForPost(postId);

      return result ?? [];
    } catch (error) {
      throw new HttpException('No likes found for this post', HttpStatus.NOT_FOUND);
    }
  }

  @Delete(':postId/:userId')
  async unlikePost(@Param('postId') postId: number, @Param('userId') userId: number) {
    try {
      await this.postLikesService.deleteLike(postId, userId);
      return { message: 'Like removed successfully' };
    } catch (error) {
      throw new HttpException('Failed to remove like', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // **New Endpoint**: Check if a user has liked a post
  @Get('has-liked/:postId/:userId')
  async isUserLikedPost(@Param('postId') postId: number, @Param('userId') userId: number): Promise<boolean> {
    try {
      const isLiked = await this.postLikesService.hasUserLikedPost(postId, userId);
      return isLiked;
    } catch (error) {
      throw new HttpException('Failed to check if user liked post', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
