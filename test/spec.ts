import * as path from 'path';
import { runLibyear, Dependencies } from '../src/libyear';
import { SPEC_DIR } from './util';

const cache = new Map<string, Dependencies>();

/**
 * Run libyear on the spec directory to anticipate what results to see
 */
export const loadSpec = async (specPath: string): Promise<Dependencies> => {
  const res = cache.get(specPath);
  if (res) {
    return res;
  } else {
    const dir = path.join(SPEC_DIR, specPath);
    const res = await runLibyear(dir);
    cache.set(specPath, res);
    return res;
  }
};
