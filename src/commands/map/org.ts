import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { parseCSVFile, queryMetadatas, buildGraph, writeGexf } from 'sf-org-mapper-lib';
import { MetadataComponentDependency } from 'sf-org-mapper-lib/lib/types/sObjects.js';
import { action } from '@oclif/core/ux';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sf-org-mapper', 'map.org');
const commonFlagMessages = Messages.loadMessages('sf-org-mapper', 'commonFlags');

export type MapOrgResult = {
  result: string;
};

export default class MapOrg extends SfCommand<MapOrgResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');

  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'api-version': Flags.orgApiVersion({
      char: 'a',
      summary: commonFlagMessages.getMessage('flags.api-version.summary'),
      description: commonFlagMessages.getMessage('flags.api-version.description'),
    }),
    files: Flags.string({
      char: 'f',
      summary: commonFlagMessages.getMessage('flags.files.summary'),
      aliases: ['medatatacomponentdependenciesfiles'],
      multiple: true,
      delimiter: ',',
      required: true,
    }),
    'output-dir': Flags.directory({
      char: 'd',
      summary: commonFlagMessages.getMessage('flags.output-dir.summary'),
      aliases: ['outputdir'],
    }),
  };

  public async run(): Promise<MapOrgResult> {
    const { flags } = await this.parse(MapOrg);
    const connection = flags['target-org'].getConnection(flags['api-version']);
    action.start('Loading dependencies...');
    let metadataComponentDependencies: MetadataComponentDependency[] = [];
    flags['files'].forEach((file) => {
      metadataComponentDependencies = metadataComponentDependencies.concat(parseCSVFile(file));
    });
    action.stop();
    action.start('Loading metadata from org...');
    const metadatas = await queryMetadatas(connection);
    action.stop();
    action.start('Creating graph...');
    const graph = buildGraph(metadatas, metadataComponentDependencies);
    writeGexf(graph.elements(), `${flags['output-dir'] ?? '.'}/org`, metadatas);
    action.stop();
    return {
      result: JSON.stringify(graph.json()),
    };
  }
}
