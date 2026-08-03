# Vue Core 基础课程：表单输入绑定调研

> 核验日期：2026-07-30
>
> 适用版本：Vue 3.5.40。
>
> 资料范围：Vue 中文/英文官方文档、`vuejs/core` 的 `v3.5.40` 固定标签源码与
> 同标签官方测试。外部资料通过 Tavily 检索、提取后，所有结论均回到这些一手来源核验。

## 课程定位与边界

本课目标 ID 为 `vue.core.learn.basics.form-bindings`。按当前仓库冻结顺序，它紧随
`vue.core.learn.basics.event-handling`，之后才进入组件基础与通信。课程只讲原生
`<input>`、`<textarea>`、`<select>` 上的 `v-model`：学习者已经知道如何监听事件，本课进一步
理解 Vue 如何按控件类型组合 DOM property、事件和值转换，让表单状态与 JavaScript 状态同步。

本课面向 Composition API、`<script setup lang="ts">` 与原生表单元素。以下内容明确排除：

- 组件上的 `v-model`、`defineModel()`、`modelValue` / `update:modelValue` 协议；它们只作为后续
  关联，不在正文或 Demo 中实现。
- Props、Emits、父子通信、表单组件封装、第三方表单库与完整校验框架。
- 文件上传、富文本、日期选择器封装与远程提交流程；文件 input 只说明为什么不能使用
  `v-model`。
- SSR 教程本身。这里只记录原生表单初始 HTML 与水合有关的固定版本边界，不展开服务端应用。

