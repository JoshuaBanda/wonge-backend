import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { EmailService } from 'src/email/email.service';
import { UsersService } from 'src/users/users.service';

@Module({
  providers: [OtpService,EmailService,UsersService],
})
export class OtpModule {}
