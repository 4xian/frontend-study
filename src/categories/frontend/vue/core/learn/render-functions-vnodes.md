---
id: vue.core.learn.advanced.render-functions-vnodes
type: lesson
title: 渲染函数与虚拟节点
summary: 在模板不再清晰时用 h() 创建唯一 VNode，并用稳定 type 与 key 保住组件身份
domain: frontend
technology: vue
module: core
related:
  - vue.core.learn.advanced.custom-directives
  - vue.core.learn.basics.conditional-list-rendering
  - vue.core.learn.intermediate.slots
  - vue.core.reference.advanced.render-function
tags:
  - 渲染函数
  - h
  - VNode
  - key
  - 组件身份
  - slot 函数
  - cloneVNode
  - mergeProps
appliesTo: Vue 3.5.40
verifiedAt: 2026-08-01
sources:
  - title: Vue 中文渲染函数与 JSX 指南
    url: https://cn.vuejs.org/guide/extras/render-function.html
  - title: Vue 中文渲染函数 API
    url: https://cn.vuejs.org/api/render-function.html
  - title: Vue 内置特殊 Attributes：key
    url: https://cn.vuejs.org/api/built-in-special-attributes.html#key
  - title: Vue setup 与渲染函数
    url: https://cn.vuejs.org/api/composition-api-setup.html#usage-with-render-functions
  - title: Vue 渲染函数官方 Markdown
    url: https://github.com/vuejs/docs/blob/main/src/guide/extras/render-function.md
  - title: Vue 3.5.40 h.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/h.ts
  - title: Vue 3.5.40 vnode.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/vnode.ts
  - title: Vue 3.5.40 renderer.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/renderer.ts
  - title: Vue 3.5.40 resolveAssets.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/resolveAssets.ts
  - title: Vue 3.5.40 directives.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/directives.ts
  - title: Vue 3.5.40 h 官方测试
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/h.spec.ts
  - title: Vue 3.5.40 VNode 官方测试
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/vnode.spec.ts
  - title: Vue 3.5.40 keyed children 官方测试
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/rendererChildren.spec.ts
stage: advanced
level: advanced
estimatedMinutes: 65
prerequisites:
  - vue.core.learn.advanced.custom-directives
objectives:
  - 判断模板、组件与渲染函数各自适用的结构复杂度
  - 从 setup() 返回渲染函数，并让响应式依赖在每轮 render 中读取
  - 正确区分 h() 的 type、props 与 children 参数
  - 用组件定义、slot 函数和事件 props 表达组件树
  - 解释 VNode 是一次渲染输出，而不是可复用的组件定义
  - 用稳定业务 key 保持动态同级节点及其局部状态身份
  - 在扩展 VNode 时正确选择 mergeProps()、cloneVNode() 和 isVNode()
  - 根据固定版本源码判断参数归一化、节点身份和 keyed diff 的适用边界
recap:
  - 模板是普通界面的默认选择，渲染函数只用于模板不再清晰的程序化结构
  - VNode 是本轮渲染的节点描述，不是真实 DOM 或可复用组件定义
  - h() 的 type、props 与 children 各有明确位置，具名 slots 需要第三参数
  - setup() 返回 render closure，并在每轮执行中读取响应式状态、创建新 VNode
  - 组件 type 优先使用直接导入的定义，事件通过 onXxx props 传递
  - 组件 children 使用惰性 slot 函数，让子组件拥有正确的依赖追踪边界
  - 每个渲染位置都需要唯一 VNode，已有 VNode 不直接修改而用 cloneVNode()
  - 同级身份由稳定的 type 与业务 key 共同表达，重排时本地状态随业务 ID 移动
---

# 渲染函数与虚拟节点

## 正文大纲

上一课通过自定义指令进入 DOM 生命周期，本课转向 Vue 的渲染输出。学习重点不是把模板逐行翻译成 h()，而是先判断何时确实需要 JavaScript 控制结构，再把每轮输出、组件插槽和节点身份表达准确。最后用 keyed 子组件重排验证：VNode 位置会改变，业务状态不应跟着位置错位。

## 模板优先，渲染函数是下沉边界

