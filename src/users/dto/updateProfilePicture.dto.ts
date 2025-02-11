import { IsString } from "class-validator";


export class profilePictureNameDto{
    
    @IsString()
    email:string;

    
    @IsString()
    profilePicture:string;
}