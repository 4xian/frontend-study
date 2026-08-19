---
id: react.core.learn.basics.event-handling
type: lesson
title: 事件处理
summary: 掌握 React 事件处理函数、事件对象、click 传播顺序、默认行为控制与 TypeScript 类型。
domain: frontend
technology: react
module: core
stage: basics
level: beginner
estimatedMinutes: 80
prerequisites:
  - react.core.learn.basics.component-purity
related: []
tags:
  - React
  - 事件处理
  - SyntheticEvent
  - 事件传播
  - TypeScript
appliesTo: React 19.2（运行时 19.2.8）
verifiedAt: 2026-08-16
objectives:
  - 能区分传递事件处理函数与在 render 期间调用函数。
  - 能为内置元素和自定义组件定义清楚的 handler prop。
  - 能正确使用 React 事件对象的 target、currentTarget 与默认行为状态。
  - 能解释 click 的 capture、target 和 bubble 顺序并控制传播。
  - 能区分 stopPropagation 与 preventDefault 的作用。
  - 能用 TypeScript 准确标注点击事件处理函数。
recap:
  - 事件 prop 接收函数值；交互发生后 React 才调用这个函数。
  - 自定义组件的 handler prop 是组件合同，必须由组件显式调用或转交。
  - target 是最初触发事件的对象，currentTarget 是当前 handler 所在元素。
  - click 依次经过 capture、target 和 bubble，onScroll 不遵循相同的冒泡结论。
  - stopPropagation 控制传播，preventDefault 控制可取消的浏览器默认动作。
  - 内联 handler 通常可推断类型，抽取的 handler 应标注准确的 React 事件类型。
sources:
  - title: React Responding to Events
    url: https://react.dev/learn/responding-to-events
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 传递事件处理函数、自定义 handler prop 与事件发生时机
      - click 传播、停止传播和阻止默认行为
  - title: React Event Object
    url: https://react.dev/reference/react-dom/components/common#react-event-object
    sourceType: api-doc
    appliesTo: React DOM 19.2
    claims:
      - React 事件对象的公共字段和方法
      - target、currentTarget、nativeEvent 与 onScroll 边界
  - title: React Using TypeScript
    url: https://react.dev/learn/typescript#typing-dom-events
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 内联事件类型推断与抽取 handler 的显式类型
  - title: React Types 19.2.18
    url: https://cdn.jsdelivr.net/npm/@types/react@19.2.18/index.d.ts
    sourceType: source-code
    appliesTo: '@types/react 19.2.18'
    claims:
      - SyntheticEvent、MouseEvent 与 MouseEventHandler 类型合同
      - target 与 currentTarget 的类型差异
  - title: DOM Event
    url: https://dom.spec.whatwg.org/#interface-event
    sourceType: specification
    appliesTo: DOM Living Standard
    claims:
      - 事件目标、阶段、传播、取消能力与 defaultPrevented
  - title: HTML Links
    url: https://html.spec.whatwg.org/multipage/links.html#links-created-by-a-and-area-elements
    sourceType: specification
    appliesTo: HTML Living Standard
    claims:
      - 带 href 链接的默认激活行为
  - title: TypeScript Contextual Typing
    url: https://www.typescriptlang.org/docs/handbook/type-inference.html#contextual-typing
    sourceType: official-reference
    appliesTo: TypeScript 6.0
    claims:
      - 函数表达式从所在位置获得上下文类型
---

# 事件处理

## 一、学习目标

- 理解 JSX 事件 prop 保存的是函数，而不是函数的执行结果。
- 使用命名 handler、短内联 handler 和带参数的包装函数。
- 为 DOM 元素和自定义组件选择准确的事件合同。
- 读取事件类型、触发目标、当前处理元素和默认行为状态。
- 判断 click 在 capture、target 和 bubble 阶段的执行顺序。
- 分别控制传播路径与浏览器默认动作。
- 用 TypeScript 描述按钮点击 handler 的参数和完整函数类型。

## 二、React 事件处理的基本模型

浏览器把点击、按键、焦点变化等用户操作表示为事件。React 组件通过 JSX 事件 prop 把某类事件连接到
一个函数。例如，按钮的 `onClick` 接收点击事件处理函数：

