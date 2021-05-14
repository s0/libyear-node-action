import { loadSpec } from './spec';
import { getResultsTable, getTotals } from '../src/libyear';

import { runAction } from './util';

describe('push-workflow', () => {
  it('basic-config', async () => {
    const run = await runAction({
      eventJson: {},
      eventName: 'push',
      logToConsole: false,
      copySpec: '001',
    });

    const spec = await loadSpec('001');
    const specTotals = getTotals(spec);

    // Ensure that table is printed out
    expect(run.stdout).toMatch(
      `TABLE: ${JSON.stringify(getResultsTable(spec))}`
    );

    // Ensure that variables are set
    for (const metric of ['drift', 'pulse'] as const) {
      expect(specTotals.get(metric)).toBeTruthy();
      expect(run.stdout).toMatch(
        `::set-output name=${metric}::${Number(specTotals.get(metric)).toFixed(
          2
        )}`
      );
    }
    for (const metric of ['releases', 'major', 'minor', 'patch'] as const) {
      expect(specTotals.get(metric)).toBeTruthy();
      expect(run.stdout).toMatch(
        `::set-output name=${metric}::${specTotals.get(metric)}`
      );
    }
  });
});
