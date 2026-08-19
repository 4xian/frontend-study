---
id: vue.core.learn.basics.form-bindings
type: lesson
title: 表单输入绑定
summary: 用原生 v-model 连接表单控件与响应式状态，并正确处理值类型、修饰符和输入边界
domain: frontend
technology: vue
module: core
related:
  - vue.core.learn.basics.event-handling
  - vue.core.reference.reactivity.ref
  - vue.core.reference.components.define-model
  - vue.core.reference.components.emits
tags:
  - v-model
  - 表单
  - input
  - checkbox
  - select
  - IME
  - 表单修饰符
appliesTo: Vue 3.5.40
verifiedAt: 2026-07-30
sources:
  - title: Vue 表单输入绑定
    url: https://cn.vuejs.org/guide/essentials/forms.html
  - title: Vue 内置指令：v-model
    url: https://cn.vuejs.org/api/built-in-directives.html#v-model
  - title: Vue 无障碍：语义化表单
    url: https://cn.vuejs.org/guide/best-practices/accessibility.html#semantic-forms
  - title: Vue 组件上的 v-model
    url: https://cn.vuejs.org/guide/components/v-model.html
  - title: Vue 3.5.40 compiler-dom vModel.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-dom/src/transforms/vModel.ts
  - title: Vue 3.5.40 runtime-dom vModel.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/directives/vModel.ts
  - title: Vue 3.5.40 runtime-dom props.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/modules/props.ts
  - title: Vue 3.5.40 compiler-ssr ssrVModel.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-ssr/src/transforms/ssrVModel.ts
stage: basics
level: beginner
estimatedMinutes: 45
prerequisites:
  - vue.core.learn.basics.event-handling
objectives:
  - 把原生 v-model 解释为 DOM property、事件和值转换组成的双向同步
  - 为 text、textarea、checkbox、radio、单选和多选 select 选择正确的模型形状
  - 使用动态 value 和 checkbox 自定义值保留数字、对象及业务状态
  - 准确预测 .lazy、.number、.trim 与 IME 输入的更新时机和结果
  - 识别文件输入、组件 v-model 与 Vue 3.5.40 SSR Set 支持的边界
recap:
  - 原生 v-model 根据控件类型连接不同 DOM property 与事件，JavaScript 模型始终是状态真值来源。
  - 单 checkbox 是两态值，同组 checkbox 和多选 select 使用 Array 或客户端 Set。
  - 动态 :value 保留数字和对象；静态 value 只产生字符串。
  - .lazy 改变更新事件，.number 宽松转换值，.trim 只移除首尾空白。
  - 普通文本模型等待 IME 最终值；file input 不支持 v-model，组件 v-model 属于后续通信协议。
  - Vue 3.5.40 客户端支持 Set，但 SSR 敏感多选应优先使用 Array。
---

# 表单输入绑定

## 一、从显式事件绑定走向 v-model

上一课已经能用 `@input` 读取原生事件。对于文本输入，Vue 把读取 DOM 值和回写响应式状态的固定组合简写为 `v-model`；程序修改模型时，Vue 也会把新值同步回输入框。

:::compare{before="显式 property 与事件" after="使用 v-model"}
### 显式 property 与事件

~~~~text
<script setup lang="ts">
import { ref } from 'vue'

const message = ref('你好')

/** 把输入框的当前文本写回模型。 */
function updateMessage(event: Event): void {
  message.value = (event.currentTarget as HTMLInputElement).value
}
</script>

<template>
  <input :value="message" @input="updateMessage" />
</template>
~~~~

### 使用 v-model

~~~~text
<script setup lang="ts">
import { ref } from 'vue'

const message = ref('你好')
</script>

<template>
  <input v-model="message" />
</template>
~~~~
:::

:::tip
`v-model` 不是所有控件都使用 `value + input`。checkbox 和 radio 读取 `checked` 并监听 `change`，select 也在 `change` 时收集已选 option。
:::

## 二、模型是表单初始状态的真值来源

原生 `v-model` 会忽略元素上静态的初始 `value`、`checked` 和 `selected`，挂载后以 JavaScript 模型为准。先在 `ref()` 或 `reactive()` 中声明初始值，模板只负责把控件连接到这份状态。

