---
id: vue.core.learn.basics.event-handling
type: lesson
title: 事件处理
summary: 用 v-on 响应明确的用户动作，并正确传递事件、组合修饰符和约束触发条件
domain: frontend
technology: vue
module: core
related:
  - vue.core.learn.basics.watchers
  - vue.core.learn.basics.form-bindings
  - vue.core.learn.basics.component-basics
  - vue.core.reference.reactivity.ref
  - vue.core.reference.components.emits
  - vue.core.reference.application.next-tick
tags:
  - v-on
  - 事件处理
  - 事件修饰符
  - $event
  - KeyboardEvent
  - MouseEvent
appliesTo: Vue 3.5.40
verifiedAt: 2026-07-30
sources:
  - title: Vue 事件处理指南
    url: https://cn.vuejs.org/guide/essentials/event-handling.html
  - title: Vue 内置指令：v-on
    url: https://cn.vuejs.org/api/built-in-directives.html#v-on
  - title: Vue TypeScript：为事件处理器标注类型
    url: https://cn.vuejs.org/guide/typescript/composition-api.html#typing-event-handlers
  - title: Vue 组件事件
    url: https://cn.vuejs.org/guide/components/events.html
  - title: Vue 3.5.40 compiler-core vOn.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/src/transforms/vOn.ts
  - title: Vue 3.5.40 compiler-dom vOn.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-dom/src/transforms/vOn.ts
  - title: Vue 3.5.40 runtime-dom vOn.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/directives/vOn.ts
  - title: Vue 3.5.40 runtime-dom events.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/modules/events.ts
  - title: Vue 3.5.40 componentEmits.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentEmits.ts
stage: basics
level: beginner
estimatedMinutes: 42
prerequisites:
  - vue.core.learn.basics.watchers
objectives:
  - 用 @event 监听原生 DOM 事件，并选择内联或方法处理器
  - 正确传递业务参数、$event，并判断多语句何时应提取为命名方法
  - 用普通、按键、系统、鼠标和监听选项修饰符约束触发条件
  - 解释修饰符顺序、.exact 和 .passive.prevent 冲突的实际影响
  - 为 TypeScript 事件参数选择准确类型，并区分 DOM 事件与组件 emit
recap:
  - 明确的点击、按键或提交直接使用事件处理器；覆盖所有状态变化来源的副作用才使用 watcher。
  - 方法路径自动收到原生事件；内联调用需要显式传递业务参数和 $event。
  - 普通修饰符是有顺序的 guard；按键、系统键、鼠标按钮和监听选项解决不同层级的问题。
  - "`.ctrl.exact` 排除额外系统键，`.passive.prevent` 则是互相冲突的组合。"
  - DOM 事件遵循原生传播；组件 emit 传递自定义载荷且不会沿组件树冒泡。
---

# 事件处理

## 一、一次明确动作，直接交给事件处理器

上一课用侦听器响应状态变化。本课处理另一类因果关系：用户刚刚点击、按键或提交，代码要响应这一次动作。模板中的 `v-on:event`（简写 `@event`）会在对应 DOM 事件发生时运行 JavaScript。

| 需求 | 直接选择 |
| --- | --- |
| 点击按钮后执行一次保存，并关心这次点击 | 事件处理器 |
| 无论状态由哪里改变，都要同步到外部系统 | watch |
| 从已有状态得到总价、筛选结果或文案 | computed |

~~~~vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <button type="button" @click="count++">
    已执行 {{ count }} 次
  </button>
</template>
~~~~

:::tip
不要先把点击转成 `clicked` 布尔值，再用 watch 转发动作。只有副作用必须覆盖事件之外的所有状态变化来源时，侦听器才更合适。
:::

## 二、内联处理器与方法处理器

简单赋值或调用可以留在模板内联表达式中。逻辑需要复用、分支、类型标注或独立阅读时，应提取为方法。直接绑定方法路径时，Vue 会把原生事件作为唯一参数传入。

~~~~vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

/** 重置计数并记录原生点击类型。 */
function reset(event: MouseEvent): void {
  count.value = 0
  console.log(event.type)
}
</script>

<template>
  <button type="button" @click="count++">增加</button>
  <button type="button" @click="reset">重置</button>
</template>
~~~~

编译器根据整个表达式的形状判定类型：`save`、`actions.save` 是方法处理器；`save()`、`count++`、`save(id, $event)` 是内联处理器。`save()` 不会因为函数恰好声明了参数就自动补上传入事件。

