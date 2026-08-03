/**
 * 课程：侦听器
 * 查证日期：2026-07-30
 * 适用版本：Vue 3.5.40
 * 查证工具：Tavily、Vue 中文官网与 vuejs/core v3.5.40 固定标签源码
 */
import { defineLesson, defineLessonMeta } from '@/content/schema'

export const meta = defineLessonMeta({
  id: 'vue.core.learn.basics.watchers',
  type: 'lesson',
  title: '侦听器',
  summary: '用 watch 与 watchEffect 执行必要副作用，并正确处理来源、清理和触发时机',
  ecosystem: 'vue',
  module: 'core',
  collection: 'basics',
  level: 'beginner',
  prerequisites: ['vue.core.learn.basics.computed-properties'],
  related: [
    'vue.core.learn.basics.computed-properties',
    'vue.core.reference.reactivity-watchers.computed',
    'vue.core.reference.reactivity-watchers.watch',
    'vue.core.reference.reactivity-watchers.watch-effect',
    'vue.core.reference.reactivity-watchers.watch-post-sync',
    'vue.core.reference.reactivity.ref',
    'vue.core.reference.reactivity.reactive',
  ],
  tags: ['watch', 'watchEffect', '侦听器', '副作用', 'cleanup', 'flush'],
  sources: [
    {
      title: 'Vue 侦听器指南',
      url: 'https://cn.vuejs.org/guide/essentials/watchers.html',
    },
    {
      title: 'Vue 计算属性',
      url: 'https://cn.vuejs.org/guide/essentials/computed.html',
    },
    {
      title: 'Vue 响应式 API：watch()',
      url: 'https://cn.vuejs.org/api/reactivity-core.html#watch',
    },
    {
      title: 'Vue 响应式 API：watchEffect()',
      url: 'https://cn.vuejs.org/api/reactivity-core.html#watcheffect',
    },
    {
      title: 'Vue 3.5.40 watch.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/watch.ts',
    },
    {
      title: 'Vue 3.5.40 apiWatch.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiWatch.ts',
    },
    {
      title: 'Vue 3.5.40 effect.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effect.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-07-30',
  estimatedMinutes: 40,
})

export default defineLesson({
  meta,
  objectives: [
    '区分计算属性的派生值与侦听器执行的副作用',
    '为 watch 选择 ref、getter、响应式对象或多来源数组',
    '根据依赖是否需要显式控制选择 watch 或 watchEffect',
    '在异步副作用失效时清理旧任务，避免过期结果覆盖新状态',
    '理解默认、post 与 sync 三种触发时机的使用边界',
  ],
  blocks: [
    { type: 'heading', content: '侦听器负责副作用' },
    {
      type: 'text',
      content:
        '上一课使用 `computed()` 声明由状态得到的新值。请求数据、写入存储、记录日志或读取更新后的 DOM 不会产生供模板直接读取的派生值，它们是状态变化后需要执行的副作用，应交给事件、生命周期或侦听器。',
    },
    {
      type: 'table',
      headers: ['需求', '优先选择'],
      rows: [
        ['根据已有状态得到总价、筛选结果或文案', 'computed'],
        ['只由一次用户操作触发保存或提交', '事件处理函数'],
        ['指定状态变化后执行请求、同步或记录', 'watch'],
        ['副作用会同步读取多个响应式值，希望自动追踪', 'watchEffect'],
      ],
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '不要用侦听器维护本可计算得到的第二份状态。能用 computed 表达的同步关系如果改成 watch 赋值，就会增加执行顺序和初始同步问题。',
    },
    { type: 'heading', content: '用 watch 精确声明来源' },
    {
      type: 'text',
      content:
        '`watch(source, callback)` 把“追踪什么”和“变化后做什么”分开。它默认先保存来源的初始值，只有来源之后发生变化时才调用回调，因此可以取得新值与旧值。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { ref, watch } from 'vue'

const userId = ref(1)

watch(userId, (newId, oldId) => {
  console.log('用户变化：', oldId, '→', newId)
})`,
    },
    {
      type: 'text',
      content:
        '来源可以是 ref（包括 computed ref）、getter、响应式对象或这些来源组成的数组。需要侦听 reactive 对象的某个属性时必须使用 getter，因为直接读取属性会先得到一个普通值。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const filters = reactive({ query: '', page: 1 })

// getter：只关心 query
watch(() => filters.query, (query) => search(query))

// 多来源：任一返回值改变都会触发
watch(
  [() => filters.query, () => filters.page],
  ([query, page], [oldQuery, oldPage]) => loadPage(query, page),
)`,
    },
    { type: 'heading', content: '默认惰性与首次执行' },
    {
      type: 'text',
      content:
        '`watch()` 默认不会在创建时调用回调。初始化和后续变化需要执行同一逻辑时使用 `immediate: true`，首次回调的新值是当前来源值，旧值为 `undefined`。只关心第一次变化时可使用 Vue 3.4+ 的 `once: true`。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `watch(
  userId,
  (id) => loadUser(id),
  { immediate: true },
)

watch(hasAcceptedTerms, recordFirstAcceptance, { once: true })`,
    },
    { type: 'heading', content: '用 watchEffect 自动追踪' },
    {
      type: 'text',
      content:
        '`watchEffect()` 会立即执行副作用，并自动追踪这次同步执行期间读取的响应式依赖。依赖变化后它重新执行，不提供独立的来源列表或新旧值。副作用依赖多项状态且每项都在函数内使用时，它通常更简洁。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const userId = ref(1)
const locale = ref('zh-CN')

watchEffect(() => {
  document.title = '用户 ' + userId.value + ' · ' + locale.value
})`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '异步 watchEffect 只追踪第一个 await 之前读取的依赖。需要让某个 ref 稳定触发异步任务时，优先把它写成 watch 的显式来源。',
    },
    { type: 'heading', content: '失效时清理旧副作用' },
    {
      type: 'text',
      content:
        '来源再次变化时，上一次请求、计时器或订阅可能仍在运行。回调的第三个参数 `onCleanup` 可以登记清理函数；Vue 会在下一次回调执行前或侦听器停止时调用它。这样旧任务不会晚于新任务完成后再覆盖界面。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `watch(userId, async (id, _oldId, onCleanup) => {
  const controller = new AbortController()
  onCleanup(() => controller.abort())

  const response = await fetch('/api/users/' + id, {
    signal: controller.signal,
  })
  user.value = await response.json()
})`,
    },
    {
      type: 'text',
      content:
        'Vue 3.5+ 也提供 `onWatcherCleanup()`。它必须在回调同步执行阶段、也就是第一个 `await` 之前调用。基础课程优先使用回调参数 `onCleanup`，因为归属关系直接可见，异步回调中也不容易把注册位置写错。',
    },
    { type: 'heading', content: '观察过期请求如何覆盖结果' },
    {
      type: 'text',
      content:
        '下面会连续发起一个慢任务和一个快任务。左侧不清理旧任务，慢结果最终覆盖新结果；右侧用 `onCleanup` 取消失效任务，只保留最新条件的结果。',
    },
    {
      type: 'demo',
      id: 'vue.core.learn.basics.watchers.request-cleanup-demo',
      description: '对比未清理与使用 onCleanup 时的异步竞态结果',
      playground: true,
    },
    { type: 'heading', content: '选择回调触发时机' },
    {
      type: 'text',
      content:
        '默认 `flush: "pre"` 会批量调度回调：父组件已经更新，但当前组件 DOM 还没有更新。副作用必须读取当前组件更新后的 DOM 时使用 `flush: "post"`，或使用别名 `watchPostEffect()`。',
    },
    {
      type: 'table',
      headers: ['时机', '行为', '适合场景'],
      rows: [
        ['pre（默认）', '批量执行，早于当前组件 DOM 更新', '请求、日志、与 DOM 无关的同步'],
        ['post', '当前组件 DOM 更新后执行', '测量更新后的尺寸或读取渲染结果'],
        ['sync', '依赖变化时同步执行，不批量', '极少量简单布尔状态的特殊同步需求'],
      ],
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`flush: "sync"` 会绕过批量调度。不要用它侦听会在同一轮同步修改很多次的数组或对象，否则每次修改都可能立即执行副作用。',
    },
    { type: 'heading', content: '深层侦听与控制句柄' },
    {
      type: 'text',
      content:
        '直接把 reactive 对象作为来源会隐式深层侦听；getter 返回对象时默认只比较返回引用，确需观察内部属性才使用 `deep`。Vue 3.5+ 可以传数字限制最大遍历深度。深层侦听需要递归访问属性建立依赖，数据越大成本越高。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const handle = watch(
  () => settings.profile,
  saveProfile,
  { deep: 2 },
)

handle.pause()
handle.resume()
handle.stop()`,
    },
    {
      type: 'text',
      content:
        '在组件 `<script setup>` 中同步创建的侦听器会随组件卸载自动停止。`pause()` 只暂停后续调度：它不会执行 cleanup，也不会取消已经启动的请求；暂停期间发生的变化会在 `resume()` 后补跑一次。只有 `stop()` 才会永久停止侦听并执行已登记的清理。异步回调里的请求等外部工作仍应通过清理函数主动取消。',
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '直接把 reactive 属性值传给 watch',
          description:
            '`state.count` 在调用 watch 前已经求值为普通数字，不再是 ref、getter 或响应式对象这类有效来源。',
          consequence: 'Vue 会警告来源无效，之后 count 改变也不会执行回调。',
          wrong: {
            lang: 'ts',
            content: `const state = reactive({ count: 0 })
watch(state.count, (count) => console.log(count))`,
          },
          correct: {
            lang: 'ts',
            content: `const state = reactive({ count: 0 })
watch(() => state.count, (count) => console.log(count))`,
          },
        },
        {
          title: '把 watch 当成会自动执行的初始化逻辑',
          description: 'watch 默认是惰性的，创建时只取得初始值，不调用回调。',
          consequence: '页面首次进入时数据没有加载，只有来源第一次变化后才出现结果。',
          wrong: {
            lang: 'ts',
            content: `const userId = ref(1)
watch(userId, loadUser)`,
          },
          correct: {
            lang: 'ts',
            content: `const userId = ref(1)
watch(userId, loadUser, { immediate: true })`,
          },
        },
        {
          title: '用 watcher 手工维护本可计算得到的值',
          description:
            '把“得到一个同步结果”误判为副作用，额外保存了一份能从源状态直接计算出的状态。',
          consequence: '必须补初始化和后续同步，任何遗漏都会让源状态与结果短暂或永久不一致。',
          wrong: {
            lang: 'ts',
            content: `const fullName = ref('')
watch([firstName, lastName], ([first, last]) => {
  fullName.value = first + ' ' + last
})`,
          },
          correct: {
            lang: 'ts',
            content: `const fullName = computed(
  () => firstName.value + ' ' + lastName.value,
)`,
          },
        },
        {
          title: '侦听返回对象的 getter，却期待嵌套修改默认触发',
          description:
            'getter 来源默认比较返回值本身。修改嵌套字段后仍返回同一个对象引用，不会自动成为深层侦听。',
          consequence: '对象内部已经变化，依赖 watcher 的保存或校验逻辑却没有执行。',
          wrong: {
            lang: 'ts',
            content: `watch(() => state.user, saveUser)
state.user.name = 'Grace'`,
          },
          correct: {
            lang: 'ts',
            content: `// 优先收窄到真正需要的字段
watch(() => state.user.name, saveName)

// 确需整个对象时才启用深层侦听
watch(() => state.user, saveUser, { deep: true })`,
          },
        },
        {
          title: '把深层 watcher 的 oldValue 当成修改前快照',
          description:
            'deep 会遍历嵌套属性建立依赖，但不会复制对象。内部原地修改时，新旧值仍指向同一个对象。',
          consequence: 'newValue 与 oldValue 相等，审计、撤销或差异比较无法得到修改前字段。',
          wrong: {
            lang: 'ts',
            content: `watch(state, (next, previous) => {
  recordDiff(previous.profile, next.profile)
})`,
          },
          correct: {
            lang: 'ts',
            content: `watch(
  () => state.profile.name,
  (nextName, previousName) => recordRename(previousName, nextName),
)`,
          },
        },
        {
          title: '对大型对象无差别使用 deep: true',
          description:
            '深层侦听需要递归读取嵌套属性建立依赖，对象越大、层级越深，创建和重跑成本越高。',
          consequence: '无关字段也会参与遍历和触发，副作用频繁运行并且难以判断真正的变化来源。',
          wrong: {
            lang: 'ts',
            content: `watch(largeState, persistEverything, { deep: true })`,
          },
          correct: {
            lang: 'ts',
            content: `watch(
  [() => largeState.user.id, () => largeState.settings.theme],
  persistRelevantFields,
)

// Vue 3.5+ 确需遍历时可限制最大深度
watch(largeState, persistSection, { deep: 2 })`,
          },
        },
        {
          title: '在 await 之后注册 onWatcherCleanup',
          description:
            '`onWatcherCleanup()` 只能在 watch 回调或 watchEffect 的同步执行阶段关联当前侦听器。',
          consequence: '清理函数没有登记到当前侦听器，旧请求可能继续运行并覆盖新结果。',
          wrong: {
            lang: 'ts',
            content: `watch(id, async (value) => {
  const response = await fetch('/api/' + value)
  onWatcherCleanup(() => response.body?.cancel())
})`,
          },
          correct: {
            lang: 'ts',
            content: `watch(id, async (value) => {
  const controller = new AbortController()
  onWatcherCleanup(() => controller.abort())
  await fetch('/api/' + value, { signal: controller.signal })
})`,
          },
        },
        {
          title: '以为 watchEffect 会追踪 await 之后读取的依赖',
          description:
            'watchEffect 只追踪同步执行期间读取的响应式值，第一个 await 会结束本次收集阶段。',
          consequence: 'await 后才读取的 ref 变化不会重新执行副作用，看起来像依赖追踪失效。',
          wrong: {
            lang: 'ts',
            content: `watchEffect(async () => {
  await prepare()
  data.value = await loadUser(userId.value)
})`,
          },
          correct: {
            lang: 'ts',
            content: `watch(userId, async (id, _oldId, onCleanup) => {
  const controller = new AbortController()
  onCleanup(() => controller.abort())
  data.value = await loadUser(id, controller.signal)
})`,
          },
        },
        {
          title: '在默认回调中读取更新后的组件 DOM',
          description: '默认 pre 回调早于当前组件自己的 DOM 更新，此时读取到的还是旧渲染结果。',
          consequence: '尺寸、文本或滚动位置来自上一帧，后续定位和动画计算发生偏移。',
          wrong: {
            lang: 'ts',
            content: `watch(items, () => {
  height.value = listEl.value?.scrollHeight ?? 0
})`,
          },
          correct: {
            lang: 'ts',
            content: `watch(
  items,
  () => { height.value = listEl.value?.scrollHeight ?? 0 },
  { flush: 'post' },
)`,
          },
        },
        {
          title: '在异步回调中创建长期侦听器却不停止',
          description:
            '同步创建于 setup 的侦听器会绑定组件生命周期；在 setTimeout 或请求完成后才创建的侦听器不会自动绑定。',
          consequence: '组件卸载后侦听器仍可能运行，持续持有状态并执行已经无主的副作用。',
          wrong: {
            lang: 'ts',
            content: `setTimeout(() => {
  watchEffect(() => syncResult(result.value))
}, 100)`,
          },
          correct: {
            lang: 'ts',
            content: `const ready = ref(false)

watchEffect(() => {
  if (ready.value) syncResult(result.value)
})`,
          },
        },
      ],
    },
    { type: 'heading', content: '从源码推导适用场景' },
    {
      type: 'steps',
      items: [
        {
          title: '精确来源适合查询、持久化和跨系统同步',
          content:
            '`watch.ts` 会把 ref、getter和多来源数组统一为 getter，再比较前后结果。只登记真正触发副作用的字段，可以避免无关状态变化重复请求或写入。',
        },
        {
          title: '自动来源适合依赖与使用位置一致的同步副作用',
          content:
            'watchEffect 没有独立回调时直接执行 effect 函数，函数同步读取到的依赖就是订阅集合。主题、标题或第三方小组件配置等多字段同步可以保持声明集中。',
        },
        {
          title: '清理函数是处理异步竞态的失效协议',
          content:
            '源码在 effect 重跑前先执行已登记 cleanup。网络取消、清除定时器和取消订阅都应在任务启动时一并登记，而不是等任务完成后补救。',
        },
        {
          title: 'post 调度适合渲染后的 DOM 边界',
          content:
            '`apiWatch.ts` 会把 post 任务交给渲染后的队列。只有副作用确实依赖新 DOM 时才改变 flush，普通数据同步保持默认批量调度。',
        },
        {
          title: '大型数据优先窄 getter，深度遍历作为例外',
          content:
            'deep 通过 traverse 递归读取属性建立依赖。侦听具体 getter 能减少遍历和无关触发；确需结构级观察时再选择数字深度或 true。',
        },
      ],
    },
    {
      type: 'exercise',
      title: '为搜索建议增加可取消侦听器',
      instructions:
        '准备 query、suggestions 和 loading 三个 ref。使用 watch 侦听 query，并在首次进入时运行；query 为空时清空结果。每次非空查询创建 AbortController，通过 onCleanup 取消旧请求，最后正确结束 loading。说明为什么这里不用 computed，也不要依赖 watchEffect 在 await 后自动收集 query。',
      answer: `const query = ref('')
const suggestions = ref<string[]>([])
const loading = ref(false)

watch(
  query,
  async (value, _oldValue, onCleanup) => {
    if (!value.trim()) {
      suggestions.value = []
      loading.value = false
      return
    }

    const controller = new AbortController()
    onCleanup(() => controller.abort())
    loading.value = true

    try {
      suggestions.value = await search(value, controller.signal)
    } finally {
      if (!controller.signal.aborted) loading.value = false
    }
  },
  { immediate: true },
)`,
    },
  ],
  recap: [
    'computed 声明同步派生值，watch 与 watchEffect 用来执行必要副作用。',
    'watch 显式声明来源并提供新旧值；watchEffect 立即执行并自动追踪同步读取的依赖。',
    '异步副作用启动时就登记清理，避免过期请求、计时器或订阅覆盖最新状态。',
    '默认 pre 适合大多数副作用，读取更新后 DOM 才使用 post，sync 只用于少量特殊同步需求。',
    '大型对象优先侦听窄 getter，深层侦听不会自动产生修改前快照。',
  ],
})
