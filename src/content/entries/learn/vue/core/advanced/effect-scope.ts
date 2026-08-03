/**
 * 课程：EffectScope
 * 查证日期：2026-08-02
 * 适用版本：Vue 3.5.40
 * 查证工具：Tavily、Vue 中文官网、vuejs/docs 与 vuejs/core v3.5.40 固定标签源码和测试
 */
import { defineLesson, defineLessonMeta } from '@/content/schema'

export const meta = defineLessonMeta({
  id: 'vue.core.learn.advanced.effect-scope',
  type: 'lesson',
  title: 'EffectScope',
  summary: '为一组响应式副作用和外部资源建立明确所有者，并按层级一次性释放',
  ecosystem: 'vue',
  module: 'core',
  collection: 'advanced',
  level: 'advanced',
  prerequisites: ['vue.core.learn.advanced.custom-ref-triggering'],
  related: [
    'vue.core.reference.reactivity.effect-scope',
    'vue.core.learn.basics.watchers',
    'vue.core.learn.intermediate.composables',
    'vue.core.learn.advanced.custom-ref-triggering',
  ],
  tags: [
    'effectScope',
    'EffectScope',
    'getCurrentScope',
    'onScopeDispose',
    '副作用所有权',
    '嵌套作用域',
    'detached',
    '资源清理',
  ],
  sources: [
    {
      title: 'Vue 中文响应式 API：进阶 effectScope()',
      url: 'https://cn.vuejs.org/api/reactivity-advanced.html#effectscope',
    },
    {
      title: 'Vue 中文响应式 API：进阶 onScopeDispose()',
      url: 'https://cn.vuejs.org/api/reactivity-advanced.html#onscopedispose',
    },
    {
      title: 'Vue 中文侦听器指南：停止侦听器',
      url: 'https://cn.vuejs.org/guide/essentials/watchers.html#stopping-a-watcher',
    },
    {
      title: 'Vue 响应式进阶 API 官方 Markdown',
      url: 'https://github.com/vuejs/docs/blob/main/src/api/reactivity-advanced.md',
    },
    {
      title: 'Vue 侦听器指南官方 Markdown',
      url: 'https://github.com/vuejs/docs/blob/main/src/guide/essentials/watchers.md',
    },
    {
      title: 'Vue 3.5.40 effectScope.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effectScope.ts',
    },
    {
      title: 'Vue 3.5.40 effect.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effect.ts',
    },
    {
      title: 'Vue 3.5.40 computed.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/computed.ts',
    },
    {
      title: 'Vue 3.5.40 component.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/component.ts',
    },
    {
      title: 'Vue 3.5.40 effectScope 官方测试',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/effectScope.spec.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-08-02',
  estimatedMinutes: 65,
})

export default defineLesson({
  meta,
  objectives: [
    '把 effect scope 理解为副作用所有者，而不是另一种响应式状态容器',
    '说明 scope.run 对同步创建的 watch、watchEffect 生效，并识别 3.5.40 的 computed 例外',
    '预测父 scope、普通子 scope 与 detached scope 的停止结果',
    '用 getCurrentScope 检查组合式函数是否处于可登记清理的上下文',
    '用 onScopeDispose 同时释放事件监听器、连接或定时器等外部资源',
    '解释组件 setup 已经拥有 scope，以及异步创建 watcher 的所有权风险',
    '让多个退出路径安全复用同一个幂等 stop 或 dispose 操作',
    '判断可开关功能、共享资源和普通组件逻辑是否真的需要显式 scope',
  ],
  blocks: [
    { type: 'heading', content: '正文大纲' },
    {
      type: 'text',
      content:
        '上一课把值提交与更新通知拆开，本课进一步回答“谁拥有这些副作用，何时一起结束”。effectScope() 不改变 ref 的值，也不替代组件；它为同步创建的一组 watch、watchEffect 和清理回调建立所有权。我们先建立最小 scope，再比较普通嵌套与 detached，最后把这套协议连接到组件 setup 和组合式函数。',
    },
    { type: 'heading', content: '先把 Scope 看成副作用所有者' },
    {
      type: 'text',
      content:
        '响应式状态描述“数据是什么”，effect scope 描述“哪些副作用属于同一段生命周期”。scope.run(fn) 在执行 fn 时暂时成为当前所有者；其中创建的响应式副作用会被收集。scope.stop() 停止这些副作用，但原来的 ref 仍可读取和修改。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { effectScope, ref, watchEffect } from 'vue'

const count = ref(0)
const scope = effectScope()

scope.run(() => {
  watchEffect(() => {
    console.log('count:', count.value)
  })
})

count.value += 1 // 副作用继续响应
scope.stop()
count.value += 1 // 状态仍改变，但上面的副作用不再运行`,
    },
    {
      type: 'tip',
      style: 'info',
      content:
        'scope.run 会返回回调的返回值；scope 已停止时不再执行回调并返回 undefined。停止后的 scope 不是暂停容器，需要再次启用同类功能时应创建新 scope。',
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '版本边界：官网概括仍把 computed 列为可捕获对象，但 Vue 3.5.40 的 ComputedRefImpl 已不再使用 ReactiveEffect，也不会登记到 scope.effects。scope.stop() 后直接读取该 computed 仍会按最新依赖重新计算；若 watcher 消费它，停止的是 watcher。',
    },
    { type: 'heading', content: '收集发生在同步创建的那一刻' },
    {
      type: 'text',
      content:
        '副作用是否归属某个 scope，取决于它被创建时哪个 scope 正处于活跃状态，而不是变量最后保存在哪里。run 执行完同步函数后立即恢复先前 scope；传入 async 函数时，第一个 await 之后的续体已经离开这次同步收集边界。',
    },
    {
      type: 'compare',
      labels: ['异步后才创建', '同步创建，异步条件进入回调'],
      before: `scope.run(async () => {
  await loadPreferences()
  watchEffect(syncPreferences)
})`,
      after: `scope.run(() => {
  const preferences = shallowRef<Preferences>()

  watchEffect(() => {
    if (preferences.value) syncPreferences(preferences.value)
  })

  void loadPreferences().then((value) => {
    preferences.value = value
  })
})`,
    },
    {
      type: 'text',
      content:
        '这与组件侦听器的官方规则一致：在 setup 或 script setup 中同步创建的 watcher 会绑定组件并在卸载时停止；异步回调中才创建的 watcher 没有这份自动所有权，必须保存并手动停止。优先同步创建 watcher，再让回调根据异步数据是否就绪决定是否工作。',
    },
    { type: 'heading', content: '普通嵌套形成可级联停止的功能树' },
    {
      type: 'text',
      content:
        '在父 scope 的 run 中创建默认 effectScope()，子 scope 会归属当前父级。父级停止时，自己的副作用和清理先结束，普通子 scope 也会递归停止。子级可提前 stop，用来关闭功能树中的一个分支，而不影响父级其他工作。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const featureScope = effectScope()

featureScope.run(() => {
  watch(activeLessonId, loadLesson)

  const previewScope = effectScope()
  previewScope.run(() => {
    watch(previewTheme, renderPreview)
  })
})

featureScope.stop() // loadLesson 与 renderPreview 都停止`,
    },
    {
      type: 'table',
      headers: ['操作', '父 scope', '普通子 scope', '其他父级分支'],
      rows: [
        ['子 scope.stop()', '继续运行', '停止', '继续运行'],
        ['父 scope.stop()', '停止', '递归停止', '若同属该父级则停止'],
        ['再次父 scope.stop()', '保持停止', '保持停止', 'cleanup 不重复执行'],
      ],
    },
    { type: 'heading', content: 'Detached 把停止责任交给独立所有者' },
    {
      type: 'text',
      content:
        'effectScope(true) 创建 detached scope。即使它在父 scope.run 内创建，也不会挂入父级的普通子 scope 列表；父级 stop 后它仍响应。它不是更安全的默认值，而是一份明确声明：当前父级不拥有我，调用方必须给我安排独立的停止时机。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const pageScope = effectScope()
let sharedScope: EffectScope | undefined

pageScope.run(() => {
  sharedScope = effectScope(true)
  sharedScope.run(() => {
    watchEffect(refreshSharedCache)
  })
})

pageScope.stop()   // 不会停止共享缓存
sharedScope?.stop() // 共享缓存的所有者显式释放`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        'detached scope 若没有服务对象、引用计数、应用卸载或测试 teardown 等明确 owner，就只是在绕开自动清理。生命周期更长不等于永久存活。',
    },
    { type: 'heading', content: 'onScopeDispose 把外部资源纳入同一所有权' },
    {
      type: 'text',
      content:
        'Vue 能停止它收集到的响应式副作用，却不会猜测某段业务代码注册了 DOM 事件、WebSocket、AbortController 或定时器。组合式函数在当前活跃 scope 内调用 onScopeDispose，可以把这些资源的幂等释放函数登记到同一个所有者。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { onScopeDispose, ref } from 'vue'

/** 在当前 scope 中订阅窗口尺寸，并在 owner 结束时移除监听。 */
function useViewportWidth() {
  const width = ref(window.innerWidth)

  /** 同步窗口宽度。 */
  function updateWidth(): void {
    width.value = window.innerWidth
  }

  /** 幂等移除当前组合式函数创建的监听器。 */
  function dispose(): void {
    window.removeEventListener('resize', updateWidth)
  }

  window.addEventListener('resize', updateWidth)
  onScopeDispose(dispose)
  return width
}`,
    },
    {
      type: 'text',
      content:
        'onScopeDispose 与 onUnmounted 的差别在所有者抽象：前者依赖当前 effect scope，所以同一个组合式函数既能在组件中使用，也能放进用户创建的临时 scope。Vue 3.5+ 的 failSilently 参数只抑制“没有活跃 scope”的开发警告，不会自动创建 owner。',
    },
    { type: 'heading', content: '组件 setup 已经提供默认所有者' },
    {
      type: 'text',
      content:
        '每个组件 setup 都在组件自己的 effect scope 上下文中执行。普通同步 watcher 会随组件卸载，不需要为了自动清理再包一层 effectScope。显式 scope 的价值是建立组件内部更短的功能生命周期，或建立比单个组件更长的共享生命周期。',
    },
    {
      type: 'steps',
      items: [
        {
          title: '普通组件逻辑',
          content: '直接在 setup 同步创建 watcher；组件 scope 已经负责卸载停止。',
        },
        {
          title: '组件内可开关功能',
          content: '启用时创建普通 scope，禁用时 stop；再次启用创建新 scope。',
        },
        {
          title: '跨组件共享资源',
          content: '使用 detached scope，并由共享服务或引用计数负责 stop。',
        },
        {
          title: '把 detached 桥接回组件',
          content: '若共享实验最终仍应随当前组件结束，在组件 scope 同步登记 detachedScope.stop。',
        },
      ],
    },
    { type: 'heading', content: 'getCurrentScope 适合检查能力，不适合隐藏所有权' },
    {
      type: 'text',
      content:
        'getCurrentScope() 返回当前活跃 scope 或 undefined。库函数可以用它决定是否能够登记 cleanup，或在缺少 owner 时要求调用方传入显式 dispose 方案。不要静默创建 detached scope 作为兜底，否则调用者看不见一个更长生命周期资源已经产生。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { getCurrentScope, onScopeDispose } from 'vue'

/** 只有存在明确 scope owner 时才注册课程频道订阅。 */
function useCourseChannel() {
  if (!getCurrentScope()) {
    throw new Error('useCourseChannel() 必须在 setup 或 scope.run() 中同步调用')
  }

  const unsubscribe = subscribeCourseChannel()
  onScopeDispose(unsubscribe)
}`,
    },
    { type: 'heading', content: '按生命周期选择工具' },
    {
      type: 'table',
      headers: ['需求', '优先工具', '原因'],
      rows: [
        ['组件卸载时停止同步 watcher', '组件默认 scope', '无需增加显式容器'],
        [
          'watch 每次重跑前取消上一请求',
          'watch 的 onCleanup / onWatcherCleanup',
          '清理粒度是一轮 watcher',
        ],
        [
          '同时关闭一组 watcher 与资源',
          'effectScope + onScopeDispose',
          '清理粒度是一段功能生命周期',
        ],
        [
          '跨组件共享一份长生命周期订阅',
          'detached scope + 明确 owner',
          '不会随任一使用组件提前停止',
        ],
        ['只是计算派生值', 'computed', '3.5.40 不登记到 scope，保持惰性派生且无需单独 stop'],
      ],
    },
    { type: 'heading', content: '高级适用场景：从所有权反推结构' },
    {
      type: 'steps',
      items: [
        {
          title: '临时编辑会话',
          content:
            '进入编辑模式时创建 scope，集中建立自动保存、校验和快捷键订阅；退出时一次 stop，下一次会话创建全新 scope。',
        },
        {
          title: '共享订阅服务',
          content:
            '服务对象持有 detached scope，第一个订阅者进入时启动，最后一个订阅者离开时 stop；组件只登记释放自己的订阅份额。',
        },
        {
          title: '可测试的组合式模块',
          content:
            '测试在 scope.run 中创建模块，断言公开状态后统一 stop；资源 cleanup 与生产组件走同一协议。',
        },
        {
          title: '请求或任务隔离',
          content:
            '每次任务建立独立 scope，完成、失败和取消路径共享同一 dispose；不得把请求私有状态挂进应用级 detached scope。',
        },
      ],
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '在 run 外创建 watcher，再期待 scope 接管',
          description:
            '误以为只要稍后把停止函数保存在 scope 附近，Vue 就能推断两者属于同一生命周期。',
          consequence: 'scope.stop() 后外部 watcher 仍运行，请求或订阅继续产生结果。',
          wrong: {
            lang: 'ts',
            content: `const unwatch = watchEffect(loadLesson)
const scope = effectScope()
scope.stop() // 不会停止上面的 watcher`,
          },
          correct: {
            lang: 'ts',
            content: `const scope = effectScope()
scope.run(() => {
  watchEffect(loadLesson)
})
scope.stop()`,
          },
        },
        {
          title: '在 await 之后才创建副作用',
          description: '把 scope.run(async () => ...) 理解为 Promise 完成前始终保持该 scope 活跃。',
          consequence: 'await 后创建的 watcher 不属于预期 scope，stop 时不会随其释放。',
          wrong: {
            lang: 'ts',
            content: `scope.run(async () => {
  const lesson = await loadLesson()
  watchEffect(() => syncLesson(lesson))
})`,
          },
          correct: {
            lang: 'ts',
            content: `scope.run(() => {
  const lesson = shallowRef<Lesson>()
  watchEffect(() => {
    if (lesson.value) syncLesson(lesson.value)
  })
  void loadLesson().then((value) => (lesson.value = value))
})`,
          },
        },
        {
          title: '把 detached 当成加强自动管理',
          description: '看到 true 就误以为开启更多生命周期能力，实际是切断当前父级的级联停止关系。',
          consequence: '父 scope 或组件结束后，detached 内的副作用仍响应并持有资源。',
          wrong: {
            lang: 'ts',
            content: `const cacheScope = effectScope(true)
cacheScope.run(startCache)
// 没有任何 owner 保存并停止 cacheScope`,
          },
          correct: {
            lang: 'ts',
            content: `const cacheScope = effectScope(true)
cacheScope.run(startCache)

/** 由共享缓存服务在生命周期结束时调用。 */
function disposeCache(): void {
  cacheScope.stop()
}`,
          },
        },
        {
          title: '只停 watcher，不清理外部监听器',
          description: '认为 scope.stop() 会自动识别 run 内创建的所有浏览器或第三方资源。',
          consequence: '响应式回调停止了，但 EventTarget、socket 或 timer 仍保留回调和闭包。',
          wrong: {
            lang: 'ts',
            content: `scope.run(() => {
  window.addEventListener('resize', updateLayout)
})`,
          },
          correct: {
            lang: 'ts',
            content: `scope.run(() => {
  window.addEventListener('resize', updateLayout)
  onScopeDispose(() => window.removeEventListener('resize', updateLayout))
})`,
          },
        },
        {
          title: '在普通点击回调中才登记 onScopeDispose',
          description:
            '事件触发时组件 setup 已结束，当前调用栈通常没有可供登记的活跃 effect scope。',
          consequence: '开发环境产生警告，资源没有进入预期清理列表。',
          wrong: {
            lang: 'ts',
            content: `/** 错误示例：在点击后才尝试登记清理。 */
function connect(): void {
  const socket = openSocket()
  onScopeDispose(() => socket.close())
}`,
          },
          correct: {
            lang: 'ts',
            content: `const socket = shallowRef<Socket>()

/** 关闭当前连接；重复调用保持安全。 */
function disconnect(): void {
  socket.value?.close()
  socket.value = undefined
}

onScopeDispose(disconnect)`,
          },
        },
        {
          title: '停止后继续 run，期待重新激活',
          description: '把 stop 当成 pause，并复用已经失活的 scope 建立下一轮 watcher。',
          consequence: '回调不会执行，run 返回 undefined，开发环境还会提示非活跃 scope。',
          wrong: {
            lang: 'ts',
            content: `featureScope.stop()
featureScope.run(startFeature)`,
          },
          correct: {
            lang: 'ts',
            content: `featureScope.stop()
featureScope = effectScope()
featureScope.run(startFeature)`,
          },
        },
        {
          title: '用一个大 scope 拥有互不相关的功能',
          description: '为了方便只保存一个 stop，把搜索、编辑器和通知订阅全部塞进应用级 scope。',
          consequence: '关闭单个功能时只能继续泄漏，或误停其他仍在使用的功能。',
          wrong: {
            lang: 'ts',
            content: `appScope.run(() => {
  startSearch()
  startEditor()
  startNotifications()
})`,
          },
          correct: {
            lang: 'ts',
            content: `const searchScope = effectScope()
const editorScope = effectScope()

searchScope.run(startSearch)
editorScope.run(startEditor)`,
          },
        },
        {
          title: '混淆 watcher 单轮清理与 scope 生命周期清理',
          description:
            '把每次 watcher 重跑前都要取消的请求放到 onScopeDispose，或把整个共享连接放到单轮 onCleanup。',
          consequence: '过期请求在 watcher 重跑时没有及时取消，或长生命周期资源被过早反复重建。',
          wrong: {
            lang: 'ts',
            content: `watch(query, () => {
  const controller = new AbortController()
  onScopeDispose(() => controller.abort())
})`,
          },
          correct: {
            lang: 'ts',
            content: `watch(query, (_query, _oldQuery, onCleanup) => {
  const controller = new AbortController()
  onCleanup(() => controller.abort())
})

onScopeDispose(closeSharedChannel)`,
          },
        },
      ],
    },
    { type: 'heading', content: '从 Vue 3.5.40 源码推导边界' },
    {
      type: 'steps',
      items: [
        {
          title: '默认构造登记父子关系',
          content:
            'effectScope.ts 的构造器只在非 detached 且存在活跃 scope 时记录 parent 并加入父级 scopes；detached 从创建起就没有这条级联所有权。',
        },
        {
          title: 'run 用 finally 恢复先前 scope',
          content:
            'run 临时设置 activeEffectScope，执行回调后在 finally 恢复；嵌套与抛错都不会让当前 scope 永久串到后续同步代码。',
        },
        {
          title: 'ReactiveEffect 在构造时登记，computed 是版本例外',
          content:
            'effect.ts 的 ReactiveEffect 构造器读取创建当刻的 activeEffectScope 并加入 effects，因此 watch 和 watchEffect 由同步创建位置决定；3.5.40 的 ComputedRefImpl 直接实现 Subscriber 且不登记，停止 scope 后仍可读取并重新计算。',
        },
        {
          title: 'stop 顺序是 effects、cleanups、普通子 scopes',
          content:
            '固定实现先停止本级响应式副作用，再执行本级 cleanup，最后递归停止子 scope；cleanup 不应假设子级已经结束。',
        },
        {
          title: 'active 门闩让 stop 幂等',
          content:
            '第一次 stop 失活并清空已拥有的内容，后续 stop 不再进入释放分支；多个退出路径可以安全调用同一 stop。',
        },
        {
          title: '子 scope 使用快照停止',
          content:
            '父级停止前复制 scopes 再遍历，官方测试还覆盖 cleanup 停止兄弟 scope；应用只应依赖最终都停止，不依赖内部数组顺序。',
        },
        {
          title: 'onScopeDispose 只写入当前 cleanups',
          content:
            '有 activeEffectScope 时回调加入其 cleanups；没有 owner 时 failSilently 只改变警告行为，不会补建 scope。',
        },
        {
          title: '组件复用同一 scope 机制',
          content:
            'component.ts 为组件实例创建 scope，并在设置当前实例时进入该 scope；结合官方侦听器指南，可解释同步 setup watcher 为何随组件卸载。',
        },
      ],
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        'activeEffectScope、effects、cleanups、scopes、parent、index 和组件 instance.scope 都是 Vue 3.5.40 的实现证据。业务代码只使用公开 API，并通过回调次数、资源释放和界面状态验证所有权。',
    },
    { type: 'heading', content: '动手验证：为副作用树建立停止边界' },
    {
      type: 'demo',
      id: 'vue.core.learn.advanced.effect-scope.effect-scope-lifecycle-lab-demo',
      description:
        '父 scope、普通子 scope 与 detached scope 同时观察状态和原生事件；重复停止后比较响应次数、资源清理与组件 scope 桥接',
      playground: true,
    },
    { type: 'heading', content: '练习与回顾' },
    {
      type: 'exercise',
      title: '设计可开关预览会话',
      instructions:
        '一个编辑器预览同时创建文档 watcher、主题 watcher、键盘监听器和消息通道。写出启用、禁用、再次启用与组件卸载时的 scope 所有权，并判断是否需要 detached。',
      answer:
        '每次启用创建新的普通 effectScope，在 run 中同步创建两个 watcher，并用 onScopeDispose 登记键盘和消息通道的幂等释放；禁用只调用该轮 scope.stop。再次启用创建新 scope，不能复用已停止实例。若预览不应长于组件就不使用 detached，组件卸载会通过组件 scope 级联停止仍活跃的普通子 scope。',
    },
  ],
  exercises: [
    '把一个分别保存三个 unwatch 函数和两个 removeEventListener 回调的临时功能改写为 effectScope；列出哪些资源会被 Vue 自动停止，哪些仍必须由 onScopeDispose 登记。',
  ],
  recap: [
    'effect scope 管理已登记副作用的所有权；3.5.40 的 computed 不登记，停止后仍可重新计算。',
    'scope.run 只收集同步执行期间创建的副作用，await 后的续体不自动归属原 scope。',
    '普通子 scope 随父级停止；detached scope 需要独立且可指出的 owner。',
    'onScopeDispose 把事件监听器、连接和定时器等外部资源纳入同一释放边界。',
    '组件 setup 已有默认 scope，普通同步 watcher 不需要额外包装。',
    'getCurrentScope 可以检查是否存在 owner，但不应静默创建 detached 兜底。',
    'stop 是终止且幂等的；再次启用同类功能要创建新 scope。',
    'scope 粒度应对应真实功能生命周期，避免一个大 scope 让无关功能一起停止。',
  ],
})
