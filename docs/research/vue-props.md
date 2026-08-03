# Vue Core 基础课程：Props 调研

> 核验日期：2026-07-30
>
> 适用版本：Vue 3.5.40。
>
> 资料范围：Vue 中文/英文官方文档，以及 `vuejs/core` 的 `v3.5.40` 固定标签编译器、
> 运行时源码与同标签官方测试。外部资料已通过 Tavily Search / Extract 检索和提取，
> 结论均回到一手页面或固定标签源码核验。

## 课程定位与边界

本课目标 ID 为 `vue.core.learn.basics.props`。Vue 官方 Props 指南明确把“组件基础”列为前置；
当前仓库冻结路线也把本课放在 `vue.core.learn.basics.component-basics` 之后、Emits 之前。因此唯一
直接 prerequisite 设为 `vue.core.learn.basics.component-basics` 与官方学习顺序和本地线性课程
顺序一致，没有冲突。

本课只回答一个主问题：**父组件如何把自己拥有的数据声明为子组件的公开输入，并让子组件在不
反向改写所有权的前提下使用这些输入。** 主线限定为 `<script setup lang="ts">`、Composition
API 与 SFC，覆盖：

- Props 是父到子的公开输入，不是子组件自己的可写状态。
- 使用 `defineProps()` 显式声明名称、TypeScript 类型、可选性和默认值。
- 在父模板中区分静态字符串与 `v-bind` JavaScript 表达式，并统一 prop 名称格式。
- 讲清常用原始类型、对象/数组引用、Boolean 特殊转换和开发期校验。
- 用“父更新，子刷新”的可观察流程建立单向数据流。
- 区分“复制为一次性本地初值”与“用 computed 持续派生”的两种需求。
- 明确对象/数组只受浅层只读约束，子组件仍应把共享引用视为父级所有。

以下内容明确排除，不进入正文练习或 Demo：

- 不完整教授 `defineEmits()`、事件声明、事件参数或事件转发；只在结尾预告下一课负责子到父意图。
- 不讲 Slots、Attrs、组件 `v-model`、Provide/Inject、模板引用或直接访问子组件实例。
- 不用 `defineModel()`、`useAttrs()`、`$attrs`、`inheritAttrs` 或 `provide()` / `inject()`。
- 不把 prop validator 当成表单校验、接口 schema、安全边界或生产数据清洗方案。
- 不并行教授 Options API；只说明 `defineProps()` 与 `props` 选项共享同一套运行时声明能力。
- 不把复杂泛型、条件类型、泛型组件、TSX 类型推导或跨文件类型解析作为新手主线。

官方在线指南会持续更新，不按 `3.5.40` 补丁版本冻结。公开语义以 2026-07-30 核验的中英文
官方指南为准；Boolean/default 解析顺序、浅层容器、开发期校验和编译器改写等实现结论，以
`vuejs/core@v3.5.40` 为固定版本权威。

