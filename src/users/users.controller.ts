import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  BadRequestException,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Put,
  Req,
  Query,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { UsersService } from './users.service';
import { selectUsers, usersTable } from 'src/db/schema';
import { db } from 'src/db';
import { AuthGuard } from './auth.guard'; 
import { OtpService } from 'src/otp/otp.service';
import { FirstNameDto } from './dto/updateFirstName.dto';
import { lastNameDto } from './dto/updateLastName.dto';
import { profilePictureNameDto } from './dto/updateProfilePicture.dto';
import { JwtAuthGuard } from 'src/inventory/guard';
import { CreateUserDtoTwo } from './dto/createUserDtotwo.dto';
import { FileInterceptor } from '@nestjs/platform-express';

// Controller to manage both OTP and user-related operations
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly otpService: OtpService // Inject OTP service
  ) {}

  // Get all users (for admin or debugging purposes)
  @Get('allusers')
  async getAllUsers(): Promise<selectUsers[]> {
    return await this.usersService.getAllUsers()??[];
  }


  // Get a user by ID
  @Get(':userid')
  async getUserById(@Param('userid') userid: string) {
    const user_id = Number(userid);
    const user = await this.usersService.getUserById(user_id);
    if (!user) {
      throw new HttpException(`User ${user_id} not found`, HttpStatus.NOT_FOUND);
    }
    return user;
  }

  // Endpoint to send OTP to the user's email (for registration or login)
  @Post('otp/send')
  async sendOtp(@Body('email') email: string): Promise<string> {
    try {
      await this.otpService.sendOtpToEmail(email); // Send OTP using the OTP service
      return 'OTP sent successfully!';
    } catch (error) {
      throw new BadRequestException('Failed to send OTP');
    }
  }

    // Endpoint to verify OTP
    @Post('otp/verify')
    async verifyOtp(
      @Body('email') email: string,
      @Body('otp') otp: string
    ): Promise<string> {
      
        // Call the service to verify the OTP
      const result=await this.otpService.verifyOtp(email, otp);

        // Return a success message if OTP is valid
      return result;
      
    }
  
    @Post('create-user')
    @UseInterceptors(FileInterceptor('file'))
    async createUser(
      @Body() createUserDtotwo: CreateUserDtoTwo,  // Use @Body() to bind the data sent in the request body
      @UploadedFile() file: Express.Multer.File,    // File will be attached here
    ): Promise<selectUsers> {
      // Check if file is uploaded
      if (!file) {
        console.log('No file uploaded');
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }
  
      try {
        // Log the uploaded file for debugging
        //console.log('File uploaded:', file.originalname);
        //console.log('File size:', file.size);
        //console.log('File buffer length:', file.buffer.length);
        
        // Upload file to Cloudinary
        //console.log('Uploading file to Cloudinary...');
        const result = await this.usersService.uploadImage(file.buffer, file.originalname, 90);
        
        // Log Cloudinary upload result
        //console.log('Cloudinary upload result:', result);
        
        const { public_id: publicId, secure_url: photoUrl } = result;
  
        // Log the URL and public ID received from Cloudinary
        //console.log('Received photo URL:', photoUrl);
        //console.log('Received public ID:', publicId);
  
        // Combine uploaded file info with user data
        const newUser = {
          ...createUserDtotwo,
          photo_url: photoUrl,        // URL for rendering the image
          photo_public_id: publicId,  // Unique ID for the image (to delete it later)
        };
  
        // Destructure properties for creating the user
        const { firstname, lastname, email, password, sex, dateofbirth, phonenumber } = createUserDtotwo;
  
        // Log the user data before creating the user
        console.log('User data to be inserted:', {
          firstname,
          lastname,
          email,
          password,
          sex,
          dateofbirth,
          phonenumber,
          photoUrl,
          publicId,
        });
  
        // Call service to create user
        const user = await this.usersService.createUser(
          firstname,
          lastname,
          email,
          password,
          sex,
          dateofbirth,
          phonenumber,
          photoUrl,
          publicId
        );
  
        // Log the created user
        console.log('Created user:', user);
  
        return user;
  
      } catch (error) {
        console.error('Error creating user:', error);
        throw new HttpException('Failed to create user', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    
  // Endpoint to authenticate a user (Login)
  @Post('logi-n')
  async login(@Body() LoginDto: { email: string; password: string }) {
    //console.log('Login attempt for:', LoginDto.email);
    const { email, password } = LoginDto;

    // Authenticate user and return JWT token
    const result = await this.usersService.getAuthenticatedUser(email, password);

    const user=await this.usersService.getUserByEmail(email);
   // console.log(user);

   if(user){
    
    if (!user.activationstatus){
      throw new BadRequestException('Account not activated, change your password to activate account')
    }
   }
    const damdata={result,user}
    return {result,user};
  }

  // Endpoint to get the authenticated user's profile (Requires JWT token)
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }


   @Put('updatefirstname')
  async updateFirstName(@Body() updateFirstNameDto: FirstNameDto) {
    try {
      const { email, firstname } = updateFirstNameDto;
      
      // Call the service to update the first name
      const result = await this.usersService.updateFirstName(updateFirstNameDto.email, updateFirstNameDto.firstname);
      
      // Return the result from the service
      return result;
    } catch (error) {
      // Handle errors
      throw new Error('Failed to update first name. Please try again later.');
    }
  }

  @Put('updatelastname')
  async updateLastName(@Body() updateFirstNameDto: lastNameDto) {
    try {
      const { email, lastname } = updateFirstNameDto;
      // Log input for debugging (can be enhanced with a proper logger)
      
      // Call the service to update the first name
      const result = await this.usersService.updateLastName(updateFirstNameDto.email, updateFirstNameDto.lastname);
      
      // Return the result from the service
      return result;
    } catch (error) {
      // Handle errors
      throw new Error('Failed to update lastname name. Please try again later.');
    }
  }

  /*@Put('updateprofilepicture')
  async updateProfilepicture(@Body() updateFirstNameDto: profilePictureNameDto) {
    try {
      const { email, profilePicture } = updateFirstNameDto;
      const result = await this.usersService.updateProfilePicture(updateFirstNameDto.email, updateFirstNameDto.profilePicture);
      
      // Return the result from the service
      return result;
    } catch (error) {
      // Handle errors
      throw new Error('Failed to update profile. Please try again later.');
    }
  }*/
}
