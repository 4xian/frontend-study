/**
 * 课程：状态与 Action 订阅
 * 查证日期：2026-08-05
 * 适用版本：Pinia 4.0.2
 * 查证来源：Pinia 官方文档与固定 commit 源码和测试
 */
import { defineLesson, defineLessonMeta } from '@/content/schema'

const stateId = 'vue.pinia.learn.basics.state-patch-reset'
const actionsId = 'vue.pinia.learn.basics.actions-async'
const compositionId = 'vue.pinia.learn.intermediate.store-composition'
const modelingId = 'vue.pinia.learn.intermediate.store-modeling'

const prerequisites = [
  'vue.pinia.learn.basics.setup-first-store',
  stateId,
  'vue.pinia.learn.basics.getters',
  actionsId,
  'vue.pinia.learn.basics.component-store-to-refs',
  'vue.pinia.learn.intermediate.setup-stores',
  compositionId,
  modelingId,
]

export const meta = defineLessonMeta({
  id: 'vue.pinia.learn.intermediate.subscriptions-actions',
  type: 'lesson',
  title: '状态与 Action 订阅',
  summary: '观察 mutation 与 action 结算，并正确管理 flush、scope、detached 和 stop',
  ecosystem: 'vue',
  module: 'pinia',
  collection: 'intermediate',
  level: 'intermediate',
  prerequisites,
  related: [stateId, actionsId, 'vue.pinia.reference.observation.subscriptions'],
  tags: ['Pinia', '$subscribe', '$onAction', 'flush', 'detached', 'unsubscribe'],
  sources: [
    {
      title: 'Pinia：State subscriptions',
      url: 'https://pinia.vuejs.org/core-concepts/state.html#subscribing-to-the-state',
    },
    {
      title: 'Pinia：Action subscriptions',
      url: 'https://pinia.vuejs.org/core-concepts/actions.html#subscribing-to-actions',
    },
    {
      title: 'Vue：Callback Flush Timing',
      url: 'https://vuejs.org/guide/essentials/watchers.html#callback-flush-timing',
    },
    {
      title: 'Pinia 4.0.2 store.ts',
      url: 'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts',
    },
    {
      title: 'Pinia 4.0.2 subscriptions.ts',
      url: 'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/subscriptions.ts',
    },
    {
      title: 'Pinia 4.0.2 subscriptions.spec.ts',
      url: 'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/subscriptions.spec.ts',
    },
    {
      title: 'Pinia 4.0.2 onAction.spec.ts',
      url: 'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/onAction.spec.ts',
    },
  ],
  appliesTo: 'Pinia 4.0.2',
  verifiedAt: '2026-08-05',
  estimatedMinutes: 55,
})

