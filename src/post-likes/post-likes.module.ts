import { Module } from '@nestjs/common';
import { LikesService } from './post-likes.service';
import { PostLikesController } from './post-likes.controller';

@Module({
  controllers: [PostLikesController],
  providers: [LikesService],
})
export class PostLikesModule {}
