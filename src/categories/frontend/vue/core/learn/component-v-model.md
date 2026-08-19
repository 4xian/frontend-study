---
id: vue.core.learn.intermediate.component-v-model
type: lesson
title: 组件 v-model
summary: 设计 modelValue、具名模型与 update 事件契约，并用 defineModel 实现受控双向绑定
domain: frontend
technology: vue
module: core
related:
  - vue.core.learn.intermediate.attrs
  - vue.core.learn.basics.form-bindings
  - vue.core.learn.basics.props
  - vue.core.learn.basics.emits
  - vue.core.reference.components.define-model
tags:
  - 组件 v-model
  - defineModel
  - modelValue
  - update:modelValue
  - 具名模型
  - 修饰符
  - 受控组件
appliesTo: Vue 3.5.40
verifiedAt: 2026-07-31
sources:
  - title: Vue 组件 v-model 指南
    url: https://cn.vuejs.org/guide/components/v-model.html
  - title: Vue <script setup> defineModel
    url: https://cn.vuejs.org/api/sfc-script-setup.html#definemodel
  - title: Vue 组件 Props
    url: https://cn.vuejs.org/guide/components/props.html
  - title: Vue 组件事件
    url: https://cn.vuejs.org/guide/components/events.html
  - title: Vue 3.5.40 compiler-sfc defineModel.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/script/defineModel.ts
  - title: Vue 3.5.40 runtime-core useModel.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/useModel.ts
  - title: Vue 3.5.40 compiler defineModel 官方测试
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/__tests__/compileScript/defineModel.spec.ts
  - title: Vue 3.5.40 runtime useModel 官方测试
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/helpers/useModel.spec.ts
stage: intermediate
level: intermediate
estimatedMinutes: 50
prerequisites:
  - vue.core.learn.intermediate.attrs
objectives:
  - 把 <Child v-model="value" /> 展开为 modelValue prop 与 update:modelValue listener
  - 用 Props + Emits 手写默认模型，并说明 defineModel 只是收起样板代码
  - "用 required: true 声明必填模型并从类型中排除 undefined"
  - 用 defineModel('title') 对应 v-model:title，并声明多个独立模型
  - 解释组件修饰符只是 modelModifiers 或 <name>Modifiers 记录
  - 使用 get 处理子组件读取值，使用 set 处理写回父组件的值
  - 识别 default 造成的父子初始失同步，并选择 required 或显式初始化修复
  - 根据模型 prop 与 onUpdate:* listener 是否成对存在判断受控或本地回退
  - 通过唯一 Demo 验证多个模型、修饰符转换、父向下重置和未绑定本地状态
recap:
  - 默认组件 v-model 由 modelValue prop 向下和 update:modelValue 事件向上组成，状态仍由父组件拥有。
  - defineModel() 收起 prop 与 emit 样板并返回可读写 ref；具名模型各自对应独立的 prop 与 update 事件。
  - 组件修饰符只是协议标记；get 处理父值进入子模型的读取，set 返回子值写回父级的结果。
  - "required: true 表达必填并排除 undefined；default 只提供子级缺省值，父级未初始化时可能失同步。"
  - Vue 3.5.40 只有模型 prop 与 update listener 同时存在才走受控回流，否则先更新 localValue 并仍发出更新事件。
---

# 组件 v-model

## 一、正文大纲

组件 v-model 是一条明确的父子契约：父组件拥有状态，子组件接收 prop，并通过 update 事件请求父组件写回。本课沿最小协议逐步加入 defineModel、具名模型、修饰符与受控边界，最后用一个可复跑 Demo 对照完整绑定和本地回退。

| 部分 | 核心问题 | 完成标志 |
| --- | --- | --- |
| 最小协议 | v-model 展开成什么 | 能写出 modelValue 与 update\:modelValue |
| defineModel | 宏收起了哪些样板 | 能直接读写模型 ref |
| 具名与多个模型 | 如何避免字段混淆 | 每个名称都有独立 prop 与事件 |
| 修饰符与转换 | 何时读、何时写 | 能正确使用 get 与 set |
| required 与 default | 类型和初始值有什么边界 | 不会用 default 掩盖父级缺省 |
| 受控与本地回退 | 父级没有完整绑定时发生什么 | 能解释 prop + listener 的成对判断 |

