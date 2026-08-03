# Vue 组件通信易错使用点调研

> 调研日期：2026-07-28
>
> 适用基线：Vue 3.5.40
>
> 对应范围：阶段 4 第 3 批 `component-communication`，覆盖 `defineProps` / props、
> `defineEmits` / emits、`defineModel`、slots、fallthrough attributes。
>
> 资料范围：Vue 官方中英文文档、Vue 官方 docs 仓库原始 Markdown、`vuejs/core`
> `v3.5.40` 固定标签源码及官方 RFC。Tavily 的五类检索均返回 plan usage limit，
> 因此按仓库规则回退到直接读取上述一手资料；本文不引用社区文章或搜索摘要。

下列错误代码用于复现错误直觉，正确代码给出最小替换路径。每点均记录原因、
可观察后果和一手依据；纯命名偏好或没有行为后果的建议不计入易错点。

## `defineProps()` / props

### 1. 把 Vue 3.5 的解构 prop 当成 `ref` 直接传给 `watch()`

- **错误假设 / 原因：** Vue 3.5 会在同一 `<script setup>` 中把解构变量的读取编译成
  `props.foo`，但变量本身不是 `ref`。作为函数参数时，`foo` 会先求值成当前值。
- **可观察后果：** `watch(foo, ...)` 不能建立 prop 依赖，并会收到编译诊断；普通组合式函数
  收到的也只是当前值，后续 prop 更新不会被它追踪。
- **错误代码：**

```ts
const { foo } = defineProps<{ foo: string }>()
watch(foo, value => console.log(value))
```

- **正确代码：**

```ts
const { foo } = defineProps<{ foo: string }>()
watch(() => foo, value => console.log(value))
```

