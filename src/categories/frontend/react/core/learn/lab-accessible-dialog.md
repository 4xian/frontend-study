---
id: react.core.learn.intermediate.lab-accessible-dialog
type: lesson
title: 实战：可访问对话框
summary: 组合原生 dialog、Portal、Callback Ref 与 ref prop，完成可键盘操作并能恢复焦点的模态对话框。
domain: frontend
technology: react
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 180
prerequisites:
  - react.core.learn.intermediate.dom-refs
  - react.core.learn.intermediate.ref-as-prop
  - react.core.learn.advanced.portal-tree-and-dom-placement
  - react.core.learn.basics.event-handling
  - react.core.learn.basics.use-id-accessible-links
related:
  - react.core.learn.basics.dom-props
  - react.core.learn.intermediate.use-ref
tags:
  - React
  - 实战
  - dialog
  - Portal
  - Callback Ref
  - accessibility
  - focus
appliesTo: React 19.2 与 HTML Living Standard
verifiedAt: 2026-08-16
objectives:
  - 能把 accessible name、初始焦点、背景不可交互、键盘退出和关闭后焦点恢复写成对话框合同。
  - 能区分 Portal 的 DOM 落点职责与原生 dialog 的 modal、top layer、inert 和焦点职责。
  - 能使用 aria-labelledby、tabIndex=-1、autoFocus 和合理 DOM 顺序建立可读的对话框结构。
  - 能区分 close()、returnValue、cancel 事件和 close 事件，并按正确时序更新 React State。
  - 能让 React 19 ref prop 转交到 HTMLDialogElement，并用 Callback Ref setup / cleanup 管理节点。
  - 能在不使用 Effect、手写 focus trap 或手动 inert 的情况下完成并验证一个原生模态对话框。
recap:
  - Portal 只改变 React children 的宿主 DOM 落点，showModal() 才开启原生 modal 行为。
  - 原生 modal dialog 通过 top layer、::backdrop、背景 inert 和平台焦点步骤建立模态边界。
  - 可访问名称来自可见标题和 aria-labelledby；dialog 本身不设置 tabindex。
  - 长的结构化内容可以先聚焦带 tabIndex=-1 的标题，按钮顺序继续由正常 DOM 顺序表达。
  - close() 可写入 returnValue，不先触发 cancel；Escape close request 通常先触发 cancel 再触发 close。
  - React 在 close 事件之后撤下 dialog 子树，避免绕过浏览器的关闭和焦点恢复合同。
  - ref prop 必须逐层显式转交，最终 Ref 指向 HTMLDialogElement，而不是 Portal host 或 wrapper。
  - Callback Ref setup 只在节点提交后调用 showModal()，cleanup 只清理失效节点引用，不关闭仍在使用的 dialog。
  - 稳定 Portal host 由 React 渲染和拥有，不在每次 render 中创建或查询目标节点。
  - 模态对话框必须始终提供键盘可用的退出路径和可见焦点，不把 backdrop 点击当成唯一关闭方式。
sources:
  - title: React createPortal
    url: https://react.dev/reference/react-dom/createPortal
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Portal 的 DOM 落点、目标节点前置条件与 React 树语义
  - title: React Common Components ref callback
    url: https://react.dev/reference/react-dom/components/common#ref-callback
    sourceType: official-reference
    appliesTo: React DOM 19.2
    claims:
      - Callback Ref setup、cleanup、callback 更换与开发检查边界
  - title: React v19 ref as a prop
    url: https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop
    sourceType: official-reference
    appliesTo: React 19
    claims:
      - 函数组件直接接收并转交 ref prop
  - title: React Manipulating the DOM with Refs
    url: https://react.dev/learn/manipulating-the-dom-with-refs
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Ref 的提交时机、DOM 操作时机和显式转交
  - title: WHATWG HTML dialog element
    url: https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element
    sourceType: specification
    appliesTo: HTML Living Standard
    claims:
      - showModal、close、returnValue、聚焦步骤和 cancel / close 时序
  - title: WHATWG modal dialogs and inert subtrees
    url: https://html.spec.whatwg.org/multipage/interaction.html#modal-dialogs-and-inert-subtrees
    sourceType: specification
    appliesTo: HTML Living Standard
    claims:
      - modal dialog 的 top layer 与背景 inert 边界
  - title: WAI-ARIA APG Modal Dialog Pattern
    url: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
    sourceType: official-reference
    appliesTo: WAI-ARIA Authoring Practices
    claims:
      - accessible name、初始焦点、键盘路径、可见关闭和焦点返回模式
  - title: WAI-ARIA dialog role
    url: https://w3c.github.io/aria/#dialog
    sourceType: specification
    appliesTo: WAI-ARIA 1.2
    claims:
      - 对话框必须提供可识别名称
  - title: WCAG 2.2 Keyboard
    url: https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html
    sourceType: security-standard
    appliesTo: WCAG 2.2
    claims:
      - 功能必须可由键盘接口操作
  - title: WCAG 2.2 No Keyboard Trap
    url: https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html
    sourceType: security-standard
    appliesTo: WCAG 2.2
    claims:
      - 模态焦点限制必须有可知的键盘退出方式
