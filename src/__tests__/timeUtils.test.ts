import { wait } from '../utils/timeUtils';

it('wait 1s', async () => {
  const time = new Date().getTime();
  await wait(1000);
  expect(new Date().getTime() - time).toBeGreaterThan(999);
});