| 元素或类型 | DOM 状态 | 用户更新事件 | 建议模型 |
| --- | --- | --- | --- |
| text input / textarea | value | input；.lazy 时 change | string；.number 时 number \| string |
| 单个 checkbox | checked | change | boolean 或自定义两态值 |
| 同组 checkbox | checked + value | change | Array&lt;T&gt;；客户端也支持 Set&lt;T&gt; |
| radio | checked + value | change | 单个选项值 |
| 单选 select | 当前 option | change | 单个选项值或空字符串 |
| 多选 select | 全部 selected option | change | Array&lt;T&gt;；客户端也支持 Set&lt;T&gt; |

## 三、绑定 text、textarea 并理解 IME

text input 与 textarea 都把文本写入字符串模型。textarea 的内容也必须通过模型提供，不能在标签内部用插值充当初始值。中文、日文、韩文等输入法处于拼字阶段时，普通 `v-model` 暂不更新，确认文字后才同步最终值。

~~~~vue
<script setup lang="ts">
import { ref } from 'vue'

const title = ref('第一份草稿')
const note = ref('')
</script>

<template>
  <label for="title">标题</label>
  <input id="title" v-model="title" />

  <label for="note">备注</label>
  <textarea id="note" v-model="note"></textarea>
</template>
~~~~

默认行为适合只关心确认文本的普通表单和搜索。若产品确实需要拼音候选等组合中间值，应对该字段改用显式 `:value` 与 `@input`，直接读取 DOM，而不是期待另一个 `v-model` 修饰符。

~~~~vue
<script setup lang="ts">
import { ref } from 'vue'

const query = ref('')

/** 读取包括 IME 拼字阶段在内的当前 DOM 文本。 */
function readComposingValue(event: Event): void {
  query.value = (event.currentTarget as HTMLInputElement).value
}
</script>

<template>
  <input :value="query" @input="readComposingValue" />
</template>
~~~~

## 四、按模型形状理解 checkbox

checkbox 的意义由模型形状决定。单个 checkbox 默认写入 boolean；自定义 `true-value` / `false-value` 可以写入两个业务值；同组选项则使用 Array 或 Set 增删每项的 `value`。

~~~~vue
<script setup lang="ts">
import { ref } from 'vue'

const accepted = ref(false)
const publishState = ref<1 | 0>(0)
const channels = ref<string[]>([])
</script>

<template>
  <label>
    <input v-model="accepted" type="checkbox" />
    同意条款
  </label>

  <label>
    <input
      v-model="publishState"
      type="checkbox"
      :true-value="1"
      :false-value="0"
    />
    立即发布
  </label>

  <fieldset>
    <legend>通知渠道</legend>
    <label><input v-model="channels" type="checkbox" value="email" /> 邮件</label>
    <label><input v-model="channels" type="checkbox" value="sms" /> 短信</label>
  </fieldset>
</template>
~~~~

Vue 3.5.40 客户端也支持 `ref(new Set<string>())`。运行时会克隆旧 Set、增删成员，再把新 Set 赋回模型。Array 适合保留顺序或直接序列化；Set 适合稳定 primitive 的唯一成员判断。

~~~~vue
<script setup lang="ts">
import { ref } from 'vue'

const selectedIds = ref(new Set<number>())
</script>

<template>
  <label><input v-model="selectedIds" type="checkbox" :value="1" /> 课程 1</label>
  <label><input v-model="selectedIds" type="checkbox" :value="2" /> 课程 2</label>
</template>
~~~~

## 五、用 radio 与 select 选择一个或多个值

radio 把当前选项值写入一个标量；单选 select 写入一个 option 值；多选 select 收集全部选中值并写入 Array，客户端也可以保留 Set。多选模型必须从 Array 或 Set 开始。

~~~~vue
<script setup lang="ts">
import { ref } from 'vue'

const plan = ref<'basic' | 'pro'>('basic')
const level = ref(1)
const region = ref('')
const topics = ref<string[]>([])
</script>

