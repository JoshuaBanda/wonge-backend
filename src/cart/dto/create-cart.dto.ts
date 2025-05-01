import { IsInt, isInt } from "class-validator";

export class CreateCartDto {
    @IsInt()
    user_id:number;
    
    @IsInt()
    inventory_id:number;

    @IsInt()
    quantity:number;
}
