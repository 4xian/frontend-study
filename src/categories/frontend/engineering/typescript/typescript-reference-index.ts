import type {
  ReferenceCoverageDepth,
  ReferenceIndexItemManifest,
  ReferenceIndexManifest,
  ReferenceTargetManifest,
} from '@/common/catalog/types'
import {
  typeScriptObservationScopes,
  typeScriptTsConfigItems,
} from './typescript-tsconfig-reference.ts'

type ReferenceDefinition = readonly [
  officialKey: string,
  name: string,
  officialUrl: string,
  depth: ReferenceCoverageDepth,
  target?: ReferenceTargetManifest,
]

interface TypeScriptReferenceIndexItem extends ReferenceIndexItemManifest {
  officialKey: string
}

const languageFoundationsEntryId = 'engineering.typescript.reference.language-foundations'
const languageReferenceEntryId = 'engineering.typescript.reference.language-reference'
const utilityTypesEntryId = 'engineering.typescript.reference.utility-types'
const modulesReferenceEntryId = 'engineering.typescript.reference.modules-reference'
const declarationFoundationsEntryId = 'engineering.typescript.reference.declaration-foundations'
const declarationAuthoringEntryId =
  'engineering.typescript.reference.declaration-authoring-publishing'
const declarationModuleTemplatesEntryId =
  'engineering.typescript.reference.declaration-module-templates'
const declarationGlobalTemplatesEntryId =
  'engineering.typescript.reference.declaration-global-templates'
const projectConfigEntryId = 'engineering.typescript.reference.project-config'
const handbookBaseUrl = 'https://www.typescriptlang.org/docs/handbook'
const utilityTypesUrl = `${handbookBaseUrl}/utility-types.html`

const handbookDefinitions = [
  [
    'the-basics',
    'The Basics',
    `${handbookBaseUrl}/2/basic-types.html`,
    'detail',
    { entryId: languageFoundationsEntryId, anchor: '三the-basics' },
  ],
  [
    'everyday-types',
    'Everyday Types',
    `${handbookBaseUrl}/2/everyday-types.html`,
    'detail',
    { entryId: languageFoundationsEntryId, anchor: '四everyday-types' },
  ],
  [
    'narrowing',
    'Narrowing',
    `${handbookBaseUrl}/2/narrowing.html`,
    'detail',
    { entryId: languageFoundationsEntryId, anchor: '五narrowing' },
  ],
  [
    'more-on-functions',
    'More on Functions',
    `${handbookBaseUrl}/2/functions.html`,
    'detail',
    { entryId: languageFoundationsEntryId, anchor: '六more-on-functions' },
  ],
  [
    'object-types',
    'Object Types',
    `${handbookBaseUrl}/2/objects.html`,
    'detail',
    { entryId: languageFoundationsEntryId, anchor: '七object-types' },
  ],
  [
    'type-declarations',
    'Type Declarations',
    `${handbookBaseUrl}/2/type-declarations.html`,
    'merged',
    { entryId: languageFoundationsEntryId, anchor: '八type-declarations' },
  ],
  [
    'understanding-errors',
    'Understanding Errors',
    `${handbookBaseUrl}/2/understanding-errors.html`,
    'merged',
    { entryId: languageFoundationsEntryId, anchor: '九understanding-errors' },
  ],
  [
    'classes',
    'Classes',
    `${handbookBaseUrl}/2/classes.html`,
    'detail',
    { entryId: languageFoundationsEntryId, anchor: '十classes' },
  ],
  [
    'modules',
    'Modules',
    `${handbookBaseUrl}/2/modules.html`,
    'merged',
    { entryId: languageFoundationsEntryId, anchor: '十一modules' },
  ],
  [
    'generics',
    'Generics',
    `${handbookBaseUrl}/2/generics.html`,
    'detail',
    { entryId: languageFoundationsEntryId, anchor: '十二generics' },
  ],
  [
    'keyof-type-operator',
    'Keyof Type Operator',
    `${handbookBaseUrl}/2/keyof-types.html`,
    'detail',
    { entryId: languageFoundationsEntryId, anchor: '十三keyof-type-operator' },
  ],
  [
    'typeof-type-operator',
    'Typeof Type Operator',
    `${handbookBaseUrl}/2/typeof-types.html`,
    'detail',
    { entryId: languageFoundationsEntryId, anchor: '十四typeof-type-operator' },
  ],
  [
    'indexed-access-types',
    'Indexed Access Types',
    `${handbookBaseUrl}/2/indexed-access-types.html`,
    'detail',
    { entryId: languageFoundationsEntryId, anchor: '十五indexed-access-types' },
  ],
  [
    'conditional-types',
    'Conditional Types',
    `${handbookBaseUrl}/2/conditional-types.html`,
    'detail',
    { entryId: languageFoundationsEntryId, anchor: '十六conditional-types' },
  ],
  [
    'mapped-types',
    'Mapped Types',
    `${handbookBaseUrl}/2/mapped-types.html`,
    'detail',
    { entryId: languageFoundationsEntryId, anchor: '十七mapped-types' },
  ],
  [
    'template-literal-types',
    'Template Literal Types',
    `${handbookBaseUrl}/2/template-literal-types.html`,
    'detail',
    { entryId: languageFoundationsEntryId, anchor: '十八template-literal-types' },
  ],
] as const satisfies readonly ReferenceDefinition[]