<template>
  <fieldset>
    <legend>套餐</legend>
    <label><input v-model="plan" type="radio" value="basic" /> 基础版</label>
    <label><input v-model="plan" type="radio" value="pro" /> 专业版</label>
  </fieldset>

  <label for="level">难度</label>
  <select id="level" v-model="level">
    <option :value="1">入门</option>
    <option :value="2">进阶</option>
  </select>

  <label for="region">地区</label>
  <select id="region" v-model="region">
    <option disabled value="">请选择地区</option>
    <option value="north">北区</option>
    <option value="south">南区</option>
  </select>

  <label for="topics">主题</label>
  <select id="topics" v-model="topics" multiple>
    <option value="vue">Vue</option>
    <option value="typescript">TypeScript</option>
  </select>
</template>
~~~~

:::warning
静态 `value="1"` 是字符串，只有 `:value="1"` 才是数字。单选 select 若需要空状态，应提供 `disabled value=""` 的占位项，避免初始值不匹配任何 option。
:::

## 六、动态 value 保留非字符串值

`v-bind:value` 可以绑定数字、对象甚至 Symbol。Vue 会把原始动态值保存在元素内部，radio、checkbox 和 select 读取时优先返回它，而不是只返回 DOM attribute 的字符串。

~~~~vue
<script setup lang="ts">
import { ref } from 'vue'

const plans = [
  { id: 'starter', name: '入门方案' },
  { id: 'team', name: '团队方案' },
]
const selectedPlan = ref(plans[0])
</script>

<template>
  <select v-model="selectedPlan">
    <option v-for="plan in plans" :key="plan.id" :value="plan">
      {{ plan.name }}
    </option>
  </select>
</template>
~~~~

直接保存对象只适合选项来自同一个稳定数据源的局部状态。若数据要进入 URL、JSON、FormData 或持久化层，保存 primitive ID 往往更稳定，也能避开 Set 的对象身份问题。

## 七、理解 lazy、number 与 trim

| 修饰符 | 实际行为 | 不提供什么 |
| --- | --- | --- |
| .lazy | 文本控件改在 change 时写入模型 | 不是防抖、自动保存或提交事务 |
| .number | 可解析时转成数字，否则保留原值 | 不是严格数字校验；空输入仍是空字符串 |
| .trim | 写入模型前移除首尾空白 | 不移除中间空白，也不是完整净化或校验 |

~~~~vue
<script setup lang="ts">
import { ref } from 'vue'

const nickname = ref('')
const age = ref<number | string>('')
const priority = ref<number | string>('')
</script>

<template>
  <input v-model.lazy.trim="nickname" />
  <input v-model.number="age" inputmode="decimal" />

  <select v-model.number="priority">
    <option disabled value="">请选择优先级</option>
    <option value="1">低</option>
    <option value="2">高</option>
  </select>
</template>
~~~~

文本控件会先 trim 再 number；`type="number"` 也会自动尝试宽松数值转换。checkbox 与 radio 不读取这三个修饰符，select 只使用 `.number`，不要把修饰符机械套到所有原生控件。

## 八、在表单状态实验台观察完整同步链

下面的单一 Demo 共享一份表单状态。依次观察即时文本、IME 最终值、lazy 与 trim 的提交时机、number 的值和类型、boolean 与 Array checkbox、radio、单选和多选 select，再用重置按钮恢复统一初始值。

:::demo{id="vue.core.learn.basics.form-bindings.form-state-lab-demo" playground="true"}
在同一状态面板中比较原生控件、值类型与修饰符的更新结果
:::

## 九、文件、组件与 SSR 的边界

file input 的值受浏览器安全规则限制，Vue 编译器明确拒绝在它上面使用 `v-model`。应监听 `change`，从 `files` 读取用户主动选择的 File 对象。

~~~~vue
<script setup lang="ts">
import { ref } from 'vue'

const files = ref<File[]>([])

/** 保存用户主动选择的文件对象。 */
function selectFiles(event: Event): void {
  files.value = Array.from((event.currentTarget as HTMLInputElement).files ?? [])
}
</script>

<template>
  <label for="attachments">附件</label>
  <input id="attachments" type="file" multiple @change="selectFiles" />
</template>
~~~~

组件上的 `v-model` 会转成 prop 与 update 事件协议，`defineModel()` 用于声明该协议；它们与组件通信留到后续课程，本课不展开实现。相关参考可继续阅读 `defineModel()` 与组件事件条目。

