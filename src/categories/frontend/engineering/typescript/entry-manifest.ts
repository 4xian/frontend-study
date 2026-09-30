import type { CategoryContentEntryManifest } from '@/common/catalog'
import { getContentMeta } from 'virtual:content-catalog-meta'

export const typeScriptContentEntries: CategoryContentEntryManifest[] = [
  {
    slug: 'aliases-and-interfaces',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/learn/aliases-and-interfaces.md',
    ),
    load: async () => (await import('./learn/aliases-and-interfaces.md?content-entry')).default,
  },
  {
    slug: 'classes-and-compatibility',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/learn/classes-and-compatibility.md',
    ),
    load: async () => (await import('./learn/classes-and-compatibility.md?content-entry')).default,
  },
  {
    slug: 'conditional-types',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/learn/conditional-types.md',
    ),
    load: async () => (await import('./learn/conditional-types.md?content-entry')).default,
  },
  {
    slug: 'declaration-files',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/learn/declaration-files.md',
    ),
    load: async () => (await import('./learn/declaration-files.md?content-entry')).default,
  },
  {
    slug: 'everyday-types',
    meta: getContentMeta('src/categories/frontend/engineering/typescript/learn/everyday-types.md'),
    load: async () => (await import('./learn/everyday-types.md?content-entry')).default,
  },
  {
    slug: 'framework-type-integration',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/learn/framework-type-integration.md',
    ),
    load: async () => (await import('./learn/framework-type-integration.md?content-entry')).default,
  },
  {
    slug: 'functions',
    meta: getContentMeta('src/categories/frontend/engineering/typescript/learn/functions.md'),
    load: async () => (await import('./learn/functions.md?content-entry')).default,
  },
  {
    slug: 'generics-and-constraints',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/learn/generics-and-constraints.md',
    ),
    load: async () => (await import('./learn/generics-and-constraints.md?content-entry')).default,
  },
  {
    slug: 'infer-and-distribution',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/learn/infer-and-distribution.md',
    ),
    load: async () => (await import('./learn/infer-and-distribution.md?content-entry')).default,
  },
  {
    slug: 'keyof-typeof-indexed-access',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/learn/keyof-typeof-indexed-access.md',
    ),
    load: async () =>
      (await import('./learn/keyof-typeof-indexed-access.md?content-entry')).default,
  },
  {
    slug: 'library-author-boundaries',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/learn/library-author-boundaries.md',
    ),
    load: async () => (await import('./learn/library-author-boundaries.md?content-entry')).default,
  },
  {
    slug: 'mapped-types',
    meta: getContentMeta('src/categories/frontend/engineering/typescript/learn/mapped-types.md'),
    load: async () => (await import('./learn/mapped-types.md?content-entry')).default,
  },
  {
    slug: 'module-resolution-and-packages',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/learn/module-resolution-and-packages.md',
    ),
    load: async () =>
      (await import('./learn/module-resolution-and-packages.md?content-entry')).default,
  },
  {
    slug: 'modules',
    meta: getContentMeta('src/categories/frontend/engineering/typescript/learn/modules.md'),
    load: async () => (await import('./learn/modules.md?content-entry')).default,
  },
  {
    slug: 'narrowing',
    meta: getContentMeta('src/categories/frontend/engineering/typescript/learn/narrowing.md'),
    load: async () => (await import('./learn/narrowing.md?content-entry')).default,
  },
  {
    slug: 'objects-arrays-tuples',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/learn/objects-arrays-tuples.md',
    ),
    load: async () => (await import('./learn/objects-arrays-tuples.md?content-entry')).default,
  },
  {
    slug: 'package-exports',
    meta: getContentMeta('src/categories/frontend/engineering/typescript/learn/package-exports.md'),
    load: async () => (await import('./learn/package-exports.md?content-entry')).default,
  },
  {
    slug: 'template-literal-types',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/learn/template-literal-types.md',
    ),
    load: async () => (await import('./learn/template-literal-types.md?content-entry')).default,
  },
  {
    slug: 'tsconfig-layering',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/learn/tsconfig-layering.md',
    ),
    load: async () => (await import('./learn/tsconfig-layering.md?content-entry')).default,
  },
  {
    slug: 'type-design',
    meta: getContentMeta('src/categories/frontend/engineering/typescript/learn/type-design.md'),
    load: async () => (await import('./learn/type-design.md?content-entry')).default,
  },
  {
    slug: 'type-performance',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/learn/type-performance.md',
    ),
    load: async () => (await import('./learn/type-performance.md?content-entry')).default,
  },
  {
    slug: 'type-system-and-inference',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/learn/type-system-and-inference.md',
    ),
    load: async () => (await import('./learn/type-system-and-inference.md?content-entry')).default,
  },
  {
    slug: 'unions-and-literals',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/learn/unions-and-literals.md',
    ),
    load: async () => (await import('./learn/unions-and-literals.md?content-entry')).default,
  },
  {
    slug: 'unknown-never-and-errors',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/learn/unknown-never-and-errors.md',
    ),
    load: async () => (await import('./learn/unknown-never-and-errors.md?content-entry')).default,
  },
  {
    slug: 'language-foundations',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/reference/language-foundations.md',
    ),
    load: async () => (await import('./reference/language-foundations.md?content-entry')).default,
  },
  {
    slug: 'language-reference',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/reference/language-reference.md',
    ),
    load: async () => (await import('./reference/language-reference.md?content-entry')).default,
  },
  {
    slug: 'utility-types',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/reference/utility-types.md',
    ),
    load: async () => (await import('./reference/utility-types.md?content-entry')).default,
  },
  {
    slug: 'modules-reference',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/reference/modules-reference.md',
    ),
    load: async () => (await import('./reference/modules-reference.md?content-entry')).default,
  },
  {
    slug: 'declaration-foundations',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/reference/declaration-foundations.md',
    ),
    load: async () =>
      (await import('./reference/declaration-foundations.md?content-entry')).default,
  },
  {
    slug: 'declaration-authoring-publishing',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/reference/declaration-authoring-publishing.md',
    ),
    load: async () =>
      (await import('./reference/declaration-authoring-publishing.md?content-entry')).default,
  },
  {
    slug: 'declaration-module-templates',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/reference/declaration-module-templates.md',
    ),
    load: async () =>
      (await import('./reference/declaration-module-templates.md?content-entry')).default,
  },
  {
    slug: 'declaration-global-templates',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/reference/declaration-global-templates.md',
    ),
    load: async () =>
      (await import('./reference/declaration-global-templates.md?content-entry')).default,
  },
  {
    slug: 'project-config',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/reference/project-config.md',
    ),
    load: async () => (await import('./reference/project-config.md?content-entry')).default,
  },
  {
    slug: 'tsconfig-project-input',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/reference/tsconfig-project-input.md',
    ),
    load: async () => (await import('./reference/tsconfig-project-input.md?content-entry')).default,
  },
  {
    slug: 'tsconfig-javascript-acquisition',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/reference/tsconfig-javascript-acquisition.md',
    ),
    load: async () =>
      (await import('./reference/tsconfig-javascript-acquisition.md?content-entry')).default,
  },
  {
    slug: 'tsconfig-project-build',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/reference/tsconfig-project-build.md',
    ),
    load: async () => (await import('./reference/tsconfig-project-build.md?content-entry')).default,
  },
  {
    slug: 'tsconfig-emit-declarations',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/reference/tsconfig-emit-declarations.md',
    ),
    load: async () =>
      (await import('./reference/tsconfig-emit-declarations.md?content-entry')).default,
  },
  {
    slug: 'tsconfig-diagnostics-safety',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/reference/tsconfig-diagnostics-safety.md',
    ),
    load: async () =>
      (await import('./reference/tsconfig-diagnostics-safety.md?content-entry')).default,
  },
  {
    slug: 'tsconfig-modules-resolution',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/reference/tsconfig-modules-resolution.md',
    ),
    load: async () =>
      (await import('./reference/tsconfig-modules-resolution.md?content-entry')).default,
  },
  {
    slug: 'tsconfig-language-jsx',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/reference/tsconfig-language-jsx.md',
    ),
    load: async () => (await import('./reference/tsconfig-language-jsx.md?content-entry')).default,
  },
  {
    slug: 'tsconfig-strictness',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/reference/tsconfig-strictness.md',
    ),
    load: async () => (await import('./reference/tsconfig-strictness.md?content-entry')).default,
  },
  {
    slug: 'tsconfig-emit-output',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/reference/tsconfig-emit-output.md',
    ),
    load: async () => (await import('./reference/tsconfig-emit-output.md?content-entry')).default,
  },
  {
    slug: 'tsconfig-module-paths',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/reference/tsconfig-module-paths.md',
    ),
    load: async () => (await import('./reference/tsconfig-module-paths.md?content-entry')).default,
  },
  {
    slug: 'tsconfig-type-environment',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/reference/tsconfig-type-environment.md',
    ),
    load: async () =>
      (await import('./reference/tsconfig-type-environment.md?content-entry')).default,
  },
  {
    slug: 'tsconfig-build-watch',
    meta: getContentMeta(
      'src/categories/frontend/engineering/typescript/reference/tsconfig-build-watch.md',
    ),
    load: async () => (await import('./reference/tsconfig-build-watch.md?content-entry')).default,
  },
]
