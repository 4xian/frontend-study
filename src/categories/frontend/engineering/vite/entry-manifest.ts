import type { CategoryContentEntryManifest } from '@/common/catalog'
import { getContentMeta } from 'virtual:content-catalog-meta'

export const viteContentEntries: CategoryContentEntryManifest[] = [
  {
    slug: 'problem-and-workflow',
    meta: getContentMeta('src/categories/frontend/engineering/vite/learn/problem-and-workflow.md'),
    load: async () => (await import('./learn/problem-and-workflow.md?content-entry')).default,
  },
  {
    slug: 'project-entry-and-module-graph',
    meta: getContentMeta(
      'src/categories/frontend/engineering/vite/learn/project-entry-and-module-graph.md',
    ),
    load: async () =>
      (await import('./learn/project-entry-and-module-graph.md?content-entry')).default,
  },
  {
    slug: 'dev-server-browser-loading',
    meta: getContentMeta(
      'src/categories/frontend/engineering/vite/learn/dev-server-browser-loading.md',
    ),
    load: async () => (await import('./learn/dev-server-browser-loading.md?content-entry')).default,
  },
  {
    slug: 'static-assets-and-url',
    meta: getContentMeta('src/categories/frontend/engineering/vite/learn/static-assets-and-url.md'),
    load: async () => (await import('./learn/static-assets-and-url.md?content-entry')).default,
  },
  {
    slug: 'css-and-resource-pipeline',
    meta: getContentMeta(
      'src/categories/frontend/engineering/vite/learn/css-and-resource-pipeline.md',
    ),
    load: async () => (await import('./learn/css-and-resource-pipeline.md?content-entry')).default,
  },
  {
    slug: 'json-worker-and-dynamic-import',
    meta: getContentMeta(
      'src/categories/frontend/engineering/vite/learn/json-worker-and-dynamic-import.md',
    ),
    load: async () =>
      (await import('./learn/json-worker-and-dynamic-import.md?content-entry')).default,
  },
  {
    slug: 'modes-env-security',
    meta: getContentMeta('src/categories/frontend/engineering/vite/learn/modes-env-security.md'),
    load: async () => (await import('./learn/modes-env-security.md?content-entry')).default,
  },
  {
    slug: 'hmr-model-state-preservation',
    meta: getContentMeta(
      'src/categories/frontend/engineering/vite/learn/hmr-model-state-preservation.md',
    ),
    load: async () =>
      (await import('./learn/hmr-model-state-preservation.md?content-entry')).default,
  },
  {
    slug: 'config-and-mode',
    meta: getContentMeta('src/categories/frontend/engineering/vite/learn/config-and-mode.md'),
    load: async () => (await import('./learn/config-and-mode.md?content-entry')).default,
  },
  {
    slug: 'config-merge-and-overrides',
    meta: getContentMeta(
      'src/categories/frontend/engineering/vite/learn/config-merge-and-overrides.md',
    ),
    load: async () => (await import('./learn/config-merge-and-overrides.md?content-entry')).default,
  },
  {
    slug: 'plugin-order-and-application',
    meta: getContentMeta(
      'src/categories/frontend/engineering/vite/learn/plugin-order-and-application.md',
    ),
    load: async () =>
      (await import('./learn/plugin-order-and-application.md?content-entry')).default,
  },
  {
    slug: 'plugin-hooks',
    meta: getContentMeta('src/categories/frontend/engineering/vite/learn/plugin-hooks.md'),
    load: async () => (await import('./learn/plugin-hooks.md?content-entry')).default,
  },
  {
    slug: 'dependency-optimization',
    meta: getContentMeta(
      'src/categories/frontend/engineering/vite/learn/dependency-optimization.md',
    ),
    load: async () => (await import('./learn/dependency-optimization.md?content-entry')).default,
  },
  {
    slug: 'proxy-and-cross-origin',
    meta: getContentMeta(
      'src/categories/frontend/engineering/vite/learn/proxy-and-cross-origin.md',
    ),
    load: async () => (await import('./learn/proxy-and-cross-origin.md?content-entry')).default,
  },
  {
    slug: 'glob-and-generated-modules',
    meta: getContentMeta(
      'src/categories/frontend/engineering/vite/learn/glob-and-generated-modules.md',
    ),
    load: async () => (await import('./learn/glob-and-generated-modules.md?content-entry')).default,
  },
  {
    slug: 'worker-base-and-multi-env',
    meta: getContentMeta(
      'src/categories/frontend/engineering/vite/learn/worker-base-and-multi-env.md',
    ),
    load: async () => (await import('./learn/worker-base-and-multi-env.md?content-entry')).default,
  },
  {
    slug: 'build-output-and-chunks',
    meta: getContentMeta(
      'src/categories/frontend/engineering/vite/learn/build-output-and-chunks.md',
    ),
    load: async () => (await import('./learn/build-output-and-chunks.md?content-entry')).default,
  },
  {
    slug: 'rollup-rolldown-and-manual-chunks',
    meta: getContentMeta(
      'src/categories/frontend/engineering/vite/learn/rollup-rolldown-and-manual-chunks.md',
    ),
    load: async () =>
      (await import('./learn/rollup-rolldown-and-manual-chunks.md?content-entry')).default,
  },
  {
    slug: 'library-mode-and-types',
    meta: getContentMeta(
      'src/categories/frontend/engineering/vite/learn/library-mode-and-types.md',
    ),
    load: async () => (await import('./learn/library-mode-and-types.md?content-entry')).default,
  },
  {
    slug: 'preview-deployment-paths',
    meta: getContentMeta(
      'src/categories/frontend/engineering/vite/learn/preview-deployment-paths.md',
    ),
    load: async () => (await import('./learn/preview-deployment-paths.md?content-entry')).default,
  },
  {
    slug: 'ssr-dev-build-hydration',
    meta: getContentMeta(
      'src/categories/frontend/engineering/vite/learn/ssr-dev-build-hydration.md',
    ),
    load: async () => (await import('./learn/ssr-dev-build-hydration.md?content-entry')).default,
  },
  {
    slug: 'backend-integration-and-delivery',
    meta: getContentMeta(
      'src/categories/frontend/engineering/vite/learn/backend-integration-and-delivery.md',
    ),
    load: async () =>
      (await import('./learn/backend-integration-and-delivery.md?content-entry')).default,
  },
  {
    slug: 'performance-source-maps',
    meta: getContentMeta(
      'src/categories/frontend/engineering/vite/learn/performance-source-maps.md',
    ),
    load: async () => (await import('./learn/performance-source-maps.md?content-entry')).default,
  },
  {
    slug: 'security-and-migration',
    meta: getContentMeta(
      'src/categories/frontend/engineering/vite/learn/security-and-migration.md',
    ),
    load: async () => (await import('./learn/security-and-migration.md?content-entry')).default,
  },
  {
    slug: 'config-shared',
    meta: getContentMeta('src/categories/frontend/engineering/vite/reference/config-shared.md'),
    load: async () => (await import('./reference/config-shared.md?content-entry')).default,
  },
  {
    slug: 'config-server',
    meta: getContentMeta('src/categories/frontend/engineering/vite/reference/config-server.md'),
    load: async () => (await import('./reference/config-server.md?content-entry')).default,
  },
  {
    slug: 'config-build',
    meta: getContentMeta('src/categories/frontend/engineering/vite/reference/config-build.md'),
    load: async () => (await import('./reference/config-build.md?content-entry')).default,
  },
  {
    slug: 'config-preview',
    meta: getContentMeta('src/categories/frontend/engineering/vite/reference/config-preview.md'),
    load: async () => (await import('./reference/config-preview.md?content-entry')).default,
  },
  {
    slug: 'config-dependency-optimization',
    meta: getContentMeta(
      'src/categories/frontend/engineering/vite/reference/config-dependency-optimization.md',
    ),
    load: async () =>
      (await import('./reference/config-dependency-optimization.md?content-entry')).default,
  },
  {
    slug: 'config-ssr-worker',
    meta: getContentMeta('src/categories/frontend/engineering/vite/reference/config-ssr-worker.md'),
    load: async () => (await import('./reference/config-ssr-worker.md?content-entry')).default,
  },
  {
    slug: 'plugin-api',
    meta: getContentMeta('src/categories/frontend/engineering/vite/reference/plugin-api.md'),
    load: async () => (await import('./reference/plugin-api.md?content-entry')).default,
  },
  {
    slug: 'javascript-api',
    meta: getContentMeta('src/categories/frontend/engineering/vite/reference/javascript-api.md'),
    load: async () => (await import('./reference/javascript-api.md?content-entry')).default,
  },
  {
    slug: 'hmr-api',
    meta: getContentMeta('src/categories/frontend/engineering/vite/reference/hmr-api.md'),
    load: async () => (await import('./reference/hmr-api.md?content-entry')).default,
  },
  {
    slug: 'features-assets-env',
    meta: getContentMeta(
      'src/categories/frontend/engineering/vite/reference/features-assets-env.md',
    ),
    load: async () => (await import('./reference/features-assets-env.md?content-entry')).default,
  },
  {
    slug: 'build-rollup-boundary',
    meta: getContentMeta(
      'src/categories/frontend/engineering/vite/reference/build-rollup-boundary.md',
    ),
    load: async () => (await import('./reference/build-rollup-boundary.md?content-entry')).default,
  },
  {
    slug: 'cli-and-migration',
    meta: getContentMeta('src/categories/frontend/engineering/vite/reference/cli-and-migration.md'),
    load: async () => (await import('./reference/cli-and-migration.md?content-entry')).default,
  },
]
