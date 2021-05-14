import * as path from 'path';

import { setLibyearPath } from '../src/libyear';

const ROOT = path.dirname(__dirname);
const LIBYEAR = path.join(ROOT, 'node_modules/libyear/bin/libyear');

setLibyearPath(LIBYEAR);

/**
 * Given the nature of running libyear (i.e. network requests) tests can take
 * a minute or so
 */
jest.setTimeout(1000 * 60);
