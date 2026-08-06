---
id: vue.core.reference.components.props
type: reference
title: 组件 Props 与 defineProps()
summary: 在 <script setup> 中声明组件输入，掌握 3.5 响应式解构、默认值、运行时校验与单向数据流边界
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.components.emits
  - vue.core.reference.components.define-model
  - vue.core.reference.components.attrs
  - vue.core.reference.reactivity.to-ref
tags:
  - defineProps
  - props
  - 响应式解构
  - 单向数据流
  - 组件通信
appliesTo: Vue 3.5.40
verifiedAt: 2026-07-28
sources:
  - title: Vue <script setup>：defineProps 与 defineEmits
    url: https://cn.vuejs.org/api/sfc-script-setup.html#defineprops-defineemits
  - title: Vue 组件 Props 指南
    url: https://cn.vuejs.org/guide/components/props.html
  - title: Vue 组件 Props 指南原始 Markdown
    url: https://github.com/vuejs/docs/blob/main/src/guide/components/props.md
  - title: Vue 3.5.40 defineProps.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/script/defineProps.ts
  - title: Vue 3.5.40 definePropsDestructure.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/script/definePropsDestructure.ts
  - title: Vue 3.5.40 componentProps.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentProps.ts
group: components
signature: |-
  function defineProps<PropNames extends string = string>(props: PropNames[]): Prettify<Readonly<{ [key in PropNames]?: any }>>
  function defineProps<PP extends ComponentObjectPropsOptions = ComponentObjectPropsOptions>(props: PP): Prettify<Readonly<ExtractPropTypes<PP>>>
  function defineProps<TypeProps>(): DefineProps<LooseRequired<TypeProps>, BooleanKey<TypeProps>>
anchors:
  - 概述
  - 声明形式与默认值
  - 3.5 响应式解构
  - 单向数据流
  - 运行时校验与转换
  - 易错使用提示
  - 最小源码实现
---

# 组件 Props 与 defineProps()

## 概述

`defineProps()` 是仅用于 `<script setup>` 的编译器宏，不需要导入，并会在编译时被移除。它声明组件公开接收的 props，让 Vue 能把已声明输入与透传 attributes 分开处理，同时为脚本和模板提供类型信息。运行时声明与纯类型声明二选一，不能在同一次调用中混用。

## 声明形式与默认值

运行时对象声明可直接配置 `type`、`required`、`default` 和 `validator`；TypeScript 项目也可用泛型声明，由编译器尽力生成等价的运行时 props。宏参数会被提升到模块作用域，因此不能引用 setup 中声明的局部变量，但可以引用导入的绑定。Vue 3.5 中，类型声明配合响应式解构可直接使用 JavaScript 默认值；继续整体持有 props 时则可使用 `withDefaults()`。

~~~~ts
// 运行时声明
const props = defineProps({
  title: String,
  count: { type: Number, required: true },
})

// 纯类型声明与 Vue 3.5 响应式解构默认值
interface Props {
  title?: string
  labels?: string[]
}

const { title = '未命名', labels = [] } = defineProps<Props>()
~~~~

## 3.5 响应式解构

Vue 3.5+ 会在同一个 `<script setup>` 块内，把从 `defineProps()` 解构出的变量访问改写为对应的 `props.xxx`，因此它们可被 `watchEffect`、computed 和模板追踪。但变量传给普通函数时仍是当前值：`watch(foo, ...)` 等价于把值交给 watch，并不是合法的响应式来源；需要持续追踪时传 `() => foo`。

~~~~ts
const { count } = defineProps<{ count: number }>()

watchEffect(() => {
  console.log(count) // Vue 3.5 编译为读取 props.count
})

watch(() => count, (nextCount) => {
  console.log(nextCount)
})
~~~~

## 单向数据流

父组件更新时，新 prop 会向下刷新到子组件；子组件不能给 prop 绑定重新赋值。若 prop 只是本地状态的初始值，应显式复制到 ref，并接受它与后续父值断开；若要从输入值派生展示结果，应使用 computed；若要请求父组件更新，应发出事件。对象和数组 prop 的嵌套成员仍可因共享引用而被子组件修改，但这会隐式改变父状态，除非父子紧密耦合，否则也应通过事件交还所有者处理。

:::demo{id="vue.core.reference.components.props.props-one-way-demo" playground="true"}
父组件更新 prop 会同步到子组件，子组件直接给顶层 prop 赋值则被拒绝
:::

## 运行时校验与转换

运行时对象声明会在开发构建中检查类型、必填项和自定义 validator；失败时输出警告，不应把它当作生产环境的数据清洗或安全边界。default 在解析后的 prop 值为 undefined 时生效，对象和数组默认值在运行时声明或 `withDefaults()` 中应由工厂函数返回，避免多个组件实例共享可变引用。Boolean prop 还遵循类似原生布尔 attribute 的转换规则；与 String 联合声明时，构造器顺序会影响空字符串的转换结果。

~~~~ts
const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value: string) => ['idle', 'loading', 'done'].includes(value),
  },
  labels: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
})
~~~~

