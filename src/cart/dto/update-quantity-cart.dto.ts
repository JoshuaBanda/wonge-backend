import { PartialType } from "@nestjs/mapped-types";
import { CreateCartDto } from "./create-cart.dto";
import { IsInt, IsPositive } from "class-validator";

export class UpdateQuantityCartDto extends PartialType(CreateCartDto){
    @IsInt()
    inventory_id: number ;


    @IsInt()
    @IsPositive()
    quantity: number ;

    @IsInt()
    @IsPositive()
    id:number;
}