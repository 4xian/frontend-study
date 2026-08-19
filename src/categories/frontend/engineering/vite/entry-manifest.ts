import type { CategoryContentEntryManifest } from '@/common/catalog'

import { meta as learnBackendIntegrationAndDeliveryMeta } from './learn/backend-integration-and-delivery.md?catalog-meta'
import { meta as learnBuildOutputAndChunksMeta } from './learn/build-output-and-chunks.md?catalog-meta'
import { meta as learnConfigAndModeMeta } from './learn/config-and-mode.md?catalog-meta'
import { meta as learnConfigMergeAndOverridesMeta } from './learn/config-merge-and-overrides.md?catalog-meta'
import { meta as learnCssAndResourcePipelineMeta } from './learn/css-and-resource-pipeline.md?catalog-meta'
import { meta as learnDependencyOptimizationMeta } from './learn/dependency-optimization.md?catalog-meta'
import { meta as learnDevServerBrowserLoadingMeta } from './learn/dev-server-browser-loading.md?catalog-meta'
import { meta as learnGlobAndGeneratedModulesMeta } from './learn/glob-and-generated-modules.md?catalog-meta'
import { meta as learnHmrModelStatePreservationMeta } from './learn/hmr-model-state-preservation.md?catalog-meta'
import { meta as learnJsonWorkerAndDynamicImportMeta } from './learn/json-worker-and-dynamic-import.md?catalog-meta'
import { meta as learnLibraryModeAndTypesMeta } from './learn/library-mode-and-types.md?catalog-meta'
import { meta as learnModesEnvSecurityMeta } from './learn/modes-env-security.md?catalog-meta'
import { meta as learnPerformanceSourceMapsMeta } from './learn/performance-source-maps.md?catalog-meta'
import { meta as learnPluginHooksMeta } from './learn/plugin-hooks.md?catalog-meta'
import { meta as learnPluginOrderAndApplicationMeta } from './learn/plugin-order-and-application.md?catalog-meta'
import { meta as learnPreviewDeploymentPathsMeta } from './learn/preview-deployment-paths.md?catalog-meta'
import { meta as learnProblemAndWorkflowMeta } from './learn/problem-and-workflow.md?catalog-meta'
import { meta as learnProjectEntryAndModuleGraphMeta } from './learn/project-entry-and-module-graph.md?catalog-meta'
import { meta as learnProxyAndCrossOriginMeta } from './learn/proxy-and-cross-origin.md?catalog-meta'
import { meta as learnRollupRolldownAndManualChunksMeta } from './learn/rollup-rolldown-and-manual-chunks.md?catalog-meta'
import { meta as learnSecurityAndMigrationMeta } from './learn/security-and-migration.md?catalog-meta'
import { meta as learnSsrDevBuildHydrationMeta } from './learn/ssr-dev-build-hydration.md?catalog-meta'
import { meta as learnStaticAssetsAndUrlMeta } from './learn/static-assets-and-url.md?catalog-meta'
import { meta as learnWorkerBaseAndMultiEnvMeta } from './learn/worker-base-and-multi-env.md?catalog-meta'
import { meta as referenceBuildRollupBoundaryMeta } from './reference/build-rollup-boundary.md?catalog-meta'
import { meta as referenceCliAndMigrationMeta } from './reference/cli-and-migration.md?catalog-meta'
import { meta as referenceConfigBuildMeta } from './reference/config-build.md?catalog-meta'
import { meta as referenceConfigDependencyOptimizationMeta } from './reference/config-dependency-optimization.md?catalog-meta'
import { meta as referenceConfigPreviewMeta } from './reference/config-preview.md?catalog-meta'
import { meta as referenceConfigServerMeta } from './reference/config-server.md?catalog-meta'
import { meta as referenceConfigSharedMeta } from './reference/config-shared.md?catalog-meta'
import { meta as referenceConfigSsrWorkerMeta } from './reference/config-ssr-worker.md?catalog-meta'
import { meta as referenceFeaturesAssetsEnvMeta } from './reference/features-assets-env.md?catalog-meta'
import { meta as referenceHmrApiMeta } from './reference/hmr-api.md?catalog-meta'
import { meta as referenceJavaScriptApiMeta } from './reference/javascript-api.md?catalog-meta'
import { meta as referencePluginApiMeta } from './reference/plugin-api.md?catalog-meta'

