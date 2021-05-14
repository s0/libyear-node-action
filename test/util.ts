import {promises as fs } from 'fs';
import * as path from 'path';
import { format } from 'util';
import { mkdirP } from '@actions/io';

import { main, Logger } from '../src';
import { Environment } from '../src/environment';

export const TEST_DATA_DIRECTORY = path.join(__dirname, 'data');

type Output = {
  stderr: string;
  stdout: string;
}

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
}: {
  eventJson: 'missing-file' | 'missing-var' | {};
  eventName?: string;
  logToConsole: boolean;
}) => {

  const runTimestamp = Date.now();

  const runDir = path.join(TEST_DATA_DIRECTORY, runTimestamp.toString());
  await mkdirP(runDir);
  
  const env: Partial<Environment> = {}

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

  const output = {
    stderr: '',
    stdout: ''
  };
  const log: Logger = {
    log: (...msg: unknown[]) => {
      output.stdout += msg.map(i => format(i)).join(' ') + '\n';
      if (logToConsole) {
        console.log(...msg);
      }
    },
    error: (...msg: unknown[]) => {
      output.stderr += msg.map(i => format(i)).join(' ') + '\n';
      if (logToConsole) {
        console.error(...msg);
      }
    },
    warn: (...msg: unknown[]) => {
      output.stderr += msg.map(i => format(i)).join(' ') + '\n';
      if (logToConsole) {
        console.warn(...msg);
      }
    },
  } as const;

  await main({
    log,
    env
  }).catch(err => {
    throw new RunError(err, output);
  });

}

export const expectRunError = (p: Promise<unknown>, check: (err: RunError) => void) => {
  return p.then(() => {
    throw new Error('Expected run to throw error')
  }).catch(err => {
    if (isRunErr(err)) {
      check(err);
    } else {
      throw err;
    }
  })
}
