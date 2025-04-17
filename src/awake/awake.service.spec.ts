import { Test, TestingModule } from '@nestjs/testing';
import { AwakeService } from './awake.service';

describe('AwakeService', () => {
  let service: AwakeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AwakeService],
    }).compile();

    service = module.get<AwakeService>(AwakeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
