import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { queryDependencies } from '../../shared/metadataComponentDependency.js';
import { buildGraph, linkCustomFieldsWithObjects } from '../../shared/graph.js';
import { queryMetadatas } from '../../shared/metadata.js';
import { writeGexf } from '../../shared/file.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sf-org-mapper', 'map.org');

export type MapOrgResult = {
  path: string;
};

export default class MapOrg extends SfCommand<MapOrgResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
  };

  public async run(): Promise<MapOrgResult> {
    const { flags } = await this.parse(MapOrg);

    const conn = flags['target-org'].getConnection(flags['api-version'] as string);

    const dependencyMetadataRecords = await queryDependencies(conn);

    const filterTypes = ['ApexClass', 'ApexTrigger', 'CustomObject', 'StandardEntity', 'CustomField', 'User'];
    const filteredRecords = dependencyMetadataRecords.filter(
      (record) =>
        filterTypes.includes(record.MetadataComponentType) && filterTypes.includes(record.RefMetadataComponentType)
    );

    const orgMetadata = await queryMetadatas(conn);

    let cy = buildGraph(orgMetadata, filteredRecords, this);

    cy = linkCustomFieldsWithObjects(cy, orgMetadata);

    writeGexf(cy.elements(), 'OrgMap', orgMetadata);

    return {
      path: 'src/commands/map/org.ts',
    };
  }
}
