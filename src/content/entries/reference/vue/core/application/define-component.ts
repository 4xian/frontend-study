/**
 * 知识点：defineComponent()
 * 查证来源（2026-08-02）：
 * - https://cn.vuejs.org/api/general.html#definecomponent
 * - https://cn.vuejs.org/api/composition-api-setup.html#basic-usage
 * - https://cn.vuejs.org/api/composition-api-setup.html#accessing-props
 * - https://cn.vuejs.org/api/composition-api-setup.html#setup-context
 * - https://cn.vuejs.org/api/composition-api-setup.html#usage-with-render-functions
 * - https://cn.vuejs.org/guide/built-ins/suspense.html#async-setup
 * - https://cn.vuejs.org/guide/components/registration.html
 * - https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiDefineComponent.ts
 * - https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/component.ts
 * - https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/apiSetupContext.spec.ts
 * - https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/componentProps.spec.ts
 * 查证工具：Vue 官方文档、vuejs/core v3.5.40 源码、官方测试与本地类型声明
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

export const meta = defineReferenceMeta({
  id: 'vue.core.reference.application.define-component',
  type: 'reference',
  title: 'defineComponent()',
  summary: '为对象式或函数式组件定义提供 TypeScript 类型推导，并理解它与注册、挂载及编译器宏的边界',
  ecosystem: 'vue',
  module: 'core',
  collection: 'application',
  related: [
    'vue.core.reference.application.create-app',
    'vue.core.reference.application.define-async-component',
    'vue.core.reference.components.props',
    'vue.core.reference.components.emits',
  ],
  tags: ['defineComponent', 'TypeScript', 'setup', 'render function', '组件定义'],
  sources: [
    {
      title: 'Vue 通用 API：defineComponent',
      url: 'https://cn.vuejs.org/api/general.html#definecomponent',
    },
    {
      title: 'Vue setup 与渲染函数',
      url: 'https://cn.vuejs.org/api/composition-api-setup.html#usage-with-render-functions',
    },
    {
      title: 'Vue Suspense：异步 setup',
      url: 'https://cn.vuejs.org/guide/built-ins/suspense.html#async-setup',
    },
    {
      title: 'Vue setup 基本使用',
      url: 'https://cn.vuejs.org/api/composition-api-setup.html#basic-usage',
    },
    {
      title: 'Vue setup 访问 Props',
      url: 'https://cn.vuejs.org/api/composition-api-setup.html#accessing-props',
    },
    {
      title: 'Vue Setup 上下文',
      url: 'https://cn.vuejs.org/api/composition-api-setup.html#setup-context',
    },
    {
      title: 'Vue 组件注册指南',
      url: 'https://cn.vuejs.org/guide/components/registration.html',
    },
    {
      title: 'Vue 3.5.40 apiDefineComponent.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiDefineComponent.ts',
    },
    {
      title: 'Vue 3.5.40 setup 执行与结果处理源码',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/component.ts',
    },
    {
      title: 'Vue 3.5.40 SetupContext 官方测试',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/apiSetupContext.spec.ts',
    },
    {
      title: 'Vue 3.5.40 Props 官方测试',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/componentProps.spec.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-08-02',
  anchors: [
    '概述',
    '基本使用',
    '访问 Props',
    'Setup 上下文',
    '对象签名',
    '函数签名',
    '运行时边界',
    '易错使用提示',
    '最小源码实现',
  ],
})

export default defineReference({
  meta,
  signature: `function defineComponent(options: ComponentOptions): Component

// 仅 Vue 3.3+
function defineComponent(
  setup: (props: Props, ctx: SetupContext) => RenderFunction | Promise<RenderFunction>,
  extraOptions?: ComponentOptions
): Component

function setup(
  props: ComponentProps,
  context: SetupContext
): RawBindings | RenderFunction | void | Promise<RawBindings>`,
  blocks: [
    { type: 'heading', content: '概述' },
    {
      type: 'text',
      content:
        '`defineComponent()` 是运行时函数，也是 TypeScript 类型辅助工具。对象签名会在运行时原样返回组件选项，函数签名会把传入函数包装成 `setup`。它不会注册、挂载或渲染组件；主要价值是让 props、emits、setup 返回值和组件实例获得可靠的类型推导。',
    },
    { type: 'heading', content: '基本使用' },
    {
      type: 'text',
      content:
        '`setup(props, context)` 是 Options API 组件使用组合式 API 的入口，在组件实例创建、props 与 slots 初始化之后执行，并早于 Options API 生命周期钩子。它没有组件公开实例 `this`。同步返回普通对象时，其中的属性可供模板和组件其余选项使用，ref 会在模板与公开代理上自动解包；返回函数时，该函数就是组件的渲染函数；没有绑定需要暴露时可以不返回。`async setup()` 返回 Promise，客户端组件必须位于 `<Suspense>` 后代中才能等待并渲染其结果。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const Counter = defineComponent({
  props: {
    initial: { type: Number, default: 0 },
  },
  emits: ['change'],
  /** 为每个组件实例建立独立状态与操作。 */
  setup(props, { emit }) {
    const count = ref(props.initial)

    /** 增加计数并通知父组件。 */
    function increment() {
      count.value++
      emit('change', count.value)
    }

    return { count, increment }
  },
  template: '<button @click="increment">{{ count }}</button>',
})`,
    },
    { type: 'heading', content: '访问 Props' },
    {
      type: 'text',
      content:
        '`props` 包含组件已声明并解析后的输入。它会随父组件更新而更新，但属于只读的浅层代理：不要给顶层 prop 赋值。直接解构会断开局部变量与后续 prop 更新的联系；需要保留单个字段的响应性时使用 `toRef(props, key)` 或 `toRefs(props)`。这不同于 Vue 3.5+ `<script setup>` 中由编译器改写的响应式 `defineProps()` 解构。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const UserBadge = defineComponent({
  props: {
    userId: { type: Number, required: true },
  },
  /** 保留 userId 与父级输入之间的响应式连接。 */
  setup(props) {
    const userId = toRef(props, 'userId')
    const profileUrl = computed(() => \`/users/\${userId.value}\`)

    return { profileUrl }
  },
  template: '<a :href="profileUrl">查看用户</a>',
})`,
    },
    { type: 'heading', content: 'Setup 上下文' },
    {
      type: 'text',
      content:
        '`SetupContext` 提供 `{ attrs, slots, emit, expose }`，上下文对象本身不是响应式状态，可以安全地在参数位置解构。`attrs` 是未被 props/emits 消费的透传 attributes 与监听器，`slots` 保存插槽函数，`emit` 触发组件事件，`expose` 限定父组件通过模板引用可访问的公开成员。`attrs` 与 `slots` 会随组件更新，但不要继续解构其中的字段，也不能把它们当作可由 `watch()` 深度追踪的普通响应式状态；插槽函数应在渲染阶段调用。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const ActionButton = defineComponent({
  emits: ['activate'],
  /** 转发 attributes、渲染插槽并公开最小命令。 */
  setup(_, { attrs, slots, emit, expose }) {
    const button = ref<HTMLButtonElement | null>(null)

    /** 将焦点移动到按钮元素。 */
    function focus() {
      button.value?.focus()
    }

    expose({ focus })

    return () =>
      h('div', attrs, [
        h(
          'button',
          { ref: button, onClick: () => emit('activate') },
          slots.default?.(),
        ),
      ])
  },
})`,
    },
    { type: 'heading', content: '对象签名' },
    {
      type: 'text',
      content:
        '对象签名适合 Options API 或需要同时声明 props、emits、components 等选项的组件。运行时声明既参与 props 分类与校验，也为 TypeScript 推导 setup 参数；它不是只在编译期存在的宏。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const Greeting = defineComponent({
  props: {
    message: { type: String, required: true },
  },
  /** 根据 message 渲染问候语。 */
  setup(props) {
    return () => h('p', props.message)
  },
})`,
    },
    { type: 'heading', content: '函数签名' },
    {
      type: 'text',
      content:
        'Vue 3.3+ 支持把 setup 函数作为第一个参数。该函数必须返回渲染函数，props 与 emits 的运行时声明仍要放在第二个参数中；TypeScript 参数类型会被擦除，不能替代运行时声明。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const Greeting = defineComponent(
  (props: { message: string }) => {
    return () => h('p', props.message)
  },
  {
    props: {
      message: { type: String, required: true },
    },
  },
)`,
    },
    { type: 'heading', content: '运行时边界' },
    {
      type: 'text',
      content:
        '对象签名近似身份函数，函数签名则生成 `{ name, setup }` 选项对象，所以 defineComponent 本身仍会在运行时执行。它与 `defineProps()` 等仅在 `<script setup>` 编译阶段展开的宏不同。定义完成后还要在父组件中导入使用，或通过 `app.component()` 注册，Vue 才会创建实例并渲染。',
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '认为调用 defineComponent 就完成注册或挂载',
          description: 'defineComponent 只返回组件定义，不会自动加入应用、创建实例或产生 DOM。',
          consequence: '组件没有被导入使用或注册时，模板仍会报告无法解析，页面也不会出现内容。',
          wrong: {
            lang: 'ts',
            content: "defineComponent({ name: 'UserCard', template: '<article>User</article>' })",
          },
          correct: {
            lang: 'ts',
            content:
              "export const UserCard = defineComponent({\n  name: 'UserCard',\n  template: '<article>User</article>',\n})\n\napp.component('UserCard', UserCard)",
          },
        },
        {
          title: '修改或直接解构 setup 的 props',
          description:
            'setup 的 props 是随父组件更新的只读输入。直接赋值违反单向数据流；普通解构得到的局部值不会继续跟随 prop 更新。',
          consequence: '赋值会在开发环境产生只读警告，解构值则悄悄停留在旧快照，派生状态不再更新。',
          wrong: {
            lang: 'ts',
            content:
              '/** 错误地解构并改写输入。 */\nsetup(props) {\n  const { userId } = props\n  props.userId = 2\n  return { userId }\n}',
          },
          correct: {
            lang: 'ts',
            content:
              "/** 保留 prop 的响应式连接。 */\nsetup(props) {\n  const userId = toRef(props, 'userId')\n  return { userId }\n}",
          },
        },
        {
          title: '把 attrs 与 slots 当成普通响应式对象',
          description:
            '`SetupContext` 可以安全解构，但 `attrs` 与 `slots` 的字段会更新且不是供 watch 深度追踪的普通响应式状态；继续解构字段或在 setup 阶段调用插槽都会捕获错误时机的数据。',
          consequence:
            '后续 attributes 或插槽变化可能不进入局部变量，插槽依赖也无法由正确的渲染作用域追踪。',
          wrong: {
            lang: 'ts',
            content:
              '/** 错误地提前固化 attrs 与插槽结果。 */\nsetup(_, { attrs, slots }) {\n  const { title } = attrs\n  const content = slots.default?.()\n  return { title, content }\n}',
          },
          correct: {
            lang: 'ts',
            content:
              "/** 在每次渲染时读取最新 attrs 与插槽。 */\nsetup(_, context) {\n  return () => h('section', { title: context.attrs.title }, context.slots.default?.())\n}",
          },
        },
        {
          title: '把函数签名当成无运行时声明的类型宏',
          description:
            '直接传 setup 函数的重载仅 Vue 3.3+ 支持，而且参数类型会被擦除；它不会像 defineProps 宏一样生成运行时 props。',
          consequence:
            'Vue 3.2 类型不接受该重载；在新版省略第二参数时，props 校验、默认值及 attrs/props 分类也与类型预期不一致。',
          wrong: {
            lang: 'ts',
            content:
              "const Greeting = defineComponent((props: { msg: string }) => {\n  return () => h('p', props.msg)\n})",
          },
          correct: {
            lang: 'ts',
            content:
              "const Greeting = defineComponent(\n  (props: { msg: string }) => () => h('p', props.msg),\n  { props: { msg: { type: String, required: true } } },\n)",
          },
        },
        {
          title: '从 setup 直接返回一次性 VNode',
          description:
            'setup 只执行一次；只有返回函数时，Vue 才把结果安装为每次更新执行的渲染函数。',
          consequence:
            '直接返回的 VNode 不会成为有效渲染入口，开发环境会警告，响应式读取也无法随更新重新收集。',
          wrong: {
            lang: 'ts',
            content:
              "/** 错误地立即创建一次 VNode。 */\nsetup() {\n  const count = ref(0)\n  return h('button', count.value)\n}",
          },
          correct: {
            lang: 'ts',
            content:
              "/** 返回供每次更新调用的渲染函数。 */\nsetup() {\n  const count = ref(0)\n  return () => h('button', count.value)\n}",
          },
        },
        {
          title: '在函数签名中用 this 访问组件实例',
          description:
            '函数签名使用 Composition API setup 语义，setup 中没有 Options API 的组件实例 this。',
          consequence: '严格模式下 this 为 undefined，访问实例字段会抛错。',
          wrong: {
            lang: 'ts',
            content:
              "const Greeting = defineComponent(function () {\n  return () => h('p', this.msg)\n})",
          },
          correct: {
            lang: 'ts',
            content:
              "const Greeting = defineComponent(\n  (props: { msg: string }) => () => h('p', props.msg),\n  { props: ['msg'] },\n)",
          },
        },
      ],
    },
    { type: 'heading', content: '最小源码实现' },
    {
      type: 'text',
      content:
        'Vue 3.5.40 的 `defineComponent()` 先判断第一个参数是否为函数：函数签名会合并名称、额外选项和 setup，对象签名直接返回原对象。组件实例执行阶段则先初始化 props 与 slots，再以 props 和按需创建的 SetupContext 调用 setup；返回函数会安装为 render，返回对象会经 `proxyRefs()` 暴露给模板，Promise 则登记为异步依赖并检查客户端 Suspense 边界。官方 `apiSetupContext.spec.ts` 与 `componentProps.spec.ts` 分别覆盖上下文、expose 和只读 props 等外部行为。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `// 精简自 vuejs/core v3.5.40 apiDefineComponent.ts
/** 保留对象定义，或把函数签名包装成 setup 选项。 */
export function defineComponent(options: unknown, extraOptions?: ComponentOptions) {
  return isFunction(options)
    ? extend({ name: options.name }, extraOptions, { setup: options })
    : options
}`,
    },
  ],
})
