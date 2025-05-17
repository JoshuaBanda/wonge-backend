import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RoleBasedAccessControlService } from './role-based-access-control.service';
import { CreateRoleBasedAccessControlDto } from './dto/create-role-based-access-control.dto';
import { UpdateRoleBasedAccessControlDto } from './dto/update-role-based-access-control.dto';

@Controller('role-based-access-control')
export class RoleBasedAccessControlController {
  constructor(private readonly roleBasedAccessControlService: RoleBasedAccessControlService) {}

  @Post('get-previleges')
  getApproadingPrivilege(@Body() body:any) {
    const {user_id}=body;
    console.log('user_id',user_id);
    return this.roleBasedAccessControlService.getApprovedPrivilege(user_id);
  }

  @Post('create-privilege')
  create(@Body() body:any) {
    const {user_id,role}=body;
    console.log('user_id',user_id);
    const result= this.roleBasedAccessControlService.createPrivilage(user_id,role);
    console.log(result);
    return result;
  }
}