---

# 实战：可访问对话框

## 一、学习目标

- 把一个模态对话框拆成名称、初始焦点、背景边界、退出方式和关闭后焦点五项可验证合同。
- 用原生 `<dialog>` 和 `showModal()` 获得平台提供的 modal 行为，用 Portal 选择 React 子树的 DOM 落点。
- 用 React 19 `ref` prop 把 Callback Ref 从调用方转交到真正的 `HTMLDialogElement`。
- 用 `close(result)`、`returnValue`、`cancel` 和 `close` 事件表达不同的关闭来源。
- 让对话框在挂载时进入顶层，在关闭事件后撤下，并观察浏览器恢复触发按钮焦点。
- 在桌面、窄屏和键盘操作下检查语义、焦点顺序、背景 inert 和结果 State。

## 二、最终成品

最终成品是一个课程公告发布确认界面。背景区展示固定公告摘要、打开按钮、历史记录按钮和结果区。点击
“预览并发布”后，React 把一个原生 `<dialog>` Portal 到稳定的宿主节点，并在节点提交后的 Callback Ref
中调用 `showModal()`。

对话框包含可见标题、结构化公告摘要、“继续编辑”和“确认发布”两个真实按钮。学习者可以通过以下三条
路径关闭它：

1. 点击“继续编辑”，写入 `continue-editing`。
2. 点击“确认发布”，写入 `publish`。
3. 按 `Escape`，让 close request 经过 `cancel` 后使用空的 `returnValue` 完成关闭。

关闭事件发生后，React 读取 `returnValue` 和当前焦点，再撤下对话框子树。页面显示最近的关闭来源、返回值、
焦点是否回到打开按钮、Escape 请求次数，以及打开模态期间背景按钮是否保持不可操作。

所有数据都在当前页面内存中。这里的“发布”只是一个可观察的界面结果，不发送请求、不写入服务器，也不
处理账号、权限、路由或持久化。

## 三、可访问对话框的五项合同

一个浮在页面上的矩形不自动成为可访问对话框。至少要同时回答五个问题：

| 合同 | 可观察要求 | 本成品的实现 |
| --- | --- | --- |
| 名称 | 辅助技术能读出当前窗口在做什么 | 可见 `h2` 通过 `aria-labelledby` 命名 dialog |
| 初始焦点 | 打开后焦点进入 modal 且起点有意义 | 结构化内容先聚焦 `tabIndex=-1` 的标题 |
| 背景边界 | dialog 以外的页面不能被误操作 | `showModal()` 把同一 Document 背景变成 inert |
| 键盘退出 | 不依赖鼠标也能结束当前 modal | `Escape`、继续编辑和确认发布都可用键盘操作 |
| 关闭后焦点 | 用户知道关闭后回到哪里 | 浏览器尝试把焦点恢复到触发按钮，Demo 记录结果 |

这五项是一个整体。只有标题没有焦点策略，屏幕阅读器用户仍可能落在页面背景；只有焦点陷阱而没有退出
键，用户仍然无法完成操作；只有半透明 backdrop，也不能阻止背景交互。

## 四、先区分三层职责

### 1. React 树层

React 组件树决定谁持有打开 State、谁处理按钮事件、谁接收 Context 和 Ref。`AccessibleDialog` 仍然是
触发界面的 React 子树，即使其宿主 DOM 被 Portal 到另一个节点。

### 2. DOM 放置层

`createPortal(children, host)` 只把 children 生成的 DOM 放入 `host`。它不创建 modal、不提供遮罩、不让
背景变 inert，也不负责焦点恢复。`host` 必须先存在，而且在一个对话框周期内保持同一个 DOM 对象。

### 3. 浏览器 modal 层

`HTMLDialogElement.showModal()` 才是原生 modal 行为的入口。调用成功后，dialog 进入 top layer，有
`::backdrop`，同一文档中的其余连接节点进入 inert 边界，浏览器运行 dialog focusing steps。

因此本实战的分工是：React 决定子树何时存在，Portal 选择宿主落点，原生 dialog 负责 modal 语义和平台焦点
边界。

## 五、原生 `<dialog>` 的最小模型

### 1. 普通存在与 modal 打开

`<dialog>` 可以作为普通 DOM 节点存在，也可以通过 `show()` 以非模态方式打开，或通过 `showModal()` 以
模态方式打开。本实战只使用 `showModal()`：

```tsx
const dialog = dialogNodeRef.current

if (dialog && !dialog.open) {
  dialog.showModal()
}
```

