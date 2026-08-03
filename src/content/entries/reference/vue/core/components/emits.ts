/**
 * 知识点：组件事件（defineEmits）
 * 查证来源（2026-07-28）：
 * - https://cn.vuejs.org/api/sfc-script-setup.html#defineprops-defineemits（宏与类型声明）
 * - https://cn.vuejs.org/guide/components/events.html（监听、声明、校验与不冒泡边界）
 * - https://github.com/vuejs/docs/blob/main/src/guide/components/events.md（官方指南原始 Markdown）
 * - https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/script/defineEmits.ts
 * - https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentEmits.ts
 * 查证工具：Vue 官方中文文档、Vue 官方 docs 原始 Markdown、vuejs/core v3.5.40 源码
 * Tavily 在当前工具集中不可用，已按仓库规则回退上述一手来源。
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

export const meta = defineReferenceMeta({
  id: 'vue.core.reference.components.emits',
  type: 'reference',
  title: '组件事件与 defineEmits()',
  summary: '声明组件可发出的事件及载荷，让子组件向直接父组件报告变化，并理解校验、命名和透传边界',
  ecosystem: 'vue',
  module: 'core',
  collection: 'components',
  related: [
    'vue.core.reference.components.props',
    'vue.core.reference.components.define-model',
    'vue.core.reference.components.attrs',
  ],
  tags: ['defineEmits', 'emit', '组件事件', '事件校验', '组件通信'],
  sources: [
    {
      title: 'Vue <script setup>：defineProps 与 defineEmits',
      url: 'https://cn.vuejs.org/api/sfc-script-setup.html#defineprops-defineemits',
    },
    {
      title: 'Vue 组件事件指南',
      url: 'https://cn.vuejs.org/guide/components/events.html',
    },
    {
      title: 'Vue 组件事件指南原始 Markdown',
      url: 'https://github.com/vuejs/docs/blob/main/src/guide/components/events.md',
    },
    {
      title: 'Vue 3.5.40 defineEmits.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/script/defineEmits.ts',
    },
    {
      title: 'Vue 3.5.40 componentEmits.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentEmits.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-07-28',
  anchors: ['概述', '声明形式', '事件校验', '命名与监听边界', '易错使用提示', '最小源码实现'],
})

export default defineReference({
  meta,
  signature:
    'function defineEmits<EE extends string = string>(emitOptions: EE[]): EmitFn<EE[]>\nfunction defineEmits<E extends EmitsOptions = EmitsOptions>(emitOptions: E): EmitFn<E>\nfunction defineEmits<T extends ComponentTypeEmits>(): T extends (...args: any[]) => any ? T : ShortEmits<T>',
  blocks: [
    { type: 'heading', content: '概述' },
    {
      type: 'text',
      content:
        '`defineEmits()` 是仅用于 `<script setup>` 的编译器宏，不需要导入，并在编译时被移除。它声明组件可能发出的自定义事件并返回 `emit` 函数。典型数据流是父组件通过 props 下发状态，子组件通过事件报告用户意图，由父组件决定是否更新自己的状态。声明事件还能让 Vue 把对应监听器从透传 attributes 中排除。',
    },
    { type: 'heading', content: '声明形式' },
    {
      type: 'text',
      content:
        '运行时可使用事件名数组，或用对象形式为事件配置载荷校验器；TypeScript 下可用调用签名，也可用 3.3+ 的具名元组语法描述每个事件的参数。运行时声明与纯类型声明不能混用，传给宏的运行时选项同样会提升到模块作用域，不能读取 setup 局部变量。建议声明组件会发出的全部事件，使公共接口、类型检查与透传行为一致。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const emit = defineEmits<{
  change: [id: number]
  remove: [id: number, reason?: string]
}>()

emit('change', 42)`,
    },
    {
      type: 'demo',
      id: 'vue.core.reference.components.emits.emits-demo',
      description: '子组件发出带载荷的 add 事件，直接父组件监听事件并更新自己持有的状态',
      playground: true,
    },
    { type: 'heading', content: '事件校验' },
    {
      type: 'text',
      content:
        '对象形式的运行时声明可把事件映射到校验函数。函数收到 `emit()` 在事件名之后的全部参数，并返回布尔值。Vue 只在开发模式检查；返回 false 会输出警告，但事件处理器仍会被调用。因此校验适合暴露组件接口错误，不能承担阻止提交、鉴权或数据净化。纯类型声明会生成事件名列表，但不会凭 TypeScript 参数类型生成等价的运行时载荷校验器。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const emit = defineEmits({
  cancel: null,
  submit: (payload: { email: string }) => payload.email.includes('@'),
})

emit('submit', { email: 'user@example.com' })`,
    },
    { type: 'heading', content: '命名与监听边界' },
    {
      type: 'text',
      content:
        "模板监听器推荐使用 kebab-case，例如子组件可 `emit('someEvent')`，父模板写 `@some-event`。组件事件不同于原生 DOM 事件：它不会沿组件树冒泡，只能由直接父组件监听。声明原生同名事件（如 `click`）后，父组件的该监听器只响应组件主动发出的 click，不再响应透传到根元素的原生 click。需要跨层或同级通信时，应提升状态、通过 props/事件逐层组合，或使用依赖注入和状态管理。",
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '把组件事件当成会冒泡的 DOM 事件',
          description:
            '组件发出的事件只交给当前组件 vnode 上的父级监听器，不会自动穿过中间组件继续向上冒泡。',
          consequence: '祖先组件监听不到深层子组件事件，交互看似已经 emit，但页面没有任何响应。',
          wrong: {
            lang: 'vue',
            content:
              '<!-- GrandParent.vue：DeepChild 的 save 不会越过 Middle -->\n<Middle @save="saveRecord" />',
          },
          correct: {
            lang: 'vue',
            content:
              '<!-- Middle.vue 显式转发 -->\n<DeepChild @save="(record) => emit(\'save\', record)" />',
          },
        },
        {
          title: '认为校验失败会阻止事件发出',
          description:
            '运行时事件 validator 是开发期诊断。源码在输出校验警告后仍继续查找并调用父组件处理器。',
          consequence: '无效载荷仍进入业务回调；若回调假设数据已被拦截，可能写入错误状态。',
          wrong: {
            lang: 'ts',
            content:
              "const emit = defineEmits({ submit: (count: number) => count > 0 })\nemit('submit', -1) // 仍会调用监听器",
          },
          correct: {
            lang: 'ts',
            content:
              "/** 校验数量后发出提交事件。 */\nfunction submit(count: number) {\n  if (count <= 0) return\n  emit('submit', count)\n}",
          },
        },
        {
          title: '漏声明与原生 DOM 同名的组件事件',
          description:
            '未声明的 `click` 监听器可能作为透传监听器落到组件根元素；如果组件又主动 emit click，同一次交互可能形成难懂的双路径。',
          consequence: '父监听器可能被原生事件意外触发，甚至出现重复调用或载荷形状不一致。',
          wrong: {
            lang: 'ts',
            content: "const emit = defineEmits([])\nemit('click', { source: 'button' })",
          },
          correct: {
            lang: 'ts',
            content:
              "const emit = defineEmits<{\n  click: [payload: { source: string }]\n}>()\n\nemit('click', { source: 'button' })",
          },
        },
        {
          title: '在模板监听器中使用大小写不稳定的事件名',
          description:
            '组件事件支持 camelCase 到 kebab-case 的转换，但浏览器内 DOM 模板的 attribute 不区分大小写，camelCase 监听名会丢失原始大小写。',
          consequence: '在 SFC 中可用的监听写法搬到 DOM 模板后失效，事件难以跨模板环境复用。',
          wrong: {
            lang: 'vue',
            content: '<MyForm @someEvent="handleSubmit" />',
          },
          correct: {
            lang: 'vue',
            content: '<MyForm @some-event="handleSubmit" />',
          },
        },
        {
          title: '在异步流程中继续使用已经卸载组件的事件结果',
          description:
            '运行时在组件已卸载后调用 emit 会直接返回。异步任务完成时，原组件可能已不再存在。',
          consequence: '请求已经成功但父监听器没有收到事件，旧任务还可能与新页面状态产生竞态。',
          wrong: {
            lang: 'ts',
            content:
              "/** 保存完成后发出结果事件。 */\nasync function save() {\n  const result = await saveRecord()\n  emit('saved', result)\n}",
          },
          correct: {
            lang: 'ts',
            content:
              "let active = true\nonUnmounted(() => { active = false })\n\n/** 仅在组件仍挂载时发出保存结果。 */\nasync function save() {\n  const result = await saveRecord()\n  if (active) emit('saved', result)\n}",
          },
        },
      ],
    },
    { type: 'heading', content: '最小源码实现' },
    {
      type: 'text',
      content:
        '编译器记录运行时或类型事件声明；类型声明最终提取事件名，`defineModel()` 产生的 `update:*` 事件也会合并进运行时 emits。父模板的 `@change="handler"` 编译为子组件 vnode prop `onChange: handler`。子组件 emit 时，运行时先做开发期声明与 validator 检查，再将事件名转换为 handler key，从当前 vnode.props 取出父函数并调用；`.once` 监听器通过实例上的已触发记录保证只运行一次。整个过程不是 DOM 派发，也不是全局事件总线。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `// 精简自 vuejs/core v3.5.40 defineEmits.ts、componentEmits.ts
/** 校验事件载荷并调用直接父组件的监听器。 */
function emit(instance: ComponentInternalInstance, event: string, ...args: unknown[]) {
  if (instance.isUnmounted) return

  const validator = instance.emitsOptions?.[event]
  if (__DEV__ && validator && !validator(...args)) {
    warn('事件载荷校验失败') // 只告警，不在这里 return
  }

  const props = instance.vnode.props ?? {}
  const handler =
    props[toHandlerKey(event)] ??
    props[toHandlerKey(camelize(event))]

  if (handler) callWithAsyncErrorHandling(handler, instance, args)
}`,
    },
  ],
})
