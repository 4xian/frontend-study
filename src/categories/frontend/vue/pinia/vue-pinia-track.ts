import type { LearningTrackManifest } from '@/common/catalog/types'

export const vuePiniaTrackManifest: LearningTrackManifest = {
  stages: [
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
              status: 'available',
            },
            {
              id: 'vue.pinia.learn.basics.state-patch-reset',
              status: 'available',
            },
            {
              id: 'vue.pinia.learn.basics.getters',
              status: 'available',
            },
            {
              id: 'vue.pinia.learn.basics.actions-async',
              status: 'available',
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
              status: 'available',
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
              status: 'available',
            },
            {
              id: 'vue.pinia.learn.intermediate.store-composition',
              status: 'available',
            },
            {
              id: 'vue.pinia.learn.intermediate.store-modeling',
              status: 'available',
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
              status: 'available',
            },
            {
              id: 'vue.pinia.learn.intermediate.outside-components-router',
              status: 'available',
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
              status: 'available',
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
              status: 'available',
            },
            {
              id: 'vue.pinia.learn.advanced.ssr-hydration',
              status: 'available',
            },
            {
              id: 'vue.pinia.learn.advanced.hmr-devtools-maintenance',
              status: 'available',
            },
          ],
        },
      ],
    },
  ],
}