`dialog.open` 是当前原生元素是否处于打开状态的浏览器事实。它不是 React 的业务 State，也不应该在 State
中再保存一份 `isOpen` 镜像。这里的 React `isDialogRendered` 表示“是否把 dialog 子树交给 render”，而
`dialog.open` 表示“浏览器当前是否已经打开它”。

### 2. `showModal()` 提供什么

调用成功后，浏览器会：

- 把 dialog 放进 top layer；
- 提供可样式化的 `::backdrop`；
- 让同一 `Document` 中 dialog 及其后代之外的连接节点变成 inert；
- 记录打开前的焦点候选；
- 执行 dialog focusing steps，并尊重内部的 `autofocus`。

这些都是浏览器行为，不是 CSS 的 `z-index`、React Portal 或半透明背景模拟出来的效果。

### 3. 连接前置条件

`showModal()` 必须在 dialog 已经由 React 提交并连接后调用。render 期间只有 JSX 描述，没有可安全操作的
节点；Callback Ref setup 正好发生在节点接入之后：

```tsx
function connectDialog(dialog: HTMLDialogElement | null) {
  if (dialog === null) return
  if (!dialog.open) dialog.showModal()
}
```

代码中的 `null` 分支不是异常，而是节点移除或 Ref 连接变化的正常信号。

### 4. 不把 `open` 当成 React 属性镜像

关闭不能通过直接渲染 `open={false}` 或移除 `open` 属性完成。这样会绕过原生关闭算法，可能没有正常的
`close` 事件和焦点恢复。正确的关闭边界是先调用 `dialog.close(result)`，等原生 `close` 事件到达后再让
React 停止渲染 dialog。

## 六、可读名称与结构化内容

### 1. `aria-labelledby` 连接可见标题

原生 `<dialog>` 提供 dialog 语义和 modal 状态，但仍需要可识别名称。用 `useId` 为每个实例生成唯一前缀，
再让可见标题承担名称来源：

```tsx
const id = useId()
const titleId = `${id}-title`

<dialog aria-labelledby={titleId}>
  <h2 id={titleId}>确认发布课程公告</h2>
</dialog>
```

这样标题既对人可见，也成为辅助技术读取的名称。不要只依赖 CSS、占位文字或不可见的说明来命名窗口。

### 2. 为什么不重复写 role 和 aria-modal

当前实现使用真正的原生 `<dialog>`，并通过 `showModal()` 打开它。因此不再额外写
`role="dialog"` 或 `aria-modal="true"`。重复声明不是本实战需要的合同，反而容易让作者误以为 ARIA
属性本身已经提供 top layer、inert 和焦点管理。

如果使用普通 `<div>` 自定义 dialog，则需要另行承担完整的 ARIA 和焦点管理责任；那是另一种实现，不是本
实战的代码路径。

### 3. 何时省略 `aria-describedby`

短句描述可以用 `aria-describedby` 连接，但结构化内容、列表或表格若被整个拼成一段朗读文本，可能降低
理解效率。本实战的公告摘要包含多个带标签的字段，因此只用标题命名，正文和 `dl` 保持正常的结构化阅读。

## 七、初始焦点与键盘顺序

### 1. 长内容先聚焦标题

对包含多段内容的确认对话框，首次焦点放到标题更容易让用户先理解当前窗口，而不是直接跳到危险操作按钮。
标题不是普通 Tab 控件，因此使用 `tabIndex={-1}`：

```tsx
<h2 id={titleId} tabIndex={-1} autoFocus>
  确认发布课程公告
</h2>
```

`tabIndex={-1}` 允许脚本或浏览器聚焦标题，但不会把它加入常规 Tab 顺序。不要把 `tabIndex={-1}` 设置在
`<dialog>` 自身；平台对 dialog 元素本身有专门的聚焦规则。

### 2. DOM 顺序表达操作顺序

标题后是公告字段，最后是两个按钮：

```text
h2 标题
  -> 公告摘要
  -> 继续编辑
  -> 确认发布
```

Tab 和 Shift+Tab 依赖这个真实 DOM 顺序。不要用正数 `tabindex` 人为重排，也不要用 CSS 把视觉顺序改成
与阅读顺序相反的样子。

### 3. Escape 与可见关闭按钮

Escape 是原生 modal 的 close request，能让键盘用户退出，但不能代替可见按钮。按钮必须是真实的
`<button type="button">`，而不是绑定 click 的普通容器。两个按钮都可通过 Tab 到达，并且各自表达明确
结果。

Backdrop 只表达模态层级。即使产品决定不允许点击 backdrop 关闭，用户仍可以用 Escape 或按钮离开；如果
产品允许 backdrop 关闭，也不能删除键盘路径。

### 4. 焦点必须可见

