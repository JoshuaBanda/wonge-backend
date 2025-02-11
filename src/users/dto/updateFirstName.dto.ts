import { IsString } from "class-validator";


export class FirstNameDto{
    
    @IsString()
    email:string;

    
    @IsString()
    firstname:string;
}