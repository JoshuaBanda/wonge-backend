import { Module } from '@nestjs/common';
import { RoleBasedAccessControlService } from './role-based-access-control.service';
import { RoleBasedAccessControlController } from './role-based-access-control.controller';

@Module({
  controllers: [RoleBasedAccessControlController],
  providers: [RoleBasedAccessControlService],
})
export class RoleBasedAccessControlModule {}