不要用 `outline: none` 隐藏焦点，除非同时提供等价且清晰的替代指示。本 Demo 为标题和按钮保留明显的
`focus-visible` 轮廓，并在小屏幕下让对话框正文滚动而不是裁切焦点目标。

## 八、关闭、返回值与两个事件

### 1. 显式按钮调用 `close(result)`

按钮关闭时只发起原生关闭命令：

```tsx
function handleChoose(result: DialogResult) {
  dialogNodeRef.current?.close(result)
}
```

`close('publish')` 会关闭 dialog 并把 `returnValue` 设为 `publish`。`close('continue-editing')` 同理。它
不会先触发 `cancel`，因为 `cancel` 表示可取消的 close request，而不是所有关闭动作的总事件。

### 2. Escape 先经过 `cancel`

Escape 产生 close request。`cancel` 可取消且不冒泡；本 Demo 不调用 `preventDefault()`，所以默认关闭继续
执行。每次 Escape 让计数加一，但不写入业务结果：

```text
Escape -> cancel -> 浏览器关闭 -> close
```

如果在练习中调用 `event.preventDefault()`，序列会停在 `cancel`，dialog 必须保持打开。

### 3. `close` 是完成边界

`close` 事件表示原生 dialog 已经关闭，不可取消且不冒泡。React 的 `onClose` 处理器在这里读取：

- `dialog.returnValue`：空字符串表示本 Demo 的 Escape 关闭；
- `document.activeElement`：检查焦点是否回到触发按钮；
- 当前结果：用于页面状态区显示。

处理器完成这些观察后，才把 `isDialogRendered` 设为 `false`。这样 React 不会先删节点，再猜测浏览器是否
已经完成焦点恢复。

### 4. 焦点恢复不是手动补偿

`showModal()` 会记录打开前的焦点，关闭算法会尝试把焦点恢复到该元素。Demo 的触发按钮在三条关闭路径中
始终保留，因此可以直接观察 `document.activeElement === triggerButtonRef.current`。

这不是“永远手动 focus 原按钮”的通用规则。若原按钮已经删除，或关闭后工作流有更合理的后继目标，应按
具体流程选择 fallback。本 Demo 不实现触发器消失的例外，只保留判断原则。

## 九、最小 State 与 Ref 边界

### 1. State 只保存页面需要显示的事实

```tsx
const [portalHost, setPortalHost] = useState<HTMLDivElement | null>(null)
const [isDialogRendered, setIsDialogRendered] = useState(false)
const [cancelCount, setCancelCount] = useState(0)
const [lastOutcome, setLastOutcome] = useState<CloseOutcome | null>(null)
```

`portalHost` 是 Callback Ref 发布的当前容器；`isDialogRendered` 表达 React 是否应包含子树；
`cancelCount` 和 `lastOutcome` 是给用户观察的结果。

不要再保存 `isModal`、`isInTopLayer`、`backgroundIsInert`、`activeElementId` 或
`dialogReturnValue` 的实时副本。它们要么是浏览器事实，要么是关闭后一次性观察值。

### 2. 对象 Ref 保存命令式节点

```tsx
const triggerButtonRef = useRef<HTMLButtonElement | null>(null)
const dialogNodeRef = useRef<HTMLDialogElement | null>(null)
```

触发按钮 Ref 用于验证焦点恢复；dialog Ref 用于按钮事件调用 `close()`。节点引用不会进入普通 State，
修改 `current` 也不需要因为节点本身变化而重新渲染。

### 3. 稳定 host 由 React 拥有

```tsx
const [portalHost, setPortalHost] = useState<HTMLDivElement | null>(null)

return <div ref={setPortalHost} />
```

State setter 身份稳定，可以直接作为 Callback Ref。宿主第一次提交后才得到真实节点，下一次 render 才有
资格调用 `createPortal`。宿主的创建、连接和移除属于外层组件，Dialog 不偷偷 append 到 `document.body`。

## 十、React 19 ref prop 与 Callback Ref

### 1. 组件接口直接声明 ref

React 19 函数组件可以把 `ref` 写进 Props：

```tsx
type AccessibleDialogProps = {
  host: HTMLDivElement
  ref?: Ref<HTMLDialogElement>
  onCancel: () => void
  onClose: (dialog: HTMLDialogElement) => void
}
```

这个 `ref` 仍然只是一个待转交的连接合同。组件不会因为名字叫 `ref` 就自动把它连接到任意后代。

### 2. 最终连接到 `<dialog>`

```tsx
function AccessibleDialog({ host, ref, onCancel, onClose }: AccessibleDialogProps) {
  return createPortal(
    <dialog ref={ref} onCancel={onCancel} onClose={handleClose}>
      {/* title, summary and buttons */}
    </dialog>,
    host,
  )
}
```

调用方拿到的是 `HTMLDialogElement`，不是 Portal host、外层 `section` 或自定义命令式句柄。每一层组件都
必须明确自己的 Ref 公开目标。

