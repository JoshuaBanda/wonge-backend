import { Test, TestingModule } from '@nestjs/testing';
import { UserAunthenticateService } from './user-aunthenticate.service';

describe('UserAunthenticateService', () => {
  let service: UserAunthenticateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserAunthenticateService],
    }).compile();

    service = module.get<UserAunthenticateService>(UserAunthenticateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
