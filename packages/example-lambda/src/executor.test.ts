import { sf } from 'example-shared';
import { runStepFunction } from 'stepfunctor-exec';

describe('test execution of step function', () => {
  it('works', async () => {
    await runStepFunction(sf, {});
  });
});
