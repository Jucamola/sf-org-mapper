import { action } from '@oclif/core/ux';
import { Org } from '@salesforce/core';
import { buildGraph, parseCSVFile, queryMetadatas, queryPackage2Members, writeGexf } from 'sf-org-mapper-lib';
import {
  ManageableState,
  MetadataComponentDependency,
  NodeReference,
  OrgMetadata,
  OrgMetadataTypeNames,
  Package2MembersMap,
} from 'sf-org-mapper-lib/lib/types/sObjects.js';
import { MapMetadataResult } from '../commands/map/metadata.js';
import MapOrg from '../commands/map/org.js';
import { MapDependenciesResult } from '../commands/map/dependencies.js';
import { MapUsesResult } from '../commands/map/uses.js';

type BuildGraphOptions = {
  files: string[];
  outputDir?: string;
  apiVersion: string;
  targetOrg: Org;
  includePackageInfo: boolean;
  includeTypes?: string[];
  excludeTypes?: string[];
  includeNamespaces?: string[];
  excludeNamespaces?: string[];
  includeManageableStates?: string[];
  excludeManageableStates?: string[];
  fileName: string;
};

type BuildPartialGraphOptions = BuildGraphOptions & {
  nodeReferences: string[];
  merge: boolean;
  transitive: boolean;
  buildPartialGraph: (
    graph: cytoscape.Core,
    nodeRef: NodeReference[],
    merge?: boolean
  ) => cytoscape.CollectionReturnValue[];
  buildPartialGraphTransitive: (
    graph: cytoscape.Core,
    nodeRef: NodeReference,
    merge?: boolean
  ) => cytoscape.CollectionReturnValue;
};

async function prepareGraph(
  options: BuildGraphOptions
): Promise<{ graph: cytoscape.Core; package2Members?: Package2MembersMap; metadatas: OrgMetadata }> {
  const connection = options.targetOrg.getConnection(options.apiVersion);

  action.start('Loading dependencies...');
  let metadataComponentDependencies: MetadataComponentDependency[] = [];
  options.files.forEach((file) => {
    metadataComponentDependencies = metadataComponentDependencies.concat(parseCSVFile(file));
  });
  action.stop();

  action.start('Loading metadata from org...');
  const metadatas = await queryMetadatas(connection, {
    include: options.includeTypes as OrgMetadataTypeNames[] | undefined,
    exclude: options.excludeTypes as OrgMetadataTypeNames[] | undefined,
  });

  const includeNamespacesWithNull = options.includeNamespaces?.map((namespace) => {
    if (namespace === '') {
      return null;
    }
    return namespace;
  });

  const excludeNamespacesWithNull = options.excludeNamespaces?.map((namespace) => {
    if (namespace === '') {
      return null;
    }
    return namespace;
  });

  let package2Members;
  if (options.includePackageInfo) {
    action.start('Loading packages info...');
    package2Members = await queryPackage2Members(connection);
    action.stop();
  }

  action.start('Creating graph...');
  const graph = buildGraph(metadatas, metadataComponentDependencies, {
    namespacePrefixes: {
      include: includeNamespacesWithNull as string[] | undefined,
      exclude: excludeNamespacesWithNull as string[] | undefined,
    },
    manageableStates: {
      include: options.includeManageableStates as ManageableState[] | undefined,
      exclude: options.excludeManageableStates as ManageableState[] | undefined,
    },
  });
  action.stop();

  return { graph, package2Members, metadatas };
}

export async function buildGraphFromOptions(options: BuildGraphOptions): Promise<MapMetadataResult | MapOrg> {
  const { graph, package2Members, metadatas } = await prepareGraph(options);

  action.start('Creating graph file...');
  writeGexf(
    graph.elements(),
    `${options.outputDir ?? '.'}/${options.fileName}`,
    metadatas,
    package2Members,
    options.includePackageInfo
  );
  action.stop();
  return {
    result: JSON.stringify(graph.json()),
  };
}

export async function buildPartialGraphFromOptions(
  options: BuildPartialGraphOptions
): Promise<MapDependenciesResult | MapUsesResult> {
  const { graph, package2Members, metadatas } = await prepareGraph(options);

  const nodeReferences = options.nodeReferences.map((nodeReference) => {
    const metadataFlagParts = nodeReference.split(':');
    return metadataFlagParts.length === 2
      ? { Label: metadataFlagParts[1], Type: metadataFlagParts[0] as OrgMetadataTypeNames }
      : metadataFlagParts[0];
  });

  let partialGraphs;
  if (options.transitive) {
    partialGraphs = [options.buildPartialGraphTransitive(graph, nodeReferences[0], options.merge)];
  } else {
    partialGraphs = options.buildPartialGraph(graph, nodeReferences, options.merge);
  }

  action.start('Creating graph files...');
  partialGraphs.forEach((partialGraph, index) =>
    writeGexf(
      partialGraph,
      `${options.outputDir ?? '.'}/${options.fileName}-${index}`,
      metadatas,
      package2Members,
      options.includePackageInfo
    )
  );

  action.stop();
  return {
    result: JSON.stringify(partialGraphs.map((partialGraph) => partialGraph.json())),
  };
}
