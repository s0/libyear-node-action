import * as t from 'io-ts';

export const ENVIRONMENT = t.type({
  /** Implicit environment variable passed by GitHub */
  GITHUB_EVENT_PATH: t.string,
  GITHUB_EVENT_NAME: t.string,
});

export type Environment = t.TypeOf<typeof ENVIRONMENT>;
