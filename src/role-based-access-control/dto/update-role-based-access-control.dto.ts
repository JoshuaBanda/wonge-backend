import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleBasedAccessControlDto } from './create-role-based-access-control.dto';

export class UpdateRoleBasedAccessControlDto extends PartialType(CreateRoleBasedAccessControlDto) {}
