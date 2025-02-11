import { Injectable, BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import { EmailService } from 'src/email/email.service';
import { JwtService } from '@nestjs/jwt'; // Import JwtService
import { UsersService } from 'src/users/users.service';

@Injectable()
export class OtpService {
  private otpStore = new Map<string, { otp: string, expiresAt: number }>();
  private readonly logger = new Logger(OtpService.name);

  constructor(
    private emailService: EmailService,
    private jwtService: JwtService, // Inject JwtService
    private userService: UsersService, // Inject userService (optional, if you need user data)
  ) {}

  // Send OTP to user's email and store it temporarily
  async sendOtpToEmail(email: string): Promise<void> {
    const otp = this.emailService.generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

    // Log OTP generation event (for debugging purposes)
    this.logger.log(`Generated OTP for ${email}: ${otp}`);

    // Store OTP in memory (you can use Redis or a DB for production)
    this.otpStore.set(email, { otp, expiresAt });

    // Log stored OTP for the email (for debugging purposes)
    this.logger.log(`Stored OTP for ${email}: ${JSON.stringify(this.otpStore.get(email))}`);

    // Send OTP to the email
    await this.emailService.sendOtp(email, otp);
  }

  // Verify the OTP entered by the user
  async verifyOtp(email: string, enteredOtp: string): Promise<any> {
    const otpData = this.otpStore.get(email);

    if (!otpData) {
      this.logger.warn(`No OTP found for ${email}`);
      throw new InternalServerErrorException('OTP not found or expired');
    }

    if (otpData.expiresAt < Date.now()) {
      this.otpStore.delete(email); // Remove expired OTP
      this.logger.warn(`OTP for ${email} has expired`);
      throw new BadRequestException('OTP has expired');
    }

    // Log comparison of OTPs for debugging
    this.logger.log(`Comparing OTPs for ${email}: enteredOtp=${enteredOtp}, storedOtp=${otpData.otp}`);

    if (otpData.otp !== enteredOtp) {
      this.otpStore.delete(email); // Remove invalid OTP to prevent re-use
      this.logger.warn(`Invalid OTP entered for ${email}`);
      throw new BadRequestException('Invalid OTP');
    }

    // OTP is valid, remove OTP from store
    this.otpStore.delete(email);
    this.logger.log(`OTP successfully verified for ${email}`);


    return;
  }

  // Generate JWT access token
  private async generateAccessToken(email: string): Promise<string> {
    // Optionally, you can fetch user data from your UserService based on the email
    const user = await this.userService.getUserByEmail(email); // Replace with actual user fetch logic

    if (!user) {
      throw new InternalServerErrorException('User not found');
    }

    // Create JWT payload (can add more details as needed)
    const payload = {
      email: user.email,
      userId: user.userid,
      // any additional claims here, like roles, permissions, etc.
    };

    // Generate and return the access token
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET_KEY, // Secret key from your environment variables
      expiresIn: '1h', // Set token expiry as needed (e.g., 1 hour)
    });
    

    this.logger.log(`Access token generated for ${email}`);
    return accessToken;
  }
}
