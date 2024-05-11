import { SfCommand } from '@salesforce/sf-plugins-core';
import cytoscape from 'cytoscape';
import { ApexClass, CustomField, MetadataComponentDependency, OrgMetadata, OrgMetadataMap } from './types.js';

export function buildGraph(
  orgMetadata: OrgMetadata,
  metadataComponentDependencies: MetadataComponentDependency[],
  sfCommand: SfCommand<unknown>
): cytoscape.Core {
  const cy = cytoscape();

  for (const orgMetadataMap of orgMetadata.values()) {
    for (const [id, nodeData] of orgMetadataMap.entries()) {
      cy.add({
        group: 'nodes',
        data: {
          id,
          Label: nodeData.Label,
          Type: nodeData.Type,
          isTest: (nodeData as ApexClass)?.IsTest,
        },
      });
    }
  }

  metadataComponentDependencies.forEach((edge) => {
    try {
      cy.add({ group: 'edges', data: { source: edge.MetadataComponentId, target: edge.RefMetadataComponentId } });
    } catch (e) {
      if (e instanceof Error) {
        sfCommand.warn(e.message);
      }
    }
  });

  return cy;
}

export function linkCustomFieldsWithObjects(cy: cytoscape.Core, orgMetadata: OrgMetadata): cytoscape.Core {
  const sObjects = new Map([
    ...(orgMetadata.get('StandardEntity') as unknown as OrgMetadataMap),
    ...(orgMetadata.get('CustomObject') as unknown as OrgMetadataMap),
  ]);

  cy.nodes('[type = "CustomField"]').forEach((customFieldNode) => {
    const customFieldNodeData = orgMetadata.get('CustomField')?.get(customFieldNode.id()) as CustomField;
    const tableEnumOrId = customFieldNodeData?.TableEnumOrId;
    if (cy.getElementById(tableEnumOrId).size() === 0) {
      const entityDefinition = sObjects.get(customFieldNodeData?.TableEnumOrId);
      cy.add({
        group: 'nodes',
        data: { id: tableEnumOrId, name: entityDefinition?.Label ?? tableEnumOrId, type: entityDefinition?.Type },
      });
    }
    cy.add({ group: 'edges', data: { source: customFieldNode.id(), target: tableEnumOrId } });
  });

  return cy;
}

export function linkObjectsWithTriggers(cy: cytoscape.Core): cytoscape.Core {
  cy.nodes('[type = "ApexTrigger"]').forEach((apexTrigger) => {
    apexTrigger.outgoers('[type = "CustomObject"],[type = "StandardEntity"],[type = "User"]').forEach((sObject) => {
      cy.add({ group: 'edges', data: { source: sObject.id(), target: apexTrigger.id() } });
    });
  });

  return cy;
}
