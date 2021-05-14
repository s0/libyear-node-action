import { PathReporter } from 'io-ts/PathReporter';
import { isRight } from 'fp-ts/Either';
import { promises as fs } from 'fs';

import { Environment, ENVIRONMENT } from './environment';

export type Logger = {
  readonly log: (...msg: unknown[]) => void;
  readonly error: (...msg: unknown[]) => void;
  readonly warn: (...msg: unknown[]) => void;
};

export const runAction = async ({env, log}: {
  env: Environment,
  log: Logger,
}) => {
  const json = await fs.readFile(env.GITHUB_EVENT_PATH);

  const error = (msg: string) => {
    log.error(`::error ::${msg}`);
    return new Error(msg);
  }

  if (env.GITHUB_EVENT_NAME === 'push') {
    throw new Error('TODO');
  } else if (env.GITHUB_EVENT_NAME === 'pull_request') {
    throw new Error('TODO');
  } else {
    throw error(`Unsupported GitHub event: ${env.GITHUB_EVENT_NAME}`);
  }
}

export const main = async ({ env, log }: {
  env: NodeJS.ProcessEnv,
  log: Logger,
}) => {

  const validate = ENVIRONMENT.decode(env);
  if (isRight(validate)) {
    return runAction({
      env: validate.right,
      log
    });
  } else {
    const errors = PathReporter.report(validate);
    for(const error of errors) {
      log.error(error);
    }
    throw new Error('Invalid config, unable to continue');
  }

}