### 3. setup 的打开保护

Callback Ref setup 只做两件事：保存当前节点，并在节点尚未打开时调用 `showModal()`：

```tsx
const connectDialog: RefCallback<HTMLDialogElement> = (dialog) => {
  if (dialog === null) return

  dialogNodeRef.current = dialog
  if (!dialog.open) dialog.showModal()

  return () => {
    if (dialogNodeRef.current === dialog) dialogNodeRef.current = null
  }
}
```

`dialog.open` guard 很重要。React 19 的 Callback Ref 在开发检查或 callback 身份变化时可能经历额外的
setup / cleanup；无条件重复调用 `showModal()` 会把正常检查误当成第二次打开。

### 4. cleanup 不调用 `close()`

cleanup 的职责是撤销当前节点的 Ref 连接。它不能顺手调用 `close()`，因为 callback 更换和 Strict Mode
检查也会触发 cleanup，此时 dialog 可能仍然应该保持打开。正常 UI 关闭已经由按钮的 `close()` 或 Escape
close request 完成，随后 `close` 事件才让 React 撤下子树。

### 5. 避免隐式返回节点赋值

以下写法会返回赋值结果：

```tsx
// 错误：返回值不是 void 或 cleanup 函数。
ref={(dialog) => (dialogNodeRef.current = dialog)}
```

使用块函数体，明确只返回 cleanup：

```tsx
ref={(dialog) => {
  dialogNodeRef.current = dialog
}}
```

本 Demo 的连接器进一步在非空节点时打开 modal，并在 cleanup 中进行对象相等检查。

## 十一、无 Effect 的事件与提交时机

### 1. 每个动作都有更窄的时机

| 动作 | 时机 | 连接的能力 |
| --- | --- | --- |
| 取得 host | host Callback Ref 收到节点 | `useState` setter |
| 打开 modal | dialog Callback Ref setup | `showModal()` |
| 显式关闭 | 用户点击按钮 | 对象 Ref + `close(result)` |
| 处理 Escape | dialog `cancel` 事件 | `onCancel` |
| 读取结果 | dialog `close` 事件 | `onClose` + State |
| 清理节点 | Callback Ref cleanup | 对象相等检查 |

这些动作都有明确的 DOM 提交或用户事件边界，因此不需要额外渲染一个隐藏状态再搜索节点。这里的结论是
当前实现的边界，不是说所有外部对话框同步都永远不需要 Effect。

### 2. 首次提交序列

```text
render: portalHost=null, dialog 不存在
  -> host commit
  -> setPortalHost(host)
  -> render: host 存在，dialog 仍不存在
```

用户点击打开后才进入第二段：

```text
setIsDialogRendered(true)
  -> Portal render
  -> dialog commit
  -> Callback Ref setup
  -> showModal()
```

### 3. 关闭序列

显式按钮的序列是：

```text
button click
  -> dialog.close(result)
  -> 浏览器关闭并尝试恢复焦点
  -> close
  -> 读取 returnValue 和 activeElement
  -> setIsDialogRendered(false)
  -> Callback Ref cleanup
```

Escape 则多出一个可取消的 close request：

```text
Escape -> cancel -> close -> React onClose -> cleanup
```

如果 `cancel` handler 调用了 `preventDefault()`，序列停在 `cancel`，React 不应撤下子树。

## 十二、实现顺序

### 1. 先固定类型和数据

```tsx
type DialogResult = 'continue-editing' | 'publish'

type Announcement = {
  readonly title: string
  readonly audience: string
  readonly summary: string
}
```

结果联合限制 `returnValue` 的业务解释；公告是固定数据，不把与焦点无关的表单 State 混进来。

### 2. 再建立 host 和 Ref

声明 host State、触发按钮对象 Ref、dialog 对象 Ref 和稳定 Callback Ref。先让 host 提交，再根据 host 是否
存在决定是否创建 Portal。

### 3. 接通 `AccessibleDialog`

让组件直接接收 `ref` prop，并把它接到最终 `<dialog>`。事件通过明确的 `onCancel`、`onClose` 和结果回调
回到外层 owner；组件内部不创建新的 Root，也不保存一份打开 State。

### 4. 最后接通关闭边界

按钮只调用 Ref 上的 `close(result)`。`onClose` 读取返回值和焦点后，才改变 React render 条件。这样可以
把平台生命周期和 React 生命周期放在一个容易观察的顺序里。

## 十三、完整运行示例

Demo 使用一个稳定 host、一个原生 dialog 和两个真实按钮，状态区展示每次关闭后的平台结果。源码区与运行
区来自同一组 TSX 与 CSS 文件。

:::demo{id="react.core.learn.intermediate.lab-accessible-dialog.accessible-dialog-demo"}
:::

## 十四、固定操作序列