:::warning
Vue 3.5.40 客户端支持 checkbox 和多选 select 的 Set 模型，但优化 SSR 模板编译路径没有完整覆盖同等 Set 分支。SSR 敏感的多选示例应优先使用 Array，不能把客户端能力外推到所有 SSR 路径。
:::

## 十、易错使用提示

:::pitfalls
### 用静态 value、checked、selected 或 textarea 插值初始化模型

**触发条件：** 用静态 value、checked、selected 或 textarea 插值初始化模型

**原因：** 原生 v-model 把 JavaScript 模型视为真值来源，挂载后会按模型重设 DOM；textarea 子文本也不是输入值绑定。

**后果：** 首屏默认值被空模型覆盖，或 textarea 内容不能与模型双向同步。

**错误示例：**

~~~~vue
<input v-model="name" value="Ada" />
<input v-model="accepted" type="checkbox" checked />
<textarea>{{ note }}</textarea>
~~~~

**正确写法：**

~~~~vue
<script setup lang="ts">
import { ref } from 'vue'

const name = ref('Ada')
const accepted = ref(true)
const note = ref('欢迎')
</script>

<template>
  <input v-model="name" />
  <input v-model="accepted" type="checkbox" />
  <textarea v-model="note"></textarea>
</template>
~~~~

**验证方式：** 对照正确写法验证结果。

### 以为 IME 拼字阶段会立即更新模型

**触发条件：** 以为 IME 拼字阶段会立即更新模型

**原因：** 普通文本 v-model 会忽略 composing 期间的 input，compositionend 后才同步最终文本。

**后果：** 逐字候选或搜索拿不到中间值；额外叠加监听还可能造成重复处理。

**错误示例：**

~~~~vue
<input v-model="query" @input="search(query)" />
~~~~

**正确写法：**

~~~~vue
<script setup lang="ts">
import { ref } from 'vue'

const query = ref('')

/** 读取包含 IME 拼字阶段的当前文本。 */
function readComposingValue(event: Event): void {
  query.value = (event.currentTarget as HTMLInputElement).value
}
</script>

<template>
  <input :value="query" @input="readComposingValue" />
</template>
~~~~

**验证方式：** 对照正确写法验证结果。

### 多个 checkbox 仍使用 boolean 或 string 模型

**触发条件：** 多个 checkbox 仍使用 boolean 或 string 模型

**原因：** Vue 根据当前模型形状决定二态或集合语义，不会因为页面上出现多个 checkbox 自动创建数组。

**后果：** 选择任意一项只得到 true/false，无法判断具体选中了哪些值。

**错误示例：**

~~~~ts
const channels = ref(false)
~~~~

**正确写法：**

~~~~vue
<script setup lang="ts">
import { ref } from 'vue'

const channels = ref<string[]>([])
</script>

<template>
  <input v-model="channels" type="checkbox" value="email" />
  <input v-model="channels" type="checkbox" value="sms" />
</template>
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为 true-value 与 false-value 会改变原生 FormData

**触发条件：** 认为 true-value 与 false-value 会改变原生 FormData

**原因：** 这两个值只服务于 Vue 模型同步，不会改变 checkbox 的原生提交规则；未选项不会进入 FormData。

**后果：** 模型虽然是 no，原生提交结果里却可能完全没有这个字段。

**错误示例：**

~~~~vue
<input
  v-model="notify"
  name="notify"
  type="checkbox"
  true-value="yes"
  false-value="no"
/>
~~~~

**正确写法：**

~~~~vue
<label><input v-model="notify" name="notify" type="radio" value="yes" /> 是</label>
<label><input v-model="notify" name="notify" type="radio" value="no" /> 否</label>
~~~~

**验证方式：** 对照正确写法验证结果。

### 忘记冒号，把数字或对象当成字符串

**触发条件：** 忘记冒号，把数字或对象当成字符串

**原因：** 静态 HTML value 只有字符串语义，动态值必须使用 v-bind\:value 或 \:value。

**后果：** 严格比较失败，模型得到字符串而不是预期数字或业务对象。

**错误示例：**

~~~~vue
<option value="1">高</option>
~~~~

**正确写法：**

~~~~vue
<option :value="1">高</option>
<option :value="priorityOption">业务对象</option>
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 Set 中保存每次渲染新建的对象

**触发条件：** 在 Set 中保存每次渲染新建的对象