```tsx
// 响应用户打开课程的操作。
function handleOpenCourse() {
  console.info('打开课程')
}

// 展示能够响应点击的课程按钮。
function CourseButton() {
  return <button onClick={handleOpenCourse}>打开课程</button>
}
```

这段代码包含两个不同的时机：

1. **render 时：** 组件返回按钮，并把 `handleOpenCourse` 函数交给 `onClick`。
2. **点击后：** React 调用 `handleOpenCourse`，函数体才开始执行。

事件处理的核心可以写成一条时间线：

```text
组件 render -> JSX 保存 handler -> 用户触发事件 -> React 调用 handler
```

`onClick` 使用驼峰命名。它是 React DOM 支持的 prop，不是 HTML 字符串属性，因此值应当是 JavaScript
函数。

## 三、传递函数，而不是立即调用

### 1. 传递函数引用

`onClick={handleOpenCourse}` 读取函数值并交给 React。花括号中没有圆括号，所以 render 时不会执行函数体。

```tsx
// 记录一次课程打开操作。
function handleOpenCourse() {
  console.info('打开课程')
}

// 把函数引用交给按钮。
function OpenCourseButton() {
  return <button onClick={handleOpenCourse}>打开课程</button>
}
```

### 2. 调用函数会得到执行结果

`onClick={handleOpenCourse()}` 会在计算 JSX 时调用函数，然后把返回值交给 `onClick`。如果函数没有显式
返回值，结果就是 `undefined`；更重要的是，操作已经在用户点击前发生。

```tsx
// 执行课程打开操作并记录结果。
function openCourse() {
  console.info('打开课程')
}

// 错误：render 时已经调用 openCourse。
function IncorrectButton() {
  return <button onClick={openCourse()}>打开课程</button>
}
```

事件 prop 需要的是“以后可以调用的函数”，不是“现在调用函数得到的值”。

### 3. 需要参数时传包装函数

如果 handler 需要课程 ID，不能直接写 `onClick={openCourse(courseId)}`。可以传递一个包装函数，让参数在
点击后再进入真正的处理逻辑：

```tsx
type CourseButtonProps = {
  courseId: string
}

// 根据课程 ID 执行打开操作。
function openCourse(courseId: string) {
  console.info(`打开课程：${courseId}`)
}

// 为当前课程创建稍后执行的点击响应。
function CourseButton({ courseId }: CourseButtonProps) {
  return (
    <button
      onClick={
        // 点击后把当前课程 ID 交给打开逻辑。
        () => openCourse(courseId)
      }
    >
      打开课程
    </button>
  )
}
```

箭头函数本身被传给 `onClick`。用户点击后，React 调用箭头函数，箭头函数再调用 `openCourse(courseId)`。

下面的写法看起来接近，但点击后不会执行 `openCourse`：

```tsx
// 错误：箭头函数只返回 openCourse，没有调用它。
function BrokenCourseButton() {
  return (
    <button
      onClick={
        // 错误地只返回目标函数，演示遗漏调用的后果。
        () => openCourse
      }
    >
      打开课程
    </button>
  )
}
```

### 4. 命名 handler 与短内联 handler

两种写法都有效。命名 handler 适合包含多个步骤、需要复用或需要准确类型标注的逻辑；短内联 handler
适合局部、单一且一眼能读懂的操作。

```tsx
// 展示由上下文类型约束的短内联点击处理。
function InlineButton() {
  return (
    <button
      onClick={
        // 输出当前按钮的稳定文本。
        (event) => {
          console.info(event.currentTarget.textContent)
        }
      }
    >
      查看标题
    </button>
  )
}
```

这里的 `event` 不需要手写类型，因为 `onClick` 的类型为函数表达式提供了上下文。

## 四、内置事件 prop 与自定义 handler prop

### 1. DOM 元素使用 React 支持的事件名

内置元素的事件 prop 由 React DOM 定义。例如：

- `<button onClick={...}>` 响应点击。
- `<input onFocus={...}>` 响应获得焦点。
- `<div onKeyDown={...}>` 响应键盘按下，但元素本身必须能够合理获得焦点。

优先使用能表达交互语义的 HTML 元素。执行操作时使用 `<button>`，跳转到地址时使用带 `href` 的 `<a>`。
语义元素自带适合的键盘与浏览器行为，不需要用普通 `<div>` 模拟按钮。

### 2. 自定义组件可以使用领域名称