:::tip
本课限定 SFC、&lt;script setup lang="ts"&gt;、Composition API 与 Vue 3.5.40。Props、Emits 和原生表单绑定只复用最小协议；Provide / Inject、事件总线、Pinia、Slots、Attributes 透传、动态组件、第三方 useVModel、SSR 与完整 Options API 均不在本课范围内。
:::

## 二、最小协议：状态向下，事件向上

父组件写下 &lt;Child v-model="message" /&gt; 时，Vue 不会创建一条隐藏的共享状态通道。默认模型的公开名称是 modelValue，子组件写回时必须发出 update\:modelValue；父级收到事件后更新自己的 ref，新值再作为 prop 向下流动。

~~~~vue
<!-- ChildInput.vue：手写默认模型协议 -->
<script setup lang="ts">
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

/** 把原生输入值按默认模型事件写回父级。 */
function emitValue(event: Event) {
  const input = event.target as HTMLInputElement
  emit('update:modelValue', input.value)
}
</script>

<template>
  <input :value="props.modelValue" @input="emitValue" />
</template>
~~~~

~~~~vue
<!-- 父级写法与编译展开 -->
<ChildInput v-model="message" />

<!-- 等价于： -->
<ChildInput
  :model-value="message"
  @update:modelValue="$event => (message = $event)"
/>
~~~~

| 契约位置 | 默认名称 | 职责 |
| --- | --- | --- |
| 父级 prop 绑定 | modelValue | 把父级当前值传给子级 |
| 子级 update 事件 | update\:modelValue | 携带子级希望提交的新值 |
| 父级事件处理 | message = $event | 决定是否接受并保存新值 |

:::warning
prop 名和事件名必须成对对应。只声明 modelValue、只发 update\:value，或者在子组件直接改写 props.modelValue，都会断开 v-model 或违反 Props 单向数据流。
:::

## 三、defineModel：把协议收拢为可读写 ref

Vue 3.4+ 的 defineModel() 是仅限 &lt;script setup&gt; 的编译器宏。无参数时，它声明 modelValue prop 和 update\:modelValue 事件，并返回与父级绑定的 ref。读取 ref 反映最新 prop，给 ref 赋值则经过模型 setter 发出更新事件；这只是收起样板，不会改变父组件拥有状态的原则。

~~~~vue
<script setup lang="ts">
const model = defineModel<string>({ required: true })

/** 清空当前组件的模型值并请求父级同步。 */
function clearModel() {
  model.value = ''
}
</script>

<template>
  <input v-model="model" />
  <button type="button" @click="clearModel">清空</button>
</template>
~~~~

:::compare{before="手写两端样板" after="宏返回一个模型 ref"}
### 手写两端样板

~~~~text
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
~~~~

### 宏返回一个模型 ref

~~~~text
const model = defineModel<string>({ required: true })
~~~~
:::

