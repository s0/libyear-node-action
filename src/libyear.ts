import * as child_process from 'child_process';
export { metrics } from 'libyear/src/constants';
import type { Dependencies } from 'libyear/src/types';
export { getTotals } from 'libyear/src/validate';
import * as path from 'path';
import { promisify } from 'util';

const exec = promisify(child_process.exec);

let libyearPath: string | null = null;

/**
 * Used for testing to overwrite the path to point to node_modules
 */
export const setLibyearPath = (path: string) => {
  libyearPath = path;
};

/**
 * Dynamically get the path to the libyear module
 *
 * (supporting both live (built) and test environments)
 */
const getLibyearModulePath = () => {
  /* istanbul ignore else */
  if (libyearPath) {
    return libyearPath;
  } else {
    /**
     * When run on GitHub, the compiles libyear module is in the file
     * ../libyear/index.js relative to the action module in dist/main/index.js
     */
    return path.join(path.dirname(__dirname), 'libyear');
  }
};

export const runLibyear = async (directory: string): Promise<Dependencies> => {
  const path = getLibyearModulePath();

  const result = await exec(`node "${path}" --json`, {
    cwd: directory,
  });
  const report: Dependencies = JSON.parse(result.stdout);
  return report;
};

export const getResultsTable = (report: Dependencies) =>
  report.map(
    ({
      dependency,
      drift,
      pulse,
      releases,
      major,
      minor,
      patch,
      available,
    }) => ({
      dependency,
      drift: drift.toFixed(2),
      pulse: pulse.toFixed(2),
      releases,
      major,
      minor,
      patch,
      available,
    })
  );

export type { Dependencies };
