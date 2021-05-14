import * as path from 'path';

import { setLibyearPath } from '../src/libyear';

const ROOT = path.dirname(__dirname);
const LIBYEAR = path.join(ROOT, 'node_modules/libyear/bin/libyear');

setLibyearPath(LIBYEAR);