宏调用会在编译阶段改写为 useModel(&#95;&#95;props, name, options)，同时生成模型 prop、修饰符 prop 和 update 事件。代码阅读时把 defineModel 当作公开组件契约的单点声明，而不是运行时可以从 vue 导入的普通函数。

## 四、具名模型与多个 v-model

defineModel() 的第一个字符串参数是公开模型名。defineModel('title') 对应 title prop 与 update\:title 事件；父模板可以写 v-model\:title。一个组件可以声明多个不同名称的模型，每条链独立同步，适合姓名、权限等原本就有独立更新边界的字段。

~~~~vue
<script setup lang="ts">
const firstName = defineModel<string>('firstName', { required: true })
const lastName = defineModel<string>('lastName', { required: true })
</script>

<template>
  <label>
    名
    <input v-model="firstName" />
  </label>
  <label>
    姓
    <input v-model="lastName" />
  </label>
</template>
~~~~

~~~~vue
<UserName
  v-model:first-name="first"
  v-model:last-name="last"
/>
~~~~

| 父级写法 | 子级声明 | 生成的事件 |
| --- | --- | --- |
| v-model\:first-name="first" | defineModel('firstName') | update\:firstName |
| v-model\:last-name="last" | defineModel('lastName') | update\:lastName |

:::warning
名称字符串是组件 API 的一部分。同一个 SFC 重复声明同名 defineModel 会触发 compiler-sfc 的 duplicate model name 错误；不要用一个模糊的大对象替代本来可以独立更新的模型。
:::

## 五、修饰符、get 与 set 的方向

组件修饰符不会自动复制原生 input 的 trim 或 number 逻辑。v-model\:title.capitalize 会额外传入 titleModifiers: { capitalize: true }。解构 defineModel() 的第二项可以读取这些标记；get 负责 prop 进入子模型时的读取转换，set 负责子模型写回父级前的转换。

~~~~vue
<script setup lang="ts">
const [title, modifiers] = defineModel<string, 'capitalize'>('title', {
  required: true,
  /** 按修饰符裁剪输入，并决定是否首字母大写后写回。 */
  set(value) {
    const trimmed = value.trim()
    return modifiers.capitalize
      ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
      : trimmed
  },
})
</script>

<template>
  <input v-model="title" />
</template>
~~~~

~~~~ts
const [displayName] = defineModel<string>('name', {
  required: true,
  /** 只格式化子组件读取到的显示值，不改变父级提交值。 */
  get(value) {
    return value.trim()
  },
  /** 只规范化子组件写回父级的值，并在所有分支返回结果。 */
  set(value) {
    return value.trim()
  },
})
~~~~

| 方向 | 入口 | 应承担的工作 |
| --- | --- | --- |
| 父级 -&gt; 子级 | get(value) | 只处理读取或显示格式 |
| 子级 -&gt; 父级 | set(value) | 返回要 emit 的规范值 |
| 修饰符 -&gt; 子级 | modelModifiers / titleModifiers | 只记录标记，转换由组件定义 |

:::warning
set 的每个分支都要返回要提交的值。把 get 与 set 方向写反，或在修饰符关闭时隐式返回 undefined，会把错误载荷发给父组件。转换器应保持纯粹，不在其中触发网络请求或修改其他状态。
:::

## 六、required 与 default：类型和初始值边界

不带选项的 defineModel&lt;T&gt;() 通常得到 Ref&lt;T | undefined&gt;。required: true 表达调用约定必须提供模型，并让类型排除 undefined；default 则只在子级解析 prop 时提供缺省值，不会反向初始化父级 ref。

~~~~ts
const requiredModel = defineModel<string>({ required: true })
const optionalModel = defineModel<string>()
const modelWithDefault = defineModel<number>({ default: 0 })
~~~~

| 声明 | 子级读取类型 | 调用边界 |
| --- | --- | --- |
| defineModel&lt;string&gt;() | Ref&lt;string \| undefined&gt; | 可缺省，需处理 undefined |
| defineModel&lt;string&gt;({ required: true }) | Ref&lt;string&gt; | 调用方必须提供完整 v-model |
| defineModel&lt;number&gt;({ default: 0 }) | 子级有默认值 | 父 ref 仍可能保持 undefined |

:::compare{before="可能造成初始失同步" after="由父级显式拥有初始值"}
### 可能造成初始失同步

~~~~text
const parent = ref<number>()
const child = defineModel<number>({ default: 1 })
~~~~

### 由父级显式拥有初始值

~~~~text
const parent = ref(1)
const child = defineModel<number>({ required: true })
~~~~
:::

:::warning
父 ref 为 undefined、子模型配置 default: 1 时，首次渲染可能出现父 undefined 与子 1 的失同步。要么让父级显式初始化，要么用 required 强制调用方提供绑定；不要用 default 掩盖缺失状态。
:::

## 七、受控模型与未绑定时的本地回退

Vue 3.5.40 的 useModel() 以当前 vnode 的原始 props 判断受控状态：模型 prop 与对应 onUpdate:&#42; listener 必须同时存在。受控写入只 emit，等待父级更新后通过 prop 回流；缺少任一项时，模型先更新内部 localValue，再仍然发出 update 事件。

| 输入状态 | setter 行为 | 应如何理解 |
| --- | --- | --- |
| prop + onUpdate:&#42; 都存在 | 只 emit，等待父级 prop 回流 | 完整 v-model，状态所有权在父级 |
| 缺少 prop 或 listener | 先写 localValue，再 emit | 可选模型的本地回退 |
| 父级只传 prop | 仍是本地回退 | 传值不等于完整受控 |

~~~~text
受控：props.title + onUpdate:title
  子 ref 写入 -> emit('update:title') -> 父级更新 -> props.title 回流

未绑定：缺少 props.notes 或 onUpdate:notes
  子 ref 写入 -> localValue 更新 -> 仍 emit('update:notes')
~~~~

本地回退适合确实可以独立工作的可选输入；若组件必须由父级控制，应使用 required 并在调用约定中要求完整 v-model。不要把“没有父级绑定”实现成动态卸载或手写 useModel，因为真实缺少 prop/listener 才能验证官方 local fallback seam。

:::demo{id="vue.core.learn.intermediate.component-v-model.component-model-contract-demo" playground="true"}
对照默认、具名和多个模型的受控同步、capitalize 修饰符以及未绑定 notes 的本地回退
:::

## 八、易错使用提示

:::pitfalls
### 1. 只声明 modelValue，却没有声明 update\:modelValue

**触发条件：** 1. 只声明 modelValue，却没有声明 update\:modelValue

**原因：** 手写默认模型时，prop 与更新事件必须组成同一条公开协议。

**后果：** 父级只监听 update\:modelValue；名称不一致或直接改 prop 都会断开绑定。

**错误示例：**

~~~~vue
<script setup lang="ts">
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:value': [value: string] }>()
</script>
~~~~

**正确写法：**

~~~~vue
<script setup lang="ts">
const model = defineModel<string>()
</script>
~~~~

**验证方式：** 对照正确写法验证结果。

### 2. 把 defineModel 当成运行时可导入函数

**触发条件：** 2. 把 defineModel 当成运行时可导入函数

**原因：** defineModel 是 Vue 3.4+ 且仅限 &lt;script setup&gt; 的编译器宏。

**后果：** 从 vue 导入到普通 setup 或 Options API，无法获得宏展开的 prop、emit 契约。

**错误示例：**

~~~~ts
import { defineModel } from 'vue'

const model = defineModel<string>()
~~~~

**正确写法：**

~~~~vue
<script setup lang="ts">
const model = defineModel<string>()
</script>
~~~~

**验证方式：** 对照正确写法验证结果。

### 3. 具名模型的父子名称不完全对应

**触发条件：** 3. 具名模型的父子名称不完全对应

**原因：** v-model\:title、title prop 与 update\:title 必须使用同一个公开名称。

**后果：** 父级事件不会进入子级期望的模型链，输入写回后父状态保持旧值。

**错误示例：**

~~~~vue
<ComponentEditor v-model:title="title" />

<script setup lang="ts">
const label = defineModel<string>('label')
</script>
~~~~

**正确写法：**

~~~~vue
<ComponentEditor v-model:title="title" />

<script setup lang="ts">
const title = defineModel<string>('title')
</script>
~~~~

**验证方式：** 对照正确写法验证结果。

### 4. 在一个组件上重复同名 defineModel

**触发条件：** 4. 在一个组件上重复同名 defineModel

**原因：** 每个模型名只能声明一次，需要多个字段就选择不同且稳定的名字。

**后果：** compiler-sfc 会报告 duplicate model name，组件无法按预期编译。

**错误示例：**

~~~~ts
const firstTitle = defineModel<string>('title')
const secondTitle = defineModel<string>('title')
~~~~

**正确写法：**

~~~~ts
const firstTitle = defineModel<string>('firstTitle')
const secondTitle = defineModel<string>('secondTitle')
~~~~

**验证方式：** 对照正确写法验证结果。

### 5. 假定组件 .trim 或 .number 会自动转换值

**触发条件：** 5. 假定组件 .trim 或 .number 会自动转换值

**原因：** 修饰符只记录在 modelModifiers 或具名 Modifiers prop，转换逻辑由子组件定义。

**后果：** 没有 transformer 时，原始空白或字符串数字会继续向父级提交。

**错误示例：**

~~~~vue
<ComponentEditor v-model:title.trim="title" />
<!-- 子级只写 defineModel()，没有读取修饰符 -->
~~~~

**正确写法：**

~~~~vue
<script setup lang="ts">
const [title, modifiers] = defineModel<string, 'trim'>('title', {
  /** 在写回父级前按 trim 修饰符裁剪。 */
  set(value) {
    return modifiers.trim ? value.trim() : value
  },
})
</script>
~~~~

**验证方式：** 对照正确写法验证结果。

### 6. 把 get 与 set 的方向写反，或让 setter 返回 undefined

**触发条件：** 6. 把 get 与 set 的方向写反，或让 setter 返回 undefined

**原因：** get 负责父到子的读取，set 负责子到父的写回，并且每条分支都返回结果。

**后果：** 转换可能发生在错误方向；隐式 undefined 会作为错误载荷发出。

**错误示例：**

~~~~ts
const model = defineModel<string>({
  /** 错误：此分支没有返回原值。 */
  set(value) {
    if (value.length > 0) return value
  },
})
~~~~

**正确写法：**

~~~~ts
const model = defineModel<string>({
  /** 只处理 prop 进入子模型的显示值。 */
  get(value) {
    return value.trim()
  },
  /** 写回值在所有分支都返回明确结果。 */
  set(value) {
    return value.trim()
  },
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 7. 用 default 掩盖父级没有初始化模型

**触发条件：** 7. 用 default 掩盖父级没有初始化模型

**原因：** default 是子级 prop 的缺省值，不是把值写回父 ref 的初始化器。

**后果：** 首屏可能同时看到父 undefined 与子 1，形成父子初始失同步。

**错误示例：**

~~~~ts
const parent = ref<number>()
const child = defineModel<number>({ default: 1 })
~~~~

**正确写法：**

~~~~ts
const parent = ref(1)
const child = defineModel<number>({ required: true })
~~~~

**验证方式：** 对照正确写法验证结果。

### 8. 认为传了 prop 就一定是受控 v-model

**触发条件：** 8. 认为传了 prop 就一定是受控 v-model

**原因：** Vue 3.5.40 只有模型 prop 与 onUpdate:&#42; listener 同时存在才走受控分支。

**后果：** 父级只传 \:title 时，子 ref 会先写 localValue，父状态不会自动跟随。

**错误示例：**

~~~~vue
<ComponentEditor :title="title" />
<!-- 子级给 title.value 赋值，却期待父级 title 自动改变 -->
~~~~

**正确写法：**

~~~~vue
<ComponentEditor v-model:title="title" />
~~~~

**验证方式：** 对照正确写法验证结果。

### 9. 期待 set 在本地回退时保存转换后的值

**触发条件：** 9. 期待 set 在本地回退时保存转换后的值

**原因：** 未绑定模型的 localValue 保存原始写入值；set 的结果仍只用于 emit。

**后果：** 没有父级回流时，本地输入可能保留未规范化文本，不能套用受控路径结果。

**错误示例：**

~~~~ts
const [notes] = defineModel<string>({
  /** 错误假设：本地 ref 一定保存 trim 后的结果。 */
  set(value) {
    return value.trim()
  },
})
~~~~

**正确写法：**

~~~~ts
const notes = defineModel<string>({ default: '' })

/** 在赋给模型前规范化值，保证本地回退也接收转换后值。 */
function updateNotes(event: Event) {
  const input = event.target as HTMLInputElement
  notes.value = input.value.trim()
}
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 九、Vue 3.5.40 源码与官方测试的独立推导

本节把公开文档、固定版本实现事实和课程推导分开。源码可以帮助理解当前版本如何实现契约，但不应把内部函数形状当成未来版本的长期公共 API。

:::steps
### compiler-sfc 记录模型声明并改写宏调用

defineModel.ts 的 processDefineModel() 接受静态字符串模型名；无名称时使用 modelValue，记录类型和运行时选项，重复名称报 duplicate model name，并把调用改写为 useModel(&#95;&#95;props, name, options)。genModelProps() 还会生成默认或具名的 Modifiers prop。

### compileScript 测试固定展开形状

v3.5.40 官方测试覆盖默认、具名、多个模型，修饰符 prop，TypeScript runtime type，required/default 与 get/set transformer，证明宏展开同时保留 prop、emit 和模型元数据。

### useModel 以 prop + listener 判断受控

useModel.ts 通过 customRef 和 watchSyncEffect 观察 prop；setter 先应用 options.set，再检查 onUpdate:&lt;原名&gt;、camelized 或 hyphenated listener。两者同时存在时只 emit 并等待 prop 回流，缺少任一项则先更新 localValue 后仍 emit。

### runtime 测试固定本地回退与转换边界

官方 useModel 测试覆盖父值缺失、listener 缺失、修饰符与 transformer，以及格式化后相同值仍需本地刷新的场景。这些是 Vue 3.5.40 的实现证据，不应泛化为未来版本的触发次数承诺。
:::

~~~~text
defineModel('title')
  -> prop: title / titleModifiers
  -> emit: update:title
  -> useModel(__props, 'title', options)

setter 写入
  -> options.set(value)
  -> prop + onUpdate:title ? 只 emit : 更新 localValue 后 emit
~~~~

对外稳定的是 v-model 的 prop、事件、修饰符与 transformer 方向；compiler-sfc 的内部 metadata、useModel 的 customRef 细节和 listener 变体只作为当前版本的解释证据。

## 十、高级使用场景

| 场景 | 推荐设计 | 避免的误读 |
| --- | --- | --- |
| 受控 / 未绑定可选模型 | 可独立工作的输入使用 default 并明确本地语义；严格组件使用 required | 把未绑定 localValue 当成父状态 |
| 边界规范化 | set 做 trim、大小写或单位归一化，get 只做显示格式化 | 在 transformer 中请求网络或修改其他 ref |
| 对象模型 | 用 model.value = nextObject 替换整个对象 | 直接改 model.value.field 期待经过 ref setter |
| 多个模型 | 为独立字段选择稳定、独立的名称和类型 | 用含义不清的大对象隐藏字段边界 |
| 修饰符协议 | 用第二个类型参数限制允许的 modifier key | 未知修饰符静默改变其他业务状态 |

~~~~ts
interface Settings {
  access: 'viewer' | 'editor'
  notes: string
}

const settings = defineModel<Settings>({ required: true })

/** 用新对象替换模型，确保写入经过模型 setter。 */
function replaceSettings(next: Settings) {
  settings.value = { ...next }
}
~~~~

:::tip
多个模型优先表达多个独立更新边界；只有字段必须原子提交时才选择一个结构固定的对象模型。transformer 应保持同步、纯函数式，并把副作用留在事件处理函数或更高层业务逻辑中。
:::

## 十一、本课边界回顾

完成本课后，你应能从父级模板反推出组件的 prop 与 update 事件，并在 defineModel 的名称、修饰符、required/default 和受控判断之间保持一致。Provide / Inject、跨层依赖共享、状态库与其他通信机制留到各自分类，不把它们混入组件 v-model 的契约。
