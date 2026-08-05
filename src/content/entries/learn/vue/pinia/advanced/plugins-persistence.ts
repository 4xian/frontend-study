/**
 * 课程：插件与持久化边界
 * 查证日期：2026-08-05
 * 适用版本：Pinia 4.0.2
 * 查证来源：Pinia 官方文档、固定 commit 源码与 Web Platform 官方资料
 */
import { defineLesson, defineLessonMeta } from '@/content/schema'

const stateId = 'vue.pinia.learn.basics.state-patch-reset'
const subscriptionsId = 'vue.pinia.learn.intermediate.subscriptions-actions'

const prerequisites = [
  'vue.pinia.learn.basics.setup-first-store',
  stateId,
  'vue.pinia.learn.basics.getters',
  'vue.pinia.learn.basics.actions-async',
  'vue.pinia.learn.basics.component-store-to-refs',
  'vue.pinia.learn.intermediate.setup-stores',
  'vue.pinia.learn.intermediate.store-composition',
  'vue.pinia.learn.intermediate.store-modeling',
  subscriptionsId,
  'vue.pinia.learn.intermediate.outside-components-router',
]

export const meta = defineLessonMeta({
  id: 'vue.pinia.learn.advanced.plugins-persistence',
  type: 'lesson',
  title: '插件与持久化边界',
  summary: '理解 plugin 创建时序，并实现版本化、白名单且可清理的显示偏好持久化',
  ecosystem: 'vue',
  module: 'pinia',
  collection: 'advanced',
  level: 'advanced',
  prerequisites,
  related: [stateId, subscriptionsId, 'vue.pinia.reference.plugins.plugin-contracts'],
  tags: ['Pinia', 'plugin', 'pinia.use', 'localStorage', 'schema', 'storage event'],
  sources: [
    {
      title: 'Pinia：Plugins',
      url: 'https://pinia.vuejs.org/core-concepts/plugins.html',
    },
    {
      title: 'Pinia：PiniaPluginContext',
      url: 'https://pinia.vuejs.org/api/pinia/interfaces/PiniaPluginContext.html',
    },
    {
      title: 'Pinia 4.0.2 createPinia.ts',
      url: 'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/createPinia.ts',
    },
    {
      title: 'Pinia 4.0.2 store.ts',
      url: 'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts',
    },
    {
      title: 'Pinia 4.0.2 storePlugins.spec.ts',
      url: 'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/storePlugins.spec.ts',
    },
    {
      title: 'MDN：Window localStorage',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage',
    },
    {
      title: 'MDN：Window storage event',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event',
    },
    {
      title: 'OWASP：HTML5 Security Cheat Sheet / Local Storage',
      url: 'https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#local-storage',
    },
  ],
  appliesTo: 'Pinia 4.0.2',
  verifiedAt: '2026-08-05',
  estimatedMinutes: 65,
})

