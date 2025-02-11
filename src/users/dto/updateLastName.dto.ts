import { IsString } from "class-validator";


export class lastNameDto{
    
    @IsString()
    email:string;

    
    @IsString()
    lastname:string;
}