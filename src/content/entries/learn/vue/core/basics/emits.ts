/**
 * 课程：Emits
 * 查证日期：2026-07-30
 * 适用版本：Vue 3.5.40
 * 查证工具：Tavily、Vue 中文/英文官网、官方 RFC 与 vuejs/core v3.5.40 固定标签源码
 */
import { defineLesson, defineLessonMeta } from '@/content/schema'

export const meta = defineLessonMeta({
  id: 'vue.core.learn.basics.emits',
  type: 'lesson',
  title: 'Emits',
  summary: '声明子到父的组件事件，让子组件报告意图并由父组件更新状态',
  ecosystem: 'vue',
  module: 'core',
  collection: 'basics',
  level: 'beginner',
  prerequisites: ['vue.core.learn.basics.props'],
  related: ['vue.core.learn.basics.props', 'vue.core.reference.components.emits'],
  tags: ['Emits', 'defineEmits', '组件事件', '事件载荷', '父子通信'],
  sources: [
    {
      title: 'Vue 组件事件',
      url: 'https://cn.vuejs.org/guide/components/events.html',
    },
    {
      title: 'Vue TypeScript 与组合式 API',
      url: 'https://cn.vuejs.org/guide/typescript/composition-api.html#typing-component-emits',
    },
    {
      title: 'Vue script setup',
      url: 'https://cn.vuejs.org/api/sfc-script-setup.html#defineprops-defineemits',
    },
    {
      title: 'Vue RFC 0030 Emits Option',
      url: 'https://github.com/vuejs/rfcs/blob/master/active-rfcs/0030-emits-option.md',
    },
    {
      title: 'Vue 3.5.40 defineEmits.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/script/defineEmits.ts',
    },
    {
      title: 'Vue 3.5.40 defineEmits.spec.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/__tests__/compileScript/defineEmits.spec.ts',
    },
    {
      title: 'Vue 3.5.40 componentEmits.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentEmits.ts',
    },
    {
      title: 'Vue 3.5.40 componentEmits.spec.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/componentEmits.spec.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-07-30',
  estimatedMinutes: 40,
})

export default defineLesson({
  meta,
  objectives: [
    '把 Props 向下和 Emits 向上解释为同一条父子组件通信回路',
    '用 TypeScript 具名元组声明有载荷与无载荷组件事件',
    '在子组件调用 emit，并在父模板监听事件和接收载荷',
    '说明 emit 不会自动修改 prop 或父级状态，更新权仍属于父组件',
    '统一脚本 camelCase 事件名与父模板 kebab-case 监听器名称',
    '预测直接父级、祖先组件和显式转发三种情况下谁能收到事件',
    '区分 TypeScript 静态契约与运行时 validator 的开发期诊断',
    '识别 .once 与组件卸载所形成的实例生命周期边界',
  ],
  blocks: [
    { type: 'heading', content: '从 Props 的单向输入继续前进' },
    {
      type: 'text',
      content:
        '上一课已经建立了父到子的 Props 输入：父组件拥有数量，子组件只能读取并显示。现在子组件又有了“增加”“减少”和“重置”按钮，它需要一条公开的输出通道来报告用户意图。Emits 正是子到父的组件事件契约，但最终是否更新状态仍由父组件决定。',
    },
    {
      type: 'code',
      lang: 'text',
      content: `        直接父组件 quantity
          │          ▲
Props 向下│          │Emits 向上
          ▼          │
      CourseActionPanel`,
    },
    {
      type: 'table',
      headers: ['角色', '负责什么', '不应做什么'],
      rows: [
        ['父组件', '保存状态、监听事件、接受或拒绝请求', '把更新权偷偷交给子组件'],
        ['子组件', '呈现操作并发出带载荷的意图', '直接改写 prop 或假设请求一定成功'],
        ['事件契约', '声明事件名、参数数量和参数类型', '自动替任一组件保存状态'],
      ],
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '本课边界只覆盖普通父子组件事件。Slots、Attrs、组件 v-model 与 Provide/Inject 属于其他通信主题，不进入本课示例、练习或 Demo。',
    },
    { type: 'heading', content: '用具名元组声明组件输出' },
    {
      type: 'text',
      content:
        '`defineEmits()` 是 `<script setup>` 编译器宏，无需导入。它声明当前组件可以发出的事件，并返回绑定到当前组件实例的 `emit` 函数。本课统一使用 TypeScript 具名元组：属性名是事件名，元组描述事件名之后的全部参数。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<script setup lang="ts">
const props = defineProps<{
  quantity: number
}>()

const emit = defineEmits<{
  changeRequest: [delta: number]
  resetRequest: []
}>()

/** 请求父组件增加一个单位。 */
function requestIncrease() {
  emit('changeRequest', 1)
}

/** 请求父组件减少一个单位。 */
function requestDecrease() {
  emit('changeRequest', -1)
}

/** 请求父组件恢复初始数量。 */
function requestReset() {
  emit('resetRequest')
}
</script>

<template>
  <section>
    <p>父级传入的当前数量：{{ props.quantity }}</p>
    <button type="button" @click="requestDecrease">请求减少</button>
    <button type="button" @click="requestIncrease">请求增加</button>
    <button type="button" @click="requestReset">请求重置</button>
  </section>
</template>`,
    },
    {
      type: 'table',
      headers: ['声明', '合法调用', '契约含义'],
      rows: [
        ['changeRequest: [delta: number]', "emit('changeRequest', 1)", '必须带一个 number 载荷'],
        ['resetRequest: []', "emit('resetRequest')", '不接收载荷'],
        ['事件名不在声明中', "emit('saveRequest')", 'TypeScript 报告未知事件名'],
        ['载荷数量或类型不匹配', "emit('changeRequest', '1')", 'TypeScript 报告参数错误'],
      ],
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`emit()` 只报告事件。它不会修改 `props.quantity`，也不会自动找到父级的某个变量并赋值。',
    },
    { type: 'heading', content: '父模板监听，父级处理载荷' },
    {
      type: 'text',
      content:
        '父组件在直接子组件标签上使用 `v-on`，简写为 `@`。传入函数引用时，Vue 会把事件名之后的全部参数按原顺序交给该函数。父 handler 因而可以计算候选值、执行边界判断，再决定是否更新自己拥有的状态。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<script setup lang="ts">
import { ref } from 'vue'
import CourseActionPanel from './CourseActionPanel.vue'

const initialQuantity = 2
const minimum = 0
const maximum = 5
const quantity = ref(initialQuantity)

/** 接受合法变化请求，并由父级更新数量。 */
function applyChange(delta: number) {
  const candidate = quantity.value + delta
  if (candidate < minimum || candidate > maximum) return
  quantity.value = candidate
}

/** 由父级决定把数量恢复为初始值。 */
function resetQuantity() {
  quantity.value = initialQuantity
}
</script>

<template>
  <CourseActionPanel
    :quantity="quantity"
    @change-request="applyChange"
    @reset-request="resetQuantity"
  />
</template>`,
    },
    {
      type: 'compare',
      labels: ['丢失载荷', '把载荷交给处理函数'],
      before: `<CourseActionPanel @change-request="applyChange()" />`,
      after: `<CourseActionPanel @change-request="applyChange" />`,
    },
    {
      type: 'text',
      content:
        '也可以写 `@change-request="(delta) => applyChange(delta)"`，或用 `$event` 读取首个参数。对已经匹配签名的 handler，函数引用最直接；不要立即执行一个无参调用后又期待 Vue 自动补回载荷。',
    },
    { type: 'heading', content: '请求不等于状态已经更新' },
    {
      type: 'text',
      content:
        '事件名应描述子级正在请求什么，而不是假装状态已经改变。子级发出 `changeRequest(1)` 后，父级可以接受、拒绝、延迟或转换这个请求。只有父级真正更新 `quantity` 后，新值才会沿 Props 再次向下刷新子组件。',
    },
    {
      type: 'table',
      headers: ['顺序', '发生的位置', '可观察结果'],
      rows: [
        ['1', '子组件点击“请求增加”', 'emit 发出 changeRequest(1)'],
        ['2', '直接父级 handler', '计算候选值并判断是否越界'],
        ['3A', '父级接受请求', '更新 quantity，Props 向下刷新'],
        ['3B', '父级拒绝请求', 'quantity 不变，子级继续显示旧 prop'],
      ],
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '如果子级在 `emit()` 后立刻读取 prop，它仍可能看到父级更新前的值。不要把 emit 当成同步赋值表达式，也不要为此在子级保存第二份业务状态。',
    },
    { type: 'heading', content: '在 Emits 意图回路实验台观察裁决' },
    {
      type: 'text',
      content:
        '下面的唯一 Demo 把数量、允许范围与接受或拒绝计数都保留在父组件。先发出合法增减请求，再达到上限后继续请求增加，观察父级拒绝时数量不变；最后让父级直接设为最小值，确认子级只通过最新 prop 被动刷新。',
    },
    {
      type: 'demo',
      id: 'vue.core.learn.basics.emits.emits-intent-flow-demo',
      description: '由子组件报告增减或重置意图，观察父级裁决并通过 Props 回传最终状态',
      playground: true,
    },
    { type: 'heading', content: '统一脚本与模板中的事件名称' },
    {
      type: 'text',
      content:
        '官方支持在脚本中发出 camelCase 事件，并推荐父 SFC 模板使用 kebab-case 监听。固定这一套约定后，声明、调用和监听能清楚对应，也能减少 HTML 大小写规则带来的混淆。',
    },
    {
      type: 'table',
      headers: ['位置', '推荐写法', '说明'],
      rows: [
        ['子组件声明', 'changeRequest', 'TypeScript 属性名使用 camelCase'],
        ['子组件调用', "emit('changeRequest', 1)", '与声明使用同一个字符串'],
        ['父 SFC 模板', '@change-request="applyChange"', '监听器使用 kebab-case'],
      ],
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<script setup lang="ts">
const emit = defineEmits<{
  courseSelected: [courseId: string]
}>()

/** 报告学习者选中的课程。 */
function selectCourse() {
  emit('courseSelected', 'vue-basics')
}
</script>

<template>
  <button type="button" @click="selectCourse">选择课程</button>
</template>

<!-- 父组件模板 -->
<CoursePicker @course-selected="openCourse" />`,
    },
    { type: 'heading', content: '载荷按位置传递，复杂数据优先用对象' },
    {
      type: 'text',
      content:
        '`emit()` 会把事件名之后的每个参数原样、按位置交给监听器。单个 `delta` 足够清楚；当一个公开事件需要多个相关字段时，使用一个具名对象通常更容易阅读和演进，避免调用方靠记忆维护参数顺序。',
    },
    {
      type: 'compare',
      labels: ['多个位置参数', '单个具名对象'],
      before: `const emit = defineEmits<{
  actionRequest: [courseId: string, delta: number, source: string]
}>()

emit('actionRequest', 'course-1', 1, 'toolbar')`,
      after: `interface ActionRequest {
  courseId: string
  delta: number
  source: 'toolbar' | 'keyboard'
}

const emit = defineEmits<{
  actionRequest: [request: ActionRequest]
}>()

emit('actionRequest', {
  courseId: 'course-1',
  delta: 1,
  source: 'toolbar',
})`,
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '对象载荷不是 Vue 的强制规则。只有字段确实一起表达一个意图时才组合；基础增减事件继续使用一个 number，保持接口最小。',
    },
    { type: 'heading', content: '组件事件只通知直接父级' },
    {
      type: 'text',
      content:
        '组件事件不会像原生 DOM 事件那样沿组件树冒泡。Vue 从当前子组件的 VNode 上查找直接父级提供的监听器并调用；祖先组件不能跳过中间组件监听深层子组件发出的事件。',
    },
    {
      type: 'code',
      lang: 'text',
      content: `GrandParent
    │ 监听 MiddlePanel 自己公开的事件
    ▼
MiddlePanel
    │ 必须显式监听并重新 emit
    ▼
CourseActionPanel 发出 changeRequest`,
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<script setup lang="ts">
import CourseActionPanel from './CourseActionPanel.vue'

const emit = defineEmits<{
  changeRequest: [delta: number]
}>()

/** 把直接子组件的变化请求重新声明并转发给上一层。 */
function forwardChange(delta: number) {
  emit('changeRequest', delta)
}
</script>

<template>
  <CourseActionPanel @change-request="forwardChange" />
</template>`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '显式转发意味着中间组件也要为自己的公共事件声明名称和载荷。不要把“祖先碰巧能收到”当成组件事件模型。',
    },
    { type: 'heading', content: '类型声明与运行时 validator 各管一层' },
    {
      type: 'text',
      content:
        '具名元组给 TypeScript 和编辑器提供事件名、参数数量与参数类型检查。编译器会从这些类型 key 生成运行时事件名单，但不会把任意 TypeScript 载荷类型变成浏览器中的数据校验器。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const emit = defineEmits<{
  submitRequest: [payload: { email: string }]
}>()

// 这里能检查本地 TypeScript 调用，但不会在生产运行时解析任意外部数据。
emit('submitRequest', { email: 'learner@example.com' })`,
    },
    {
      type: 'text',
      content:
        '确实需要开发期运行时诊断时，可以改用对象声明并提供 validator。类型参数与运行时参数不能在同一次 `defineEmits()` 中混用。更重要的是，validator 返回 `false` 只会发出开发期警告，Vue 仍会继续查找并调用父监听器。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `/** 判断变化请求是否正好为一个单位。 */
function isUnitChange(delta: number) {
  return Math.abs(delta) === 1
}

const emit = defineEmits({
  changeRequest: isUnitChange,
  resetRequest: null,
})

/** 在真正的业务条件满足后再报告请求。 */
function requestChange(delta: number) {
  if (!isUnitChange(delta)) return
  emit('changeRequest', delta)
}`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        'validator 适合帮助组件作者发现错误调用，不适合阻止保存、替代权限判断或清洗生产数据。真正需要拒绝的操作必须由 emit 前的守卫或父级业务 handler 决定。',
    },
    { type: 'heading', content: '认识实例级的 once 与卸载边界' },
    {
      type: 'text',
      content:
        '父模板可以用 `.once` 只响应某个已挂载子组件实例的第一次事件。Vue 把是否触发过记录在该组件实例上；组件被销毁并重新创建后，新实例会有新的记录。因此 `.once` 不是跨页面或全局会话的幂等机制。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<CourseLoader @ready.once="recordFirstReady" />`,
    },
    {
      type: 'text',
      content:
        '组件卸载后，Vue 会忽略该实例晚到的 `emit()`。异步子组件仍应在卸载时取消任务或丢弃过期结果，因为事件不是保证送达的消息队列；不要依赖一个已经销毁的组件完成父级收尾。',
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '认为 emit 会自动修改父状态或 prop',
          description: '事件只报告意图，状态所有权不会因为调用 emit 而转移到子组件。',
          consequence: '子级立即读取旧 prop，或再保存一份本地状态，最终让父级与子级显示彼此分叉。',
          wrong: {
            lang: 'ts',
            content: `emit('changeRequest', 1)
// 错误假设：props.quantity 此刻已经增加`,
          },
          correct: {
            lang: 'ts',
            content: `/** 由父级接受请求并更新自己拥有的状态。 */
function applyChange(delta: number) {
  quantity.value += delta
}`,
          },
        },
        {
          title: '期待组件事件像 DOM 事件一样冒泡',
          description: '组件事件只查找直接父级提供的监听器，不会自动穿过中间组件。',
          consequence: '祖先监听器静默不执行，关键业务请求没有被处理。',
          wrong: {
            lang: 'vue',
            content: `<!-- 误以为深层子事件会自动到达这里 -->
<MiddlePanel @change-request="applyChange" />`,
          },
          correct: {
            lang: 'vue',
            content: `<!-- MiddlePanel 显式监听后，重新发出自己的事件 -->
<CourseActionPanel @change-request="forwardChange" />`,
          },
        },
        {
          title: '声明、调用和监听使用不同事件名',
          description: '没有统一 camelCase 与 kebab-case 的位置，事件契约很难对应。',
          consequence: 'TypeScript 报未知事件，或父模板监听不到实际发出的名称。',
          wrong: {
            lang: 'vue',
            content: `emit('change-request', 1)
<CourseActionPanel @changerequest="applyChange" />`,
          },
          correct: {
            lang: 'vue',
            content: `emit('changeRequest', 1)
<CourseActionPanel @change-request="applyChange" />`,
          },
        },
        {
          title: '立即调用无参函数并期待收到载荷',
          description: '函数引用与模板表达式调用不是同一种监听写法。',
          consequence: 'handler 收到 undefined，数值计算可能产生 NaN 或进入错误分支。',
          wrong: {
            lang: 'vue',
            content: `<CourseActionPanel @change-request="applyChange()" />`,
          },
          correct: {
            lang: 'vue',
            content: `<CourseActionPanel @change-request="applyChange" />`,
          },
        },
        {
          title: '多个位置参数靠记忆维护顺序',
          description: 'Vue 只按原顺序转发参数，不会根据形参名称重新匹配字段。',
          consequence: '父级可能把课程 ID 当作变化量，较宽类型还会掩盖错误。',
          wrong: {
            lang: 'ts',
            content: `emit('actionRequest', 1, 'course-1')
// 父级却按 (courseId, delta) 读取`,
          },
          correct: {
            lang: 'ts',
            content: `emit('actionRequest', {
  courseId: 'course-1',
  delta: 1,
})`,
          },
        },
        {
          title: '在一次 defineEmits 中混合两种声明',
          description: '类型参数与运行时参数是互斥入口，重复调用宏也不是叠加安全性。',
          consequence: 'SFC 编译直接失败，组件无法进入运行时。',
          wrong: {
            lang: 'ts',
            content: `defineEmits<{ changeRequest: [delta: number] }>({
  changeRequest: isUnitChange,
})`,
          },
          correct: {
            lang: 'ts',
            content: `const emit = defineEmits<{
  changeRequest: [delta: number]
}>()`,
          },
        },
        {
          title: '认为 validator false 会阻止监听器执行',
          description: '运行时 validator 是开发期诊断，失败后 emit 流程仍继续。',
          consequence: '无效载荷仍进入父 handler，可能修改状态或触发后续操作。',
          wrong: {
            lang: 'ts',
            content: `const emit = defineEmits({
  changeRequest: (delta: number) => delta !== 0,
})
emit('changeRequest', 0)`,
          },
          correct: {
            lang: 'ts',
            content: `/** 在发出事件前拒绝无效变化。 */
function requestChange(delta: number) {
  if (delta === 0) return
  emit('changeRequest', delta)
}`,
          },
        },
        {
          title: '认为 TypeScript 类型会变成运行时校验',
          description: '编译器只从类型声明提取事件名，不会生成任意载荷结构的 validator。',
          consequence: 'any、JavaScript 调用方或未解析外部数据仍能把坏值送入监听器。',
          wrong: {
            lang: 'ts',
            content: `// 错误假设：浏览器会验证 email 字段
const emit = defineEmits<{
  submitRequest: [payload: { email: string }]
}>()`,
          },
          correct: {
            lang: 'ts',
            content: `// 在真实输入边界先完成解析，再交给类型化事件
const payload = parseSubmitPayload(rawInput)
emit('submitRequest', payload)`,
          },
        },
      ],
    },
    { type: 'heading', content: '从 Vue 3.5.40 源码推导适用场景' },
    {
      type: 'steps',
      items: [
        {
          title: '宏最终绑定当前组件实例的 emit',
          content:
            '`processDefineEmits()` 记录声明和接收变量，编译结果把本地 `emit` 绑定到 setup context。它不是普通运行时工厂，应在每个子 SFC 顶层声明一次公共输出。',
        },
        {
          title: '运行时声明与类型声明保持二选一',
          content:
            '编译器发现同一次宏调用同时包含类型参数和运行时参数时会报错，重复调用也会报错。基础主线选具名元组，需要 validator 时整段切换为对象声明。',
        },
        {
          title: '类型声明只生成运行时事件名单',
          content:
            '`extractRuntimeEmits()` 从类型 key 或调用签名收集名称，`genRuntimeEmits()` 生成数组。载荷类型只服务静态检查，不会变成生产运行时数据解析器。',
        },
        {
          title: 'validator 失败后仍继续调用监听器',
          content:
            '运行时在开发分支调用 validator，失败时发出 warning，却不会从 emit 流程返回。业务拒绝必须写在 emit 前的守卫或父 handler 中。',
        },
        {
          title: '监听器从当前 VNode 直接解析',
          content:
            '普通组件事件从当前实例 VNode props 中查找原名或 camelize 后的 handler key 并直接调用，没有祖先遍历，因此事件不会冒泡。',
        },
        {
          title: 'once 记录属于单个组件实例',
          content:
            '运行时把 once handler 是否执行过保存在 `instance.emitted`。同一实例只触发一次，销毁后重建的新实例会重新开始，不能承担跨实例幂等。',
        },
        {
          title: '卸载后的 emit 会被忽略',
          content:
            '`emit()` 入口发现实例已经卸载就直接返回。异步组件应取消过期工作或忽略旧结果，不能把事件当成保证送达的收尾消息。',
        },
      ],
    },
    {
      type: 'exercise',
      title: '完成带父级裁决的数量操作面板',
      instructions:
        '创建父组件与 `CourseActionPanel.vue`。父级保存 `quantity = 2`、最小值 0 和最大值 5；子级通过 Props 显示当前数量，并用 TypeScript 具名元组声明 `changeRequest(delta)` 与无载荷 `resetRequest`。父级监听请求，合法时更新数量，越界时保持原值。分别验证增加、减少、越界拒绝和重置，确认子级从不修改 prop。',
      answer: `<!-- CourseActionPanel.vue -->
<script setup lang="ts">
const props = defineProps<{
  quantity: number
}>()

const emit = defineEmits<{
  changeRequest: [delta: number]
  resetRequest: []
}>()

/** 请求父组件增加一个单位。 */
function requestIncrease() {
  emit('changeRequest', 1)
}

/** 请求父组件减少一个单位。 */
function requestDecrease() {
  emit('changeRequest', -1)
}

/** 请求父组件恢复初始数量。 */
function requestReset() {
  emit('resetRequest')
}
</script>

<template>
  <section>
    <p>当前数量：{{ props.quantity }}</p>
    <button type="button" @click="requestDecrease">请求减少</button>
    <button type="button" @click="requestIncrease">请求增加</button>
    <button type="button" @click="requestReset">请求重置</button>
  </section>
</template>

<!-- StudyPage.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import CourseActionPanel from './CourseActionPanel.vue'

const initialQuantity = 2
const minimum = 0
const maximum = 5
const quantity = ref(initialQuantity)

/** 接受未越界的子级请求，并更新父级数量。 */
function applyChange(delta: number) {
  const candidate = quantity.value + delta
  if (candidate < minimum || candidate > maximum) return
  quantity.value = candidate
}

/** 由父级把数量恢复为初始值。 */
function resetQuantity() {
  quantity.value = initialQuantity
}
</script>

<template>
  <p>允许范围：{{ minimum }} 到 {{ maximum }}</p>
  <CourseActionPanel
    :quantity="quantity"
    @change-request="applyChange"
    @reset-request="resetQuantity"
  />
</template>`,
    },
    {
      type: 'checklist',
      items: [
        { label: '父级用 Props 向下传当前状态，子级只读消费' },
        { label: '子级用 TypeScript 具名元组声明事件名和载荷' },
        { label: '无载荷事件使用空元组，不传虚构的 undefined' },
        { label: '脚本事件名使用 camelCase，父 SFC 模板监听使用 kebab-case' },
        { label: '父 handler 接收载荷，并由父级接受或拒绝请求' },
        { label: '跨一层时由中间组件显式监听、声明并重新 emit' },
        { label: 'validator 只作为开发期诊断，业务守卫独立存在' },
        { label: 'TypeScript 事件类型不替代真实运行时输入校验' },
      ],
    },
    { type: 'heading', content: '完成本课后的判断顺序' },
    {
      type: 'text',
      content:
        '设计父子交互时，先确定谁拥有状态，再给子组件需要报告的意图命名，最后为载荷选择最小且清楚的结构。只要始终沿着“子级请求、父级裁决、Props 回流”检查，就能避免把事件写成隐式状态通道。',
    },
  ],
  recap: [
    'Props 把父级拥有的状态向下传，Emits 把子级产生的操作意图向上报告。',
    'TypeScript 具名元组同时约束事件名、参数数量和参数类型，无载荷事件使用空元组。',
    '父模板监听直接子组件事件并接收载荷，最终状态更新仍由父组件执行。',
    'emit 不会自动修改 prop 或父状态；父级更新后，新值才会通过 Props 刷新子级。',
    '组件事件不会冒泡，跨层需要中间组件显式监听并重新发出自己的事件。',
    '脚本中的事件名使用 camelCase，父 SFC 模板监听器使用 kebab-case。',
    'validator 返回 false 只发出开发期警告，不会阻止监听器继续执行。',
    'TypeScript 声明不是运行时校验，once 与卸载行为也只在组件实例生命周期内成立。',
  ],
})