1. 初始检查：对话框显示“未挂载”，焦点位于“预览并发布”，背景操作计数为 `0`。
2. 点击“预览并发布”：检查出现一个 `<dialog open>`，标题获得焦点，背景按钮无法点击或 Tab 到达。
3. 在 dialog 内按 Tab：焦点依次经过“继续编辑”和“确认发布”，不会进入背景区域；用 Shift+Tab 反向检查。
4. 点击“继续编辑”：检查 `returnValue` 为 `continue-editing`，Escape 计数不增加，焦点回到触发按钮。
5. 再次打开后按 Escape：检查先增加一次 Escape 请求，再得到空 `returnValue`，dialog 撤下且焦点恢复。
6. 再次打开并点击“确认发布”：检查 `returnValue` 为 `publish`，结果区显示已确认发布。
7. 打开后尝试点击“查看历史记录”：背景操作计数不变；关闭后点击它，计数才增加。
8. 重置记录：结果、Escape 计数和背景操作计数回到初始值，Portal host 仍保持同一 DOM 位置。

## 十五、易错使用提示

:::pitfalls
### 把 Portal 当成 modal

**触发条件：** 只调用 `createPortal`，把普通 `<div>` 放到外层容器，就认为背景已经被阻塞。

**原因：** Portal 只改变 DOM 落点；top layer、inert 和 dialog focusing steps 来自
`showModal()`。

**后果：** 背景仍可交互，焦点也可能停留在原页面。

**错误示例：**

```tsx
return createPortal(<div role="dialog">确认发布</div>, host)
```

**正确写法：**

```tsx
return createPortal(<dialog ref={dialogRef}>确认发布</dialog>, host)
```

**验证方式：** 在已提交的 dialog Callback Ref setup 中调用 `showModal()`；检查 DOM 中存在
`<dialog open>`，标题取得焦点，背景按钮不能被点击或 Tab 到达。

### 忘记给 dialog 提供可识别名称

**触发条件：** 只渲染内容和按钮，没有可见标题或 `aria-labelledby`。

**原因：** 原生 modal 状态不替代窗口名称。

**后果：** 辅助技术无法准确区分当前对话框的用途。

**错误示例：**

```tsx
<dialog>
  <p>确认发布？</p>
</dialog>
```

**正确写法：**

```tsx
<dialog aria-labelledby={titleId}>
  <h2 id={titleId}>确认发布课程公告</h2>
</dialog>
```

**验证方式：** 标题可见，`aria-labelledby` 指向当前 dialog 内唯一的标题元素。

### 给 dialog 自身设置 tabIndex

**触发条件：** 为了让窗口可聚焦，写 `<dialog tabIndex={-1}>`。

**原因：** dialog 有平台专门的聚焦步骤，静态内容应通过内部标题或首段承接焦点。

**后果：** 破坏原生 dialog 的预期聚焦模型，并把窗口容器当成内容焦点。

**错误示例：**

```tsx
<dialog tabIndex={-1}>...</dialog>
```

**正确写法：**

```tsx
<dialog aria-labelledby={titleId}>
  <h2 id={titleId} tabIndex={-1} autoFocus>确认发布</h2>
</dialog>
```

**验证方式：** dialog 本身没有 `tabindex` 属性，打开后 activeElement 是内部标题或合理控件。

### 在 render 中调用 showModal

**触发条件：** JSX 计算期间查询或操作 dialog 节点。

**原因：** render 只描述 UI，节点可能尚未提交，也可能属于上一轮实例。

**后果：** 打开时机不稳定，且把 DOM 副作用混入 render。

**错误示例：**

```tsx
if (isOpen) dialogRef.current?.showModal()
return isOpen ? <dialog ref={dialogRef}>...</dialog> : null
```

**正确写法：**

```tsx
const connectDialog: RefCallback<HTMLDialogElement> = (dialog) => {
  if (!dialog) return
  if (!dialog.open) dialog.showModal()
}
```

**验证方式：** 首次 showModal 只发生在 dialog Callback Ref setup，控制台没有未连接节点异常。

### Callback Ref 每次 setup 都无条件打开

**触发条件：** callback 更换或 Strict Mode 检查时，每次收到节点都直接调用 `showModal()`。

**原因：** Ref setup 不保证只执行一次；开发环境可能额外运行 setup / cleanup。

**后果：** 同一个已经打开的 dialog 被重复请求 modal，产生异常或错误的生命周期记录。

**错误示例：**

```tsx
const connect = (dialog: HTMLDialogElement | null) => {
  dialog?.showModal()
}
```

**正确写法：**

```tsx
if (!dialog.open) dialog.showModal()
```

**验证方式：** 开发检查和重复打开后仍只有一个 `<dialog open>`，没有控制台错误。

### 在 Ref cleanup 中关闭 dialog

