import { Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const commonFlagMessages = Messages.loadMessages('sf-org-mapper', 'commonMessages');

export const commonFlags = {
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
    summary: commonFlagMessages.getMessage('flags.include-types.summary'),
    aliases: ['includetypes', 'types'],
    multiple: true,
    delimiter: ',',
  }),
  'exclude-types': Flags.string({
    summary: commonFlagMessages.getMessage('flags.exclude-types.summary'),
    aliases: ['excludetypes'],
    multiple: true,
    delimiter: ',',
  }),
  'include-namespaces': Flags.string({
    char: 'n',
    summary: commonFlagMessages.getMessage('flags.include-namespaces.summary'),
    aliases: ['includenamespaces', 'namespaces'],
    multiple: true,
    delimiter: ',',
  }),
  'exclude-namespaces': Flags.string({
    summary: commonFlagMessages.getMessage('flags.exclude-namespaces.summary'),
    aliases: ['excludenamespaces'],
    multiple: true,
    delimiter: ',',
  }),
  'include-manageable-states': Flags.string({
    char: 'm',
    summary: commonFlagMessages.getMessage('flags.include-manageable-states.summary'),
    aliases: ['includemanageablestates', 'manageable-states', 'manageablestates'],
    multiple: true,
    delimiter: ',',
  }),
  'exclude-manageable-states': Flags.string({
    summary: commonFlagMessages.getMessage('flags.exclude-manageable-states.summary'),
    aliases: ['exclude-manageablestates'],
    multiple: true,
    delimiter: ',',
  }),
  'include-package-info': Flags.boolean({
    char: 'p',
    summary: commonFlagMessages.getMessage('flags.include-package-info.summary'),
    aliases: ['includepackageinfo'],
  }),
};

export const partialGraphCommonFlags = {
  metadata: Flags.string({
    summary: commonFlagMessages.getMessage('flags.metadata.summary'),
    required: true,
    multiple: true,
    delimiter: ',',
  }),
  merge: Flags.boolean({
    summary: commonFlagMessages.getMessage('flags.merge.summary'),
  }),
  transitive: Flags.boolean({
    summary: commonFlagMessages.getMessage('flags.transitive.summary'),
  }),
};
