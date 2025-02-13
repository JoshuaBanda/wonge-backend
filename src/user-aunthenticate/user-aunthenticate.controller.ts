import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserAunthenticateService } from './user-aunthenticate.service';
import { CreateUserAunthenticateDto } from './dto/create-user-aunthenticate.dto';
import { UpdateUserAunthenticateDto } from './dto/update-user-aunthenticate.dto';

@Controller('user-aunthenticate')
export class UserAunthenticateController {
  constructor(private readonly userAunthenticateService: UserAunthenticateService) {}

  @Post()
  create(@Body() createUserAunthenticateDto: CreateUserAunthenticateDto) {
    return this.userAunthenticateService.create(createUserAunthenticateDto);
  }

  @Get()
  findAll() {
    return this.userAunthenticateService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userAunthenticateService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserAunthenticateDto: UpdateUserAunthenticateDto) {
    return this.userAunthenticateService.update(+id, updateUserAunthenticateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userAunthenticateService.remove(+id);
  }
}