const generalReferenceDefinitions = [
  [
    'declaration-merging',
    'Declaration Merging',
    `${handbookBaseUrl}/declaration-merging.html`,
    'detail',
    { entryId: languageReferenceEntryId, anchor: '三declaration-merging' },
  ],
  [
    'enums',
    'Enums',
    `${handbookBaseUrl}/enums.html`,
    'merged',
    { entryId: languageReferenceEntryId, anchor: '四enums' },
  ],
  [
    'iterators-and-generators',
    'Iterators and Generators',
    `${handbookBaseUrl}/iterators-and-generators.html`,
    'quick',
    { entryId: languageReferenceEntryId, anchor: '五iterators-and-generators' },
  ],
  [
    'jsx',
    'JSX',
    `${handbookBaseUrl}/jsx.html`,
    'detail',
    { entryId: languageReferenceEntryId, anchor: '六jsx' },
  ],
  [
    'mixins',
    'Mixins',
    `${handbookBaseUrl}/mixins.html`,
    'quick',
    { entryId: languageReferenceEntryId, anchor: '七mixins' },
  ],
  [
    'namespaces-and-modules',
    'Namespaces and Modules',
    `${handbookBaseUrl}/namespaces-and-modules.html`,
    'merged',
    { entryId: languageReferenceEntryId, anchor: '八namespaces-and-modules' },
  ],
  [
    'namespaces',
    'Namespaces',
    `${handbookBaseUrl}/namespaces.html`,
    'quick',
    { entryId: languageReferenceEntryId, anchor: '九namespaces' },
  ],
  [
    'symbols',
    'Symbols',
    `${handbookBaseUrl}/symbols.html`,
    'quick',
    { entryId: languageReferenceEntryId, anchor: '十symbols' },
  ],
  [
    'triple-slash-directives',
    'Triple-Slash Directives',
    `${handbookBaseUrl}/triple-slash-directives.html`,
    'quick',
    { entryId: languageReferenceEntryId, anchor: '十一triple-slash-directives' },
  ],
  [
    'type-compatibility',
    'Type Compatibility',
    `${handbookBaseUrl}/type-compatibility.html`,
    'detail',
    { entryId: languageReferenceEntryId, anchor: '十二type-compatibility' },
  ],
  [
    'type-inference',
    'Type Inference',
    `${handbookBaseUrl}/type-inference.html`,
    'detail',
    { entryId: languageReferenceEntryId, anchor: '十三type-inference' },
  ],
  [
    'variable-declarations',
    'Variable Declarations',
    `${handbookBaseUrl}/variable-declarations.html`,
    'merged',
    { entryId: languageReferenceEntryId, anchor: '十四variable-declarations' },
  ],
] as const satisfies readonly ReferenceDefinition[]