**触发条件：** Callback Ref 返回的 cleanup 里调用 `dialog.close()`。

**原因：** cleanup 也可能由 callback 身份变化或 Strict Mode 检查触发，而不是仅由用户关闭触发。

**后果：** 仍应显示的 modal 被探测流程提前关闭。

**错误示例：**

```tsx
return () => dialog.close()
```

**正确写法：**

```tsx
return () => {
  if (dialogNodeRef.current === dialog) dialogNodeRef.current = null
}
```

**验证方式：** cleanup 只清理匹配的对象 Ref；关闭命令只出现在按钮或 close request 路径。

### 只设置 React State 就撤下 dialog

**触发条件：** 关闭按钮直接执行 `setIsDialogRendered(false)`。

**原因：** 这样绕过了原生 close、returnValue、关闭事件和焦点恢复。

**后果：** 结果来源丢失，焦点可能留在已移除节点，modal 状态也没有经过平台关闭算法。

**错误示例：**

```tsx
function handleClose() {
  setIsDialogRendered(false)
}
```

**正确写法：**

```tsx
function handleClose(result: DialogResult) {
  dialogNodeRef.current?.close(result)
}
```

**验证方式：** close handler 读取 `returnValue` 后才设置 render 条件为 false。

### 混淆 cancel 和 close

**触发条件：** 把按钮调用 `close()` 解释为一定会先触发 `cancel`，或在 `close` handler 中调用
`preventDefault()`。

**原因：** `cancel` 是可取消的 close request，`close` 是关闭完成事件；按钮的 `close()` 不先经过
`cancel`，且 `close` 不可取消。

**后果：** Escape 统计、显式按钮统计和拦截逻辑全部失真。

**错误示例：**

```tsx
function handleClose(event: React.SyntheticEvent<HTMLDialogElement>) {
  event.preventDefault()
}
```

**正确写法：**

```tsx
function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
  if (shouldKeepOpen) event.preventDefault()
}

function handleClose(event: SyntheticEvent<HTMLDialogElement>) {
  recordResult(event.currentTarget.returnValue)
}
```

**验证方式：** 按钮路径是 `click -> close`，Escape 路径是 `cancel -> close`；阻止 Escape 时只停在
`cancel`。

### 用鼠标遮罩代替键盘退出

**触发条件：** 只监听 backdrop 点击，没有 Escape 或可聚焦的可见关闭按钮。

**原因：** 鼠标路径不能满足键盘操作和无键盘陷阱要求。

**后果：** 键盘用户无法离开模态内容。

**错误示例：**

```tsx
<div className="backdrop" onClick={closeDialog} />
```

**正确写法：**

```tsx
<dialog ref={dialogRef} aria-labelledby={titleId}>
  <h2 id={titleId}>确认发布</h2>
  <button type="button" onClick={() => dialogRef.current?.close('continue-editing')}>
    继续编辑
  </button>
  <button type="button" onClick={() => dialogRef.current?.close('publish')}>
    确认发布
  </button>
</dialog>
```

**验证方式：** 不使用鼠标，只用 Tab、Shift+Tab、Enter 和 Escape 完成打开、确认和退出。
:::

## 十六、源码推导与适用边界

### 1. 官方事实

React 的公开合同把 Portal 定义为改变宿主 DOM 落点的 React node；目标节点必须已存在，React 树中的
Context 和事件关系不因 DOM 落点改变而自动消失。React 19 的函数组件可以直接接收 ref prop，Callback Ref
在节点接入时执行并可返回 cleanup。

HTML Standard 定义了 `<dialog>` 的 `showModal()`、`close()`、`returnValue`、聚焦步骤以及
`cancel` / `close` 事件。`showModal()` 进入 top layer 并使同一文档背景 inert；`cancel` 是可取消的
close request，`close` 是关闭完成后触发的不可取消事件。WAI-ARIA APG 和 WCAG 补充可识别名称、合理初始
焦点、键盘退出、顺序导航和焦点可见性要求。

### 2. 课程推导

把 Portal host 的所有权放在外层 Demo，把 `<dialog>` 的 Ref 接口放在 `AccessibleDialog`，可以让三个
边界分别可见：React owner 仍处理 State，DOM parent 是 host，浏览器 modal 状态由 `showModal()` 管理。

把打开动作放在 Callback Ref setup，把显式关闭放在对象 Ref 事件处理器，把 React 撤下动作放在原生 close
事件之后，可以得到一个单向数据流：

```text
用户打开 -> React 挂载 -> Ref setup -> showModal
用户关闭 -> close()/cancel -> 原生恢复焦点 -> close -> React 撤下
```

`dialog.open` guard 和对象相等 cleanup 不是新的业务 State，而是为了让这条连接承受 Callback Ref 的
重复 setup、callback 更换和 Strict Mode 开发检查。

### 3. 适用边界

