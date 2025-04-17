import { Module } from '@nestjs/common';
import { AwakeService } from './awake.service';
import { AwakeController } from './awake.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports:[ScheduleModule.forRoot(),HttpModule],
  controllers: [AwakeController],
  providers: [AwakeService],
})
export class AwakeModule {}