| 需求 | 首选能力 | 判断依据 |
| --- | --- | --- |
| 静态结构与常见条件、列表 | 模板 | 声明式结构清楚，并可由编译器分析 |
| 复用完整界面与行为 | 组件 | 先建立清晰的 props、emits 与 slots 契约 |
| 递归生成未知层级结构 | 渲染函数 | JavaScript 控制流比模板分支更直接 |
| 包装或扩展调用方 VNode | 渲染函数 | 需要判断、克隆或合并 VNode props |
| 为新平台实现渲染器 | 自定义 renderer | 属于独立底层主题，不是本课范围 |

:::warning
渲染函数不是模板的性能捷径。模板可获得静态提升和 patch flag 等编译优化；当模板仍然易读时，手写 h() 只会增加 type、children、事件和 slot 协议的维护成本。
:::

## 第一枚 VNode 是描述，不是真实 DOM

h() 返回的是当前界面的 VNode 描述，renderer 再据此创建或更新真实 DOM。type 表达节点种类，props 表达属性和事件，children 表达子内容；不要读取 VNode 私有字段来判断页面结果。

~~~~ts
const article = h('article', { class: 'lesson-card' }, [
  h('h3', '渲染函数'),
  h('p', 'VNode 先描述界面，稍后才由 renderer 更新 DOM。'),
])
~~~~

## h() 的三个位置承担不同协议

| 参数 | 可表达内容 | 关键边界 |
| --- | --- | --- |
| type | 元素字符串、组件定义、Vue 内置类型 | 字符串始终按原生元素解释 |
| props | attribute、DOM property、组件 props、事件、key、ref | 没有 props 时可传 null |
| children | 文本、VNode、VNode 数组、组件 slot 函数对象 | 组件 slot 应保持函数形式 |

两参数调用存在明确歧义规则：普通对象位于第二参数时按 props 解释，单个 VNode 才按 child 解释。需要传组件 slots 对象时，应保留第三参数位置。

## setup 返回 render closure

setup() 通常只执行一次。Vue 只有在它返回函数时，才把该函数安装为组件 render。响应式值应在 render 执行期间读取：依赖变化后 Vue 会再次调用 render，并为本轮界面创建新的 VNode 树。

~~~~ts
import { defineComponent, h, ref } from 'vue'

export default defineComponent({
  /** 建立状态并返回每轮更新都会执行的渲染函数。 */
  setup() {
    const count = ref(0)

    /** 增加渲染函数读取的响应式计数。 */
    function increment(): void {
      count.value += 1
    }

    /** 创建本轮按钮 VNode。 */
    function renderCounter() {
      return h('button', { onClick: increment }, `计数 ${count.value}`)
    }

    return renderCounter
  },
})
~~~~

:::tip
渲染函数必须保持可重复执行。不要在 render 中发请求、启动 timer 或修改它正在读取的状态；副作用仍应放在事件、watch 或生命周期中。
:::

## 组件 type 与事件 props 都要显式表达

渲染已导入组件时直接把组件定义传给 h()。只有必须依赖注册名时，才在 setup 或 render 上下文使用 resolveComponent()。事件通过 onXxx prop 传递；once、capture、passive 可作为事件选项后缀，prevent、stop、self 与按键行为则通过 withModifiers() 或 withKeys() 包装。

~~~~ts
import LessonCard from './LessonCard.vue'
import { h, withModifiers } from 'vue'

/** 保存当前课程并阻止表单原生提交。 */
function saveLesson(): void {
  save(activeLesson.value)
}

h(LessonCard, { lesson: activeLesson.value })
h('form', { onSubmit: withModifiers(saveLesson, ['prevent']) }, children)
h('button', { onClickOnceCapture: saveLesson }, '只保存一次')
~~~~

## 组件 children 使用惰性 slot 函数

默认 slot 可以直接传函数，具名 slots 对象位于第三参数，因此没有组件 props 时也要用 null 占住第二参数。slot 值保持函数，让子组件决定何时求值，并让内容中的响应式依赖归属正确的渲染上下文。

~~~~ts
/** 创建默认插槽内容。 */
const defaultSlot = () => h('p', '课程正文')