本实战适合同一 Document 中、由当前 React 树拥有、需要原生 modal 语义和平台焦点边界的确认界面。它不
覆盖跨 document 或 iframe Portal、Shadow DOM、服务端渲染、第三方焦点锁、嵌套 modal、dialog manager、
异步提交、权限、真实发布、复杂表单验证、路由后继和触发器消失后的焦点 fallback 实现。

普通 `<div role="dialog">`、手写 focus trap 或全局 inert 管理都可能是有效的其他工程方案，但它们拥有不同
的责任清单，不能把本实战的原生 dialog 合同直接套过去。

## 十七、练习

:::exercise
### 阻止一次 Escape

**要求：** 在 dialog 中增加“仍有未确认内容”复选框。选中时，`onCancel` 调用 `preventDefault()`；未选中时允许
默认关闭。

**验收：** 选中时 Escape 只增加 `cancel` 次数且 dialog 仍存在；取消选中后 Escape 产生
`cancel -> close`；显式 `close()` 按钮仍然直接关闭。
:::

:::exercise
### 选择初始焦点

**要求：** 把公告内容改成一段短确认句，比较“标题先聚焦”和“主要按钮先聚焦”两种方案。说明内容长度、操作风险、
Tab 起点和屏幕阅读顺序如何影响选择。

**验收：** 不能只写“第一个可聚焦元素”，必须说明选择依据，并保持 dialog 本身没有 `tabindex`。
:::

:::exercise
### 分析触发器消失

**要求：** 假设确认发布后触发按钮被结果标题替换。根据焦点恢复规则，判断此时应聚焦结果标题还是下一操作按钮，
并写出触发器不存在时的 fallback 合同。

**验收：** 区分“原触发器仍存在时的恢复”和“工作流已经转向新目标”两种情况，不要求改写主 Demo。
:::

:::exercise
### 记录关闭事件序列

**要求：** 为两个按钮、`cancel` 和 `close` 添加短日志，分别执行继续编辑、确认发布、Escape 和被
`preventDefault()` 阻止的 Escape。

**验收：** 按钮路径是 `click -> close`，正常 Escape 是 `cancel -> close`，阻止后的 Escape 只有 `cancel`；
不能把所有关闭都归入 `cancel`。
:::

:::exercise
### 识别错误实现

**要求：** 判断以下四段实现各自违反了哪条合同：Portal 中的普通 div、直接切换 `open` 属性、Callback Ref cleanup
调用 `close()`、删除 outline 且没有替代焦点指示。

**验收：** 分别引用 Portal、HTML dialog、Callback Ref 和 Focus Visible 的规则，并说明可观察后果。
:::

## 十八、本节小结

- Portal 解决 React 子树的 DOM 落点，`showModal()` 才建立原生 modal 的 top layer、backdrop、inert 和焦点步骤。
- 可访问 dialog 需要可识别名称、合理初始焦点、背景边界、键盘退出、可见焦点和关闭后焦点合同。
- 结构化内容适合先聚焦标题；`tabIndex=-1` 放在内部标题，不放在 dialog 本身。
- React 19 `ref` prop 必须显式转交，最终 Ref 应指向 `HTMLDialogElement`。
- Callback Ref setup 在节点提交后调用带 `dialog.open` guard 的 `showModal()`，cleanup 不负责关闭业务 dialog。
- 显式按钮调用 `close(result)`；Escape 的 close request 先触发可取消的 `cancel`，再可能触发 `close`。
- React 应在原生 `close` 事件之后读取 `returnValue` 和焦点结果，再撤下 dialog 子树。
- 原生 modal 已提供同一 Document 的背景 inert，不要把 Portal、ARIA 属性或 CSS 遮罩单独当成 modal。

## 十九、参考资料

- [React createPortal](https://react.dev/reference/react-dom/createPortal) - Portal 的 DOM 落点与 React 树语义。
- [React Common Components：ref callback](https://react.dev/reference/react-dom/components/common#ref-callback) - Callback Ref setup 与 cleanup 合同。
- [React v19：ref as a prop](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop) - 函数组件接收 ref prop。
- [React Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs) - Ref 提交时机和 DOM 操作边界。
- [WHATWG HTML dialog element](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element) - `showModal()`、`close()`、事件与聚焦算法。
- [WHATWG modal dialogs and inert subtrees](https://html.spec.whatwg.org/multipage/interaction.html#modal-dialogs-and-inert-subtrees) - modal 与 inert 背景边界。
- [WAI-ARIA APG Modal Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) - 名称、焦点、键盘和关闭后的交互模式。
- [WAI-ARIA dialog role](https://w3c.github.io/aria/#dialog) - dialog 可识别名称要求。
- [WCAG 2.2 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) - 键盘操作合同。
- [WCAG 2.2 No Keyboard Trap](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html) - 模态焦点限制与键盘退出。
