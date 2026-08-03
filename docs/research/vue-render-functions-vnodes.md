# Vue Core 高级课程：渲染函数与虚拟节点调研

> 查证日期：2026-08-01  
> 适用版本：Vue 3.5.40  
> 资料范围：Vue 官方中文渲染函数、`key` 与 `setup()` 文档，`vuejs/docs` 官方 Markdown，
> 以及 `vuejs/core@v3.5.40` 固定标签源码和官方测试。外部资料通过 Tavily 定位；博客、问答、
> issue、Vue 2 文档、`main` 分支运行时实现和现有 Reference 正文不作为技术结论依据。

## 已冻结实施契约

| 项目 | 冻结值 |
| --- | --- |
| 课程 ID | `vue.core.learn.advanced.render-functions-vnodes` |
| 标题 | 渲染函数与虚拟节点 |
| 阶段 / 分类 | `advanced` / `extension-and-rendering` |
| 唯一直接前置 | `vue.core.learn.advanced.custom-directives` |
| 唯一公开 Demo ID | `vue.core.learn.advanced.render-functions-vnodes.vnode-identity-lab-demo` |
| Demo 标题 | 一次重排，状态仍跟随业务身份 |
| 易错点 | 恰好 8 个高质量候选 |
| 源码推导 | 8 个，严格绑定 Vue 3.5.40 |
| 预计时长 | 65 分钟 |
| 实施前总量 | Vue 三条学习路线 `24 available / 36 planned` |
| 实施后总量 | Vue 三条学习路线 `25 available / 35 planned` |
| 后续课程 | `vue.core.learn.advanced.plugins` 继续保持 `planned` |

本课对应 manifest 中已有的“渲染函数与虚拟节点”，不是新增另一篇同名课程。上一课已经教授如何
把自定义指令附加到普通元素；本课只在辅助 API 边界中说明 `withDirectives()`，不重讲指令钩子、
binding 或资源清理。现有 `vue.core.reference.advanced.render-function` 继续承担 API 速查和递归树
示例，本批不得修改、复制或重写该 Reference 及其 Demo。

本课只回答两个主问题：**什么时候模板已经不再是最清晰的表达，以及 renderer 如何用 `type + key`
判断一个 VNode 是否还是同一身份。** 主线限定为 Vue SFC、`<script setup lang="ts">`、手写 `h()`
和客户端组件列表，覆盖：

- 模板优先，只有需要 JavaScript 完整编程能力时才下沉渲染函数。
- `h(type, props?, children?)` 的元素、组件和两参数省略边界。
- VNode 是渲染描述而不是真实 DOM；公开阅读只依赖 `type`、`props`、`children`、`key`。
- `setup()` 返回渲染函数，响应式读取发生在每次 render 执行期间。
- 原生元素使用字符串 type，组件优先使用直接导入的定义。
- 事件使用 `onXxx` props；组件 children 使用默认 slot 函数或 slots 函数对象。
- 同一 VNode 树的节点对象必须唯一；已有 VNode 不直接改 props，需要变化时用 `cloneVNode()`。
- 同一父节点下使用唯一、稳定、来自业务数据的 `key`，以保留有状态子组件身份。
- `mergeProps()`、`isVNode()`、`resolveComponent()` 和 `withDirectives()` 的窄职责边界。

以下内容明确排除，不进入正文主线、练习或 Demo：

- JSX / TSX 语法、Babel / Vite JSX 插件、类型命名空间或 JSX 工具链配置。
- 自定义 renderer、宿主操作、编译器 transform、block tree、patch flag 或静态提升实现教学。
- 用渲染函数重写普通静态模板，或把 `h()` 宣传为默认性能优化手段。
- 重讲 `v-if`、`v-for`、事件修饰符、插槽、自定义指令或动态组件的完整基础课程。
- 读取或修改 VNode 的 `el`、`component`、`shapeFlag`、`patchFlag`、`dirs` 等私有字段。
- 完整 schema-driven UI 引擎、递归页面生成器、表单设计器或通用渲染 DSL。
- SSR、hydration、自定义元素、Teleport / Suspense / Transition 的内部 patch 身份专题。
- 把 planned 的 Render Function API coverage 顺手改为 available，或修复现有 Reference。
- 插件安装、全局能力注入或 `app.use()`；插件继续留给下一课。
- 修改 router、schema、registry glob、全局样式、`main.ts` 或其他课程。

