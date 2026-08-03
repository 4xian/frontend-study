# Vue Core 中级课程：组件 v-model 调研

> 核验日期：2026-07-31
>
> 适用版本：Vue 3.5.40。
>
> 资料范围：Vue 官方中文组件 `v-model` 指南、`<script setup>` `defineModel` 文档，以及
> `vuejs/core@v3.5.40` 固定标签的 compiler/runtime 源码与同标签官方测试。外部资料通过
> Tavily Search / Extract 定位和提取；不采用博客、问答、第三方库、RFC 讨论、`main` 分支或
> 浮动版本链接作为事实来源。

## 课程定位与冻结边界

| 字段 | 冻结值 |
| --- | --- |
| 课程 ID | `vue.core.learn.intermediate.component-v-model` |
| 标题 | `组件 v-model` |
| 阶段 | 重构实施计划阶段 6 / Vue Core 中级 / 组件内容与双向绑定 |
| 当前 catalog 状态 | `planned`；本调研只冻结内容，不改变 catalog 或课程实现 |
| 线性位置 | `vue.core.learn.intermediate.attrs` 之后，逻辑复用与依赖传递之前 |
| 难度 | `intermediate` |
| 建议时长 | 50 分钟 |

本课唯一直接 prerequisite 冻结为：

`vue.core.learn.intermediate.attrs`

它是当前 track 中紧邻本课之前的已上线课程。组件基础、Props、Emits、原生表单绑定已经由基础
阶段覆盖，本课不把这些传递性前置重复列为 prerequisite。

`related` 必须严格按以下顺序冻结，且五个 ID 均可在当前仓库解析：

1. `vue.core.learn.intermediate.attrs`
2. `vue.core.learn.basics.form-bindings`
3. `vue.core.learn.basics.props`
4. `vue.core.learn.basics.emits`
5. `vue.core.reference.components.define-model`

顺序表达“上一课组件边界 -> 原生输入绑定经验 -> prop 输入契约 -> emit 输出契约 -> 固定 API
参考”。不得加入 Slots、Provide / Inject、组合式函数、动态组件或其他后续规划课程。

本课只回答一个主问题：**如何把组件的双向绑定设计成明确的 prop + update 事件契约，并用
`defineModel()` 在组件内部安全地读写它。** 主线限定为 SFC、`<script setup lang="ts">`、
Composition API 和 Vue 3.5.40，覆盖：

- 默认 `v-model` 的 `modelValue` / `update:modelValue` 展开契约。
- Vue 3.4+ `defineModel()` 返回的可读写 ref，以及宏到 prop、emit、`useModel()` 的展开。
- 具名 `v-model:name`、多个并列模型和对应的 `update:name` 事件。
- 组件修饰符记录、解构返回值，以及 `get` / `set` transformer 的方向。
- `required`、`default` 的类型与运行时选项，以及父子初始值失同步警告。
- `useModel()` 对“同时收到 prop 和 update listener”的受控判断与未绑定时的本地回退。
- 父值向下同步、子值向上 emit 的调度边界；不把它误读成任意对象深层双向代理。

以下内容明确排除，不进入正文、练习或 Demo：

- Provide / Inject、事件总线、Pinia、全局 store 或跨层依赖共享。
- 组合式函数、`useVModel` 等第三方辅助库或自定义宏。
- Props、Emits、原生表单 `v-model` 的完整入门教学；本课只复用其最小契约。
- Slots、Attributes 透传、动态组件、异步组件、KeepAlive、Teleport、Suspense、Transition。
- Options API 的完整写法；旧式可写 `computed` 只作为底层协议的对照。
- SSR、hydration、服务端状态同步和表单库的完整架构。
- 自定义元素、Web Components、Vue 2 `.sync` 或兼容层行为。
- 多层组件库的模型命名规范、校验库和网络持久化。