const utilityTypeDefinitions = [
  [
    'partial',
    'Partial<Type>',
    `${utilityTypesUrl}#partialtype`,
    'detail',
    { entryId: utilityTypesEntryId, anchor: '三partial' },
  ],
  [
    'required',
    'Required<Type>',
    `${utilityTypesUrl}#requiredtype`,
    'detail',
    { entryId: utilityTypesEntryId, anchor: '四required' },
  ],
  [
    'readonly',
    'Readonly<Type>',
    `${utilityTypesUrl}#readonlytype`,
    'detail',
    { entryId: utilityTypesEntryId, anchor: '五readonly' },
  ],
  [
    'record',
    'Record<Keys, Type>',
    `${utilityTypesUrl}#recordkeys-type`,
    'detail',
    { entryId: utilityTypesEntryId, anchor: '六record' },
  ],
  [
    'pick',
    'Pick<Type, Keys>',
    `${utilityTypesUrl}#picktype-keys`,
    'detail',
    { entryId: utilityTypesEntryId, anchor: '七pick' },
  ],
  [
    'omit',
    'Omit<Type, Keys>',
    `${utilityTypesUrl}#omittype-keys`,
    'merged',
    { entryId: utilityTypesEntryId, anchor: '八omit' },
  ],
  [
    'exclude',
    'Exclude<UnionType, ExcludedMembers>',
    `${utilityTypesUrl}#excludeuniontype-excludedmembers`,
    'merged',
    { entryId: utilityTypesEntryId, anchor: '九exclude' },
  ],
  [
    'extract',
    'Extract<Type, Union>',
    `${utilityTypesUrl}#extracttype-union`,
    'merged',
    { entryId: utilityTypesEntryId, anchor: '十extract' },
  ],
  [
    'non-nullable',
    'NonNullable<Type>',
    `${utilityTypesUrl}#nonnullabletype`,
    'merged',
    { entryId: utilityTypesEntryId, anchor: '十一nonnullable' },
  ],
  [
    'parameters',
    'Parameters<Type>',
    `${utilityTypesUrl}#parameterstype`,
    'merged',
    { entryId: utilityTypesEntryId, anchor: '十二parameters' },
  ],
  [
    'constructor-parameters',
    'ConstructorParameters<Type>',
    `${utilityTypesUrl}#constructorparameterstype`,
    'merged',
    { entryId: utilityTypesEntryId, anchor: '十三constructorparameters' },
  ],
  [
    'return-type',
    'ReturnType<Type>',
    `${utilityTypesUrl}#returntypetype`,
    'merged',
    { entryId: utilityTypesEntryId, anchor: '十四returntype' },
  ],
  [
    'instance-type',
    'InstanceType<Type>',
    `${utilityTypesUrl}#instancetypetype`,
    'merged',
    { entryId: utilityTypesEntryId, anchor: '十五instancetype' },
  ],
  [
    'awaited',
    'Awaited<Type>',
    `${utilityTypesUrl}#awaitedtype`,
    'detail',
    { entryId: utilityTypesEntryId, anchor: '十六awaited' },
  ],
  [
    'no-infer',
    'NoInfer<Type>',
    `${utilityTypesUrl}#noinfertype`,
    'detail',
    { entryId: utilityTypesEntryId, anchor: '十七noinfer' },
  ],
  [
    'this-parameter-type',
    'ThisParameterType<Type>',
    `${utilityTypesUrl}#thisparametertypetype`,
    'merged',
    { entryId: utilityTypesEntryId, anchor: '十八thisparametertype' },
  ],
  [
    'omit-this-parameter',
    'OmitThisParameter<Type>',
    `${utilityTypesUrl}#omitthisparametertype`,
    'merged',
    { entryId: utilityTypesEntryId, anchor: '十九omitthisparameter' },
  ],
  [
    'this-type',
    'ThisType<Type>',
    `${utilityTypesUrl}#thistypetype`,
    'merged',
    { entryId: utilityTypesEntryId, anchor: '二十thistype' },
  ],
  [
    'uppercase',
    'Uppercase<StringType>',
    `${utilityTypesUrl}#uppercasestringtype`,
    'quick',
    { entryId: utilityTypesEntryId, anchor: '二十一uppercase' },
  ],
  [
    'lowercase',
    'Lowercase<StringType>',
    `${utilityTypesUrl}#lowercasestringtype`,
    'quick',
    { entryId: utilityTypesEntryId, anchor: '二十二lowercase' },
  ],
  [
    'capitalize',
    'Capitalize<StringType>',
    `${utilityTypesUrl}#capitalizestringtype`,
    'quick',
    { entryId: utilityTypesEntryId, anchor: '二十三capitalize' },
  ],
  [
    'uncapitalize',
    'Uncapitalize<StringType>',
    `${utilityTypesUrl}#uncapitalizestringtype`,
    'quick',
    { entryId: utilityTypesEntryId, anchor: '二十四uncapitalize' },
  ],
] as const satisfies readonly ReferenceDefinition[]

