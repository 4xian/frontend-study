/**
 * 课程：Actions 与异步流程
 * 查证日期：2026-08-04
 * 适用版本：Pinia 4.0.2
 * 查证来源：Pinia 官方 Guide 与固定 commit 测试
 */
import { defineLesson, defineLessonMeta } from '@/content/schema'

const gettersEntryId = 'vue.pinia.learn.basics.getters'

export const meta = defineLessonMeta({
  id: 'vue.pinia.learn.basics.actions-async',
  type: 'lesson',
  title: 'Actions 与异步流程',
  summary: '用 action 封装同步和异步业务命令，并明确返回、失败与订阅回调的结算顺序',
  ecosystem: 'vue',
  module: 'pinia',
  collection: 'basics',
  level: 'beginner',
  prerequisites: [
    'vue.pinia.learn.basics.setup-first-store',
    'vue.pinia.learn.basics.state-patch-reset',
    gettersEntryId,
  ],
  related: [gettersEntryId, 'vue.pinia.reference.stores.store-shape'],
  tags: ['Pinia', 'actions', 'async', '$onAction', 'after', 'onError'],
  sources: [
    { title: 'Pinia：Actions', url: 'https://pinia.vuejs.org/core-concepts/actions.html' },
    {
      title: 'Pinia 4.0.2 actions.spec.ts',
      url: 'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/actions.spec.ts',
    },
    {
      title: 'Pinia 4.0.2 onAction.spec.ts',
      url: 'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/onAction.spec.ts',
    },
  ],
  appliesTo: 'Pinia 4.0.2',
  verifiedAt: '2026-08-04',
  estimatedMinutes: 45,
})

export default defineLesson({
  meta,
  objectives: [
    '用方法语法定义能正确访问 this 的 Options action',
    '让 action 返回业务结果并把失败继续交给调用方',
    '区分同步抛错与 Promise rejection',
    '理解 $onAction 的 after 与 onError 结算时机',
  ],
  blocks: [
    { type: 'heading', content: 'Action 是有名称的业务命令' },
    {
      type: 'text',
      content:
        'Action 可以读取和修改当前 Store，也可以调用其他 action、另一个 Store 或异步服务。与 getter 不同，它适合表达有副作用的业务流程。Action 的参数和返回值保持普通函数语义，调用方应 `await` 并处理失败。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `export const useSessionStore = defineStore('session', {
  state: () => ({ user: null as User | null }),
  actions: {
    /** 登录并返回已确认的用户。 */
    async login(credentials: Credentials): Promise<User> {
      const user = await api.login(credentials)
      this.user = user
      return user
    },
  },
})`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        'Options Store action 使用方法语法，不要写箭头函数。箭头函数没有由 Pinia 绑定的 `this`，无法安全访问当前 Store。',
    },
    { type: 'heading', content: '订阅一次 action 的完整结算' },
    {
      type: 'text',
      content:
        '`$onAction()` 在 action 开始时收到名称与参数。`after()` 对同步返回值立即运行，对 Promise 则等待 resolve；`onError()` 同时覆盖同步 throw 和 Promise reject。监听不会吞掉错误，调用方仍要 catch 或让错误继续传播。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const unsubscribe = store.$onAction(({ name, args, after, onError }) => {
  console.log('start', name, args)
  after((result) => console.log('resolved', result))
  onError((error) => console.error('failed', error))
})`,
    },
    { type: 'heading', content: '用手动 Gate 消除网络随机性' },
    {
      type: 'text',
      content:
        '下面的 Demo 不请求真实网络。异步 action 先停在手动 deferred gate，界面再明确选择 resolve 或 reject；另一按钮触发同步 throw。时间线展示 start、action 内部步骤、after/onError 与调用方结算的确定顺序。',
    },
    {
      type: 'demo',
      id: 'vue.pinia.learn.basics.actions-async.pinia-action-lifecycle-lab-demo',
      description: '手动完成或拒绝异步 action，并对比同步抛错的订阅结算顺序',
      playground: true,
    },
    { type: 'heading', content: '源码与测试推导' },
    {
      type: 'steps',
      items: [
        {
          title: '1. Promise 延迟 after',
          content:
            'Pinia 的 action wrapper 检测返回值是否为 Promise；是 Promise 时在 `then` 中调用 after callbacks 并传入 resolve 值，所以 after 不会在请求仍 pending 时提前运行。',
        },
        {
          title: '2. 两类失败都继续传播',
          content:
            '同步 throw 会先调用 error callbacks 再重新抛出；Promise reject 会在 rejection 分支调用 callbacks 后继续 reject。固定 `onAction.spec.ts` 分别覆盖这两条路径。',
        },
      ],
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '用箭头函数定义 Options action',
          description: '箭头函数捕获词法 this，Pinia 无法把当前 Store 绑定进去。',
          consequence: 'this 不是 Store，state 写入失败或落到错误对象。',
          wrong: { lang: 'ts', content: `increment: () => {\n  this.count++\n}` },
          correct: { lang: 'ts', content: `increment(): void {\n  this.count++\n}` },
        },
        {
          title: '调用异步 action 却不处理 rejection',
          description: 'onError 只观察失败，不会替调用方消费 rejected Promise。',
          consequence: '页面出现未处理 Promise rejection，加载状态也可能无法复位。',
          wrong: { lang: 'ts', content: `store.login(credentials)` },
          correct: {
            lang: 'ts',
            content: `try {\n  await store.login(credentials)\n} catch (error) {\n  showError(error)\n}`,
          },
        },
        {
          title: '认为 after 在 Promise 创建后立即运行',
          description: 'after 对异步 action 等待 Promise resolve，并接收最终值。',
          consequence: '过早停止 loading 或记录成功，实际请求随后仍可能失败。',
          wrong: {
            lang: 'ts',
            content: `store.$onAction(({ after }) => {\n  after(() => loading = false) // 误解为立即执行\n})`,
          },
          correct: {
            lang: 'ts',
            content: `after((result) => {\n  loading = false\n  recordSuccess(result)\n})`,
          },
        },
        {
          title: '在 action 内吞掉所有失败',
          description: '没有恢复策略时 catch 后返回 undefined 会把失败伪装成成功结算。',
          consequence: 'after 收到 undefined，调用方无法区分真实成功与被隐藏的错误。',
          wrong: {
            lang: 'ts',
            content: `try {\n  return await save()\n} catch {\n  return undefined\n}`,
          },
          correct: {
            lang: 'ts',
            content: `try {\n  return await save()\n} catch (error) {\n  this.lastError = toMessage(error)\n  throw error\n}`,
          },
        },
        {
          title: '忽略并发请求的陈旧结果',
          description: '后发请求可能先完成，action 不会自动取消或标记旧 Promise。',
          consequence: '较早请求最后写回，覆盖用户刚取得的新数据。',
          wrong: { lang: 'ts', content: `this.result = await search(query)` },
          correct: {
            lang: 'ts',
            content: `const requestId = ++this.requestId\nconst result = await search(query)\nif (requestId === this.requestId) this.result = result`,
          },
        },
      ],
    },
  ],
  recap: [
    'Action 适合有名称的业务命令，Options action 用方法语法保留 Store this。',
    'after 等待 Promise resolve，onError 覆盖同步 throw 与异步 reject。',
    '监听不会吞掉错误；调用方仍负责 await、catch 与陈旧请求策略。',
  ],
})
