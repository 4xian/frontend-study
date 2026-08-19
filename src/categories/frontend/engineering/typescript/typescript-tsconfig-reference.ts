import type {
  ReferenceCoverageDepth,
  ReferenceIndexItemManifest,
  ReferenceObservationScope,
  ReferenceTargetManifest,
} from '@/common/catalog/types'

type TsConfigReferenceDefinition = readonly [
  officialKey: string,
  name: string,
  officialUrl: string,
  depth: ReferenceCoverageDepth,
  target?: ReferenceTargetManifest,
]

const tsConfigProjectInputEntryId = 'engineering.typescript.reference.tsconfig-project-input'
const tsConfigJavaScriptAcquisitionEntryId =
  'engineering.typescript.reference.tsconfig-javascript-acquisition'
const tsConfigProjectBuildEntryId = 'engineering.typescript.reference.tsconfig-project-build'
const tsConfigEmitDeclarationsEntryId =
  'engineering.typescript.reference.tsconfig-emit-declarations'
const tsConfigDiagnosticsSafetyEntryId =
  'engineering.typescript.reference.tsconfig-diagnostics-safety'
const tsConfigModulesResolutionEntryId =
  'engineering.typescript.reference.tsconfig-modules-resolution'
const tsConfigLanguageJsxEntryId = 'engineering.typescript.reference.tsconfig-language-jsx'
const tsConfigStrictnessEntryId = 'engineering.typescript.reference.tsconfig-strictness'
const tsConfigEmitOutputEntryId = 'engineering.typescript.reference.tsconfig-emit-output'
const tsConfigModulePathsEntryId = 'engineering.typescript.reference.tsconfig-module-paths'
const tsConfigTypeEnvironmentEntryId = 'engineering.typescript.reference.tsconfig-type-environment'
const tsConfigBuildWatchEntryId = 'engineering.typescript.reference.tsconfig-build-watch'
const tsConfigRootUrl = 'https://www.typescriptlang.org/tsconfig'

const tsConfigStableKeys = `
allowArbitraryExtensions, allowImportingTsExtensions, allowJs, allowSyntheticDefaultImports,
allowUmdGlobalAccess, allowUnreachableCode, allowUnusedLabels, alwaysStrict,
assumeChangesOnlyAffectDirectDependencies, checkJs, clean, composite, customConditions, declaration,
declarationDir, declarationMap, diagnostics, disableFilenameBasedTypeAcquisition,
disableReferencedProjectLoad, disableSizeLimit, disableSolutionSearching,
disableSourceOfProjectReferenceRedirect, emitBOM, emitDeclarationOnly, enable, erasableSyntaxOnly,
esModuleInterop, exactOptionalPropertyTypes, exclude, excludeDirectories, excludeFiles, explainFiles,
extendedDiagnostics, extends, fallbackPolling, files, force, forceConsistentCasingInFileNames,
generateCpuProfile, generateTrace, importHelpers, include, incremental, inlineSourceMap, inlineSources,
isolatedDeclarations, isolatedModules, jsx, jsxFactory, jsxFragmentFactory, jsxImportSource, lib,
libReplacement, listEmittedFiles, listFiles, locale, mapRoot, maxNodeModuleJsDepth, module,
moduleDetection, moduleResolution, moduleSuffixes, newLine, noCheck, noEmit, noEmitHelpers,
noEmitOnError, noErrorTruncation, noFallthroughCasesInSwitch, noImplicitAny, noImplicitOverride,
noImplicitReturns, noImplicitThis, noLib, noPropertyAccessFromIndexSignature, noResolve,
noUncheckedIndexedAccess, noUncheckedSideEffectImports, noUnusedLocals, noUnusedParameters, outDir,
paths, plugins, preserveConstEnums, preserveSymlinks, preserveWatchOutput, pretty,
reactNamespace, references, removeComments, resolveJsonModule, resolvePackageJsonExports,
resolvePackageJsonImports, rewriteRelativeImportExtensions, rootDir, rootDirs, skipDefaultLibCheck,
skipLibCheck, sourceMap, sourceRoot, stopBuildOnErrors, strict, strictBindCallApply,
strictBuiltinIteratorReturn, strictFunctionTypes, strictNullChecks, strictPropertyInitialization,
stripInternal, synchronousWatchDirectory, target, traceResolution, tsBuildInfoFile, typeAcquisition,
typeAcquisition.exclude, typeAcquisition.include, typeRoots, types, useDefineForClassFields,
useUnknownInCatchVariables, verbatimModuleSyntax, verbose, watchDirectory, watchFile
`
  .trim()
  .split(/\s*,\s*/)

