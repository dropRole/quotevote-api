import { Test, TestingModule } from '@nestjs/testing';
import { QuotingController } from './quoting.controller';

describe('QuotingController', () => {
  let controller: QuotingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuotingController],
    }).compile();

    controller = module.get<QuotingController>(QuotingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
