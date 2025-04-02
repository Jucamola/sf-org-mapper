import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { action } from '@oclif/core/ux';
import { parseCSVFile, queryMetadatas, buildGraph, writeGexf } from 'sf-org-mapper-lib';
import {
  ManageableState,
  MetadataComponentDependency,
  OrgMetadataTypeNames,
} from 'sf-org-mapper-lib/lib/types/sObjects.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sf-org-mapper', 'map.metadata');
const commonFlagMessages = Messages.loadMessages('sf-org-mapper', 'commonFlags');

export type MapMetadataResult = {
  result: string;
};

export default class MapMetadata extends SfCommand<MapMetadataResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

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
    'include-types': Flags.string({
      char: 't',
      summary: messages.getMessage('flags.include-types.summary'),
      aliases: ['includetypes', 'types'],
      multiple: true,
      delimiter: ',',
    }),
    'exclude-types': Flags.string({
      summary: messages.getMessage('flags.exclude-types.summary'),
      aliases: ['excludetypes'],
      multiple: true,
      delimiter: ',',
    }),
    'include-namespaces': Flags.string({
      char: 'n',
      summary: messages.getMessage('flags.include-namespaces.summary'),
      aliases: ['includenamespaces', 'namespaces'],
      multiple: true,
      delimiter: ',',
    }),
    'exclude-namespaces': Flags.string({
      summary: messages.getMessage('flags.exclude-namespaces.summary'),
      aliases: ['excludenamespaces'],
      multiple: true,
      delimiter: ',',
    }),
    'include-manageable-states': Flags.string({
      char: 'm',
      summary: messages.getMessage('flags.include-manageable-states.summary'),
      aliases: ['includemanageablestates', 'manageable-states', 'manageablestates'],
      multiple: true,
      delimiter: ',',
    }),
    'exclude-manageable-states': Flags.string({
      summary: messages.getMessage('flags.exclude-manageable-states.summary'),
      aliases: ['exclude-manageablestates'],
      multiple: true,
      delimiter: ',',
    }),
  };

  public async run(): Promise<MapMetadataResult> {
    const { flags } = await this.parse(MapMetadata);
    const connection = flags['target-org'].getConnection(flags['api-version']);
    const includeTypes = flags['include-types'];
    const excludeTypes = flags['exclude-types'];
    const includeNamespaces = flags['include-namespaces'];
    const excludeNamespaces = flags['exclude-namespaces'];
    const includeManageableStates = flags['include-manageable-states'];
    const excludeManageableStates = flags['exclude-manageable-states'];

    const includeNamespaces2 = includeNamespaces?.map((namespace) => {
      if (namespace === '') {
        return null;
      }
      return namespace;
    });

    action.start('Loading dependencies...');
    let metadataComponentDependencies: MetadataComponentDependency[] = [];
    flags['files'].forEach((file) => {
      metadataComponentDependencies = metadataComponentDependencies.concat(parseCSVFile(file));
    });
    action.stop();
    action.start('Loading metadata from org...');
    const metadatas = await queryMetadatas(connection, {
      include: includeTypes as OrgMetadataTypeNames[] | undefined,
      exclude: excludeTypes as OrgMetadataTypeNames[] | undefined,
    });
    action.stop();
    action.start('Creating graph...');
    const graph = buildGraph(metadatas, metadataComponentDependencies, {
      namespacePrefixes: {
        include: includeNamespaces2 as string[] | undefined,
        exclude: excludeNamespaces,
      },
      manageableStates: {
        include: includeManageableStates as ManageableState[] | undefined,
        exclude: excludeManageableStates as ManageableState[] | undefined,
      },
    });
    writeGexf(graph.elements(), `${flags['output-dir'] ?? '.'}/metadata`, metadatas);
    action.stop();
    return {
      result: JSON.stringify(graph.json()),
    };
  }
}