const modulesReferenceDefinitions = [
  [
    'modules-reference.introduction',
    'Modules Reference: Introduction',
    `${handbookBaseUrl}/modules/introduction.html`,
    'merged',
    { entryId: modulesReferenceEntryId, anchor: '三introduction' },
  ],
  [
    'modules-reference.theory',
    'Modules Reference: Theory',
    `${handbookBaseUrl}/modules/theory.html`,
    'detail',
    { entryId: modulesReferenceEntryId, anchor: '四theory' },
  ],
  [
    'modules-reference.choosing-compiler-options',
    'Modules Reference: Choosing Compiler Options',
    `${handbookBaseUrl}/modules/guides/choosing-compiler-options.html`,
    'detail',
    { entryId: modulesReferenceEntryId, anchor: '五choosing-compiler-options' },
  ],
  [
    'modules-reference.reference',
    'Modules Reference',
    `${handbookBaseUrl}/modules/reference.html`,
    'detail',
    { entryId: modulesReferenceEntryId, anchor: '六reference' },
  ],
  [
    'modules-reference.esm-cjs-interoperability',
    'ESM/CJS Interoperability',
    `${handbookBaseUrl}/modules/appendices/esm-cjs-interop.html`,
    'detail',
    { entryId: modulesReferenceEntryId, anchor: '七esmcjs-interoperability' },
  ],
] as const satisfies readonly ReferenceDefinition[]

