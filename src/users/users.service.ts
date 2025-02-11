import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import {selectUsers, usersTable } from 'src/db/schema';
import { db } from 'src/db';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';

@Injectable()
export class UsersService {
  constructor(private jwtService: JwtService,
  ) {}


  // Get a user by ID
  async getUserById(userId: selectUsers['userid']): Promise<selectUsers | null> {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.userid, userId))
      .execute();
    return user || null;

  }
  
  


async  getUserByEmail(email: string): Promise<selectUsers | null> {
  try {
    
    // Query to select the user by email
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email)) // Filter by the email
      .execute();

    if (user) {
      return user; // Return the user object if found
    } else {
      return null; // Return null if no user is found
    }
  } catch (error) {
    throw new InternalServerErrorException(error,'Could not retrieve user'); // Throw error or handle it based on your needs
  }
}



  // Get all users
  async getAllUsers(): Promise<selectUsers[] | null> {
    return await db
      .select()
      .from(usersTable)
      .execute();
  }

    // Create a new user
  async createUser(
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    sex:string,
    dateofbirth:any,
    phonenumber:string,
    photoUrl:string,publicId:string

  ): Promise<any> {
    try {
      // Hash the password
      
      const hashedPassword = await bcrypt.hash(password, 12);

      
      console.log(hashedPassword);
  
      // User data to be inserted into the database
      const data = {
        firstname,
        lastname,
        email,
        password: hashedPassword,
        sex,
        dateofbirth,
        phonenumber,
        activationstatus: true, // Set default value for activationstatus (true or false)
        photoUrl,publicId
      };
  
      // Insert user into the database and get the inserted user back
      const result = await db
        .insert(usersTable)
        .values(data)
        .returning();
  
      const user = result[0]; // Extract the user from the result
  
      // Generate a JWT token for the user using JwtService
      //const token = await this.jwtService.signAsync(
        //{ userid: user.userid, email: user.email }, // Payload: include necessary info (don't include password)
        //{ secret: 'your_jwt_secret_key' } // Secret key and expiration
      //);
  
      // Return the user along with the JWT token
      
      const data2 = await this.getAuthenticatedUser(email, password);
      return {
        user: {
          userid: user.userid,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          activationstatus:user.activationstatus,
        },
        //access_token: token, // Include the JWT token in the response
        access_token:data2,
      };
    } catch (error) {
      throw new InternalServerErrorException(error,'Failed to create user');
    }
  }
  
  // Authenticate a user by email and password
  async getAuthenticatedUser(
    email: string,
    password: string
  ): Promise<{ access_token: string }> {
    try {
   //   console.log('Starting authentication process');
  
      const user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .execute();
  
    //  console.log('Database query completed:', user);
  
      if (user.length === 0) {
    //    console.log('User not found');
        throw new InternalServerErrorException('Invalid credentials');
      }
  
      const isPasswordValid = await bcrypt.compare(password, user[0].password);
     // console.log('Password comparison result:', isPasswordValid);
  
      if (!isPasswordValid) {
        throw new InternalServerErrorException('Invalid credentials');
      }
  
      const result = { sub: user[0].userid, firstname: user[0].firstname };
    //  console.log('JWT payload:', result);
  
      const token = await this.jwtService.signAsync(result);
    //  console.log('JWT token generated:', token);
  
      return { access_token: token };
  
    } catch (error) {
      console.error('Error during authentication:', error);
      throw error;
    }
  }
  


async updateActivationStatusById(userId: number, activationStatus: boolean): Promise<void> {
  try {
    // Ensure the object passed to `set()` matches the schema
    await db
      .update(usersTable)
      .set({ activationstatus: activationStatus }) // This should work as long as `activationstatus` is in the schema
      .where(eq(usersTable.userid, userId));

  } catch (error) {
    throw new InternalServerErrorException('Could not update activation status');
  }
}
async updateActivationStatusByEmail(email: string, activationStatus: boolean): Promise<void> {
  try {

    // Update the 'activationstatus' field in the 'usersTable' where the email matches
    await db
      .update(usersTable) // Specify the table to update
      .set({ activationstatus: activationStatus }) // Set the new activation status value
      .where(eq(usersTable.email, email)); // Match the row by email address

    // Log a success message
  } catch (error) {
    // Log any error that occurs and throw an internal server error
    throw new InternalServerErrorException(error,'Could not update activation status by email');
  }
}

async updateFirstName(email: string, firstname: string) {
  try {
    // Check if the email and name are valid (optional validation)


    if (!email || !firstname) {
      throw new Error('Invalid input data');
    }
   // console.log('chec',email,firstname);

    // Perform the update operation
    const result = await db
      .update(usersTable)
      .set({ firstname: firstname })
      .where(eq(usersTable.email, email));

    // Check if any rows were updated (if result is empty, no matching user was found)
    if (result.count === 0) {
      throw new Error(`No user found with the email: ${email}`);
    }

    // Return a success message with the updated data
    return { message: 'First name updated successfully', updatedRows: result.count };
  } catch (error) {
    // Log the error and throw a more user-friendly error
    console.error('Error updating first name:', error);
    throw new Error('Failed to update first name. Please try again later.');
  }
}

async updateLastName(email: string, lastname: string) {
  try {
    // Check if the email and name are valid (optional validation)


    if (!email || !lastname) {
      throw new Error('Invalid input data');
    }
   // console.log('chec',email,lastname);

    // Perform the update operation
    const result = await db
      .update(usersTable)
      .set({ lastname: lastname })
      .where(eq(usersTable.email, email));

    // Check if any rows were updated (if result is empty, no matching user was found)
    if (result.count === 0) {
      throw new Error(`No user found with the email: ${email}`);
    }

    // Return a success message with the updated data
    return { message: 'last name updated successfully', updatedRows: result.count };
  } catch (error) {
    // Log the error and throw a more user-friendly error
    console.error('Error updating lst name:', error);
    throw new Error('Failed to update last name. Please try again later.');
  }
}

/*async updateProfilePicture(email: string, profilepicture: string) {
  try {
    // Check if the email and name are valid (optional validation)


    if (!email || !profilepicture) {
      throw new Error('Invalid input data');
    }
   // console.log('chec',email,profilepicture);

    // Perform the update operation
    const result = await db
      .update(usersTable)
      .set({ profilepicture: profilepicture })
      .where(eq(usersTable.email, email));

    // Check if any rows were updated (if result is empty, no matching user was found)
    if (result.count === 0) {
      throw new Error(`No user found with the email: ${email}`);
    }

    // Return a success message with the updated data
    return { message: ' updated successfully', updatedRows: result.count };
  } catch (error) {
    // Log the error and throw a more user-friendly error
    console.error('Error updating :', error);
    throw new Error('Failed to update . Please try again later.');
  }
}*/

 async  uploadImage(fileBuffer: Buffer, fileName: string, quality: number): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = v2.uploader.upload_stream(
        {
          resource_type: 'auto',  // Automatically detect file type
          public_id: fileName,    // Use fileName as public_id
          folder: '',    // Optionally specify a folder
          transformation: [
            { width: 800, height: 600, crop: 'limit' },  // Resize to fit within 800x600
            { quality: quality },  // Specify custom quality (e.g., 80)
          ],
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(error);
          }
          if(result){
            resolve(result)
          }
        }
      );
  
      uploadStream.end(fileBuffer); // End the stream with the buffer
    });
  }
}
