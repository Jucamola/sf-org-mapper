import { Connection } from '@salesforce/core';
import { parse } from 'csv-parse/sync';
import { BulkV2 } from 'jsforce/lib/api/bulk.js';
import { MetadataComponentDependency } from './types.js';

export async function queryDependencies(conn: Connection): Promise<MetadataComponentDependency[]> {
  const wheres = [
    "MetadataComponentType = 'ApexClass'",
    "RefMetadataComponentType = 'ApexClass'",
    "MetadataComponentType = 'ApexTrigger'",
    "MetadataComponentType = 'CustomObject'",
    "RefMetadataComponentType = 'CustomObject'",
    "MetadataComponentType = 'CustomField'",
    "RefMetadataComponentType = 'CustomField'",
  ];

  const metadataComponentDependencies = [];
  for (const where of wheres) {
    // eslint-disable-next-line no-await-in-loop
    const records = await queryBulk(conn, where);
    metadataComponentDependencies.push(...records);
  }
  return metadataComponentDependencies;
}

async function queryBulk(conn: Connection, where: string): Promise<MetadataComponentDependency[]> {
  const result = await new BulkV2(conn).query(
    `SELECT Id, MetadataComponentId, MetadataComponentNamespace, 
    MetadataComponentName, MetadataComponentType, 
    RefMetadataComponentId, RefMetadataComponentNamespace, 
    RefMetadataComponentName, RefMetadataComponentType 
  FROM MetadataComponentDependency WHERE ${where}`,
    { tooling: true, pollTimeout: 120_000, pollInterval: 2000 }
  );

  return result.map((record) => ({
    Id: record.Id,
    MetadataComponentId: record.MetadataComponentId as string,
    MetadataComponentNamespace: record.MetadataComponentNamespace as string,
    MetadataComponentName: record.MetadataComponentName as string,
    MetadataComponentType: record.MetadataComponentType as string,
    RefMetadataComponentId: record.RefMetadataComponentId as string,
    RefMetadataComponentNamespace: record.RefMetadataComponentNamespace as string,
    RefMetadataComponentName: record.RefMetadataComponentName as string,
    RefMetadataComponentType: record.RefMetadataComponentType as string,
  }));
}

export function parseCSV(csv: string): MetadataComponentDependency[] {
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
