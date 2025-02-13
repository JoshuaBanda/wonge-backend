import { PartialType } from '@nestjs/mapped-types';
import { CreateUserAunthenticateDto } from './create-user-aunthenticate.dto';

export class UpdateUserAunthenticateDto extends PartialType(CreateUserAunthenticateDto) {}
