import { Test, TestingModule } from '@nestjs/testing';
import { UserAunthenticateController } from './user-aunthenticate.controller';
import { UserAunthenticateService } from './user-aunthenticate.service';

describe('UserAunthenticateController', () => {
  let controller: UserAunthenticateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserAunthenticateController],
      providers: [UserAunthenticateService],
    }).compile();

    controller = module.get<UserAunthenticateController>(UserAunthenticateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
