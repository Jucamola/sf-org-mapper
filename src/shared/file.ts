import * as fs from 'node:fs';
import * as path from 'node:path';
import createGraph from 'ngraph.graph';
import gexf from 'ngraph.gexf';
import { parse } from 'csv-parse/sync';
import { MetadataComponentDependency, OrgMetadata, OrgMetadataTypes } from './types.js';

export function parseCSVFile(file: string): MetadataComponentDependency[] {
  const csvFilePath = path.resolve(file);
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
  return parseCSV(fileContent);
}

function parseCSV(csv: string): MetadataComponentDependency[] {
  const headers = [
    'Id',
    'MetadataComponentId',
    'MetadataComponentNamespace',
    'MetadataComponentName',
    'MetadataComponentType',
    'RefMetadataComponentId',
    'RefMetadataComponentNamespace',
    'RefMetadataComponentName',
    'RefMetadataComponentType',
  ];

  const records: MetadataComponentDependency[] = parse(csv, {
    columns: headers,
    delimiter: ';',
  }) as MetadataComponentDependency[];

  return records;
}

export function writeGexf(
  cytoscapeCollection: cytoscape.CollectionReturnValue,
  fileName: string,
  orgMetadata: OrgMetadata
): void {
  const ngraphGraph = createGraph();

  cytoscapeCollection.nodes().forEach((cyNode) => {
    const nodeId = cyNode.id();
    const type = cyNode.attr('Type') as OrgMetadataTypes;
    const isSuccessor = cyNode.attr('isSuccessor') as boolean;
    const isPredecessor = cyNode.attr('isPredecessor') as boolean;
    const nodeMetadata = orgMetadata.get(type)?.get(nodeId) ?? { Label: nodeId, Type: type };
    const { Label, ...nodeAttributes } = nodeMetadata;
    ngraphGraph.addNode(nodeId, {
      label: Label,
      ...nodeAttributes,
      ...{ isSuccessor, isPredecessor },
    });
  });

  cytoscapeCollection.edges().forEach((cyEdge) => {
    const sourceNodeId = cyEdge.source().id();
    const targetNodeId = cyEdge.target().id();
    ngraphGraph.addLink(sourceNodeId, targetNodeId);
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const gexfFile = gexf.save(ngraphGraph);
  fs.writeFileSync(fileName + '.gexf', gexfFile as string);
}
