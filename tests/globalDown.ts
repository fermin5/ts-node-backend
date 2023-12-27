// testTeardown.ts
import { closeServerInstance } from './globalSetup';

(async () => {
  await closeServerInstance();
})();
