import { AppConfigBase } from './app-config-base';

describe('AppConfigBase', () => {
  it('proxies constructor argument', () => {
    class Test extends AppConfigBase {}

    const test = new Test({
      logger: {
        type: 'cloud-logging',
      },
      youtube: {
        dataApiKey: 'TEST_STRING',
      },
    });

    expect(test.logger.type).toBe('cloud-logging');
  });
});