## 易错使用提示

:::pitfalls
### 在子组件中直接修改 prop

**触发条件：** 在子组件中直接修改 prop

**原因：** 把 prop 当成本地状态，忽略它由父组件拥有且会在父组件更新时再次下发。`defineProps()` 返回值在脚本使用侧是只读的。

**后果：** 直接赋值会收到只读警告且不生效，组件的数据所有权也变得难以追踪。

**错误示例：**

~~~~ts
const props = defineProps<{ title: string }>()
props.title = '新标题'
~~~~

**正确写法：**

~~~~ts
const props = defineProps<{ title: string }>()
const emit = defineEmits<{ changeTitle: [title: string] }>()

emit('changeTitle', '新标题')
~~~~

**验证方式：** 对照正确写法验证结果。

### 直接修改对象或数组 prop 的嵌套成员

**触发条件：** 直接修改对象或数组 prop 的嵌套成员

**原因：** props 的只读约束阻止顶层绑定被替换，却无法低成本阻止共享对象或数组的深层修改。子组件写入会绕过明确的上行事件。

**后果：** 父状态被隐式改变，变更来源难定位，父组件自己的校验与更新流程可能被跳过。

**错误示例：**

~~~~ts
const props = defineProps<{ user: { name: string } }>()
props.user.name = 'Ada'
~~~~

**正确写法：**

~~~~ts
const props = defineProps<{ user: { name: string } }>()
const emit = defineEmits<{ rename: [name: string] }>()

emit('rename', 'Ada')
~~~~

**验证方式：** 对照正确写法验证结果。

### 把解构 prop 的当前值直接传给 watch

**触发条件：** 把解构 prop 的当前值直接传给 watch

**原因：** Vue 3.5 的编译器会改写同一 `<script setup>` 中对解构变量的访问，但 `watch(count, ...)` 仍把当前值而非响应式来源传给 watch。

**后果：** watch 收到无效来源并警告，父组件后续更新 count 时回调不会按预期执行。

**错误示例：**

~~~~ts
const { count } = defineProps<{ count: number }>()
watch(count, (value) => console.log(value))
~~~~

**正确写法：**

~~~~ts
const { count } = defineProps<{ count: number }>()
watch(() => count, (value) => console.log(value))
~~~~

**验证方式：** 对照正确写法验证结果。

### 给可变引用类型设置共享默认值

**触发条件：** 给可变引用类型设置共享默认值

**原因：** 运行时 props 或 `withDefaults()` 的对象、数组默认值如果直接使用同一个引用，各组件实例会拿到同一份可变数据。响应式解构的原生默认值不需要工厂函数。

**后果：** 一个组件修改默认数组或对象后，其他组件实例也观察到意外变化。

**错误示例：**

~~~~ts
const props = withDefaults(defineProps<{ labels?: string[] }>(), {
  labels: ['Vue'],
})
~~~~

**正确写法：**

~~~~ts
const props = withDefaults(defineProps<{ labels?: string[] }>(), {
  labels: () => ['Vue'],
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 把静态 attribute 当成非字符串值

**触发条件：** 把静态 attribute 当成非字符串值

**原因：** 未使用 `v-bind` 的 attribute 按字符串传入。看似数字或布尔值的字面量不会自动成为对应的 JavaScript 类型。

**后果：** 运行时 prop 校验警告，数值计算可能变成字符串拼接，false 也可能作为字符串参与逻辑。

**错误示例：**

~~~~vue
<Counter count="42" enabled="false" />
~~~~

**正确写法：**

~~~~vue
<Counter :count="42" :enabled="false" />
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 最小源码实现

编译器记录运行时或类型 props 声明，禁止同一次调用混用两种形式，并把 3.5 的解构变量访问改写成 `__props.key`。运行时 `initProps()` 再将 vnode 上的输入按声明分流到 props 与 attrs，解析 Boolean 和 default，状态组件中的 props 容器使用 `shallowReactive`。调用 `setup()` 时，开发模式把这个容器作为 `shallowReadonly(instance.props)` 传入，所以脚本侧既能追踪父级的顶层更新，又不能给顶层 prop 重新赋值。

~~~~ts
// 精简自 vuejs/core v3.5.40 defineProps.ts、componentProps.ts
/** 校验并生成 defineProps 的运行时声明。 */
function compileDefineProps(call: DefinePropsCall) {
  if (call.typeArgument && call.runtimeArgument) {
    throw new Error('defineProps 不能同时使用类型与运行时声明')
  }
  return generateRuntimeProps(call)
}

/** 将原始 vnode props 分流并初始化组件输入。 */
function initProps(instance: ComponentInternalInstance, rawProps: Data | null) {
  const props: Data = {}
  const attrs: Data = {}

  setFullProps(instance, rawProps, props, attrs)
  resolveDeclaredDefaultsAndBooleanCasts(instance, props)

  instance.props = shallowReactive(props)
  instance.attrs = attrs
}

// setup() 在开发模式收到 shallowReadonly(instance.props)
// 3.5 解构访问 count 则由编译器改写为 __props.count
~~~~