export default defineLesson({
  meta,
  objectives: [
    '区分 direct、patch object 与 patch function mutation',
    '理解 $subscribe 的 pre/sync/post 与 patch 聚合特例',
    '使用 $onAction 的 before、after、onError 观察结算',
    '管理 scoped、detached 与显式 stop 的生命周期',
  ],
  blocks: [
    {
      type: 'tip',
      style: 'info',
      content: '前置：请先完成 L01-L08，并理解 direct/patch、同步/异步 action 与组件 scope。',
    },
    { type: 'heading', content: '选择要观察的语义层' },
    {
      type: 'text',
      content:
        '`$subscribe()` 观察 state mutation，适合持久化适配和状态审计；`$onAction()` 观察 action 意图、参数和结算，适合 tracing 与指标。二者都是观察边界，不应替代显式业务 action 或变成 Store 间消息总线。',
    },
    {
      type: 'table',
      headers: ['mutation type', 'payload', '通知特点'],
      rows: [
        ['direct', '无', '按 watch flush 调度'],
        ['patch object', '传入的 patch object', '同步聚合一次'],
        ['patch function', '无', '同步聚合一次'],
      ],
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`events` 是 DEV-only 调试字段，不是稳定的生产审计协议。业务代码只依赖公开的 type、storeId 和 patch object payload。',
    },
    { type: 'heading', content: 'flush 与 patch 特例' },
    {
      type: 'text',
      content:
        '`$subscribe()` 把选项交给 Vue `watch()`，默认沿用 `pre`，也可选择 `sync` 或 `post`。固定 4.0.2 的 `$patch()` 会暂停普通 watcher 通知，再手动同步聚合触发一次，因此 patch 通知不会被 `post` 延后；逐次观察 direct mutation 时才需要按 flush 选择时机。',
    },
    { type: 'heading', content: 'Action 的开始、成功与失败' },
    {
      type: 'code',
      lang: 'ts',
      content: `const stop = store.$onAction(({ name, args, after, onError }) => {
  console.log('before', name, args)
  after((result) => console.log('after', result))
  onError((error) => console.error('onError', error))
}, true)

stop()`,
    },
    {
      type: 'text',
      content:
        '`after` 会等待 Promise resolve 并收到 resolved value；`onError` 覆盖同步 throw 与 Promise reject，但错误仍继续传播给调用方。固定 4.0.2 有一处陈旧 JSDoc 声称返回 false 可阻止传播，类型、实现和测试都不支持，本课不采用该说法。',
    },
    { type: 'heading', content: '订阅生命周期实验' },
    {
      type: 'demo',
      id: 'vue.pinia.learn.intermediate.subscriptions-actions.pinia-subscription-lifecycle-lab-demo',
      description: '比较 mutation、flush、action hook，以及 mini-app 卸载前后的订阅计数',
      playground: true,
    },
    { type: 'heading', content: '练习与观察' },
    {
      type: 'steps',
      items: [
        {
          title: '1. 比较三种 mutation',
          content: '核对 type，并确认只有 patch object 有 payload。',
        },
        { title: '2. 观察 flush', content: '比较 direct 同步快照与 patch 的同步聚合计数。' },
        {
          title: '3. 结算异步 action',
          content: '在 Gate 前确认没有 after，再分别 resolve 或 reject。',
        },
        {
          title: '4. 卸载与 stop',
          content: '先卸载 scoped listener，再显式停止 detached listener。',
        },
      ],
    },
    { type: 'heading', content: '源码与测试推导' },
    {
      type: 'steps',
      items: [
        {
          title: '1. mutation 是判别联合',
          content: '固定 types.ts 只让 patch object 分支拥有 payload，适合 TypeScript narrowing。',
        },
        {
          title: '2. patch 手动聚合通知',
          content:
            'store.ts 暂停 watcher 后同步触发 subscriptions，所以一个 patch 只产生一次通知。',
        },
        {
          title: '3. direct 沿用 watch flush',
          content:
            '$subscribe 传递 WatchOptions；默认值来自 Vue watch 的 pre，不由 Pinia 改成 post。',
        },
        {
          title: '4. scope cleanup 来自 onScopeDispose',
          content: 'subscriptions.ts 让默认 listener 随当前 scope 清理，detached 只跳过自动登记。',
        },
        {
          title: '5. action wrapper 在本体前触发',
          content: 'after/onError 分别挂到同步返回或 Promise 的结算分支，不是拦截器。',
        },
        {
          title: '6. 错误继续传播',
          content: '固定实现会 rethrow 或重新 reject，调用方仍必须 catch。',
        },
        {
          title: '7. 两类 API 都返回 stop',
          content: 'detached 只改变 scope 归属，不免除所有者的显式清理责任。',
        },
        {
          title: '8. dispose 不是 reset',
          content:
            'store.$dispose() 停 scope 与订阅但保留 root state；Demo 总清理使用 disposePinia。',
        },
      ],
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '依赖 DEV-only events',
          description: 'events 只服务响应式调试。',
          consequence: '生产环境审计字段缺失。',
          wrong: { lang: 'ts', content: `save(mutation.events)` },
          correct: {
            lang: 'ts',
            content: `save({ type: mutation.type, storeId: mutation.storeId })`,
          },
        },
        {
          title: '认为 direct mutation 不存在',
          description: '直接修改 state 是公开用法。',
          consequence: '订阅处理遗漏合法事件。',
          wrong: { lang: 'ts', content: `if (type !== 'patch object') return` },
          correct: { lang: 'ts', content: `switch (mutation.type) { /* 三个公开分支 */ }` },
        },
        {
          title: '读取 patch function payload',
          description: '只有 patch object 有 payload。',
          consequence: '运行时得到不存在的字段。',
          wrong: { lang: 'ts', content: `mutation.payload.count` },
          correct: {
            lang: 'ts',
            content: `if (mutation.type === 'patch object') mutation.payload`,
          },
        },
        {
          title: '把默认 flush 写成 post',
          description: 'Pinia 沿用 Vue watch 默认 pre。',
          consequence: '对 DOM 更新时机形成错误假设。',
          wrong: { lang: 'ts', content: `// $subscribe 默认 post` },
          correct: { lang: 'ts', content: `store.$subscribe(callback, { flush: 'post' })` },
        },
        {
          title: '认为 post 会延迟 patch',
          description: 'patch 使用同步手动聚合通知。',
          consequence: '同 tick 持久化顺序判断错误。',
          wrong: { lang: 'ts', content: `store.$patch(data) // 假定回调稍后执行` },
          correct: { lang: 'ts', content: `store.$patch(data) // patch 回调同步聚合一次` },
        },
        {
          title: '把 detached 当成自动清理',
          description: 'detached 只脱离当前组件 scope。',
          consequence: '长期 listener 在页面离开后继续执行。',
          wrong: { lang: 'ts', content: `store.$subscribe(save, { detached: true })` },
          correct: {
            lang: 'ts',
            content: `const stop = store.$subscribe(save, { detached: true })`,
          },
        },
        {
          title: '给 $onAction 传 options object',
          description: '它的 detached 是第二个布尔参数。',
          consequence: '订阅没有按预期脱离 scope。',
          wrong: { lang: 'ts', content: `store.$onAction(listener, { detached: true })` },
          correct: { lang: 'ts', content: `store.$onAction(listener, true)` },
        },
        {
          title: '认为 async after 立即运行',
          description: 'after 等待 Promise resolve。',
          consequence: '指标把 pending 误记成完成。',
          wrong: { lang: 'ts', content: `after(() => markDoneImmediately())` },
          correct: { lang: 'ts', content: `after((result) => markSettled(result))` },
        },
        {
          title: '让 onError 吞掉错误',
          description: '固定实现仍会 throw/reject。',
          consequence: '调用方产生未处理 rejection。',
          wrong: { lang: 'ts', content: `onError(() => false)` },
          correct: {
            lang: 'ts',
            content: `try { await store.save() } catch (error) { handle(error) }`,
          },
        },
        {
          title: '用订阅互相驱动业务',
          description: '观察边界不应隐藏业务控制流。',
          consequence: '两个 Store 形成难以终止的反馈环。',
          wrong: { lang: 'ts', content: `a.$subscribe(() => b.$patch(data))` },
          correct: { lang: 'ts', content: `await workflow.applyChange()` },
        },
      ],
    },
  ],
  recap: [
    '$subscribe 观察三类 mutation，payload 只属于 patch object。',
    'direct 使用 watch flush，patch 则同步聚合通知一次。',
    '$onAction 的 after/onError 不改变调用方结算责任。',
    'scoped 自动清理，detached 必须保存并调用 stop。',
  ],
})
