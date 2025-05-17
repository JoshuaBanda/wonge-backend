import { Test, TestingModule } from '@nestjs/testing';
import { RoleBasedAccessControlController } from './role-based-access-control.controller';
import { RoleBasedAccessControlService } from './role-based-access-control.service';

describe('RoleBasedAccessControlController', () => {
  let controller: RoleBasedAccessControlController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleBasedAccessControlController],
      providers: [RoleBasedAccessControlService],
    }).compile();

    controller = module.get<RoleBasedAccessControlController>(RoleBasedAccessControlController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
