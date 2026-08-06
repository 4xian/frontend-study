import type { CategoryContentEntryManifest } from '@/common/catalog'

import { meta as learnAliasesAndInterfacesMeta } from './learn/aliases-and-interfaces.md?catalog-meta'
import { meta as learnClassesAndCompatibilityMeta } from './learn/classes-and-compatibility.md?catalog-meta'
import { meta as learnConditionalTypesMeta } from './learn/conditional-types.md?catalog-meta'
import { meta as learnEverydayTypesMeta } from './learn/everyday-types.md?catalog-meta'
import { meta as learnFunctionsMeta } from './learn/functions.md?catalog-meta'
import { meta as learnGenericsAndConstraintsMeta } from './learn/generics-and-constraints.md?catalog-meta'
import { meta as learnKeyofTypeofIndexedAccessMeta } from './learn/keyof-typeof-indexed-access.md?catalog-meta'
import { meta as learnMappedTypesMeta } from './learn/mapped-types.md?catalog-meta'
import { meta as learnModuleResolutionAndPackagesMeta } from './learn/module-resolution-and-packages.md?catalog-meta'
import { meta as learnModulesMeta } from './learn/modules.md?catalog-meta'
import { meta as learnNarrowingMeta } from './learn/narrowing.md?catalog-meta'
import { meta as learnObjectsArraysTuplesMeta } from './learn/objects-arrays-tuples.md?catalog-meta'
import { meta as learnTemplateLiteralTypesMeta } from './learn/template-literal-types.md?catalog-meta'
import { meta as learnTypeSystemAndInferenceMeta } from './learn/type-system-and-inference.md?catalog-meta'
import { meta as learnUnionsAndLiteralsMeta } from './learn/unions-and-literals.md?catalog-meta'
import { meta as learnUnknownNeverAndErrorsMeta } from './learn/unknown-never-and-errors.md?catalog-meta'

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
    slug: 'everyday-types',
    meta: learnEverydayTypesMeta,
    load: async () => (await import('./learn/everyday-types.md?content-entry')).default,
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
    slug: 'keyof-typeof-indexed-access',
    meta: learnKeyofTypeofIndexedAccessMeta,
    load: async () =>
      (await import('./learn/keyof-typeof-indexed-access.md?content-entry')).default,
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
    slug: 'template-literal-types',
    meta: learnTemplateLiteralTypesMeta,
    load: async () => (await import('./learn/template-literal-types.md?content-entry')).default,
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
]
