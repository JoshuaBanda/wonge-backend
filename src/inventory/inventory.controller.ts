import { Body, Controller, Delete, Get, HttpException, HttpStatus, InternalServerErrorException, NotFoundException, Param, Patch, Post, Query, Req, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { insertInventory, selectInventory } from "src/db/schema";
import { FileInterceptor } from "@nestjs/platform-express";
import { UpdateInventoryDto } from "./dto/update-inventory.dto";
import { JwtAuthGuard } from "./guard";

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService,
  ) {}

  //@UseGuards(JwtAuthGuard) // Apply the guard to protect this route@Get()
  
  //@UseGuards(JwtAuthGuard) // Apply the guard to protect this route
  @Get()
async getAllInventories(/*@Req() req*/): Promise<selectInventory[]> {

  try {
    //let userId = req.user?.sub; // Access userId (stored in 'sub' in the token)
    //console.log("aunthenticated user id",userId);
    //if (!userId) {
     // console.log("no user");
      //throw new UnauthorizedException('User ID is required to fetch inventory');
    //}
    let userId=1;
      // 2. Get inventories with proper error handling
      let inventories = await this.inventoryService.getInventories(userId);
      
      // 3. If first attempt fails, try once more
      if (!inventories) {
          inventories = await this.inventoryService.getInventories(userId);
      }

      // 4. If still no inventories, return empty array
      if (!inventories) {
          return []; 
      }
      //console.log(inventories);

      // 5. Return random selection
      console.log("returning",inventories);
      return this.getRandomInventories(inventories, 10);
  } catch (error) {
      // Handle unexpected errors
      throw new InternalServerErrorException('Failed to fetch inventories');
  }
}

  private getRandomInventories (posts: selectInventory[], count: number): selectInventory[] {
    const shuffled = posts.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
  @Get("products/:productType/:page/:limit")
  async getInventoriesByType(
    @Param('productType') productType: string,
    @Param('page') page: number,
    @Param('limit') limit: number
  ): Promise<selectInventory[]> {
    console.log(productType,page,limit);
    const userId=1;
    const inventories = await this.inventoryService.getInventoryByType(productType,userId,page,limit);
    if (!inventories) {
      return []; // Return empty array if no inventories are found
    }

    // Use the limit from query
    const randomInventories = this.getRandomInventories(inventories, limit);
    return randomInventories;
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
