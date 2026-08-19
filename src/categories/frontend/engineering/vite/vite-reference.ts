import type { ReferenceTrackManifest } from '@/common/catalog/types'

export const engineeringViteReferenceManifest: ReferenceTrackManifest = {
  groups: [
    {
      id: 'configuration',
      title: 'Configuration',
      summary: '共享、开发服务器、构建、预览、依赖优化、SSR 与 Worker 配置。',
      entryIds: [
        'engineering.vite.reference.config-shared',
        'engineering.vite.reference.config-server',
        'engineering.vite.reference.config-build',
        'engineering.vite.reference.config-preview',
        'engineering.vite.reference.config-dependency-optimization',
        'engineering.vite.reference.config-ssr-worker',
      ],
    },
    {
      id: 'programmatic-api',
      title: 'Programmatic API',
      summary: '插件钩子、HMR 上下文与 JavaScript API。',
      entryIds: [
        'engineering.vite.reference.plugin-api',
        'engineering.vite.reference.javascript-api',
        'engineering.vite.reference.hmr-api',
      ],
    },
    {
      id: 'features-and-boundaries',
      title: 'Features & Boundaries',
      summary: '资源、环境变量、构建工具边界、CLI 与迁移。',
      entryIds: [
        'engineering.vite.reference.features-assets-env',
        'engineering.vite.reference.build-rollup-boundary',
        'engineering.vite.reference.cli-and-migration',
      ],
    },
  ],
}
