import { Injectable } from '@nestjs/common';
import { CreateUserAunthenticateDto } from './dto/create-user-aunthenticate.dto';
import { UpdateUserAunthenticateDto } from './dto/update-user-aunthenticate.dto';

@Injectable()
export class UserAunthenticateService {
  create(createUserAunthenticateDto: CreateUserAunthenticateDto) {
    return 'This action adds a new userAunthenticate';
  }

  findAll() {
    return `This action returns all userAunthenticate`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userAunthenticate`;
  }

  update(id: number, updateUserAunthenticateDto: UpdateUserAunthenticateDto) {
    return `This action updates a #${id} userAunthenticate`;
  }

  remove(id: number) {
    return `This action removes a #${id} userAunthenticate`;
  }
}
