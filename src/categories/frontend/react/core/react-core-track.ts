import type { LearningTrackManifest } from '@/common/catalog/types'

export const reactCoreTrackManifest: LearningTrackManifest = {
  stages: [
    {
      id: 'basics',
      title: '基础课程',
      summary: '从项目搭建开始，按独立知识点学习 TSX、组件、Props、渲染、事件、State、DOM 与表单。',
      categories: [
        {
          id: 'core-knowledge-points',
          title: 'React Core 知识点',
          summary: '每篇课程只讲一个可命名知识点，Demo 可以组合相关知识点进行观察。',
          topics: [
            '项目搭建',
            'TSX',
            'React element',
            'root',
            '组件',
            'Props',
            '渲染',
            '事件',
            'State',
            'DOM',
            '表单',
          ],
          entries: [
            {
              id: 'react.core.learn.basics.vite-react-project-setup',
              status: 'available',
            },
            { id: 'react.core.learn.basics.tsx-markup-syntax', status: 'available' },
            {
              id: 'react.core.learn.basics.tsx-expressions-and-attributes',
              status: 'available',
            },
            {
              id: 'react.core.learn.basics.function-components',
              status: 'available',
            },
            {
              id: 'react.core.learn.basics.module-boundaries-and-component-tree',
              status: 'available',
            },
            {
              id: 'react.core.learn.basics.jsx-runtime-and-react-element',
              status: 'available',
            },
            {
              id: 'react.core.learn.basics.react-root-lifecycle',
              status: 'available',
            },
            {
              id: 'react.core.learn.basics.props',
              status: 'available',
            },
            {
              id: 'react.core.learn.basics.children-and-composition',
              status: 'available',
            },
            {
              id: 'react.core.learn.basics.conditional-rendering',
              status: 'available',
            },
            {
              id: 'react.core.learn.basics.list-rendering-and-key',
              status: 'available',
            },
            {
              id: 'react.core.learn.basics.lab-static-course-catalog',
              status: 'available',
            },
            {
              id: 'react.core.learn.basics.component-purity',
              status: 'available',
            },
            {
              id: 'react.core.learn.basics.event-handling',
              status: 'available',
            },
            {
              id: 'react.core.learn.basics.rules-of-hooks',
              status: 'available',
            },
            {
              id: 'react.core.learn.basics.use-state',
              status: 'available',
            },
            {
              id: 'react.core.learn.basics.render-commit-and-state-snapshot',
              status: 'available',
            },
            {
              id: 'react.core.learn.basics.immutable-state-updates',
              status: 'available',
            },
            {
              id: 'react.core.learn.basics.lab-task-editor',
              status: 'available',
            },
            {
              id: 'react.core.learn.basics.dom-props',
              status: 'available',
            },
            {
              id: 'react.core.learn.basics.use-id-accessible-links',
              status: 'available',
            },
            {
              id: 'react.core.learn.basics.react-forms',
              status: 'available',
            },
            {
              id: 'react.core.learn.basics.state-ownership-and-thinking-in-react',
              status: 'available',
            },
            {
              id: 'react.core.learn.basics.lab-course-registration',
              status: 'available',
            },
          ],
        },
      ],
    },
    {
      id: 'intermediate',
      title: '中级课程',
      summary: '已按单知识点完成状态建模、Context、Ref、Effect 与自定义 Hook。',
      categories: [
        {
          id: 'state-and-escape-hatches',
          title: '状态扩展与逃生舱',
          summary: '已完成状态共享、DOM 接入、外部系统同步与样式插入边界。',
          topics: ['状态建模', 'Reducer', 'Context', 'Ref', 'Effect', '自定义 Hook'],
          entries: [
            {
              id: 'react.core.learn.intermediate.state-structure',
              status: 'available',
            },
            {
              id: 'react.core.learn.intermediate.lifting-state-up',
              status: 'available',
            },
            {
              id: 'react.core.learn.intermediate.state-preservation-and-reset',
              status: 'available',
            },
            {
              id: 'react.core.learn.intermediate.lab-multi-step-editor',
              status: 'available',
            },
            {
              id: 'react.core.learn.intermediate.use-reducer',
              status: 'available',
            },
            {
              id: 'react.core.learn.intermediate.context-providing-and-reading',
              status: 'available',
            },
            {
              id: 'react.core.learn.intermediate.reducer-context-composition',
              status: 'available',
            },
            {
              id: 'react.core.learn.intermediate.state-sharing-boundary',
              status: 'available',
            },
            {
              id: 'react.core.learn.intermediate.lab-shared-task-workspace',
              status: 'available',
            },
            {
              id: 'react.core.learn.intermediate.use-ref',
              status: 'available',
            },
            {
              id: 'react.core.learn.intermediate.dom-refs',
              status: 'available',
            },
            {
              id: 'react.core.learn.intermediate.ref-as-prop',
              status: 'available',
            },
            {
              id: 'react.core.learn.advanced.portal-tree-and-dom-placement',
              status: 'available',
            },
            {
              id: 'react.core.learn.intermediate.lab-accessible-dialog',
              status: 'available',
            },
            {
              id: 'react.core.learn.intermediate.use-effect',
              status: 'available',
            },
            {
              id: 'react.core.learn.intermediate.unnecessary-effects',
              status: 'available',
            },
            {
              id: 'react.core.learn.intermediate.effect-dependencies',
              status: 'available',
            },
            {
              id: 'react.core.learn.intermediate.effect-events',
              status: 'available',
            },
            {
              id: 'react.core.learn.intermediate.custom-hooks',
              status: 'available',
            },
            {
              id: 'react.core.learn.intermediate.strict-mode-development-checks',
              status: 'available',
            },
            {
              id: 'react.core.learn.intermediate.lab-synchronized-chat-room',
              status: 'available',
            },
          ],
        },
      ],
    },
    {
      id: 'advanced',
      title: '高级课程',
      summary: '覆盖性能测量、异步资源、并发 UI、外部系统与宿主边界。',
      categories: [
        {
          id: 'concurrency-resources-and-host-boundaries',
          title: '并发、资源与宿主边界',
          summary: '按问题范围组织性能测量、异步协调、外部资源与宿主能力。',
          topics: [
            '性能测量',
            'Suspense',
            'Transition',
            'Action',
            '外部 Store',
            'Hydration',
            '资源提示',
          ],
          entries: [
            {
              id: 'react.core.learn.advanced.profiler-render-measurement',
              status: 'available',
            },
            {
              id: 'react.core.learn.advanced.use-memo-value-caching',
              status: 'available',
            },
            {
              id: 'react.core.learn.advanced.memo-component-bailout',
              status: 'available',
            },
            {
              id: 'react.core.learn.advanced.use-callback-function-identity',
              status: 'available',
            },
            {
              id: 'react.core.learn.advanced.lab-render-performance',
              status: 'available',
            },
            {
              id: 'react.core.learn.advanced.error-boundary-render-failures',
              status: 'available',
            },
            {
              id: 'react.core.learn.advanced.lazy-component-code-splitting',
              status: 'available',
            },
            {
              id: 'react.core.learn.advanced.suspense-fallback-boundary',
              status: 'available',
            },
            {
              id: 'react.core.learn.advanced.use-resource-reading',
              status: 'available',
            },
            {
              id: 'react.core.learn.advanced.lab-lazy-report-viewer',
              status: 'available',
            },
            {
              id: 'react.core.learn.advanced.use-transition-pending-action',
              status: 'available',
            },
            {
              id: 'react.core.learn.advanced.use-deferred-value-stale-content',
              status: 'available',
            },
            {
              id: 'react.core.learn.advanced.activity-hidden-state-restoration',
              status: 'available',
            },
            {
              id: 'react.core.learn.advanced.lab-concurrent-search-workspace',
              status: 'available',
            },
            {
              id: 'react.core.learn.advanced.form-action-client-submission',
              status: 'available',
            },
            {
              id: 'react.core.learn.advanced.use-action-state-result-queue',
              status: 'available',
            },
            {
              id: 'react.core.learn.advanced.use-optimistic-pending-state',
              status: 'available',
            },
            {
              id: 'react.core.learn.advanced.lab-action-review-queue',
              status: 'available',
            },
            {
              id: 'react.core.learn.advanced.use-sync-external-store-snapshot',
              status: 'available',
            },
            {
              id: 'react.core.learn.intermediate.use-imperative-handle',
              status: 'available',
            },
            {
              id: 'react.core.learn.intermediate.use-layout-effect',
              status: 'available',
            },
            {
              id: 'react.core.learn.advanced.hydrate-root-markup-identity',
              status: 'available',
            },
            {
              id: 'react.core.learn.advanced.flush-sync-dom-commit',
              status: 'available',
            },
            {
              id: 'react.core.learn.advanced.document-metadata-hoisting',
              status: 'available',
            },
            {
              id: 'react.core.learn.advanced.declarative-stylesheet-resources',
              status: 'available',
            },
            {
              id: 'react.core.learn.advanced.declarative-async-script-resource',
              status: 'available',
            },
            {
              id: 'react.core.learn.advanced.resource-hints',
              status: 'available',
            },
            {
              id: 'react.core.learn.intermediate.use-insertion-effect',
              status: 'available',
            },
            {
              id: 'react.core.learn.advanced.lab-embedded-status-panel',
              status: 'available',
            },
          ],
        },
      ],
    },
  ],
}