**课程依据：** [Vue 中文 Props 指南](https://cn.vuejs.org/guide/components/props.html)、
[Vue 英文 Props 指南](https://vuejs.org/guide/components/props.html)、
[TypeScript 与组合式 API](https://cn.vuejs.org/guide/typescript/composition-api.html#typing-component-props)。

## 学习目标

完成本课后，学习者应能：

1. 把 prop 解释为父组件拥有、子组件声明并只读消费的公开输入。
2. 用 TypeScript 类型声明 required / optional props，并为可选输入提供正确默认值。
3. 正确传递 string、number、boolean、array 与 object，避免把静态 attribute 误当 JavaScript 值。
4. 预测 Boolean prop 缺席、空 attribute、显式 `false` 以及 String/Boolean 联合类型的结果。
5. 说明父更新为何会刷新子 prop，并拒绝在子组件中直接改写顶层 prop。
6. 根据需求选择 computed 派生或一次性本地副本，不制造错误的双向同步假象。
7. 识别对象/数组 prop 的共享引用边界，并保持修改动作由父级数据所有者执行。
8. 把运行时 prop 校验定位为开发反馈，而不是生产环境的强制验证或值转换。

## 建议教学顺序

### 1. 从组件公开输入开始，不从宏语法开始

复用上一课的父组件与 `CoursePreviewCard`。先让子组件需要标题和时长，再问“这两个值应由谁
拥有”。父级保存课程状态，子级只描述如何显示；Props 是这条边界上的命名输入。

```text
父组件的课程状态
        │
        │ props：title / durationMinutes / featured
        ▼
CoursePreviewCard 只读展示
```

这一步先建立所有权：模板中的父子包含关系不会让子组件自动读取父级局部变量，子组件必须显式
声明公开输入，父组件也必须在使用处传入。

### 2. 只教一套主声明：TypeScript `defineProps<Props>()`

```vue
<script setup lang="ts">
interface Props {
  title: string
  durationMinutes: number
  featured?: boolean
}

const props = defineProps<Props>()
</script>

<template>
  <article>
    <p v-if="props.featured">推荐</p>
    <h3>{{ props.title }}</h3>
    <p>{{ props.durationMinutes }} 分钟</p>
  </article>
</template>
```

基础课保留 `props.title` 这种显式访问，避免在第一次学习时同时解释宏、编译改写和解构变量边界。
随后用短对照说明运行时对象声明存在，并适合直接配置 `type`、`required`、`default`、
`validator`；两种声明不能在同一次 `defineProps()` 中混用。

### 3. 在父模板中区分静态字符串与绑定表达式

```vue
<CoursePreviewCard
  eyebrow="基础课程"
  :title="course.title"
  :duration-minutes="course.durationMinutes"
  :featured="isFeatured"
/>
```

- 没有 `v-bind` 的 `eyebrow="基础课程"` 是静态字符串。
- `:duration-minutes="45"` 才把数字 `45` 作为 JavaScript number 传入。
- `:featured="false"` 才是布尔 `false`；`featured="false"` 是字符串。
- JavaScript 声明用 camelCase，父模板传参按官方约定写 kebab-case。

这里不展开 `v-bind="object"` 的合并规则；它可放在进阶提示，主线保持每个公开输入显式可见。

### 4. 把默认值和 Boolean 转换拆开教学

先讲普通可选 prop：缺席时通常为 `undefined`，若业务需要稳定展示则提供默认值。Vue 3.5 的
类型声明可以用响应式解构的原生默认值；基础课也可用 `withDefaults()`，但一节课只选一种写法
落地，避免同一示例混用。

```ts
interface Props {
  eyebrow?: string
  topics?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  eyebrow: '普通课程',
  topics: () => [],
})
```

随后单独讲 Boolean：它模仿原生 boolean attribute，缺席通常是 `false`，仅写属性名或传入空
字符串通常是 `true`。不要把它描述成通用字符串到布尔值的解析器。

### 5. 用父级按钮建立单向更新反馈环

父级按钮依次替换标题、时长、featured 和标签数组；子组件无按钮、无本地改写逻辑，只被动显示
最新 props。学习者应观察到：

1. 所有变化都从父级状态开始。
2. 父级重新渲染后，子级收到最新输入并更新视图。
3. 子级没有“把值写回父级”的隐式通道。

这足以证明 Props 的方向，不需要提前引入 Emits。

### 6. 再解释“想改 prop”背后的两种合法需求

若输入只作为组件创建时的初值，复制到本地 ref，并明确它与后续父值断开：

```ts
const props = defineProps<{ initialPage: number }>()
const page = ref(props.initialPage)
```

若只是把输入规范化为展示值，使用 computed 保持持续派生：

```ts
const props = defineProps<{ title: string }>()
const normalizedTitle = computed(() => props.title.trim())
```

基础课不提供“子级请求父级修改”的代码；只说明该需求由下一课 Emits 建立显式出口。

### 7. 最后处理对象和数组的引用边界

父级传入 `topics` 数组和 `courseMeta` 对象，子级只读取。若子级需要排序或筛选，创建派生结果，
不在原数组上调用会修改自身的 `sort()` / `push()`。

```ts
const props = defineProps<{ topics: string[] }>()
const sortedTopics = computed(() => [...props.topics].sort())
```

这一步要说清：顶层 prop 绑定只读，不等于对象被深度冻结。Vue 保留共享引用，嵌套写入技术上
可能成功，却会隐蔽修改父状态；课程和 Demo 都不示范这种反向写入。

## 最小核心知识

### 显式声明与两种形式

Vue 需要组件显式声明它接收哪些 props。`<script setup>` 中使用 `defineProps()`；它是编译器宏，
无需导入，编译后不会作为普通运行时函数调用。

| 形式 | 示例 | 基础课定位 |
| --- | --- | --- |
| 类型声明 | `defineProps<{ title: string }>()` | 主线；清楚表达 TS 类型与可选性 |
| 运行时声明 | `defineProps({ title: String })` | 识别；需要 validator 等运行时配置时使用 |
| 字符串数组 | `defineProps(['title'])` | 只识别；缺少精确类型信息，不作为 TS 课程主线 |

类型声明和运行时参数不能同时传给同一个 `defineProps()`。编译器会尽力从 TypeScript AST 生成
等价运行时声明；这不是完整 TypeScript 类型求值，因此整个 Props 对象使用需要实际类型分析的
复杂条件类型时会超出推导能力。

依据：[script setup：defineProps / defineEmits](https://cn.vuejs.org/api/sfc-script-setup.html#defineprops-defineemits)、
[`defineProps.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/script/defineProps.ts)。

### 父模板传值与名称格式

| 父模板写法 | 子组件收到的典型值 | 说明 |
| --- | --- | --- |
| `title="Vue"` | `'Vue'` | 静态字符串 |
| `:likes="42"` | `42` | JavaScript number |
| `featured` | `true` | Boolean prop 的空 attribute 转换 |
| `:featured="false"` | `false` | 显式布尔值 |
| `:topics="['Vue', 'TS']"` | Array | 数组表达式 |
| `:meta="{ level: 'beginner' }"` | Object | 对象表达式 |

声明和脚本读取使用 camelCase，如 `durationMinutes`；SFC 父模板传递使用 kebab-case，如
`duration-minutes`。这是官方推荐约定，也兼容 DOM 内模板的大小写限制。本课不重复教授 DOM 内
模板，只沿用上一课已建立的模板来源边界。

依据：[Props：传递 prop 的细节](https://cn.vuejs.org/guide/components/props.html#prop-passing-details)。

### required、optional 与默认值

所有 prop 默认可选；除 Boolean 外，缺席的可选 prop 通常为 `undefined`。声明 `default` 后，
无论父级未传，还是显式传入 `undefined`，解析结果都会使用默认值。

| 默认值写法 | 可变对象/数组是否用工厂 | 备注 |
| --- | --- | --- |
| 运行时 `default` | 是 | 每个实例应取得自己的引用；工厂接收 raw props |
| `withDefaults()` | 是 | 对象/数组包装为返回值函数 |
| Vue 3.5 响应式解构默认值 | 否 | 原生默认表达式按实例执行 |
| Function 类型 prop 的 `default()` | 否 | 该函数本身是默认值，不作为工厂调用 |

```ts
interface Props {
  title?: string
  topics?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  title: '未命名课程',
  topics: () => [],
})
```

基础课正文选择 `withDefaults()` 或响应式解构默认值其中一种即可。若选择解构，必须说明这是
Vue 3.5+ 行为；若希望始终通过 `props.xxx` 访问，则 `withDefaults()` 的心智模型更统一。

依据：[Props：Prop 校验](https://cn.vuejs.org/guide/components/props.html#prop-validation)、
[script setup：类型声明默认值](https://cn.vuejs.org/api/sfc-script-setup.html#default-props-values-when-using-type-declaration)。

### Boolean 特殊转换

`Boolean` prop 的行为更接近原生 `disabled` / `checked` attribute，而不是普通字符串转换：

| 声明与传法 | 结果 |
| --- | --- |
| `disabled: Boolean`，父级缺席 | `false` |
| `disabled: Boolean`，父级写 `disabled` | `true` |
| `disabled: Boolean`，父级写 `disabled=""` | `true` |
| `disabled: Boolean`，父级写 `:disabled="false"` | `false` |
| `disabled: Boolean`，父级写 `disabled="false"` | 字符串 `'false'`，并产生开发期类型警告 |
| `disabled: { type: Boolean, default: undefined }`，父级缺席 | `undefined` |

联合类型还受声明顺序影响：`[Boolean, String]` 的空 attribute 转为 `true`；
`[String, Boolean]` 的空 attribute 保持空字符串。`[Number, Boolean]` 仍允许 Boolean 转换，因为
影响该分支的是 String 是否排在 Boolean 之前。

运行时 `normalizePropsOptions()` 预先记录需要 Boolean/default 解析的 key，并用 Boolean 与 String
的构造器位置生成转换标记；`resolvePropValue()` 先处理 default，再处理缺席和空字符串的 Boolean
转换。这解释了 `default: undefined` 为什么能保留三态语义。

依据：[Props：Boolean 类型转换](https://cn.vuejs.org/guide/components/props.html#boolean-casting)、
[`componentProps.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentProps.ts)、
[`componentProps.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/componentProps.spec.ts)。

### 单向数据流与只读边界

所有 props 都是单向向下绑定：父级值更新会刷新子级输入，子级不能给顶层 prop 重新赋值。父组件
每次更新时，子 props 都会用最新父值刷新，所以“先在子级改一下，稍后再同步”不是稳定模型。

`v3.5.40` 的运行时先把有状态组件 props 容器创建为 `shallowReactive`；调用 `setup()` 时，开发
模式给用户代码的是 `shallowReadonly(instance.props)` 视图。这组“浅响应 + 浅只读”恰好解释：

- 父级替换顶层值时，子级依赖能重新更新。
- 子级给 `props.title` 赋值会触发只读警告且不会成为可靠状态。
- `props.meta.level` 这类嵌套写入没有被深度只读代理阻止，因为对象引用仍然共享。

依据：[Props：单向数据流](https://cn.vuejs.org/guide/components/props.html#one-way-data-flow)、
[`componentProps.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentProps.ts)、
[`component.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/component.ts)。

### 开发期校验不是生产边界

运行时对象声明可以配置 `type`、`required`、`default` 与 `validator`。错误输入会在开发构建中
产生控制台警告，但 Vue 不会把字符串 `'42'` 自动清洗为 number，也不会因为 validator 返回
`false` 就拒绝创建组件。

`componentProps.ts` 的 `initProps()` / 更新路径只在 `__DEV__` 分支调用 `validateProps()`。
因此 prop 校验适合组件作者尽早发现误用，不应承担 API 响应解析、表单规则、安全判断或生产
schema 验证。

默认函数和 validator 在组件实例创建前运行，不能读取组件实例状态。运行时 default 工厂可以
收到 raw props；Vue 3.4+ validator 的第二个参数可收到完整 props，可用于少量跨字段开发期检查，
但仍不改变它仅警告的性质。

依据：[Props：Prop 校验](https://cn.vuejs.org/guide/components/props.html#prop-validation)、
[`componentProps.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentProps.ts)。

## Vue 3.5.40 源码与测试推导

### 1. `defineProps()` 在编译期拒绝混合声明

`processDefineProps()` 分别记录运行时参数和类型参数；同一次调用同时出现二者时直接产生编译
错误。宏参数整体提升到 setup 外层，所以不能引用稍后在 `<script setup>` 中声明的局部变量，
但可以引用导入绑定。

**课程推导：** 主线只展示 `defineProps<Props>()`。运行时声明作为能力对照，不把两套配置拼成
所谓“类型更完整”的混合写法。

### 2. 声明先参与输入分流，再进入 default / Boolean 解析

`initProps()` 创建 props 与 attributes 容器，`setFullProps()` 按规范化声明处理原始 VNode 输入；
需要 default 或 Boolean 转换的 key 会集中交给 `resolvePropValue()`。所有已声明 key 最终都会出现在
props 对象上，缺席普通 prop 为 `undefined`。

**课程推导：** `defineProps()` 不只是给 TypeScript 看；它参与运行时输入识别、默认值和 Boolean
行为。但 Attrs 的透传规则属于后续独立课程，本课只说明“必须声明公开输入”。

### 3. default 工厂结果按组件实例缓存

`resolvePropValue()` 把工厂结果保存在 `instance.propsDefaults`。同一实例因为其他 prop 更新而再次
解析时复用之前结果，官方测试验证 default 对象不会无故换引用并触发 watcher；不同实例各自拥有
独立的 `propsDefaults`。

**课程推导：** 工厂的目标不是“每次渲染创建新对象”，而是“每个组件实例创建自己的默认引用”。
这比只背诵 `default: () => []` 更准确。

### 4. Boolean 转换由规范化标记驱动

`normalizePropsOptions()` 计算 `shouldCast` 与 `shouldCastTrue`，其中 String 出现在 Boolean 前面会
关闭空字符串转 `true` 的分支。更新时不需要重新分析声明，只对已标记 key 解析。

**课程推导：** `[Boolean, String]` 和 `[String, Boolean]` 不是等价的联合类型排列；课程至少给出
一组对照，避免学习者把顺序差异当偶然现象。

### 5. 顶层只读与嵌套可变来自浅层代理

有状态组件保存 `shallowReactive(props)`，setup 开发视图使用 `shallowReadonly(instance.props)`。
该边界既保证顶层父输入可追踪，又避免为任意外部对象递归包装只读代理。

**课程推导：** “Props 只读”必须准确表述为“顶层绑定只读”。对象/数组嵌套写入不是推荐的逃生
口，而是共享 JavaScript 引用带来的架构边界。

### 6. 运行时校验只存在于开发分支

初始化和更新路径都在 `__DEV__` 条件内调用 `validateProps()`。类型、required 与 validator 失败
只调用警告流程；测试断言错误文本，而不是输入被拦截或转换。

**课程推导：** 课程可用控制台警告帮助新手发现传值错误，但不能声称应用已经获得生产校验。

### 7. 3.5 响应式解构是编译器能力，不是 ref

`definePropsDestructure.ts` 记录解构 key、别名和默认表达式；同一 `<script setup>` 内对变量的读取
会改写为 prop 访问。它拒绝嵌套解构和计算属性 key。把解构值直接传给 `watch()` 仍是传当前值，
需要 `() => foo` getter 才保持追踪。

**课程推导：** 这适合课末“Vue 3.5 进阶”提示，不应抢占基础课的 `props.foo` 主线。解构后的值
也不是 ref，不要教学习者写 `foo.value`。

## 高质量常见易错点

### 1. 把静态 attribute 当成 number 或 boolean

- **错误：** `<CourseCard duration-minutes="45" featured="false" />`
- **原因：** 无 `v-bind` 的 attribute 是字符串；`'false'` 也不是 Boolean 转换中的 false 语法。
- **后果：** number 校验警告、字符串拼接或 truthy 判断错误。
- **修正：** `<CourseCard :duration-minutes="45" :featured="false" />`。

### 2. 忽略 Boolean / String 联合类型的顺序

- **错误假设：** `[Boolean, String]` 与 `[String, Boolean]` 完全等价。
- **原因：** 运行时用构造器位置决定空字符串能否转成 `true`。
- **后果：** 同一个 `<Widget disabled />` 在两种声明下分别得到 `true` 或 `''`。
- **修正：** 需要原生 boolean attribute 语义时把 Boolean 放在 String 前；不需要联合类型时不要添加。

### 3. 在子组件中直接改写顶层 prop

- **错误：** `props.title = '新标题'`。
- **原因：** title 由父级拥有，setup 侧看到浅只读 props。
- **后果：** 开发环境只读警告；父级下次更新仍会用自己的值刷新子级。
- **修正：** 展示变换使用 computed；一次性初值显式复制到本地 ref；请求父级修改留给下一课 Emits。

### 4. 复制 prop 到 ref 后仍期待跟随父级

- **错误：** `const title = ref(props.title)` 后认为父级 title 变化会自动更新本地 title。
- **原因：** `ref()` 只读取创建当时的值，已经与 prop 后续更新断开。
- **后果：** 父子画面显示不同标题，开发者又添加 watcher 维持两份状态。
- **修正：** 需要持续派生就用 `computed(() => props.title.trim())`；只有真正的本地初始状态才复制。

### 5. 认为 Props 会深度阻止对象/数组修改

- **错误：** `props.topics.push('Emits')` 或 `props.meta.level = 'advanced'`。
- **原因：** 顶层绑定浅只读，嵌套对象仍是父子共享引用。
- **后果：** 子级在没有明确上行协议的情况下改变父状态，变更来源难以追踪。
- **修正：** 子级只读；排序、过滤先复制或 computed 派生，真正修改由父级所有者执行。

### 6. 给每个实例共享同一个可变默认对象

- **错误：** `withDefaults(..., { topics: [] })` 或运行时直接复用模块级数组作为 default。
- **原因：** 多个组件实例可能持有同一个可变引用。
- **后果：** 一个实例的嵌套修改泄漏到其他实例。
- **修正：** `withDefaults(..., { topics: () => [] })`；Vue 3.5 原生解构默认值则不需要工厂。

### 7. 把 prop 校验当成生产数据边界

- **错误假设：** `type: Number` 会把 `'45'` 转成 number，validator false 会拒绝输入。
- **原因：** `validateProps()` 只在开发分支警告，不负责强制转换或拦截。
- **后果：** 开发环境看见警告但业务仍收到坏值；生产环境连该警告都没有。
- **修正：** 父级和外部输入边界先完成真实解析；prop 校验只承担组件使用反馈。

### 8. 把 3.5 解构 prop 当成 ref 或普通可传递响应式源

- **错误：** `const { count } = defineProps<{ count: number }>()` 后写 `count.value` 或
  `watch(count, callback)`。
- **原因：** 响应性来自编译器在当前 `<script setup>` 内改写读取；变量不是 ref，函数参数会先求值。
- **后果：** `.value` 不存在，或 watcher 收到非响应式当前值并警告。
- **修正：** 基础课保持 `props.count`；进阶解构场景传 `() => count`。

## 源码推导出的高级使用场景

### 1. 用 raw props 计算实例默认值

运行时 default 工厂接收组件收到的 raw props，可让一个可选输入的默认值参考另一个原始输入。
仅适合简单、确定、无实例依赖的规则；复杂派生仍放 computed，避免默认解析阶段承担业务流程。

### 2. 用 validator 第二参数做开发期跨字段提示

Vue 3.4+ validator 可以读取完整 props，例如检查 `min <= max`。它适合组件库开发体验，不适合
替代生产 schema，因为失败只警告。

### 3. 用 `default: undefined` 保留 Boolean 三态

默认 Boolean 缺席为 `false`。若组件确实需要区分“父级没有决定”和“父级明确 false”，可声明
`default: undefined`，让缺席结果保留 `undefined`。基础 UI 通常只需二态，不应无目的增加三态。

### 4. 将响应式解构 prop 以 getter 交给组合式函数

Vue 3.5 中可写 `useComposable(() => foo)`，由组合式函数在 computed/watch getter 中调用或用
`toValue()` 规范化。这样保留父级更新，又不把 prop 冒充 ref。

### 5. 使用 `v-bind="object"` 传递同形输入对象

官方支持把对象每个属性展开为 props，适合数据对象和组件接口确实同形的薄适配层。公共组件主线
仍优先显式绑定，避免对象新增字段后无意扩大传入面；合并顺序和 attrs 行为不进入本课。

## 单一同源 Demo 冻结

### 名称、ID 与主命题

唯一 Demo 命名为“Props 输入流实验台”，精确资产 ID：

`vue.core.learn.basics.props.props-input-flow-demo`

它只验证一个主命题：**父组件是唯一状态来源；父级更新输入后，子组件通过已声明 props 被动刷新，
子级不提供任何反向修改入口。** 该设计与官方单向数据流一致，也满足不依赖 Emits 的冻结要求。

### 文件结构与同源约束

```text
src/content/demos/vue/core/learn/basics/props/
├─ props-input-flow-demo.vue
└─ parts/
   └─ CoursePreviewCard.vue
```

- `props-input-flow-demo.vue` 是唯一公开 Demo ID、运行入口和源码面板 raw source 来源。
- 父文件保存 `course`、`featured`、`topics` 与可选说明开关，并导入一个真实子 SFC。
- `CoursePreviewCard.vue` 只声明和读取 props，可使用 computed 生成展示文本，不创建同名本地副本。
- `parts/` 子组件是实际运行依赖，不创建第二个公开 Demo ID，不复制到父文件伪装单文件实现。
- 当前 registry 已按约定 glob 自动发现父 Demo；不为本课修改 registry 实现或多文件源码查看器。

### 父级状态与传值

父级保留一份课程状态：

- `title: string`：按钮在“组件基础”和“Props”两个标题间切换。
- `durationMinutes: number`：按钮在 `30` / `45` 间切换，证明 number 由动态绑定传入。
- `featured: boolean`：父级 checkbox 或按钮切换，子级只显示当前布尔状态。
- `topics: string[]`：父级通过替换新数组增加/恢复主题，子级不调用 `push()`。
- `courseMeta: { level: string }`：父级按钮替换对象或其所有者字段，子级只读取。
- `description?: string`：父级通过 `:description="showDescription ? description : undefined"` 验证
  缺席/undefined 会使用子级默认文案。

父模板保留一个静态字符串 `eyebrow="基础课程"`，其余非字符串输入全部用 `v-bind`，让源码面板
同时形成静态 string、动态 number、Boolean、array、object 和 default 的单一对照。

### 必须可验证的交互顺序

1. 初始父级状态与子卡片文本完全一致，featured 为 false，description 使用默认值。
2. 点击“切换课程”，父级标题、时长和子卡片同步更新；没有子级内部提交按钮。
3. 切换 featured，子卡片同时以文本“推荐：是/否”和非颜色标记更新。
4. 点击“更新主题”，父级替换 topics 数组，子级列表更新；原数组不在子级被修改。
5. 显示自定义 description 后子级展示父值；再次关闭则恢复默认文案。
6. 更新 courseMeta 后子级 level 更新，所有日志或状态说明都标记动作来自父级。

Demo 不使用 `defineEmits()`、Slots、组件 `v-model`、Attrs、Provide/Inject、模板引用、watcher、store、
远程请求或动态组件。也不加入故意触发控制台警告的按钮；错误写法放在静态易错点中，运行 Demo
保持无错误反馈环。

### 布局与可访问性约束

- 390px 下严格单列；宽屏可用 flex 并排父级控制区和子级预览，但不使用 CSS Grid 或 `gap`。
- flex 子项设置 `min-width: 0`，区域间用相邻选择器 margin；标题、数组项和对象值允许换行。
- 所有按钮使用原生 `<button type="button">`，触控高度至少 44px；Boolean 控件若用 checkbox，
  必须有可见 `<label>`。
- 父级输入和子级结果都有可见标题，E2E 可按区域定位，不依赖左右位置或颜色。
- 子级状态使用文本同时表达值和类型，例如 `时长：45（number）`、`推荐：否（boolean）`。
- 更新结果可在子级摘要使用克制的 `aria-live="polite"`，不能每次操作播报整页。
- 200% 文本缩放和 390px 宽度下不截断按钮文字，不产生页面级横向滚动。
- 源码入口可读取唯一父 Demo 文件，`.demo-box .missing` 必须为 0。

## 建议 metadata

```ts
export const meta = defineLessonMeta({
  id: 'vue.core.learn.basics.props',
  type: 'lesson',
  title: 'Props',
  summary: '声明父到子的组件输入，正确处理类型、默认值与单向数据流边界',
  ecosystem: 'vue',
  module: 'core',
  collection: 'basics',
  level: 'beginner',
  prerequisites: ['vue.core.learn.basics.component-basics'],
  related: [
    'vue.core.learn.basics.component-basics',
    'vue.core.reference.components.props',
  ],
  tags: ['Props', 'defineProps', '父子组件', '单向数据流', 'Boolean'],
  sources: [
    {
      title: 'Vue 组件 Props',
      url: 'https://cn.vuejs.org/guide/components/props.html',
    },
    {
      title: 'Vue TypeScript 与组合式 API',
      url: 'https://cn.vuejs.org/guide/typescript/composition-api.html#typing-component-props',
    },
    {
      title: 'Vue script setup',
      url: 'https://cn.vuejs.org/api/sfc-script-setup.html#defineprops-defineemits',
    },
    {
      title: 'Vue 3.5.40 defineProps.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/script/defineProps.ts',
    },
    {
      title: 'Vue 3.5.40 definePropsDestructure.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/script/definePropsDestructure.ts',
    },
    {
      title: 'Vue 3.5.40 componentProps.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentProps.ts',
    },
    {
      title: 'Vue 3.5.40 component.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/component.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-07-30',
  estimatedMinutes: 45,
})
```

本地冻结建议“唯一 prerequisite 为 component-basics、related 仅 component-basics 与 reference
props”与官方前置说明及当前仓库可导航 ID 一致，不需要修正。`vue.core.learn.basics.emits` 当前
仍为 planned，且本课只允许后续预告，因此不提前加入 related。

## 后续实施范围建议

后续实现可限定为：

- `src/content/entries/learn/vue/core/basics/props.ts`
- `src/content/demos/vue/core/learn/basics/props/props-input-flow-demo.vue`
- `src/content/demos/vue/core/learn/basics/props/parts/CoursePreviewCard.vue`
- `src/content/catalog/manifests/vue-core-track.ts`
- `src/content/catalog/vue-core-track.spec.ts`
- `src/content/interactive/registry.spec.ts`
- `tests/e2e/progress.spec.ts`
- `docs/重构实施计划.md`

不需要修改 schema、Demo registry 实现、参考 Props entry、全局样式或其他课程。实现时只把 Props
从 planned 改为 available，保持 component-basics → Props → Emits 的冻结顺序；不能把单课完成写成
Stage 6 或整条 Vue 学习路线关闭。

最小验证只需覆盖：课程顺序与 prerequisite、唯一 Demo ID 可解析、父级操作会刷新子级、默认值和
Boolean 可观察、390px 无横向滚动。不要为每一种 prop 类型另写独立测试。

## 固定来源清单

### Vue 官方文档

- [Vue 中文官网：Props](https://cn.vuejs.org/guide/components/props.html)：课程前置、声明、传值、
  名称、单向数据流、对象/数组引用、校验、默认值与 Boolean 转换。
- [Vue 英文官网：Props](https://vuejs.org/guide/components/props.html)：与中文页面交叉核对当前
  Boolean/String 顺序、静态与动态传值、`v-bind="object"` 和响应式解构说明。
- [Vue 中文官网：TypeScript 与组合式 API](https://cn.vuejs.org/guide/typescript/composition-api.html#typing-component-props)：
  类型声明、导入类型限制、响应式解构默认值与 `withDefaults()`。
- [Vue 中文官网：script setup](https://cn.vuejs.org/api/sfc-script-setup.html#defineprops-defineemits)：
  编译器宏、类型/运行时声明互斥、提升限制和 Vue 3.5 响应式 Props 解构。

### vuejs/core v3.5.40

- [`packages/compiler-sfc/src/script/defineProps.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/script/defineProps.ts)：
  宏识别、重复/混合声明错误、类型到运行时生成与 `withDefaults()` 处理。
- [`packages/compiler-sfc/src/script/definePropsDestructure.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/script/definePropsDestructure.ts)：
  解构绑定、默认表达式、别名、rest 与不支持的嵌套模式。
- [`packages/runtime-core/src/componentProps.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentProps.ts)：
  props 初始化/更新、default 工厂缓存、Boolean 标记与转换、浅响应容器和开发期校验。
- [`packages/runtime-core/src/component.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/component.ts)：
  setup 接收 props 的 shallowReadonly 开发视图。
- [`packages/runtime-core/__tests__/componentProps.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/componentProps.spec.ts)：
  default 工厂缓存、Boolean 组合、类型警告与 prop 写入警告的官方回归证据。

## 结论

本课应把 Props 教成“父级所有、子级声明、单向刷新”的组件输入契约，而不是 `defineProps()` 参数
大全。最重要的可观察反馈环是父级按钮更新同一份状态，子组件被动刷新；一个
`props-input-flow-demo` 足以同时呈现 string、number、Boolean、default 和共享引用的读取边界，
无需 Emits。源码最值得转化为教学判断的三点是：default 与 Boolean 有明确解析顺序、setup 只读
边界是浅层的、运行时校验只在开发分支警告。
