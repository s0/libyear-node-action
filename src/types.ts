export type Logger = {
  readonly log: (...msg: unknown[]) => void;
  readonly table: (data: unknown[]) => void;
  readonly error: (...msg: unknown[]) => void;
  readonly warn: (...msg: unknown[]) => void;
};
