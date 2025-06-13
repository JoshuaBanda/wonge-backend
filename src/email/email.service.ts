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
      subject: 'Wezzie Market Online OTP Email Verification',
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



  
  
  
async notifyOrder(email: string, products: { name: string; quantity: number; photo_url: string }[], name: string, totalCost: number) {
  
  try {
    const productLines = products.map(p => 
  `- ${p.name} (x${p.quantity})\n  Photo: ${p.photo_url}`
).join('\n\n');
  const mailOptions = {
  from: process.env.SMTP_USER,
  to: email,
  subject: 'Order Successful',
  html: `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
      <h2 style="color: #4CAF50;">Hello ${name},</h2>
      <p>Thank you for your order. Here are the details:</p>

      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Item</th>
            <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Quantity</th>
            <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Image</th>
          </tr>
        </thead>
        <tbody>
          ${products.map(p => `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${p.name}</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${p.quantity}</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">
                <img src="${p.photo_url}" alt="${p.name}" style="width: 80px; height: auto; border: 1px solid #ccc; border-radius: 5px; background-color:rgba(230, 58, 101, 0.9);" />
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <p style="margin-top: 20px; font-weight: bold;">Total Cost: $${totalCost.toFixed(2)}</p>

      <p style="margin-top: 30px;">We appreciate your business!</p>

      <p>
        Visit our website: 
        <a href="https://Wezzie-market-online.netlify.app/home" style="color:rgb(255, 210, 128); text-decoration: none;font-family: 'Brush Script MT', cursive; font-size: 18px">
          Wezzie Market Online
        </a>
      </p>

      
    </div>
  `
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