/** 创建操作插槽内容。 */
const actionsSlot = () => h('button', { onClick: saveLesson }, '保存')

h(LessonPanel, defaultSlot)
h(LessonPanel, null, {
  default: defaultSlot,
  actions: actionsSlot,
})
~~~~

## 每个位置都要创建唯一 VNode

VNode 是一次渲染输出，不是组件定义或可重复使用的静态描述。它会在 patch 中关联真实元素、组件实例和内部标记。相同界面片段应通过工厂为每个位置创建新 VNode；不要在一棵树的多个位置复用同一对象，也不要跨 render 缓存动态 VNode。

~~~~ts
/** 为一个渲染位置创建新的徽标 VNode。 */
function createBadge() {
  return h('span', { class: 'badge' }, '高级')
}

return () => h('div', [createBadge(), createBadge()])
~~~~

## type 与 key 共同表达同级节点身份

Vue 3.5.40 只有在 type 与 key 都相等时，才把前后两枚 VNode 视作可以继续 patch 的同一节点。key 因此不只是消除列表警告：当子组件持有输入、焦点或生命周期状态时，稳定业务 key 告诉 renderer 应移动哪个实例，而不是让旧实例按新位置错配。

| key 来源 | 表达的身份 | 动态重排结果 |
| --- | --- | --- |
| item.id | 稳定业务记录 | 组件实例和本地状态跟随记录移动 |
| 数组索引 | 当前列表位置 | 重排后状态可能留在旧位置 |
| 随机值或每轮新对象 | 每轮全新身份 | 节点被卸载并重新创建 |
| 同级重复值 | 身份冲突 | diff 无法可靠匹配并产生警告 |

:::warning
key 只需在同一组 siblings 中唯一，但必须稳定。不要为了“强制刷新”给整个动态区域设置随机 key；真正需要重置状态时，应在明确边界上有意更换一个可解释的 key。
:::

## VNode 辅助函数各自只解决一个边界

| API | 适用场景 | 不能替代 |
| --- | --- | --- |
| isVNode() | 判断外部输入是否已经是 VNode | 不验证业务合法性或唯一性 |
| cloneVNode() | 克隆已有 VNode 并附加 props | 不是任意对象深拷贝 |
| mergeProps() | 合并 class、style 和同名 onXxx listener | 不合并 children 或 slots |
| resolveComponent() | 按注册名解析组件 | 已导入组件不需要解析 |
| withDirectives() | 在 render 中给 VNode 附加已解析指令 | 不替代指令生命周期与清理 |

~~~~ts
/** 给调用方传入的 VNode 增加 wrapper 属性。 */
function decorateChild(child: unknown) {
  if (!isVNode(child)) return child

  return cloneVNode(child, {
    class: 'selected',
    onClick: selectChild,
  })
}
~~~~

:::tip
cloneVNode() 会保留并重新计算 VNode 专用字段，附加 props 也有专门合并语义。仍需显式审查 key 与 ref：克隆不是任意改写身份或重复挂载同一 ref 的捷径。
:::

## 易错使用提示

:::pitfalls
### 用渲染函数重写一个普通静态模板

**触发条件：** 用渲染函数重写一个普通静态模板

**原因：** 固定结构已能由模板直接表达，嵌套 h() 没有带来额外编程能力。

**后果：** 失去模板的直观结构和编译期上下文，却没有获得实际收益。

**错误示例：**

~~~~ts
/** 用嵌套 h() 重写固定卡片。 */
const renderCard = () =>
  h('article', [h('h2', '课程标题'), h('p', '固定摘要'), h('button', '开始')])
~~~~

**正确写法：**

~~~~vue
<article>
  <h2>课程标题</h2>
  <p>固定摘要</p>
  <button type="button">开始</button>
</article>
~~~~

**验证方式：** 对照正确写法验证结果。

### 从 setup() 直接返回一次性 VNode

**触发条件：** 从 setup() 直接返回一次性 VNode

**原因：** setup 返回函数才会安装为 render；VNode 对象只是一轮已经创建的输出。

**后果：** 组件缺少正确 render，状态变化也不会重新执行那次 h()。

**错误示例：**

