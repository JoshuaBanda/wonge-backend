import { Test, TestingModule } from '@nestjs/testing';
import { RoleBasedAccessControlService } from './role-based-access-control.service';

describe('RoleBasedAccessControlService', () => {
  let service: RoleBasedAccessControlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoleBasedAccessControlService],
    }).compile();

    service = module.get<RoleBasedAccessControlService>(RoleBasedAccessControlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