自定义组件接收的是普通 Props，因此 handler prop 可以表达业务动作，例如 `onOpenCourse`、
`onArchiveLesson`。惯例是以 `on` 开头，后接大写字母。

```tsx
type CourseActionProps = {
  title: string
  onOpenCourse: () => void
}

// 把打开课程的领域动作连接到内部按钮。
function CourseAction({ title, onOpenCourse }: CourseActionProps) {
  return <button onClick={onOpenCourse}>打开 {title}</button>
}

// 提供课程标题和对应的打开行为。
function CourseToolbar() {
  // 响应课程工具栏发出的打开动作。
  function handleOpenCourse() {
    console.info('打开 React 基础课程')
  }

  return <CourseAction title="React 基础课程" onOpenCourse={handleOpenCourse} />
}
```

`onOpenCourse` 不会因为名字以 `on` 开头就自动变成浏览器事件。`CourseAction` 必须显式调用它，或像示例
一样把它传给内部按钮的 `onClick`。

### 3. 领域动作通常不暴露 DOM 事件

调用方只关心“打开课程”时，`onOpenCourse: () => void` 比接收点击事件更清楚。这样，组件内部以后即使
更换交互元素，调用方的合同也不需要依赖按钮节点。

只有调用方确实需要读取点击事件时，才把 React 事件类型放入自定义 prop：

```tsx
import type { MouseEventHandler } from 'react'

type RawClickButtonProps = {
  onActivate: MouseEventHandler<HTMLButtonElement>
}

// 原样转交按钮点击事件。
function RawClickButton({ onActivate }: RawClickButtonProps) {
  return <button onClick={onActivate}>执行</button>
}
```

这两种合同表达不同意图：`() => void` 表达领域动作，`MouseEventHandler<HTMLButtonElement>` 表达调用方
需要按钮点击事件。

## 五、React 事件对象

### 1. handler 的第一个参数

事件发生后，React 会把一个 React 事件对象传给 handler。这个对象也称 SyntheticEvent。它提供应用常用的
事件字段和方法，例如：

| 成员 | 含义 |
| --- | --- |
| `type` | 事件类型，例如 `click` |
| `target` | 最初触发事件的对象 |
| `currentTarget` | 当前 handler 所绑定的元素 |
| `eventPhase` | 当前事件阶段 |
| `cancelable` | 默认动作是否允许取消 |
| `defaultPrevented` | 默认动作是否已经被取消 |
| `stopPropagation()` | 阻止事件继续传播 |
| `preventDefault()` | 请求取消可取消的默认动作 |

```tsx
import type { MouseEvent } from 'react'

// 输出当前按钮点击事件的公共信息。
function handleInspect(event: MouseEvent<HTMLButtonElement>) {
  console.info({
    type: event.type,
    target: event.target,
    currentTarget: event.currentTarget,
    defaultPrevented: event.defaultPrevented,
  })
}
```

React 事件对象不是原生事件对象本身。需要访问底层事件时可以读取 `nativeEvent`，但 React 事件与原生事件
之间的具体映射不是公共合同。业务判断应优先使用 React 事件对象公开的字段和方法。

### 2. 事件字段描述的是一次派发过程

同一个 click 传播到不同 handler 时，`target` 保持指向最初触发事件的对象，而 `currentTarget` 表示当前
正在运行的 handler 所在元素。因此多个 handler 可以看到相同的 `target`，但看到不同的
`currentTarget`。

事件对象不是组件的 Props，也不是任意业务数据容器。它描述当前交互，包括事件来自哪里、正在由谁处理、
是否还会传播以及默认动作是否已被取消。

## 六、target 与 currentTarget

### 1. 点击嵌套元素时两者可能不同

考虑按钮内部包含一个 `<span>`：

```tsx
import type { MouseEvent } from 'react'

// 比较最初触发节点和当前 handler 所在按钮。
function handleInspectTarget(event: MouseEvent<HTMLButtonElement>) {
  console.info('target:', event.target)
  console.info('currentTarget:', event.currentTarget)
}

// 展示带嵌套文字节点的按钮。
function InspectButton() {
  return (
    <button data-course-id="react-basics" onClick={handleInspectTarget}>
      <span>查看课程</span>
    </button>
  )
}
```

点击按钮空白区域时，`target` 可能是按钮；点击文字时，`target` 可能是内部 `span`。无论点击按钮的哪个
后代，按钮 handler 中的 `currentTarget` 都是这个按钮。