~~~~ts
export default defineComponent({
  /** 错误地返回一次创建的 VNode。 */
  setup() {
    const count = ref(0)
    return h('p', String(count.value))
  },
})
~~~~

**正确写法：**

~~~~ts
export default defineComponent({
  /** 返回会随组件更新重复执行的渲染函数。 */
  setup() {
    const count = ref(0)

    /** 创建当前计数对应的新 VNode。 */
    const renderCount = () => h('p', String(count.value))
    return renderCount
  },
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 把具名 slots 对象放进 h() 第二参数

**触发条件：** 把具名 slots 对象放进 h() 第二参数

**原因：** 两参数中的普通对象会按 props 解释，而不是按组件 slots 解释。

**后果：** 子组件收不到预期 slot，default 函数反而成为同名 prop。

**错误示例：**

~~~~ts
h(CoursePanel, {
  /** 错误地把函数当成名为 default 的 prop。 */
  default: () => h('p', '正文'),
})
~~~~

**正确写法：**

~~~~ts
h(CoursePanel, null, {
  /** 创建默认插槽内容。 */
  default: () => h('p', '正文'),
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 用字符串组件名调用 h()

**触发条件：** 用字符串组件名调用 h()

**原因：** 字符串 type 表示原生元素，不会自动解析局部或全局组件。

**后果：** 页面创建未知 DOM 元素，组件 props、emits 和生命周期均不执行。

**错误示例：**

~~~~ts
/** 错误地把组件名字符串当成组件定义。 */
const renderCourse = () => h('CourseCard', { courseId: 'vnode' })
~~~~

**正确写法：**

~~~~ts
import CourseCard from './CourseCard.vue'

/** 渲染可直接导入的课程组件。 */
const renderCourse = () => h(CourseCard, { courseId: 'vnode' })
~~~~

**验证方式：** 对照正确写法验证结果。

### 把已创建 VNode 当作组件 slot 值

**触发条件：** 把已创建 VNode 当作组件 slot 值

**原因：** 组件 slot 值必须保持函数形式，并在函数调用时创建本轮 VNode。

**后果：** 破坏 slot 函数契约和 VNode 新鲜性，并可能触发非函数 slot 警告。

**错误示例：**

~~~~ts
const body = h('p', '正文')

/** 错误地把现成 VNode 作为 slot 值。 */
const renderPanel = () => h(CoursePanel, null, { default: body })
~~~~

**正确写法：**

~~~~ts
/** 通过 slot 函数为每次调用创建新 VNode。 */
const renderPanel = () =>
  h(CoursePanel, null, {
    /** 每次调用都创建新的默认插槽内容。 */
    default: () => h('p', '正文'),
  })
~~~~

**验证方式：** 对照正确写法验证结果。

### 在两个位置复用同一个 VNode，或直接修改它的 props

**触发条件：** 在两个位置复用同一个 VNode，或直接修改它的 props

**原因：** VNode 属于一个渲染位置，并且创建后应按不可变值处理。

**后果：** 共享 patch 状态或污染原 VNode，让渲染结果依赖内部克隆保护。

**错误示例：**

~~~~ts
const shared = h('p', { class: 'hint' }, '提示')
shared.props!.id = 'changed'
return h('section', [shared, shared])
~~~~

**正确写法：**

~~~~ts
const original = h('p', { class: 'hint' }, '提示')
const changed = cloneVNode(original, { id: 'changed' })

/** 为另一渲染位置创建独立提示。 */
const createHint = () => h('p', { class: 'hint' }, '提示')
return h('section', [changed, createHint()])
~~~~

**验证方式：** 对照正确写法验证结果。

### 用数组 index 作为会重排的有状态组件 key

**触发条件：** 用数组 index 作为会重排的有状态组件 key

**原因：** index 表达当前位置，不是列表项稳定的业务身份。

**后果：** 反转后旧位置的组件实例更新成另一条 item，本地输入跟错数据。

**错误示例：**

~~~~ts
items.value.map((item, index) =>
  h(StatefulCourseItem, {
    key: index,
    item,
  }),
)
~~~~

**正确写法：**

~~~~ts
items.value.map((item) =>
  h(StatefulCourseItem, {
    key: item.id,
    item,
  }),
)
~~~~

**验证方式：** 对照正确写法验证结果。

### 只看 key，不看 type，或每轮制造随机 key

**触发条件：** 只看 key，不看 type，或每轮制造随机 key

**原因：** VNode 身份同时依赖 type 与 key，key 本身还必须跨 render 稳定。

**后果：** 随机 key 会持续重挂载；同 key 换 type 仍会替换组件并丢失本地状态。

**错误示例：**

~~~~ts
/** 每次渲染都为同一业务对象制造新身份。 */
const renderItem = (item: Course) =>
  h(StatefulCourseItem, {
    key: item.id + Math.random(),
    item,
  })
~~~~

**正确写法：**

~~~~ts
/** 使用同一组件 type 和持久业务 ID 表达稳定身份。 */
const renderItem = (item: Course) =>
  h(StatefulCourseItem, {
    key: item.id,
    item,
  })
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 从 Vue 3.5.40 源码推导适用场景

:::steps
### h() 只归一化参数

h.ts 按参数数量区分 props、children 与单个 VNode，最后委托 createVNode()。因此 slot 对象的位置是调用协议，不是 renderer 猜测。

### type 先决定基础 shape flag

vnode.ts 按字符串、Suspense、Teleport、对象或函数设置元素和组件等标记；组件名字符串不会进入组件分支。

### type 与 key 一起判断同一节点

isSameVNodeType() 同时比较 type 与 key。任一变化都会让旧 VNode 不能按同一节点继续 patch。

### keyed diff 用业务 key 建立新索引

patchKeyedChildren() 会为未知中间序列建立 key 映射，再决定复用、卸载和移动；稳定 key 让有状态组件获得确定身份。

### 组件函数 children 会归一化为默认 slot

normalizeChildren() 会把组件的函数 children 归一化为带当前 render context 的默认 slot，因此 slot 应保持函数形式并在调用时创建本轮 VNode。

### cloneVNode() 不只是对象展开

cloneVNode() 会复制 VNode 专用字段、合并附加 props 并重新归一化 key；内部保护性克隆不代表业务代码可以主动复用同一 VNode。

### mergeProps() 保护专用合并语义

class 会规范化组合、style 会合并、不同的同名事件 listener 会组成数组；其他字段才采用后值覆盖，因此它不是通用深合并。

### 资产解析与手工指令有不同上下文边界

resolveComponent() 和 resolveDirective() 可使用当前 rendering instance 或 setup instance；withDirectives() 更严格，必须在 render closure 中依赖 currentRenderingInstance 包住本轮新 VNode。
:::

:::warning
shape flag、children 规范化和 keyed diff 步骤是 Vue 3.5.40 的实现证据。可以据此解释当前行为，但不要读取 VNode 私有字段或把内部算法顺序写进业务契约。
:::

## 动手验证：状态跟随业务身份

:::demo{id="vue.core.learn.advanced.render-functions-vnodes.vnode-identity-lab-demo" playground="true"}
在 h() 创建的 keyed 子组件中写入本地笔记，再重排列表并观察状态仍跟随业务 ID
:::

:::exercise
### 把 schema renderer 限制在最小边界

**要求：**

~~~~text
给定只允许 heading、paragraph、action 的数据结构，使用直接导入的组件、h()、事件 props 和稳定业务 key 写出最小 render closure。
~~~~

**验收：**

~~~~text
完成题目要求。
~~~~

**参考答案：**

~~~~text
建立 kind 到已导入组件定义的固定映射，setup 返回 render closure，再按 block.id 创建 keyed 子组件；action 通过 onActivate 传递。拒绝任意 HTML、动态 import 和 VNode 私有字段。
~~~~
:::

:::exercise
### 诊断重排后的输入错位

**要求：**

~~~~text
给定同 type 子组件使用 index key 的代码，解释为什么反转后本地输入留在位置，并改成永久业务 ID。
~~~~

**验收：**

~~~~text
完成题目要求。
~~~~

**参考答案：**

~~~~text
index key 在反转前后仍表示位置，renderer 会复用该位置的旧实例。改用同级唯一且持久的 item.id；随机 key 会让每轮身份变化并触发 remount，同样错误。
~~~~
:::