const tsConfigDetailKeys = new Set([
  'strict',
  'module',
  'moduleResolution',
  'target',
  'lib',
  'types',
  'paths',
  'rootDir',
  'declaration',
  'composite',
  'references',
  'isolatedModules',
  'isolatedDeclarations',
  'verbatimModuleSyntax',
  'jsx',
  'noEmit',
  'noUncheckedIndexedAccess',
  'exactOptionalPropertyTypes',
  'noUncheckedSideEffectImports',
])

const tsConfigMergedKeys = new Set([
  'exclude',
  'extends',
  'files',
  'include',
  'excludeDirectories',
  'excludeFiles',
  'fallbackPolling',
  'allowJs',
  'checkJs',
  'assumeChangesOnlyAffectDirectDependencies',
  'disableReferencedProjectLoad',
  'disableSolutionSearching',
  'disableSourceOfProjectReferenceRedirect',
  'incremental',
  'declarationDir',
  'declarationMap',
  'emitDeclarationOnly',
  'inlineSourceMap',
  'inlineSources',
  'mapRoot',
  'allowUnreachableCode',
  'allowUnusedLabels',
  'diagnostics',
  'explainFiles',
  'extendedDiagnostics',
  'listFiles',
  'allowArbitraryExtensions',
  'allowImportingTsExtensions',
  'allowSyntheticDefaultImports',
  'customConditions',
  'esModuleInterop',
  'libReplacement',
  'moduleSuffixes',
  'alwaysStrict',
  'erasableSyntaxOnly',
  'jsxFactory',
  'jsxFragmentFactory',
  'jsxImportSource',
  'moduleDetection',
  'noImplicitAny',
  'noImplicitOverride',
  'noImplicitReturns',
  'noImplicitThis',
  'noPropertyAccessFromIndexSignature',
  'noUnusedLocals',
  'noUnusedParameters',
  'strictBindCallApply',
  'strictBuiltinIteratorReturn',
  'strictFunctionTypes',
  'strictNullChecks',
  'strictPropertyInitialization',
  'useUnknownInCatchVariables',
  'noFallthroughCasesInSwitch',
  'noCheck',
  'noEmitOnError',
  'outDir',
  'rewriteRelativeImportExtensions',
  'sourceMap',
  'sourceRoot',
  'useDefineForClassFields',
  'typeAcquisition',
  'resolvePackageJsonExports',
  'resolvePackageJsonImports',
  'rootDirs',
])

const tsConfigRootKeys = new Set([
  'files',
  'extends',
  'include',
  'exclude',
  'references',
  'typeAcquisition',
  'typeAcquisition.exclude',
  'typeAcquisition.include',
])

const tsConfigHeadingNumbers = [
  '一',
  '二',
  '三',
  '四',
  '五',
  '六',
  '七',
  '八',
  '九',
  '十',
  '十一',
  '十二',
  '十三',
  '十四',
  '十五',
  '十六',
  '十七',
  '十八',
] as const