### 2. 读取绑定元素时使用 currentTarget

如果业务数据放在按钮的 `data-course-id` 上，应从 `currentTarget` 读取：

```tsx
import type { MouseEvent } from 'react'

// 从当前按钮读取课程 ID。
function handleOpenCourse(event: MouseEvent<HTMLButtonElement>) {
  const courseId = event.currentTarget.dataset.courseId
  console.info(courseId)
}
```

TypeScript 也体现了这个差异。`MouseEvent<HTMLButtonElement>` 中，`currentTarget` 包含
`HTMLButtonElement` 类型；`target` 主要保持为通用的 `EventTarget`，因为它可能是按钮内部任意后代。

### 3. 根据问题选择字段

- 问“用户最初点中了哪个节点”时读取 `target`。
- 问“当前是哪个已注册 handler 的元素在处理事件”时读取 `currentTarget`。
- 问“当前按钮携带什么属性或数据”时通常读取 `currentTarget`。

不要先断言 `target` 一定是某种元素，再依赖断言读取按钮字段。嵌套图标、文本容器或其他后代都会让这个
假设失效。

## 七、使用 TypeScript 标注事件处理函数

### 1. 内联 handler 通常自动推断

函数直接写在 `onClick` 中时，TypeScript 从 `button` 的事件 prop 推断 `event` 类型：

```tsx
// 展示能够自动推断点击事件类型的按钮。
function InferredButton() {
  return (
    <button
      onClick={
        // 输出由 TypeScript 识别为按钮元素的当前目标文本。
        (event) => {
          console.info(event.currentTarget.textContent)
        }
      }
    >
      查看按钮文本
    </button>
  )
}
```

自动推断依赖函数所在的上下文。把函数抽到 JSX 外部后，参数通常需要显式类型。

### 2. 标注事件参数

抽取按钮点击 handler 时，可以标注 `MouseEvent<HTMLButtonElement>`：

```tsx
import type { MouseEvent } from 'react'

// 读取被点击按钮的名称。
function handleButtonClick(event: MouseEvent<HTMLButtonElement>) {
  console.info(event.currentTarget.name)
}

// 展示已抽取点击处理函数的按钮。
function NamedButton() {
  return (
    <button name="open-course" onClick={handleButtonClick}>
      打开课程
    </button>
  )
}
```

这里的 `MouseEvent` 来自 React 类型，不是浏览器全局的 `MouseEvent` 构造器。泛型参数描述
`currentTarget` 对应的元素类型。

### 3. 标注完整函数类型

也可以给整个函数值标注 `MouseEventHandler<HTMLButtonElement>`：

```tsx
import type { MouseEventHandler } from 'react'

// 处理按钮的课程打开操作。
const handleOpenCourse: MouseEventHandler<HTMLButtonElement> = (event) => {
  console.info(event.currentTarget.dataset.courseId)
}
```

两种写法都能约束事件参数：

- `MouseEvent<HTMLButtonElement>` 标注参数。
- `MouseEventHandler<HTMLButtonElement>` 标注完整函数。

选择与当前代码最容易阅读的写法即可，不要使用 `any` 绕过事件对象的类型合同。

## 八、click 的 capture、target 与 bubble

### 1. 三个教学阶段

对常见 click，可以按以下顺序理解：

1. **capture：** 祖先的 `onClickCapture` 从外向内运行。
2. **target：** 实际点击目标对应的 `onClick` 运行。
3. **bubble：** 普通 `onClick` 从目标向祖先逐层运行。

React 中，capture 版本通过事件名后加 `Capture` 表示，例如 `onClickCapture`。

```tsx
import type { MouseEvent } from 'react'

// 记录父级 capture 阶段。
function handlePanelCapture() {
  console.info('1. 父级 capture')
}

// 记录按钮 target 阶段。
function handleButtonClick() {
  console.info('2. 按钮 target')
}

// 记录父级 bubble 阶段。
function handlePanelBubble(event: MouseEvent<HTMLElement>) {
  console.info(`3. 父级 bubble：${event.currentTarget.dataset.node}`)
}

// 展示 click 的三个阶段。
function CoursePanel() {
  return (
    <section
      data-node="课程面板"
      onClick={handlePanelBubble}
      onClickCapture={handlePanelCapture}
    >
      <button onClick={handleButtonClick}>打开课程</button>
    </section>
  )
}
```