const declarationFilesDefinitions = [
  [
    'declaration-files.introduction',
    'Declaration Files: Introduction',
    `${handbookBaseUrl}/declaration-files/introduction.html`,
    'merged',
    { entryId: declarationFoundationsEntryId, anchor: '三introduction' },
  ],
  [
    'declaration-files.by-example',
    'Declaration Reference',
    `${handbookBaseUrl}/declaration-files/by-example.html`,
    'detail',
    { entryId: declarationFoundationsEntryId, anchor: '四declaration-reference' },
  ],
  [
    'declaration-files.library-structures',
    'Library Structures',
    `${handbookBaseUrl}/declaration-files/library-structures.html`,
    'detail',
    { entryId: declarationFoundationsEntryId, anchor: '五library-structures' },
  ],
  [
    'declaration-files.templates',
    'Declaration Templates',
    `${handbookBaseUrl}/declaration-files/templates.html`,
    'merged',
    { entryId: declarationFoundationsEntryId, anchor: '六templates' },
  ],
  [
    'declaration-files.dos-and-donts',
    "Declaration Files Do's and Don'ts",
    `${handbookBaseUrl}/declaration-files/do-s-and-don-ts.html`,
    'detail',
    { entryId: declarationAuthoringEntryId, anchor: '三dos-and-donts' },
  ],
  [
    'declaration-files.deep-dive',
    'Declaration Files Deep Dive',
    `${handbookBaseUrl}/declaration-files/deep-dive.html`,
    'detail',
    { entryId: declarationAuthoringEntryId, anchor: '四deep-dive' },
  ],
  [
    'declaration-files.publishing',
    'Publishing Declaration Files',
    `${handbookBaseUrl}/declaration-files/publishing.html`,
    'detail',
    { entryId: declarationAuthoringEntryId, anchor: '五publishing' },
  ],
  [
    'declaration-files.consumption',
    'Consuming Declaration Files',
    `${handbookBaseUrl}/declaration-files/consumption.html`,
    'detail',
    { entryId: declarationAuthoringEntryId, anchor: '六consumption' },
  ],
  [
    'declaration-files.module',
    'Modules .d.ts',
    `${handbookBaseUrl}/declaration-files/templates/module-d-ts.html`,
    'merged',
    { entryId: declarationModuleTemplatesEntryId, anchor: '三modules-dts' },
  ],
  [
    'declaration-files.module-class',
    'Module: Class',
    `${handbookBaseUrl}/declaration-files/templates/module-class-d-ts.html`,
    'merged',
    { entryId: declarationModuleTemplatesEntryId, anchor: '四module-class' },
  ],
  [
    'declaration-files.module-function',
    'Module: Function',
    `${handbookBaseUrl}/declaration-files/templates/module-function-d-ts.html`,
    'merged',
    { entryId: declarationModuleTemplatesEntryId, anchor: '五module-function' },
  ],
  [
    'declaration-files.module-plugin',
    'Module: Plugin',
    `${handbookBaseUrl}/declaration-files/templates/module-plugin-d-ts.html`,
    'merged',
    { entryId: declarationModuleTemplatesEntryId, anchor: '六module-plugin' },
  ],
  [
    'declaration-files.global',
    'Global .d.ts',
    `${handbookBaseUrl}/declaration-files/templates/global-d-ts.html`,
    'merged',
    { entryId: declarationGlobalTemplatesEntryId, anchor: '三global-dts' },
  ],
  [
    'declaration-files.global-plugin',
    'Global: Plugin',
    `${handbookBaseUrl}/declaration-files/templates/global-plugin-d-ts.html`,
    'merged',
    { entryId: declarationGlobalTemplatesEntryId, anchor: '四global-plugin' },
  ],
  [
    'declaration-files.global-modifying-module',
    'Global: Modifying Module',
    `${handbookBaseUrl}/declaration-files/templates/global-modifying-module-d-ts.html`,
    'merged',
    { entryId: declarationGlobalTemplatesEntryId, anchor: '五global-modifying-module' },
  ],
] as const satisfies readonly ReferenceDefinition[]

const projectConfigDefinitions = [
  [
    'project-config.tsconfig-json',
    'tsconfig.json',
    `${handbookBaseUrl}/tsconfig-json.html`,
    'detail',
    { entryId: projectConfigEntryId, anchor: '三tsconfigjson' },
  ],
  [
    'project-config.compiler-options',
    'Compiler Options',
    `${handbookBaseUrl}/compiler-options.html`,
    'merged',
    { entryId: projectConfigEntryId, anchor: '四compiler-options' },
  ],
  [
    'project-config.project-references',
    'Project References',
    `${handbookBaseUrl}/project-references.html`,
    'detail',
    { entryId: projectConfigEntryId, anchor: '五project-references' },
  ],
  [
    'project-config.build-tools',
    'Integrating with Build Tools',
    `${handbookBaseUrl}/integrating-with-build-tools.html`,
    'quick',
    { entryId: projectConfigEntryId, anchor: '六integrating-with-build-tools' },
  ],
  [
    'project-config.watch',
    'Configuring Watch',
    `${handbookBaseUrl}/configuring-watch.html`,
    'merged',
    { entryId: projectConfigEntryId, anchor: '七configuring-watch' },
  ],
  [
    'project-config.msbuild',
    'Compiler Options in MSBuild',
    `${handbookBaseUrl}/compiler-options-in-msbuild.html`,
    'quick',
    { entryId: projectConfigEntryId, anchor: '八compiler-options-in-msbuild' },
  ],
] as const satisfies readonly ReferenceDefinition[]