const tsConfigTargetGroups: readonly { entryId: string; keys: readonly string[] }[] = [
  {
    entryId: tsConfigProjectInputEntryId,
    keys: [
      'exclude',
      'extends',
      'files',
      'include',
      'excludeDirectories',
      'excludeFiles',
      'fallbackPolling',
    ],
  },
  {
    entryId: tsConfigJavaScriptAcquisitionEntryId,
    keys: [
      'allowJs',
      'checkJs',
      'disableFilenameBasedTypeAcquisition',
      'enable',
      'maxNodeModuleJsDepth',
    ],
  },
  {
    entryId: tsConfigProjectBuildEntryId,
    keys: [
      'assumeChangesOnlyAffectDirectDependencies',
      'clean',
      'composite',
      'disableReferencedProjectLoad',
      'disableSolutionSearching',
      'disableSourceOfProjectReferenceRedirect',
      'force',
      'incremental',
    ],
  },
  {
    entryId: tsConfigEmitDeclarationsEntryId,
    keys: [
      'declaration',
      'declarationDir',
      'declarationMap',
      'emitBOM',
      'emitDeclarationOnly',
      'importHelpers',
      'inlineSourceMap',
      'inlineSources',
      'listEmittedFiles',
      'mapRoot',
    ],
  },
  {
    entryId: tsConfigDiagnosticsSafetyEntryId,
    keys: [
      'allowUnreachableCode',
      'allowUnusedLabels',
      'diagnostics',
      'disableSizeLimit',
      'exactOptionalPropertyTypes',
      'explainFiles',
      'extendedDiagnostics',
      'forceConsistentCasingInFileNames',
      'generateCpuProfile',
      'generateTrace',
      'listFiles',
    ],
  },
  {
    entryId: tsConfigModulesResolutionEntryId,
    keys: [
      'allowArbitraryExtensions',
      'allowImportingTsExtensions',
      'allowSyntheticDefaultImports',
      'allowUmdGlobalAccess',
      'customConditions',
      'esModuleInterop',
      'libReplacement',
      'module',
      'moduleResolution',
      'moduleSuffixes',
    ],
  },
  {
    entryId: tsConfigLanguageJsxEntryId,
    keys: [
      'alwaysStrict',
      'erasableSyntaxOnly',
      'isolatedDeclarations',
      'isolatedModules',
      'jsx',
      'jsxFactory',
      'jsxFragmentFactory',
      'jsxImportSource',
      'lib',
      'locale',
      'moduleDetection',
    ],
  },
  {
    entryId: tsConfigStrictnessEntryId,
    keys: [
      'noFallthroughCasesInSwitch',
      'noImplicitAny',
      'noImplicitOverride',
      'noImplicitReturns',
      'noImplicitThis',
      'noPropertyAccessFromIndexSignature',
      'noUncheckedIndexedAccess',
      'noUncheckedSideEffectImports',
      'noUnusedLocals',
      'noUnusedParameters',
      'strict',
      'strictBindCallApply',
      'strictBuiltinIteratorReturn',
      'strictFunctionTypes',
      'strictNullChecks',
      'strictPropertyInitialization',
      'useUnknownInCatchVariables',
    ],
  },
  {
    entryId: tsConfigEmitOutputEntryId,
    keys: [
      'newLine',
      'noCheck',
      'noEmit',
      'noEmitHelpers',
      'noEmitOnError',
      'noErrorTruncation',
      'outDir',
      'preserveConstEnums',
      'pretty',
      'reactNamespace',
      'removeComments',
      'rewriteRelativeImportExtensions',
      'sourceMap',
      'sourceRoot',
      'stripInternal',
      'target',
      'useDefineForClassFields',
      'verbatimModuleSyntax',
    ],
  },
  {
    entryId: tsConfigModulePathsEntryId,
    keys: [
      'noResolve',
      'paths',
      'preserveSymlinks',
      'resolveJsonModule',
      'resolvePackageJsonExports',
      'resolvePackageJsonImports',
      'rootDir',
      'rootDirs',
      'traceResolution',
    ],
  },
  {
    entryId: tsConfigTypeEnvironmentEntryId,
    keys: [
      'noLib',
      'plugins',
      'skipDefaultLibCheck',
      'skipLibCheck',
      'typeAcquisition',
      'typeAcquisition.exclude',
      'typeAcquisition.include',
      'typeRoots',
      'types',
    ],
  },
  {
    entryId: tsConfigBuildWatchEntryId,
    keys: [
      'preserveWatchOutput',
      'references',
      'stopBuildOnErrors',
      'synchronousWatchDirectory',
      'tsBuildInfoFile',
      'verbose',
      'watchDirectory',
      'watchFile',
    ],
  },
]

/** 返回稳定 TSConfig 键对应的真实正文目标。 */
function toTsConfigTarget(key: string): ReferenceTargetManifest | undefined {
  const group = tsConfigTargetGroups.find((candidate) => candidate.keys.includes(key))
  if (!group) return undefined
  const headingNumber = tsConfigHeadingNumbers[group.keys.indexOf(key)]
  return {
    entryId: group.entryId,
    anchor: `${headingNumber}${key.toLowerCase().replaceAll('.', '')}`,
  }
}

/** 将冻结 TSConfig 键转换为保留官方顺序的目录定义。 */
function toTsConfigDefinition(key: string): TsConfigReferenceDefinition {
  const officialUrl = tsConfigRootKeys.has(key) ? tsConfigRootUrl : `${tsConfigRootUrl}/${key}.html`
  const depth = tsConfigDetailKeys.has(key)
    ? 'detail'
    : tsConfigMergedKeys.has(key)
      ? 'merged'
      : 'quick'
  return [`tsconfig.${key}`, key, officialUrl, depth, toTsConfigTarget(key)]
}

