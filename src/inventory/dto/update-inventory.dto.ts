import { PartialType } from '@nestjs/mapped-types';
import { CreateInventoryDto } from './create-inventory.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateInventoryDto {
    @IsString()
    @IsOptional()
    description?: string;
  
    @IsString()
    @IsOptional()
    photo_url?: string;
}
