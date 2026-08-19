import type { LearningTrackManifest } from '@/common/catalog/types'

export const engineeringViteTrackManifest: LearningTrackManifest = {
  stages: [
    {
      id: 'basics',
      title: '基础课程',
      summary: '建立开发服务器、模块图、资源管线、环境变量和 HMR 的基础模型。',
      categories: [
        {
          id: 'development-foundations',
          title: '开发期基础',
          summary: '从 HTML 入口追踪到浏览器请求，并理解资源、环境变量与热更新边界。',
          topics: ['开发服务器', '模块图', '静态资源', 'CSS', 'Worker', '环境变量', 'HMR'],
          entries: [
            { id: 'engineering.vite.learn.basics.problem-and-workflow', status: 'available' },
            {
              id: 'engineering.vite.learn.basics.project-entry-and-module-graph',
              status: 'available',
            },
            {
              id: 'engineering.vite.learn.basics.dev-server-browser-loading',
              status: 'available',
            },
            { id: 'engineering.vite.learn.basics.static-assets-and-url', status: 'available' },
            {
              id: 'engineering.vite.learn.basics.css-and-resource-pipeline',
              status: 'available',
            },
            {
              id: 'engineering.vite.learn.basics.json-worker-and-dynamic-import',
              status: 'available',
            },
            { id: 'engineering.vite.learn.basics.modes-env-security', status: 'available' },
            {
              id: 'engineering.vite.learn.basics.hmr-model-state-preservation',
              status: 'available',
            },
          ],
        },
      ],
    },
    {
      id: 'intermediate',
      title: '中级课程',
      summary: '配置插件执行、依赖优化、代理、生成模块以及多环境资源路径。',
      categories: [
        {
          id: 'configuration-and-plugins',
          title: '配置、插件与开发边界',
          summary: '让配置和插件在正确阶段运行，并以真实请求检查开发期基础设施。',
          topics: ['配置合并', 'Plugin API', '依赖优化', '代理', 'glob', 'Worker', 'base'],
          entries: [
            { id: 'engineering.vite.learn.intermediate.config-and-mode', status: 'available' },
            {
              id: 'engineering.vite.learn.intermediate.config-merge-and-overrides',
              status: 'available',
            },
            {
              id: 'engineering.vite.learn.intermediate.plugin-order-and-application',
              status: 'available',
            },
            { id: 'engineering.vite.learn.intermediate.plugin-hooks', status: 'available' },
            {
              id: 'engineering.vite.learn.intermediate.dependency-optimization',
              status: 'available',
            },
            {
              id: 'engineering.vite.learn.intermediate.proxy-and-cross-origin',
              status: 'available',
            },
            {
              id: 'engineering.vite.learn.intermediate.glob-and-generated-modules',
              status: 'available',
            },
            {
              id: 'engineering.vite.learn.intermediate.worker-base-and-multi-env',
              status: 'available',
            },
          ],
        },
      ],
    },
    {
      id: 'advanced',
      title: '高级课程',
      summary: '验证生产构建、库交付、SSR、后端集成、性能、安全和迁移。',
      categories: [
        {
          id: 'production-and-delivery',
          title: '生产构建与交付',
          summary: '以产物和服务证据解释构建边界，不把开发服务器等同于生产部署。',
          topics: ['build', 'chunk', 'Library Mode', 'preview', 'SSR', '后端集成', '安全'],
          entries: [
            {
              id: 'engineering.vite.learn.advanced.build-output-and-chunks',
              status: 'available',
            },
            {
              id: 'engineering.vite.learn.advanced.rollup-rolldown-and-manual-chunks',
              status: 'available',
            },
            {
              id: 'engineering.vite.learn.advanced.library-mode-and-types',
              status: 'available',
            },
            {
              id: 'engineering.vite.learn.advanced.preview-deployment-paths',
              status: 'available',
            },
            {
              id: 'engineering.vite.learn.advanced.ssr-dev-build-hydration',
              status: 'available',
            },
            {
              id: 'engineering.vite.learn.advanced.backend-integration-and-delivery',
              status: 'available',
            },
            {
              id: 'engineering.vite.learn.advanced.performance-source-maps',
              status: 'available',
            },
            {
              id: 'engineering.vite.learn.advanced.security-and-migration',
              status: 'available',
            },
          ],
        },
      ],
    },
  ],
}
