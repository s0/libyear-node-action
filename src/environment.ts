import * as t from 'io-ts';

export const ENVIRONMENT = t.intersection([
  t.type({
    /** Implicit environment variable passed by GitHub */
    GITHUB_EVENT_PATH: t.string,
    GITHUB_EVENT_NAME: t.string,
  }),
  t.partial({
    /**
     * Folder within the repository to run libyear on
     */
    FOLDER: t.string,
  }),
]);

export type Environment = t.TypeOf<typeof ENVIRONMENT>;