**课程依据：** [Vue 表单输入绑定](https://cn.vuejs.org/guide/essentials/forms.html)、
[Vue 内置指令：v-model](https://cn.vuejs.org/api/built-in-directives.html#v-model)、
[`vue-core-track.ts`](../../src/content/catalog/manifests/vue-core-track.ts)。

## 学习目标

完成本课后，学习者应能：

1. 把原生元素上的 `v-model` 解释成“DOM property + 事件”的双向同步，而不是不可观察的魔法。
2. 为 text、textarea、checkbox、radio、单选与多选 select 选择正确的模型类型和初始值。
3. 用 `:value`、`:true-value`、`:false-value` 保留数字、对象等非字符串值。
4. 准确预测 `.lazy`、`.number`、`.trim` 的更新时机、转换结果与不适用边界。
5. 解释 IME 拼字期间为何暂不更新，并在确实需要组合中间值时改用显式 `:value` / `@input`。
6. 避免多选模型、对象身份、原生表单提交及 SSR 初始选中状态的常见误判。

## 建议教学顺序

### 1. 从上一课的显式绑定推导 `v-model`

先展示 text input 的显式写法，再替换为 `v-model`：

```vue
<input
  :value="message"
  @input="message = ($event.currentTarget as HTMLInputElement).value"
/>

<!-- 对原生文本输入，上面的核心同步可简写为 -->
<input v-model="message" />
```

这一步只建立语法糖模型。不要先把所有控件都说成 `value + input`，因为 checkbox/radio 使用
`checked + change`，select 也在 `change` 时收集选项。

### 2. 先学 text 与 textarea，再讲 IME

让学习者观察“用户输入更新状态，程序修改状态也回写输入框”的双向过程。随后单独解释中文、
日文、韩文等输入法的 composition 阶段：默认 `v-model` 不把未确认的拼字中间值写入模型，
`compositionend` 后才同步最终文本。

`<textarea>` 与文本 input 共用文本运行时，但 textarea 的初始内容不能写成插值；应统一用
`v-model` 的 JavaScript 初始状态。

### 3. 按模型形状拆开 checkbox

依次讲三种含义，不能只按外观归为一种控件：

1. 单个 checkbox + 标量模型：默认得到 `true` / `false`。
2. 单个 checkbox + `true-value` / `false-value`：得到自定义两态值。
3. 多个 checkbox + Array 或 Set：按每个 checkbox 的 `value` 增删成员。

先用字符串 Array 建立最小模型，再说明 Vue 3.5.40 客户端也支持 Set。对象值和 Set 的身份边界
放到易错提示，不在第一个示例中增加难度。

### 4. 用 radio 与 select 建立“选项值”模型

radio 把被选中的 `value` 写入一个标量；单选 select 把一个 option 值写入标量；多选 select
写入 Array，客户端也可保留 Set。静态 `value="1"` 是字符串，`:value="1"` 才是数字。

select 应从一个能匹配 option 的初始值开始；需要“请选择”状态时，提供 `disabled value=""` 的
占位 option，避免 iOS 上未匹配初始状态无法触发第一项 change 的官方已知问题。

### 5. 最后讲三个修饰符

- `.lazy`：文本控件从 `input` 改为 `change` 后更新，不等于防抖或保存。
- `.number`：使用 Vue 的宽松数值转换；`type="number"` 会自动启用，但空值和不可解析文本仍可能
  是字符串。
- `.trim`：提交到模型前去除首尾空白，不改变中间空白，也不是通用数据净化。

修饰符应结合“事件时机、输入值、模型值”三列状态观察，不要只背名称。

### 6. 以文件 input、组件与 SSR 边界收束

文件 input 的 `value` 是只读安全边界，编译器直接拒绝 `v-model`，应使用 `@change` 读取
`files`。组件 `v-model` 虽然复用同一模板名字，却走 props/emits 协议，留给中级课程。

最后说明 SSR 只负责输出初始 value/checked/selected；当前固定版本的服务端优化编译路径与客户
端对 Set 的覆盖不完全相同，因此本课 Demo 使用 Array 作为多选模型，避免把客户端能力误写为
跨 SSR 路径的无条件保证。

## 最小核心知识

### 原生元素的 property 与事件矩阵

| 元素/类型 | DOM 状态 | 用户更新事件 | 建议模型 |
| --- | --- | --- | --- |
| text input / textarea | `value` | `input`；`.lazy` 时为 `change` | `string`；`.number` 时为 `number \| string` |
| checkbox（单个） | `checked` | `change` | `boolean` 或 true/false 自定义值 |
| checkbox（同组） | `checked` + 每项 `value` | `change` | `Array<T>`；客户端也支持 `Set<T>` |
| radio | `checked` + 该项 `value` | `change` | 单个选项值 |
| select（单选） | 当前 option | `change` | 单个选项值或空字符串 |
| select（多选） | 所有 selected options | `change` | `Array<T>`；客户端也支持 `Set<T>` |

`v-model` 始终把 JavaScript 状态作为真值来源。模板上的静态 `value`、`checked`、`selected`
不能替代 `ref()` / `reactive()` 中的初始值。

### text、textarea 与 IME

```vue
<script setup lang="ts">
import { ref } from 'vue'

const title = ref('初始标题')
const note = ref('')
</script>

<template>
  <label for="title">标题</label>
  <input id="title" v-model="title" />

  <label for="note">备注</label>
  <textarea id="note" v-model="note"></textarea>
</template>
```

文本运行时在 `compositionstart` 标记元素正在拼字；普通 `input` 处理器看到该标记会直接返回；
`compositionend` 清除标记并派发一次 `input`，把最终文本同步到模型。`.lazy` 本来就在 `change`
时同步，因此不会注册这组 composition 监听器。

确实需要搜索建议等“拼字中间值”时，官方建议放弃该字段上的 `v-model`，显式使用 `:value` 与
`@input`。这是一种需求差异，不是通过给 `v-model` 再叠一个修饰符解决。

### checkbox 的三种模型

```vue
<script setup lang="ts">
import { ref } from 'vue'

const accepted = ref(false)
const publishState = ref<'published' | 'draft'>('draft')
const channels = ref<string[]>([])
</script>

<template>
  <input id="accepted" v-model="accepted" type="checkbox" />

  <input
    id="publish"
    v-model="publishState"
    type="checkbox"
    true-value="published"
    false-value="draft"
  />

  <input id="email" v-model="channels" type="checkbox" value="email" />
  <input id="sms" v-model="channels" type="checkbox" value="sms" />
</template>
```

Array 模型选中时创建追加后的新数组，取消时复制后删除对应成员。Set 模型同样会克隆为新 Set 后
增删，再把新集合赋回模型。这个实现既保留集合类型，也让响应式系统能观察到一次明确替换。

`true-value` / `false-value` 只用于标量 checkbox；组选择要用每项的 `value`。三者不能混为
“checkbox 的固定返回类型”。

### radio、select 与动态值

```vue
<script setup lang="ts">
import { ref } from 'vue'

const plan = ref<'basic' | 'pro'>('basic')
const level = ref(1)
const tags = ref<string[]>([])
</script>

<template>
  <input id="basic" v-model="plan" type="radio" value="basic" />
  <input id="pro" v-model="plan" type="radio" value="pro" />

  <select v-model="level">
    <option :value="1">入门</option>
    <option :value="2">进阶</option>
  </select>

  <select v-model="tags" multiple>
    <option value="vue">Vue</option>
    <option value="typescript">TypeScript</option>
  </select>
</template>
```

`:value` 会把原始数字、对象甚至 Symbol 保存在元素的内部值槽中；读取选项时 Vue 优先返回该
原始值，而不是 DOM 只能表达的字符串 `value`。这正是动态值能穿过原生表单控件的原因。

### `.lazy`、`.number`、`.trim`

```vue
<input v-model.lazy.trim="nickname" />
<input v-model.number="age" inputmode="decimal" />
<select v-model.number="priority">
  <option value="1">低</option>
  <option value="2">高</option>
</select>
```

文本运行时按 `trim` 后 `number` 的顺序转换。`.number` 和 `type="number"` 使用
`looseToNumber()`：可解析时返回数字，不可解析时保留原字符串；清空输入得到 `''`。select 的
`.number` 则在收集每个已选 option 时做相同转换。

checkbox 和 radio 运行时不读取这三个修饰符；select 只读取 `.number`。不要假设所有修饰符对
所有原生控件都有等价效果。

## 源码与测试证据

### 1. 编译器按元素与 input type 选择运行时指令

`packages/compiler-dom/src/transforms/vModel.ts` 把 text/textarea、checkbox、radio、select 与
动态 type 分派给不同 helper。`<input type="file" v-model>` 会产生编译错误；原生元素上的
`v-model:arg` 也不支持。对应官方编译测试覆盖各元素、动态 type、三个修饰符和错误分支。

这说明原生 `v-model` 不是一个在运行时反复猜控件的通用监听器；静态类型会在编译期选择专用
实现，只有动态 `:type` 或动态键绑定才走 `vModelDynamic`。

### 2. 文本指令处理转换、IME 与焦点中的回写

`packages/runtime-dom/src/directives/vModel.ts` 的 `vModelText` 在 created 时登记 input/change，
再按 `trim`、`number` 转换后调用模型赋值器。非 lazy 模式额外监听 compositionstart/end。

beforeUpdate 不会在拼字中覆盖 DOM；输入框聚焦时，lazy 模型未变化或 trim 后已相等也会跳过
无意义赋值。这些条件用于避免未确认文本、光标和用户正在编辑的可见值被补丁打断。

### 3. checkbox 由当前模型形状决定行为

`vModelCheckbox` 读取 `_modelValue`：Array 使用宽松查找后生成新数组；Set 使用 `has/add/delete`
并克隆新 Set；其他值由 `checked` 选择 true-value 或 false-value。`setChecked()` 反向把模型状态
映射到 DOM checked。

官方运行时测试分别覆盖 boolean、自定义字符串与对象 true/false 值、Array 和 Set，证明这些是
Vue 3.5.40 的真实客户端能力，而不是只来自文档示例的推测。

### 4. radio 与 select 保留动态原始值

radio 用 `looseEqual(model, vnode.props.value)` 决定 checked，change 时写入元素原始值。select
遍历 selected options，单选写入第一项，多选根据旧模型类型返回 Array 或 Set。

DOM patch 模块把动态 value 缓存在 `_value`，true-value/false-value 分别缓存在 `_trueValue` /
`_falseValue`；`getValue()` 优先读缓存。因此 `:value="object"` 不会被强制降为
`"[object Object]"`。

### 5. 多选 Array 与 Set 的比较规则不同

多选 Array 对字符串/数字 option 做字符串等价比较，对其他值使用 looseEqual 查找；Set 直接调用
`has(optionValue)`。所以 Set 中的对象值依赖稳定对象身份，Array 对象值则允许 Vue 的宽松深比较。
课程主线应使用稳定 primitive 值，复杂对象选择只作为进阶说明。

### 6. SSR 优化编译路径没有完整复用客户端 Set 分支

`packages/compiler-ssr/src/transforms/ssrVModel.ts` 会为 text/textarea 输出初始 value/文本，为
radio/checkbox 输出 checked，并递归处理 select 下的 option。v3.5.40 的静态 SSR checkbox 与
select 判断主要分支是 `Array.isArray(model)`；不是 Array 时分别退到模型真值或单值 looseEqual，
没有客户端 `isSet()` / `Set.has()` 的等价路径。

`runtime-dom` 的 `initVModelForSSR()` 对“在 SSR 中使用面向客户端的 render function”提供了
checkbox Set 分支，但这不能替代优化 SSR 模板编译路径。结论必须限定为：Array 是本课 SSR
敏感多选示例的稳妥模型；不能宣称 v3.5.40 的所有 SSR 路径都与客户端 Set 行为一致。水合的完整
时序不属于本课，不能仅凭客户端 mounted 修正逻辑推断绝不会出现初始状态差异。

## 真实常见易错点

### 1. 同时写静态 value/checked/selected，期待它覆盖模型初始值

**原因：** 原生 `v-model` 始终把 JavaScript 状态视为真值来源，挂载后会按模型重设 DOM。
`<textarea>` 的子文本插值也不是输入值绑定。

**后果：** 首屏看似有默认值，挂载后却被清空或取消选中；textarea 插值永远不能随模型同步。

```vue
<!-- 错误：三个 DOM 初始 attribute 都会让位给空模型 -->
<input v-model="name" value="Ada" />
<input v-model="accepted" type="checkbox" checked />
<textarea>{{ note }}</textarea>

<!-- 正确：在 JavaScript 中声明唯一初始状态 -->
<script setup lang="ts">
import { ref } from 'vue'

const name = ref('Ada')
const accepted = ref(true)
const note = ref('欢迎')
</script>

<input v-model="name" />
<input v-model="accepted" type="checkbox" />
<textarea v-model="note"></textarea>
```

**来源：** [Vue 表单输入绑定：基础用法](https://cn.vuejs.org/guide/essentials/forms.html#basic-usage)、
[`runtime-dom vModel.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/directives/vModel.ts)。

### 2. 把 IME 拼字阶段没有更新当成输入丢失

**原因：** 默认文本 `v-model` 主动忽略 composing 状态，等 compositionend 后再派发最终 input。

**后果：** 用模型驱动逐字搜索或候选提示时，中文/日文/韩文用户在确认文字前看不到预期结果；
开发者若再叠额外监听，可能重复请求。

```vue
<!-- 错误方向：既依赖 v-model，又假设每个拼字中间 input 都已进入 query -->
<input v-model="query" @input="search(query)" />

<!-- 正确：只需要确认后的文本时，直接监听模型使用结果 -->
<input v-model="query" />

<!-- 正确：确实需要中间值时，显式读取 DOM，不使用该字段的 v-model -->
<input :value="query" @input="readComposingValue" />
```

```ts
/** 读取包括 IME 拼字阶段在内的当前 DOM 文本。 */
function readComposingValue(event: Event): void {
  query.value = (event.currentTarget as HTMLInputElement).value
}
```

**来源：** [Vue 表单输入绑定：IME 提示](https://cn.vuejs.org/guide/essentials/forms.html#vmodel-ime-tip)、
[`runtime-dom vModel.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/directives/vModel.ts)。

### 3. 多个 checkbox 仍把模型初始化成 boolean 或字符串

**原因：** checkbox 运行时根据当前模型形状选择“二态值”或“集合成员”语义，不会根据控件数量
自动创建数组。

**后果：** 选择任意一项只把模型改成 true/false，无法知道选中了哪几项。

```vue
<script setup lang="ts">
import { ref } from 'vue'

// 错误：这是单 checkbox 的二态模型
const wrongChannels = ref(false)

// 正确：同组 checkbox 使用 Array 或客户端 Set
const channels = ref<string[]>([])
</script>

<input v-model="channels" type="checkbox" value="email" />
<input v-model="channels" type="checkbox" value="sms" />
```

**来源：** [Vue 表单输入绑定：复选框](https://cn.vuejs.org/guide/essentials/forms.html#checkbox)、
[`runtime-dom vModel.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/directives/vModel.ts)。

### 4. 以为 true-value/false-value 会改变浏览器原生表单提交

**原因：** 它们是 Vue 为模型同步维护的专用 attribute，不会改变 checkbox 的原生 `value`；浏览
器也不会提交未选中的 checkbox。

**后果：** JavaScript 模型显示 `no`，但 `new FormData(form)` 中该字段可能完全不存在。

```vue
<!-- 错误假设：未选中时原生表单会提交 notify=no -->
<input
  v-model="notify"
  name="notify"
  type="checkbox"
  true-value="yes"
  false-value="no"
/>

<!-- 正确方向：必须原生提交 yes/no 时使用 radio 两项 -->
<input v-model="notify" name="notify" type="radio" value="yes" />
<input v-model="notify" name="notify" type="radio" value="no" />
```

**来源：** [Vue 表单输入绑定：复选框值绑定](https://cn.vuejs.org/guide/essentials/forms.html#checkbox-1)。

### 5. 忘记 `:`，把数字或对象 option 当成字符串

**原因：** HTML 静态 attribute 只有字符串语义；只有 `v-bind:value` / `:value` 才会保留
JavaScript 原始值。

**后果：** `selected === 1` 判断失败，或模型得到 `"option"`、`"[object Object]"` 而非业务对象。

```vue
<!-- 错误：priority 得到字符串 "1" -->
<option value="1">高</option>

<!-- 正确：priority 得到 number 1 -->
<option :value="1">高</option>

<!-- 正确：也可以绑定稳定业务对象 -->
<option :value="priorityOption">高</option>
```

**来源：** [Vue 表单输入绑定：值绑定](https://cn.vuejs.org/guide/essentials/forms.html#value-bindings)、
[`runtime-dom props.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/modules/props.ts)。

### 6. 用 Set 保存每次渲染都新建的对象 option

**原因：** Set 分支用原生 `Set.has(optionValue)`，依赖对象身份；内联对象或重新映射出的 option
对象可能不是 Set 中原来的引用。

**后果：** 模型 Set 看似有等价对象，checkbox 或多选 option 却不显示选中，取消时也删除不到旧
成员。

```vue
<!-- 错误方向：每次求值都可能产生新的对象身份 -->
<input v-model="selected" type="checkbox" :value="{ id: course.id }" />

<!-- 正确：Set 优先保存稳定 primitive key -->
<input v-model="selectedIds" type="checkbox" :value="course.id" />
```

```ts
const selectedIds = ref(new Set<number>())
```

**来源：** [`runtime-dom vModel.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/directives/vModel.ts)、
[`runtime-dom vModel.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/__tests__/directives/vModel.spec.ts)。

### 7. 给 `<select multiple>` 绑定标量，或让单选初始值不匹配任何 option

**原因：** 多选需要承载多个成员；客户端运行时只接受 Array/Set。单选未匹配时 selectedIndex 为
-1，iOS 又可能不为第一次选择首项触发 change。

**后果：** 多选发出开发警告且不能稳定回写；单选看似可选，用户点第一项却无法进入模型。

```vue
<script setup lang="ts">
import { ref } from 'vue'

// 错误：multiple 不能用单个字符串承载多项
const wrongTags = ref('')

// 正确
const tags = ref<string[]>([])
const region = ref('')
</script>

<select v-model="region">
  <option disabled value="">请选择地区</option>
  <option value="north">北区</option>
</select>

<select v-model="tags" multiple>
  <option value="vue">Vue</option>
  <option value="ts">TypeScript</option>
</select>
```

**来源：** [Vue 表单输入绑定：选择器](https://cn.vuejs.org/guide/essentials/forms.html#select)、
[`runtime-dom vModel.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/directives/vModel.ts)。

### 8. 认为 `.number` 保证模型永远是 number

**原因：** Vue 使用宽松 parseFloat 转换，无法解析时保留原值；空输入明确得到空字符串。
`type="number"` 也会自动走同一转换，而不是 `valueAsNumber`。

**后果：** 对空值直接做算术、调用数字方法或提交严格数字 schema 时得到类型错误或意外拼接。

```vue
<!-- 错误假设：age 的运行时类型永远是 number -->
<input v-model.number="age" />

<!-- 正确：模型类型和提交边界显式容纳空字符串 -->
<script setup lang="ts">
import { ref } from 'vue'

const age = ref<number | string>('')

/** 把可空输入转换为提交载荷。 */
function toAgePayload(): number | null {
  return typeof age.value === 'number' ? age.value : null
}
</script>
```

**来源：** [Vue 表单输入绑定：.number](https://cn.vuejs.org/guide/essentials/forms.html#number)、
[`runtime-dom vModel.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/directives/vModel.ts)。

### 9. 把 `.lazy` 当成防抖，把 `.trim` 当成完整校验

**原因：** `.lazy` 只是把文本同步事件换成 change；`.trim` 只去除首尾空白。两者都不提供延迟
计时、格式校验、去除中间空白或提交事务。

**后果：** 界面在失焦前读取旧模型，搜索仍可能在每次 change 后立即执行；非法内容只是被修边，
仍进入业务状态。

```vue
<!-- 错误认知：这不是 300ms 防抖，也不是用户名校验 -->
<input v-model.lazy.trim="username" />

<!-- 正确：把它描述为“change 时提交首尾修剪后的文本” -->
<label for="username">用户名（离开输入框后更新）</label>
<input id="username" v-model.lazy.trim="username" />
```

需要防抖、异步校验或提交应在后续业务层显式实现，不能给修饰符附加不存在的保证。

**来源：** [Vue 表单输入绑定：修饰符](https://cn.vuejs.org/guide/essentials/forms.html#modifiers)、
[`runtime-dom vModel.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/directives/vModel.ts)。

### 10. 在 file input 上使用 `v-model`

**原因：** 浏览器不允许脚本按普通 value 方式设置文件选择；Vue 编译器为此明确报错。

**后果：** 模板无法通过编译，或错误地把文件路径字符串当成 File 数据。

```vue
<!-- 错误 -->
<input v-model="files" type="file" multiple />

<!-- 正确：监听 change 并读取 FileList -->
<input type="file" multiple @change="selectFiles" />
```

```ts
/** 保存用户主动选择的文件对象。 */
function selectFiles(event: Event): void {
  files.value = Array.from((event.currentTarget as HTMLInputElement).files ?? [])
}
```

**来源：** [`compiler-dom vModel.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-dom/src/transforms/vModel.ts)、
[`compiler-dom vModel.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-dom/__tests__/transforms/vModel.spec.ts)。

## 源码推导的适用场景与高级用法

以下结论来自固定版本实现，用于回答“为什么这样选”和“什么时候值得用”，不要求初学者记内部
符号名。

### 1. 用动态 input type 组织小型原生字段配置

编译器遇到 `:type` 时选择 `vModelDynamic`，运行时会在每个指令钩子按最终标签/type 分派到 text、
checkbox 或 radio 实现。因此一个受控的小型字段配置可以复用模板：

```vue
<input v-model="fieldValue" :type="fieldType" />
```

适合字段类型只在 text/checkbox/radio 等兼容模型间变化的简单场景。若类型切换也改变模型形状，
例如 string 切成 checkbox 数组，显式分支通常更清楚；不能只靠动态分派掩盖数据协议变化。

### 2. 用 Array 表达有顺序选择，用 Set 表达客户端唯一成员

checkbox 与多选 select 都会保留旧模型的 Array/Set 形状。Array 适合需要选中顺序或直接序列化的
值；Set 适合客户端频繁 membership 判断与天然去重。运行时会创建新集合后赋值，不要求手工
`triggerRef()`。

SSR 敏感页面在 v3.5.40 应优先 Array；Set 只作为客户端进阶能力，并使用稳定 primitive 成员。

### 3. 直接绑定领域值，减少字符串解析层

动态 `:value` 通过元素内部槽保留原始值，radio、checkbox 和 select 可以直接输出数字或稳定
对象。适合选项已经来自同一个稳定数据源，且下游确实需要该值类型的场景。

若状态要进入 URL、JSON、FormData 或持久化层，primitive ID 通常比整个对象更稳定，也避免 Set
对象身份问题。源码能力不等于所有架构都应该保存对象。

### 4. 利用 `.number` 统一 text/select 的宽松数字入口

`vModelText` 与 `vModelSelect` 都复用 looseToNumber，可让文本字段与数字 option 以相同规则进入
模型。适合空值合法、提交时另做严格校验的筛选器或草稿表单。

金额、计量或严格 schema 不应把它当最终解析器，因为空字符串和不可解析内容会保留原值。

### 5. 把 IME 最终值与组合中间值设计成不同交互

源码用 composing 标记与 compositionend 合成 input，说明 Vue 默认优化的是“确认后的文本状态”。
普通表单、保存草稿和最终搜索可以直接使用默认模型；候选词、拼音提示或输入法诊断才需要显式
监听 composition/input，并清楚标注这是更低层交互。

### 6. 聚焦中的 DOM 值与模型值允许短暂不同

文本 beforeUpdate 会在 composing、lazy 未提交或 trim 后等价时跳过回写。这种设计保护用户正在
编辑的内容和光标，而不是要求 DOM 每一瞬间都与规范化模型字节一致。

因此实时格式化、掩码和光标控制不应继续叠加普通 `v-model` 猜测时序；它们更适合专用输入组件，
但组件 v-model 实现属于后续课程。

## 单一同源 Demo 冻结

### 名称与目标

唯一 Demo 命名为“表单状态实验台”，建议资产 ID：

`vue.core.learn.basics.form-bindings.form-state-lab-demo`

它只回答一个问题：同一份 JavaScript 表单状态如何随不同原生控件、值类型和修饰符更新。Demo
组件本身同时作为运行实现与源码展示来源，不再复制第二份示例源码。

### 状态与交互

- “即时资料”：普通 text 与 textarea，直接显示模型值。
- “提交时资料”：一个 `v-model.lazy.trim` 字段，同时显示 DOM 正在输入提示和已进入模型的值，让
  学习者通过失焦观察 change 边界。
- “数字入口”：`v-model.number`，状态面板同时显示值与 `typeof`，清空后明确显示空字符串。
- “选择偏好”：boolean checkbox、字符串 Array checkbox 组、radio、带空禁用项的单选 select、
  Array 多选 select。
- “动态值”：单选 option 使用 `:value="1"` / `:value="2"`，状态面板证明结果是 number。
- “重置表单”按钮只把所有 refs 恢复到同一组初始值，不发请求、不使用 watcher。

Demo 不加入组件、`defineModel()`、子组件 emits、远程提交、校验库、文件选择、SSR 开关或多套状态
源。IME 行为由真实输入框自然保留，不制作模拟输入法的伪控制器。

### 390px 与可访问性验收

- 390px 下严格单列；使用 flex 与相邻 margin，不使用 CSS Grid 或 `gap` 属性。
- 所有 input/textarea/select 都有可见 `<label for>`；checkbox/radio 组使用 `<fieldset>` 与
  `<legend>`，不用 placeholder 充当名称。
- 控件宽度不超过容器，设置 `min-width: 0`；多选框和状态值允许纵向增长，不产生横向滚动。
- 重置按钮至少 44px 高；checkbox/radio 的整行标签可点击，不能只提供很小的方框命中区。
- 状态面板使用稳定的 definition list 或普通列表，长字符串可换行，值变化不推动外层布局横跳。
- 状态更新可用克制的 `aria-live="polite"`，但不要让每次键入都播报整张状态快照。
- 不能只靠颜色区分 boolean、string、number 与 Array；同时显示文本类型和值。

## prerequisites / related ID 核对

以下 ID 均通过当前本地 entry 与 catalog 精确核对，可解析为已有内容；不推荐尚无正文的 planned
条目作为本课 related。

### prerequisites

- `vue.core.learn.basics.event-handling`：唯一前置。学习者已经理解 `@input` / `@change` 的事件
  因果关系，本课才适合把重复的 property + handler 折叠为原生 `v-model`。

不能再堆叠 `reactive-state`、`computed-properties` 等间接前置；冻结课程链已经覆盖它们。

### related

- `vue.core.learn.basics.event-handling`：回看显式 `:value` / `@input`、IME 中间值与 file change。
- `vue.core.reference.reactivity.ref`：表单状态最小响应式容器。
- `vue.core.reference.components.define-model`：后续对照原生元素与组件 v-model；本课不提前实现。
- `vue.core.reference.components.emits`：理解组件 update 事件协议的后续参考；本课不讲组件通信。

当前参考索引虽列出内置 `v-model`，但没有独立可导航的 reference entry ID，因此不能虚构
`vue.core.reference.*.v-model`。`vue.core.learn.intermediate.component-v-model` 仍为 planned，也不
加入本批 related；等该课程正文上线后再由后续批次建立学习关联。

## 实施文件建议

本批实现应限定为：

- `src/content/entries/learn/vue/core/basics/form-bindings.ts`
- `src/content/demos/vue/core/learn/basics/form-bindings/form-state-lab-demo.vue`
- `src/content/catalog/manifests/vue-core-track.ts`
- `src/content/catalog/vue-core-track.spec.ts`
- `src/content/interactive/registry.spec.ts`
- `tests/e2e/progress.spec.ts`
- `docs/重构实施计划.md`

实现时把 `form-bindings` 从 planned 改为 available，不改变它和 event-handling、component-basics
之间的顺序。路线计数应从 7 门上线、53 门规划中更新为 8 门上线、52 门规划中；这是 Gate 6 的
第六批课程闭环，不能据此宣称 Gate 6 已关闭。

## 最小测试与 E2E 验收

### 定向单元验证

- `vue-core-track.spec.ts`：基础阶段顺序新增 form-bindings，总 available 数为 8；唯一 prerequisite
  必须指向更早且已存在的 event-handling。
- `registry.spec.ts`：只新增一个 `form-state-lab-demo` 资产 ID 可解析断言。
- 不为静态正文重复写内容快照；schema 与 catalog 现有测试负责结构约束。

### 现有 390px E2E 路径扩展

在现有 progress 流程中从“事件处理”的下一篇进入“表单输入绑定”，最少验证：

1. 普通 text 输入立即反映到状态面板。
2. `.lazy.trim` 字段在 input 后仍保留旧模型，blur/change 后才写入去首尾空白的新值。
3. `.number` 输入数字后类型为 number，清空后明确为 `''`。
4. checkbox Array 增删一项，radio 或 select 更新一个动态数字值。
5. 多选 select 输出 Array，重置恢复初始值。
6. 390px 下 `document.documentElement.scrollWidth <= window.innerWidth`。

这些断言覆盖课程的关键行为即可，不为每一种原生控件另建测试文件。

## 固定来源清单

### Vue 官方文档

- [Vue 中文官网：表单输入绑定](https://cn.vuejs.org/guide/essentials/forms.html)
- [Vue 英文官网：Form Input Bindings](https://vuejs.org/guide/essentials/forms.html)
- [Vue 内置指令：v-model](https://cn.vuejs.org/api/built-in-directives.html#v-model)
- [Vue 无障碍：语义化表单](https://cn.vuejs.org/guide/best-practices/accessibility.html#semantic-forms)
- [Vue 组件上的 v-model](https://cn.vuejs.org/guide/components/v-model.html)（只作后续边界）

### vuejs/core v3.5.40

- [`compiler-dom/src/transforms/vModel.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-dom/src/transforms/vModel.ts)
- [`compiler-dom vModel.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-dom/__tests__/transforms/vModel.spec.ts)
- [`runtime-dom/src/directives/vModel.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/directives/vModel.ts)
- [`runtime-dom vModel.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/__tests__/directives/vModel.spec.ts)
- [`runtime-dom/src/modules/props.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/modules/props.ts)
- [`runtime-dom/src/patchProp.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/patchProp.ts)
- [`compiler-ssr/src/transforms/ssrVModel.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-ssr/src/transforms/ssrVModel.ts)
- [`compiler-ssr ssrVModel.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-ssr/__tests__/ssrVModel.spec.ts)
- [`server-renderer ssrVModelHelpers.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/server-renderer/src/helpers/ssrVModelHelpers.ts)

## 实施验收清单

- 课程 meta ID 精确为 `vue.core.learn.basics.form-bindings`，唯一 prerequisite 是
  `vue.core.learn.basics.event-handling`。
- 正文覆盖 text/textarea、boolean 与自定义值 checkbox、Array/Set checkbox、radio、单选/多选
  select、动态 value、IME 与 `.lazy/.number/.trim`。
- 明确 `type="number"` 也可能产生空字符串，不把 `.number` 描述为严格数字校验。
- 明确 Set 对象身份和 v3.5.40 SSR 优化编译边界；Demo 使用 Array 多选，不展示不可靠 SSR Set
  初始状态。
- 文件 input 只给 `@change` 正解，不出现可运行的 `v-model` 正向示例。
- 组件 v-model、defineModel 与组件通信只出现在“后续关联/排除范围”，不进入 Demo 主流程。
- Demo 只有一个同源 `.vue` 文件，不使用 watcher 或远程请求转发表单变化。
- 390px 严格单列、无横向溢出、无 CSS Grid、无 `gap`，所有字段具有语义标签。
- 后续实现中的每个方法定义上方添加规范中文注释，并只增加最少的 track、registry 与现有 E2E
  路径断言。
- 更新计划时写成 8 课上线、52 课规划中和第六批完成，同时保留“Gate 6 尚未关闭”。

## 结论

本课最重要的心智模型是：原生 `v-model` 根据控件类型连接不同 DOM 状态与事件，JavaScript 模型
始终是初始值和后续回写的真值来源。checkbox 的意义由模型形状决定，radio/select 的结果由
选项值决定，三个修饰符只改变特定运行路径中的时机或值转换。

Vue 3.5.40 的编译器、DOM 运行时与官方测试完整支撑 text、checkbox、radio、select、动态值、
IME、Array/Set 和修饰符主线；固定版本 SSR 源码同时提醒我们，客户端支持不应自动外推到所有
服务端初始标记路径。按这条边界组织“表单状态实验台”，可以让新手从显式事件自然过渡到
`v-model`，又不会提前混入组件通信或表单框架。
