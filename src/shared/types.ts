export type MetadataComponentDependency = {
  MetadataComponentId: string;
  MetadataComponentNamespace: string;
  MetadataComponentName: string;
  MetadataComponentType: string;
  RefMetadataComponentId: string;
  RefMetadataComponentNamespace: string;
  RefMetadataComponentName: string;
  RefMetadataComponentType: string;
};

export type NodeData = {
  Label: string;
  Type: OrgMetadataTypes;
};

export type ManageableState =
  | 'beta'
  | 'deleted'
  | 'deprecated'
  | 'deprecatedEditable'
  | 'installed'
  | 'installedEditable'
  | 'released'
  | 'unmanaged'
  | 'standardEntity';

export type Status = 'Active' | 'Deleted' | 'Inactive';

export type ApexClass = NodeData & {
  ApiVersion: number;
  IsTest: boolean;
  IsValid: boolean;
  LengthWithoutComments: number;
  ManageableState: ManageableState;
  Name: string;
  Status: Status;
  NamespacePrefix: string;
};

export type ApexTrigger = NodeData & {
  Name: string;
  ApiVersion: number;
  Status: Status;
  IsValid: boolean;
  LengthWithoutComments: number;
  ManageableState: ManageableState;
  NamespacePrefix: string;
};

export type CustomField = NodeData & {
  DeveloperName: string;
  TableEnumOrId: string;
  EntityDefinitionName: string;
  ManageableState: ManageableState;
  NamespacePrefix: string;
};

export type StandardEntity = NodeData & {
  QualifiedApiName: string;
  ManageableState: ManageableState;
  NamespacePrefix: string;
};

export type CustomObject = NodeData & {
  DeveloperName: string;
  ManageableState: ManageableState;
  NamespacePrefix: string;
};

export type Id = string;

export type OrgMetadataTypes =
  | 'ApexClass'
  | 'ApexTrigger'
  | 'CustomField'
  | 'StandardEntity'
  | 'CustomObject'
  | 'Unknown';
export type OrgMetadataMap = Map<Id, OrgMetadataTypeValues>;
export type OrgMetadataTypeValues = ApexClass | ApexTrigger | CustomField | StandardEntity | CustomObject;

export type OrgMetadata = Map<OrgMetadataTypes, OrgMetadataMap>;