export const viteContentEntries: CategoryContentEntryManifest[] = [
  {
    slug: 'problem-and-workflow',
    meta: learnProblemAndWorkflowMeta,
    load: async () => (await import('./learn/problem-and-workflow.md?content-entry')).default,
  },
  {
    slug: 'project-entry-and-module-graph',
    meta: learnProjectEntryAndModuleGraphMeta,
    load: async () =>
      (await import('./learn/project-entry-and-module-graph.md?content-entry')).default,
  },
  {
    slug: 'dev-server-browser-loading',
    meta: learnDevServerBrowserLoadingMeta,
    load: async () => (await import('./learn/dev-server-browser-loading.md?content-entry')).default,
  },
  {
    slug: 'static-assets-and-url',
    meta: learnStaticAssetsAndUrlMeta,
    load: async () => (await import('./learn/static-assets-and-url.md?content-entry')).default,
  },
  {
    slug: 'css-and-resource-pipeline',
    meta: learnCssAndResourcePipelineMeta,
    load: async () => (await import('./learn/css-and-resource-pipeline.md?content-entry')).default,
  },
  {
    slug: 'json-worker-and-dynamic-import',
    meta: learnJsonWorkerAndDynamicImportMeta,
    load: async () =>
      (await import('./learn/json-worker-and-dynamic-import.md?content-entry')).default,
  },
  {
    slug: 'modes-env-security',
    meta: learnModesEnvSecurityMeta,
    load: async () => (await import('./learn/modes-env-security.md?content-entry')).default,
  },
  {
    slug: 'hmr-model-state-preservation',
    meta: learnHmrModelStatePreservationMeta,
    load: async () =>
      (await import('./learn/hmr-model-state-preservation.md?content-entry')).default,
  },
  {
    slug: 'config-and-mode',
    meta: learnConfigAndModeMeta,
    load: async () => (await import('./learn/config-and-mode.md?content-entry')).default,
  },
  {
    slug: 'config-merge-and-overrides',
    meta: learnConfigMergeAndOverridesMeta,
    load: async () => (await import('./learn/config-merge-and-overrides.md?content-entry')).default,
  },
  {
    slug: 'plugin-order-and-application',
    meta: learnPluginOrderAndApplicationMeta,
    load: async () =>
      (await import('./learn/plugin-order-and-application.md?content-entry')).default,
  },
  {
    slug: 'plugin-hooks',
    meta: learnPluginHooksMeta,
    load: async () => (await import('./learn/plugin-hooks.md?content-entry')).default,
  },
  {
    slug: 'dependency-optimization',
    meta: learnDependencyOptimizationMeta,
    load: async () => (await import('./learn/dependency-optimization.md?content-entry')).default,
  },
  {
    slug: 'proxy-and-cross-origin',
    meta: learnProxyAndCrossOriginMeta,
    load: async () => (await import('./learn/proxy-and-cross-origin.md?content-entry')).default,
  },
  {
    slug: 'glob-and-generated-modules',
    meta: learnGlobAndGeneratedModulesMeta,
    load: async () => (await import('./learn/glob-and-generated-modules.md?content-entry')).default,
  },
  {
    slug: 'worker-base-and-multi-env',
    meta: learnWorkerBaseAndMultiEnvMeta,
    load: async () => (await import('./learn/worker-base-and-multi-env.md?content-entry')).default,
  },
  {
    slug: 'build-output-and-chunks',
    meta: learnBuildOutputAndChunksMeta,
    load: async () => (await import('./learn/build-output-and-chunks.md?content-entry')).default,
  },
  {
    slug: 'rollup-rolldown-and-manual-chunks',
    meta: learnRollupRolldownAndManualChunksMeta,
    load: async () =>
      (await import('./learn/rollup-rolldown-and-manual-chunks.md?content-entry')).default,
  },
  {
    slug: 'library-mode-and-types',
    meta: learnLibraryModeAndTypesMeta,
    load: async () => (await import('./learn/library-mode-and-types.md?content-entry')).default,
  },
  {
    slug: 'preview-deployment-paths',
    meta: learnPreviewDeploymentPathsMeta,
    load: async () => (await import('./learn/preview-deployment-paths.md?content-entry')).default,
  },
  {
    slug: 'ssr-dev-build-hydration',
    meta: learnSsrDevBuildHydrationMeta,
    load: async () => (await import('./learn/ssr-dev-build-hydration.md?content-entry')).default,
  },
  {
    slug: 'backend-integration-and-delivery',
    meta: learnBackendIntegrationAndDeliveryMeta,
    load: async () =>
      (await import('./learn/backend-integration-and-delivery.md?content-entry')).default,
  },
  {
    slug: 'performance-source-maps',
    meta: learnPerformanceSourceMapsMeta,
    load: async () => (await import('./learn/performance-source-maps.md?content-entry')).default,
  },
  {
    slug: 'security-and-migration',
    meta: learnSecurityAndMigrationMeta,
    load: async () => (await import('./learn/security-and-migration.md?content-entry')).default,
  },
  {
    slug: 'config-shared',
    meta: referenceConfigSharedMeta,
    load: async () => (await import('./reference/config-shared.md?content-entry')).default,
  },
  {
    slug: 'config-server',
    meta: referenceConfigServerMeta,
    load: async () => (await import('./reference/config-server.md?content-entry')).default,
  },
  {
    slug: 'config-build',
    meta: referenceConfigBuildMeta,
    load: async () => (await import('./reference/config-build.md?content-entry')).default,
  },
  {
    slug: 'config-preview',
    meta: referenceConfigPreviewMeta,
    load: async () => (await import('./reference/config-preview.md?content-entry')).default,
  },
  {
    slug: 'config-dependency-optimization',
    meta: referenceConfigDependencyOptimizationMeta,
    load: async () =>
      (await import('./reference/config-dependency-optimization.md?content-entry')).default,
  },
  {
    slug: 'config-ssr-worker',
    meta: referenceConfigSsrWorkerMeta,
    load: async () => (await import('./reference/config-ssr-worker.md?content-entry')).default,
  },
  {
    slug: 'plugin-api',
    meta: referencePluginApiMeta,
    load: async () => (await import('./reference/plugin-api.md?content-entry')).default,
  },
  {
    slug: 'javascript-api',
    meta: referenceJavaScriptApiMeta,
    load: async () => (await import('./reference/javascript-api.md?content-entry')).default,
  },
  {
    slug: 'hmr-api',
    meta: referenceHmrApiMeta,
    load: async () => (await import('./reference/hmr-api.md?content-entry')).default,
  },
  {
    slug: 'features-assets-env',
    meta: referenceFeaturesAssetsEnvMeta,
    load: async () => (await import('./reference/features-assets-env.md?content-entry')).default,
  },
  {
    slug: 'build-rollup-boundary',
    meta: referenceBuildRollupBoundaryMeta,
    load: async () => (await import('./reference/build-rollup-boundary.md?content-entry')).default,
  },
  {
    slug: 'cli-and-migration',
    meta: referenceCliAndMigrationMeta,
    load: async () => (await import('./reference/cli-and-migration.md?content-entry')).default,
  },
]