课程定位依据：[Vue 渲染函数与 JSX 指南](https://cn.vuejs.org/guide/extras/render-function.html)、
[Vue 渲染函数 API](https://cn.vuejs.org/api/render-function.html)、
[`key` 特殊 attribute](https://cn.vuejs.org/api/built-in-special-attributes.html#key) 和
[`setup()` 与渲染函数](https://cn.vuejs.org/api/composition-api-setup.html#usage-with-render-functions)。

## 一手来源

### 公开文档契约

- [Vue 中文渲染函数与 JSX 指南](https://cn.vuejs.org/guide/extras/render-function.html)：模板优先、
  `h()`、VNode 公开字段、VNode 唯一性、事件 props、组件、slot 函数和自定义指令写法。
- [Vue 中文渲染函数 API](https://cn.vuejs.org/api/render-function.html)：`h()`、`mergeProps()`、
  `cloneVNode()`、`isVNode()`、`resolveComponent()` 与 `withDirectives()` 的公开签名和职责。
- [Vue 中文内置特殊 Attributes：`key`](https://cn.vuejs.org/api/built-in-special-attributes.html#key)：
  keyed / unkeyed 更新、同级唯一性、重排、销毁与强制替换语义。
- [Vue 中文组合式 API：`setup()` 与渲染函数](https://cn.vuejs.org/api/composition-api-setup.html#usage-with-render-functions)：
  `setup()` 返回 render closure，并在闭包中读取响应式状态。
- [`vuejs/docs` 渲染函数指南 Markdown](https://github.com/vuejs/docs/blob/main/src/guide/extras/render-function.md)：
  官网指南的英文原始 Markdown，用于交叉核对 VNode、slot 和事件措辞。
- [`vuejs/docs` 渲染函数 API Markdown](https://github.com/vuejs/docs/blob/main/src/api/render-function.md)：
  官网 API 的英文原始 Markdown，用于交叉核对辅助函数边界。

### Vue 3.5.40 固定源码与官方测试

- [`packages/runtime-core/src/h.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/h.ts)：
  手写 render 使用的重载外壳和参数归一化。
- [`packages/runtime-core/src/vnode.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/vnode.ts)：
  VNode 标记、`type + key` 比较、clone、children 归一化与 props 合并。
- [`packages/runtime-core/src/renderer.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/renderer.ts)：
  不同身份替换、keyed children 映射、复用、挂载和移动路径。
- [`packages/runtime-core/src/helpers/resolveAssets.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/resolveAssets.ts)：
  `resolveComponent()` 的上下文、局部 / 全局查找和未命中回退。
- [`packages/runtime-core/src/directives.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/directives.ts)：
  `withDirectives()` 的 render-context 限制与 binding 附加。
- [`h.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/h.spec.ts)：
  两参数、三参数、单 VNode child、默认 slot 和具名 slots 的官方回归测试。
- [`vnode.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/vnode.spec.ts)：
  `cloneVNode()`、class / style / listener 合并和 VNode 归一化的官方回归测试。
- [`rendererChildren.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/rendererChildren.spec.ts)：
  keyed children 的追加、删除、重排、重复 key 和同 key 不同 type 行为。

文档事实与源码事实必须分开表达。官网规定的是公开用法；`__v_isVNode`、shape flag、
`keyToNewIndexMap`、最长递增子序列、`currentRenderingInstance` 和隐式 clone 都属于 Vue 3.5.40
实现证据，不得写成永久稳定的公共 API，也不得在课程实现中导入或读取。

## 必须准确覆盖的公开语义

### 1. 模板是默认选择，渲染函数只用于模板难以清晰表达的结构

Vue 官方在渲染函数指南开头仍推荐绝大多数界面使用模板。模板更接近最终 DOM、便于团队阅读，并让
编译器掌握静态结构。渲染函数的价值不是“更底层所以更快”，而是获得普通 JavaScript 的分支、循环、
函数组合和动态 type 能力。

适合下沉的最小场景包括：节点 type 与层级由数据 schema 决定、需要用同一算法程序化组合不同组件，
或库作者必须接收和变换 VNode。一个普通列表、条件块、表单或静态组件树仍应保留模板；能用模板清楚
表达时，额外的 `h()` 嵌套只会降低可读性。

### 2. `h()` 创建 VNode 描述，不创建真实 DOM

公开签名可简化为：

```ts
function h(
  type: string | Component,
  props?: object | null,
  children?: Children | Slot | Slots,
): VNode
```

`type` 是必需参数；字符串表示原生元素，组件定义表示组件。`props` 可以是对象或 `null`；元素 children
可以是文本、VNode 或数组，组件 children 则应使用 slot 函数。VNode 是 Vue 交给 renderer 的节点描述，
不是 `HTMLElement`，不能对它调用 DOM 方法。

官方指南允许读取的稳定概念字段只有：

| 字段 | 课程语义 | 不应外推 |
| --- | --- | --- |
| `type` | 原生标签、组件定义或内置类型 | 不读取 shape flag 推断 renderer 分支 |
| `props` | attribute、property、组件 prop、事件和特殊 prop | 不原地修改已有对象 |
| `children` | 文本、子 VNode 或组件 slots | 不依赖内部标准化标记 |
| `key` | 同级 diff 时的身份提示 | 不是全局 ID，也不等于 DOM id |

### 3. 两参数写法只有在 children 不是 slots 对象时才安全省略 props

下面三种元素写法分别表示只有 type、type + props 和省略 props 的 type + children：

```ts
h('div')
h('div', { class: 'panel' })
h('div', '正文')
```

两参数调用时，普通非数组对象会被解释为 props；因此具名 slots 对象不能放在第二参数。创建组件的具名
slots 时必须用 `null` 占住 props：

```ts
h(ContentPanel, null, {
  /** 创建默认插槽内容。 */
  default: () => h('p', '正文'),
  /** 创建底部插槽内容。 */
  footer: () => h('button', { type: 'button' }, '关闭'),
})
```

组件只有默认 slot 时可把一个函数放在第二参数：

```ts
/** 创建默认插槽内容。 */
const renderDefault = () => h('p', '正文')

h(ContentPanel, renderDefault)
```

### 4. `setup()` 必须返回 render closure

`setup()` 返回函数时，Vue 把该函数作为组件 render。响应式依赖必须在 render closure 每次执行时读取，
这样状态变化才会产生新的 VNode 树：

```ts
export default defineComponent({
  /** 建立计数状态并返回渲染函数。 */
  setup() {
    const count = ref(0)

    /** 根据最新计数创建本轮 VNode。 */
    const renderCounter = () => h('p', `计数：${count.value}`)
    return renderCounter
  },
})
```

从 `setup()` 直接返回一次创建的 VNode，不会建立 render closure。把 VNode 提前缓存到组件外，也会同时
违反每个渲染位置应获得新 VNode 的约束。

### 5. 组件优先直接导入，注册名解析只在必要时使用

`h('section')` 中的字符串始终表示原生元素。渲染组件时应直接把导入的组件定义作为 type：

```ts
import CourseCard from './CourseCard.vue'

h(CourseCard, { courseId: 'render-functions' })
```

只有组件由外部库按名称全局注册、当前模块无法直接导入时，才调用 `resolveComponent('CourseCard')`。
公开 API 要求它位于 `setup()` 或 render 上下文；找不到时会发出运行时警告并返回名称字符串。不能把
`h('CourseCard')` 当成模板编译器的组件解析。

### 6. 事件是 props，组件事件名称保持 `onXxx` 形状

原生点击监听器写作 `onClick`，组件 `update:modelValue` 事件写作字符串 key
`'onUpdate:modelValue'`。处理函数仍由组件自己定义：

```ts
/** 提交当前草稿。 */
function submitDraft() {
  saveDraft()
}

h('button', { type: 'button', onClick: submitDraft }, '保存')
h(EditorField, {
  modelValue: draft.value,
  'onUpdate:modelValue': updateDraft,
})
```

`Once`、`Capture`、`Passive` 可以作为事件名后缀；`prevent`、`stop`、`self` 等行为修饰符使用
`withModifiers()`，不要发明 `onSubmitPrevent`。本课只建立 props 形状，不重复事件处理课程。

### 7. 组件 children 是惰性 slot 函数

向原生元素传递 children 通常使用文本或 VNode 数组；向组件传递 children 则使用一个默认 slot 函数，
或使用 slots 函数对象。slot 函数由子组件调用，使其依赖在子组件更新范围内被追踪：

```ts
h(CoursePanel, { title: 'VNode 身份' }, {
  /** 使用子组件传出的课程名称创建正文。 */
  default: ({ courseName }) => h('p', courseName),
  /** 创建固定操作区。 */
  actions: () => h('button', { type: 'button' }, '开始'),
})
```

把已经创建的 VNode 直接当作组件 slot 值，会失去惰性边界并触发非函数 slot 的开发警告。若第三参数是
slots 对象，第二参数必须显式写 `null` 或真实 props 对象。

### 8. 每个渲染位置需要唯一 VNode，已有 VNode 按不可变值处理

同一个 VNode 对象不能在一棵输出树的两个位置重复使用。需要相同结构时，应为每个位置再次调用 `h()`：

```ts
/** 创建一枚新的提示 VNode。 */
const createHint = () => h('p', '请填写完整信息')

return h('section', [createHint(), createHint()])
```

VNode 创建后视为不可变值，尤其不能直接修改 `vnode.props`。确需在已有 VNode 基础上添加 props 时，
调用 `cloneVNode(vnode, extraProps)`；对象展开不能复制 Vue 的特殊内部属性。`cloneVNode()` 也不是允许
共享一个对象的许可证，每个最终渲染位置仍要得到独立 VNode。

### 9. `key` 只在同一父节点的兄弟 diff 中表达身份

没有 key 时，Vue 会尽可能按位置就地更新相同 type 的节点。若同 type 的有状态子组件发生重排，位置
复用可能让本地输入、焦点或组件实例继续留在旧位置，看起来像“状态换到了另一条业务数据”。稳定 key
让 renderer 按业务身份寻找旧节点并移动已有组件，而不是把位置当身份。

课程统一采用数据中的永久 ID：

```ts
items.value.map((item) =>
  h(StatefulCourseItem, {
    key: item.id,
    item,
  }),
)
```

同一父节点下 key 必须唯一，且不能使用当前数组 index 或每次 render 生成的随机值。`key` 不是单独决定
身份：Vue 3.5.40 的实现同时比较 `type` 与 `key`；任一变化都代表不同节点，会卸载旧实例并挂载新实例。
这个 `type + key` 公式是固定版本源码解释，公开契约仍表述为 key 是 diff 的身份提示。

### 10. 五个辅助 API 各自只解决一个窄问题

| API | 应使用时 | 不负责 |
| --- | --- | --- |
| `cloneVNode()` | 给已有 VNode 合并额外 props，保持 VNode 内部结构完整 | 深拷贝业务对象、复用同一 VNode、保留错误 key |
| `mergeProps()` | 合并多来源 class、style 和同名 `onXxx` listener | 深合并任意业务对象；普通覆盖应使用 object spread |
| `isVNode()` | 在接收 `unknown` 的 VNode 转换边界做类型判断 | 验证 VNode 是否新鲜、未挂载或适合当前父节点 |
| `resolveComponent()` | 按名称解析无法直接 import 的已注册组件 | 把任意字符串变成组件，或代替普通 import |
| `withDirectives()` | 在 render 执行期间给当前 VNode 附加自定义指令 tuple | 代替上一课的指令设计、钩子清理或模板 `v-name` |

本地结构化 API 索引当前只有 `h()`、`resolveComponent()` 和 `withModifiers()` 由现有 Reference 标记为
available；`mergeProps()`、`cloneVNode()`、`isVNode()`、`resolveDirective()`、`withDirectives()` 仍为
planned。本课可以解释这些公开 API 的职责，但本批不改 Reference coverage 状态。

## 可验证学习目标

完成本课后，学习者应能：

1. 先用模板表达普通结构，只在需要 JavaScript 完整编程能力时选择渲染函数。
2. 正确区分 `h()` 的 type、props、元素 children 和组件 slots 三个参数位置。
3. 从 `setup()` 返回 render closure，并在 closure 内读取响应式状态、创建本轮新 VNode。
4. 用导入的组件定义与 `onXxx` props 表达组件和事件，仅在必要时按名称解析组件。
5. 用 slot 函数传递组件 children，解释惰性调用对依赖所有权的意义。
6. 把已有 VNode 当不可变值，区分重新创建、`cloneVNode()`、`mergeProps()` 与 `isVNode()`。
7. 解释同级 diff 中的 `type + key` 身份，并为有状态列表选择唯一、稳定的业务 key。
8. 在重排实验中证明本地输入跟随业务 ID，同时拒绝依赖 VNode 私有字段证明结果。

## 推荐正文编排

1. **先做工具选择**：比较模板与 render function，拒绝为普通界面下沉。
2. **第一枚 VNode**：用 `h()` 创建元素，区分 VNode 描述与真实 DOM。
3. **参数地图**：type / props / children，以及两参数对象为何有歧义。
4. **render closure**：`setup()` 返回函数，每次更新创建新的 VNode 树。
5. **组件与事件**：直接 import 组件，事件使用 `onXxx` props。
6. **slot 函数**：默认 slot、具名 slots、`null` 占位和惰性依赖。
7. **唯一与不可变**：不复用 VNode、不改 props，需要增强时 clone。
8. **身份时间线**：从无 key 的位置复用过渡到稳定业务 key，再解释 `type + key`。
9. **辅助 API 边界**：用一张窄职责表收束 clone、merge、guard、resolve、directive。
10. **固定源码推导**：只解释观察到的 Vue 3.5.40 行为，不暴露私有调用面。
11. **Demo、练习与回顾**：只用公开 DOM 和本地输入状态证明 keyed identity。

## 高质量易错点候选

以下恰好 8 项都包含错误、正确和可观察后果；实施时不要为数量扩写相近条目。

### 1. 用渲染函数重写一个普通静态模板

**错误示例：**

```ts
/** 用嵌套 h() 重写固定卡片。 */
const renderCard = () =>
  h('article', [h('h2', '课程标题'), h('p', '固定摘要'), h('button', '开始')])
```

**正确示例：**

```vue
<article>
  <h2>课程标题</h2>
  <p>固定摘要</p>
  <button type="button">开始</button>
</article>
```

**后果：** 错误写法没有获得额外编程能力，却失去模板的直观结构和编译期上下文。渲染函数不是默认
优化开关；只有节点结构确实由 JavaScript 算法决定时才下沉。

### 2. 从 `setup()` 直接返回一次性 VNode

**错误示例：**

```ts
export default defineComponent({
  /** 错误地返回一次创建的 VNode。 */
  setup() {
    const count = ref(0)
    return h('p', `计数：${count.value}`)
  },
})
```

**正确示例：**

```ts
export default defineComponent({
  /** 返回会随组件更新重复执行的渲染函数。 */
  setup() {
    const count = ref(0)
    /** 创建当前计数对应的新 VNode。 */
    return () => h('p', `计数：${count.value}`)
  },
})
```

**后果：** 错误写法不会安装预期 render closure，响应式变化也无法让该表达式重新执行。正确写法在
每轮 render 中读取依赖并产生新 VNode。

### 3. 把具名 slots 对象放进 `h()` 第二参数

**错误示例：**

```ts
h(CoursePanel, {
  /** 错误地把函数当成名为 default 的 prop。 */
  default: () => h('p', '正文'),
})
```

**正确示例：**

```ts
h(CoursePanel, null, {
  /** 创建默认插槽内容。 */
  default: () => h('p', '正文'),
})
```

**后果：** 两参数中的普通对象被识别为 props，子组件收不到预期 slot。具名 slots 必须放在第三参数，
没有 props 时使用 `null` 明确占位。

### 4. 用字符串组件名调用 `h()`

**错误示例：**

```ts
return () => h('CourseCard', { courseId: 'vnode' })
```

**正确示例：**

```ts
import CourseCard from './CourseCard.vue'

/** 渲染可直接导入的课程组件。 */
const renderCourse = () => h(CourseCard, { courseId: 'vnode' })
```

**后果：** 字符串 type 表示原生元素，错误写法会尝试创建未知的 `<CourseCard>` DOM 元素，组件的
props、emits、本地状态和生命周期都不会按预期运行。只有无法 import 的已注册组件才用
`resolveComponent()`。

### 5. 把已创建 VNode 当作组件 slot 值

**错误示例：**

```ts
const body = h('p', '正文')
return () => h(CoursePanel, null, { default: body })
```

**正确示例：**

```ts
return () =>
  h(CoursePanel, null, {
    /** 每次调用都创建新的默认插槽内容。 */
    default: () => h('p', '正文'),
  })
```

**后果：** 错误写法同时破坏 slot 的函数契约和 VNode 新鲜性，可能出现非函数 slot 警告，并让依赖
错误地归属父组件。slot 必须是函数，函数内部再为本次调用创建 VNode。

### 6. 在两个位置复用同一个 VNode，或直接修改它的 props

**错误示例：**

```ts
const shared = h('p', { class: 'hint' }, '提示')
shared.props!.id = 'changed'
return h('section', [shared, shared])
```

**正确示例：**

```ts
const original = h('p', { class: 'hint' }, '提示')
const changed = cloneVNode(original, { id: 'changed' })

/** 为另一渲染位置创建独立提示。 */
const createHint = () => h('p', { class: 'hint' }, '提示')
return h('section', [changed, createHint()])
```

**后果：** VNode 带有 renderer 使用的特殊状态，既不是可原地修改的普通对象，也不能在同一树中共享。
错误写法违反唯一性和不可变约束；对象展开同样不能替代 `cloneVNode()`。

### 7. 用数组 index 作为会重排的有状态组件 key

**错误示例：**

```ts
items.value.map((item, index) =>
  h(StatefulCourseItem, {
    key: index,
    item,
  }),
)
```

**正确示例：**

```ts
items.value.map((item) =>
  h(StatefulCourseItem, {
    key: item.id,
    item,
  }),
)
```

**后果：** 重排后 index 仍代表位置，Vue 会把旧位置的组件实例更新成另一条 item，本地输入看起来
“跟错了数据”。稳定业务 ID 才能让组件实例和输入状态随对应 item 一起移动。

### 8. 只看 key，不看 type，或每轮制造随机 key

**错误示例：**

```ts
/** 每次渲染都为同一业务对象制造新身份。 */
const renderItem = (item: Course) =>
  h(StatefulCourseItem, {
    key: `${item.id}-${Math.random()}`,
    item,
  })
```

**正确示例：**

```ts
/** 使用同一组件 type 和持久业务 ID 表达稳定身份。 */
const renderItem = (item: Course) =>
  h(StatefulCourseItem, {
    key: item.id,
    item,
  })
```

**后果：** 随机 key 每轮都变化，会让旧组件卸载、新组件挂载，本地输入和焦点持续丢失；即使 key
相同，换成另一个组件 type 也代表新身份。身份必须在同一父节点内同时保持 type 与 key 稳定。

## Vue 3.5.40 源码推导

本节只解释“为什么固定版本呈现这些行为”。课程实现不得导入 `createVNode()` 私有优化参数、
`isSameVNodeType()`、`cloneIfMounted()`、renderer diff helper 或读取内部 VNode 标记。

### 1. `h()` 是手写 render 的参数归一化外壳

`h.ts` 明确说明 `h()` 面向手写 render，而编译器直接调用单态的 `createVNode()` 并传入 patch flags。
实际实现按参数个数分支：两参数普通对象视作 props、单 VNode 视作 child 并包成数组、其他值视作省略
props 的 children；三参数单 VNode 同样包成数组。

这直接推出两个公开用法：具名 slots 对象不能占第二参数；一个 VNode child 虽可简写，最终仍进入
children 数组。课程只教公开 `h()`，不模仿编译器调用。

来源：[`h.ts#L25-L29`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/h.ts#L25-L29)、
[`h.ts#L198-L226`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/h.ts#L198-L226)、
[`h.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/h.spec.ts)。

### 2. VNode type 先被分类，响应式组件定义还会被去代理

`createVNode()` 在 Vue 3.5.40 中把字符串、Suspense、Teleport、对象和函数编码为不同 shape flag；
开发环境若发现 stateful component type 是 reactive proxy，会转回 raw type 并警告额外开销。

这解释了为什么字符串不会自动变成已注册组件，也解释了组件 type 本身必须稳定。shape flag 是 renderer
内部位图，课程只能从公开 type 输入推导结果，不能读取它做业务分支。

来源：[`vnode.ts#L597-L631`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/vnode.ts#L597-L631)。

### 3. 固定版本用 `type + key` 判断是否为同一 VNode 身份

`isVNode()` 只检查内部 `__v_isVNode` 标记；`isSameVNodeType()` 在排除 HMR 特例后返回
`n1.type === n2.type && n1.key === n2.key`。renderer 的顶层 patch 若发现结果为 false，会先卸载旧树再把
新节点当作 mount。

因此 `isVNode()` 不能证明对象可复用，而 `key` 也不是唯一身份维度。同 type + 同 key 才可能复用；
任一变化都进入替换边界。HMR 分支和内部标记不进入公共课程代码。

来源：[`vnode.ts#L375-L393`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/vnode.ts#L375-L393)、
[`renderer.ts#L390-L399`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/renderer.ts#L390-L399)。

### 4. keyed diff 先建 `key -> 新位置` 映射，再复用或移动旧节点

未知序列分支先为新 children 建立 `keyToNewIndexMap`，重复 key 在开发环境发出警告。旧 child 有 key
时直接查新位置；没有 key 时只能寻找尚未匹配且 type 相同的节点。匹配后记录新旧索引关系，最后仅移动
不在最长稳定子序列中的节点，并挂载真正的新节点。

这说明稳定 key 的价值不是强制重建，而是让 renderer 找回同一业务 child 并移动其已有组件实例。
Demo 只观察输入状态和 DOM 顺序，不断言 key map、移动次数或最长递增子序列。

来源：[`renderer.ts#L1804-L2044`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/renderer.ts#L1804-L2044)、
[`rendererChildren.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/rendererChildren.spec.ts)。

### 5. children 归一化把组件函数 children 变成默认 slot

`normalizeChildren()` 根据父 VNode shape 区分元素 children 和组件 slots。函数 children 用于组件时会
变为带当前 render context 的 `{ default: children }` 并设置 slots children 标记；对象 slots 也会关联
当前 render context。元素收到 slot 对象则只取 default 结果再归一化为普通 children。

这解释了组件 slot 为什么是函数，以及为什么惰性依赖需要正确 render context。`_ctx`、slot flag 和
shape flag 都是固定版本内部数据，正文只教授函数契约。

来源：[`vnode.ts#L805-L862`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/vnode.ts#L805-L862)。

### 6. `cloneVNode()` 不只是对象展开，已挂载 VNode 还会被保护性克隆

`cloneVNode()` 显式复制 VNode 的内部字段，用 `mergeProps()` 合并额外 props，重新归一化 key，并在
额外 props 使原 patch flag 不再可靠时加入 full-props 标记。children 标准化遇到已有 VNode 时调用
`cloneIfMounted()`，已挂载节点在特定路径会被克隆。

这类保护不能成为主动复用 VNode 的理由：公开指南仍要求同一树内 VNode 唯一，并把 VNode 视为不可变。
业务代码需要不同 props 时调用公开 `cloneVNode()`；需要两个位置时创建两枚 VNode。

来源：[`vnode.ts#L641-L732`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/vnode.ts#L641-L732)、
[`vnode.ts#L775-L803`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/vnode.ts#L775-L803)、
[`vnode.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/vnode.spec.ts)。

### 7. `mergeProps()` 只对 class、style 和事件执行特殊合并

固定实现逐个遍历输入：class 通过 `normalizeClass()` 合并，style 通过 `normalizeStyle()` 合并，`onXxx`
监听器在引用不重复时组合成数组，其他非空 key 由后值覆盖。这与公开 API 列出的三类特殊 prop 一致。

所以 `mergeProps()` 适合合并组件默认 props、调用者 attrs 和内部 listener，却不是通用深合并。明确要
覆盖时继续使用 object spread；需要同时保留多个 listener 时才使用 helper。

来源：[`vnode.ts#L864-L900`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/vnode.ts#L864-L900)、
[`vnode.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/vnode.spec.ts)。

### 8. 名称解析和手工指令都依赖正确的组件 render 上下文

`resolveComponent()` 通过当前 rendering instance 或 setup instance 查找显式自身名称、局部注册表和
app 全局注册表，并兼容原名、camelized 与 PascalCase；未命中时警告并最终回退名称字符串。
`withDirectives()` 更严格要求 `currentRenderingInstance`，随后才把 directive tuple 转为 binding 附到
当前 VNode。

这说明能 import 时应直接传组件定义；必须解析时只能在 setup / render 上下文调用。`withDirectives()`
应在返回的 render closure 内包住本轮新 VNode，不能在模块顶层或 setup 的一次性初始化阶段提前调用。

来源：[`resolveAssets.ts#L22-L27`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/resolveAssets.ts#L22-L27)、
[`resolveAssets.ts#L77-L140`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/resolveAssets.ts#L77-L140)、
[`directives.ts#L124-L168`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/directives.ts#L124-L168)。

## 唯一 Demo 待实现规格

### 唯一公开 Demo

| 字段 | 冻结值 |
| --- | --- |
| Demo ID | `vue.core.learn.advanced.render-functions-vnodes.vnode-identity-lab-demo` |
| 文件 | `src/content/demos/vue/core/learn/advanced/render-functions-vnodes/vnode-identity-lab-demo.vue` |
| 根 class | `.vnode-identity-lab-demo` |
| 父列表 | 一个 render function，用 `h()` 创建有稳定 key 的三个子组件 |
| 子组件 | 同一 SFC 内局部 `StatefulCourseItem`，每项拥有自己的 `ref('')` 输入状态 |
| 主命题 | 列表反转后，输入值和组件实例状态继续跟随业务 ID，而不是原 DOM 位置 |

Demo 初始数据冻结为三个永久 ID：

```ts
const items = ref([
  { id: 'reactivity', label: '响应式基础' },
  { id: 'components', label: '组件通信' },
  { id: 'rendering', label: '渲染函数' },
])
```

父列表的唯一关键实现形状冻结为：

```ts
const StatefulList = defineComponent({
  props: { items: { type: Array as PropType<CourseItem[]>, required: true } },
  /** 为当前顺序创建带稳定业务 key 的子组件列表。 */
  setup(props) {
    /** 为本轮 items 创建新的列表 VNode。 */
    return () =>
      h(
        'ol',
        { 'data-testid': 'vnode-order' },
        props.items.map((item) =>
          h(StatefulCourseItem, {
            key: item.id,
            item,
          }),
        ),
      )
  },
})
```

`StatefulCourseItem` 在自己的 `setup()` 内建立 `const note = ref('')`，输入框通过 `value` 与 `onInput`
留在子组件本地；不得把 note 提升到父列表、Pinia、module-level Map 或 localStorage，否则 Demo 无法证明
组件身份。课程不提供 index-key 故障模式切换，反例留在正文，唯一实验只证明正确契约。

### 固定初始状态

- 初始顺序严格为 `reactivity -> components -> rendering`。
- 三个本地输入初始都为空，不自动聚焦，不使用随机值、时间戳或网络数据。
- 当前顺序以公开文本和 `data-item-id` 同时可观察。
- 汇总初始显示“尚未重排”；反转次数为 `0`。
- 恰好一个“反转顺序”按钮，不增加删除、插入、随机排序或 key 模式选择。

### 固定交互

1. 学习者在 `components` 项的本地输入写入“只属于组件通信”。
2. 用键盘聚焦“反转顺序”，按 Enter 后顺序变为
   `rendering -> components -> reactivity`。
3. `components` 项移动到新位置后，输入仍为“只属于组件通信”；另外两项仍为空。
4. 汇总更新为“重排 1 次，components 的本地状态仍归属 components”。
5. 再次按 Enter 恢复初始顺序，`components` 输入仍保持原值，反转次数变为 `2`。

这条路径只证明稳定 key 下的公开结果。不得读取组件 uid、VNode key、`el`、内部实例、patch flag 或
DOM 节点移动次数；也不得通过父级数据重新填回输入制造“状态保留”。

### 稳定公开契约

- Demo 根：`.vnode-identity-lab-demo`。
- 列表：`data-testid="vnode-order"`。
- 每个子组件根：`data-testid="stateful-item"` 和唯一 `data-item-id`。
- 每个本地输入：`data-testid="local-note-input"`，可通过所属 `stateful-item` 精确定位。
- 反转命令：`data-testid="reverse-order"`。
- 汇总：`data-testid="identity-summary"`，使用 `role="status"` 和 `aria-live="polite"`。
- 当前顺序文本：`data-testid="current-order"`。
- 不把 key 文本渲染为调试 UI，不公开内部 VNode JSON。

### 实现约束

- 恰好一个公开 Demo ID；父列表与有状态子组件都定义在同一 SFC，不新增 `parts/` 或通用 helper。
- 所有新增方法定义上方写规范、简洁的中文注释。
- 父列表必须在 render closure 中调用 `h(StatefulCourseItem, { key: item.id, item })`。
- 子组件本地 note 只能由子组件 `ref()` 拥有；父级只拥有 item 顺序和反转次数。
- 输入使用真实 `<label>` 或可访问名称；按钮使用原生 `button type="button"`。
- 不读取 VNode 私有字段，不使用 `getCurrentInstance()`、DOM 手工搬移、强制 remount 或缓存 Map。
- 不访问网络、localStorage、timer、随机值、日期或第三方库。
- 样式只使用 flex、margin 和 padding，不使用 CSS `grid`、`gap`、`row-gap` 或 `column-gap`。
- 根、列表项和控件有稳定响应式尺寸；390px 与 200% 文本下可换行，无截断、重叠或横向滚动。
- 按钮和输入双轴至少 44px，键盘焦点样式清晰，文本不得遮挡相邻控件。
- Demo 不需要动画，不添加 transition、animation 或 transform；reduced motion 下行为保持一致。

### 最小 E2E 契约

使用一条长路径测试，不拆成多个相似用例：

1. 从上一课“自定义指令”点击“下一篇：渲染函数与虚拟节点”，确认 URL、标题、上一篇链接，且目标课
   没有下一篇，因为 `plugins` 仍为 planned。
2. 断言页面恰好一个 `.vnode-identity-lab-demo`、唯一 Demo 已解析且没有 `.demo-box .missing`。
3. 断言初始三个 `data-item-id` 顺序；填写 `components` 项输入，确认另外两个输入为空。
4. 用键盘 Tab 到“反转顺序”并按 Enter，断言反转后的 ID 顺序、汇总、反转次数和三个输入值。
5. 再按 Enter 恢复顺序，重新断言 `components` 输入值没有丢失或转移。
6. 在 390 x 844 viewport 下检查所有按钮和输入双轴至少 44px、焦点可见、页面无横向滚动。
7. 重新加载后把 Demo 的标题、文本、label、input、button 和 status 放大到 200%，复跑完整交互；检查
   文本与控件无截断，顶层区段和三个列表项互不重叠。
8. `page.emulateMedia({ reducedMotion: 'reduce' })` 后再次复跑主交互；断言 Demo 没有主动 transition、
   animation 或 transform，同时 state identity 结果不变。
9. 全程收集 console error、console warning 与 pageerror，最终均为空；所有等待使用 locator 状态，
   不使用固定 `waitForTimeout()`。

相邻测试同步冻结为：现有 `tests/e2e/custom-directives.spec.ts` 只把目标课从“无下一篇”改成可见的
“下一篇：渲染函数与虚拟节点”；不得顺手重写上一课完整 E2E。

## 已冻结 metadata

```ts
export const meta = defineLessonMeta({
  id: 'vue.core.learn.advanced.render-functions-vnodes',
  type: 'lesson',
  title: '渲染函数与虚拟节点',
  summary: '在模板不再清晰时用 h() 创建唯一 VNode，并用稳定 type 与 key 保住组件身份',
  ecosystem: 'vue',
  module: 'core',
  collection: 'advanced',
  level: 'advanced',
  prerequisites: ['vue.core.learn.advanced.custom-directives'],
  related: [
    'vue.core.learn.advanced.custom-directives',
    'vue.core.learn.basics.conditional-list-rendering',
    'vue.core.learn.intermediate.slots',
    'vue.core.reference.advanced.render-function',
  ],
  tags: [
    '渲染函数',
    'h',
    'VNode',
    'key',
    '组件身份',
    'slot 函数',
    'cloneVNode',
    'mergeProps',
  ],
  sources: [
    {
      title: 'Vue 中文渲染函数与 JSX 指南',
      url: 'https://cn.vuejs.org/guide/extras/render-function.html',
    },
    {
      title: 'Vue 中文渲染函数 API',
      url: 'https://cn.vuejs.org/api/render-function.html',
    },
    {
      title: 'Vue 内置特殊 Attributes：key',
      url: 'https://cn.vuejs.org/api/built-in-special-attributes.html#key',
    },
    {
      title: 'Vue setup 与渲染函数',
      url: 'https://cn.vuejs.org/api/composition-api-setup.html#usage-with-render-functions',
    },
    {
      title: 'Vue 渲染函数官方 Markdown',
      url: 'https://github.com/vuejs/docs/blob/main/src/guide/extras/render-function.md',
    },
    {
      title: 'Vue 3.5.40 h.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/h.ts',
    },
    {
      title: 'Vue 3.5.40 vnode.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/vnode.ts',
    },
    {
      title: 'Vue 3.5.40 renderer.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/renderer.ts',
    },
    {
      title: 'Vue 3.5.40 resolveAssets.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/resolveAssets.ts',
    },
    {
      title: 'Vue 3.5.40 directives.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/directives.ts',
    },
    {
      title: 'Vue 3.5.40 h 官方测试',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/h.spec.ts',
    },
    {
      title: 'Vue 3.5.40 VNode 官方测试',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/vnode.spec.ts',
    },
    {
      title: 'Vue 3.5.40 keyed children 官方测试',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/rendererChildren.spec.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-08-01',
  estimatedMinutes: 65,
})
```

上述 ID、唯一 prerequisite、related 顺序、summary、tags、唯一 Demo ID、65 分钟、恰好 8 个易错点
和 8 个源码推导均为本批冻结值。实现不得增加第二个公开 Demo，也不得提前进入插件课程。

## 正文块与练习冻结

课程正文应包含 8 个 objectives、恰好 8 个 pitfalls、一个 8 项 steps 源码推导、唯一 Demo、两个块内
exercise、一个课后 exercises 条目和 8 条 recap。顶层 block 总数不机械复制上一课，但必须按“推荐正文
编排”的 11 段顺序完整覆盖，不得为缩短篇幅删除身份、唯一性或辅助 API 边界。

块内练习冻结为：

1. **把 schema renderer 限制在最小边界**：给定只允许 `heading / paragraph / action` 的数据结构，
   使用直接导入的组件、`h()`、事件 props 和稳定业务 key 写出最小 render closure；答案必须拒绝任意
   HTML、动态 import 和 VNode 私有字段。
2. **诊断重排后的输入错位**：给定同 type 子组件使用 index key 的代码，解释为什么反转后本地输入
   留在位置，并改成永久业务 ID；答案必须同时指出随机 key 会导致 remount。

课后 exercises 条目冻结为：“选择一个模板确实难以表达的程序化结构，写出 type、props、children、
slot、事件和 key 的来源，并标记每轮 render 中哪些 VNode 必须重新创建。”

recap 固定覆盖：模板优先、VNode 描述、`h()` 参数、render closure、组件与事件、slot 函数、VNode
唯一 / 不可变、`type + key` 身份，共 8 条。

## 导航与目录冻结

- `vue.core.learn.advanced.custom-directives.next` 上线后指向本课。
- 本课 `previous` 指向 `vue.core.learn.advanced.custom-directives`。
- 本课 `next` 为 `undefined`；planned 的 `vue.core.learn.advanced.plugins` 不进入可点击邻接。
- manifest 只把本课从 planned descriptor 改为 available entry，不改变 topic 顺序或 plugins 状态。
- Vue Core 上线后精确为 `25 available / 6 planned`；Vue Router 仍为 `0 / 15`，Pinia 仍为
  `0 / 14`，三条 Vue 学习路线合计 `25 available / 35 planned`，总规划数保持 60。
- 上一批研究文档中的 `24 / 36` 是其历史完成态，不回写或改写。

## 本批最小实施范围

新增：

- `docs/research/vue-render-functions-vnodes.md`
- `src/content/entries/learn/vue/core/advanced/render-functions-vnodes.ts`
- `src/content/demos/vue/core/learn/advanced/render-functions-vnodes/vnode-identity-lab-demo.vue`
- `tests/e2e/render-functions-vnodes.spec.ts`

修改：

- `src/content/catalog/manifests/vue-core-track.ts`
- `src/content/catalog/vue-core-track.spec.ts`
- `src/content/interactive/registry.spec.ts`
- `tests/e2e/custom-directives.spec.ts`
- `docs/重构实施计划.md`

除此之外不修改任何正式文件。`src/content/interactive/registry.ts` 的固定六层 glob 已能公开目标 Demo，
不得为本课修改 registry 实现或新增更深目录。

## 明确停止边界

- 本批只修改上方“本批最小实施范围”列出的文件，不扩展到 Reference、Reference Demo、router、schema、
  registry 实现、全局样式或 `main.ts`。
- 本批只发布一课、一个公开 Demo 和一条最小 E2E；达到 `25 / 35` 后立即停止。
- `vue.core.learn.advanced.plugins` 继续 planned，不创建插件研究、正文、Demo 或测试。
- 不启动新的开发服务器、不主动打开页面、不提交代码。
- 不把客户端 keyed Demo 外推为 SSR / hydration、Teleport、Suspense 或 Transition 的身份保证。
- 不把 Vue 3.5.40 的内部 VNode 标记、shape flag、key map、LIS 或隐式 clone 写成稳定公共 API。
- 不用 current-browser smoke 替代冻结的 390px、200% 文本、键盘、44px、reduced-motion 和错误收集 E2E。

## 自检结论

1. 技术来源只来自 Vue 官方文档、`vuejs/docs`、`vuejs/core@v3.5.40` 固定源码和官方测试。
2. 课程主线清楚区分模板选择、`h()` 公开参数、VNode 唯一性和 `type + key` 固定实现解释。
3. 恰好 8 个易错点均包含错误示例、正确示例和可观察后果，没有相近条目凑数。
4. 8 个源码推导均有固定标签来源，并明确内部事实不得进入业务调用面。
5. 唯一 Demo 只用稳定 key 重排有本地输入状态的子组件，不用父状态伪造保留结果。
6. E2E 冻结键盘、390px、200% 文本、44px、无溢出、reduced motion、console 和 pageerror 证据。
7. metadata、唯一 prerequisite、related 顺序、邻接和 `25 available / 35 planned` 状态一致。
8. 精确实施文件范围和停止边界已经列明，Reference、plugins 与其他系统保持不变。
