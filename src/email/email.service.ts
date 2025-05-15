import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';
import { TimeoutError } from 'rxjs';
@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    // Configure the Nodemailer transporter (adjust SMTP settings for your provider)
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // Example with Gmail (change according to your provider)
      auth: {
        user: 'bsc-inf-04-22@unima.ac.mw', // Your email address
        pass: 'nfsu vsox qlik hdcc', // Your email password or app password
      },
    });
  }

  // Generate a random OTP
  generateOtp(): string {
    const otp = crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
    return otp;
  }

  // Send OTP via email
  async sendOtp(email: string, otp: string): Promise<void> {
    const mailOptions = {
      from: process.env.SMTP_USER, // Your email address
      to: email,
      subject: 'Wonge Market Online OTP Email Verification',
      text: `Your OTP is: ${otp}. This OTP is valid for 10 minutes. `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send OTP');
    }
  }

  async sendReportEmail(email:String,reportmessage:String,ofender:number,reportedby:number,postid:number):Promise<any>{

    console.log("sending email");
    const mailOptions = {
      from: process.env.SMTP_USER, // Your email address
      to: email,
      subject: 'Policy Violations report',
      text: `user ${reportedby} reported user ${ofender} for violation of unima dating hub policies: message : ${reportmessage} , You can take action`,
    };


    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send OTP');
    }
  }



  
  
  
async notifyOrder(email: string, product: string, name: string, totalCost: number) {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER, // Your email address
      to: email,
      subject: 'Order Successful',
      text: `Hello ${name},\n\nYou have ordered the following items:\n\n${product}\n\nTotal Cost: $${totalCost.toFixed(2)}\n\nThank you for your purchase!`,
    };

    console.log(`Sending email to ${email} with total cost: $${totalCost}`);
    await this.transporter.sendMail(mailOptions);
    console.log('Email sent successfully.');
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw new Error('Failed to send order email');
  }
}

}
