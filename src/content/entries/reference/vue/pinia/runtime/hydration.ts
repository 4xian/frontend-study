/**
 * Pinia 参考：Setup Store 水合控制与 SSR 恢复边界。
 * 结论固定到 pinia@4.0.2 与 commit ae4e3b2。
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

const fixedSourceBase =
  'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia'

export const meta = defineReferenceMeta({
  id: 'vue.pinia.reference.runtime.hydration',
  type: 'reference',
  title: 'Setup Store 水合控制',
  summary: '查询 skipHydrate() 与 shouldHydrate()，并区分 Setup、Options 与宿主 SSR 边界',
  ecosystem: 'vue',
  module: 'pinia',
  collection: 'runtime',
  related: [
    'vue.pinia.reference.stores.define-store',
    'vue.pinia.reference.runtime.hmr',
    'vue.pinia.learn.advanced.ssr-hydration',
    'vue.pinia.learn.intermediate.outside-components-router',
    'vue.pinia.learn.advanced.plugins-persistence',
  ],
  tags: ['Pinia', 'skipHydrate', 'shouldHydrate', 'Setup Store', 'SSR', 'hydration'],
  sources: [
    {
      title: 'Pinia API：skipHydrate',
      url: 'https://pinia.vuejs.org/api/pinia/functions/skipHydrate.html',
    },
    {
      title: 'Pinia API：shouldHydrate',
      url: 'https://pinia.vuejs.org/api/pinia/functions/shouldHydrate.html',
    },
    {
      title: 'Pinia Guide：SSR',
      url: 'https://pinia.vuejs.org/ssr/',
    },
    {
      title: 'Pinia Guide：Composables / SSR',
      url: 'https://pinia.vuejs.org/cookbook/composables.html#ssr',
    },
    {
      title: 'Pinia 4.0.2：store.ts 固定源码',
      url: `${fixedSourceBase}/src/store.ts`,
    },
    {
      title: 'Pinia 4.0.2：types.ts 固定源码',
      url: `${fixedSourceBase}/src/types.ts`,
    },
    {
      title: 'Pinia 4.0.2：state 官方测试',
      url: `${fixedSourceBase}/__tests__/state.spec.ts`,
    },
    {
      title: 'Pinia 4.0.2：SSR 官方测试',
      url: `${fixedSourceBase}/__tests__/ssr.spec.ts`,
    },
  ],
  appliesTo: 'Pinia 4.0.2',
  verifiedAt: '2026-08-05',
  anchors: [
    '概述',
    'Skip Hydrate',
    'Should Hydrate',
    'Setup Store 顶层水合',
    'Options Store Hydrate',
    'SSR 恢复顺序与安全边界',
    '易错使用提示',
    '源码推导与适用场景',
  ],
})

export default defineReference({
  meta,
  signature: `declare function skipHydrate<T = any>(obj: T): T
declare function shouldHydrate(obj: any): boolean`,
  blocks: [
    { type: 'heading', content: '概述' },
    {
      type: 'text',
      content:
        '`skipHydrate()` 与 `shouldHydrate()` 只控制 Setup Store 顶层返回对象是否接收 initial state。它们不负责生成或解析 SSR payload，也不判断值能否安全序列化，更不处理 Vue 的 DOM hydration。',
    },
    { type: 'heading', content: 'Skip Hydrate' },
    {
      type: 'text',
      content:
        '`skipHydrate(obj)` 在对象上写入不可枚举的 Symbol 标记，并返回同一个对象。公开用途是标记 Setup Store 返回的“有状态但不是真正 store state”的对象，例如 router instance，使它不被服务端 initial state 覆盖。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `export const useAppStore = defineStore('app', () => {
  const router = skipHydrate(useRouter())
  const ready = ref(false)

  return { router, ready }
})`,
    },
    { type: 'heading', content: 'Should Hydrate' },
    {
      type: 'table',
      headers: ['输入', 'shouldHydrate()', '边界'],
      rows: [
        ['带 own skip marker 的对象', '`false`', '跳过顶层 initial state 写入'],
        ['未标记对象', '`true`', '仍由 Setup Store 分支按形态恢复'],
        ['primitive / nullish', '`true`', 'helper 只检查 marker，不检查可序列化性'],
      ],
    },
    {
      type: 'text',
      content:
        '固定测试覆盖标记后的 plain object、Map、Set 与 Array 不水合，而 primitive/nullish 仍应水合。nested marker case 在上游仍是 skipped，因此不能把当前行为扩大成递归保证。',
    },
    { type: 'heading', content: 'Setup Store 顶层水合' },
    {
      type: 'text',
      content:
        'Setup Store 总会执行 setup。存在 initial state 时，Pinia 只对 setup 返回的顶层 ref/reactive property 调用 `shouldHydrate(prop)`：通过后，ref 接收 initial value，reactive object 合并 initial object，随后属性重新接回 Pinia root state。',
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`skipHydrate()` 不删除字段，不阻止字段进入 `pinia.state.value`，也不会自动把字段排除在序列化 payload 外。payload selection 仍由 SSR 宿主负责。',
    },
    { type: 'heading', content: 'Options Store Hydrate' },
    {
      type: 'text',
      content:
        'Options Store 不走 Setup Store 的 `shouldHydrate()` 分支。复杂或 custom ref 的公开补充入口是 `DefineStoreOptions.hydrate(storeState, initialState)` 成员；它不是第三个 Pinia 根入口，也不是普通 Options Store 都必须实现的 hook。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `export const usePreferencesStore = defineStore('preferences', {
  state: () => ({ theme: useLocalStorage('theme', 'system') }),
  hydrate(storeState, initialState) {
    storeState.theme = useLocalStorage('theme', initialState.theme)
  },
})`,
    },
    { type: 'heading', content: 'SSR 恢复顺序与安全边界' },
    {
      type: 'steps',
      items: [
        {
          title: '1. 每个请求创建独立 Pinia',
          content: '避免不同请求共享用户状态，并让服务端 app 使用本次请求的 active Pinia。',
        },
        {
          title: '2. render 后读取 root state',
          content: '先让服务端 Store 完成数据获取，再从 `pinia.state.value` 生成传输 payload。',
        },
        {
          title: '3. 由宿主安全传输并恢复',
          content:
            '宿主 SSR 负责配对 serializer/parser、HTML context escaping 与 CSP；客户端必须在第一次 `useStore()` 前恢复 `pinia.state.value`。',
        },
      ],
    },
    {
      type: 'text',
      content:
        '本页没有 SSR renderer、server/client 双入口或 HTML injection seam。真实 Node SSR、浏览器 hydration 与安全序列化证据均为 `Deferred/not-run`；state 相等不能替代 DOM mismatch 与 console evidence。',
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '在 Options Store 使用 skipHydrate',
          description: 'skip marker 由 Setup Store 顶层水合分支检查。',
          consequence: '混淆两种 Store 创建路径，custom state 不能按预期恢复。',
          wrong: { lang: 'ts', content: 'state: () => ({ cache: skipHydrate(createCache()) })' },
          correct: {
            lang: 'ts',
            content: 'hydrate(storeState, initialState) { restoreCache(storeState, initialState) }',
          },
        },
        {
          title: '把 primitive 传给 skipHydrate',
          description: 'runtime 使用 `Object.defineProperty()` 写入 marker。',
          consequence: 'primitive 无法承载对象属性标记。',
          wrong: { lang: 'ts', content: 'const version = skipHydrate(1)' },
          correct: { lang: 'ts', content: 'const router = skipHydrate(useRouter())' },
        },
        {
          title: '认为 marker 会删除 payload 字段',
          description: '标记只控制 initial state 是否写入 Setup 返回对象。',
          consequence: '产生错误的数据泄漏与传输假设。',
          wrong: { lang: 'ts', content: 'skipHydrate(secret) // 以为不会序列化' },
          correct: { lang: 'ts', content: 'const payload = selectPublicState(pinia.state.value)' },
        },
        {
          title: '假定 marker 递归影响后代',
          description: '公开使用契约只覆盖 Setup Store 顶层返回对象。',
          consequence: 'nested client-only 对象仍可能被 initial state 覆盖。',
          wrong: { lang: 'ts', content: 'return { shell: { router: skipHydrate(router) } }' },
          correct: { lang: 'ts', content: 'return { router: skipHydrate(router) }' },
        },
        {
          title: '把 shouldHydrate 当作序列化检查',
          description: 'helper 只检查 Pinia 自己的 skip marker。',
          consequence: 'class、DOM、Map 或 Set 的传输能力被误判。',
          wrong: { lang: 'ts', content: 'if (shouldHydrate(value)) JSON.stringify(value)' },
          correct: {
            lang: 'ts',
            content: 'const payload = serializer.stringify(selectState(value))',
          },
        },
        {
          title: '创建 Store 后再恢复 root state',
          description: '4.0.2 的 Options refs 可能已经连接原 root object。',
          consequence: '后写入的新 root state 与既有 Store refs 脱节。',
          wrong: {
            lang: 'ts',
            content: 'const store = useStore()\npinia.state.value = initialState',
          },
          correct: {
            lang: 'ts',
            content: 'pinia.state.value = initialState\nconst store = useStore()',
          },
        },
        {
          title: '直接内联 JSON 并声称防 XSS',
          description: '`JSON.stringify()` 不独自处理 HTML script context。',
          consequence: 'SSR 页面仍存在注入攻击面。',
          wrong: {
            lang: 'ts',
            content: 'html += `<script>window.STATE=${JSON.stringify(state)}</script>`',
          },
          correct: { lang: 'ts', content: 'const payload = safeSerializer.stringify(state)' },
        },
        {
          title: '用 state 相等证明 DOM hydration',
          description: 'Pinia state 恢复与 Vue DOM hydration 是不同层次。',
          consequence: '服务端 HTML 与客户端渲染 mismatch 被遗漏。',
          wrong: { lang: 'ts', content: 'expect(clientState).toEqual(serverState)' },
          correct: { lang: 'ts', content: 'hydrateApp()\nexpect(consoleMismatch).toBeUndefined()' },
        },
      ],
    },
    { type: 'heading', content: '源码推导与适用场景' },
    {
      type: 'steps',
      items: [
        {
          title: '1. Marker 只表达顶层跳过语义',
          content:
            '固定 `store.ts` 写入不可枚举 own Symbol，`shouldHydrate()` 只检查该 marker，因此 helper 不递归也不负责序列化。适用于 Setup Store 的 client-only 顶层对象。',
        },
        {
          title: '2. 普通 Setup state 自动接收 initial state',
          content:
            '同一 runtime 对顶层 ref 赋值、对 reactive object merge。适用于解释自动恢复，但不能推出任意对象都可跨网络传输。',
        },
        {
          title: '3. Skip helper 限定在 Setup 分支',
          content:
            'runtime 只在非 Options Store 分支调用 `shouldHydrate()`。适用于 router 或 custom composable 等不应接收服务端初始值的返回项。',
        },
        {
          title: '4. Options hydrate 是复杂值补充入口',
          content:
            'Options Store 先从 root state 建 refs，最后才按需调用 `hydrate()`。适用于 custom ref 或 local-storage ref，不是全局 serializer。',
        },
        {
          title: '5. 上游测试不构成递归保证',
          content:
            '`state.spec.ts` 覆盖 object、Map、Set 与 Array marker，nested case 仍被跳过。适用于限制页面声明与类型示例。',
        },
        {
          title: '6. SSR 宿主拥有安全恢复协议',
          content:
            '官方 SSR guide 要求 render 后读 state、客户端首个 Store 前恢复并安全转义。适用于 SSR entry 的 serializer、parser 与 CSP 集成设计。',
        },
        {
          title: '7. 上游 SSR 测试不是项目 runtime evidence',
          content:
            '`ssr.spec.ts` 覆盖独立 app/Pinia 与 Options/Setup initial state，却没有本项目的 HTML、CSP 或浏览器 seam。适用于保持证据分层。',
        },
      ],
    },
  ],
})