点击按钮后，控制台依次输出 `1`、`2`、`3`。capture 先到达目标，普通 `onClick` 再从目标向外传播。

### 2. 传播路径不等于组件调用关系

事件传播描述的是这次事件经过的 React 元素树路径。它不表示父组件函数调用了子组件函数，也不表示事件
会按组件源码中函数声明的顺序执行。判断传播时，应查看 handler 实际绑定在哪些元素上。

### 3. click 结论不能推广到所有事件

三阶段示例明确讨论 click。React 的 `onScroll` 是重要例外：它不会从后代冒泡到祖先，只在绑定它的
元素上工作。因此需要观察哪个滚动区域，就把 `onScroll` 直接绑定到那个元素。

## 九、使用 stopPropagation 控制传播

### 1. 停止后续传播

在目标 handler 中调用 `event.stopPropagation()`，可以阻止事件继续到达后续祖先的普通
`onClick`：

```tsx
import type { MouseEvent } from 'react'

// 处理删除动作并阻止父级 click 响应。
function handleDelete(event: MouseEvent<HTMLButtonElement>) {
  event.stopPropagation()
  console.info('删除课程')
}

// 响应课程卡片整体点击。
function handleCardClick() {
  console.info('打开课程详情')
}

// 展示需要隔离内部删除动作的课程卡片。
function CourseCard() {
  return (
    <article onClick={handleCardClick}>
      <h2>React 基础</h2>
      <button onClick={handleDelete}>删除</button>
    </article>
  )
}
```

点击删除按钮时，`handleDelete` 运行，父级 `handleCardClick` 不再运行。这种停止应当服务于明确的组件
交互边界，而不是用来掩盖不清楚的事件设计。

### 2. 已完成的 capture 不会被撤销

如果父级 `onClickCapture` 已先运行，目标 handler 再调用 `stopPropagation()`，先前产生的 capture 结果
不会被撤销。调用 stop 影响的是之后尚未到达的传播位置。

同样，capture 也不是无条件到达所有目标的旁路。如果更上游的 capture handler 已经停止传播，事件不会
继续到达后面的 capture、target 和 bubble handler。

### 3. stop 不取消默认行为

`stopPropagation()` 只控制传播路径。点击带 `href` 的链接时，即使传播停止，链接默认导航仍可能发生。
需要控制默认动作时，应单独判断是否调用 `preventDefault()`。

## 十、使用 preventDefault 控制默认行为

### 1. 什么是默认行为

某些浏览器事件除了调用 JavaScript handler，还带有浏览器自己的动作。例如，激活带 `href` 的链接会
跟随超链接。React handler 与浏览器默认动作是两件事。

### 2. 取消可取消的默认动作

对允许取消的事件调用 `event.preventDefault()`，可以请求浏览器不执行默认动作：

```tsx
import type { MouseEvent } from 'react'

// 保留预览点击响应，但阻止链接改变当前地址。
function handlePreview(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault()
  console.info(`默认动作已取消：${event.defaultPrevented}`)
}

// 展示带真实地址但由 handler 取消导航的链接。
function PreviewLink() {
  return (
    <a href="#course-preview" onClick={handlePreview}>
      预览课程
    </a>
  )
}
```

事件的 `cancelable` 表示默认动作是否允许取消。成功取消后，`defaultPrevented` 为 `true`。如果事件没有
可取消的默认动作，调用 `preventDefault()` 也不会凭空创造一个动作。

### 3. prevent 不停止传播

`preventDefault()` 不会改变事件的传播路径。链接位于带 `onClick` 的父元素内时，链接 handler 调用
prevent 后，父级 bubble handler 仍然可以运行，并能读到 `event.defaultPrevented === true`。

React 不把 handler 返回的 `false` 解释为取消传播或默认动作。需要控制哪条行为，就显式调用对应方法。

## 十一、传播与默认行为是两条控制链

`stopPropagation()` 与 `preventDefault()` 可以独立使用，也可以在确实同时需要时一起使用：

| 操作 | 后续祖先 handler | 浏览器默认动作 |
| --- | --- | --- |
| 都不调用 | 继续传播 | 正常执行 |
| 只调用 `stopPropagation()` | 停止后续传播 | 仍可能执行 |
| 只调用 `preventDefault()` | 继续传播 | 取消可取消的动作 |
| 两者都调用 | 停止后续传播 | 取消可取消的动作 |

