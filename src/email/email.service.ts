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



  
  async sendEmailToSchool(message: { message: string }): Promise<void> {
    // Function to introduce a delay,social
    //skippin early child hood dev,gender
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const departments = [ /*'bsc-inf','bsc-bio', 'bed-com', 'bsc-com','bah-mfd','ba-eco'*/,'bsc-ele','bsc-mat','bsc','bsc-act-hon','bsc-che-hon','bsc-com-ne','bsc-phy','bsc-sta','bsc-geo','bsc-gly','bsc-fn','bsc-fc',/*social science*/'ba-soc','ba-dec','ba-psy','bah-seh','bsoc-sw','ba-com','bsoc-le','bsoc','bed-mat','bed-phy','bed-bio','bed-hec','bed-che','ess','el'];
    let yearSuffix = 21; // Start with year '22'
    const maxAttempts = 80;//max attempt to retry sending email
    const retryLimit = 4;//maxmum retry before moving to the next unit
    const timeoutLimit = 20000; // Increased timeout limit (20 seconds)
    const maxRegNumber =80 ;//max reg numbers for a cohort
    const emailDelay = 2000;  // Delay between emails (1 second)
  
    let consecutiveFailures = 0;
  
    for (let departmentIndex = 0; departmentIndex < departments.length; departmentIndex++) {
      const department = departments[departmentIndex];
  
      for (let year = yearSuffix; year <= 24; year++) {
        let regNumber = 1;
        console.log(`Processing department: ${department}, Year: ${year}`);
  
        for (let i = 0; i < maxAttempts; i++) {
          const regString = regNumber.toString().padStart(2, '0');
          const email = `${department}-${regString}-${year}@unima.ac.mw`;
  
          console.log(`Sending email to: ${email}`);
  
          const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: 'Unima Dating Hub',
            text: message.message,
          };
  
          const sendEmailWithTimeout = async (): Promise<void> => {
            return new Promise((resolve, reject) => {
              const timeout = setTimeout(() => {
                reject(new Error("Email send timed out"));
              }, timeoutLimit);
  
              this.transporter.sendMail(mailOptions, (error, info) => {
                clearTimeout(timeout);
                if (error) {
                  reject(error);
                } else {
                  resolve(info);
                }
              });
            });
          };
  
          try {
            await sendEmailWithTimeout();
            console.log(`Email sent to ${email}`);
            consecutiveFailures = 0;
          } catch (error) {
            console.error(`Failed to send email to ${email}:`, error);
            console.log(`Skipping email to ${email} due to failure.`);
            consecutiveFailures++;
  
            // Check if consecutive failures exceed retryLimit and move to next year
            if (consecutiveFailures >= retryLimit) {
              console.log("3 consecutive failures occurred, moving to next year.");
              break;
            }
  
            // Check if the error is related to non-existent email (email address doesn't exist)
            if (error.message.includes('User unknown') || error.message.includes('Recipient address rejected')) {
              console.log(`Email address does not exist: ${email}`);
            }
  
            regNumber++;
            continue;
          }
  
          regNumber++;
  
          if (regNumber > maxRegNumber) {
            break;
          }
        }
  
        consecutiveFailures = 0;
        await delay(emailDelay);  // Add delay between sending emails
      }
  
      console.log(`Finished sending emails for department: ${department}`);
    }
  
    console.log("All emails sent.");
  }
  
    


  
  }