| 模板表达式 | 类型 | 事件如何进入 |
| --- | --- | --- |
| @click="save" | 方法处理器 | Vue 自动传入原生事件 |
| @click="count++" | 内联处理器 | 表达式可通过 $event 访问事件 |
| @click="save('draft', $event)" | 内联调用 | 参数与事件都由模板明确传入 |

## 三、传递 $event，并控制动作顺序

内联处理器里的 `$event` 指向当前原生事件。既要传业务参数又要读取事件时，应显式把两者都传给方法。同一次事件也可以用分号顺序执行多个同步语句。

~~~~vue
<script setup lang="ts">
/** 保存指定版本并记录触发来源。 */
function save(version: string, event: MouseEvent): void {
  console.log(version, event.type)
}

/** 记录本次原生事件。 */
function record(event: MouseEvent): void {
  console.log('record', event.type)
}

/** 执行业务动作。 */
function execute(): void {
  console.log('execute')
}
</script>

<template>
  <button type="button" @click="save('draft', $event)">保存草稿</button>
  <button type="button" @click="record($event); execute()">记录后执行</button>
</template>
~~~~

:::warning
多语句合法，但仍只生成一个处理函数，不是多个独立 DOM 监听器。出现条件、错误处理或复用需求时，把顺序提取到一个有名称的方法里。
:::

## 四、为 TypeScript 事件参数选择类型

已知事件类别时使用浏览器提供的具体类型：按键用 `KeyboardEvent`，点击和指针按钮用 `MouseEvent`，表单提交可用 `SubmitEvent`。通用处理器可以从 `Event` 开始，再根据模板上下文收窄目标元素。

~~~~ts
/** 读取输入事件中的当前文本。 */
function handleInput(event: Event): void {
  const input = event.currentTarget as HTMLInputElement
  console.log(input.value)
}

/** 处理键盘提交。 */
function handleSubmit(event: KeyboardEvent): void {
  console.log(event.key, event.ctrlKey)
}
~~~~

`target` 是最初触发事件的节点，冒泡时可能是子元素；`currentTarget` 是当前监听器所在元素。两者的静态类型都不会自动变成模板里的具体元素，读取 `value` 等属性前仍要收窄。

## 五、用普通修饰符表达 DOM 约束

| 修饰符 | 运行行为 | 典型用途 |
| --- | --- | --- |
| .stop | 调用 event.stopPropagation() | 阻止事件继续传播 |
| .prevent | 调用 event.preventDefault() | 阻止链接跳转或表单提交 |
| .self | target 不等于 currentTarget 时直接返回 | 只响应容器自身，不响应子元素 |

修饰符按模板中的书写顺序运行，并不是无序标签。`@click.prevent.self` 收到子元素点击时会先阻止默认行为，再因 `.self` 停止；`@click.self.prevent` 会先停止，因而不会阻止子元素自己的默认行为。

~~~~vue
<div @click.prevent.self="selectPanel">
  <a href="#help">子链接也会先被 prevent</a>
</div>

<div @click.self.prevent="selectPanel">
  <a href="#help">子链接先被 self 排除，不会执行 prevent</a>
</div>
~~~~

## 六、在事件指令台验证完整调用链

下面的单一 Demo 共享命令次数、最后事件和最近 8 条日志。依次验证内联与方法处理器、`$event`、多语句顺序、修饰符顺序、键盘组合、`.once` 以及 capture → target → bubble。

:::demo{id="vue.core.learn.basics.event-handling.event-command-demo" playground="true"}
在同一事件日志中观察处理器判定、修饰符 guard 与传播阶段
:::

## 七、键盘、系统键与鼠标按钮修饰符

按键修饰符匹配 `KeyboardEvent.key`。常用别名包括 `.enter`、`.tab`、`.delete`、`.esc`、`.space` 和方向键；其他键名使用 kebab-case，例如 `.page-down`。`.delete` 同时匹配 Delete 与 Backspace。

~~~~vue
<input @keyup.enter="submit" />
<input @keyup.page-down="nextPage" />
<input @keyup.ctrl.enter="save" />
<input @keyup.ctrl.exact.enter="saveExactly" />
~~~~