选择方法时先问两个独立问题：

1. 是否需要让后续祖先 handler 继续收到事件？
2. 是否需要让浏览器继续执行这个事件的默认动作？

不要因为一个按钮位于可点击卡片中就默认停止所有传播，也不要对没有默认动作的普通按钮机械调用
`preventDefault()`。方法应对应明确的交互合同。

## 十二、render 与事件执行的时机边界

render 负责计算界面，事件 handler 负责响应已经发生的用户操作。由用户明确触发的日志、通知、打开链接
或调用业务回调，可以放在对应 handler 中；这些逻辑不能通过 `handler()` 提前放进 render。

```tsx
// 发送用户主动触发的课程分享请求。
function shareCourse() {
  console.info('分享课程')
}

// 把分享操作留到按钮点击后执行。
function ShareButton() {
  return <button onClick={shareCourse}>分享课程</button>
}
```

判断代码位置时只需检查触发原因：如果工作是由这次点击触发，就放在这次点击的 handler 中；如果用户尚未
操作，render 不应提前执行这段交互逻辑。

## 十三、可运行示例：传播与默认行为

下面的示例用三个交互对照事件控制：

- “普通传播”依次显示父级 capture、按钮 target 和父级 bubble。
- “阻止冒泡”仍先显示父级 capture，但按钮调用 stop 后不再出现父级 bubble。
- “阻止默认导航”调用 prevent，地址不会改变，但父级 bubble 仍然运行。
- 点击按钮内部文字时，对话框会显示 `target` 与 `currentTarget` 的差异。

:::demo{id="react.core.learn.basics.event-handling.propagation-control-demo"}
:::

示例中的对话框是观察事件顺序和字段的输出方式。每次点击都从父级 capture 开始，不依赖其他知识来保存
交互轨迹。

## 十四、易错使用提示

:::pitfalls
### 错误：在 render 时调用 handler

**触发条件：** 把事件 prop 写成 `onClick={openCourse()}`。

**原因：** JSX 花括号会立即计算函数调用表达式。

**后果：** 用户点击前操作已经执行，`onClick` 得到的还是函数返回值。

**错误示例：**

~~~~tsx
// 执行课程打开操作。
function openCourse() {
  console.info('打开课程')
}

// 错误：render 时立即调用函数。
function BrokenButton() {
  return <button onClick={openCourse()}>打开课程</button>
}
~~~~

**正确写法：** 把函数本身交给事件 prop。

~~~~tsx
// 执行课程打开操作。
function openCourse() {
  console.info('打开课程')
}

// 正确：点击后 React 才调用函数。
function WorkingButton() {
  return <button onClick={openCourse}>打开课程</button>
}
~~~~

**验证方式：** 初次 render 不输出“打开课程”，点击一次后只输出一次。

### 错误：包装函数只返回目标函数

**触发条件：** 写成 `onClick={() => openCourse}`。

**原因：** 箭头函数体只是返回 `openCourse`，没有调用它。

**后果：** React 调用了包装函数，但业务操作没有执行。

**错误示例：**

~~~~tsx
// 错误：点击后只返回函数值。
function BrokenWrapper() {
  return (
    <button
      onClick={
        // 错误地只返回目标函数，演示遗漏调用的后果。
        () => openCourse
      }
    >
      打开课程
    </button>
  )
}
~~~~

**正确写法：** 在包装函数中显式调用目标函数。

~~~~tsx
// 正确：点击后调用目标函数。
function WorkingWrapper() {
  return (
    <button
      onClick={
        // 点击后调用目标函数。
        () => openCourse()
      }
    >
      打开课程
    </button>
  )
}
~~~~

**验证方式：** 点击一次后，目标函数执行一次。

### 错误：从 target 读取按钮字段

**触发条件：** 按钮包含 `span` 或图标，却把 `event.target` 当成按钮。

**原因：** `target` 是最初触发事件的节点，可能是按钮后代。

**后果：** 类型断言不可靠，按钮的 `dataset`、`name` 等字段可能读取失败。

**错误示例：**

~~~~tsx
import type { MouseEvent } from 'react'

// 错误：断言最初触发节点一定是按钮。
function handleOpen(event: MouseEvent<HTMLButtonElement>) {
  const button = event.target as HTMLButtonElement
  console.info(button.dataset.courseId)
}
~~~~

