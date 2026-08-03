import type { TrackManifest } from '../types'

export const vuePiniaTrackManifest: TrackManifest = {
  purpose: 'learn',
  ecosystem: 'vue',
  module: 'pinia',
  collections: [
    {
      id: 'basics',
      title: '基础课程',
      summary: '建立 Pinia Store 的状态、派生值与动作基础。',
      categories: [
        {
          id: 'store-foundations',
          title: 'Store 基础',
          summary: '创建 Store，并组织 State、Getters 与 Actions。',
          topics: ['Store 配置', 'State', 'Getters', 'Actions'],
          entries: [
            {
              id: 'vue.pinia.learn.basics.setup-first-store',
              title: '建立第一个 Store',
              summary: '完成 Pinia 安装并创建首个 Store。',
              status: 'planned',
            },
            {
              id: 'vue.pinia.learn.basics.state-patch-reset',
              title: 'State、Patch 与 Reset',
              summary: '读取和修改状态，并掌握批量更新与重置。',
              status: 'planned',
            },
            {
              id: 'vue.pinia.learn.basics.getters',
              title: 'Getters',
              summary: '声明由 Store 状态派生的可复用值。',
              status: 'planned',
            },
            {
              id: 'vue.pinia.learn.basics.actions-async',
              title: 'Actions 与异步流程',
              summary: '用 Actions 封装同步和异步业务操作。',
              status: 'planned',
            },
          ],
        },
        {
          id: 'component-integration',
          title: '组件接入',
          summary: '在组件中安全地读取 Store 状态和方法。',
          topics: ['组件使用', 'storeToRefs'],
          entries: [
            {
              id: 'vue.pinia.learn.basics.component-store-to-refs',
              title: '组件接入与 storeToRefs',
              summary: '在组件中保持 Store 状态解构后的响应性。',
              status: 'planned',
            },
          ],
        },
      ],
    },
    {
      id: 'intermediate',
      title: '中级课程',
      summary: '组合多个 Store 并把状态模型接入应用边界。',
      categories: [
        {
          id: 'setup-and-store-composition',
          title: 'Setup Store 与组合',
          summary: '使用组合式写法设计和组合职责清晰的 Store。',
          topics: ['Setup Store', 'Store 组合', '状态建模'],
          entries: [
            {
              id: 'vue.pinia.learn.intermediate.setup-stores',
              title: 'Setup Store',
              summary: '使用组合式 API 定义 Store 的状态与行为。',
              status: 'planned',
            },
            {
              id: 'vue.pinia.learn.intermediate.store-composition',
              title: 'Store 组合',
              summary: '在多个 Store 之间建立清晰的依赖关系。',
              status: 'planned',
            },
            {
              id: 'vue.pinia.learn.intermediate.store-modeling',
              title: 'Store 建模',
              summary: '按业务职责划分 Store 的状态和操作边界。',
              status: 'planned',
            },
          ],
        },
        {
          id: 'observation-and-app-integration',
          title: '订阅与应用接入',
          summary: '观察 Store 变化，并在组件外安全使用 Store。',
          topics: ['状态订阅', 'Action 订阅', '组件外使用', '路由集成'],
          entries: [
            {
              id: 'vue.pinia.learn.intermediate.subscriptions-actions',
              title: '状态与 Action 订阅',
              summary: '订阅状态变更和 Action 执行过程。',
              status: 'planned',
            },
            {
              id: 'vue.pinia.learn.intermediate.outside-components-router',
              title: '组件外使用与路由集成',
              summary: '在路由等组件外场景中正确取得 Store。',
              status: 'planned',
            },
          ],
        },
      ],
    },
    {
      id: 'advanced',
      title: '高级课程',
      summary: '扩展、测试并维护生产环境中的 Store。',
      categories: [
        {
          id: 'extensions-and-persistence',
          title: '插件与持久化',
          summary: '通过插件扩展 Store，并划清本地持久化边界。',
          topics: ['Pinia 插件', '状态持久化'],
          entries: [
            {
              id: 'vue.pinia.learn.advanced.plugins-persistence',
              title: '插件与持久化边界',
              summary: '扩展 Store 能力并明确持久化策略的责任边界。',
              status: 'planned',
            },
          ],
        },
        {
          id: 'testing-and-runtime',
          title: '测试与运行时维护',
          summary: '验证 Store，并处理 SSR、水合和开发期更新。',
          topics: ['Store 测试', 'SSR', 'Hydration', 'HMR', 'Devtools'],
          entries: [
            {
              id: 'vue.pinia.learn.advanced.store-testing',
              title: 'Store 测试',
              summary: '隔离并验证 Store 的状态和业务行为。',
              status: 'planned',
            },
            {
              id: 'vue.pinia.learn.advanced.ssr-hydration',
              title: 'SSR 与 Hydration',
              summary: '在服务端渲染中隔离状态并安全完成水合。',
              status: 'planned',
            },
            {
              id: 'vue.pinia.learn.advanced.hmr-devtools-maintenance',
              title: 'HMR、Devtools 与维护',
              summary: '使用开发工具和热更新维护复杂 Store。',
              status: 'planned',
            },
          ],
        },
      ],
    },
  ],
}
