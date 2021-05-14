import { promises as fs } from 'fs';
import * as path from 'path';
import { format } from 'util';
import { mkdirP } from '@actions/io';

import { main } from '../src';
import { Environment } from '../src/environment';
import { Logger } from '../src/types';

export const TEST_DATA_DIRECTORY = path.join(__dirname, 'data');
export const SPEC_DIR = path.join(__dirname, 'spec');

type Output = {
  stderr: string;
  stdout: string;
};

class RunError extends Error {
  public readonly original: Error;
  public readonly output: Output;

  constructor(original: Error, output: Output) {
    super(original.message);
    this.original = original;
    this.output = output;
  }
}

const isRunErr = (err: Error): err is RunError => !!(err as RunError).output;

export const runAction = async ({
  eventJson,
  eventName,
  logToConsole,
  copySpec,
}: {
  eventJson: 'missing-file' | 'missing-var' | {};
  eventName?: string;
  logToConsole: boolean;
  /**
   * If set, copy the files from this spec directory to the package directory
   */
  copySpec?: string;
}) => {
  const runTimestamp = Date.now();

  const runDir = path.join(TEST_DATA_DIRECTORY, runTimestamp.toString());
  await mkdirP(runDir);

  const packageDir = path.join(runDir, 'package');
  await mkdirP(packageDir);

  const env: Partial<Environment> = {};

  const eventJsonPath = path.join(runDir, 'event.json');
  if (eventJson === 'missing-file') {
    env.GITHUB_EVENT_PATH = eventJsonPath;
  } else if (eventJson !== 'missing-var') {
    await fs.writeFile(eventJsonPath, JSON.stringify(eventJson, null, '  '));
    env.GITHUB_EVENT_PATH = eventJsonPath;
  }

  if (eventName) {
    env.GITHUB_EVENT_NAME = eventName;
  }

  if (copySpec) {
    const srcPkg = path.join(SPEC_DIR, copySpec, 'package.json');
    const dstPkg = path.join(packageDir, 'package.json');
    const json = JSON.parse((await fs.readFile(srcPkg)).toString());
    json.name = `test-${runTimestamp}`;
    await fs.writeFile(dstPkg, JSON.stringify(json, null, '  '));
  }

  const output = {
    stderr: '',
    stdout: '',
  };
  const log: Logger = {
    log: (...msg: unknown[]) => {
      output.stdout += msg.map((i) => format(i)).join(' ') + '\n';
      if (logToConsole) {
        console.log(...msg);
      }
    },
    table: (table: unknown[]) => {
      output.stdout += `TABLE: ${JSON.stringify(table)}\n`;
      if (logToConsole) {
        console.table(table);
      }
    },
    error: (...msg: unknown[]) => {
      output.stderr += msg.map((i) => format(i)).join(' ') + '\n';
      if (logToConsole) {
        console.error(...msg);
      }
    },
    warn: (...msg: unknown[]) => {
      output.stderr += msg.map((i) => format(i)).join(' ') + '\n';
      if (logToConsole) {
        console.warn(...msg);
      }
    },
  } as const;

  await main({
    log,
    env,
    cwd: packageDir,
  }).catch((err) => {
    throw new RunError(err, output);
  });

  return output;
};

export const expectRunError = (
  p: Promise<unknown>,
  check: (err: RunError) => void
) => {
  return p
    .then(() => {
      throw new Error('Expected run to throw error');
    })
    .catch((err) => {
      if (isRunErr(err)) {
        check(err);
      } else {
        throw err;
      }
    });
};