**正确写法：** 从已知为 handler 绑定元素的 `currentTarget` 读取。

~~~~tsx
import type { MouseEvent } from 'react'

// 正确：从当前按钮读取课程 ID。
function handleOpen(event: MouseEvent<HTMLButtonElement>) {
  console.info(event.currentTarget.dataset.courseId)
}
~~~~

**验证方式：** 分别点击按钮空白区域和内部文字，课程 ID 都能正确读取。

### 错误：混淆 stopPropagation 与 preventDefault

**触发条件：** 想阻止链接导航却只调用 stop，或想隔离父级点击却只调用 prevent。

**原因：** 两个方法控制不同的行为链。

**后果：** 传播或默认动作中仍有一项按原行为继续。

**错误示例：**

~~~~tsx
import type { MouseEvent } from 'react'

// 错误：停止传播并不能取消链接导航。
function handlePreview(event: MouseEvent<HTMLAnchorElement>) {
  event.stopPropagation()
}
~~~~

**正确写法：** 根据目标显式调用对应方法。

~~~~tsx
import type { MouseEvent } from 'react'

// 正确：取消链接默认导航，但允许事件继续传播。
function handlePreview(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault()
}
~~~~

**验证方式：** 同时观察父级 handler 是否运行，以及地址是否发生变化。

### 错误：自定义 handler prop 没有被使用

**触发条件：** 组件接收 `onOpenCourse`，但既不调用也不转交。

**原因：** 自定义 prop 只是普通组件输入，不会自动注册浏览器事件。

**后果：** 调用方提供的动作永远不会执行。

**错误示例：**

~~~~tsx
// 错误：接收了回调，却没有连接任何交互。
function CourseAction({ onOpenCourse }: { onOpenCourse: () => void }) {
  return <div>课程操作</div>
}
~~~~

**正确写法：** 在组件内部调用回调，或传给真实交互元素。

~~~~tsx
// 正确：把领域动作连接到语义按钮。
function CourseAction({ onOpenCourse }: { onOpenCourse: () => void }) {
  return <button onClick={onOpenCourse}>打开课程</button>
}
~~~~

**验证方式：** 点击内部按钮一次，调用方回调执行一次。

### 错误：把 click 的冒泡结论用于所有事件

**触发条件：** 只给祖先绑定 `onScroll`，期望收到后代元素的滚动事件。

**原因：** React 的 `onScroll` 不会从后代冒泡到祖先。

**后果：** 内层区域滚动时，预期 handler 没有运行。

**错误示例：**

~~~~tsx
// 记录当前元素触发的滚动事件。
function handleScroll() {
  console.info('滚动')
}

// 错误：不能依靠祖先接收后代的 onScroll。
function ScrollPanel() {
  return <section onScroll={handleScroll}><div>滚动区域</div></section>
}
~~~~

**正确写法：** 把 handler 直接绑定到需要观察的滚动元素。

~~~~tsx
// 记录当前元素触发的滚动事件。
function handleScroll() {
  console.info('滚动')
}

// 正确：直接观察实际滚动区域。
function ScrollPanel() {
  return <div onScroll={handleScroll}>滚动区域</div>
}
~~~~

**验证方式：** 滚动目标元素时，它自身的 handler 运行。

### 错误：把 capture 当成不会被阻止的旁路

**触发条件：** 假设任意祖先 `onClickCapture` 都一定能收到后代 click。

**原因：** capture 仍然按路径从外向内传播；更上游停止传播后，后续位置不会收到事件。

**后果：** 依赖该假设的记录或业务逻辑可能不执行。

**错误示例：**

~~~~tsx
import type { MouseEvent } from 'react'

// 在外层 capture 阶段停止事件继续传播。
function handleOuterCapture(event: MouseEvent<HTMLElement>) {
  event.stopPropagation()
}

// 记录到达内层元素的 capture 事件。
function handleInnerCapture() {
  console.info('内层 capture')
}

// 错误：假设内层 capture 仍然一定执行。
function NestedPanel() {
  return (
    <section onClickCapture={handleOuterCapture}>
      <div onClickCapture={handleInnerCapture}>内容</div>
    </section>
  )
}
~~~~

**正确写法：** 把 capture 看作传播路径的一部分，并明确所有可能停止传播的位置。

