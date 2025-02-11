import { IsInt } from 'class-validator';

export class CreateUserDto {
    @IsInt()
    firstuserid: number;

    @IsInt()
    seconduserid: number;
}
