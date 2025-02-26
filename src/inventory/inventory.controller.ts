import { Body, Controller, Delete, Get, HttpException, HttpStatus, NotFoundException, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { insertInventory, selectInventory } from "src/db/schema";
import { FileInterceptor } from "@nestjs/platform-express";
import { UpdateInventoryDto } from "./dto/update-inventory.dto";
import { JwtAuthGuard } from "./guard";

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService,
  ) {}

  //@UseGuards(JwtAuthGuard) // Apply the guard to protect this route
  @Get()
  async getAllnventories(@Req() req): Promise<selectInventory[]> {

    // The userId is now available in req.user after the guard verifies the JWT token
    //const userId = req.user?.sub; // Access userId (stored in 'sub' in the token)
    //if (!userId) {
      //throw new Error('User ID is required to fetch inventory');
    //}

    const inventories = await this.inventoryService.getInventories(1);
    if (!inventories) {
      return []; // Return empty array if no inventories are found
    }

    const randomInventories = this.getRandomInventories(inventories, 10);  //fetch post
    return randomInventories;
  }

  private getRandomInventories (posts: selectInventory[], count: number): selectInventory[] {
    const shuffled = posts.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }









  @Post('create')
  @UseInterceptors(FileInterceptor('file')) // Intercept the uploaded file
  async createPost(
    @Body() createPostDto: insertInventory,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }
    
    try {
      // Upload file to Cloudinary
      const result = await this.inventoryService.uploadImage(file.buffer, file.originalname, 90);
      const { public_id: publicId, secure_url: photoUrl } = result;

      console.log(result);
  
      // Add the photo URL and publicId to the post DTO
      const newPost = {
        ...createPostDto,
        photo_url: photoUrl,         // URL for rendering the image
        photo_public_id: publicId,   // Unique ID for the image (to delete it later)
      };
  
      // Insert the post into the database
      console.log('new post',newPost);
      const createdPost = await this.inventoryService.createInventories(newPost);
  
      return {
        message: 'Post created successfully!',
        post: createdPost,
      };
    } catch (error) {
      console.error('Error creating post:', error);
      throw new HttpException('Failed to create post', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  

  @Get(':id')
  async getPostById(@Param('id') id: number): Promise<selectInventory | null> {
    try {
      return await this.inventoryService.getInventoryById(id);
    } catch (error) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
  }


  



  @Patch(':id/description')
  async updatePostDescription(
    @Param('id') id: number,
    @Body() updateInventoryDto: UpdateInventoryDto
  ) {
    try {
      await this.inventoryService.updateInventoryItemDescription(id, updateInventoryDto.description!);
      return { message: 'Post description updated successfully' };
    } catch (error) {
      throw new HttpException('Failed to update post description', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }






  @Delete(':inventoryId')
  async deletePost(@Param('inventoryId') inventoryId: number) {
    try {

      const inventory = await this.inventoryService.getInventories(inventoryId);
      if (!inventoryId) {
        throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
      }

      if (!inventory || inventory.length === 0) {
        throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
      }

      // Delete the image from Cloudinary using the stored public_id
      const { photo_public_id } = inventory[0];
      if (photo_public_id) {
        await this.inventoryService.deleteImage(photo_public_id); // Delete image from Cloudinary
      }

      // Now delete the post from the database
      await this.inventoryService.deleteInventoryItem(inventoryId);

      return {
        message: 'Post and associated photo deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting post:', error);
      throw new HttpException('Failed to delete post', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('user/:userId')
  async getPostsByUserId(@Param('userId') userId: number) {
    const posts = await this.inventoryService.getInventoryItemsByUser(userId);

    // If no posts found, throw a NotFoundException
    if (!posts) {
      throw new NotFoundException('No posts found for this user');
    }

    // Return the posts with username
    return posts;
  }

}
