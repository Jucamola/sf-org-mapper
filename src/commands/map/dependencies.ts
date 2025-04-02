import { SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { buildDependenciesGraphs, buildDependenciesGraphWithoutRedundancy } from 'sf-org-mapper-lib';
import { buildPartialGraphFromOptions } from '../../utils/graph.js';
import { commonFlags, partialGraphCommonFlags } from '../../utils/flags.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sf-org-mapper', 'map.dependencies');

export type MapDependenciesResult = {
  result: string;
};

export default class MapDependencies extends SfCommand<MapDependenciesResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');

  public static readonly flags = {
    ...commonFlags,
    ...partialGraphCommonFlags,
  };

  public async run(): Promise<MapDependenciesResult> {
    const { flags } = await this.parse(MapDependencies);
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
      fileName: 'dependencies',
      includePackageInfo: flags['include-package-info'],
      nodeReferences: flags['metadata'],
      merge: flags['merge'] ?? false,
      transitive: flags['transitive'] ?? false,
      buildPartialGraph: buildDependenciesGraphs,
      buildPartialGraphTransitive: buildDependenciesGraphWithoutRedundancy,
    };

    return buildPartialGraphFromOptions(options) as Promise<MapDependenciesResult>;
  }
}
