import { PathReporter } from 'io-ts/PathReporter';
import { isRight } from 'fp-ts/Either';
import { promises as fs } from 'fs';

import { Environment, ENVIRONMENT } from './environment';
import { runLibyear, getTotals, metrics, getResultsTable } from './libyear';
import { Logger } from './types';

export const runAction = async ({
  env,
  log,
  cwd,
}: {
  env: Environment;
  log: Logger;
  cwd: string;
}) => {
  const json = await fs.readFile(env.GITHUB_EVENT_PATH);

  const error = (msg: string) => {
    log.error(`::error ::${msg}`);
    return new Error(msg);
  };

  if (env.GITHUB_EVENT_NAME === 'push') {
    const report = await runLibyear(cwd);

    log.log('Result: ');
    log.table(getResultsTable(report));

    // calculate totals
    log.log('Totals: ');
    const totals = getTotals(report);
    for (const metric of metrics) {
      log.log(`${metric}: ${totals.get(metric)}`);
      log.log(`::set-output name=${metric}::${totals.get(metric)}`);
    }
  } else if (env.GITHUB_EVENT_NAME === 'pull_request') {
    throw new Error('TODO');
  } else {
    throw error(`Unsupported GitHub event: ${env.GITHUB_EVENT_NAME}`);
  }
};

export const main = async ({
  env,
  log,
  cwd,
}: {
  env: NodeJS.ProcessEnv;
  log: Logger;
  cwd: string;
}) => {
  const validate = ENVIRONMENT.decode(env);
  if (isRight(validate)) {
    return runAction({
      env: validate.right,
      log,
      cwd,
    });
  } else {
    const errors = PathReporter.report(validate);
    for (const error of errors) {
      log.error(error);
    }
    throw new Error('Invalid config, unable to continue');
  }
};