/** 将 TSConfig 定义映射为 Reference index item。 */
function toReferenceIndexItem(definition: TsConfigReferenceDefinition): ReferenceIndexItemManifest {
  const [id, name, officialUrl, depth, target] = definition
  return {
    id,
    name,
    officialUrl,
    depth,
    sourceTag: 'public',
    status: target ? 'available' : 'planned',
    target,
  }
}

const tsConfigDefinitions = tsConfigStableKeys.map(toTsConfigDefinition)

export const typeScriptTsConfigItems = tsConfigDefinitions.map(toReferenceIndexItem)

export const typeScriptTsConfigStableKeys = typeScriptTsConfigItems.map((item) => item.id)

export const typeScriptObservationScopes: readonly ReferenceObservationScope[] = [
  {
    id: 'navigation',
    title: 'Handbook landing/navigation',
    status: 'navigation',
    count: 2,
    items: [
      { id: 'general-reference.the-handbook', name: 'The Handbook' },
      { id: 'general-reference.creating-types-from-types', name: 'Creating Types from Types' },
    ],
  },
  {
    id: 'deprecated',
    title: 'Deprecated and removed',
    status: 'deprecated',
    count: 10,
    items: [
      { id: 'general-reference.advanced-types', name: 'Advanced Types' },
      ...[
        'charset',
        'importsNotUsedAsValues',
        'keyofStringsOnly',
        'noImplicitUseStrict',
        'noStrictGenericChecks',
        'out',
        'preserveValueImports',
        'suppressExcessPropertyErrors',
        'suppressImplicitAnyIndexErrors',
      ].map((key) => ({ id: `tsconfig.${key}`, name: key })),
    ],
  },
  {
    id: 'unsupported',
    title: 'TypeScript 7.0 unsupported options',
    status: 'unsupported',
    count: 3,
    items: [
      { id: 'tsconfig.baseUrl', name: 'baseUrl' },
      { id: 'tsconfig.downlevelIteration', name: 'downlevelIteration' },
      { id: 'tsconfig.outFile', name: 'outFile' },
    ],
  },
  {
    id: 'experimental',
    title: 'Legacy experimental decorators',
    status: 'experimental',
    count: 3,
    items: [
      { id: 'general-reference.decorators', name: 'Decorators' },
      { id: 'tsconfig.experimentalDecorators', name: 'experimentalDecorators' },
      { id: 'tsconfig.emitDecoratorMetadata', name: 'emitDecoratorMetadata' },
    ],
  },
  {
    id: 'cli-only',
    title: 'CLI-only options',
    status: 'cli-only',
    count: 19,
    items: [
      'all',
      'build',
      'builders',
      'checkers',
      'deduplicatePackages',
      'dry',
      'help',
      'ignoreConfig',
      'init',
      'listFilesOnly',
      'pprofDir',
      'project',
      'quiet',
      'showConfig',
      'singleThreaded',
      'stableTypeOrdering',
      'version',
      'watch',
      'watchInterval',
    ].map((key) => ({ id: `cli.${key}`, name: key })),
  },
  {
    id: 'release-notes',
    title: 'Release Notes historical index',
    status: 'historical',
    count: 48,
  },
  {
    id: 'standard-library',
    title: 'Standard library declarations',
    status: 'observation',
    count: 108,
  },
  {
    id: 'compiler-api',
    title: 'Compiler API compatibility boundary',
    status: 'restricted',
    count: 1,
    items: [{ id: 'compiler-api.legacy-wiki', name: 'Compiler API legacy compatibility' }],
  },
  {
    id: 'language-service-api',
    title: 'Language Service API compatibility boundary',
    status: 'restricted',
    count: 1,
    items: [{ id: 'language-service-api.legacy-javascript', name: 'Legacy JavaScript API' }],
  },
  {
    id: 'tsserver-and-plugins',
    title: 'tsserver and language-service plugins',
    status: 'deferred',
    count: 2,
    items: [
      { id: 'tsserver-and-plugins.tsserver', name: 'tsserver interface' },
      { id: 'tsserver-and-plugins.plugin', name: 'Language service plugin interface' },
    ],
  },
  {
    id: 'prerelease',
    title: 'Prerelease channels',
    status: 'prerelease',
    count: 3,
    items: [
      { id: 'prerelease.beta', name: 'Beta' },
      { id: 'prerelease.rc', name: 'Release candidate' },
      { id: 'prerelease.next', name: 'typescript@next' },
    ],
  },
]
