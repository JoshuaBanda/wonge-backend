
import { IsArray, IsInt, isInt } from "class-validator";

export class CreateNotificationDto {
    @IsInt()
    user_id:number;
    
    @IsArray()
    inventory_ids:number[];

    
}
