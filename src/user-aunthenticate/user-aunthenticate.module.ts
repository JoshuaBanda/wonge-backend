import { Module } from '@nestjs/common';
import { UserAunthenticateService } from './user-aunthenticate.service';
import { UserAunthenticateController } from './user-aunthenticate.controller';

@Module({
  controllers: [UserAunthenticateController],
  providers: [UserAunthenticateService],
})
export class UserAunthenticateModule {}
