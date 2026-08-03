# Vue Core 基础课程：事件处理调研

> 核验日期：2026-07-30
>
> 适用版本：Vue 3.5.40。
>
> 资料范围：Vue 中文/英文官方文档、`vuejs/core` 的 `v3.5.40` 固定标签源码与
> 同标签官方测试。外部资料通过 Tavily 检索、提取后，所有结论均回到这些一手来源核验。

## 课程定位与边界

本课目标 ID 为 `vue.core.learn.basics.event-handling`。按当前仓库冻结顺序，它位于
`vue.core.learn.basics.watchers` 之后、`vue.core.learn.basics.form-bindings` 之前；该顺序已经在
`src/content/catalog/manifests/vue-core-track.ts` 中确认。Vue 官网侧边栏把事件处理放在侦听器
之前，但本课实现必须遵守本地课程清单，不按官网导航重排。

上一课已经建立“状态变化后才需要执行副作用时使用 watcher”的边界。本课再补充更直接的一条：

- 动作由某次明确的点击、提交、按键或指针事件发起，并且代码关心该次事件或用户意图时，直接
  使用事件处理器。
- 副作用应跟随某个响应式状态变化，无论变化来自点击、请求、路由还是程序赋值时，才使用
  watcher。
- 需要从已有状态得到可读取的同步值时，仍使用 computed，不使用事件或 watcher 维护副本。

本课面向 Composition API、`<script setup lang="ts">` 与原生 DOM 事件。正文聚焦 `v-on` / `@`、
内联与方法处理器、原生 `Event`、常用修饰符和类型标注。以下内容只在边界或进阶区说明，不并行
展开：Options API 的 `methods`、渲染函数监听器数组、动态事件名、无参数 `v-on` 对象语法、
手工 `addEventListener()`、组件 emits 完整协议。表单值同步留给紧随其后的表单绑定课程。

