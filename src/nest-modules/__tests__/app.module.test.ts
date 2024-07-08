import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/nest-modules/app.module';

describe('App Module', () => {
  it('should inject dependencies correctly', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(module).toBeDefined();
  });
});
