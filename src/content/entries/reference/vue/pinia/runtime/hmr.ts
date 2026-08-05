/**
 * Pinia 参考：Vite Store HMR 接入、identity 与证据边界。
 * 结论固定到 pinia@4.0.2 与 commit ae4e3b2。
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

const fixedSourceBase =
  'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia'

export const meta = defineReferenceMeta({
  id: 'vue.pinia.reference.runtime.hmr',
  type: 'reference',
  title: 'Vite Store HMR 接入',
  summary: '查询 acceptHMRUpdate() 的 Vite 接法、Store identity、迁移与证据边界',
  ecosystem: 'vue',
  module: 'pinia',
  collection: 'runtime',
  related: [
    'vue.pinia.reference.stores.define-store',
    'vue.pinia.reference.observation.subscriptions',
    'vue.pinia.reference.runtime.hydration',
    'vue.pinia.learn.advanced.hmr-devtools-maintenance',
    'vue.pinia.learn.intermediate.subscriptions-actions',
  ],
  tags: ['Pinia', 'acceptHMRUpdate', 'Vite', 'HMR', 'StoreDefinition', 'hot update'],
  sources: [
    {
      title: 'Pinia API：acceptHMRUpdate',
      url: 'https://pinia.vuejs.org/api/pinia/functions/acceptHMRUpdate.html',
    },
    {
      title: 'Pinia Guide：Hot Module Replacement',
      url: 'https://pinia.vuejs.org/cookbook/hot-module-replacement.html',
    },
    {
      title: 'Pinia 4.0.2：hmr.ts 固定源码',
      url: `${fixedSourceBase}/src/hmr.ts`,
    },
    {
      title: 'Pinia 4.0.2：store.ts 固定源码',
      url: `${fixedSourceBase}/src/store.ts`,
    },
    {
      title: 'Pinia 4.0.2：HMR 官方测试',
      url: `${fixedSourceBase}/__tests__/hmr.spec.ts`,
    },
    {
      title: 'Pinia Issue #2611：Setup Store HMR runtime-added property',
      url: 'https://github.com/vuejs/pinia/issues/2611',
    },
  ],
  appliesTo: 'Pinia 4.0.2',
  verifiedAt: '2026-08-05',
  anchors: [
    '概述',
    'Accept HMR Update',
    'Vite 接入与 Production 边界',
    'Store Identity 与 Shape 更新',
    '订阅连续性与证据状态',
    '易错使用提示',
    '源码推导与适用场景',
  ],
})

export default defineReference({
  meta,
  signature: `declare function acceptHMRUpdate<
  Id extends string = string,
  S extends StateTree = StateTree,
  G extends _GettersTree<S> = _GettersTree<S>,
  A = _ActionsTree,
>(
  initialUseStore: StoreDefinition<Id, S, G, A>,
  hot: any,
): (newModule: any) => any`,
  blocks: [
    { type: 'heading', content: '概述' },
    {
      type: 'text',
      content:
        '`acceptHMRUpdate()` 把一个 StoreDefinition 接入 Vite hot lifecycle，使开发期编辑 state、getters 或 actions 时尽量保留已经运行的 Store state。它不是 production migration，也不替代持久化 schema upgrade。',
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '签名中的 `_GettersTree` 与 `_ActionsTree` 只是公开函数声明的内部泛型约束。应用只使用 `acceptHMRUpdate()`、`defineStore()` 返回值和 Vite 的 `import.meta.hot`。',
    },
    { type: 'heading', content: 'Accept HMR Update' },
    {
      type: 'text',
      content:
        'helper 接收初始 Store definition 与当前 hot context，返回交给 Vite accept 的 callback。开发期 callback 从 `hot.data.pinia` 或 initial definition 取得 Pinia，把它保存回 `hot.data`，再遍历新模块 exports；只有形如 StoreDefinition 且 registry 已有对应 id 的 export 才会更新。',
    },
    { type: 'heading', content: 'Vite 接入与 Production 边界' },
    {
      type: 'code',
      lang: 'ts',
      content: `import { acceptHMRUpdate, defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCounterStore, import.meta.hot))
}`,
    },
    {
      type: 'text',
      content:
        '官方接法把 guard 放在 Store definition 文件旁。固定 runtime 在 production 直接返回 no-op callback，因此 HMR 不会在正式升级、持久化数据迁移或 SSR 恢复时执行。',
    },
    { type: 'heading', content: 'Store Identity 与 Shape 更新' },
    {
      type: 'text',
      content:
        'Store ID 是 HMR identity，必须保持稳定。固定流程先按新 `$id` 查询 registry，再比较 initial id；改名可能导致更新被跳过，命中特定条件时也可能触发 invalidation，不能概括成“总保留”或“总 reload”。',
    },
    {
      type: 'table',
      headers: ['更新面', '固定测试覆盖', '迁移边界'],
      rows: [
        ['state', '新增、删除、响应性与 shape', '尽量保留既有运行值'],
        ['action', '新增、删除与实现替换', '开发反馈，不是生产版本迁移'],
        ['getter', '新增、删除与依赖更新', '保持 Store proxy 的公开访问方式'],
        [
          'nested state',
          'Options plain object 与 Setup ref object',
          '两条迁移路径不能抽象为同一个普通 deep merge',
        ],
      ],
    },
    {
      type: 'text',
      content:
        'Options Store 的 nested plain object 按新 definition shape 合并同名旧值；Setup Store 的 ref object 保留旧运行值。应用只依赖 Pinia 的公开 HMR helper，不复制 internal migration，也不调用 `_hotUpdate` 或读取 `_s/_pinia`。',
    },
    { type: 'heading', content: '订阅连续性与证据状态' },
    {
      type: 'table',
      headers: ['能力', 'Pinia 4.0.2 官方测试状态', '应用策略'],
      rows: [
        ['$subscribe()', '`it.todo`，跨 HMR 连续性未保证', 'owner 在更新后可重建状态订阅'],
        ['$onAction()', '`it.todo`，跨 HMR 连续性未保证', 'owner 在更新后可重建 Action 订阅'],
      ],
    },
    {
      type: 'text',
      content:
        '成员更新测试通过不能推出两类 observer 会跨更新继续工作。本页未触发真实 Vite file update，也未验证 module graph、file event、accept 或 invalidation；真实 HMR 与订阅连续性证据均为 `Deferred/not-run`。Devtools client 是相邻但不同的能力，普通 DOM 状态、callback unit model 或截图都不能替代它。',
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '只定义 Store 而不注册 accept',
          description: 'Vite 需要模块显式接受 hot update。',
          consequence: '文件更新时 Pinia 没有 accept handler。',
          wrong: { lang: 'ts', content: "export const useStore = defineStore('main', {})" },
          correct: {
            lang: 'ts',
            content:
              'if (import.meta.hot) {\n  import.meta.hot.accept(acceptHMRUpdate(useStore, import.meta.hot))\n}',
          },
        },
        {
          title: '无 guard 访问 import.meta.hot',
          description: 'hot context 只在支持 HMR 的开发环境存在。',
          consequence: '环境与类型边界不清。',
          wrong: {
            lang: 'ts',
            content: 'import.meta.hot.accept(acceptHMRUpdate(useStore, import.meta.hot))',
          },
          correct: {
            lang: 'ts',
            content:
              'if (import.meta.hot) {\n  import.meta.hot.accept(acceptHMRUpdate(useStore, import.meta.hot))\n}',
          },
        },
        {
          title: '把 HMR 当作 production migration',
          description: 'production helper 返回空 callback。',
          consequence: '正式升级时持久化 schema 没有任何迁移执行。',
          wrong: { lang: 'ts', content: 'acceptHMRUpdate(useStore, hot) // 迁移 v1 到 v2' },
          correct: {
            lang: 'ts',
            content: 'const state = migratePersistedState(payload.version, payload)',
          },
        },
        {
          title: '更改 Store ID 并期待保留 state',
          description: 'registry 使用 Store ID 识别 HMR 目标。',
          consequence: '更新可能被跳过或触发 invalidation。',
          wrong: { lang: 'ts', content: "defineStore('renamed-counter', {})" },
          correct: {
            lang: 'ts',
            content: "defineStore('counter', {}) // HMR 期间保持稳定 identity",
          },
        },
        {
          title: '统一复制 nested deep merge',
          description: 'Options plain object 与 Setup ref object 走不同迁移路径。',
          consequence: 'shape 或 runtime-added 属性处理错误。',
          wrong: { lang: 'ts', content: 'deepMerge(oldState, newState)' },
          correct: {
            lang: 'ts',
            content:
              'if (import.meta.hot) {\n  import.meta.hot.accept(acceptHMRUpdate(useStore, import.meta.hot))\n}',
          },
        },
        {
          title: '用成员更新推断订阅连续性',
          description: '官方只固定 state、action 与 getter 的成员更新行为。',
          consequence: '把尚未保证的两类 observer 写成 green。',
          wrong: { lang: 'ts', content: 'expect(actionsUpdated).toBe(true) // 因此订阅仍存在' },
          correct: { lang: 'ts', content: 'const stop = reconnectObserversAfterHotUpdate(store)' },
        },
        {
          title: '直接调用 internal hot surface',
          description: '`_hotUpdate/_s/_pinia` 不是应用稳定接口。',
          consequence: '升级时依赖内部 registry 与 payload 结构。',
          wrong: { lang: 'ts', content: 'store._hotUpdate(payload)' },
          correct: {
            lang: 'ts',
            content:
              'if (import.meta.hot) {\n  import.meta.hot.accept(acceptHMRUpdate(useStore, import.meta.hot))\n}',
          },
        },
        {
          title: '手工调用 callback 证明真实 HMR',
          description: '函数调用没有覆盖 Vite module graph 与 file event。',
          consequence: 'accept 与 invalidation 的 runtime 路径被遗漏。',
          wrong: { lang: 'ts', content: 'acceptHMRUpdate(useStore, fakeHot)(newModule)' },
          correct: { lang: 'ts', content: '// 由真实 Vite 文件更新形成端到端证据' },
        },
      ],
    },
    { type: 'heading', content: '源码推导与适用场景' },
    {
      type: 'steps',
      items: [
        {
          title: '1. Helper 只属于开发期',
          content:
            '固定 `hmr.ts` 在 production 返回空 callback，因此不能把 HMR 当作 production migration。适用于划清正式升级与开发反馈的边界。',
        },
        {
          title: '2. Vite hot lifecycle 才能复用实例',
          content:
            'dev callback 把 Pinia 保存到 `hot.data` 并筛选新模块 Store exports。适用于 definition 文件旁的官方 accept snippet。',
        },
        {
          title: '3. ID 改名结果受 registry 条件影响',
          content:
            'helper 先查 `pinia._s.has(newId)`，再比较 initial id，因此只能冻结“ID 必须稳定”，不能推出无条件 invalidate。适用于 Store 重命名决策。',
        },
        {
          title: '4. Shape 更新保留开发交互上下文',
          content:
            '固定 `store.ts` 的 internal hot update 增删 state、action 与 getter，并尽量保留已有 state。适用于局部开发反馈，不替代数据迁移。',
        },
        {
          title: '5. 两种 Store 不能统一描述为 deep merge',
          content:
            'Options nested plain object 以新 shape 合并旧值，Setup ref object 保留旧运行值。适用于解释 issue #2611 的修复边界。',
        },
        {
          title: '6. Observer 连续性仍未保证',
          content:
            '固定 `hmr.spec.ts` 已覆盖成员更新，却把状态订阅与 Action 订阅连续性留为待办。适用于采用可重建 observer 的保守维护策略。',
        },
        {
          title: '7. Callback model 不是浏览器 HMR green',
          content:
            '官方 Guide 给出 Vite 接法，但本项目没有真实 file-update seam。适用于把 runtime evidence 明确保留为 deferred。',
        },
      ],
    },
  ],
})
