/**
 * 课程：组合式函数
 * 查证日期：2026-07-31
 * 适用版本：Vue 3.5.40
 * 查证工具：Tavily、Vue 中文官网与 vuejs/core v3.5.40 固定标签源码和官方测试
 */
import { defineLesson, defineLessonMeta } from '@/content/schema'

export const meta = defineLessonMeta({
  id: 'vue.core.learn.intermediate.composables',
  type: 'lesson',
  title: '组合式函数',
  summary: '用响应式输入、返回 refs 与成对清理封装可复用的有状态逻辑',
  ecosystem: 'vue',
  module: 'core',
  collection: 'intermediate',
  level: 'intermediate',
  prerequisites: ['vue.core.learn.intermediate.component-v-model'],
  related: [
    'vue.core.learn.intermediate.component-v-model',
    'vue.core.learn.basics.watchers',
    'vue.core.reference.advanced.composables',
    'vue.core.reference.reactivity.utils',
    'vue.core.reference.composition.lifecycle',
  ],
  tags: ['组合式函数', 'composable', 'MaybeRefOrGetter', 'toValue', '副作用清理', '状态复用'],
  sources: [
    {
      title: 'Vue 组合式函数指南',
      url: 'https://cn.vuejs.org/guide/reusability/composables.html',
    },
    {
      title: 'Vue 响应式工具 toValue',
      url: 'https://cn.vuejs.org/api/reactivity-utilities.html#tovalue',
    },
    {
      title: 'Vue 侦听器副作用清理',
      url: 'https://cn.vuejs.org/guide/essentials/watchers.html#side-effect-cleanup',
    },
    {
      title: 'Vue 生命周期钩子注册',
      url: 'https://cn.vuejs.org/guide/essentials/lifecycle.html#registering-lifecycle-hooks',
    },
    {
      title: 'Vue SSR 指南',
      url: 'https://cn.vuejs.org/guide/scaling-up/ssr.html',
    },
    {
      title: 'Vue 3.5.40 ref.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/ref.ts',
    },
    {
      title: 'Vue 3.5.40 effectScope.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effectScope.ts',
    },
    {
      title: 'Vue 3.5.40 watch.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/watch.ts',
    },
    {
      title: 'Vue 3.5.40 生命周期实现',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiLifecycle.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-07-31',
  estimatedMinutes: 50,
})

export default defineLesson({
  meta,
  objectives: [
    '判断一段复用逻辑应该是普通工具函数，还是拥有响应式状态的组合式函数',
    '用 use 前缀命名组合式函数，并在 setup 的同步执行阶段调用它',
    '让每次组合式函数调用创建独立状态，并说明共享状态需要新的所有权设计',
    '返回包含 refs 的普通对象，使调用方解构后仍保留响应性',
    '用 MaybeRefOrGetter 接受普通值、ref 或 getter，并在实际读取时调用 toValue',
    '根据依赖是否明确选择 watch 或 watchEffect，而不是把 toValue 误当成自动追踪器',
    '用稳定 handler 和幂等 start / stop 管理浏览器事件副作用',
    '在卸载或 watcher 失效时清理外部资源，并识别活跃 effect scope 的边界',
    '区分客户端局部状态、显式共享状态与 SSR 模块级状态污染',
    '通过唯一 Demo 验证响应式输入、独立实例、暂停重启和卸载清理',
  ],
  blocks: [
    { type: 'heading', content: '正文大纲' },
    {
      type: 'text',
      content:
        '前面的课程已经能在组件内组织状态、侦听变化和管理生命周期。本课把这些能力提取成可复用的有状态逻辑：先确定函数拥有的状态，再设计输入与返回值，最后明确外部资源由谁创建、暂停和清理。组合式函数仍是普通 JavaScript 函数，不是新的组件或运行时容器。',
    },
    {
      type: 'table',
      headers: ['部分', '核心问题', '完成标志'],
      rows: [
        ['定义与边界', '何时需要 composable', '能与工具函数、组件分工'],
        ['实例状态', '两次调用是否共享', '函数体内为每次调用创建 refs'],
        ['返回契约', '解构后如何保持响应', '返回普通对象中的 refs'],
        ['响应式输入', '普通值、ref、getter 如何统一', '在真实读取位置调用 toValue'],
        ['副作用所有权', '谁启动、暂停和释放资源', '稳定 handler 与幂等 start / stop'],
        ['共享与 SSR', '何时局部，何时跨请求', '不把模块单例当成默认共享方案'],
      ],
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '本课限定 SFC、<script setup lang="ts">、Composition API 与 Vue 3.5.40。Provide / Inject、Pinia、共享 store、事件总线、第三方 composables、完整网络层、完整 effectScope API、SSR 数据获取与后续课程均不在本课范围内。',
    },
    { type: 'heading', content: '组合式函数复用的是有状态逻辑' },
    {
      type: 'text',
      content:
        '组合式函数是利用 Vue Composition API 封装和复用有状态逻辑的函数。这里的“有状态”包括 ref、computed、watcher、生命周期或外部订阅。只做输入到输出转换的逻辑继续使用普通工具函数；把文件改名为 useSomething.ts 并不会改变它的职责。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `/** 把课程数格式化为展示文本；它没有响应式状态。 */
function formatLessonCount(count: number) {
  return count + ' 节课'
}

/** 创建拥有响应式状态与命令的计数器实例。 */
function useCounter() {
  const count = ref(0)

  /** 当前实例递增一次。 */
  function increment() {
    count.value += 1
  }

  return { count, increment }
}`,
    },
    {
      type: 'table',
      headers: ['复用对象', '推荐形式', '例子'],
      rows: [
        ['无状态计算', '普通工具函数', 'formatLessonCount、clamp'],
        ['有状态逻辑', '组合式函数', 'useCounter、useEventCounter'],
        ['视图与交互结构', '组件', '表单、列表、弹窗'],
        ['必须直接操作元素', '自定义指令', '聚焦、可见性观察'],
      ],
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`use*` 是清晰的生态命名约定，不是 Vue 运行时强制语法。它提醒调用方：这个函数可能创建响应式状态、注册生命周期或拥有需要清理的副作用。',
    },
    { type: 'heading', content: '先冻结每次调用的实例边界' },
    {
      type: 'text',
      content:
        '状态写在组合式函数体内时，每次调用都会重新执行函数并创建新的 refs。共享的是算法，不是数据。一个实例的 reset 或 stop 只影响它自己；只有把状态刻意移到函数外，才会形成模块级共享。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { ref } from 'vue'

/** 创建一份独立的计数状态。 */
function useCounter() {
  const count = ref(0)

  /** 重置当前实例。 */
  function reset() {
    count.value = 0
  }

  return { count, reset }
}

const counterA = useCounter()
const counterB = useCounter()

counterA.count.value = 5
counterA.reset()
// counterB.count 仍保持自己的值`,
    },
    {
      type: 'principle',
      id: 'composable-instance-ownership',
      content:
        '先问“状态属于哪一次调用”，再问“函数放在哪个文件”。默认把 ref 放在函数体内；需要共享时重新设计请求级、应用级或组件树级所有权。',
    },
    { type: 'heading', content: '返回普通对象中的 refs' },
    {
      type: 'text',
      content:
        '官方推荐返回一个装有多个 refs 的普通对象。调用方解构后拿到的仍是 ref，脚本中用 .value，模板中由 Vue 自动解包。若组合式函数返回 reactive 代理，直接解构基本类型属性只会复制当时的值，之后不再访问原代理。',
    },
    {
      type: 'compare',
      labels: ['容易失去连接', '解构后仍响应'],
      before: `/** 返回代理，调用方解构出普通数字。 */
function usePosition() {
  return reactive({ x: 0, y: 0 })
}

const { x, y } = usePosition()`,
      after: `/** 返回装有 refs 的普通对象。 */
function usePosition() {
  const x = ref(0)
  const y = ref(0)
  return { x, y }
}

const { x, y } = usePosition()`,
    },
    {
      type: 'text',
      content:
        '若调用方确实偏好对象式访问，可以在调用处保留整个返回对象，或写 reactive(useCounter())；关键是不要先让 reactive 自动解包 ref，再把其中的基本值解构出来。',
    },
    { type: 'heading', content: '用 MaybeRefOrGetter 设计响应式输入' },
    {
      type: 'text',
      content:
        '可复用逻辑经常既要接受固定配置，又要跟随 ref 或 getter。MaybeRefOrGetter<T> 正好表达“普通值、ref 或无参 getter”三种输入，toValue() 在每次真正使用时把它们规范化为当前值。函数值会被当作 getter 执行，因此不要把普通回调误当成这种输入。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import type { MaybeRefOrGetter } from 'vue'
import { ref, toValue } from 'vue'

/** 创建按最新步长累加的计数器。 */
function useStepCounter(step: MaybeRefOrGetter<number>) {
  const count = ref(0)

  /** 在动作发生时读取当前步长。 */
  function increment() {
    count.value += toValue(step)
  }

  return { count, increment }
}

const step = ref(1)
const fixed = useStepCounter(2)
const direct = useStepCounter(step)
const doubled = useStepCounter(() => step.value * 2)`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`toValue()` 只返回调用当下的值，不会自动建立 watcher。把 toValue(step) 存在函数入口，只会留下一个快照；要让事件处理器使用最新值，就在事件发生时读取。',
    },
    { type: 'heading', content: '在 watch 或 watchEffect 中读取输入' },
    {
      type: 'text',
      content:
        '如果输入变化本身就要驱动逻辑重跑，应在 watch 的 getter 或 watchEffect 的同步执行段内调用 toValue()。watch 适合依赖来源明确、需要新旧值或精确触发的场景；watchEffect 适合逻辑自然读取多个依赖的场景。两者负责追踪，toValue 只负责规范化。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import type { MaybeRefOrGetter } from 'vue'
import { ref, toValue, watch, watchEffect } from 'vue'

/** 跟随单一输入维护规范化后的步长。 */
function useNormalizedStep(step: MaybeRefOrGetter<number>) {
  const normalizedStep = ref(0)

  watch(
    () => toValue(step),
    (value) => {
      normalizedStep.value = Math.max(1, value)
    },
    { immediate: true },
  )

  return { normalizedStep }
}

/** 跟随函数体同步读取到的全部输入维护摘要。 */
function useStepSummary(step: MaybeRefOrGetter<number>) {
  const summary = ref('')

  watchEffect(() => {
    summary.value = '当前步长：' + toValue(step)
  })

  return { summary }
}`,
    },
    {
      type: 'table',
      headers: ['需求', '选择', '读取位置'],
      rows: [
        ['按钮点击时使用最新输入', '事件处理函数', '处理动作时 toValue(input)'],
        ['一个明确输入变化后重跑', 'watch', 'getter 内 toValue(input)'],
        ['同步逻辑自然读取多个输入', 'watchEffect', 'effect 同步执行段内读取'],
        ['只需要当前值一次', '直接读取', '调用处 toValue(input)'],
      ],
    },
    { type: 'heading', content: '把外部副作用设计成可停止资源' },
    {
      type: 'text',
      content:
        'DOM listener、timer、Observer 和第三方订阅不由 Vue 自动释放。组合式函数应保存稳定 handler，让创建和清理走同一条路径；若资源允许暂停，再公开幂等 start / stop，重复调用不会重复注册或错误移除。浏览器资源放到 mounted 后建立，也能避开 SSR 没有 window 的阶段。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import type { MaybeRefOrGetter } from 'vue'
import { onMounted, onUnmounted, ref, toValue } from 'vue'

const tickEvent = 'composable-contract-lab:tick'

/** 创建按响应式步长累加、可暂停且自动清理的事件计数器。 */
function useEventCounter(step: MaybeRefOrGetter<number>) {
  const count = ref(0)
  const running = ref(false)

  /** 使用当前最新步长处理一次共享 tick。 */
  function handleTick() {
    count.value += toValue(step)
  }

  /** 幂等启动当前实例的事件订阅。 */
  function start() {
    if (running.value) return
    window.addEventListener(tickEvent, handleTick)
    running.value = true
  }

  /** 幂等停止当前实例的事件订阅。 */
  function stop() {
    if (!running.value) return
    window.removeEventListener(tickEvent, handleTick)
    running.value = false
  }

  /** 只重置当前实例的本地计数。 */
  function reset() {
    count.value = 0
  }

  onMounted(start)
  onUnmounted(stop)

  return { count, running, start, stop, reset }
}`,
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '不是所有副作用都必须放在 onMounted 中。同步创建的 watcher 可以直接归属当前组件 scope；网络逻辑也可能在调用期间启动。mounted 主要用于只能在客户端访问的 DOM/浏览器资源，以及需要与 unmounted 对称管理的资源。',
    },
    { type: 'heading', content: '同步调用决定生命周期与 effect 的归属' },
    {
      type: 'text',
      content:
        '依赖生命周期或组件 effect scope 的组合式函数，应在 <script setup> 或 setup() 的同步执行阶段调用。此时 Vue 能把生命周期钩子、watcher 和清理登记到当前组件。普通 async setup 在第一个 await 后可能已失去活动实例；<script setup> 顶层 await 能恢复上下文是编译器特例。',
    },
    {
      type: 'compare',
      labels: ['失去当前实例后再注册', '同步建立所有权'],
      before: `setTimeout(() => {
  useEventCounter(step)
}, 0)`,
      after: `const counter = useEventCounter(step)

onMounted(() => {
  console.log(counter.running.value)
})`,
    },
    {
      type: 'text',
      content:
        '组件卸载会停止在其活跃 scope 中同步创建的响应式 effects，但不会猜测如何移除应用自己创建的 listener。watcher cleanup 还会在下一轮重跑前执行，所以“失效时清理”和“组件卸载时清理”是两个互补时机。',
    },
    { type: 'heading', content: '每次调用、显式共享与 SSR 边界' },
    {
      type: 'text',
      content:
        '函数体内 ref 默认属于一次调用。把 ref 移到模块顶层会让所有调用共享它，这有时是有意的客户端单例，但在 SSR 中模块通常被多个请求复用，一个请求写入的用户状态可能被另一个请求读取。共享需求必须先确定所有者，再由每个 SSR 请求创建独立状态。',
    },
    {
      type: 'compare',
      labels: ['意外模块单例', '显式创建实例'],
      before: `const count = ref(0)

/** 返回所有调用共享的模块级状态。 */
function useSharedCounter() {
  return { count }
}`,
      after: `/** 为当前调用或当前请求创建计数状态。 */
function createCounterState() {
  const count = ref(0)
  return { count }
}

const requestCounter = createCounterState()`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        'SSR 不能简化成“所有 watcher 都运行”或“所有 watcher 都不运行”。Vue 3.5.40 会按 flush、immediate 和 API 类型走不同分支；本课只要求不在服务端 setup 直接访问 window，并避免跨请求模块级可变状态。',
    },
    { type: 'heading', content: '用唯一 Demo 验证组合式函数契约' },
    {
      type: 'text',
      content:
        '实验用同一个 useEventCounter 创建 A、B 两个实例。A 接收 step ref，B 接收 step * 2 getter；每次 tick 才读取最新输入。暂停 B 后 A 继续计数，重置 A 不影响 B，重复启停也不会重复注册监听。',
    },
    {
      type: 'demo',
      id: 'vue.core.learn.intermediate.composables.composable-contract-lab-demo',
      description: '验证响应式输入、普通对象返回 refs、独立实例和幂等启停清理',
      playground: true,
    },
    {
      type: 'steps',
      items: [
        {
          title: '先确认实例隔离',
          content: '初始 A、B 都是 0 且运行中；一次 tick 后，A 增加 1，B 增加 2。',
        },
        {
          title: '再确认输入没有被截成快照',
          content: '把基础步长设为 3，计数不会立即变化；下一次 tick 让 A 增加 3、B 增加 6。',
        },
        {
          title: '最后确认资源所有权',
          content: '停止 B 后 tick 只改变 A；重新启动 B 后每次仍只增加一次，重置 A 不影响 B。',
        },
      ],
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '1. 先取 .value，把响应式输入截成快照',
          description:
            '组合式函数若声明接受 MaybeRefOrGetter，就应接收 ref 或 getter 本身，而不是调用时的单个数字。',
          consequence: 'step 后续从 1 改为 3 时，组合式函数仍只知道首次传入的 1。',
          wrong: {
            lang: 'ts',
            content: `const step = ref(1)
const counter = useEventCounter(step.value)`,
          },
          correct: {
            lang: 'ts',
            content: `const step = ref(1)
const counterA = useEventCounter(step)
const counterB = useEventCounter(() => step.value * 2)`,
          },
        },
        {
          title: '2. 在 effect 外只调用一次 toValue，却期待持续追踪',
          description:
            'toValue 只规范化当前值。effect 必须在自己的同步执行段中读取 ref 或 getter，才能收集依赖。',
          consequence: 'watchEffect 只读取缓存的普通数字，step 变化后不会重新执行。',
          wrong: {
            lang: 'ts',
            content: `const initialStep = toValue(step)

watchEffect(() => {
  preview.value = initialStep
})`,
          },
          correct: {
            lang: 'ts',
            content: `watchEffect(() => {
  preview.value = toValue(step)
})`,
          },
        },
        {
          title: '3. 返回 reactive 对象后立即解构基本值',
          description: 'reactive 的响应性来自代理属性访问，普通解构会复制已自动解包的基本值。',
          consequence: '解构出的 count 停留在旧值，内部 ref 更新无法继续驱动使用它的视图。',
          wrong: {
            lang: 'ts',
            content: `/** 错误地返回会自动解包 ref 的 reactive 对象。 */
function useCounter() {
  const count = ref(0)
  return reactive({ count })
}

const { count } = useCounter()`,
          },
          correct: {
            lang: 'ts',
            content: `/** 返回普通对象，让 count 保持为 ref。 */
function useCounter() {
  const count = ref(0)
  return { count }
}

const { count } = useCounter()`,
          },
        },
        {
          title: '4. 在 await 或异步回调后注册生命周期钩子',
          description:
            '生命周期注册需要调用当下的活动组件实例，普通 async composable 不会自动恢复它。',
          consequence: '钩子可能无法归属组件并出现开发警告，外部资源也不会在卸载时清理。',
          wrong: {
            lang: 'ts',
            content: `/** 错误地把清理注册推迟到 await 之后。 */
async function useDelayedListener() {
  await Promise.resolve()
  onUnmounted(stop)
}`,
          },
          correct: {
            lang: 'ts',
            content: `/** 在组合式函数同步执行期间注册生命周期。 */
function useListener() {
  onMounted(start)
  onUnmounted(stop)
}`,
          },
        },
        {
          title: '5. 在 setup 根作用域访问 window，再依赖 SSR unmount 清理',
          description:
            '服务端没有 window，mounted 与 unmounted 也不在服务端渲染阶段执行。浏览器资源应延迟到客户端挂载。',
          consequence: 'SSR 可能直接抛出 window is not defined，需清理资源还可能在服务端长期残留。',
          wrong: {
            lang: 'ts',
            content: `window.addEventListener(tickEvent, handleTick)
onUnmounted(() => window.removeEventListener(tickEvent, handleTick))`,
          },
          correct: {
            lang: 'ts',
            content: `onMounted(start)
onUnmounted(stop)`,
          },
        },
        {
          title: '6. start 每次创建匿名 handler，stop 无法移除原监听',
          description:
            'removeEventListener 必须接收注册时的同一个函数引用；start 与 stop 还应处理重复调用。',
          consequence: '每次重启都会叠加监听，单次 tick 累加多次，卸载时也无法完整移除。',
          wrong: {
            lang: 'ts',
            content: `/** 每次启动都会注册一个新的匿名函数。 */
function start() {
  window.addEventListener(tickEvent, () => {
    count.value += toValue(step)
  })
}`,
          },
          correct: {
            lang: 'ts',
            content: `/** 幂等启动并复用稳定 handler。 */
function start() {
  if (running.value) return
  window.addEventListener(tickEvent, handleTick)
  running.value = true
}

/** 幂等移除同一个 handler。 */
function stop() {
  if (!running.value) return
  window.removeEventListener(tickEvent, handleTick)
  running.value = false
}`,
          },
        },
        {
          title: '7. 假定同一组合式函数的两次调用自动共享状态',
          description: '函数体内的 refs 每次调用都会重新创建，reset 与 stop 都只作用于当前实例。',
          consequence: '调用方把局部命令当成全局操作后，会得到与预期不同的计数和运行状态。',
          wrong: {
            lang: 'ts',
            content: `const counterA = useEventCounter(step)
const counterB = useEventCounter(step)

counterA.reset()
// 错误地期待 counterB.count 也归零`,
          },
          correct: {
            lang: 'ts',
            content: `const counterA = useEventCounter(step)
const counterB = useEventCounter(() => step.value * 2)

counterA.reset()
// counterB 保留自己的计数`,
          },
        },
        {
          title: '8. 为共享把可变 ref 放到模块顶层，忽略 SSR 跨请求污染',
          description: '服务端进程通常跨请求复用模块，模块顶层 ref 不是每个请求独有的状态。',
          consequence: '一个请求写入的用户数据可能被后续请求读取，形成跨请求污染或数据泄漏。',
          wrong: {
            lang: 'ts',
            content: `const count = ref(0)

/** 所有调用和服务端请求都返回同一个 ref。 */
function useCounter() {
  return { count }
}`,
          },
          correct: {
            lang: 'ts',
            content: `/** 默认在每次调用或每个请求中创建状态。 */
function useCounter() {
  const count = ref(0)
  return { count }
}`,
          },
        },
        {
          title: '9. 把指南中的最小 useFetch 当成完整生产请求方案',
          description:
            '教学片段只展示响应式输入，并未覆盖旧请求取消、竞态抑制、状态码和完整错误策略。',
          consequence: '输入快速变化时，较旧响应可能最后写回，覆盖新输入对应的结果。',
          wrong: {
            lang: 'ts',
            content: `watchEffect(() => {
  fetch(toValue(url))
    .then((response) => response.json())
    .then((result) => (data.value = result))
})`,
          },
          correct: {
            lang: 'ts',
            content: `watchEffect((onCleanup) => {
  const currentUrl = toValue(url)
  const controller = new AbortController()

  onCleanup(() => controller.abort())
  void loadCurrentUrl(currentUrl, controller.signal)
})`,
          },
        },
      ],
    },
    { type: 'heading', content: 'Vue 3.5.40 源码与官方测试的独立推导' },
    {
      type: 'text',
      content:
        '这一节只用固定版本源码解释公开契约，不把内部函数形状升级成未来版本承诺。公开文档说明该怎么用；源码与测试帮助回答当前版本为什么有这些边界。',
    },
    {
      type: 'steps',
      items: [
        {
          title: 'toValue 只执行一次分支读取',
          content:
            'ref.ts 对函数输入直接调用，对其他输入交给 unref；它没有创建 watcher。由此可推导：必须在事件、watch getter 或 effect 真正读取时调用，普通函数值也不适合作为 MaybeRefOrGetter 传入。',
        },
        {
          title: '同步 setup 让组件 scope 捕获响应式副作用',
          content:
            'component.ts 在设置当前实例时启用实例 EffectScope，renderer.ts 在组件卸载时 scope.stop()。因此同步创建的 watcher 会随组件停止，异步脱离 scope 后创建的 watcher不能一概而论。',
        },
        {
          title: 'onScopeDispose 只登记到当前活跃 scope',
          content:
            'effectScope.ts 只有在 activeEffectScope 存在时才登记 cleanup；stop 会停止 effects、执行 cleanups 并处理子 scope。底层 composable 可用它兼容组件和手工 scope，但仍必须同步注册。',
        },
        {
          title: 'watcher cleanup 不只发生在组件卸载',
          content:
            'watch.ts 会在 effect 重跑前和 stop 时执行上一轮 cleanup。异步副作用需要表达“本轮何时失效”，而不能只等待宿主组件最终卸载。',
        },
        {
          title: '生命周期注入依赖活跃实例',
          content:
            'apiLifecycle.ts 在没有 active component instance 时发出开发警告；SSR setup 只保留特定服务端钩子。DOM 资源采用 mounted 建立、unmounted 清理，但不能扩写成 SSR 所有生命周期一律不运行。',
        },
        {
          title: 'SSR watcher 存在独立调度分支',
          content:
            'apiWatch.ts 会按 flush、immediate 与 API 类型处理服务端 watcher；官方 ssrWatch 测试覆盖多种组合。课程因此只规定 SSR 资源和状态边界，不宣称 watcher 全部运行或全部跳过。',
        },
      ],
    },
    {
      type: 'code',
      lang: 'text',
      content: `调用 useFeature()
  -> 函数体创建本次调用的 refs
  -> setup 活跃 scope 捕获同步 effect
  -> mounted 建立客户端外部资源
  -> 输入变化：watcher cleanup 后重跑
  -> unmounted / scope.stop：停止 effect 并执行清理`,
    },
    { type: 'heading', content: '高级使用场景' },
    {
      type: 'table',
      headers: ['场景', '推荐设计', '避免的误读'],
      rows: [
        [
          '响应式参数适配器',
          '接受 MaybeRefOrGetter，并在真实读取处 toValue',
          '入口规范化一次就持续响应',
        ],
        ['可暂停资源订阅', '稳定 handler、幂等 start / stop、owner 清理', '每次启动都新增匿名订阅'],
        ['多个独立实例', '共享算法，各自拥有输入和状态', '同名 use 函数天然是单例'],
        ['组合多个 composables', '把一个返回的 ref 作为另一个输入', '依赖隐式全局属性名'],
        [
          '底层 scope 适配',
          '在活跃 scope 中用 onScopeDispose 登记 stop',
          '在无 owner 时假装自动清理',
        ],
        ['所有权升级', '先确定请求级、应用级或组件树级生命周期', '用模块级 ref 偶然共享'],
      ],
    },
    {
      type: 'exercise',
      title: '实现可响应步长、可暂停的独立计数器',
      instructions:
        '新建 useEventCounter.ts：接收 MaybeRefOrGetter<number>，返回普通对象中的 count、running、start、stop、reset。使用稳定事件 handler，每次 tick 才调用 toValue(step)，mounted 自动启动，unmounted 复用 stop。页面分别用 step ref 与 step * 2 getter 创建 A、B；验证改步长不立即计数、停止 B 不影响 A、重置 A 不影响 B。',
      answer: `import type { MaybeRefOrGetter } from 'vue'
import { onMounted, onUnmounted, ref, toValue } from 'vue'

export const counterTickEvent = 'composable-contract-lab:tick'

/** 创建一个按响应式步长累加、可暂停且自动清理的事件计数器。 */
export function useEventCounter(step: MaybeRefOrGetter<number>) {
  const count = ref(0)
  const running = ref(false)

  /** 使用最新步长处理一次 tick。 */
  function handleTick() {
    count.value += toValue(step)
  }

  /** 幂等启动当前实例。 */
  function start() {
    if (running.value) return
    window.addEventListener(counterTickEvent, handleTick)
    running.value = true
  }

  /** 幂等停止当前实例。 */
  function stop() {
    if (!running.value) return
    window.removeEventListener(counterTickEvent, handleTick)
    running.value = false
  }

  /** 只重置当前实例。 */
  function reset() {
    count.value = 0
  }

  onMounted(start)
  onUnmounted(stop)

  return { count, running, start, stop, reset }
}`,
    },
    {
      type: 'checklist',
      items: [
        { label: '能区分无状态工具函数与拥有 Vue 状态或副作用的组合式函数' },
        { label: '组合式函数使用 use 前缀，并在 setup 同步执行阶段调用' },
        { label: '每次调用在函数体内创建独立 refs，不把共享算法误当成共享数据' },
        { label: '返回普通对象中的 refs，调用方解构后仍保留响应性' },
        { label: 'MaybeRefOrGetter 输入在实际读取位置通过 toValue 规范化' },
        { label: '需要持续追踪时，由 watch 或 watchEffect 建立响应式 effect' },
        { label: '浏览器副作用使用稳定 handler、幂等 start / stop 和对称清理' },
        { label: '能区分 watcher 失效清理、组件卸载清理与手工 scope 清理' },
        { label: 'SSR 不直接访问浏览器 API，也不默认共享模块级可变状态' },
      ],
    },
    { type: 'heading', content: '完成本课后的判断顺序' },
    {
      type: 'text',
      content:
        '先判断逻辑是否拥有响应式状态或副作用；若有，再确定每次调用的状态边界。输入可能变化时保留 ref/getter，并在动作或 effect 真正读取处 toValue；返回多个状态时使用普通对象中的 refs。最后列出所有外部资源，给它们稳定 handler、幂等启停和明确 owner，再检查 SSR 是否会触碰浏览器 API 或跨请求单例。',
    },
  ],
  recap: [
    '组合式函数是封装和复用有状态逻辑的普通函数；无状态转换继续使用工具函数。',
    'use 前缀是生态约定，依赖组件上下文的组合式函数应在 setup 同步阶段调用。',
    '函数体内创建的 refs 默认属于一次调用，两次调用共享算法但拥有独立状态。',
    '返回装有 refs 的普通对象，调用方解构后仍保持响应式连接。',
    'MaybeRefOrGetter 接受普通值、ref 或 getter，toValue 只读取调用当下的值。',
    '需要持续响应输入时，要在 watch getter 或 watchEffect 同步执行段中读取。',
    'DOM listener 等外部资源需要稳定 handler、幂等 start / stop 与对称清理。',
    '同步 watcher 可由组件 scope 管理；外部资源和异步失效仍需显式 cleanup。',
    '模块级 ref 会改变所有权，在 SSR 中可能跨请求污染，不应作为默认共享方案。',
  ],
})
