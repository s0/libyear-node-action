/* istanbul ignore file - this file is used purely as an entry-point */

import { main } from './';

main({
  env: process.env,
  log: console,
  cwd: process.cwd(),
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