**课程依据：** [Vue 事件处理指南](https://cn.vuejs.org/guide/essentials/event-handling.html)、
[Vue 内置指令：v-on](https://cn.vuejs.org/api/built-in-directives.html#v-on)、
[`vue-core-track.ts`](../../src/content/catalog/manifests/vue-core-track.ts)。

## 学习目标

完成本课后，学习者应能：

1. 用 `@event="handler"` 监听原生 DOM 事件，并根据逻辑复杂度选择内联或方法处理器。
2. 预测模板编译器如何判定方法路径与内联表达式，正确传递自定义参数、`$event` 和多个动作。
3. 用 `.stop`、`.prevent`、`.self`、按键、系统、鼠标和事件选项修饰符表达 DOM 约束。
4. 解释修饰符顺序为何会改变可观察行为，避免 `.passive.prevent` 等矛盾组合。
5. 为 TypeScript 事件参数选择 `Event`、`KeyboardEvent` 或 `MouseEvent`，并安全收窄目标元素。
6. 区分原生 DOM 事件、组件自定义事件与 watcher，选择最直接的触发机制。

## 建议教学顺序

### 1. 从一次明确的用户动作进入

先复用现有 `ref()` 计数器，让按钮点击直接修改状态：

```vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <button type="button" @click="count++">已执行 {{ count }} 次</button>
</template>
```

这一步只建立“DOM 事件发生时运行 JavaScript”的因果关系。不要先用 watcher 监听一个
`clicked` 标记再执行动作；那会把一次清晰的事件拆成额外状态和第二条触发链。

### 2. 对照内联处理器与方法处理器

内联处理器适合一次简单赋值或调用；逻辑需要分支、复用、类型标注或独立阅读时提取方法。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

/** 重置计数并记录触发该动作的原生事件。 */
function reset(event: MouseEvent) {
  count.value = 0
  console.log(event.type)
}
</script>

<template>
  <button type="button" @click="count++">增加</button>
  <button type="button" @click="reset">重置</button>
</template>
```

### 3. 再解释编译器的判定规则

`save`、`actions.save`、`actions['save']` 是方法处理器；`save()`、`count++`、
`save(id, $event)` 是内联处理器。关键不在是否“看起来像函数”，而在整个表达式是不是合法的
标识符或属性访问路径。

方法处理器自动收到原生事件。内联调用一旦自己传入参数，就要显式使用 `$event` 或箭头函数：

```vue
<button type="button" @click="save('draft', $event)">保存草稿</button>
<button type="button" @click="(event) => save('final', event)">提交</button>
```

### 4. 用 DOM 语义引入普通事件修饰符

先讲三种可观察行为：`.stop` 停止传播、`.prevent` 阻止默认行为、`.self` 只允许元素自身成为
事件目标。随后立即演示 `@click.prevent.self` 与 `@click.self.prevent` 的差别，让学习者知道
修饰符不是无序标签。

### 5. 分开教授按键、系统键和鼠标按键修饰符

按键修饰符匹配 `KeyboardEvent.key`；系统修饰符检查事件发生时 `ctrlKey`、`altKey`、
`shiftKey`、`metaKey` 的状态；鼠标修饰符检查主、次、辅助指针按钮。三类名字有重叠，尤其
`.left` / `.right`，必须结合事件类型解释。

### 6. 最后引入原生监听选项与组件事件边界

`.capture`、`.once`、`.passive` 对应 `addEventListener` 的原生选项，不是普通 guard。
`.once` 也可用于组件事件，但组件 emit 不会创建 DOM 事件或冒泡。这里只建立边界，完整
`defineEmits()` 协议留给组件事件课程。

## 最小核心知识

### `v-on` 的三种课程内形态

| 形态 | 示例 | 准确行为 | 建议层级 |
| --- | --- | --- | --- |
| 方法处理器 | `@click="save"` | 自动把原生事件作为唯一参数传给方法 | 正文主线 |
| 内联处理器 | `@click="count++"` | 编译为接收 `$event` 的函数并执行表达式 | 正文主线 |
| 内联调用 | `@click="save(id, $event)"` | 自定义参数与事件均由模板明确传入 | 正文主线 |
| 对象语法 | `v-on="{ focus: onFocus, blur: onBlur }"` | 一次绑定多个事件名；对象语法不支持修饰符 | 课末进阶 |

动态参数 `@[eventName]="handler"` 是 `v-on` 的合法能力，但会降低模板静态可读性。固定事件名能
表达需求时不应为了展示 API 而使用动态参数。

**来源：** [Vue 事件处理：监听事件](https://cn.vuejs.org/guide/essentials/event-handling.html#listening-to-events)、
[Vue 内置指令：v-on](https://cn.vuejs.org/api/built-in-directives.html#v-on)。

### 原生事件、`$event` 与多处理器

方法处理器自动收到原生事件：

```ts
/** 处理键盘提交。 */
function submit(event: KeyboardEvent) {
  console.log(event.key)
}
```

内联处理器中的 `$event` 指当前原生事件。需要同一次事件顺序执行多个方法时，可使用一条多语句
内联处理器；`v3.5.40` 编译测试确认它会包装成 `$event => { ... }`：

```vue
<button type="button" @click="record($event); save()">保存</button>
```

课程应同时说明两个限制：这只是把多个同步语句放进同一个处理函数，不是注册了多个独立 DOM
监听器；逻辑一旦需要条件、错误处理或复用，就应提取一个命名方法，由该方法组织动作。

渲染函数可写 `onClick: [first, second]`。DOM 运行时会按数组顺序调用，并在前一个处理器调用
`stopImmediatePropagation()` 后停止后续处理器。这个能力适合源码推导，不应作为模板初学语法。

### 修饰符分层

| 层级 | 修饰符 | 运行含义 |
| --- | --- | --- |
| 事件行为 guard | `.stop`、`.prevent`、`.self` | 调用 Event 方法或按 `target/currentTarget` 提前返回 |
| 系统状态 guard | `.ctrl`、`.alt`、`.shift`、`.meta`、`.exact` | 检查事件发生时的系统键状态 |
| 鼠标按钮 guard | `.left`、`.right`、`.middle` | 检查主、次、辅助指针按钮 |
| 按键 guard | `.enter` 等别名、kebab-case 的 key 名 | 对键盘事件匹配 `KeyboardEvent.key` |
| 监听器选项 | `.capture`、`.once`、`.passive` | 传给原生 `addEventListener` 的 options |

编译器会把前三类相关修饰符交给 `withModifiers()`，把按键修饰符交给 `withKeys()`，把监听器
选项编码进事件属性名，再由 DOM 运行时还原为 `EventListenerOptions`。这解释了为什么
`.capture/.once/.passive` 影响监听器注册，而 `.prevent` 是事件触发后才执行。

### 修饰符顺序语义

普通 guard 会按模板中的修饰符顺序执行。官方给出的关键反例是：

```vue
<!-- 子元素触发时也会先 preventDefault，再因 self 返回 -->
<div @click.prevent.self="selectPanel">...</div>

<!-- 子元素触发时先因 self 返回，不会 preventDefault -->
<div @click.self.prevent="selectPanel">...</div>
```

同理，`@click.stop.self` 会先停止来自子元素的传播，再阻止处理器；`@click.self.stop` 对来自
子元素的事件先返回，不会停止其传播。课程实现不能把修饰符排序、去重或当作无序集合展示。

### 按键、系统键、`.exact` 与鼠标按钮

- `.enter`、`.tab`、`.delete`、`.esc`、`.space`、`.up`、`.down`、`.left`、`.right` 是常用
  别名；其他 `KeyboardEvent.key` 名转为 kebab-case，例如 `.page-down` 匹配 `PageDown`。
- `.delete` 同时匹配 `Delete` 与 `Backspace`；不能把它理解为只匹配键帽上的 Delete。
- `.ctrl` 等系统修饰符只要求对应系统键按下，不排除其他系统键；`.ctrl.exact` 才表示只按
  Ctrl，不同时按 Alt、Shift 或 Meta；`.exact` 单独使用表示没有系统修饰键按下。
- `keyup.ctrl` 要求事件发出时 Ctrl 仍处于按下状态；单独松开 Ctrl 时不满足。
- 鼠标 `.left/.right/.middle` 表示主、次、辅助触发器，不保证对应设备的物理左、右、中位置。
  编译器还会把静态 `click.right` 规范为 `contextmenu`、`click.middle` 规范为 `mouseup`，因为
  这两种按钮通常不会产生普通 click。

### 事件选项修饰符

- `.capture`：在捕获阶段注册监听器，祖先可在目标处理前收到事件。
- `.once`：浏览器最多调用该 DOM 监听器一次。
- `.passive`：承诺处理器不会阻止默认行为，典型用途是移动端触摸/滚动监听。
- `.passive.prevent` 自相矛盾；浏览器会忽略 `preventDefault()` 并可能输出警告。

`.once` 用在组件事件时由组件运行时记录是否已经触发，不是 DOM `addEventListener` option。相同
模板后缀在两条运行路径上提供一致的“一次”表层语义，但不能据此把组件事件当成 DOM 事件。

### TypeScript 事件类型

官方最小写法是先标注 `Event`，再对目标元素做断言：

```ts
/** 读取输入事件中的当前文本。 */
function handleChange(event: Event) {
  const input = event.target as HTMLInputElement
  console.log(input.value)
}
```

已知事件种类时应使用更具体的原生类型：键盘用 `KeyboardEvent`，指针按钮与坐标用
`MouseEvent`，提交可用 `SubmitEvent`。不要为了省事写 `any`；在 strict/noImplicitAny 下，未标注
的独立函数参数会报错，也会丢失 `key`、`button` 等属性检查。

`event.target` 是最初触发事件的节点，事件冒泡时可能是子元素；`event.currentTarget` 是当前
监听器所在元素。两者的 DOM 类型都需要根据模板上下文收窄，不能无条件假设 target 就是按钮或
输入框。

**来源：** [Vue TypeScript：为事件处理器标注类型](https://cn.vuejs.org/guide/typescript/composition-api.html#typing-event-handlers)、
[Vue 事件处理：方法处理器](https://cn.vuejs.org/guide/essentials/event-handling.html#method-handlers)。

### 原生 DOM 事件与组件事件边界

| 模板位置 | 监听的可能来源 | 关键边界 |
| --- | --- | --- |
| `<button @click="handle">` | 原生 DOM click | 自动收到原生 `MouseEvent` |
| `<Child @saved="handle">` | `Child` 主动 emit 的组件事件 | 收到 emit 载荷，不是原生 Event；不会冒泡 |
| `<Child @click="handle">` 且声明 click emit | 组件自定义 click | 只响应组件 emit，不再响应根元素原生 click |
| `<Child @click="handle">` 且未声明 click emit | 可能作为透传监听器落到单根元素 | 受 `$attrs` 与根节点结构影响，不宜作为隐式公共协议 |

组件应完整声明 emits，并优先使用表达业务意图的事件名。不要把 `.stop`、`.prevent` 等 DOM
修饰符套在任意组件载荷上；完整组件通信、校验、命名和透传边界由
`vue.core.reference.components.emits` 承担。

## 源码与测试证据

### 1. 编译器按表达式形状区分方法与内联处理器

`packages/compiler-core/src/transforms/vOn.ts` 使用 `isMemberExpression()` 和函数表达式判断：成员
路径直接作为处理器传递，其他表达式包装为接收 `$event` 的箭头函数。多语句内联表达式使用函数
体花括号；官方 `vOn.spec.ts` 分别覆盖 `i++`、`foo(); bar()` 与 `$event`。

这说明 `@click="save"` 与 `@click="save()"` 的差别由编译期语法决定，不是运行时猜测函数签名。

### 2. DOM 编译器把修饰符拆成三类

`packages/compiler-dom/src/transforms/vOn.ts` 将 modifier 分成 key、non-key 与 event-option 三组。
non-key 修饰符保留输入顺序并生成 `withModifiers()`；键盘事件再生成 `withKeys()`；
`passive/once/capture` 转为属性名后缀。对应测试覆盖多修饰符、按键 guard、`.exact` 以及
`click.right` / `click.middle` 的事件名转换。

### 3. guard 顺序就是模板顺序

`packages/runtime-dom/src/directives/vOn.ts` 的 `withModifiers()` 按数组下标逐个执行 guard；任一
guard 返回真值就直接结束，不调用用户处理器。`.stop` / `.prevent` 先执行 Event 方法，`.self`
比较 `target` 与 `currentTarget`，`.exact` 排除没有写在 modifiers 中的额外系统键。

这直接支撑课程中的顺序实验，而不是只依赖文档口头提示。

### 4. 按键名先标准化再匹配

`withKeys()` 把 `event.key` 转为 hyphenate 形式，与模板 modifiers 比较，并保留 `esc`、`space`、
方向键和 `delete` 的兼容别名。官方运行时测试覆盖普通 key、系统键、`.exact`、不同鼠标 button
以及不同修饰符包装结果的缓存隔离。

### 5. 事件选项最终进入原生监听器

`packages/runtime-dom/src/modules/events.ts` 的 `parseName()` 从属性名尾部提取 Once、Passive、
Capture，组成 options 后调用 `addEventListener`。更新处理器时 Vue 复用同一个 invoker，只替换其
`value`；删除时才移除监听器。invoker 还用事件时间戳避免事件冒泡途中刚挂上的监听器错误响应
同一次旧事件。

`patchEvents.spec.ts` 覆盖监听器添加、更新、删除、选项修饰符、处理器数组和
`stopImmediatePropagation()`。这些机制适合解释稳定更新与高级边界，不需要进入基础课主示例。

### 6. 组件事件走另一条运行时路径

`packages/runtime-core/src/componentEmits.ts` 从组件 vnode props 查找事件处理器，并为 `Once`
处理器记录已调用状态；它没有创建或派发 DOM Event。官方 `componentEmits.spec.ts` 验证同名普通
监听器可多次执行，而 once 监听器只执行一次。这与 DOM `events.ts` 的原生 option 路径清楚分层。

## 真实常见易错点

### 1. 以为 `save` 与 `save()` 都会自动收到原生事件

**原因：** `save` 是方法处理器，Vue 自动传事件；`save()` 是内联调用，参数列表由模板决定。

**后果：** 处理器收到 `undefined`，读取 `type`、`target` 或调用 `preventDefault()` 时出错。

```vue
<!-- 错误：save 没收到事件 -->
<button type="button" @click="save()">保存</button>

<!-- 正确：直接绑定方法，或显式传 $event -->
<button type="button" @click="save">保存</button>
<button type="button" @click="save($event)">保存</button>
```

**来源：** [方法与内联事件判断](https://cn.vuejs.org/guide/essentials/event-handling.html#method-vs-inline-detection)、
[`compiler-core vOn.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/src/transforms/vOn.ts)。

### 2. 为了传业务参数而丢失 `$event`

**原因：** 内联调用传了自定义参数后，不会额外偷偷追加原生事件。

**后果：** 业务值正确，但无法判断按键、目标元素或控制默认行为。

```vue
<!-- 错误 -->
<button type="button" @click="selectCourse(course.id)">选择</button>

<!-- 正确：确实需要事件时显式传入 -->
<button type="button" @click="selectCourse(course.id, $event)">选择</button>
```

**来源：** [在内联事件处理器中访问事件参数](https://cn.vuejs.org/guide/essentials/event-handling.html#accessing-event-argument-in-inline-handlers)。

### 3. 把多个复杂动作长期堆在模板内联语句中

**原因：** 多语句合法不等于可维护；模板开始承担分支、顺序和错误处理。

**后果：** 动作顺序难测试，复用时复制逻辑，后续增加条件时模板迅速失去可读性。

```vue
<!-- 错误方向 -->
<button @click="validate(); save(); track(); close()">提交</button>

<!-- 正确方向 -->
<button @click="submit">提交</button>
```

```ts
/** 按明确顺序完成一次提交。 */
function submit() {
  if (!validate()) return
  save()
  track()
  close()
}
```

**来源：** [Vue 事件处理：方法处理器](https://cn.vuejs.org/guide/essentials/event-handling.html#method-handlers)、
[`compiler-core vOn.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/__tests__/transforms/vOn.spec.ts)。

### 4. 把修饰符当成无序集合

**原因：** `withModifiers()` 按模板顺序执行，`.prevent` 和 `.self` 谁先运行会改变子元素事件的
默认行为。

**后果：** 处理器虽然没运行，却意外阻止了子链接或控件的默认动作；或本应停止的传播继续发生。

```vue
<!-- 错误方向：子元素事件也会先 preventDefault -->
<div @click.prevent.self="selectPanel"><a href="/help">帮助</a></div>

<!-- 正确：只处理并阻止面板自身的点击 -->
<div @click.self.prevent="selectPanel"><a href="/help">帮助</a></div>
```

**来源：** [Vue 事件修饰符顺序](https://cn.vuejs.org/guide/essentials/event-handling.html#event-modifiers)、
[`runtime-dom vOn.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/directives/vOn.ts)。

### 5. 同时使用 `.passive` 与 `.prevent`

**原因：** passive 在监听器注册时承诺不会阻止默认行为，prevent 却在触发后请求阻止。

**后果：** `preventDefault()` 被浏览器忽略并出现警告，滚动/触摸行为与代码意图相反。

```vue
<!-- 错误 -->
<div @touchmove.passive.prevent="drag">...</div>

<!-- 正确：不阻止滚动时使用 passive；确需阻止时去掉 passive -->
<div @touchmove.passive="observeMove">...</div>
<div @touchmove.prevent="drag">...</div>
```

**来源：** [Vue 事件选项修饰符](https://cn.vuejs.org/guide/essentials/event-handling.html#event-modifiers)、
[`runtime-dom events.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/modules/events.ts)。

### 6. 把系统修饰符当成精确组合，或误解 `keyup.ctrl`

**原因：** `.ctrl` 只要求 Ctrl 已按下，不排除 Alt/Shift/Meta；keyup 检查事件发生当下的状态。

**后果：** 多按一个系统键仍触发危险操作，或单独松开 Ctrl 时处理器没有运行却难以解释。

```vue
<!-- 错误方向：Ctrl + Alt 也会触发 -->
<button @click.ctrl="remove">删除</button>

<!-- 正确：只接受 Ctrl，不接受其他系统修饰键 -->
<button @click.ctrl.exact="remove">删除</button>

<!-- 只有仍按住 Ctrl、松开 Enter 时触发 -->
<input @keyup.ctrl.enter="submit" />
```

**来源：** [Vue 系统按键与 exact](https://cn.vuejs.org/guide/essentials/event-handling.html#system-modifier-keys)、
[`runtime-dom vOn.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/__tests__/directives/vOn.spec.ts)。

### 7. 把 `.left/.right/.middle` 当成固定物理位置，并只让 div 响应点击

**原因：** 鼠标修饰符表达主、次、辅助触发器；设备、左手设置和触控板不保证物理位置。同时，
普通 div 没有按钮的默认键盘与语义能力。

**后果：** 不同输入设备行为与文案不符，键盘和辅助技术用户无法触发主要动作。

```vue
<!-- 错误方向 -->
<div @click.left="confirm">确认</div>

<!-- 正确：主要动作优先使用语义按钮，不需要额外 left 限制 -->
<button type="button" @click="confirm">确认</button>
```

**来源：** [Vue 鼠标按键修饰符](https://cn.vuejs.org/guide/essentials/event-handling.html#mouse-button-modifiers)、
[Vue 无障碍：语义化表单](https://cn.vuejs.org/guide/best-practices/accessibility.html#semantic-forms)。

### 8. 用 watcher 转发一次明确事件

**原因：** 把“用户刚提交”转换成布尔值或计数，再侦听状态执行动作，增加了没有业务意义的中间
状态。

**后果：** 初始化、复位、重复触发和竞态更复杂，也丢失原生事件上下文。

```ts
// 错误方向
const shouldSubmit = ref(false)
watch(shouldSubmit, (value) => {
  if (value) submit()
})

/** 直接响应这一次提交事件。 */
function handleSubmit(event: SubmitEvent) {
  event.preventDefault()
  submit()
}
```

```vue
<form @submit="handleSubmit">...</form>
```

若同一副作用必须在状态被任何来源修改时都执行，watcher 才更合适；不要为了避免写事件处理器而
使用 watcher。

**来源：** [Vue 事件处理指南](https://cn.vuejs.org/guide/essentials/event-handling.html)、
[Vue 侦听器指南](https://cn.vuejs.org/guide/essentials/watchers.html)。

### 9. 把组件事件当成会冒泡的原生 DOM 事件

**原因：** 组件事件由 `emit()` 查找直接父组件监听器，不通过 DOM 派发，也不沿组件树冒泡。

**后果：** 祖先收不到事件；把原生同名 `click` 声明为 emit 后，父监听器的来源也可能改变。

```vue
<!-- 错误方向：期待 GrandParent 直接收到深层 Child 的 saved -->
<Child @saved="saveComplete" />

<!-- 正确方向：直接父组件监听，再显式组合或向上转发业务事件 -->
<Child @saved="handleChildSaved" />
```

**来源：** [Vue 组件事件](https://cn.vuejs.org/guide/components/events.html)、
[`componentEmits.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentEmits.ts)。

## 基于源码推导的适用场景与高级用法

### 适合直接使用事件处理器

- 一次点击、提交、键盘命令或指针动作具有独立业务意义，处理器需要事件载荷或当前目标。
- 同一个按钮的动作要按固定顺序完成校验、更新状态和记录日志，使用一个命名方法统一编排。
- DOM 约束可以由修饰符清楚表达，例如表单 `.prevent`、容器 `.self`、快捷键 `.exact`。
- 状态更新只属于这次操作；程序从其他路径修改同一状态时不应重复执行该动作。

### 适合使用 watcher 而不是事件

- 副作用取决于最终响应式状态，而状态可能由事件、路由、父组件、请求或恢复流程等多个来源改变。
- 需要新旧值比较、自动重跑、异步失效清理或组件更新后的 DOM 时机。
- 事件只负责更新源状态，后续外部同步必须覆盖所有状态变化来源。

### 可选高级推导

1. **稳定 invoker：** 组件重渲染只替换 invoker.value，不必反复移除/添加原生监听器；课程无需
   因担心模板函数更新而手工缓存所有处理器。
2. **晚挂监听器保护：** 事件时间戳防止冒泡中的一次事件触发本轮刚新增的监听器，可解释少数
   动态条件监听的时序问题，但不应成为日常业务依赖。
3. **处理器数组：** 渲染函数数组按序执行，`stopImmediatePropagation()` 会阻止同一 invoker
   的后续函数；模板多语句仍是一个函数，二者不可混称“多个监听器”。
4. **动态事件名：** `@[eventName]` 编译为动态属性键；只有组件确实需要在运行时选择事件协议时
   才使用，固定交互优先静态 `@click` / `@keydown`。
5. **对象语法：** `v-on="listeners"` 适合批量转发一组无修饰符监听器；需要 `.stop`、`.once` 等
   约束时改用逐个声明，避免把 DOM 策略藏进对象构造。
6. **组件 `.once`：** 与 DOM `.once` 表层一致，但由 `componentEmits.ts` 的实例状态保证；测试或
   调试时要沿组件 emit 路径，而不是寻找原生监听器 option。

## 单一同源 Demo 建议：事件指令台

只实现一个自包含 SFC，以同一个 `commandCount`、`lastEvent` 和 `eventLog` 为数据来源。所有交互
围绕“向指令台发出命令”，不拆成多个互不相关的计数器、表单和鼠标案例，也不引入请求或 watcher。

### 状态与区域

1. **命令区：** “增加”使用简单内联处理器；“重置”使用方法处理器并显示自动收到的
   `MouseEvent.type`；“保存”使用 `$event` 传业务参数。
2. **顺序区：** 一个按钮用 `@click="record($event); execute()"` 展示两条同步动作的日志顺序；
   旁边提供等价命名方法版本，主结论是复杂后应提取。
3. **传播区：** 外层可点击区域包含一个链接与按钮，允许切换 `.prevent.self` / `.self.prevent`
   两种预先写好的模板分支，日志展示处理器、默认行为和冒泡差异。不要动态拼接修饰符字符串。
4. **键盘区：** 一个有明确 label 的输入框分别响应 Enter、Ctrl+Enter、Ctrl+Enter.exact；界面
   显示最后匹配的组合，不在本课同步输入值。
5. **选项区：** “只执行一次”按钮使用 `.once`；捕获/冒泡区域显示调用顺序。`.passive` 只通过
   简短状态说明和源码卡片呈现，不人为制造难以稳定验收的滚动性能演示。
6. **日志区：** 每条记录包含稳定序号、事件类型、phase/currentTarget 标签和动作名；提供清空
   日志按钮。日志只记录最近 8 条，避免页面无限增长。

### 必须可验证的交互顺序

1. 点击内联“增加”两次，计数为 2；点击方法“重置”，计数归零且最后事件显示 `click`。
2. 点击“保存草稿”，日志同时出现业务参数 `draft` 和原生事件类型，证明 `$event` 显式传递。
3. 点击顺序按钮，日志严格先 `record` 后 `execute`；命名方法版本得到相同顺序。
4. 点击传播区子链接，在 `.prevent.self` 模式看到默认行为被阻止；切到 `.self.prevent` 后，父处理器
   仍不执行，但子链接默认行为不再被父层阻止。Demo 应使用站内无破坏目标或可见计数验证，避免
   真正离开页面。
5. 按 Enter 只命中普通规则；按 Ctrl+Enter 命中系统规则；再同时按 Shift 时不命中
   `.ctrl.exact` 规则。
6. 连续点击 once 按钮两次，日志只新增一次；捕获区点击内层按钮时先记录 capture，再记录目标/
   bubble。
7. 所有主操作均能通过键盘到达并触发；不依赖右键或中键才能完成课程主流程。

### 390px 布局与可访问性约束

- 使用单列 flex 布局，不使用 `grid`，不使用 `gap`；控件间距用明确 margin。
- 指令按钮区允许 `flex-wrap`，每个按钮至少 44px 高；最长标签可换行且不挤压状态数字。
- 输入框、传播实验区与日志全宽显示，`min-width: 0`，390px 视口下不得横向滚动。
- 日志事件名和键组合可以换行，不用固定宽度代码块撑开页面；稳定序号区域不随位数跳动。
- 使用 `<button type="button">`、`<label for>`、`<input>` 和真实链接，不用带 click 的 div 模拟
  主按钮。
- 状态变化使用可见文本；事件日志容器可用温和的 `aria-live="polite"`，但不要让每个按键事件
  都产生冗长播报。
- 传播实验的两个模式使用有文本标签的单选/分段控制，当前模式不能只靠颜色区分。

该 Demo 的单一问题是“模板监听器何时、以什么条件调用处理器”。不要加入表单双向绑定、远程
请求、组件 emit 子案例或 watcher 模式切换，否则会越过相邻课程边界。

## 建议 prerequisites / related API ID

以下 ID 均已通过本地精确搜索确认存在：

### prerequisites

- `vue.core.learn.basics.watchers`：按冻结清单紧邻本课之前；学习者已能区分派生值、副作用与
  watcher，本课进一步学习明确用户事件应直接处理。

不再重复列出 `reactive-state`、`computed-properties` 作为硬前置；它们已由 watchers 的课程链
覆盖，继续堆叠会让 prerequisite 噪声超过实际门槛。

### related

- `vue.core.learn.basics.watchers`：用于“直接事件处理 vs 跟随状态变化”的回链。
- `vue.core.learn.basics.form-bindings`：冻结顺序中的下一课；本课只处理事件，不提前教授 v-model。
- `vue.core.learn.basics.component-basics`：进入自定义组件监听器前的后续课程。
- `vue.core.reference.reactivity.ref`：事件处理器中更新响应式状态的最小 API。
- `vue.core.reference.components.emits`：原生 DOM 事件与组件自定义事件的正式边界。
- `vue.core.reference.application.next-tick`：事件更新状态后确需等待 DOM 刷新时的相关 API，不进入
  本课主线。

参考索引中存在 `v-on` 的官方条目，但当前状态是 `merged/planned`，没有可导航的独立 entry ID，
因此不能虚构 `vue.core.reference.*.v-on` 作为 related。

## 固定来源清单

### Vue 官方文档

- [Vue 中文官网：事件处理](https://cn.vuejs.org/guide/essentials/event-handling.html)
- [Vue 英文官网：Event Handling](https://vuejs.org/guide/essentials/event-handling.html)
- [Vue 内置指令：v-on](https://cn.vuejs.org/api/built-in-directives.html#v-on)
- [Vue TypeScript：为事件处理器标注类型](https://cn.vuejs.org/guide/typescript/composition-api.html#typing-event-handlers)
- [Vue 组件事件](https://cn.vuejs.org/guide/components/events.html)
- [Vue 透传 Attributes](https://cn.vuejs.org/guide/components/attrs.html#v-on-listener-inheritance)
- [Vue 侦听器](https://cn.vuejs.org/guide/essentials/watchers.html)
- [Vue 无障碍：语义化表单](https://cn.vuejs.org/guide/best-practices/accessibility.html#semantic-forms)

### vuejs/core v3.5.40

- [`compiler-core/src/transforms/vOn.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/src/transforms/vOn.ts)
- [`compiler-core vOn.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/__tests__/transforms/vOn.spec.ts)
- [`compiler-dom/src/transforms/vOn.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-dom/src/transforms/vOn.ts)
- [`compiler-dom vOn.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-dom/__tests__/transforms/vOn.spec.ts)
- [`runtime-dom/src/directives/vOn.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/directives/vOn.ts)
- [`runtime-dom vOn.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/__tests__/directives/vOn.spec.ts)
- [`runtime-dom/src/modules/events.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/modules/events.ts)
- [`runtime-dom patchEvents.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/__tests__/patchEvents.spec.ts)
- [`runtime-core/src/componentEmits.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentEmits.ts)
- [`runtime-core componentEmits.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/componentEmits.spec.ts)

## 实施验收清单

- 课程 meta ID 精确为 `vue.core.learn.basics.event-handling`，状态从 planned 进入实现时不改变相邻
  `form-bindings` 的冻结位置。
- prerequisite 只写已存在的 `vue.core.learn.basics.watchers`；related 不包含虚构 ID。
- 正文同时包含方法/内联判定、`$event`、多语句处理、普通/按键/系统/鼠标/选项修饰符、
  `.exact`、顺序语义、TypeScript 与组件边界。
- 至少一个例子明确证明 `.prevent.self` 与 `.self.prevent` 不等价；不把修饰符排序。
- 不出现 `.passive.prevent` 正向示例，不把 `.ctrl` 描述成精确组合，不把鼠标 left/right 描述成
  固定物理位置。
- Demo 只有一个同源状态与事件日志，不使用 watcher、v-model 或子组件 emit 实现主流程。
- 390px 验收遵守单列 flex、无 `grid`、无 `gap`、无横向滚动和主控件至少 44px 高。
- 后续实现中的每个方法定义上方添加规范中文注释，并使用最少必要验证覆盖关键交互。

## 结论

本课应建立的核心模型是：模板通过 `v-on` 把一个明确 DOM 事件连接到处理器；方法路径自动接收
原生事件，其他表达式编译为内联函数；修饰符则分别在处理器调用前充当有序 guard，或在监听器
注册时变成原生 options。`v3.5.40` 的编译器、DOM 运行时与测试完整支撑这一模型。

只要课程始终围绕“这一次事件、哪个 guard、哪个处理器”组织，就能自然区分直接事件处理与
watcher，也能在不提前展开组件通信的前提下说明 DOM 事件和 emit 的边界。单一“事件指令台”
足以把语法、顺序、按键组合、once 与 390px 可访问验收串成一个可实施且可验证的课程。
