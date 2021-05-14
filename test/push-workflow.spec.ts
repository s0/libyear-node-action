import { runAction } from "./util";

describe('push-workflow', () => {

  it('basic-config', async () => {
    await runAction({
      eventJson: {},
      eventName: 'push',
      logToConsole: true,
    })
  })


});