- **一手来源：** [Vue Props：响应式 Props 解构](https://cn.vuejs.org/guide/components/props.html#reactive-props-destructure)、[Vue 3.5.40 `definePropsDestructure.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/script/definePropsDestructure.ts#L228-L266)

### 2. 在子组件中直接改写顶层 prop

- **错误假设 / 原因：** 把 prop 当成子组件自己的双向状态。props 实际是父到子的单向绑定，
  传给 setup 的视图是浅只读的。
- **可观察后果：** 开发环境出现只读警告；该写入不能可靠同步父状态，父组件再次更新时还会
  把父值重新下发。
- **错误代码：**

```ts
const props = defineProps<{ count: number }>()
props.count++
```

- **正确代码：**

```ts
const props = defineProps<{ count: number }>()
const emit = defineEmits<{ 'update:count': [value: number] }>()

emit('update:count', props.count + 1)
```

- **一手来源：** [Vue Props：单向数据流](https://cn.vuejs.org/guide/components/props.html#one-way-data-flow)、[Vue 3.5.40 `component.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/component.ts#L866-L880)

### 3. 以为对象或数组 prop 会被递归只读

- **错误假设 / 原因：** props 的只读边界是浅层的；对象和数组仍以引用传递，Vue 不会递归阻止
  子组件修改嵌套成员。
- **可观察后果：** 子组件可在没有顶层 prop 写入警告的情况下直接改变父组件持有的同一对象，
  形成隐蔽的反向数据流。
- **错误代码：**

```ts
const props = defineProps<{ user: { name: string } }>()
props.user.name = 'Ada'
```

- **正确代码：**

```ts
type User = { name: string }

const props = defineProps<{ user: User }>()
const emit = defineEmits<{ 'update:user': [value: User] }>()

emit('update:user', { ...props.user, name: 'Ada' })
```

- **一手来源：** [Vue Props：更改对象或数组类型的 props](https://cn.vuejs.org/guide/components/props.html#mutating-object-array-props)

### 4. 用 `disabled="false"` 传递布尔值 `false`

- **错误假设 / 原因：** 没有 `v-bind` 的 attribute 值是字符串。Boolean prop 只会把缺席处理为
  `false`，并按规则把空字符串或与 prop 同名的字符串转换成 `true`；字符串 `"false"`
  不会转换成布尔值。
- **可观察后果：** 子组件收到 truthy 的字符串 `"false"`，开发环境还会报告 Boolean 类型不匹配。
- **错误代码：**

```vue-html
<MyButton disabled="false" />
```

- **正确代码：**

```vue-html
<MyButton :disabled="false" />
```

```ts
defineProps({ disabled: Boolean })
```

- **一手来源：** [Vue Props：Boolean 类型转换](https://cn.vuejs.org/guide/components/props.html#boolean-casting)、[Vue 3.5.40 `componentProps.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentProps.ts#L449-L500)

### 5. 把 prop 校验当成生产数据边界

- **错误假设 / 原因：** 认为 `type`、`required` 或 `validator` 会拒绝、转换或抛出无效输入。
  Vue 3.5.40 的 `validateProps()` 只在开发分支调用，失败只产生警告，不会阻止组件收到该值。
- **可观察后果：** 开发环境可同时出现校验警告和后续业务错误；生产环境没有该校验警告，
  `count="3"` 也不会自动转换成数字。
- **错误代码：**

```vue-html
<Counter count="3" />
```

```ts
const props = defineProps({ count: Number })
console.log(props.count?.toFixed())
```

- **正确代码：**

```vue-html
<Counter :count="3" />
```

```ts
defineProps({
  count: {
    type: Number,
    validator: Number.isFinite,
  },
})
```

- **一手来源：** [Vue Props：Prop 校验](https://cn.vuejs.org/guide/components/props.html#prop-validation)、[Vue 3.5.40 `componentProps.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentProps.ts#L650-L710)

## `defineEmits()` / emits

### 1. 期待组件事件沿组件树冒泡

- **错误假设 / 原因：** 把组件 `emit()` 当成原生 DOM 事件。组件事件不冒泡，只能由直接父组件
  监听直接子组件发出的事件。
- **可观察后果：** 孙组件触发 `save` 后，中间组件不转发，祖父组件的 `@save` 不执行。
- **错误代码：**

```vue-html
<!-- GrandParent.vue -->
<Parent @save="onSave" />

<!-- Parent.vue -->
<Child />
```

- **正确代码：**

```vue
<script setup>
const emit = defineEmits(['save'])
</script>

<template>
  <Child @save="emit('save')" />
</template>
```

- **一手来源：** [Vue 组件事件：触发与监听事件](https://cn.vuejs.org/guide/components/events.html#emitting-and-listening-to-events)

### 2. 在 DOM 内模板中依赖 camelCase 事件名

- **错误假设 / 原因：** SFC 模板支持子组件发出 camelCase、父模板用 kebab-case 监听；但浏览器
  直接解析的 DOM 模板会把 attribute 名小写化，不能保留 camelCase listener。
- **可观察后果：** DOM 内模板的处理器可能不执行，开发环境还会给出大小写警告。
- **错误代码：**

```html
<div id="app">
  <my-button @someEvent="onSomeEvent"></my-button>
</div>
```

- **正确代码：**

```vue-html
<MyButton @some-event="onSomeEvent" />
```

```ts
emit('someEvent')
```

- **一手来源：** [Vue 组件事件：事件名](https://cn.vuejs.org/guide/components/events.html#emitting-and-listening-to-events)、[Vue 3.5.40 `componentEmits.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentEmits.ts#L177-L204)

### 3. 未声明根元素同名事件，同时又手动重发

- **错误假设 / 原因：** 未在 `emits` 声明的 listener 属于 fallthrough attribute，会自动加到
  单根 DOM；子组件若又手动 `$emit('click')`，同一个父 listener 会分别响应原生事件和组件事件。
- **可观察后果：** 一次点击可能让计数增加两次或请求发送两次。
- **错误代码：**

```vue-html
<!-- click 未声明 -->
<button @click="$emit('click', $event)">确定</button>
```

- **正确代码：**

```vue
<script setup>
defineEmits(['click'])
</script>

<template>
  <button @click="$emit('click', $event)">确定</button>
</template>
```

若组件不需要抽象 click 事件，也可删除手动 `$emit`，只保留原生 listener 透传。

- **一手来源：** [Vue 事件声明](https://cn.vuejs.org/guide/components/events.html#declaring-emitted-events)、[Vue 3 迁移指南：emits 双触发示例](https://v3-migration.vuejs.org/breaking-changes/emits-option.html#example)、[Vue 3.5.40 `componentProps.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentProps.ts#L403-L426)

### 4. 用 emits validator 阻止无效事件派发

- **错误假设 / 原因：** 把 validator 当成拦截器。源码只在开发环境调用 validator 并在返回
  `false` 时警告，随后仍会查找并调用父 listener。
- **可观察后果：** 开发环境出现 `Invalid event arguments` 警告，但父回调仍执行；生产环境连
  该校验警告也没有。
- **错误代码：**

```ts
const emit = defineEmits({
  submit: (payload: { email?: string }) => Boolean(payload.email),
})

emit('submit', {}) // 返回 false 不会取消派发
```

- **正确代码：**

```ts
function submit(payload: { email?: string }) {
  if (!payload.email) return
  emit('submit', payload)
}
```

- **一手来源：** [Vue 组件事件：事件校验](https://cn.vuejs.org/guide/components/events.html#events-validation)、[Vue 3.5.40 `componentEmits.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentEmits.ts#L121-L153)

### 5. 以为类型式 `defineEmits()` 会生成 payload 运行时校验器

- **错误假设 / 原因：** Vue 3.5.40 会从类型 AST 提取事件名并生成运行时事件名数组，但 payload
  类型只约束 TypeScript 调用，不会生成 validator 函数。
- **可观察后果：** 事件 listener 会被正确从 `$attrs` 消费；但通过 `any` 或纯 JavaScript
  发出错误 payload 时，不会出现类型式声明所对应的运行时校验警告。
- **错误代码：**

```ts
const emit = defineEmits<{ save: [id: number] }>()
emit('save', 'oops' as any)
```

- **正确代码：**

```ts
const emit = defineEmits({
  save: (id: number) => Number.isInteger(id),
})

emit('save', 1)
```

- **一手来源：** [SFC `<script setup>`：类型式声明](https://cn.vuejs.org/api/sfc-script-setup.html#type-only-props-emit-declarations)、[Vue 3.5.40 `defineEmits.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/script/defineEmits.ts#L48-L70)

## `defineModel()`

### 1. 无参数 `v-model` 自动匹配任意命名模型

- **错误假设 / 原因：** 无参数组件 `v-model` 固定展开为 `modelValue` prop 与
  `update:modelValue` 事件；`defineModel('title')` 声明的则是 `title` 与 `update:title`。
- **可观察后果：** 父组件无参数 `v-model` 与子组件 `title` 模型不会形成同一条双向绑定，
  子值改变时父值不按预期更新。
- **错误代码：**

```vue-html
<Child v-model="title" />
```

```ts
const title = defineModel('title')
```

- **正确代码：**

```vue-html
<Child v-model:title="title" />
```

```ts
const title = defineModel('title')
```

- **一手来源：** [Vue 组件 v-model：底层机制与参数](https://cn.vuejs.org/guide/components/v-model.html#under-the-hood)、[Vue 3.5.40 `defineModel.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/script/defineModel.ts#L29-L47)

### 2. 重复声明同名模型

- **错误假设 / 原因：** 认为多个无参数 `defineModel()` 会按变量名自动区分。编译器以模型名为键，
  无参数调用都对应 `modelValue`。
- **可观察后果：** 编译阶段直接报 `duplicate model name "modelValue"`。
- **错误代码：**

```ts
const firstName = defineModel()
const lastName = defineModel()
```

- **正确代码：**

```ts
const firstName = defineModel('firstName')
const lastName = defineModel('lastName')
```

```vue-html
<UserName v-model:first-name="first" v-model:last-name="last" />
```

- **一手来源：** [Vue 组件 v-model：多个绑定](https://cn.vuejs.org/guide/components/v-model.html#multiple-v-model-bindings)、[Vue 3.5.40 `defineModel.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/script/defineModel.ts#L45-L47)

### 3. 自定义修饰符会自动转换值

- **错误假设 / 原因：** `modifiers` 只说明父组件使用了哪些修饰符，转换逻辑必须由组件的
  `get` / `set` 实现；`set()` 的返回值才是发给父组件的值。
- **可观察后果：** 未实现转换时修饰符没有效果；`set()` 某条分支未返回值时，父模型会收到
  `undefined`。
- **错误代码：**

```ts
const [model, modifiers] = defineModel<string>({
  set(value) {
    if (modifiers.trim) return value.trim()
  },
})
```

- **正确代码：**

```ts
const [model, modifiers] = defineModel<string>({
  set(value) {
    return modifiers.trim ? value.trim() : value
  },
})
```

- **一手来源：** [SFC `defineModel()`：修饰符与转换器](https://cn.vuejs.org/api/sfc-script-setup.html#modifiers-and-transformers)、[Vue 3.5.40 `useModel.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/useModel.ts#L53-L84)

### 4. 子模型的 `default` 会初始化父 ref

- **错误假设 / 原因：** `defineModel({ default: 1 })` 只解析子组件 prop 的默认值，不会在首次
  渲染时主动把该值回写到父 ref。
- **可观察后果：** 子组件模型首次为 `1`，父组件绑定的 ref 仍是 `undefined`，父子状态不同步。
- **错误代码：**

```ts
// Child.vue
const model = defineModel({ default: 1 })

// Parent.vue
const count = ref<number>()
```

```vue-html
<Child v-model="count" />
```

- **正确代码：**

```ts
// Child.vue
const model = defineModel<number>({ required: true })

// Parent.vue
const count = ref(1)
```

- **一手来源：** [SFC `defineModel()` 默认值警告](https://cn.vuejs.org/api/sfc-script-setup.html#definemodel)、[Vue 组件 v-model：基本用法](https://cn.vuejs.org/guide/components/v-model.html#basic-usage)

### 5. `defineModel<number>()` 一定得到 `Ref<number>`

- **错误假设 / 原因：** 泛型描述值类型，但模型默认仍可缺席；未声明 `required` 或合法默认值时，
  返回类型包含 `undefined`。
- **可观察后果：** `count.value++` 会得到 TypeScript 的“可能为 undefined”错误；运行时父组件
  未传模型时也确实可能读到 `undefined`。
- **错误代码：**

```ts
const count = defineModel<number>()
count.value++
```

- **正确代码：**

```ts
const count = defineModel<number>({ required: true })
count.value++
```

若模型本来就是可选的，应显式处理：

```ts
const count = defineModel<number>()
count.value = (count.value ?? 0) + 1
```

- **一手来源：** [SFC `defineModel()`：TypeScript 用法](https://cn.vuejs.org/api/sfc-script-setup.html#usage-with-typescript)、[Vue 3.5.40 `apiSetupHelpers.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiSetupHelpers.ts#L311-L329)

## slots

### 1. 插槽内容可以直接读取子组件状态

- **错误假设 / 原因：** 插槽内容写在父组件模板中，遵循父组件的词法作用域；最终由子组件
  渲染，并不会让它自动进入子组件作用域。
- **可观察后果：** 同名变量读取父值；子组件独有变量在父模板中不可用。
- **错误代码：**

```vue-html
<!-- message 读取父作用域，不会读取 Child 内部的 message -->
<Child>{{ message }}</Child>
```

- **正确代码：**

```vue-html
<!-- Parent.vue -->
<Child v-slot="{ message }">{{ message }}</Child>

<!-- Child.vue -->
<slot :message="message" />
```

- **一手来源：** [Vue 插槽：渲染作用域与作用域插槽](https://cn.vuejs.org/guide/components/slots.html#render-scope)

### 2. 未包装的顶层内容会自动进入某个具名插槽

- **错误假设 / 原因：** 无 `name` 的 `<slot>` 名为 `default`；同时存在具名插槽时，组件子节点中
  顶层且不带 `v-slot` 的内容也只属于隐式默认插槽。
- **可观察后果：** 标题渲染到默认出口，`header` 插槽仍为空。
- **错误代码：**

```vue-html
<BaseLayout>
  <h1>标题</h1>
  <template #footer>页脚</template>
</BaseLayout>
```

- **正确代码：**

```vue-html
<BaseLayout>
  <template #header><h1>标题</h1></template>
  <template #default>正文</template>
  <template #footer>页脚</template>
</BaseLayout>
```

- **一手来源：** [Vue 插槽：具名插槽](https://cn.vuejs.org/guide/components/slots.html#named-slots)

### 3. 把 `v-slot` 放在普通元素上

- **错误假设 / 原因：** `v-slot` 只允许用于 `<template>`，或在唯一默认作用域插槽场景直接用于
  组件；普通 HTML 元素不是合法宿主。
- **可观察后果：** 编译器报 `v-slot can only be used on components or <template> tags.`。
- **错误代码：**

```vue-html
<MyCard>
  <div v-slot:header>标题</div>
</MyCard>
```

- **正确代码：**

```vue-html
<MyCard>
  <template #header>标题</template>
</MyCard>
```

- **一手来源：** [Vue 内置指令：v-slot](https://cn.vuejs.org/api/built-in-directives.html#v-slot)、[Vue 3.5.40 `errors.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/src/errors.ts#L166)

### 4. 通过调用插槽函数来判断它是否存在

- **错误假设 / 原因：** `$slots.header` 本身就是插槽函数；是否提供插槽应检查函数是否存在，
  不是先调用它。
- **可观察后果：** 未提供 `header` 时，`$slots.header()` 会调用 `undefined` 并中断渲染。
- **错误代码：**

```vue-html
<div v-if="$slots.header()">
  <slot name="header" />
</div>
```

- **正确代码：**

```vue-html
<div v-if="$slots.header">
  <slot name="header" />
</div>
```

- **一手来源：** [Vue 插槽：条件插槽](https://cn.vuejs.org/guide/components/slots.html#conditional-slots)、[Vue 公共实例：`$slots`](https://cn.vuejs.org/api/component-instance.html#slots)

### 5. 在 `setup()` 初始化阶段调用插槽函数

- **错误假设 / 原因：** 插槽以函数形式存在，是为了在子组件渲染期间延迟调用，并让槽内容依赖
  由渲染 effect 追踪。setup 初始化阶段不在渲染上下文内。
- **可观察后果：** 开发环境警告 `Slot "default" invoked outside of the render function`；
  槽内容使用的响应式依赖不能被正确追踪，后续内容可能陈旧。
- **错误代码：**

```ts
setup(_, { slots }) {
  const content = slots.default?.()
  return () => h('div', content)
}
```

- **正确代码：**

```ts
setup(_, { slots }) {
  return () => h('div', slots.default?.())
}
```

- **一手来源：** [Vue 渲染函数：传递插槽](https://cn.vuejs.org/guide/extras/render-function.html#passing-slots)、[Vue 3.5.40 `componentSlots.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentSlots.ts#L92-L118)

### 6. 给 `defineSlots()` 传运行时声明对象

- **错误假设 / 原因：** `defineSlots()` 是只接收类型参数的 `<script setup>` 编译宏，用于槽名和
  slot props 类型提示；它没有运行时声明参数，也不生成运行时插槽校验。
- **可观察后果：** Vue 3.5.40 SFC 编译器报 `defineSlots() cannot accept arguments`。
- **错误代码：**

```ts
const slots = defineSlots({
  default: (props: { message: string }) => null,
})
```

- **正确代码：**

```ts
const slots = defineSlots<{
  default(props: { message: string }): any
}>()
```

- **一手来源：** [SFC `<script setup>`：defineSlots](https://cn.vuejs.org/api/sfc-script-setup.html#defineslots)、[Vue 3.5.40 `defineSlots.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/script/defineSlots.ts#L7-L32)

## fallthrough attributes

### 1. 以为单根组件只透传普通 attribute

- **错误假设 / 原因：** 未被 props / emits 声明消费的 `class`、`style`、普通 attribute 和
  `v-on` listener 都属于 fallthrough attributes。单根组件会自动把它们加到根元素；根元素
  自己已有的 class、style 和同名 listener 会合并。
- **可观察后果：** 父级 class/style 与子根元素样式同时生效；根元素和父级传入的 click
  handler 都会执行，而不是后者覆盖前者。
- **错误代码：**

```vue-html
<!-- 误以为外部 class 会覆盖 btn，或外部 click 会覆盖内部 click -->
<MyButton class="large" @click="onOuterClick" />
```

```vue-html
<!-- MyButton.vue -->
<button class="btn" @click="onInnerClick">确定</button>
```

- **正确代码：**

```vue-html
<!-- 预期最终同时具有 btn / large，且两个 handler 都会运行 -->
<MyButton class="large" @click="onOuterClick" />
```

若不希望自动合并，应使用 `inheritAttrs: false` 并显式选择目标。

- **一手来源：** [Vue 透传 Attributes：继承、class/style 与 listener 合并](https://cn.vuejs.org/guide/components/attrs.html#attribute-inheritance)

### 2. 包装元素后仍让 attrs 自动落到内层控件

- **错误假设 / 原因：** 单根组件的自动透传目标就是根节点，不会推断哪个后代才是语义上的
  主控件。
- **可观察后果：** `disabled`、`aria-*` 和 click listener 被加到外层 `<div>`，真正的
  `<button>` 没有对应行为或无障碍属性。
- **错误代码：**

```vue-html
<div class="button-wrapper">
  <button>确定</button>
</div>
```

- **正确代码：**

```vue
<script setup>
defineOptions({ inheritAttrs: false })
</script>

<template>
  <div class="button-wrapper">
    <button v-bind="$attrs">确定</button>
  </div>
</template>
```

- **一手来源：** [Vue 透传 Attributes：禁用继承](https://cn.vuejs.org/guide/components/attrs.html#disabling-attribute-inheritance)

### 3. 多根组件会自动选择一个根节点透传

- **错误假设 / 原因：** Fragment 有多个候选根节点，Vue 无法替组件决定 attribute 应落在哪里，
  因而不会自动透传。
- **可观察后果：** attribute 或 listener 没有加到任何根节点，开发环境给出 extraneous attrs /
  non-emits listeners 警告。
- **错误代码：**

```vue-html
<header>页头</header>
<main>正文</main>
<footer>页脚</footer>
```

- **正确代码：**

```vue-html
<header>页头</header>
<main v-bind="$attrs">正文</main>
<footer>页脚</footer>
```

- **一手来源：** [Vue 透传 Attributes：多根节点继承](https://cn.vuejs.org/guide/components/attrs.html#attribute-inheritance-on-multiple-root-nodes)、[Vue 3.5.40 `componentRenderUtils.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentRenderUtils.ts#L162-L211)

### 4. 用 camelCase 读取 `$attrs` 中的连字符 attribute

- **错误假设 / 原因：** fallthrough attributes 在 JavaScript 中保留传入时的原始大小写；
  `foo-bar` 不会像声明的 prop 那样自动以 `fooBar` 暴露。事件 listener 则以 `onClick` 键暴露。
- **可观察后果：** `$attrs.fooBar` 或 `$attrs.click` 得到 `undefined`，分支判断和手工转发失效。
- **错误代码：**

```ts
const attrs = useAttrs()
console.log(attrs.fooBar, attrs.click)
```

- **正确代码：**

```ts
const attrs = useAttrs()
console.log(attrs['foo-bar'], attrs.onClick)
```

- **一手来源：** [Vue 透传 Attributes：禁用继承后的键名规则](https://cn.vuejs.org/guide/components/attrs.html#disabling-attribute-inheritance)

### 5. 用 `watch()` 观察 `useAttrs()` 返回对象

- **错误假设 / 原因：** `useAttrs()` 返回对象始终反映最新 attrs，但官方明确说明它为性能原因
  不是响应式对象，不能作为 watcher 的依赖源。
- **可观察后果：** 父组件更新 fallthrough attribute 后，依赖该 watch 的同步逻辑不执行。
- **错误代码：**

```ts
const attrs = useAttrs()
watch(() => attrs.title, syncTitle)
```

- **正确代码：**

```ts
const props = defineProps<{ title?: string }>()
watch(() => props.title, syncTitle)
```

如果该值不应成为 prop，可在 `onUpdated()` 中读取最新 attrs 执行更新后副作用。

- **一手来源：** [Vue 透传 Attributes：在 JavaScript 中访问](https://cn.vuejs.org/guide/components/attrs.html#accessing-fallthrough-attributes-in-javascript)、[Vue Composition API：useAttrs](https://cn.vuejs.org/api/composition-api-helpers.html#useattrs)

### 6. 认为已声明 props / emits 仍会留在 `$attrs` 并继续透传

- **错误假设 / 原因：** props 和 emits 声明不仅用于类型或文档，也建立输入分流边界：声明的 prop
  和声明事件的 listener 会被当前组件消费，从 `$attrs` 排除。
- **可观察后果：** 一旦把 `disabled` 声明为 prop，它不会再自动加到根 `<button>`；一旦把
  `click` 声明为 emit，父 `@click` 只响应显式组件事件，不再自动响应根 DOM click。
- **错误代码：**

```vue
<script setup>
defineProps({ disabled: Boolean })
defineEmits(['click'])
</script>

<template>
  <button>确定</button>
</template>
```

- **正确代码：**

```vue
<script setup>
const props = defineProps({ disabled: Boolean })
const emit = defineEmits(['click'])
</script>

<template>
  <button :disabled="props.disabled" @click="emit('click', $event)">确定</button>
</template>
```

- **一手来源：** [Vue 透传 Attributes：定义与嵌套组件继承](https://cn.vuejs.org/guide/components/attrs.html#nested-component-inheritance)、[Vue 组件事件：声明事件](https://cn.vuejs.org/guide/components/events.html#declaring-emitted-events)、[Vue 3.5.40 `componentProps.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentProps.ts#L372-L426)

## 覆盖统计

| 主题 | 易错点数量 |
| --- | ---: |
| `defineProps()` / props | 5 |
| `defineEmits()` / emits | 5 |
| `defineModel()` | 5 |
| slots | 6 |
| fallthrough attributes | 6 |
| **合计** | **27** |

## 核验边界

1. 版本敏感的编译与运行时行为均以 `vuejs/core` 的 `v3.5.40` 固定标签源码复核。
2. 官方指南用于核验公开契约；源码用于确认开发/生产分支、编译错误、attrs 分流和实际派发流程。
3. Tavily 仅被尝试用于发现线索，因套餐用量上限未返回资料；本文没有把失败响应或搜索摘要作为依据。
4. 本文是后续内容迁移的事实证据，不修改阶段状态，也不代表对应条目和 Demo 已完成迁移。
