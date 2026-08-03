/**
 * 课程：模板引用
 * 查证日期：2026-07-31
 * 适用版本：Vue 3.5.40
 * 查证工具：Tavily、Vue 中文官网与 vuejs/core v3.5.40 固定标签源码和测试
 */
import { defineLesson, defineLessonMeta } from '@/content/schema'

export const meta = defineLessonMeta({
  id: 'vue.core.learn.intermediate.template-refs',
  type: 'lesson',
  title: '模板引用',
  summary: '在正确的渲染时机访问 DOM 元素与子组件公开实例，并处理条件和列表引用',
  ecosystem: 'vue',
  module: 'core',
  collection: 'intermediate',
  level: 'intermediate',
  prerequisites: ['vue.core.learn.intermediate.lifecycle-update-timing'],
  related: [
    'vue.core.learn.intermediate.lifecycle-update-timing',
    'vue.core.reference.composition.template-refs',
    'vue.core.reference.components.props',
    'vue.core.reference.components.emits',
  ],
  tags: ['模板引用', 'useTemplateRef', 'defineExpose', 'v-for', 'DOM', '组件实例'],
  sources: [
    {
      title: 'Vue 模板引用指南',
      url: 'https://cn.vuejs.org/guide/essentials/template-refs.html',
    },
    {
      title: 'Vue useTemplateRef',
      url: 'https://cn.vuejs.org/api/composition-api-helpers.html#usetemplateref',
    },
    {
      title: 'Vue ref 特殊 attribute',
      url: 'https://cn.vuejs.org/api/built-in-special-attributes.html#ref',
    },
    {
      title: 'Vue TypeScript 模板引用',
      url: 'https://cn.vuejs.org/guide/typescript/composition-api.html#typing-template-refs',
    },
    {
      title: 'Vue SSR 生命周期',
      url: 'https://cn.vuejs.org/guide/scaling-up/ssr.html#component-lifecycle-hooks',
    },
    {
      title: 'Vue 3.5.40 useTemplateRef.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/useTemplateRef.ts',
    },
    {
      title: 'Vue 3.5.40 rendererTemplateRef.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/rendererTemplateRef.ts',
    },
    {
      title: 'Vue 3.5.40 template ref tests',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/rendererTemplateRef.spec.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-07-31',
  estimatedMinutes: 50,
})

export default defineLesson({
  meta,
  objectives: [
    '区分响应式 ref()、模板 ref attribute 与 useTemplateRef() 的职责',
    '用 null、目标、null 的时间线解释引用何时可用',
    '在状态更新后 await nextTick，再执行依赖新 DOM 的命令',
    '判断聚焦、滚动、测量等命令是否真的需要 DOM 引用',
    '通过 defineExpose 为组件公开最小命令接口',
    '把 v-for 引用数组当作当前目标集合，而不是业务顺序',
    '用函数 ref 和稳定业务 ID 维护元素 Map',
    '解释 v-if 与 v-show 对引用寿命的不同影响',
    '为元素、组件和动态目标保留正确的 TypeScript 空值边界',
    '把 SSR 中的 DOM 操作留到客户端挂载或 hydration 之后',
  ],
  blocks: [
    { type: 'heading', content: '正文大纲' },
    {
      type: 'text',
      content:
        '上一课已经建立组件生命周期与 DOM 更新时机。本课只解决一个更具体的问题：声明式渲染不能完成聚焦、测量或调用子组件命令时，怎样取得当前真实目标，并让引用跟随它的挂载、更新和卸载。',
    },
    {
      type: 'table',
      headers: ['部分', '核心问题', '完成标志'],
      rows: [
        ['三个 ref 概念', '状态、模板标记和引用句柄分别做什么', '不会把同名概念混用'],
        ['引用时间线', '为什么类型始终包含 null', '能预测挂载和卸载结果'],
        ['DOM 命令', '何时需要 nextTick', '先修改、再等待、再操作'],
        ['组件公开实例', '父组件可以调用什么', '只公开窄命令'],
        ['列表引用', '数组和业务身份如何分开', '按需要选择数组或 Map'],
        ['条件与环境', 'v-if、类型和 SSR 改变什么', '保留运行时判断'],
      ],
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '本课不重新讲解完整生命周期或 nextTick 调度，也不扩展为动态组件、异步组件、KeepAlive、Suspense、Teleport、Transition、SSR 架构、观察器、焦点陷阱、编辑器或图表库课程。Props、Emits、组件 v-model、Provide/Inject 和 store 仍是数据流工具，模板引用不能取代它们。',
    },
    { type: 'heading', content: '先分清三个 ref 概念' },
    {
      type: 'text',
      content:
        '`ref()` 创建业务响应式状态；模板中的 `ref="search-input"` 是由 Vue 消费的特殊 attribute；`useTemplateRef("search-input")` 返回渲染器负责同步的只读浅层引用。三者名字相似，但所有者和用途不同。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'

const enabled = ref(true)
const inputElement = useTemplateRef<HTMLInputElement>('search-input')

/** 聚焦当前已经挂载的搜索输入框。 */
function focusSearchInput() {
  inputElement.value?.focus()
}
</script>

<template>
  <input v-if="enabled" ref="search-input" />
  <button type="button" @click="focusSearchInput">聚焦</button>
</template>`,
    },
    {
      type: 'table',
      headers: ['写法', '谁维护', '值是什么'],
      rows: [
        ['ref(true)', '业务代码读写', '响应式业务状态'],
        ['ref="search-input"', 'Vue 编译与渲染流程', '目标的登记名称'],
        [
          'useTemplateRef("search-input")',
          '业务读取、渲染器写入',
          'Readonly<ShallowRef<T | null>>',
        ],
      ],
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '模板 ref 是 Vue 的特殊 attribute，不会作为 `ref="search-input"` 留在最终 DOM。需要供 CSS、测试或查询使用的标识时，单独声明 id、data-* 或语义化选择器。',
    },
    { type: 'heading', content: '用 null 时间线理解引用' },
    {
      type: 'text',
      content:
        '模板引用不是 setup 时查询 DOM 的结果，而是渲染器在目标存在时写入的结果。`T | null` 对应真实运行状态：setup 和 SSR 时没有目标，客户端挂载后得到元素或公开实例，目标被 v-if 移除或组件卸载后又回到 null。',
    },
    {
      type: 'code',
      lang: 'text',
      content: `setup / SSR        客户端挂载完成         v-if 移除 / 卸载
    null      ─────────► 目标元素或实例 ─────────► null`,
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'

const inputElement = useTemplateRef<HTMLInputElement>('search-input')

/** 在客户端首次挂载后尝试聚焦当前目标。 */
function focusMountedInput() {
  inputElement.value?.focus()
}

onMounted(focusMountedInput)
</script>

<template>
  <input ref="search-input" />
</template>`,
    },
    {
      type: 'text',
      content:
        'mounted 只说明首次同步子树已经挂载。只要目标受条件、列表或动态选择控制，之后仍可能回到 null；非空断言不能改变这条时间线。需要持续响应引用变化时，回调必须同时处理目标与 null。',
    },
    { type: 'heading', content: '状态改变后再读取最新 DOM' },
    {
      type: 'text',
      content:
        '事件中先让 v-if 条件成立，引用不会在同一行同步变成元素。应先修改状态，再 `await nextTick()` 等待本轮 Vue DOM flush，最后执行聚焦、滚动或测量。可选链只能避免报错，不能替代本来应该发生的命令。',
    },
    {
      type: 'compare',
      labels: ['命令在目标创建前被跳过', '等待本轮 DOM 更新后操作'],
      before: `visible.value = true
inputElement.value?.focus()`,
      after: `visible.value = true
await nextTick()
inputElement.value?.focus()`,
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { nextTick, ref, useTemplateRef } from 'vue'

const visible = ref(false)
const inputElement = useTemplateRef<HTMLInputElement>('search-input')

/** 显示输入框，并在本轮 DOM 更新后聚焦。 */
async function showAndFocus() {
  visible.value = true
  await nextTick()
  inputElement.value?.focus()
}`,
    },
    {
      type: 'table',
      headers: ['需求', '是否使用模板引用', '等待什么'],
      rows: [
        ['设置输入值或控制显隐', '否，优先使用状态和模板', 'Vue 自行渲染'],
        ['显示后聚焦、滚动或读取最新尺寸', '是', '状态修改后的 nextTick'],
        ['等待图片、动画或浏览器绘制', '可能需要', '对应浏览器事件或帧，不是 nextTick'],
        ['父子传递数据与业务事件', '否', '使用 Props 与 Emits'],
      ],
    },
    { type: 'heading', content: '在模板引用实验台验证三种目标' },
    {
      type: 'text',
      content:
        '唯一 Demo 把 DOM、组件和动态列表放在同一实验台。切换输入框观察引用在元素与 null 间变化；父级只调用子组件公开命令；列表轮换后仍按稳定业务 ID 聚焦 API 项。',
    },
    {
      type: 'demo',
      id: 'vue.core.learn.intermediate.template-refs.template-ref-lab-demo',
      description: '观察 DOM 引用寿命、组件公开能力和函数 ref Map 的稳定身份',
      playground: true,
    },
    { type: 'heading', content: '组件 ref 只访问公开能力' },
    {
      type: 'text',
      content:
        'ref 放在普通元素上得到 DOM 元素，放在有状态子组件上得到组件公开实例。`<script setup>` 子组件默认关闭内部绑定，只有 `defineExpose()` 明确列出的成员对父级可见；公开对象中的 ref 会在父级看到的实例上自动解包。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<!-- SearchPanel.vue -->
<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'

const query = ref('Vue')
const inputElement = useTemplateRef<HTMLInputElement>('query-input')

/** 清空子组件自己的查询，并恢复输入焦点。 */
function clearAndFocus() {
  query.value = ''
  inputElement.value?.focus()
}

defineExpose({ clearAndFocus })
</script>

<template>
  <input ref="query-input" v-model="query" />
</template>`,
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<script setup lang="ts">
import { useTemplateRef } from 'vue'
import SearchPanel from './SearchPanel.vue'

const searchPanel = useTemplateRef<InstanceType<typeof SearchPanel>>('search-panel')

/** 通过子组件公开实例调用唯一命令。 */
function resetSearch() {
  searchPanel.value?.clearAndFocus()
}
</script>

<template>
  <SearchPanel ref="search-panel" />
  <button type="button" @click="resetSearch">重置搜索</button>
</template>`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '先判断交互能否表达为 Props 向下和 Emits 向上。确实需要 open()、reset()、focus() 一类命令时才 expose 窄方法；不要暴露整个可写状态，也不要读取 `$el` 穿透子组件结构。`defineExpose()` 必须位于任何 await 之前。',
    },
    { type: 'heading', content: 'v-for 数组只代表当前集合' },
    {
      type: 'text',
      content:
        'Vue 3.5+ 中，字符串 ref 位于 v-for 内时会得到目标数组。数组适合批量读取当前已挂载目标或核对数量，但官方不保证它与源数组同序，因此 `itemRefs[index]` 不能表示某个业务实体。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'

const itemElements = useTemplateRef<HTMLLIElement[]>('item')

/** 报告当前已经挂载的列表目标数量。 */
function reportMountedCount() {
  console.log(itemElements.value?.length ?? 0)
}

onMounted(reportMountedCount)
</script>

<template>
  <ul>
    <li v-for="item in items" :key="item.id" ref="item">{{ item.label }}</li>
  </ul>
</template>`,
    },
    { type: 'heading', content: '函数 ref 用业务 ID 建立对应关系' },
    {
      type: 'text',
      content:
        '需要“业务 ID → 元素”的稳定关系时，函数 ref 比数组索引更直接。它在更新时可能重复收到目标，在卸载时收到 null，因此回调只做幂等登记和删除；第三方实例、listener 或 observer 仍由明确生命周期管理。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'

const elementById = new Map<string, HTMLButtonElement>()

/** 按业务 ID 同步按钮引用，并在目标卸载时删除。 */
function setItemElement(
  id: string,
  element: Element | ComponentPublicInstance | null,
) {
  if (element instanceof HTMLButtonElement) elementById.set(id, element)
  else elementById.delete(id)
}

/** 按稳定业务 ID 聚焦按钮。 */
function focusItem(id: string) {
  elementById.get(id)?.focus()
}
</script>

<template>
  <button
    v-for="item in items"
    :key="item.id"
    :ref="(element) => setItemElement(item.id, element)"
    type="button"
  >
    {{ item.label }}
  </button>
</template>`,
    },
    { type: 'heading', content: 'v-if 与 v-show 改变引用寿命' },
    {
      type: 'table',
      headers: ['条件方式', 'DOM 行为', '模板引用'],
      rows: [
        ['v-if', '条件为假时销毁，重新成立时重建', '移除后回到 null，再挂载后得到新目标'],
        ['v-show', '元素始终渲染，只切换 display', '通常保留同一目标，但目标可能不可见'],
      ],
    },
    {
      type: 'text',
      content:
        '不要为了逃避 null 判断而把所有 v-if 改成 v-show。选择仍取决于条件语义、初始渲染成本和切换频率。对隐藏元素执行 focus 或测量也可能不符合业务目标，即使引用仍然非空。',
    },
    { type: 'heading', content: '动态名称、TypeScript 与版本边界' },
    {
      type: 'text',
      content:
        '`useTemplateRef()` 从 Vue 3.5 开始提供，公开类型是 `Readonly<ShallowRef<T | null>>`。Vue 3.5 与 @vue/language-tools 2.1+ 可以推断静态模板引用；推断不足时，普通元素传 DOM 接口，导入组件使用 `InstanceType<typeof Child>`，动态组件使用实例联合或共同的 `ComponentPublicInstance`。类型泛型不会证明目标此刻已挂载。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const primaryInput = useTemplateRef<HTMLInputElement>('primary')
const secondaryInput = useTemplateRef<HTMLInputElement>('secondary')

type PanelInstance = InstanceType<typeof SearchPanel> | InstanceType<typeof FilterPanel>
const activePanel = useTemplateRef<PanelInstance>('active-panel')

/** 仅在当前动态面板公开 reset 时调用。 */
function resetActivePanel() {
  if (activePanel.value && 'reset' in activePanel.value) activePanel.value.reset()
}`,
    },
    {
      type: 'text',
      content:
        '模板可以用动态 `:ref` 在少量已登记 ID 间切换：旧句柄会清空，新句柄在渲染后得到目标。`useTemplateRef(activeKey.value)` 只登记调用时的字符串快照，不会因 activeKey 后续变化而重新调用 helper。任意数量的业务 key 更适合函数 ref Map。Vue 3.5 以前需用与静态模板 ref 同名的普通 `ref(null)`；旧写法仍兼容，但不是本课主线。',
    },
    { type: 'heading', content: 'SSR 中等客户端接管后再使用' },
    {
      type: 'text',
      content:
        '服务端渲染没有客户端 DOM，mounted 也不在服务端执行，因此 setup 中的模板引用仍是 null。客户端 hydration 会把引用连接到已经存在并被接管的 DOM 节点；服务端 HTML 已经可见，不代表 setup 阶段已经取得元素。聚焦、测量和第三方 DOM 增强应从客户端 mounted 开始。',
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '模板 ref 名称不会序列化为供客户端查询的 HTML attribute。SSR 页面需要稳定选择器时仍应使用真实 id 或 data-*；本课不展开 hydration mismatch、流式渲染或服务端数据获取。',
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '在 setup 或条件卸载后直接访问引用',
          description:
            '误以为声明 useTemplateRef() 后目标立刻存在，并且 mounted 之后永远不会回到 null。',
          consequence: '首次渲染、SSR、v-if 为假或目标卸载时，直接调用目标方法会抛出空值错误。',
          wrong: {
            lang: 'ts',
            content: `const inputElement = useTemplateRef<HTMLInputElement>('input')
inputElement.value.focus()`,
          },
          correct: {
            lang: 'ts',
            content: `const inputElement = useTemplateRef<HTMLInputElement>('input')

/** 聚焦当前确实存在的输入框。 */
function focusInput() {
  inputElement.value?.focus()
}`,
          },
        },
        {
          title: '创建目标后不等 DOM flush 就执行命令',
          description: '响应式状态已经变更，不代表受 v-if 控制的目标已经完成挂载和引用赋值。',
          consequence: '聚焦、滚动或测量被可选链静默跳过，界面出现了目标但预期动作没有发生。',
          wrong: {
            lang: 'ts',
            content: `visible.value = true
inputElement.value?.focus()`,
          },
          correct: {
            lang: 'ts',
            content: `/** 显示目标并在当前 Vue flush 后聚焦。 */
async function showAndFocus() {
  visible.value = true
  await nextTick()
  inputElement.value?.focus()
}`,
          },
        },
        {
          title: '把模板 ref 当成真实 HTML attribute',
          description:
            '把 `<input ref="search">` 当作可供 CSS、querySelector 或测试定位的 DOM 标记。',
          consequence: '查询结果为空，样式或测试依赖了 Vue 不会输出的特殊 attribute。',
          wrong: {
            lang: 'ts',
            content: `const inputElement = document.querySelector('[ref="search"]')`,
          },
          correct: {
            lang: 'ts',
            content: `const inputElement = useTemplateRef<HTMLInputElement>('search')
// 若需要 DOM 选择器，在模板上另外声明 id 或 data-*。`,
          },
        },
        {
          title: '名称不匹配或把 helper 参数当成响应式订阅',
          description:
            'helper 的 key 与模板名称不同，或认为传入 activeKey.value 后会自动登记所有后续 key。',
          consequence: '引用长期为 null，或始终只对应调用 useTemplateRef() 时登记的初始通道。',
          wrong: {
            lang: 'ts',
            content: `const activeKey = ref('primary')
const activeInput = useTemplateRef<HTMLInputElement>(activeKey.value)
activeKey.value = 'secondary'`,
          },
          correct: {
            lang: 'ts',
            content: `const primaryInput = useTemplateRef<HTMLInputElement>('primary')
const secondaryInput = useTemplateRef<HTMLInputElement>('secondary')`,
          },
        },
        {
          title: '手工给 useTemplateRef 的 value 赋值',
          description: '把渲染器维护的只读浅层引用当成业务 ref()，试图自行替换它的目标。',
          consequence: 'TypeScript 拒绝写入，开发模式出现只读警告，后续渲染还会覆盖伪造的值。',
          wrong: {
            lang: 'ts',
            content: `const inputElement = useTemplateRef<HTMLInputElement>('input')
inputElement.value = document.createElement('input')`,
          },
          correct: {
            lang: 'ts',
            content: `const inputElement = useTemplateRef<HTMLInputElement>('input')
// 只读取 inputElement.value，由模板目标的生命周期决定它的值。`,
          },
        },
        {
          title: '用 v-for 数据索引访问 ref 数组',
          description: '假定 itemElements.value[index] 永远对应 items.value[index]。',
          consequence: '列表移动、插入或删除后可能聚焦错误元素，把未承诺的数组顺序当成业务身份。',
          wrong: {
            lang: 'ts',
            content: `/** 错误地按引用数组位置定位业务项。 */
function focusItem(index: number) {
  itemElements.value?.[index]?.focus()
}`,
          },
          correct: {
            lang: 'ts',
            content: `const elementById = new Map<string, HTMLButtonElement>()

/** 按稳定业务 ID 聚焦列表项。 */
function focusItem(id: string) {
  elementById.get(id)?.focus()
}`,
          },
        },
        {
          title: '函数 ref 只追加，不处理重复调用和 null',
          description: '误以为函数 ref 只在首次挂载调用一次，并且参数永远是 Element。',
          consequence: '更新后集合重复增长，卸载后仍保留脱离 DOM 的旧元素或重复创建外部资源。',
          wrong: {
            lang: 'vue',
            content: `<button :ref="(element) => elements.push(element)">项目</button>`,
          },
          correct: {
            lang: 'ts',
            content: `/** 幂等登记元素，并在 null 路径删除。 */
function setElement(id: string, element: Element | null) {
  if (element instanceof HTMLButtonElement) elementById.set(id, element)
  else elementById.delete(id)
}`,
          },
        },
        {
          title: '把 script setup 子组件当成默认公开全部内部状态',
          description: '拿到组件 ref 后，直接调用子组件没有通过 defineExpose() 公开的方法。',
          consequence:
            '组件实例存在，但目标方法是 undefined；父组件随后容易转而依赖 `$el` 或内部结构。',
          wrong: {
            lang: 'ts',
            content: `// Child.vue 没有 defineExpose({ reset })
childPanel.value?.reset()`,
          },
          correct: {
            lang: 'ts',
            content: `/** 重置子组件自己的内部状态。 */
function reset() {
  count.value = 0
}

defineExpose({ reset })`,
          },
        },
        {
          title: '在 await 后 expose，或暴露整个内部状态',
          description: '等异步初始化完成才 defineExpose()，并把可写状态和全部实现都交给父组件。',
          consequence: 'await 后暴露的成员无法访问，过宽公开面又让父级绕过子组件校验和事件契约。',
          wrong: {
            lang: 'ts',
            content: `await loadInitialState()
defineExpose({ formState, reset, submit })`,
          },
          correct: {
            lang: 'ts',
            content: `defineExpose({ reset })
await loadInitialState()`,
          },
        },
        {
          title: '把动态组件引用标成单一固定实例',
          description: '当前组件可以切换，却让 TypeScript 始终声称引用具有某个组件的全部方法。',
          consequence: '切换到另一组件后，类型仍允许调用不存在的方法，运行时得到 undefined。',
          wrong: {
            lang: 'ts',
            content: `type PanelInstance = InstanceType<typeof SearchPanel>
const panel = useTemplateRef<PanelInstance>('panel')`,
          },
          correct: {
            lang: 'ts',
            content: `type PanelInstance = InstanceType<typeof SearchPanel> | InstanceType<typeof FilterPanel>
const panel = useTemplateRef<PanelInstance>('panel')

/** 仅调用当前目标真实公开的命令。 */
function resetPanel() {
  if (panel.value && 'reset' in panel.value) panel.value.reset()
}`,
          },
        },
      ],
    },
    { type: 'heading', content: '从 Vue 3.5.40 源码与官方测试推导' },
    {
      type: 'text',
      content:
        '以下八点都先固定一手实现或官方测试事实，再给出课程中的使用判断。它们解释当前版本行为，但不是新增的 Vue 公共 API 承诺。',
    },
    {
      type: 'steps',
      items: [
        {
          title: '推导 1：useTemplateRef 建立只读浅层通道',
          content:
            '`useTemplateRef.ts` 在当前组件实例 refs 的指定 key 上建立 shallowRef 通道，开发模式返回 readonly 包装。由此应在 setup 同步调用链中登记，业务代码只读值，不在事件或异步回调中临时调用或手工赋值。',
        },
        {
          title: '推导 2：渲染器按目标类型选择引用值',
          content:
            '`rendererTemplateRef.ts` 对有状态组件取得公开实例，对普通目标使用 VNode 的 DOM 元素。由此不能假定所有 ref 都是 HTMLElement；元素和组件应拆分名称，动态目标则使用联合类型与运行时判断。',
        },
        {
          title: '推导 3：非空赋值后置，清空即时',
          content:
            '`rendererTemplateRef.ts` 把非空设置放入 post-render 队列，卸载和旧动态 ref 的清空不延后；对应官方测试验证挂载、改名与卸载。由此创建目标后应 await nextTick，不能用可选链掩盖时机错误。',
        },
        {
          title: '推导 4：动态字符串先清旧 ID 再写新 ID',
          content:
            '`rendererTemplateRef.spec.ts` 把同一元素从 foo 改为 bar 后，断言旧通道为 null、新通道指向元素。由此少量已知 ID 可以预先登记并动态切换，任意业务 key 则优先使用函数 ref Map。',
        },
        {
          title: '推导 5：v-for 数组按真实挂载集合维护',
          content:
            '`rendererTemplateRef.ts` 的 ref_for 分支追加非重复目标并在卸载时移除，`useTemplateRef.spec.ts` 验证多个目标进入数组；官方指南又明确不保证源数组顺序。由此数组适合数量和批量操作，不适合业务身份。',
        },
        {
          title: '推导 6：函数 ref 是可重复的渲染回调',
          content:
            '`rendererTemplateRef.ts` 直接调用函数 ref，`rendererTemplateRef.spec.ts` 覆盖首次传目标、更新调用和卸载传 null。由此回调应快速、幂等且对称清理，不承担一次性 mounted 副作用。',
        },
        {
          title: '推导 7：公开实例代理会解包 exposed ref',
          content:
            '`component.ts` 用 proxyRefs() 包装 instance.exposed，官方文档也说明公开 ref 会自动解包。由此暴露可写 ref 会扩大父级修改权限，更稳妥的公开面是 reset()、open()、focus() 这类窄命令。',
        },
        {
          title: '推导 8：hydration 才连接既有 DOM',
          content:
            '`hydration.spec.ts` 先放入服务端 HTML，再验证客户端 hydration 后 ref 指向既有节点，且 DOM 没有 ref attribute。由此 SSR 输出可见不等于 setup 已有引用，客户端增强仍从 mounted 开始。',
        },
      ],
    },
    {
      type: 'exercise',
      title: '实现按业务 ID 聚焦的条件列表',
      instructions:
        '创建一个带稳定 id 的字段列表。字段通过 v-if 控制，函数 ref 把输入框登记到 Map；“显示并聚焦邮箱”先更新可见字段，再 await nextTick，最后按 id 聚焦。删除字段时由函数 ref 的 null 路径清理 Map。验证初始化、显示、隐藏和重新显示都不会访问过期元素。',
      answer: `<script setup lang="ts">
import { nextTick, ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'

interface Field {
  id: string
  label: string
}

const fields: Field[] = [
  { id: 'name', label: '姓名' },
  { id: 'email', label: '邮箱' },
]
const visibleIds = ref(new Set(['name']))
const inputById = new Map<string, HTMLInputElement>()

/** 按字段 ID 登记输入框，并在条件卸载时清理。 */
function setFieldInput(
  id: string,
  element: Element | ComponentPublicInstance | null,
) {
  if (element instanceof HTMLInputElement) inputById.set(id, element)
  else inputById.delete(id)
}

/** 判断指定字段当前是否参与渲染。 */
function isVisible(id: string) {
  return visibleIds.value.has(id)
}

/** 显示邮箱字段，并在当前 DOM flush 后按业务 ID 聚焦。 */
async function showAndFocusEmail() {
  visibleIds.value = new Set([...visibleIds.value, 'email'])
  await nextTick()
  inputById.get('email')?.focus()
}

/** 隐藏邮箱字段，使其引用进入 null 清理路径。 */
function hideEmail() {
  visibleIds.value = new Set([...visibleIds.value].filter((id) => id !== 'email'))
}
</script>

<template>
  <template v-for="field in fields" :key="field.id">
    <label v-if="isVisible(field.id)">
      {{ field.label }}
      <input :ref="(element) => setFieldInput(field.id, element)" />
    </label>
  </template>
  <button type="button" @click="showAndFocusEmail">显示并聚焦邮箱</button>
  <button type="button" @click="hideEmail">隐藏邮箱</button>
</template>`,
    },
    {
      type: 'checklist',
      items: [
        { label: '能区分业务 ref、模板 ref attribute 和 useTemplateRef 句柄' },
        { label: '能解释引用从 null 到目标再回到 null 的时间线' },
        { label: '创建目标后会先改状态，再 await nextTick，再执行 DOM 命令' },
        { label: '不会用模板引用替代 Props、Emits 或普通响应式状态' },
        { label: '组件只通过 defineExpose 公开必要的窄命令' },
        { label: 'v-for 引用数组只用于当前集合，不按索引绑定业务项' },
        { label: '函数 ref 能幂等登记目标，并在 null 路径删除旧引用' },
        { label: '能说明 v-if 与 v-show 对引用寿命的差异' },
        { label: 'TypeScript 类型仍保留 null、联合类型和运行时判断' },
        { label: 'SSR 中不会在 setup 使用 DOM，客户端挂载后才增强' },
      ],
    },
    { type: 'heading', content: '完成本课后的判断顺序' },
    {
      type: 'text',
      content:
        '先判断需求能否由状态、Props 和 Emits 声明式完成；确实需要目标时，再判断它是 DOM 元素还是组件公开实例。接着沿 null 时间线确认目标当前是否存在；若刚修改了影响目标的状态，就 await nextTick。列表只遍历当前集合时用引用数组，需要业务身份时用函数 ref Map。最后检查 TypeScript、v-if 与 SSR 是否仍保留空值分支。',
    },
  ],
  recap: [
    '业务 ref()、模板 ref attribute 和 useTemplateRef() 分属状态、登记和读取三个角色。',
    '模板引用由真实渲染目标驱动，会经历 null、目标、null。',
    '状态修改后先 await nextTick，再执行依赖新 DOM 的聚焦、滚动或测量。',
    'DOM 引用只用于声明式数据流无法表达的命令式边界。',
    '组件 ref 得到公开实例，script setup 子组件用 defineExpose 提供最小命令。',
    'v-for 引用数组表示当前集合，不承诺与源数组同序。',
    '函数 ref 适合用稳定业务 ID 维护 Map，并在 null 路径清理。',
    'v-if 会结束引用寿命，v-show 通常保留目标但不保证它适合交互。',
    'TypeScript 泛型描述可能目标，不能消除真实的 null 和动态形态。',
    'SSR 没有客户端 DOM，模板引用在 hydration 后才连接到真实节点。',
  ],
})