**原因：** Set 分支使用原生 has 判断，依赖对象身份；模板内联对象与重新映射的对象可能不是原引用。

**后果：** 集合中看似有等价记录，控件却不显示选中，取消时也删不到原成员。

**错误示例：**

~~~~vue
<input v-model="selected" type="checkbox" :value="{ id: course.id }" />
~~~~

**正确写法：**

~~~~vue
<script setup lang="ts">
import { ref } from 'vue'

const selectedIds = ref(new Set<number>())
</script>

<template>
  <input v-model="selectedIds" type="checkbox" :value="course.id" />
</template>
~~~~

**验证方式：** 对照正确写法验证结果。

### 多选 select 绑定标量，或单选没有匹配的初始值

**触发条件：** 多选 select 绑定标量，或单选没有匹配的初始值

**原因：** 多选需要 Array 或 Set 承载成员；单选初始值若不匹配 option，会处于 selectedIndex 为 -1 的未选择状态。

**后果：** 多选产生警告且回写不稳定；部分移动端上首次选择第一项还可能不触发 change。

**错误示例：**

~~~~vue
<script setup lang="ts">
const topics = ref('')
</script>

<select v-model="topics" multiple>
  <option value="vue">Vue</option>
</select>
~~~~

**正确写法：**

~~~~vue
<script setup lang="ts">
import { ref } from 'vue'

const region = ref('')
const topics = ref<string[]>([])
</script>

<template>
  <select v-model="region">
    <option disabled value="">请选择地区</option>
    <option value="north">北区</option>
  </select>
  <select v-model="topics" multiple>
    <option value="vue">Vue</option>
  </select>
</template>
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为 .number 保证模型永远是 number

**触发条件：** 认为 .number 保证模型永远是 number

**原因：** Vue 使用宽松数值转换，可解析时返回数字，不可解析时保留原值，清空输入会得到空字符串。

**后果：** 直接做算术、调用数字方法或提交严格 schema 时出现错误。

**错误示例：**

~~~~ts
const age = ref(0)

/** 假设 age 永远是数字并直接格式化。 */
function formatAge(): string {
  return age.value.toFixed(0)
}
~~~~

**正确写法：**

~~~~ts
const age = ref<number | string>('')

