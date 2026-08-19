import type { CategoryContentEntryManifest } from '@/common/catalog'

import { meta as learnAliasesAndInterfacesMeta } from './learn/aliases-and-interfaces.md?catalog-meta'
import { meta as learnClassesAndCompatibilityMeta } from './learn/classes-and-compatibility.md?catalog-meta'
import { meta as learnConditionalTypesMeta } from './learn/conditional-types.md?catalog-meta'
import { meta as learnDeclarationFilesMeta } from './learn/declaration-files.md?catalog-meta'
import { meta as learnEverydayTypesMeta } from './learn/everyday-types.md?catalog-meta'
import { meta as learnFrameworkTypeIntegrationMeta } from './learn/framework-type-integration.md?catalog-meta'
import { meta as learnFunctionsMeta } from './learn/functions.md?catalog-meta'
import { meta as learnGenericsAndConstraintsMeta } from './learn/generics-and-constraints.md?catalog-meta'
import { meta as learnInferAndDistributionMeta } from './learn/infer-and-distribution.md?catalog-meta'
import { meta as learnKeyofTypeofIndexedAccessMeta } from './learn/keyof-typeof-indexed-access.md?catalog-meta'
import { meta as learnLibraryAuthorBoundariesMeta } from './learn/library-author-boundaries.md?catalog-meta'
import { meta as learnMappedTypesMeta } from './learn/mapped-types.md?catalog-meta'
import { meta as learnModuleResolutionAndPackagesMeta } from './learn/module-resolution-and-packages.md?catalog-meta'
import { meta as learnModulesMeta } from './learn/modules.md?catalog-meta'
import { meta as learnNarrowingMeta } from './learn/narrowing.md?catalog-meta'
import { meta as learnObjectsArraysTuplesMeta } from './learn/objects-arrays-tuples.md?catalog-meta'
import { meta as learnPackageExportsMeta } from './learn/package-exports.md?catalog-meta'
import { meta as learnTemplateLiteralTypesMeta } from './learn/template-literal-types.md?catalog-meta'
import { meta as learnTsconfigLayeringMeta } from './learn/tsconfig-layering.md?catalog-meta'
import { meta as learnTypeDesignMeta } from './learn/type-design.md?catalog-meta'
import { meta as learnTypePerformanceMeta } from './learn/type-performance.md?catalog-meta'
import { meta as learnTypeSystemAndInferenceMeta } from './learn/type-system-and-inference.md?catalog-meta'
import { meta as learnUnionsAndLiteralsMeta } from './learn/unions-and-literals.md?catalog-meta'
import { meta as learnUnknownNeverAndErrorsMeta } from './learn/unknown-never-and-errors.md?catalog-meta'
import { meta as referenceLanguageFoundationsMeta } from './reference/language-foundations.md?catalog-meta'
import { meta as referenceLanguageReferenceMeta } from './reference/language-reference.md?catalog-meta'
import { meta as referenceDeclarationAuthoringPublishingMeta } from './reference/declaration-authoring-publishing.md?catalog-meta'
import { meta as referenceDeclarationFoundationsMeta } from './reference/declaration-foundations.md?catalog-meta'
import { meta as referenceDeclarationGlobalTemplatesMeta } from './reference/declaration-global-templates.md?catalog-meta'
import { meta as referenceDeclarationModuleTemplatesMeta } from './reference/declaration-module-templates.md?catalog-meta'
import { meta as referenceModulesReferenceMeta } from './reference/modules-reference.md?catalog-meta'
import { meta as referenceProjectConfigMeta } from './reference/project-config.md?catalog-meta'
import { meta as referenceTsconfigDiagnosticsSafetyMeta } from './reference/tsconfig-diagnostics-safety.md?catalog-meta'
import { meta as referenceTsconfigEmitDeclarationsMeta } from './reference/tsconfig-emit-declarations.md?catalog-meta'
import { meta as referenceTsconfigEmitOutputMeta } from './reference/tsconfig-emit-output.md?catalog-meta'
import { meta as referenceTsconfigJavaScriptAcquisitionMeta } from './reference/tsconfig-javascript-acquisition.md?catalog-meta'
import { meta as referenceTsconfigLanguageJsxMeta } from './reference/tsconfig-language-jsx.md?catalog-meta'
import { meta as referenceTsconfigModulesResolutionMeta } from './reference/tsconfig-modules-resolution.md?catalog-meta'
import { meta as referenceTsconfigProjectBuildMeta } from './reference/tsconfig-project-build.md?catalog-meta'
import { meta as referenceTsconfigProjectInputMeta } from './reference/tsconfig-project-input.md?catalog-meta'
import { meta as referenceTsconfigStrictnessMeta } from './reference/tsconfig-strictness.md?catalog-meta'
import { meta as referenceTsconfigBuildWatchMeta } from './reference/tsconfig-build-watch.md?catalog-meta'
import { meta as referenceTsconfigModulePathsMeta } from './reference/tsconfig-module-paths.md?catalog-meta'
import { meta as referenceTsconfigTypeEnvironmentMeta } from './reference/tsconfig-type-environment.md?catalog-meta'
import { meta as referenceUtilityTypesMeta } from './reference/utility-types.md?catalog-meta'