`.ctrl`、`.alt`、`.shift`、`.meta` 只要求对应系统键在事件发生时按下，不排除其他系统键；加 `.exact` 才能排除模板中未声明的额外系统键。`keyup.ctrl` 还要求 keyup 发生时 Ctrl 仍按下，单独松开 Ctrl 不会匹配。

鼠标 `.left`、`.right`、`.middle` 检查主、次、辅助触发器，而不是保证物理左、右、中位置。主要操作仍应使用语义化按钮，不要用只响应某个鼠标按键的 `div` 排除键盘用户。

## 八、监听器选项影响注册方式

| 修饰符 | 原生选项 | 可观察结果 |
| --- | --- | --- |
| .capture | capture: true | 祖先在目标处理器之前收到事件 |
| .once | once: true | 该 DOM 监听器最多调用一次 |
| .passive | passive: true | 承诺处理器不会阻止默认行为 |

:::warning
不要组合 `.passive.prevent`。passive 在注册时承诺不会阻止默认行为，prevent 却在触发后要求阻止；浏览器会忽略请求并可能输出警告。
:::

`.capture`、`.once`、`.passive` 会被编译进事件属性名，DOM 运行时再解析为 `addEventListener` 选项。它们与触发后才运行的 `.stop`、`.prevent`、`.self` 属于不同层级。

## 九、原生 DOM 事件与组件事件是两条路径

| 监听位置 | 收到什么 | 传播边界 |
| --- | --- | --- |
| &lt;button @click="handle"&gt; | 原生 MouseEvent | 遵循 DOM 捕获与冒泡 |
| &lt;Child @saved="handle"&gt; | 子组件 emit 的载荷 | 只通知直接监听它的父组件，不沿 DOM 冒泡 |

组件事件由子组件主动 `emit()`，载荷不一定是原生 Event，也不会沿组件树冒泡。完整的事件声明、校验和透传边界属于组件通信课程；本课不要把 DOM 修饰符机械套到任意组件载荷上。

## 十、易错使用提示

:::pitfalls
### 以为 save() 会自动收到事件

**触发条件：** 以为 save() 会自动收到事件

**原因：** `save` 是方法处理器；`save()` 已经是参数由模板决定的内联调用。

**后果：** 处理器收到 undefined，读取 type 或 target 时出错。

**错误示例：**

~~~~vue
<button @click="save()">保存</button>
~~~~

**正确写法：**

~~~~vue
<button @click="save">保存</button>
<button @click="save($event)">保存</button>
~~~~

**验证方式：** 对照正确写法验证结果。

### 传业务参数时丢失 $event

**触发条件：** 传业务参数时丢失 $event

**原因：** 自定义参数不会让 Vue 在末尾额外追加原生事件。

**后果：** 业务值正确，但无法读取按键、目标或默认行为。

**错误示例：**

~~~~vue
<button @click="save('draft')">保存</button>
~~~~

**正确写法：**

~~~~vue
<button @click="save('draft', $event)">保存</button>
~~~~

**验证方式：** 对照正确写法验证结果。

### 把复杂顺序长期堆在模板里

**触发条件：** 把复杂顺序长期堆在模板里

**原因：** 多语句虽合法，但模板会逐渐承担分支、顺序与错误处理。

**后果：** 动作难复用、难测试，增加条件后可读性迅速下降。

**错误示例：**

~~~~vue
<button @click="validate(); save(); track(); close()">提交</button>
~~~~

**正确写法：**

~~~~vue
<button @click="submit">提交</button>
~~~~

**验证方式：** 对照正确写法验证结果。

### 把修饰符当成无序集合

**触发条件：** 把修饰符当成无序集合

**原因：** 普通 guard 会严格按照模板中的顺序执行。

**后果：** 处理器没运行，子链接的默认行为却可能已经被意外阻止。

**错误示例：**

~~~~vue
<div @click.prevent.self="select"><a href="/help">帮助</a></div>
~~~~

**正确写法：**

~~~~vue
<div @click.self.prevent="select"><a href="/help">帮助</a></div>
~~~~

**验证方式：** 对照正确写法验证结果。

### 同时使用 passive 与 prevent

**触发条件：** 同时使用 passive 与 prevent

**原因：** passive 承诺不会阻止默认行为，prevent 则请求阻止。

**后果：** preventDefault() 被忽略，浏览器还可能输出警告。

**错误示例：**

~~~~vue
<div @touchmove.passive.prevent="drag" />
~~~~