/** 把可空输入转换为提交载荷。 */
function toAgePayload(): number | null {
  return typeof age.value === 'number' ? age.value : null
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 .lazy 当防抖，把 .trim 当完整校验

**触发条件：** 把 .lazy 当防抖，把 .trim 当完整校验

**原因：** .lazy 只把同步事件换成 change，.trim 只移除首尾空白；两者都不负责计时、格式或提交。

**后果：** 界面在失焦前仍读取旧模型，修剪后的非法内容也会直接进入业务状态。

**错误示例：**

~~~~vue
<!-- 这不是 300ms 防抖，也不是用户名校验 -->
<input v-model.lazy.trim="username" />
~~~~

**正确写法：**

~~~~vue
<label for="username">用户名（离开输入框后更新）</label>
<input id="username" v-model.lazy.trim="username" />
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 file input 上使用 v-model

**触发条件：** 在 file input 上使用 v-model

**原因：** 浏览器不允许脚本按普通 value 方式设置文件选择，Vue 编译器会直接拒绝。

**后果：** 模板无法编译，或错误地把文件路径字符串当成 File 数据。

**错误示例：**

~~~~vue
<input v-model="files" type="file" multiple />
~~~~

**正确写法：**

~~~~vue
<script setup lang="ts">
import { ref } from 'vue'

const files = ref<File[]>([])

/** 保存用户主动选择的文件对象。 */
function selectFiles(event: Event): void {
  files.value = Array.from((event.currentTarget as HTMLInputElement).files ?? [])
}
</script>

<template>
  <input type="file" multiple @change="selectFiles" />
</template>
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 十一、从源码推导适用场景

:::steps
### 动态 type 适合模型协议不变的小型字段配置

编译器遇到 `:type` 时选择 `vModelDynamic`，运行时再按最终的 text、checkbox 或 radio 分派。字段类型变化但模型形状兼容时可复用模板；若从 string 切换成 checkbox 数组，显式分支更清楚。

### Array 保留顺序，Set 表达唯一成员

checkbox 与多选 select 会保留旧模型的 Array 或 Set 形状。Array 适合选择顺序和序列化；Set 适合客户端成员判断，但应使用稳定 primitive，SSR 敏感页面在 3.5.40 优先 Array。

### 内部原始值槽让动态值穿过 DOM 字符串边界

DOM patch 会把动态 value 保存在 `_value`，读取选项时优先返回原值。因此数字和稳定对象可以直接进入模型；跨 URL、FormData 或持久化边界时，primitive ID 通常仍更可靠。

### .number 是宽松入口，不是最终解析器

文本和 select 都复用宽松数值转换，适合允许空值并在提交时另做校验的草稿表单。金额、计量或严格 schema 仍需要明确解析和验证。

### IME 最终值与组合中间值是两种交互选择

文本指令用 composing 标记忽略中间 input，并在 compositionend 同步最终值。普通表单使用默认模型；只有候选提示或输入法诊断才应改用显式 input 监听。

### 聚焦输入允许 DOM 与模型短暂不同

文本更新会在 composing、lazy 未提交或 trim 后等价时跳过无意义回写，以保护正在编辑的文本和光标。实时掩码与复杂光标控制更适合后续专用组件。

### 客户端 Set 能力不能直接外推到全部 SSR 路径

Vue 3.5.40 优化 SSR 模板编译中的静态 checkbox 与 select 主要识别 Array，没有完整复用客户端 Set 分支。需要可靠初始选中标记的 SSR 多选应使用 Array。
:::

:::exercise
### 制作一个原生报名表单

**要求：**

~~~~text
创建姓名 text、备注 textarea、同意条款 boolean checkbox、通知渠道 Array checkbox、套餐 radio、带空占位的地区单选和主题多选。年龄使用 .number 并允许空字符串，昵称使用 .lazy.trim。所有控件提供可见 label，提交前把年龄明确转换为 number 或 null。
~~~~

**验收：**

~~~~text
完成题目要求。
~~~~

**参考答案：**

~~~~text
<script setup lang="ts">
import { ref } from 'vue'

const name = ref('')
const note = ref('')
const accepted = ref(false)
const channels = ref<string[]>([])
const plan = ref<'basic' | 'pro'>('basic')
const region = ref('')
const topics = ref<string[]>([])
const age = ref<number | string>('')
const nickname = ref('')

/** 把宽松数字输入整理为明确的提交值。 */
function getAgePayload(): number | null {
  return typeof age.value === 'number' ? age.value : null
}
</script>

<template>
  <label for="name">姓名</label>
  <input id="name" v-model="name" />

  <label for="note">备注</label>
  <textarea id="note" v-model="note"></textarea>

  <label><input v-model="accepted" type="checkbox" /> 同意条款</label>

  <fieldset>
    <legend>通知渠道</legend>
    <label><input v-model="channels" type="checkbox" value="email" /> 邮件</label>
    <label><input v-model="channels" type="checkbox" value="sms" /> 短信</label>
  </fieldset>

  <fieldset>
    <legend>套餐</legend>
    <label><input v-model="plan" type="radio" value="basic" /> 基础版</label>
    <label><input v-model="plan" type="radio" value="pro" /> 专业版</label>
  </fieldset>

  <label for="region">地区</label>
  <select id="region" v-model="region">
    <option disabled value="">请选择地区</option>
    <option value="north">北区</option>
  </select>

  <label for="topics">主题</label>
  <select id="topics" v-model="topics" multiple>
    <option value="vue">Vue</option>
    <option value="typescript">TypeScript</option>
  </select>

  <label for="age">年龄</label>
  <input id="age" v-model.number="age" inputmode="numeric" />

  <label for="nickname">昵称（离开输入框后更新）</label>
  <input id="nickname" v-model.lazy.trim="nickname" />

  <output>年龄提交值：{{ getAgePayload() }}</output>
</template>
~~~~
:::

- [ ] 每个模型的初始值与控件语义匹配
- [ ] 动态数字或对象值使用 \:value
- [ ] 多选使用 Array；客户端 Set 只保存稳定成员
- [ ] 修饰符只承担时机或轻量转换，不代替校验
- [ ] 文件选择使用 change，组件 v-model 留到后续课程
