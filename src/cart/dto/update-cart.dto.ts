import { PartialType } from '@nestjs/mapped-types';
import { CreateCartDto } from './create-cart.dto';
import { IsInt, IsArray, IsString } from 'class-validator';

export class UpdateCartDto extends PartialType(CreateCartDto) {
  @IsInt()
  user_id: number;

  @IsArray()
  inventory_ids: number[];

  @IsString()
  status:string;
}
