import { SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { buildGraphFromOptions } from '../../utils/graph.js';
import { commonFlags } from '../../utils/flags.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sf-org-mapper', 'map.org');

export type MapOrgResult = {
  result: string;
};

export default class MapOrg extends SfCommand<MapOrgResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');

  public static readonly flags = {
    'target-org': commonFlags['target-org'],
    'api-version': commonFlags['api-version'],
    files: commonFlags['files'],
    'output-dir': commonFlags['output-dir'],
    'include-package-info': commonFlags['include-package-info'],
  };

  public async run(): Promise<MapOrgResult> {
    const { flags } = await this.parse(MapOrg);
    const options = {
      files: flags['files'],
      outputDir: flags['output-dir'],
      apiVersion: flags['api-version']!,
      targetOrg: flags['target-org'],
      includePackageInfo: flags['include-package-info'],
      fileName: 'org',
    };
    return buildGraphFromOptions(options) as Promise<MapOrgResult>;
  }
}
