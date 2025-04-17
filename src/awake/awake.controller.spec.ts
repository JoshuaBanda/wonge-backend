import { Test, TestingModule } from '@nestjs/testing';
import { AwakeController } from './awake.controller';
import { AwakeService } from './awake.service';

describe('AwakeController', () => {
  let controller: AwakeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AwakeController],
      providers: [AwakeService],
    }).compile();

    controller = module.get<AwakeController>(AwakeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