export const typeScriptContentEntries: CategoryContentEntryManifest[] = [
  {
    slug: 'aliases-and-interfaces',
    meta: learnAliasesAndInterfacesMeta,
    load: async () => (await import('./learn/aliases-and-interfaces.md?content-entry')).default,
  },
  {
    slug: 'classes-and-compatibility',
    meta: learnClassesAndCompatibilityMeta,
    load: async () => (await import('./learn/classes-and-compatibility.md?content-entry')).default,
  },
  {
    slug: 'conditional-types',
    meta: learnConditionalTypesMeta,
    load: async () => (await import('./learn/conditional-types.md?content-entry')).default,
  },
  {
    slug: 'declaration-files',
    meta: learnDeclarationFilesMeta,
    load: async () => (await import('./learn/declaration-files.md?content-entry')).default,
  },
  {
    slug: 'everyday-types',
    meta: learnEverydayTypesMeta,
    load: async () => (await import('./learn/everyday-types.md?content-entry')).default,
  },
  {
    slug: 'framework-type-integration',
    meta: learnFrameworkTypeIntegrationMeta,
    load: async () => (await import('./learn/framework-type-integration.md?content-entry')).default,
  },
  {
    slug: 'functions',
    meta: learnFunctionsMeta,
    load: async () => (await import('./learn/functions.md?content-entry')).default,
  },
  {
    slug: 'generics-and-constraints',
    meta: learnGenericsAndConstraintsMeta,
    load: async () => (await import('./learn/generics-and-constraints.md?content-entry')).default,
  },
  {
    slug: 'infer-and-distribution',
    meta: learnInferAndDistributionMeta,
    load: async () => (await import('./learn/infer-and-distribution.md?content-entry')).default,
  },
  {
    slug: 'keyof-typeof-indexed-access',
    meta: learnKeyofTypeofIndexedAccessMeta,
    load: async () =>
      (await import('./learn/keyof-typeof-indexed-access.md?content-entry')).default,
  },
  {
    slug: 'library-author-boundaries',
    meta: learnLibraryAuthorBoundariesMeta,
    load: async () => (await import('./learn/library-author-boundaries.md?content-entry')).default,
  },
  {
    slug: 'mapped-types',
    meta: learnMappedTypesMeta,
    load: async () => (await import('./learn/mapped-types.md?content-entry')).default,
  },
  {
    slug: 'module-resolution-and-packages',
    meta: learnModuleResolutionAndPackagesMeta,
    load: async () =>
      (await import('./learn/module-resolution-and-packages.md?content-entry')).default,
  },
  {
    slug: 'modules',
    meta: learnModulesMeta,
    load: async () => (await import('./learn/modules.md?content-entry')).default,
  },
  {
    slug: 'narrowing',
    meta: learnNarrowingMeta,
    load: async () => (await import('./learn/narrowing.md?content-entry')).default,
  },
  {
    slug: 'objects-arrays-tuples',
    meta: learnObjectsArraysTuplesMeta,
    load: async () => (await import('./learn/objects-arrays-tuples.md?content-entry')).default,
  },
  {
    slug: 'package-exports',
    meta: learnPackageExportsMeta,
    load: async () => (await import('./learn/package-exports.md?content-entry')).default,
  },
  {
    slug: 'template-literal-types',
    meta: learnTemplateLiteralTypesMeta,
    load: async () => (await import('./learn/template-literal-types.md?content-entry')).default,
  },
  {
    slug: 'tsconfig-layering',
    meta: learnTsconfigLayeringMeta,
    load: async () => (await import('./learn/tsconfig-layering.md?content-entry')).default,
  },
  {
    slug: 'type-design',
    meta: learnTypeDesignMeta,
    load: async () => (await import('./learn/type-design.md?content-entry')).default,
  },
  {
    slug: 'type-performance',
    meta: learnTypePerformanceMeta,
    load: async () => (await import('./learn/type-performance.md?content-entry')).default,
  },
  {
    slug: 'type-system-and-inference',
    meta: learnTypeSystemAndInferenceMeta,
    load: async () => (await import('./learn/type-system-and-inference.md?content-entry')).default,
  },
  {
    slug: 'unions-and-literals',
    meta: learnUnionsAndLiteralsMeta,
    load: async () => (await import('./learn/unions-and-literals.md?content-entry')).default,
  },
  {
    slug: 'unknown-never-and-errors',
    meta: learnUnknownNeverAndErrorsMeta,
    load: async () => (await import('./learn/unknown-never-and-errors.md?content-entry')).default,
  },
  {
    slug: 'language-foundations',
    meta: referenceLanguageFoundationsMeta,
    load: async () => (await import('./reference/language-foundations.md?content-entry')).default,
  },
  {
    slug: 'language-reference',
    meta: referenceLanguageReferenceMeta,
    load: async () => (await import('./reference/language-reference.md?content-entry')).default,
  },
  {
    slug: 'utility-types',
    meta: referenceUtilityTypesMeta,
    load: async () => (await import('./reference/utility-types.md?content-entry')).default,
  },
  {
    slug: 'modules-reference',
    meta: referenceModulesReferenceMeta,
    load: async () => (await import('./reference/modules-reference.md?content-entry')).default,
  },
  {
    slug: 'declaration-foundations',
    meta: referenceDeclarationFoundationsMeta,
    load: async () =>
      (await import('./reference/declaration-foundations.md?content-entry')).default,
  },
  {
    slug: 'declaration-authoring-publishing',
    meta: referenceDeclarationAuthoringPublishingMeta,
    load: async () =>
      (await import('./reference/declaration-authoring-publishing.md?content-entry')).default,
  },
  {
    slug: 'declaration-module-templates',
    meta: referenceDeclarationModuleTemplatesMeta,
    load: async () =>
      (await import('./reference/declaration-module-templates.md?content-entry')).default,
  },
  {
    slug: 'declaration-global-templates',
    meta: referenceDeclarationGlobalTemplatesMeta,
    load: async () =>
      (await import('./reference/declaration-global-templates.md?content-entry')).default,
  },
  {
    slug: 'project-config',
    meta: referenceProjectConfigMeta,
    load: async () => (await import('./reference/project-config.md?content-entry')).default,
  },
  {
    slug: 'tsconfig-project-input',
    meta: referenceTsconfigProjectInputMeta,
    load: async () => (await import('./reference/tsconfig-project-input.md?content-entry')).default,
  },
  {
    slug: 'tsconfig-javascript-acquisition',
    meta: referenceTsconfigJavaScriptAcquisitionMeta,
    load: async () =>
      (await import('./reference/tsconfig-javascript-acquisition.md?content-entry')).default,
  },
  {
    slug: 'tsconfig-project-build',
    meta: referenceTsconfigProjectBuildMeta,
    load: async () => (await import('./reference/tsconfig-project-build.md?content-entry')).default,
  },
  {
    slug: 'tsconfig-emit-declarations',
    meta: referenceTsconfigEmitDeclarationsMeta,
    load: async () =>
      (await import('./reference/tsconfig-emit-declarations.md?content-entry')).default,
  },
  {
    slug: 'tsconfig-diagnostics-safety',
    meta: referenceTsconfigDiagnosticsSafetyMeta,
    load: async () =>
      (await import('./reference/tsconfig-diagnostics-safety.md?content-entry')).default,
  },
  {
    slug: 'tsconfig-modules-resolution',
    meta: referenceTsconfigModulesResolutionMeta,
    load: async () =>
      (await import('./reference/tsconfig-modules-resolution.md?content-entry')).default,
  },
  {
    slug: 'tsconfig-language-jsx',
    meta: referenceTsconfigLanguageJsxMeta,
    load: async () => (await import('./reference/tsconfig-language-jsx.md?content-entry')).default,
  },
  {
    slug: 'tsconfig-strictness',
    meta: referenceTsconfigStrictnessMeta,
    load: async () => (await import('./reference/tsconfig-strictness.md?content-entry')).default,
  },
  {
    slug: 'tsconfig-emit-output',
    meta: referenceTsconfigEmitOutputMeta,
    load: async () => (await import('./reference/tsconfig-emit-output.md?content-entry')).default,
  },
  {
    slug: 'tsconfig-module-paths',
    meta: referenceTsconfigModulePathsMeta,
    load: async () => (await import('./reference/tsconfig-module-paths.md?content-entry')).default,
  },
  {
    slug: 'tsconfig-type-environment',
    meta: referenceTsconfigTypeEnvironmentMeta,
    load: async () =>
      (await import('./reference/tsconfig-type-environment.md?content-entry')).default,
  },
  {
    slug: 'tsconfig-build-watch',
    meta: referenceTsconfigBuildWatchMeta,
    load: async () => (await import('./reference/tsconfig-build-watch.md?content-entry')).default,
  },
]
