import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AwakeService } from './awake.service';
import { CreateAwakeDto } from './dto/create-awake.dto';
import { UpdateAwakeDto } from './dto/update-awake.dto';

@Controller('awake')
export class AwakeController {
  constructor(private readonly awakeService: AwakeService) {}

  @Get()
  recieveRequest(){
    return this.awakeService.recieveReqestFromAnotherBackEnd()
  }
}
