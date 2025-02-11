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
  Query
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
  
  
  // Endpoint to create a new user (Registration)
  @Post('create-user')
  async createUser(
    @Body() createUserDtotwo: CreateUserDtoTwo
  ): Promise<selectUsers> {
    const { firstname, lastname, profilepicture, email, password,sex,dateofbirth,phonenumber } = createUserDtotwo;


    // Pass user data to the service to create the user
    const result = await this.usersService.createUser(firstname, lastname, profilepicture, email, password,sex,dateofbirth,phonenumber);

    // Return created user with the result
    return result;
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

  @Put('updateprofilepicture')
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
  }
}
