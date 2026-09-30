import type { LearningTrackManifest } from '@/common/catalog/types'

export const reactZustandTrackManifest: LearningTrackManifest = {
  stages: [
    {
      id: 'basics',
      title: '基础课程',
      summary: '从客户端状态边界开始，逐步建立 React 绑定 Store 的基础使用模型。',
      categories: [
        {
          id: 'client-state-foundations',
          title: '客户端状态基础',
          summary: '先明确状态所有权和共享范围，再创建第一份 Zustand 客户端 Store。',
          topics: [
            '客户端状态',
            '状态所有权',
            '单一事实来源',
            'Zustand',
            'create',
            'Store',
            '初始状态',
          ],
          entries: [
            {
              id: 'react.zustand.learn.basics.client-state-and-zustand',
              status: 'available',
            },
            {
              id: 'react.zustand.learn.basics.first-store',
              status: 'available',
            },
            {
              id: 'react.zustand.learn.basics.state-and-actions',
              status: 'available',
            },
            {
              id: 'react.zustand.learn.basics.set-state-updates',
              status: 'available',
            },
            {
              id: 'react.zustand.learn.basics.get-current-state',
              status: 'available',
            },
            {
              id: 'react.zustand.learn.basics.component-subscription',
              status: 'available',
            },
            {
              id: 'react.zustand.learn.basics.selector',
              status: 'available',
            },
            {
              id: 'react.zustand.learn.basics.object-and-array-updates',
              status: 'available',
            },
            {
              id: 'react.zustand.learn.basics.typescript-store',
              status: 'available',
            },
            {
              id: 'react.zustand.learn.basics.state-ownership',
              status: 'available',
            },
            {
              id: 'react.zustand.learn.basics.task-filter',
              status: 'available',
            },
            {
              id: 'react.zustand.learn.basics.shopping-cart',
              status: 'available',
            },
          ],
        },
      ],
    },
    {
      id: 'intermediate',
      title: '中级课程',
      summary: '围绕 Selector、异步 Action、中间件和模块组织建立可维护的客户端状态层。',
      categories: [
        {
          id: 'selector-precision',
          title: '选择精度',
          summary: '在默认严格相等下一次选择一个已有字段，控制组件的订阅范围。',
          topics: ['原子 Selector', '结果稳定性', 'useShallow', '浅比较'],
          entries: [
            {
              id: 'react.zustand.learn.intermediate.atomic-selector',
              status: 'available',
            },
            {
              id: 'react.zustand.learn.intermediate.selector-result-stability',
              status: 'available',
            },
            {
              id: 'react.zustand.learn.intermediate.use-shallow',
              status: 'available',
            },
          ],
        },
        {
          id: 'derived-and-async',
          title: '派生与更新',
          summary: '用选择函数从已有字段算出展示值，并用异步写入和重置回到初始快照。',
          topics: ['派生状态', '异步 Action', '状态重置'],
          entries: [
            {
              id: 'react.zustand.learn.intermediate.derived-state',
              status: 'available',
            },
            {
              id: 'react.zustand.learn.intermediate.async-action',
              status: 'available',
            },
            {
              id: 'react.zustand.learn.intermediate.state-reset',
              status: 'available',
            },
          ],
        },
        {
          id: 'client-persistence',
          title: '客户端持久化',
          summary: '把需要跨刷新保留的客户端字段写入存储，并用 partialize 限制写入范围。',
          topics: ['persist', 'partialize', 'createJSONStorage'],
          entries: [
            {
              id: 'react.zustand.learn.intermediate.persist',
              status: 'available',
            },
          ],
        },
        {
          id: 'client-debugging',
          title: '客户端调试',
          summary: '用 devtools 把每次 set 接到 Redux DevTools，并用第三参数给写入命名。',
          topics: ['devtools', 'action type', 'anonymousActionType'],
          entries: [
            {
              id: 'react.zustand.learn.intermediate.devtools',
              status: 'available',
            },
          ],
        },
        {
          id: 'client-subscription',
          title: '客户端订阅',
          summary: '用 subscribe 在组件渲染之外同步收到整份 state 变化，并在不再需要时取消。',
          topics: ['subscribe', 'listener', 'unsubscribe'],
          entries: [
            {
              id: 'react.zustand.learn.intermediate.subscribe',
              status: 'available',
            },
          ],
        },
        {
          id: 'client-slices',
          title: '客户端模块组织',
          summary: '把一份 Store 拆成多个 slice 函数，再展开合并成同一份 React 绑定 Store。',
          topics: ['Slices Pattern', 'StateCreator', 'slice'],
          entries: [
            {
              id: 'react.zustand.learn.intermediate.slices-pattern',
              status: 'available',
            },
          ],
        },
        {
          id: 'client-preferences',
          title: '客户端偏好实战',
          summary: '把主题、草稿和共享命令收进一份切片 Store，只把主题写入存储。',
          topics: ['偏好设置', 'persist', 'slice', '重置'],
          entries: [
            {
              id: 'react.zustand.learn.intermediate.preferences-center',
              status: 'available',
            },
          ],
        },
        {
          id: 'client-workspace',
          title: '客户端内容实战',
          summary: '把目录、加载和筛选收进一份切片 Store，异步写入后再不可变更新条目。',
          topics: ['内容管理', 'slice', '异步 Action', 'subscribe'],
          entries: [
            {
              id: 'react.zustand.learn.intermediate.content-workspace',
              status: 'available',
            },
          ],
        },
      ],
    },
    {
      id: 'advanced',
      title: '高级课程',
      summary: '处理 Vanilla Store、作用域、多实例、测试及 SSR 与 Hydration 边界。',
      categories: [
        {
          id: 'client-vanilla',
          title: '客户端 Vanilla Store',
          summary: '用 createStore 得到不带 Hook 的 StoreApi，需要渲染时再交给 useStore。',
          topics: ['Vanilla Store', 'createStore', 'useStore', 'StoreApi'],
          entries: [
            {
              id: 'react.zustand.learn.advanced.vanilla-store',
              status: 'available',
            },
          ],
        },
        {
          id: 'client-context',
          title: '客户端 Context 作用域',
          summary: '用 React Context 注入 StoreApi，子树再用 useStore 订阅字段。',
          topics: ['Context', 'Provider', 'useContext', 'useStore'],
          entries: [
            {
              id: 'react.zustand.learn.advanced.context-scope',
              status: 'available',
            },
          ],
        },
        {
          id: 'client-store-factory',
          title: '客户端 Store Factory',
          summary: '把 createStore 收成创建函数，每次调用得到一份独立 StoreApi。',
          topics: ['Store Factory', 'createStore', '多实例', 'useState'],
          entries: [
            {
              id: 'react.zustand.learn.advanced.store-factory',
              status: 'available',
            },
          ],
        },
        {
          id: 'client-advanced-typescript',
          title: '客户端高级 TypeScript',
          summary: '说明 create 的泛型为何要柯里化，以及 combine、ExtractState 如何配合类型。',
          topics: ['TypeScript', 'combine', 'ExtractState', '柯里化'],
          entries: [
            {
              id: 'react.zustand.learn.advanced.advanced-typescript',
              status: 'available',
            },
          ],
        },
        {
          id: 'client-subscribe-with-selector',
          title: '客户端 subscribeWithSelector',
          summary: '给 subscribe 加上选择函数，只在选中切片变化时通知外部 listener。',
          topics: ['subscribeWithSelector', 'equalityFn', 'fireImmediately', 'subscribe'],
          entries: [
            {
              id: 'react.zustand.learn.advanced.subscribe-with-selector',
              status: 'available',
            },
          ],
        },
        {
          id: 'client-middleware-composition',
          title: '客户端中间件组合',
          summary:
            '把 persist、subscribeWithSelector 和 devtools 立刻嵌套进 create，devtools 放最外层。',
          topics: ['中间件组合', 'devtools', 'persist', 'subscribeWithSelector'],
          entries: [
            {
              id: 'react.zustand.learn.advanced.middleware-composition',
              status: 'available',
            },
          ],
        },
        {
          id: 'client-immer-middleware',
          title: '客户端 Immer Middleware',
          summary: '用 immer 中间件在 set 的函数参数里改草稿，由 produce 产出新的不可变状态。',
          topics: ['immer', 'produce', '草稿', '不可变更新'],
          entries: [
            {
              id: 'react.zustand.learn.advanced.immer-middleware',
              status: 'available',
            },
          ],
        },
        {
          id: 'client-persist-version-migration',
          title: '客户端持久化版本迁移',
          summary: '给 persist 写出版本号，并在存储形状变化时用 migrate 把旧数据改成当前字段。',
          topics: ['persist', 'version', 'migrate', '水合'],
          entries: [
            {
              id: 'react.zustand.learn.advanced.persist-version-migration',
              status: 'available',
            },
          ],
        },
        {
          id: 'client-zustand-testing',
          title: '客户端 Zustand 测试',
          summary:
            '用 getState 断言 Store，组件交互走 Testing Library，用例之间用 getInitialState 整份替换重置。',
          topics: ['测试', 'getState', 'getInitialState', 'createStore'],
          entries: [
            {
              id: 'react.zustand.learn.advanced.zustand-testing',
              status: 'available',
            },
          ],
        },
        {
          id: 'client-ssr-and-hydration',
          title: '客户端 SSR 与 Hydration',
          summary:
            '服务端和首次客户端渲染必须产出同一份界面，persist 用 skipHydration 把读存储推迟到挂载之后。',
          topics: ['SSR', 'Hydration', 'skipHydration', 'rehydrate'],
          entries: [
            {
              id: 'react.zustand.learn.advanced.ssr-and-hydration',
              status: 'available',
            },
          ],
        },
        {
          id: 'client-multi-instance-editor',
          title: '客户端多实例编辑器',
          summary:
            '用创建函数为每份文稿造独立 StoreApi，切片只合并进当前实例，重置和派生都留在这一份里。',
          topics: ['多实例', 'Store Factory', 'Slices Pattern', '重置'],
          entries: [
            {
              id: 'react.zustand.learn.advanced.multi-instance-editor',
              status: 'available',
            },
          ],
        },
        {
          id: 'client-state-platform',
          title: '客户端状态平台',
          summary:
            '用一份全局 Store 收齐切片、persist、版本迁移和中间件组合，只把跨刷新字段写入存储。',
          topics: ['切片', 'persist', 'migrate', '中间件'],
          entries: [
            {
              id: 'react.zustand.learn.advanced.client-state-platform',
              status: 'available',
            },
          ],
        },
      ],
    },
  ],
}
