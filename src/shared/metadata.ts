import { Connection } from '@salesforce/core';
import { Record } from 'jsforce';
import { ManageableState, OrgMetadata, OrgMetadataMap, OrgMetadataTypes, Status } from './types.js';

export async function queryMetadatas(conn: Connection): Promise<OrgMetadata> {
  const orgMetadata = new Map();
  const [apexClasses, apexTriggers, customFields, standardEntities, customObjects] = await Promise.all([
    queryApexClasses(conn),
    queryApexTriggers(conn),
    queryCustomFields(conn),
    queryStandardEntity(conn),
    queryCustomObjects(conn),
  ]);
  orgMetadata.set('ApexClass', apexClasses);
  orgMetadata.set('ApexTrigger', apexTriggers);
  orgMetadata.set('CustomField', customFields);
  orgMetadata.set('StandardEntity', standardEntities);
  orgMetadata.set('CustomObject', customObjects);
  return orgMetadata;
}

async function queryApexClasses(conn: Connection): Promise<OrgMetadataMap> {
  const apexClasses = await conn.tooling.query(
    `SELECT  Id, NamespacePrefix, Name, ApiVersion, Status, IsValid, BodyCrc, LengthWithoutComments, 
             CreatedDate, CreatedById, LastModifiedDate, LastModifiedById, SystemModstamp, ManageableState, SymbolTable 
    FROM ApexClass`,
    {
      autoFetch: true,
    }
  );

  return new Map(
    apexClasses.records.map((record) => [
      record.Id as string,
      {
        Label: record.Name as string,
        Type: 'ApexClass' as OrgMetadataTypes,
        ApiVersion: Number(record.ApiVersion),
        IsTest:
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          (record.SymbolTable?.tableDeclaration?.annotations?.some(
            (annotation: { name: string }) => annotation.name === 'IsTest'
          ) as boolean) ?? false,
        IsValid: record.IsValid as boolean,
        LengthWithoutComments: Number(record.LengthWithoutComments),
        ManageableState: record.ManageableState as ManageableState,
        Name: record.Name as string,
        Status: record.Status as Status,
        NamespacePrefix: record.NamespacePrefix as string,
      },
    ])
  );
}

async function queryApexTriggers(conn: Connection): Promise<OrgMetadataMap> {
  const apexTriggers = await conn.tooling.query(
    `SELECT  Id, NamespacePrefix, Name, ApiVersion, Status, IsValid, BodyCrc, LengthWithoutComments, 
             CreatedDate, CreatedById, LastModifiedDate, LastModifiedById, SystemModstamp, ManageableState 
    FROM ApexTrigger`,
    {
      autoFetch: true,
    }
  );

  return new Map(
    apexTriggers.records.map((record) => [
      record.Id as string,
      {
        Label: record.Name as string,
        Type: 'ApexTrigger' as OrgMetadataTypes,
        Name: record.Name as string,
        ApiVersion: Number(record.ApiVersion),
        Status: record.Status as Status,
        IsValid: record.IsValid as boolean,
        LengthWithoutComments: Number(record.LengthWithoutComments),
        ManageableState: record.ManageableState as ManageableState,
        NamespacePrefix: record.NamespacePrefix as string,
      },
    ])
  );
}

async function queryCustomFields(conn: Connection): Promise<OrgMetadataMap> {
  const customFields = await conn.tooling.query(
    `SELECT Id, TableEnumOrId, DeveloperName, ManageableState, EntityDefinitionId, EntityDefinition.QualifiedApiName, NamespacePrefix
     FROM CustomField`,
    {
      autoFetch: true,
    }
  );

  return new Map(
    customFields.records.map((record) => [
      record.Id as string,
      {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        Label: `${record.EntityDefinition?.QualifiedApiName}.${record.DeveloperName}__c`,
        Type: 'CustomField' as OrgMetadataTypes,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        DeveloperName: `${record.EntityDefinition?.QualifiedApiName}.${record.DeveloperName}__c`,
        TableEnumOrId: record.TableEnumOrId as string,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        EntityDefinitionName: record.EntityDefinition?.QualifiedApiName as string,
        ManageableState: record.ManageableState as ManageableState,
        NamespacePrefix: record.NamespacePrefix as string,
      },
    ])
  );
}

async function queryStandardEntity(conn: Connection): Promise<OrgMetadataMap> {
  let offset = 0;
  let entityDefinitionRecords: Record[] = [];
  let limitedEntityDefinitionRecords;
  do {
    // eslint-disable-next-line no-await-in-loop
    limitedEntityDefinitionRecords = await conn.tooling.query(
      `SELECT Id, DurableId, QualifiedApiName, PublisherId, NamespacePrefix
       FROM EntityDefinition 
       WHERE PublisherId = 'System'
       LIMIT 2000
       OFFSET ${offset}`
    );
    offset += 2000;
    entityDefinitionRecords = [...entityDefinitionRecords, ...limitedEntityDefinitionRecords.records];
  } while (limitedEntityDefinitionRecords.records.length === 2000);

  const result = new Map(
    entityDefinitionRecords.map((record) => [
      record.DurableId,
      {
        Label: record.QualifiedApiName as string,
        QualifiedApiName: record.QualifiedApiName as string,
        Type: 'StandardEntity' as OrgMetadataTypes,
        ManageableState: 'standardEntity' as ManageableState,
        NamespacePrefix: record.NamespacePrefix as string,
      },
    ])
  );

  result.set('AggregateResult', {
    Label: 'AggregateResult',
    QualifiedApiName: 'AggregateResult',
    Type: 'StandardEntity',
    ManageableState: 'standardEntity' as ManageableState,
    NamespacePrefix: '',
  });

  result.set('EntityDefinition', {
    Label: 'EntityDefinition',
    QualifiedApiName: 'EntityDefinition',
    Type: 'StandardEntity',
    ManageableState: 'standardEntity' as ManageableState,
    NamespacePrefix: '',
  });

  result.set('FieldDefinition', {
    Label: 'FieldDefinition',
    QualifiedApiName: 'FieldDefinition',
    Type: 'StandardEntity',
    ManageableState: 'standardEntity' as ManageableState,
    NamespacePrefix: '',
  });

  return result;
}

async function queryCustomObjects(conn: Connection): Promise<OrgMetadataMap> {
  const customObjectsRecords = await conn.tooling.query(
    `SELECT Id, DeveloperName, ManageableState, NamespacePrefix
       FROM CustomObject`,
    {
      autoFetch: true,
    }
  );

  return new Map(
    customObjectsRecords.records.map((record) => [
      record.Id as string,
      {
        Label: record.DeveloperName as string,
        DeveloperName: record.DeveloperName as string,
        Type: 'CustomObject',
        ManageableState: record.ManageableState as ManageableState,
        NamespacePrefix: record.NamespacePrefix as string,
      },
    ])
  );
}
