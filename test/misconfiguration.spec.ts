import { runAction, expectRunError } from './util';

describe('misconfiguration', () => {
  it('missing GitHub env vars', async () => {
    await expect(
      runAction({
        eventJson: 'missing-var',
        logToConsole: false,
      })
    ).rejects.toThrowError('Invalid config, unable to continue');
  });

  it('missing event file', async () => {
    await expect(
      runAction({
        eventJson: 'missing-file',
        eventName: 'push',
        logToConsole: false,
      })
    ).rejects.toThrowError('ENOENT: no such file or directory');
  });

  it('unsupported event', async () => {
    await expectRunError(
      runAction({
        eventJson: {},
        eventName: 'foo',
        logToConsole: false,
      }),
      (err) => {
        expect(err.output.stderr).toMatchSnapshot();
      }
    );
  });
});
