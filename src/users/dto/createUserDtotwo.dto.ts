import { IsString, IsDate, IsOptional } from "class-validator";  // Import necessary decorators

export class CreateUserDtoTwo {
  @IsString()
  firstname: string;

  @IsString()
  lastname: string;

  @IsString()
  profilepicture: string;

  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  sex: string;

  @IsString()
  phonenumber: string;

  @IsDate()  // Use @IsDate() for validating Date types
  dateofbirth: Date;
}