**正确写法：**

~~~~vue
<div @touchmove.passive="observeMove" />
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 ctrl 当成精确组合

**触发条件：** 把 ctrl 当成精确组合

**原因：** `.ctrl` 不排除同时按下 Alt、Shift 或 Meta。

**后果：** 多按系统键时仍可能触发只想留给 Ctrl 的动作。

**错误示例：**

~~~~vue
<button @click.ctrl="remove">删除</button>
~~~~

**正确写法：**

~~~~vue
<button @click.ctrl.exact="remove">删除</button>
~~~~

**验证方式：** 对照正确写法验证结果。

### 把鼠标修饰符当成物理位置

**触发条件：** 把鼠标修饰符当成物理位置

**原因：** left、right、middle 表示主、次、辅助触发器，会受设备和用户设置影响。

**后果：** 文案与真实输入设备不一致，非鼠标用户也无法完成主操作。

**错误示例：**

~~~~vue
<div @click.left="confirm">确认</div>
~~~~

**正确写法：**

~~~~vue
<button type="button" @click="confirm">确认</button>
~~~~

**验证方式：** 对照正确写法验证结果。

### 用 watcher 转发一次点击

**触发条件：** 用 watcher 转发一次点击

**原因：** 明确动作被转换成额外状态，再经第二条触发链执行。

**后果：** 复位和重复触发更复杂，还丢失这次原生事件上下文。

**错误示例：**

~~~~ts
const clicked = ref(false)
watch(clicked, (value) => {
  if (value) save()
})
~~~~

**正确写法：**

~~~~vue
<button type="button" @click="save">保存</button>
~~~~

**验证方式：** 对照正确写法验证结果。

### 把组件事件当成 DOM 冒泡事件

**触发条件：** 把组件事件当成 DOM 冒泡事件

**原因：** 组件 emit 直接查找父组件监听器，不创建 DOM Event。

**后果：** 祖先收不到深层子组件事件，事件参数类型也可能判断错误。

**错误示例：**

~~~~vue
<DeepChild @saved="handleSaved" />
~~~~

**正确写法：**

~~~~vue
<Child @saved="handleChildSaved" />
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 十一、从源码推导适用场景

:::steps
### 表达式形状决定处理器包装方式

`compiler-core` 的 vOn 转换先判断成员路径与函数表达式；其他内容包装为接收 `$event` 的内联函数。因此是否自动传事件取决于模板语法，不取决于运行时函数签名。

### 普通 guard 保留模板顺序

`runtime-dom` 的 `withModifiers()` 逐个执行修饰符，任一 guard 要求停止就不再调用用户处理器。这使 `.prevent.self` 与 `.self.prevent` 产生不同默认行为。

### 按键规则先标准化再匹配

`withKeys()` 会标准化 `KeyboardEvent.key`，再与模板修饰符比较。系统键和 `.exact` 则作为普通 guard 检查事件发生当下的状态。

### 监听选项在注册阶段生效

DOM 运行时从事件属性名解析 Once、Passive、Capture，再交给 `addEventListener`。它们不是处理器内部的条件分支。

### 组件 once 与 DOM once 只有表层语义相同

组件运行时为 once 处理器记录是否已经触发，不会创建原生监听器。排查组件事件时应沿 emit 路径，而不是寻找 DOM options。
:::

:::exercise
### 实现一个精确键盘保存命令

**要求：**

~~~~text
准备一个语义化按钮和一个带 label 的输入框。按钮用方法处理器保存；输入框只在 Ctrl+Enter 且没有额外 Alt、Shift、Meta 时保存。处理器接收 KeyboardEvent，记录 key 与 currentTarget。说明为什么这里直接处理事件，而不使用 watcher。
~~~~

**验收：**

~~~~text
完成题目要求。
~~~~

**参考答案：**

~~~~text
<script setup lang="ts">
/** 保存当前草稿。 */
function saveDraft(event: MouseEvent | KeyboardEvent): void {
  const target = event.currentTarget as HTMLElement
  console.log(event.type, event instanceof KeyboardEvent ? event.key : 'pointer', target.tagName)
}
</script>

<template>
  <button type="button" @click="saveDraft">保存草稿</button>
  <label for="save-command">键盘命令</label>
  <input id="save-command" @keyup.ctrl.exact.enter="saveDraft" />
</template>
~~~~
:::
