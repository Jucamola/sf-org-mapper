import { SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { buildGraphFromOptions } from '../../utils/graph.js';
import { commonFlags } from '../../utils/flags.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sf-org-mapper', 'map.metadata');

export type MapMetadataResult = {
  result: string;
};

export default class MapMetadata extends SfCommand<MapMetadataResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    ...commonFlags,
  };

  public async run(): Promise<MapMetadataResult> {
    const { flags } = await this.parse(MapMetadata);
    const options = {
      files: flags['files'],
      outputDir: flags['output-dir'],
      apiVersion: flags['api-version']!,
      targetOrg: flags['target-org'],
      includeTypes: flags['include-types'],
      excludeTypes: flags['exclude-types'],
      includeNamespaces: flags['include-namespaces'],
      excludeNamespaces: flags['exclude-namespaces'],
      includeManageableStates: flags['include-manageable-states'],
      excludeManageableStates: flags['exclude-manageable-states'],
      fileName: 'metadata',
      includePackageInfo: flags['include-package-info'],
    };
    return buildGraphFromOptions(options) as Promise<MapMetadataResult>;
  }
}
