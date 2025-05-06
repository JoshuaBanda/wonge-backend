import { PartialType } from '@nestjs/mapped-types';
import { CreateCartDto } from './create-cart.dto';
import { IsInt, IsArray, IsString } from 'class-validator';

export class UpdateSingleItem extends PartialType(CreateCartDto) {
  @IsInt()
  user_id: number;

  @IsInt()
  cart_id: number;

  @IsString()
  status:string;
}