~~~~tsx
// 记录外层 capture，但允许事件继续进入目标。
function handleOuterCapture() {
  console.info('外层 capture')
}

// 记录到达内层元素的 capture 事件。
function handleInnerCapture() {
  console.info('内层 capture')
}

// 正确：没有上游 stop 时，事件继续到达内层。
function NestedPanel() {
  return (
    <section onClickCapture={handleOuterCapture}>
      <div onClickCapture={handleInnerCapture}>内容</div>
    </section>
  )
}
~~~~

**验证方式：** 分别在外层调用和不调用 stop，检查内层 capture 与目标 handler 是否运行。
:::

## 十五、原理与适用场景

### 1. 先定义事件合同

为一个交互编写代码时，可以按以下顺序判断：

1. 交互应由哪种语义 HTML 元素表达。
2. 使用的是 React DOM 内置事件 prop，还是自定义组件的领域动作 prop。
3. 调用方需要 DOM 事件对象，还是只需要 `() => void` 回调。
4. 读取的是最初触发节点，还是当前 handler 所在元素。
5. 是否真的需要阻止后续传播。
6. 是否存在需要取消的浏览器默认动作。

这些问题把“事件发生”“组件动作”“传播路径”和“浏览器行为”分开，能减少互相替代造成的错误。

### 2. 显式回调可以代替隐含冒泡协作

组件之间需要明确协作时，可以通过 Props 传递领域 handler，并由子组件在合适的位置显式调用。这样调用链
可以从组件接口中直接读出，不必依赖某个 DOM 层级恰好发生冒泡。

### 3. 只依赖公共事件表面

应用可以依赖 React 公开的事件字段、方法和类型。`nativeEvent` 的具体映射、React 在内部怎样保存 listener、
怎样选择宿主监听位置，都不属于组件事件合同。使用公共表面能够让业务代码保持清楚和稳定。

## 十六、练习

:::exercise
### 实现课程操作区

**要求：** 创建一个父级课程卡片和三个内部操作：普通“打开”按钮、“删除”按钮和带真实 `href` 的“预览”
链接。父级同时提供 `onClickCapture` 与 `onClick`；普通按钮允许冒泡，删除按钮阻止冒泡，预览链接阻止
默认导航但继续冒泡。按钮内部放置一个 `span`，handler 分别读取 `target` 与 `currentTarget`。自定义
`CourseAction` 通过 `onActivate` 暴露领域动作，并显式连接到内部按钮。所有抽取的点击 handler 使用准确的
React 事件类型，不使用 `any`。

**验收：** 普通按钮顺序为父级 capture、按钮 target、父级 bubble；删除按钮不执行父级 bubble；预览
链接的 `defaultPrevented` 为 `true`，父级 bubble 仍运行；点击按钮内部 `span` 时，`target` 与
`currentTarget` 不同；初次 render 不执行任何操作。
:::

## 十七、本节小结

- 事件 prop 接收函数值；需要参数时传递一个稍后执行的包装函数。
- 自定义组件的 handler prop 是组件合同，必须显式调用或转交。
- React 事件对象提供事件类型、目标、阶段、传播控制和默认行为状态。
- `target` 指向最初触发节点，`currentTarget` 指向当前 handler 所在元素。
- TypeScript 可推断内联 handler；抽取函数时使用准确的 React 事件类型。
- click 的常见顺序是 capture、target、bubble，但不能把这个结论推广到所有事件。
- `stopPropagation()` 控制后续传播，`preventDefault()` 控制可取消的默认动作。
- render 只连接 handler，交互发生后 handler 才执行响应逻辑。

## 十八、参考资料

- [Responding to Events](https://react.dev/learn/responding-to-events)
- [React event object](https://react.dev/reference/react-dom/components/common#react-event-object)
- [Using TypeScript](https://react.dev/learn/typescript#typing-dom-events)
- [`@types/react@19.2.18`](https://cdn.jsdelivr.net/npm/@types/react@19.2.18/index.d.ts)
- [DOM Event](https://dom.spec.whatwg.org/#interface-event)
- [HTML Links](https://html.spec.whatwg.org/multipage/links.html#links-created-by-a-and-area-elements)
- [TypeScript Contextual Typing](https://www.typescriptlang.org/docs/handbook/type-inference.html#contextual-typing)
