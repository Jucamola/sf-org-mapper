import { TestContext } from '@salesforce/core/lib/testSetup.js';
// import { expect } from 'chai';
// import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
// import MapOrg from '../../../src/commands/map/org.js';

describe('map org', () => {
  const $$ = new TestContext();
  // let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    // sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });

  afterEach(() => {
    $$.restore();
  });

  /*
  it('runs hello', async () => {
    await MapOrg.run([]);
    const output = sfCommandStubs.log
      .getCalls()
      .flatMap((c) => c.args)
      .join('\n');
    expect(output).to.include('hello world');
  });

  it('runs hello with --json and no provided name', async () => {
    const result = await MapOrg.run([]);
    expect(result.path).to.equal(
      '/home/jucamola/projects/Salesforce/esto_es_de_locos/org-mapper/src/commands/map/org.ts'
    );
  });

  it('runs hello world --name Astro', async () => {
    await MapOrg.run(['--name', 'Astro']);
    const output = sfCommandStubs.log
      .getCalls()
      .flatMap((c) => c.args)
      .join('\n');
    expect(output).to.include('hello Astro');
  });
  */
});