**课程依据：** [组件 `v-model`](https://cn.vuejs.org/guide/components/v-model.html)、
[`defineModel()`](https://cn.vuejs.org/api/sfc-script-setup.html#definemodel)、
[Props](https://cn.vuejs.org/guide/components/props.html)、
[组件事件](https://cn.vuejs.org/guide/components/events.html)。版本实现以
[`defineModel.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/script/defineModel.ts)
和 [`useModel.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/useModel.ts)
为准。

## 学习目标

完成本课后，学习者应能：

1. 把 `<Child v-model="value" />` 展开为 `modelValue` prop 与 `update:modelValue` listener。
2. 用 Props + Emits 手动实现默认模型，并说明 `defineModel()` 只是收起样板代码。
3. 用 `defineModel<string>({ required: true })` 声明调用约定为必填、类型排除 `undefined` 的默认模型。
4. 用 `defineModel('title')` 对应 `v-model:title`，并在一个组件中声明多个互相独立的模型。
5. 解释组件修饰符只作为 `modelModifiers` 或 `<name>Modifiers` 传入，转换逻辑必须由子组件定义。
6. 使用 `get` 处理子组件读取值、`set` 处理写回父组件的值，并保持 transformer 纯粹可预测。
7. 识别 `default` 在父级未提供值时造成的初始失同步，并选择 required 或显式初始化的修复方式。
8. 根据 prop 与 `onUpdate:*` listener 是否同时存在，判断模型是受控还是使用本地回退。
9. 通过可复跑 Demo 验证多个模型、修饰符转换、父向下重置和未绑定本地状态。

## 建议教学顺序

### 1. 先冻结“状态向下、事件向上”的最小协议

组件 `v-model` 不是隐式共享状态。父组件仍然拥有状态，子组件收到 prop 并在需要写回时发出
更新事件。默认模型的手写版本是：

```vue
<!-- ChildInput.vue -->
<script setup lang="ts">
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

/** 把原生输入值写回父组件。 */
function emitValue(event: Event) {
  const input = event.target as HTMLInputElement
  emit('update:modelValue', input.value)
}
</script>

<template>
  <input :value="props.modelValue" @input="emitValue" />
</template>
```

父组件的：

```vue
<ChildInput v-model="message" />
```

等价于：

```vue
<ChildInput
  :model-value="message"
  @update:modelValue="$event => (message = $event)"
/>
```

文档使用 `modelValue` 的 camelCase 形式表达 prop 名，模板也允许写成 `model-value`；事件名
`update:modelValue` 是组件协议中的精确字符串。只改 prop 名或只改事件名都会断开绑定。

**官方事实：** [组件 `v-model` 的底层机制](https://cn.vuejs.org/guide/components/v-model.html#under-the-hood)。

### 2. 用 `defineModel()` 替换重复的 prop / emit 样板

从 Vue 3.4 开始，官方推荐在 `<script setup>` 中使用 `defineModel()`：

```vue
<script setup lang="ts">
const model = defineModel<string>({ required: true })

/** 组件内部命令直接写模型 ref。 */
function clear() {
  model.value = ''
}
</script>

<template>
  <input v-model="model" />
  <button type="button" @click="clear">清空</button>
</template>
```

不传名称时，宏声明 `modelValue` prop 和 `update:modelValue` 事件，并返回与父级绑定的模型 ref。
读取 ref 反映最新 prop；给 ref 赋值会经过模型 setter 并触发对应更新事件。它没有改变 Vue 的
单向数据流，只是把 prop 读取、事件写回和模板绑定集中在一个 ref 上。

**官方事实：** [Vue 3.4+ `defineModel()`](https://cn.vuejs.org/api/sfc-script-setup.html#definemodel)、
[组件 `v-model` 基本用法](https://cn.vuejs.org/guide/components/v-model.html#basic-usage)。

### 3. 紧接着引入具名模型和多个 `v-model`

第一个字符串参数是公开模型名：

```vue
<script setup lang="ts">
const firstName = defineModel<string>('firstName', { required: true })
const lastName = defineModel<string>('lastName', { required: true })
</script>

<template>
  <input v-model="firstName" />
  <input v-model="lastName" />
</template>
```

父组件写作：

```vue
<UserName
  v-model:first-name="first"
  v-model:last-name="last"
/>
```

它产生两条互不混淆的链：`firstName` / `update:firstName` 与 `lastName` / `update:lastName`。
名称字符串是组件 API 的一部分；同一个 SFC 中重复声明同名 `defineModel` 会被 compiler-sfc
报错。多个模型不是一个神奇的对象绑定，子组件应为每个独立字段选择稳定名称和类型。

**官方事实：** [具名模型](https://cn.vuejs.org/guide/components/v-model.html#v-model-arguments)、
[多个 `v-model` 绑定](https://cn.vuejs.org/guide/components/v-model.html#multiple-v-model-bindings)。

### 4. 再处理修饰符，而不是假定组件自动执行 `.trim` 或 `.number`

组件上的修饰符会作为 prop 记录传入。默认模型使用 `modelModifiers`，具名模型使用
`<name>Modifiers`，例如 `v-model:title.capitalize` 对应 `titleModifiers: { capitalize: true }`。
`defineModel()` 可解构出第二个值：

```vue
<script setup lang="ts">
const [title, modifiers] = defineModel<string, 'capitalize'>('title', {
  required: true,
  /** 在模型写回父组件前执行 capitalize 修饰符。 */
  set(value) {
    const trimmed = value.trim()
    return modifiers.capitalize
      ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
      : trimmed
  },
})
</script>
```

`v-model:title.capitalize` 只负责把修饰符标记交给子组件；Vue 不会替组件猜测业务转换规则。
需要定义读取显示值时使用 `get`，需要定义写回父组件的值时使用 `set`。二者都应保持同步、纯
函数式且不产生额外副作用。

**官方事实：** [`defineModel` 修饰符与转换器](https://cn.vuejs.org/api/sfc-script-setup.html#modifiers-and-transformers)。

### 5. 用 `required` 与 `default` 说明类型和初始值边界

```ts
const requiredModel = defineModel<string>({ required: true })
const optionalModel = defineModel<string>()
const modelWithDefault = defineModel<number>({ default: 0 })
```

TypeScript 中，默认模型不带选项时通常是 `Ref<T | undefined>`；`required: true` 可消除类型中的
`undefined`。`default` 则在 prop 没有值时为子模型提供默认值，但它不是自动写回父 ref 的初始化
器。若父级 `const parent = ref()` 仍是 `undefined`，子级 `default: 1` 会使首次渲染出现父 `undefined`
与子 `1` 的失同步。修复应是父级显式初始化，或把必填模型改用 `required: true` 并要求调用方提供
绑定；不要用 default 掩盖缺少的父级状态。

**官方警告：** [`defineModel` 默认值失同步](https://cn.vuejs.org/api/sfc-script-setup.html#definemodel)。

### 6. 最后区分受控模型与未绑定时的本地回退

固定版本的 `useModel()` 在 setter 中检查当前组件 vnode 的原始 props：只有同时存在模型 prop
和对应 `onUpdate:*` listener，才认为父组件提供了 `v-model`。受控写入会 emit 更新事件并等待
新的 prop 向下同步；缺少其中任一项时，模型 ref 先更新内部 `localValue`，随后仍 emit 更新事件。

这让可选模型可以在未绑定时保留本地状态，但不应把“父级只传 prop”误读成完整受控：没有 listener
仍属于本地回退分支。若组件必须由父级控制，调用约定应始终提供完整 `v-model`，并用 `required`
表达该约束。Demo 会分别展示完整绑定和省略默认模型绑定的两个实例。

**版本实现事实：** [`useModel.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/useModel.ts)。

## 最小核心知识矩阵

| 场景 | 父模板写法 | 子模型声明 | 运行时契约 |
| --- | --- | --- | --- |
| 默认模型 | `<Child v-model="value" />` | `defineModel()` | `modelValue` + `update:modelValue` |
| 默认模型手写展开 | `:model-value="value" @update:modelValue="..."` | `defineProps` + `defineEmits` | prop 向下、事件向上 |
| 具名模型 | `<Child v-model:title="title" />` | `defineModel('title')` | `title` + `update:title` |
| 多模型 | `v-model:first-name`、`v-model:last-name` | 两次不同名称的 `defineModel` | 每个名称有独立 prop / emit |
| 默认修饰符 | `<Child v-model.trim="value" />` | 解构 `defineModel()` | `modelModifiers.trim === true` |
| 具名修饰符 | `<Child v-model:title.capitalize="value" />` | 解构 `defineModel('title')` | `titleModifiers.capitalize === true` |
| 读取转换 | 父 prop -> 子输入 | `get(value)` | 只改变子侧读取结果 |
| 写回转换 | 子输入 -> 父状态 | `set(value)` | emit 转换后的值；本地回退存入原写入值 |
| 必填模型 | `v-model` 必须提供 | `{ required: true }` | 类型去掉 `undefined`，调用方仍应提供绑定 |
| 默认模型 | 未传 prop 时子侧有值 | `{ default: 0 }` | 可能造成父 `undefined` / 子默认值的初始失同步 |
| 受控 | prop 与 `onUpdate:*` 同时存在 | 任意 `defineModel` | emit 后等待父 prop 回流 |
| 未绑定回退 | 缺少 prop 或 listener | 可选模型 | 先更新 `localValue`，仍 emit 更新事件 |

## 高质量常见易错点

### 1. 只声明 `modelValue`，却没有声明 `update:modelValue`

**错误：** 子组件接收 `modelValue` 后直接修改 prop，或发出 `update:value`。

**正确：** 默认模型必须成对出现：prop 是 `modelValue`，事件是 `update:modelValue`。使用
`defineModel()` 时由宏同时声明这两个边界；手写实现则在 `defineEmits` 中写出精确事件名。

**原因：** 父级 `v-model` 的编译展开只监听 `update:modelValue`。名称不一致不会自动适配，直接
修改 prop 也违反 props 单向数据流。

### 2. 把 `defineModel` 当成运行时可导入函数

**错误：** `import { defineModel } from 'vue'` 后在普通函数或 Options API 中调用它。

**正确：** `defineModel()` 是 Vue 3.4+、仅限 `<script setup>` 的编译器宏；在普通 `setup()` 中
需要手写 Props + Emits，或直接使用公开的 `useModel()` 运行时辅助（本课不展开第三方封装）。

**原因：** compiler-sfc 在编译阶段识别宏并改写为 `useModel(__props, name, options)`；它不是
浏览器运行时导出的普通函数。

### 3. 具名模型的父子名称不完全对应

**错误：** 父级写 `v-model:title`，子级却声明 `defineModel('label')`，或手写事件仍为
`update:modelValue`。

**正确：** 名称必须形成同一条链：`defineModel('title')` 对应 `title` prop 与 `update:title`
事件；父模板的 `v-model:title` 可用 kebab-case，编译器会按同一 prop 名解析。

**原因：** 第一个字符串参数就是公开 prop 名；compiler-sfc 为每个模型独立生成 prop、修饰符
prop 和 update 事件，不会把不同名称合并。

### 4. 在一个组件上重复同名 `defineModel`

**错误：** 为了给两个输入复用字段，重复调用 `defineModel('title')`。

**正确：** 一个模型名只声明一次；需要多个字段就用不同、稳定的名字。compiler-sfc 的
`processDefineModel()` 会在同一 SFC 发现重复名称时报告 `duplicate model name` 编译错误。

**原因：** 同名声明会产生冲突的 prop 选项、修饰符 prop 和事件生成，不是两个 ref 指向同一
协议的合法写法。

### 5. 假定组件 `.trim`、`.number` 会自动转换值

**错误：** 父级写 `v-model:title.trim`，子级只写 `const title = defineModel()`，却期待子级
收到已经裁剪的值。

**正确：** 解构修饰符并在 `set`（写回）或 `get`（读取）中定义明确转换；必要时用第二个类型参数
限制可接受修饰符名称。

**原因：** 组件修饰符只是 `modelModifiers` / `<name>Modifiers` 记录。Vue 不知道业务组件的
数字、大小写或空白策略，也不会替组件隐式执行原生 input 的修饰逻辑。

### 6. 把 `get` 与 `set` 的方向写反，或让 setter 无条件返回 `undefined`

**错误：** 用 `get` 修改父级提交值，或在修饰符关闭时 `set()` 没有返回原值。

**正确：** `get` 只处理 prop 进入子模型读取的值；`set` 必须在所有分支返回将要 emit 的值：

```ts
/** 只在修饰符开启时转换，否则保留原值。 */
function normalize(value: string, capitalize: boolean) {
  const trimmed = value.trim()
  return capitalize ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : trimmed
}
```

**原因：** compiler/runtime 将 `options.get` 应用于 `localValue`，将 `options.set` 应用于写入
值；返回 `undefined` 会把父级更新成错误值。

### 7. 用 `default` 掩盖父级没有初始化模型

**错误：** 子级 `defineModel({ default: 1 })`，父级 `const count = ref()`，然后假定首屏两边都是 1。

**正确：** 要么父级显式 `ref(1)`，要么必填模型使用 `required: true` 并要求调用方提供值；若业务
确实允许缺省，必须在课程 API 中明确“子级默认值与父级状态可能暂时不同”。

**原因：** prop 默认值只在子级解析 props 时生效，不会回写父 ref。Vue 官方文档专门警告父
`undefined`、子默认值非 `undefined` 的初始失同步。

### 8. 认为“传了 prop”就一定是受控 v-model

**错误：** 父级只写 `:title="title"`，子级赋值后却期待父状态跟随；或只监听
`@update:title` 而没有传 `title`，却把它当完整受控。

**正确：** Vue 3.5.40 `useModel()` 只有在当前 vnode 同时有模型 prop 和对应
`onUpdate:*` listener 时才走受控分支；缺少任一项都会先写本地 `localValue`，并仍发出 update 事件。

**原因：** 这是运行时对“是否传入 v-model”的具体判断，不是 TypeScript 类型推断。可选模型应
明确本地回退语义，强制受控组件则用文档和 required 约束调用方。

### 9. 期待 `set` 在本地回退时把模型存储成转换后的值

**错误：** 未绑定实例使用带 `set` transformer 的模型，并假定本地 ref 保存的一定是 transformer
返回值。

**正确：** 固定版本 `useModel()` 在缺少完整 v-model 时把原始写入值写入 `localValue`，同时把
`options.set` 的结果用于 emit；若本地展示也必须规范化，应在业务 setter 外显式处理，不能依赖
父级回流。

**原因：** 受控模式的规范值要靠父级更新 prop 再回流；本地模式没有这次回流。该差异来自
`useModel.ts` setter 的源码和“without parent value / listener (local mutation)”官方测试。

## Vue 3.5.40 源码与官方测试的独立推导

本节把公开契约、固定版本实现事实和课程推导分开，避免把内部实现细节误写成长期 API 承诺。

### 1. compiler-sfc 把宏记录为模型声明并改写调用

`packages/compiler-sfc/src/script/defineModel.ts` 的 `processDefineModel()`：

1. 接受字符串字面量或无表达式的模板字面量作为具名模型；无静态名称时使用 `modelValue`。
2. 记录类型、运行时选项、运行时选项节点和局部标识符到 `ctx.modelDecls`。
3. 为重复模型名报告 `duplicate model name` 编译错误。
4. 把 `defineModel` 调用名改写成 `useModel`，并注入 `__props` 与规范化模型名。

同文件的 `genModelProps()` 为每个模型生成 prop 选项，并额外生成修饰符 prop：默认模型是
`modelModifiers`，具名模型是 `<name>Modifiers`。这解释了为何一个 SFC 可以拥有多个独立模型，
以及修饰符能在 `defineModel()` 返回的第二项中读取。

**固定源码：** [`packages/compiler-sfc/src/script/defineModel.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/script/defineModel.ts)。

### 2. compileScript 官方测试固定宏展开形状

`packages/compiler-sfc/__tests__/compileScript/defineModel.spec.ts` 覆盖并断言：

- 默认模型生成 `modelValue` prop、`modelModifiers` prop 和 `update:modelValue` emit。
- 具名模型生成对应名称的 prop、`<name>Modifiers` prop 和 `update:<name>` emit。
- 多个不同名称并存，绑定 metadata 把模型 ref 标记为 setup ref / prop。
- TypeScript 类型、生产模式 runtime type、`required` / `default` 选项保留。
- `get` / `set` transformer 被作为第三个 `useModel` 参数保留。
- 重复模型名在编译阶段失败；含表达式的模板字面量不能成为稳定模型名，会回退到默认
  `modelValue`。

**固定测试：** [`packages/compiler-sfc/__tests__/compileScript/defineModel.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/__tests__/compileScript/defineModel.spec.ts)。

### 3. useModel 的受控判定是“prop + listener”成对检查

`packages/runtime-core/src/helpers/useModel.ts` 用 `customRef()` 建立模型 ref，并用
`watchSyncEffect()` 观察 `props[camelizedName]`：prop 改变时刷新本地值并触发读取者。setter
先运行 `options.set`，再检查 vnode 原始 props 是否同时含有模型 prop 和以下任一 listener 形式：

```text
onUpdate:<原名>
onUpdate:<camelizedName>
onUpdate:<hyphenatedName>
```

若未同时存在，setter 先更新 `localValue` 并 `trigger()`，仍调用 `emit('update:<name>', emittedValue)`。
若同时存在，setter 只 emit，等待父级新的 prop 回流。源码还在转换后值与旧值相等但本地输入仍需
刷新时强制 `trigger()`，避免格式化输入停留在旧 DOM 状态。

**固定源码：** [`packages/runtime-core/src/helpers/useModel.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/useModel.ts)。

### 4. runtime 官方测试固定本地回退和 transformer 细节

`packages/runtime-core/__tests__/helpers/useModel.spec.ts` 的固定测试包括：

- `basic`：子 ref 写入发出一次 update，父值更新后再次向下同步。
- `with modifiers & transformers`：`get` 把父值转为小写供子读取，`set` 按修饰符把子写入转为大写
  后交给父级。
- `without parent value (local mutation)`：没有 prop 值时，子 ref 可本地更新并仍调用 update listener。
- `without parent listener (local mutation)`：没有 update listener 时走本地回退；有 listener 但无值
  的 kebab-case 变体也有专门断言。
- setter 结果与旧值相等时的强制本地刷新，以及自定义 setter 返回不同值的边界。

这些测试是版本实现证据，不应外推为对未来版本内部触发次数的永久承诺。

**固定测试：** [`packages/runtime-core/__tests__/helpers/useModel.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/helpers/useModel.spec.ts)。

### 5. 课程推导与高级使用场景

1. **受控/未绑定可选模型：** 对确实可独立工作的输入组件，可给模型 default 并允许无绑定实例
   本地编辑；文档和组件名必须说明它不是父状态。需要严格状态所有权时，统一使用 required 模型和
   完整 `v-model`。
2. **边界规范化：** 在 `set` 中做 trim、大小写或单位归一化，在 `get` 中做仅用于显示的格式化；
   不在 transformer 中触发网络、写其他 ref 或修改父级对象。
3. **对象模型的替换原则：** `model.value = nextObject` 会走 setter 并发出更新；直接修改
   `model.value.field` 不会经过 ref setter。若父级需要观察字段更新，子级应发出新对象，而不是依赖
   深层对象引用的“隐式双向”。
4. **多个模型优于含义不清的大对象：** 姓名、状态等独立字段可使用多个具名模型；只有字段必须
   原子提交时才选择一个对象模型，并在类型上固定其结构。
5. **修饰符是协议输入：** 第二个类型参数可把允许的 modifier key 限定为字符串字面量；未知 key
   应被忽略或在组件边界显式拒绝，而不是静默改变其他业务状态。

## 唯一 Demo 冻结规格

### 唯一公开 Demo ID

`vue.core.learn.intermediate.component-v-model.component-model-contract-demo`

本课正文只能出现这一个 `type: 'demo'` block。易错点和源码推导使用静态代码块，不得注册第二个
Demo、playground 变体或单独的修饰符 Demo。

### 父子文件结构

```text
component-model-contract-demo.vue             父 Demo；拥有父级 ref、按钮和断言状态
└── parts/ComponentModelEditor.vue            私有子组件；声明默认、具名和多个 defineModel
```

私有子组件固定名为 `ComponentModelEditor.vue`，不注册第二个 Demo ID。父 Demo 是唯一可导航入口和
raw source 面板入口；子组件只从该入口被导入。

### 子组件模型契约

```ts
const [title, titleModifiers] = defineModel<string, 'capitalize'>('title', {
  required: true,
  /** 裁剪并按修饰符决定是否首字母大写。 */
  set(value) {
    const trimmed = value.trim()
    return titleModifiers.capitalize
      ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
      : trimmed
  },
})

const access = defineModel<'viewer' | 'editor'>('access', { required: true })
const notes = defineModel<string>({ default: '仅存于未绑定子组件' })
```

模板中必须把 `title`、`access`、`notes` 各绑定到一个原生输入或选择控件；不得绕过模型 ref 直接
读取 `$attrs` 或私有 parent。`title` 的 `set` 只处理写回边界，`notes` 的 default 专门用于展示
缺少默认 `v-model` 时的本地回退。

### 父 Demo 初始绑定

```vue
<ComponentModelEditor
  v-model="controlledNotes"
  v-model:title.capitalize="controlledTitle"
  v-model:access="controlledAccess"
/>

<ComponentModelEditor
  v-model:title.capitalize="localTitle"
  v-model:access="localAccess"
/>
```

第一实例为完整受控模型：默认、`title`、`access` 三条链都同时提供 prop 和 update listener。
第二实例只绑定两个具名模型，故 `notes` 没有父级 prop/listener，使用子级 default 和 localValue；
页面必须明确显示“父级没有为 notes 提供绑定”，避免把它误解为同步到某个隐藏父 ref。

### 可复跑交互断言

1. 初始状态：受控实例的标题、权限和备注输入分别显示 `Vue model`、`viewer`、`父级备注`；未绑定
   实例的备注显示 `仅存于未绑定子组件`；控制台无 warning/error。
2. 在受控标题输入一次性填入 `  component models  ` 并触发 input：父级标题状态与受控输入均显示
   `Component models`，首尾空白被 `set` 去除且首字母大写。
3. 在受控备注输入 `父级已同步`：父级状态文本立即显示相同值；点击父级重置后，受控输入回到
   `父级备注`，证明 prop 从父到子回流。
4. 把受控权限从 `viewer` 切换到 `editor`：父级权限文本变为 `editor`，子选择框也同步。
5. 在未绑定实例备注输入 `本地草稿`：该输入变为 `本地草稿`，未绑定标识保持“父级没有绑定”，且
   页面没有伪造的父级 notes 更新值。
6. 连续两次切换受控权限只各增加一次状态变更；每个输入事件只触发相应 `update:*` 链，不出现
   重复事件或 extraneous listener warning。
7. 390px 宽度下两实例纵向排列，长状态文本可换行，页面无横向滚动；所有输入均有可访问 label。

不要把“没有父级绑定”实现成动态卸载或手写 `useModel`；它必须来自真实缺失的默认模型 prop/listener，
以保留官方 runtime local fallback 的可验证 seam。

### Demo 布局与可访问性约束

- 使用 flex 与 margin 组织两列/单列布局，不使用 CSS `grid` 或 `gap`。
- 输入、选择和按钮使用原生控件，最小触控高度 44px；状态文本使用 `aria-live="polite"` 时只播报
  结果摘要，不重复整份表格。
- 390px 和 200% 文本缩放下，模型名称、修饰符和状态值允许换行且不遮挡相邻内容。
- 不使用远程资源、动画、Transition、随机值或时间戳；Demo 只展示确定的父子模型行为。

## 建议 metadata

```ts
export const meta = defineLessonMeta({
  id: 'vue.core.learn.intermediate.component-v-model',
  type: 'lesson',
  title: '组件 v-model',
  summary: '设计 modelValue、具名模型与 update 事件契约，并用 defineModel 实现受控双向绑定',
  ecosystem: 'vue',
  module: 'core',
  collection: 'intermediate',
  level: 'intermediate',
  prerequisites: ['vue.core.learn.intermediate.attrs'],
  related: [
    'vue.core.learn.intermediate.attrs',
    'vue.core.learn.basics.form-bindings',
    'vue.core.learn.basics.props',
    'vue.core.learn.basics.emits',
    'vue.core.reference.components.define-model',
  ],
  tags: [
    '组件 v-model',
    'defineModel',
    'modelValue',
    'update:modelValue',
    '具名模型',
    '修饰符',
    '受控组件',
  ],
  sources: [
    {
      title: 'Vue 组件 v-model 指南',
      url: 'https://cn.vuejs.org/guide/components/v-model.html',
    },
    {
      title: 'Vue <script setup> defineModel',
      url: 'https://cn.vuejs.org/api/sfc-script-setup.html#definemodel',
    },
    {
      title: 'Vue 组件 Props',
      url: 'https://cn.vuejs.org/guide/components/props.html',
    },
    {
      title: 'Vue 组件事件',
      url: 'https://cn.vuejs.org/guide/components/events.html',
    },
    {
      title: 'Vue 3.5.40 compiler-sfc defineModel.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/script/defineModel.ts',
    },
    {
      title: 'Vue 3.5.40 runtime-core useModel.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/useModel.ts',
    },
    {
      title: 'Vue 3.5.40 compiler defineModel 官方测试',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/__tests__/compileScript/defineModel.spec.ts',
    },
    {
      title: 'Vue 3.5.40 runtime useModel 官方测试',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/helpers/useModel.spec.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-07-31',
  estimatedMinutes: 50,
})
```

上述 prerequisite 是唯一直接前置；related 的五项内容与顺序精确冻结。唯一公开 Demo ID、父
入口文件名和私有 `ComponentModelEditor.vue` 文件名也是冻结契约。课程实现完成后再由实施批次决定
是否把 catalog 状态改为 `available`；本调研不修改任何源码或注册表。

## 后续最小实施范围

后续实现可限定为：

- `src/content/entries/learn/vue/core/intermediate/component-v-model.ts`
- `src/content/demos/vue/core/learn/intermediate/component-v-model/component-model-contract-demo.vue`
- `src/content/demos/vue/core/learn/intermediate/component-v-model/parts/ComponentModelEditor.vue`
- `src/content/catalog/manifests/vue-core-track.ts`
- `src/content/catalog/vue-core-track.spec.ts`
- `src/content/interactive/registry.spec.ts`
- `tests/e2e/progress.spec.ts`
- `docs/重构实施计划.md`

不需要修改 schema、现有 Props / Emits / form-bindings / attrs / define-model 条目、Slots 课程、
Provide / Inject 课程、全局样式或其他阶段 6 课程。不要为九个易错点分别创建测试；本地只测试
真正承诺的模型回路，compiler/runtime 机制由固定标签官方测试提供证据。

## 固定来源清单

### Vue 官方中文文档

- [组件 `v-model`](https://cn.vuejs.org/guide/components/v-model.html)：Vue 3.4+ 推荐
  `defineModel()`、手写 `modelValue` / `update:modelValue` 展开、参数、多个模型、修饰符、
  `required` / `default` 与初始失同步警告。
- [`<script setup>` `defineModel`](https://cn.vuejs.org/api/sfc-script-setup.html#definemodel)：
  默认与具名签名、类型参数、修饰符解构、`get` / `set` transformer、required 去除 undefined。
- [组件 Props](https://cn.vuejs.org/guide/components/props.html)：父向子传入 prop 的单向数据流
  前置契约。
- [组件事件](https://cn.vuejs.org/guide/components/events.html)：子向父发出更新事件的边界。

### vuejs/core v3.5.40 固定源码

- [`packages/compiler-sfc/src/script/defineModel.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/script/defineModel.ts)：
  静态模型名解析、重复名报错、`defineModel` -> `useModel` 改写、模型 prop 与修饰符 prop 生成。
- [`packages/runtime-core/src/helpers/useModel.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/useModel.ts)：
  `customRef`、prop 同步、受控 prop + listener 判定、本地回退、modifier 读取和 transformer 应用。

### vuejs/core v3.5.40 官方测试

- [`packages/compiler-sfc/__tests__/compileScript/defineModel.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/__tests__/compileScript/defineModel.spec.ts)：
  默认/具名/多个模型的生成、模型修饰符 prop、TypeScript runtime type、required/default、
  get/set transformer、重复或动态名称的编译约束。
- [`packages/runtime-core/__tests__/helpers/useModel.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/helpers/useModel.spec.ts)：
  basic 父子同步、modifier + transformer、无父值/无父 listener 的 local mutation、kebab-case
  listener 和格式化后相同值时的本地刷新。

## 自检结论

- 课程 ID 已冻结为 `vue.core.learn.intermediate.component-v-model`；唯一 prerequisite 为
  `vue.core.learn.intermediate.attrs`。
- related 已冻结为五项有序列表：attrs、basics.form-bindings、basics.props、basics.emits、
  reference.define-model；每项均可解析。
- 唯一公开 Demo ID 为 `vue.core.learn.intermediate.component-v-model.component-model-contract-demo`；
  父入口为 `component-model-contract-demo.vue`，私有子组件为 `parts/ComponentModelEditor.vue`。
- 已覆盖 `modelValue` / `update:modelValue` 展开、Vue 3.4+ `defineModel`、具名/多个模型、修饰符、
  get/set、required/default、父子初始失同步、受控与未绑定 local fallback。
- 共列出 9 个含错误、正确、原因的高质量易错点，并另列源码推导与高级使用场景。
- 明确排除 Provide / Inject 及其所在下一分类，不把本调研写成阶段 6 或整条课程线 closure。
- Tavily Search / Extract 已成功；固定来源全部为 Vue 官方中文文档、`vuejs/core@v3.5.40` 源码或
  同标签官方测试。