export default defineLesson({
  meta,
  objectives: [
    '解释 pinia.use、app.use 与首次创建 Store 的准确先后关系',
    '使用 pinia、app、store、options 四个 plugin context 字段',
    '区分 plugin 自定义属性与同时连接 Store/$state 的响应式 state',
    '设计只保存显示偏好的 v1 allowlist envelope',
    '过滤 storage 事件、抑制外部 patch 回写并清理全部资源',
  ],
  blocks: [
    {
      type: 'tip',
      style: 'info',
      content:
        '前置：请先完成 L01-L10，尤其要理解 Pinia 安装、Options/Setup Store、$reset、$subscribe 与组件外显式 Pinia。',
    },
    { type: 'heading', content: 'Plugin 只在创建链中执行' },
    {
      type: 'text',
      content:
        '`pinia.use(plugin)` 注册扩展，但安装前只进入待安装队列；`app.use(pinia)` 把队列并入实际 plugin 列表；真正执行发生在之后首次创建每个 Store 时。已经进入 registry 的 Store 不会被追补，重复 `useStore()` 只返回同一实例。',
    },
    {
      type: 'table',
      headers: ['时点', 'plugin runs', '结论'],
      rows: [
        ['createPinia()', '0', '尚无 app，也没有 Store'],
        ['安装前 pinia.use(plugin)', '0', '仅排队'],
        ['app.use(pinia)', '0', '安装并转移队列，不主动创建 Store'],
        ['首次创建两个 Store', '2', '每个新 Store 执行一次'],
        ['重复取得两个 Store', '仍为 2', 'registry identity 不变'],
      ],
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '不要读取 `_p`、`_s` 或待安装队列来实现业务。它们只帮助解释固定 4.0.2 的时序，不是公开扩展接口。',
    },
    { type: 'heading', content: 'Context、属性与 State 分工' },
    {
      type: 'text',
      content:
        '公开 context 包含 `pinia/app/store/options`。返回的方法、computed、元数据属于 custom properties；需要进入 Devtools state 与 SSR 序列化资格的字段，则先写入 `store.$state`，再用同一个 ref 接到 `store`。已有预置/水合值必须保留。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `pinia.use(({ store, options }) => {
  if (!Object.hasOwn(store.$state, 'pluginState')) {
    store.$state.pluginState = 0
  }
  store.pluginState = toRef(store.$state, 'pluginState')

  return {
    pluginLabel: computed(() => store.$id),
    persistEnabled: Boolean(options.persist),
  }
})`,
    },
    {
      type: 'text',
      content:
        'Store 是 reactive 对象，所以返回的 ref/computed 在属性访问时会解包。外部类实例应使用 `markRaw()` 保持 identity。类型分别通过 `PiniaCustomProperties`、`PiniaCustomStateProperties` 和自定义 define options augmentation 声明，不能用 `any` 掩盖契约。',
    },
    { type: 'heading', content: 'Reset 是插件自己的责任' },
    {
      type: 'text',
      content:
        'Options Store 的默认 `$reset()` 只把 state factory 字段 assign 回当前 state，不会重置 plugin 后加的字段。插件若承诺统一 reset，必须先绑定原方法再包装；Setup Store 没有内建 `$reset()`，应由 Store 自己定义。',
    },
    { type: 'heading', content: '冻结一个最小 v1 持久化协议' },
    {
      type: 'code',
      lang: 'ts',
      content: `type PersistedPreferencesV1 = {
  version: 1
  data: {
    colorMode: 'light' | 'dark'
    compact: boolean
  }
}`,
    },
    {
      type: 'table',
      headers: ['协议项', '本课选择', '明确排除'],
      rows: [
        [
          'key',
          'vue3-study:vue.pinia.learn.advanced.plugins-persistence:v1',
          '不读写宿主 theme/progress，不调用 clear()',
        ],
        ['字段', '只投影 colorMode/compact', '不序列化完整 $state'],
        ['解码', 'JSON.parse 后按 unknown 校验', '不直接 assign 不可信对象'],
        ['版本', '只接受 version=1', '不伪造迁移框架'],
        ['失败', '保留内存操作并显示状态', '不因存储失败阻断 UI'],
        ['安全', '只保存非敏感显示偏好', '不保存 token/session/凭据'],
      ],
    },
    {
      type: 'text',
      content:
        '初始化时先读取、解码并恢复，再注册 `$subscribe()`。固定 4.0.2 在 plugin loop 之后才激活普通 Store subscriptions，因此初始化 patch 不应被当作一次用户 mutation。',
    },
    { type: 'heading', content: 'Storage 事件与清理' },
    {
      type: 'steps',
      items: [
        {
          title: '1. 过滤事件',
          content: '同时核对 storageArea、唯一 key、newValue、version 和 schema。',
        },
        {
          title: '2. 应用外部值',
          content: '有效 v1 采用最后收到者覆盖；newValue=null 恢复默认偏好。',
        },
        {
          title: '3. 抑制回写',
          content: '外部 patch 期间设置 applyingExternal，订阅看到标记便不写回。',
        },
        {
          title: '4. 清理所有权',
          content: '停止订阅、移除 listener、卸载 mini-app、删除节点并 dispose Pinia。',
        },
      ],
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`storage` 不回发给执行 `setItem()` 的当前文档。synthetic StorageEvent 只能验证 listener seam，不能冒充两个同源标签页的真实浏览器证据。',
    },
    { type: 'heading', content: '插件与持久化实验' },
    {
      type: 'demo',
      id: 'vue.pinia.learn.advanced.plugins-persistence.pinia-plugin-persistence-boundary-lab-demo',
      description:
        '观察两个 Store 的 plugin 时序、context、state alias、v1 解码、reset 与 storage listener',
      playground: true,
    },
    { type: 'heading', content: '练习与观察' },
    {
      type: 'steps',
      items: [
        {
          title: '1. 核对四个检查点',
          content: '确认 use/install 都为 0，两个 Store 首次创建后为 2，重复取得仍为 2。',
        },
        {
          title: '2. 检查 envelope',
          content: '修改偏好后确认只出现 version、colorMode 和 compact。',
        },
        {
          title: '3. 比较 reset',
          content: '先增加 plugin state，再比较默认 reset 与包装 reset。',
        },
        {
          title: '4. 输入不可信数据',
          content: '分别重建损坏 JSON、未知版本和错误 schema，确认都回到默认值。',
        },
      ],
    },
    { type: 'heading', content: '源码与测试推导' },
    {
      type: 'steps',
      items: [
        {
          title: '1. 注册队列与实际列表分离',
          content: 'createPinia.ts 的 toBeInstalled/_p 解释安装前 use 为什么不会立即执行。',
        },
        {
          title: '2. Plugin context 来自 Store 创建末段',
          content: 'store.ts 遍历 plugin list，并精确传入 store/app/pinia/options。',
        },
        {
          title: '3. 初始化早于 subscriptions 激活',
          content: 'plugin loop 后才开启 listening，适合先恢复存储再订阅。',
        },
        {
          title: '4. 返回值成为 custom properties',
          content: '固定 DEV 路径记录返回属性，再 assign 到响应式 Store。',
        },
        {
          title: '5. Plugin 每 Store 只创建一次',
          content: 'storePlugins.spec.ts 覆盖两个 Store、重复 useStore 与安装前后注册。',
        },
        {
          title: '6. State alias 保留预置值',
          content: '官方示例先 Object.hasOwn，再用 toRef 连接 $state 与 Store。',
        },
        {
          title: '7. Reset 包装只适用于明确契约',
          content: '官方文档与测试均先 bind 原 $reset；Setup Store 不能套用内建 reset 假设。',
        },
        {
          title: '8. localStorage 是不可信应用边界',
          content: 'MDN/OWASP 要求处理访问失败、按不可信输入校验且不存敏感标识。',
        },
      ],
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '把 pinia.use 当成立即执行',
          description: '安装前调用只把 plugin 放进队列。',
          consequence: '测试断言了从未发生的扩展。',
          wrong: {
            lang: 'ts',
            content: `pinia.use(plugin)
expect(runs).toBe(1)`,
          },
          correct: {
            lang: 'ts',
            content: `pinia.use(plugin)
app.use(pinia)
useStore()
expect(runs).toBe(1)`,
          },
        },
        {
          title: '期待 app.use 主动创建 Store',
          description: '安装只关联 app 并转移队列。',
          consequence: 'plugin run 计数与真实时序不符。',
          wrong: {
            lang: 'ts',
            content: `app.use(pinia)
expect(runs).toBe(1)`,
          },
          correct: {
            lang: 'ts',
            content: `app.use(pinia)
expect(runs).toBe(0)
useStore()`,
          },
        },
        {
          title: '追补已经创建的 Store',
          description: 'plugin 只进入后续 Store 创建链。',
          consequence: '旧 Store 缺少预期字段。',
          wrong: {
            lang: 'ts',
            content: `const store = useStore(pinia)
pinia.use(plugin)`,
          },
          correct: {
            lang: 'ts',
            content: `pinia.use(plugin)
app.use(pinia)
const store = useStore(pinia)`,
          },
        },
        {
          title: '只给 Store 赋 ref',
          description: 'custom property 不自动成为可序列化 state。',
          consequence: 'Devtools state 与 SSR state 缺字段。',
          wrong: { lang: 'ts', content: `store.pluginState = ref(0)` },
          correct: {
            lang: 'ts',
            content: `store.$state.pluginState = 0
store.pluginState = toRef(store.$state, 'pluginState')`,
          },
        },
        {
          title: '默认 reset 会重置 plugin state',
          description: '默认 factory 不知道新增字段。',
          consequence: '界面看似重置，扩展状态仍残留。',
          wrong: { lang: 'ts', content: `store.$reset()` },
          correct: {
            lang: 'ts',
            content: `const reset = store.$reset.bind(store)
return { $reset: () => { reset(); store.pluginState = 0 } }`,
          },
        },
        {
          title: '序列化完整 $state',
          description: '未来字段与 plugin state 会被意外纳入。',
          consequence: 'schema 漂移且扩大数据暴露。',
          wrong: { lang: 'ts', content: `JSON.stringify(store.$state)` },
          correct: {
            lang: 'ts',
            content: `JSON.stringify({
  version: 1,
  data: { colorMode: store.colorMode, compact: store.compact },
})`,
          },
        },
        {
          title: '直接信任 JSON.parse 结果',
          description: 'localStorage 可被同源脚本修改。',
          consequence: '无效枚举或类型进入 Store。',
          wrong: { lang: 'ts', content: `store.$patch(JSON.parse(raw).data)` },
          correct: {
            lang: 'ts',
            content: `const value: unknown = JSON.parse(raw)
if (isPreferencesV1(value)) store.$patch(value.data)`,
          },
        },
        {
          title: '把 localStorage 当安全仓库',
          description: '同源脚本和 XSS 都可读取。',
          consequence: 'token、session 或凭据泄漏。',
          wrong: { lang: 'ts', content: `localStorage.setItem('token', token)` },
          correct: { lang: 'ts', content: `localStorage.setItem(preferenceKey, safePreferences)` },
        },
        {
          title: '认为当前窗口会收到 storage',
          description: '写入窗口不会收到自己的 storage event。',
          consequence: '本地 UI 等待一个不会到来的事件。',
          wrong: {
            lang: 'ts',
            content: `setItem(key, value)
// 等待 storage 更新当前 UI`,
          },
          correct: {
            lang: 'ts',
            content: `store.$patch(next)
setItem(key, encode(next))`,
          },
        },
        {
          title: '外部 patch 立即回写',
          description: '订阅不区分外部应用与本地操作。',
          consequence: '跨标签产生无意义写回或反馈环。',
          wrong: { lang: 'ts', content: `store.$patch(external.data)` },
          correct: {
            lang: 'ts',
            content: `applyingExternal = true
store.$patch(external.data)
applyingExternal = false`,
          },
        },
      ],
    },
  ],
  exercises: [
    '给 decoder 写出 version=1 但 compact 为字符串的反例，并解释为何不能部分接受。',
    '列出卸载时必须释放的订阅、window listener、mini-app 节点和 Pinia effect scope。',
  ],
  recap: [
    'Plugin 在已安装 Pinia 的新 Store 创建链中执行，不追补 registry 旧实例。',
    '进入 state 的扩展字段必须连接 Store 与 $state；默认 reset 不认识 plugin state。',
    '持久化是应用协议：版本、allowlist、校验、安全、冲突与清理都由应用负责。',
    '本课只证明 SPA listener seam；真实跨标签和 SSR/hydration 仍不在 P04 证据内。',
  ],
})