/** 将冻结定义映射为 Catalog 已有的 Reference index item interface。 */
function toReferenceIndexItem(definition: ReferenceDefinition): TypeScriptReferenceIndexItem {
  const [officialKey, name, officialUrl, depth, target] = definition
  return {
    officialKey,
    id: officialKey,
    name,
    aliases: officialKey === 'no-infer' ? ['No Infer'] : undefined,
    officialUrl,
    depth,
    sourceTag: 'public',
    status: 'available',
    target,
  }
}

const stableBaseDefinitions = [
  ...handbookDefinitions,
  ...generalReferenceDefinitions,
  ...utilityTypeDefinitions,
  ...modulesReferenceDefinitions,
  ...declarationFilesDefinitions,
  ...projectConfigDefinitions,
]
const stableBaseItems = stableBaseDefinitions.map(toReferenceIndexItem)
const tsConfigItems = typeScriptTsConfigItems.map((item) => ({
  ...item,
  officialKey: item.id,
}))
const availableItems = [
  ...stableBaseItems,
  ...tsConfigItems.filter((item) => item.status === 'available'),
]
const plannedItems = tsConfigItems.filter((item) => item.status === 'planned')

export const typeScriptReferenceCoverageStatus = {
  stable: [...stableBaseItems, ...tsConfigItems].map((item) => item.officialKey),
  available: availableItems.map((item) => item.officialKey),
  planned: plannedItems.map((item) => item.officialKey),
  deprecated: [
    'general-reference.advanced-types',
    'tsconfig.charset',
    'tsconfig.importsNotUsedAsValues',
    'tsconfig.keyofStringsOnly',
    'tsconfig.noImplicitUseStrict',
    'tsconfig.noStrictGenericChecks',
    'tsconfig.out',
    'tsconfig.preserveValueImports',
    'tsconfig.suppressExcessPropertyErrors',
    'tsconfig.suppressImplicitAnyIndexErrors',
  ],
  experimental: [
    'general-reference.decorators',
    'tsconfig.experimentalDecorators',
    'tsconfig.emitDecoratorMetadata',
  ],
} as const

export const typeScriptReferenceIndexManifest: ReferenceIndexManifest = {
  appliesTo: 'TypeScript 7.0.2',
  verifiedAt: '2026-08-06',
  groups: [
    {
      id: 'handbook-v2',
      title: 'Handbook v2',
      sections: [
        {
          id: 'language-and-type-operations',
          title: '语言与类型操作',
          items: availableItems.slice(0, 16),
        },
      ],
    },
    {
      id: 'general-reference',
      title: 'General Reference',
      sections: [
        {
          id: 'language-and-platform',
          title: '语言与平台边界',
          items: availableItems.slice(16, 28),
        },
      ],
    },
    {
      id: 'utility-types',
      title: 'Utility Types',
      sections: [
        { id: 'type-transformations', title: '类型变换', items: availableItems.slice(28, 50) },
      ],
    },
    {
      id: 'modules-reference',
      title: 'Modules Reference',
      sections: [{ id: 'modules', title: '模块参考', items: availableItems.slice(50, 55) }],
    },
    {
      id: 'declaration-files',
      title: 'Declaration Files',
      sections: [{ id: 'declarations', title: '声明文件', items: availableItems.slice(55, 70) }],
    },
    {
      id: 'project-config',
      title: 'Project Config',
      sections: [{ id: 'project', title: '项目配置', items: availableItems.slice(70, 76) }],
    },
    {
      id: 'tsconfig',
      title: 'TSConfig',
      sections: [{ id: 'options', title: '配置项', items: tsConfigItems }],
    },
  ],
  observationScopes: typeScriptObservationScopes,
}
