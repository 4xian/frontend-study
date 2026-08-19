# 实战：可访问对话框官方调研

## 调研结论

- 核验日期：`2026-08-16`
- 课程 ID：`react.core.learn.intermediate.lab-accessible-dialog`
- 左侧短标题与正文标题：`实战：可访问对话框`
- 官方文档基线：React `19.2`
- 仓库依赖快照：React / React DOM `19.2.8`，`@types/react@19.2.18`
- 实战性质：React Core 中级实战课，本科前端课程范围
- 本轮写入边界：只新增本研究文件；不修改课程正文、Demo、CSS、Track、manifest、进度、总计划、
  测试或后续课程资产

本实战固定实现一个原生模态确认对话框。React 负责决定对话框子树是否存在、把它 Portal 到稳定宿主、
转交 `ref`，以及在原生 `close` 事件后更新页面结果；浏览器通过 `<dialog>`、`showModal()` 和 `close()`
负责 top layer、背景 inert、初始焦点、Escape close request 与焦点恢复。[R01][H01][H02][A01]

本实战只组合已经完成的知识：`useRef` 保存当前 DOM 节点、Callback Ref 的 setup / cleanup、React 19
函数组件直接接收 `ref` prop、`createPortal` 的 DOM 落点，以及基础 State、条件渲染和事件处理。打开动作
在 `<dialog>` 的 Callback Ref setup 中调用 `showModal()`；所有关闭动作先调用原生 `close()`，再由
`close` 事件撤下 React 子树。全程不使用 `useEffect`、`useLayoutEffect` 或尚未教授的生命周期同步知识。
[R01][R02][R03][R04]

## 一、研究方式与证据边界

1. 先核对权威课程表中当前实战的前置能力和范围，再读取已经完成的 DOM Ref、Callback Ref、ref prop
   与 Portal 调研记录，确认实战不提前使用 Effect。
2. 外部资料发现按仓库约束先使用 Tavily，并限定 React、WHATWG、W3C 与 MDN 官方域名；取得 canonical
   URL 后，直接回读官方页面或规范原文核验关键段落。
3. React 行为以 React `19.2` 公共文档为准；宿主行为以 WHATWG HTML Standard 为规范来源，以 MDN
   API 页面和 W3C WCAG Technique H102 交叉核验可教学表述。
4. WAI-ARIA APG 是组件设计模式指导，WCAG 2.2 Success Criteria 是规范性成功标准，WCAG Technique
   H102 是满足标准的一种充分技术而非唯一强制实现。三者不混写成同一层规则。[A01][W01][W02]
5. 下文把“规范或官方合同”“从合同得到的课程推导”“本实战固定选择”分开。Demo 产品名、状态字段、
   显示文字和验收步骤属于课程设计，不冒充浏览器或 React 的通用要求。
6. 研究记录可以保存课程 ID、生产边界、验收和排除项；未来学习者正文只能描述对话框本身的需求、
   平台合同、实现、易错点和练习，不得出现课号、计划、批次、Gate、构建、测试或复审叙事。

## 二、一手来源卡

### React 与 React DOM

| ID | 官方来源 | 本研究采用范围 |
| --- | --- | --- |
| `R00` | [React Versions](https://react.dev/versions#latest-version) | react.dev 当前稳定文档基线为 React 19.2；同一 major 内文档持续更新。 |
| `R01` | [`createPortal`](https://react.dev/reference/react-dom/createPortal) | Portal 只改变宿主 DOM 放置；目标节点必须已存在；Context 与 React 事件仍按 React 树工作。 |
| `R02` | [Common components：ref callback](https://react.dev/reference/react-dom/components/common#ref-callback) | Callback Ref 的节点参数、可选 cleanup、callback 更换与 Strict Mode 额外 setup / cleanup。 |
| `R03` | [React v19：ref as a prop](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop) | React 19 函数组件直接从 props 接收 `ref`。 |
| `R04` | [Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs) | Ref 在 commit 中接入节点；事件中调用 DOM API；自定义组件显式转交 Ref。 |
| `R05` | [`useRef`](https://react.dev/reference/react/useRef#manipulating-the-dom-with-a-ref) | 对象 Ref 保存当前 DOM 节点且改变 `current` 不触发 render。 |
| `R06` | [`StrictMode`](https://react.dev/reference/react/StrictMode#fixing-bugs-found-by-re-running-ref-callbacks-in-development) | 开发环境额外运行 Callback Ref setup + cleanup，用来暴露不对称清理。 |

### HTML 与 DOM 平台

| ID | 官方来源 | 本研究采用范围 |
| --- | --- | --- |
| `H01` | [WHATWG：`dialog` element](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element) | `showModal()`、`close()`、`returnValue`、聚焦步骤、先前焦点、关闭算法、`cancel` / `close` 时序和禁止给 `dialog` 本身设置 `tabindex`。 |
| `H02` | [WHATWG：modal dialogs and inert subtrees](https://html.spec.whatwg.org/multipage/interaction.html#modal-dialogs-and-inert-subtrees) | modal dialog 阻塞文档时，对话框及其后代之外的已连接节点变为 inert。 |
| `H03` | [WHATWG：`inert` attribute](https://html.spec.whatwg.org/multipage/interaction.html#the-inert-attribute) | inert flat-tree descendants 的交互边界，以及 modal dialog 对祖先 inertness 的窄逃逸规则。 |
| `H04` | [MDN：`<dialog>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog) | 原生语义、modal / non-modal 差异、隐式 `aria-modal`、焦点与 `tabindex` 作者提示。 |
| `H05` | [MDN：`showModal()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal) | top layer、`::backdrop`、同文档背景 inert、返回值与 `InvalidStateError`。 |
| `H06` | [MDN：`close()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/close) | 关闭已打开对话框，并可用可选字符串更新 `returnValue`。 |
| `H07` | [MDN：`cancel` event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/cancel_event) | close request 会触发 `cancel`；事件可取消且不冒泡；未阻止时继续关闭。 |
| `H08` | [MDN：`close` event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/close_event) | 对话框关闭后触发；事件不可取消且不冒泡。 |
| `H09` | [MDN：`inert`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert) | inert 节点不能聚焦、点击，并从 tab order 与 accessibility tree 中移除；modal dialog 的逃逸边界。 |

### WAI-ARIA、WCAG 与键盘模式

| ID | 官方来源 | 本研究采用范围 |
| --- | --- | --- |
| `A01` | [WAI-ARIA APG：Modal Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) | 初始焦点、Tab / Shift+Tab、Escape、关闭后焦点、可见关闭按钮、accessible name 与 `aria-describedby` 选择。 |
| `A02` | [ARIA：`dialog` role](https://w3c.github.io/aria/#dialog) | dialog 是应用窗口；作者必须提供可识别名称。 |
| `W01` | [WCAG 2.2 Technique H102](https://www.w3.org/WAI/WCAG22/Techniques/html/H102) | 使用原生 `<dialog>`、`showModal()` 和平台焦点行为满足动态页面焦点顺序的一种充分技术。 |
| `W02` | [WCAG 2.2 SC 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) | 除路径依赖例外外，内容功能必须可由键盘接口操作。 |
| `W03` | [WCAG 2.2 SC 2.1.2 No Keyboard Trap](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html) | 焦点必须能仅靠键盘离开组件；模态内限制焦点可以成立，但必须有可知的退出方法。 |
| `W04` | [WCAG 2.2 SC 2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html) | 顺序导航影响含义或操作时，焦点顺序必须保持含义和可操作性。 |
| `W05` | [WCAG 2.2 SC 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) | 键盘可操作界面必须有能看见键盘焦点指示器的操作模式。 |

未采用社区教程、问答、组件库说明或搜索摘要支撑结论。MDN 用于可读的 API 交叉说明；当 MDN 与
WHATWG 的层次不同，HTML Standard 的算法和要求是平台事实依据。

## 三、逐 Claim 事实账本

| Claim | 可用于课程的准确表述 | 证据 | 不能推出的内容 |
| --- | --- | --- | --- |
| `C01` | `createPortal` 只改变 children 的宿主 DOM 落点；children 仍处于调用位置的 React 树。 | `R01` | Portal 本身不产生 modal、inert、焦点管理或 Escape 行为。 |
| `C02` | Portal target 在调用时必须已经存在；切换为另一 DOM node 会重建 portal content。 | `R01` | 不能在每次 render 创建一个新 target 并期待对话框实例连续。 |
| `C03` | React 19 函数组件可以直接接收 `ref` prop，但必须显式把它转交给 `<dialog>`。 | `R03`、`R04` | `ref` 不会自动搜索组件后代，也不等于公开自定义句柄。 |
| `C04` | Callback Ref 在节点接入时执行 setup，可以返回 cleanup；callback 更换也会先清理旧连接。 | `R02` | setup 不能假设只运行一次；cleanup 也不只代表组件永久卸载。 |
| `C05` | Strict Mode 开发环境会额外执行一次 Callback Ref setup + cleanup。 | `R02`、`R06` | 额外周期不是生产调用次数，也不是用 Effect 打开的理由。 |
| `C06` | `showModal()` 把已连接的 `<dialog>` 显示为顶层 modal，并创建可样式化的 `::backdrop`。 | `H01`、`H05` | `z-index` 或 Portal 单独不能替代 top layer 的模态合同。 |
| `C07` | modal 打开后，同一 `Document` 中 dialog 及其 flat-tree descendants 之外的已连接节点变为 inert。 | `H02`、`H05` | iframe 外层页面不会因为 iframe 内 dialog 打开而自动 inert。 |
| `C08` | inert 内容不能成为用户交互和焦点目标，并从 tab order 与 accessibility tree 中移除。 | `H03`、`H09` | `inert` 不是只降低透明度的 CSS 效果。 |
| `C09` | 通过 `showModal()` 打开的原生 `<dialog>` 对辅助技术具有 modal 语义；仍需可识别名称。 | `H04`、`A01`、`A02` | 不能因为有 backdrop 就省略标题或 accessible name。 |
| `C10` | `showModal()` 运行 dialog focusing steps，并尊重 `autofocus`。 | `H01` | 不能把焦点留在 inert 背景并声称 modal 已正确打开。 |
| `C11` | `tabindex` 不应设置在 `<dialog>` 本身；需要聚焦静态内容时，应聚焦 dialog 内带 `tabindex="-1"` 的标题或首段。 | `H01`、`H04`、`A01` | 不应使用 `<dialog tabIndex={-1}>` 作为本实战初始焦点方案。 |
| `C12` | APG 要求 modal 的 Tab / Shift+Tab 顺序留在对话框内，Escape 关闭，并提供可见关闭按钮。 | `A01` | 不能只提供鼠标点击 backdrop 退出。 |
| `C13` | 原生 modal 让键盘焦点只能到达 dialog 内元素和浏览器 chrome；H102 把它作为可访问实现技术。 | `W01` | 不能把任意 `role="dialog"` 的 `<div>` 当成同等平台行为。 |
| `C14` | 打开时浏览器记录先前焦点；关闭 modal 时，规范会尝试把焦点恢复到该元素且不滚动视口。 | `H01` | 若原触发器已删除或不可聚焦，不能保证恢复到同一对象。 |
| `C15` | APG 的通常规则是关闭后回到触发器；触发器不存在或工作流明显要求下一目标时，选择逻辑后继。 | `A01` | “永远手动 focus 原按钮”不是无条件规则。 |
| `C16` | Escape 等 close request 先触发 `cancel`；调用 `preventDefault()` 可阻止后续关闭。 | `H01`、`H07` | `cancel` 不是“点击名为取消的按钮”才触发。 |
| `C17` | 未阻止的 close request 继续执行关闭，并在关闭后触发 `close`。 | `H01`、`H07`、`H08` | `cancel` 和 `close` 不是同一个事件，也不保证总是成对出现。 |
| `C18` | `close()` 直接关闭并可写入 `returnValue`；它不先触发 `cancel`。 | `H01`、`H06` | 若产品需要可拦截关闭，应研究 `requestClose()`，不能假装 `close()` 可取消。 |
| `C19` | `cancel` 可取消但不冒泡；`close` 不可取消且不冒泡。 | `H07`、`H08` | 应把 handler 放在 `<dialog>` 上，不能依赖 DOM 祖先原生冒泡。 |
| `C20` | 直接移除 `open` 属性会绕过完整关闭行为；规范建议使用 `requestClose()` 或 `close()`。 | `H01` | `setAttribute` / `removeAttribute` 不是本实战状态同步方案。 |
| `C21` | WCAG 2.1.1 要求所有功能可由键盘操作；触发、两个关闭动作与 Escape 路径都要可验证。 | `W02` | 仅能 Tab 到按钮但无法激活，不算完整键盘可操作。 |
| `C22` | modal 内限制焦点不违反 No Keyboard Trap，前提是存在标准、可知的键盘退出方式。 | `W03`、`A01` | 删除 Escape 和全部可见关闭控件会形成不可接受的陷阱。 |
| `C23` | 对话框内焦点顺序必须保持含义与操作；正 `tabindex` 不应拿来重排。 | `W04`、`A01` | CSS 视觉顺序不能替代合理 DOM 顺序。 |
| `C24` | 键盘焦点必须可见；作者样式不能无替代地删除 outline。 | `W05` | 不能只用 hover 或颜色微差表示当前焦点。 |

## 四、平台模型：Portal 与 modal 各自负责什么

### 1. Portal 只负责 DOM 放置

实战的调用结构固定为：

```text
React 树：DialogDemo -> AccessibleDialog -> dialog

DOM 树：  demo-root
          |- trigger-and-status
          `- portal-host
             `- dialog

浏览器展示：dialog 通过 showModal() 进入 top layer
```

`AccessibleDialog` 在 React 树中仍是 `DialogDemo` 的 child；`createPortal` 只把实际 `<dialog>` 放进
`portal-host`。React Props、State 和事件仍按 React 树工作。[R01]

进入 top layer、生成 `::backdrop`、阻止背景交互和运行 dialog focusing steps，都来自
`dialog.showModal()`，不是来自 Portal。[H01][H02][H05]

因此必须同时满足两层条件：

1. Portal host 已经连接且对象稳定，`createPortal` 才有有效 DOM 落点。[R01]
2. `<dialog>` 已经由 React 提交并连接后，Callback Ref setup 才调用 `showModal()`。[R02][R04][H01]

### 2. 为什么仍使用 Portal

原生 modal 即使不经过 Portal，也能进入 top layer。本实战使用 Portal 不是为了宣称它是原生 dialog 的
必要条件，而是为了组合上一课的 DOM 落点能力：[R01][H01]

- 对话框组件保留在触发器的 React 逻辑树中；
- 宿主节点统一落到 Demo 尾部的稳定 `portal-host`；
- 可清楚观察 React owner 与 DOM parent 是两套关系；
- overlay 不受调用处局部 overflow 或普通 stacking context 的结构限制。

课程必须明确：删除 Portal 后原生 `<dialog>` 仍可 modal；删除 `showModal()` 而只保留 Portal，则只是把
一个关闭状态的 dialog 节点放到别处，不具备 modal 行为。[R01][H01]

### 3. inert 的准确边界

`showModal()` 使该 dialog 成为文档顶层 modal，文档中除 dialog 及其 flat-tree descendants 之外的节点
变为 inert。[H02]

`inert` 不只是“无法点击”：其后代不能接收焦点或 click，离开 tab order，并从 accessibility tree 中
移除。[H03][H09]

本实战不手动给应用根添加 `inert` 或 `aria-hidden`。原生 modal 已提供这层平台行为，重复维护另一份
背景状态容易在异常关闭时遗留。该选择仅适用于同一文档中的原生 `showModal()`；iframe、多个 document
或自定义 ARIA dialog 需要独立设计。[H02][H05]

modal dialog 可以逃逸祖先的 inertness，但如果 `inert` 直接设置在 dialog 本身，它仍会 inert。课程只把
这条作为边界说明，不在 Demo 中构造嵌套 inert 场景。[H02][H03][H09]

## 五、原生 `<dialog>` 公共合同

### 1. `showModal()`

```ts
dialog.showModal(): void
```

调用成功后：[H01][H05]

- dialog 进入 top layer；
- UA 提供 `::backdrop`；
- 同文档背景变为 inert；
- dialog 记录先前聚焦元素；
- UA 运行 dialog focusing steps；
- `autofocus` 参与初始焦点选择。

本实战只在 Callback Ref 收到已连接 `HTMLDialogElement` 后调用。setup 使用
`if (!dialog.open) dialog.showModal()`，以承受 callback 更换和 Strict Mode 的额外 setup / cleanup。
这是基于 React 与 HTML 合同得到的幂等保护，不宣称 `showModal()` 是可随意重复执行的普通 setter。
[R02][R06][H01]

平台边界：[H01][H05]

- 已经以 modal 打开的同一 dialog 再次 `showModal()` 时算法直接返回；
- 已经用 `show()` 以 non-modal 方式打开，再调用 `showModal()` 会抛 `InvalidStateError`；
- dialog 未连接、document 不是 fully active，或 dialog 正处于 popover showing state 时也不满足
  `showModal()` 前置条件。

Demo 不提供 `show()`、popover 或跨 document 分支，只保证 target 与 dialog 均已连接。

### 2. `close(result?)`

```ts
dialog.close(result?: string): void
```

`close()` 关闭 dialog；给定字符串时写入 `returnValue`。它直接进入关闭算法，不先触发可取消的
`cancel`。[H01][H06]

本实战固定两个显式结果：

```ts
type DialogResult = 'continue-editing' | 'publish'
```

- “继续编辑”按钮调用 `close('continue-editing')`；
- “确认发布”按钮调用 `close('publish')`；
- Escape 产生 close request，不传业务结果，因此新 dialog 的 `returnValue` 保持空字符串。

每次重新打开都会条件渲染一个新的 `<dialog>` 实例，所以不需要在打开前手动清空旧实例的
`returnValue`。这是本 Demo 的生命周期选择，不是 `close()` 自动清空的合同。[H01]

### 3. `cancel` 与 `close` 不是“取消按钮”和“关闭按钮”

`cancel` 是 close request 事件。桌面环境中 Escape 是典型来源，`requestClose()` 也会产生 close
request。事件可取消且不冒泡；调用 `event.preventDefault()` 会让 dialog 保持打开。[H01][H07]

`close` 在 dialog 已经关闭后触发，不可取消且不冒泡。`close()`、未阻止的 Escape close request，
以及 `<form method="dialog">` 等关闭方式都可以最终产生 `close`。[H01][H08]

本实战事件顺序固定解释为：

```text
Escape
  -> cancel
  -> 未 preventDefault
  -> 浏览器关闭并恢复先前焦点
  -> close
  -> React close handler 读取 returnValue 和当前焦点
  -> React 撤下 dialog 子树
```

显式按钮路径为：

```text
按钮 click
  -> dialog.close(result)
  -> 浏览器关闭并恢复先前焦点
  -> close
  -> React close handler 同步结果并撤下子树
```

按钮调用 `close()` 不触发 `cancel`，因此不能把 `cancel` 计数解释为所有关闭尝试数。[H01][H07][H08]

### 4. 不直接控制 `open` 属性

React 不以 `open={isOpen}` 声明式驱动本实战 modal。HTML Standard 明确指出，手动移除 `open` 会绕过
完整关闭合同：不会触发 `close`，还可能让 modal 文档保持阻塞；规范建议使用 `requestClose()` 或
`close()`。[H01]

本实战的 React boolean 表示“dialog 子树是否应存在”，不是 `<dialog open>` 的镜像。真正打开由
`showModal()` 完成，真正关闭由 `close()` 或 Escape close request 完成；`close` 事件是 React 撤下
子树的同步边界。

## 六、焦点与语义合同

### 1. Accessible name

原生 `<dialog>` 提供 dialog 语义；`showModal()` 暴露 modal 状态，但对话框仍必须有可识别名称。
[H04][A01][A02]

本实战固定使用可见标题与 `aria-labelledby`：

```tsx
<dialog aria-labelledby="publish-dialog-title">
  <h2 id="publish-dialog-title">确认发布课程公告</h2>
</dialog>
```

不重复写 `role="dialog"` 或 `aria-modal="true"`。这不是说 ARIA 属性永远不能写，而是原生
`<dialog>` + `showModal()` 已提供对应语义，本 Demo 不需要重复维护。[H04]

对话框包含标题、说明、课程名称和受众等结构化内容。APG 建议结构需要逐项感知时省略
`aria-describedby`，避免屏幕阅读器把整段结构拼成一个长字符串。因此本实战只设置
`aria-labelledby`；正文仍作为 dialog descendants 按正常语义阅读。[A01]

### 2. 初始焦点

APG 指出，长内容或包含列表、表格、多段结构的 dialog，适合把静态标题或首段设为
`tabindex="-1"` 并初始聚焦；这样内容开头不会因聚焦后部按钮而滚出视口，也便于按结构阅读。[A01]

本实战固定：

```tsx
<h2 id="publish-dialog-title" tabIndex={-1} autoFocus>
  确认发布课程公告
</h2>
```

`showModal()` 尊重 `autofocus`。`tabIndex={-1}` 让标题可被脚本或 UA 聚焦，但不把它加入普通 Tab
顺序。`tabindex` 不设置到 `<dialog>` 自身，因为 HTML Standard 明确禁止。[H01][A01]

### 3. 打开后的 Tab 顺序

标题之后的 DOM 顺序固定为：

1. 公告摘要与受众等只读语义内容；
2. “继续编辑”按钮；
3. “确认发布”按钮。

初始焦点在标题。按 Tab 进入“继续编辑”，再到“确认发布”；继续 Tab 不得进入背景按钮或链接。
Shift+Tab 反向移动时同样留在 dialog 的可操作范围。浏览器 chrome 仍是用户代理范围，不属于页面背景。
[A01][W01][W04]

不使用正 `tabindex` 重排，不在 CSS 中制造与 DOM 相反的视觉顺序，不移除可见 focus outline。
[A01][W04][W05]

### 4. 关闭与焦点恢复

`showModal()` 在运行聚焦步骤前记录先前焦点；关闭算法在 modal 情况下尝试聚焦该元素，并建议不滚动
视口，然后才排队触发 `close`。[H01]

Demo 的触发按钮始终保留在 DOM 中，所以三条关闭路径都必须恢复到同一按钮：

- “继续编辑”调用 `close('continue-editing')`；
- “确认发布”调用 `close('publish')`；
- Escape 触发未阻止的 close request。

触发按钮保留对象 Ref。`close` handler 中比较
`document.activeElement === triggerButtonRef.current`，把布尔结果复制到普通 State 供页面显示。这只是
观察平台行为，不由 React 手动调用 `focus()` 伪造通过。[H01][R05]

APG 允许两类例外：原触发器已不存在时聚焦逻辑后继；完成工作流后聚焦下一操作比重新打开 dialog 更
合理时，也可选择下一目标。本 Demo 不包含这些例外，练习中只分析，不实现。[A01]

### 5. 可退出而不是永久陷阱

modal 在打开期间限制页面焦点是预期行为。WCAG 2.1.2 明确允许 modal 这类局部限制，只要用户知道如何
仅靠键盘离开；Escape 是常见标准退出方式。[W03]

本实战同时提供：

- Escape；
- 可见且可聚焦的“继续编辑”按钮；
- 可见且可聚焦的“确认发布”按钮。

因此用户不需要鼠标、触控或未说明的组合键才能退出。Backdrop 只表达模态层级，不承担唯一退出职责。
[A01][W02][W03]

## 七、无 Effect 的 React 组合方式

### 1. 为什么不使用 Effect

本实战在课程顺序上早于 Effect。所需动作都有更窄的现成时机：

| 动作 | 固定时机 | 使用能力 |
| --- | --- | --- |
| 取得 portal host | host DOM 节点提交时 | `useState` setter 作为 Callback Ref |
| 取得 dialog 节点 | dialog DOM 节点提交时 | Callback Ref setup |
| 打开 modal | 同一 dialog Callback Ref setup | `showModal()` |
| 发起显式关闭 | 用户点击按钮 | 对象 Ref + `close(result)` |
| 处理 Escape 请求 | 原生 `cancel` 事件 | `onCancel` |
| 同步 React 状态 | 原生 `close` 事件 | `onClose` + State setter |
| 清除失效 dialog Ref | Callback Ref cleanup | 对称 cleanup |

React 官方把 Ref 接入定义为 commit 结果，Callback Ref 本身提供 setup / cleanup；DOM 命令又来自明确
事件或节点接入。因此这里不需要先渲染、再用 Effect 搜索节点并打开。[R02][R04]

这不是“任何 dialog 都不需要 Effect”的通用规则。若未来 dialog 的存在由外部系统、路由或异步状态
驱动，仍需在教授相应同步知识后重新设计。当前实战只有本地触发事件和条件挂载。

### 2. 稳定 portal host

外层 Demo 先渲染一个稳定 host：

```tsx
const [portalHost, setPortalHost] = useState<HTMLDivElement | null>(null)

return <div className="dialog-host" ref={setPortalHost} />
```

State setter 身份稳定，可直接作为 Callback Ref。首次 commit 后收到 host 节点并触发下一次 render；
卸载时兼容路径收到 `null`。只有 `portalHost !== null` 且用户已请求打开时，才渲染 Portal。
[R01][R02]

host 由 React 正常渲染，不在模块加载时查询 `document.body`，不在每次 render 调用
`document.createElement()`，也不由 dialog 组件自行 append / remove。[R01]

### 3. React 19 `ref` prop 转交

```tsx
import type { Ref } from 'react'
import { createPortal } from 'react-dom'

type AccessibleDialogProps = {
  host: HTMLElement
  ref?: Ref<HTMLDialogElement>
  onCancel: () => void
  onClose: (dialog: HTMLDialogElement) => void
  onChoose: (result: DialogResult) => void
}

function AccessibleDialog({
  host,
  ref,
  onCancel,
  onClose,
  onChoose,
}: AccessibleDialogProps) {
  return createPortal(
    <dialog
      ref={ref}
      aria-labelledby="publish-dialog-title"
      onCancel={onCancel}
      onClose={(event) => onClose(event.currentTarget)}
    >
      {/* 标题、摘要与两个真实 button */}
    </dialog>,
    host,
  )
}
```

组件直接从 props 接收 `ref`，并转交给最终 `<dialog>`。调用方取得的是
`HTMLDialogElement`，不是 wrapper、Portal host 或自定义命令式对象。[R03][R04]

### 4. Dialog Callback Ref

实现轮廓固定为：

```tsx
const dialogNodeRef = useRef<HTMLDialogElement | null>(null)

const connectDialog: RefCallback<HTMLDialogElement> = (dialog) => {
  if (dialog === null) return

  dialogNodeRef.current = dialog

  if (!dialog.open) {
    dialog.showModal()
  }

  return () => {
    if (dialogNodeRef.current === dialog) {
      dialogNodeRef.current = null
    }
  }
}
```

关键点：[R02][R05][R06][H01]

- setup 保存当前节点，并在节点已连接后调用 `showModal()`；
- `dialog.open` guard 让 callback 更换和 Strict Mode 额外 setup 不重复打开；
- cleanup 只撤销“对象 Ref 指向此节点”这项 setup；
- cleanup 用对象相等保护，避免旧 callback 清掉后来已经接入的新节点；
- cleanup 不调用 `close()`，因为 callback 更换和 Strict Mode 检查也会触发 cleanup；
- 所有正常 UI 关闭路径已经先完成原生 close，再由 React 卸载。

不使用隐式返回赋值：`ref={(node) => (dialogNodeRef.current = node)}` 会返回赋值结果，与 React 19
Callback Ref 的 `void | cleanup` 类型不符。[R02]

### 5. 显式关闭命令

```tsx
function closeDialog(result: DialogResult) {
  dialogNodeRef.current?.close(result)
}
```

点击 handler 只发起平台关闭，不直接 `setIsDialogRendered(false)`。如果先移除 JSX，`close` 事件、
`returnValue` 读取和标准焦点恢复就失去统一边界。[H01][H06][H08]

### 6. `close` 后同步 State

```tsx
function handleDialogClose(dialog: HTMLDialogElement) {
  const focusReturned = document.activeElement === triggerButtonRef.current
  const result = dialog.returnValue

  setLastOutcome({ result, focusReturned })
  setIsDialogRendered(false)
}
```

规范的关闭算法先尝试恢复先前焦点，再排队触发 `close`，所以 handler 可以观察恢复结果。[H01]

`result === ''` 表示本 Demo 中由 Escape 关闭；两个显式按钮分别得到固定字符串。页面显示可以映射为
“Escape 关闭”“继续编辑”“确认发布”，但不把显示标签写回 `returnValue`。

## 八、实战功能合同

### 1. 唯一产品目标

学习者完成一个“课程公告发布确认”单页 Demo。背景区展示待发布公告摘要、一个触发按钮和上次关闭
结果；点击触发按钮后，在稳定 Portal host 中挂载原生 `<dialog>` 并调用 `showModal()`。

对话框显示公告名称、受众和发布说明，并提供“继续编辑”“确认发布”两个真实按钮。用户可用任一按钮
或 Escape 关闭。关闭后页面显示关闭来源、`returnValue`、`cancel` 事件次数和焦点是否回到触发按钮。

数据全部是固定内存内容。没有请求、持久化、路由、账号、权限或真实发布操作。

### 2. 可见区域

1. 标题“课程公告发布”。
2. 固定公告摘要：公告名、目标受众和一段说明。
3. 真实 `<button type="button">预览并发布</button>`，连接 `triggerButtonRef`。
4. 一个背景链接或按钮，用来验证 modal 打开时背景不能聚焦或点击。
5. 状态区：dialog 是否挂载、上次关闭方式、`returnValue`、焦点是否恢复、累计 `cancel` 次数。
6. 稳定但无额外教学文字的 `portal-host`。
7. modal 内的标题、结构化摘要、“继续编辑”和“确认发布”。

页面不显示课程编号、计划、Gate、构建、测试、复审、API 清单或操作教程。可观察状态使用产品化短标签，
不是把验收说明直接铺在界面中。

### 3. 固定数据

```ts
type Announcement = {
  readonly title: string
  readonly audience: string
  readonly summary: string
}

const ANNOUNCEMENT: Announcement = {
  title: 'React 学习小组活动通知',
  audience: '前端课程本科生',
  summary: '确认时间、地点和参与对象后发布到课程公告栏。',
}
```

固定数据不进入 State，也不在 dialog 中编辑。实战目标是模态、Ref 和焦点合同，不是表单建模。

### 4. 最小 State

```ts
type CloseOutcome = {
  readonly result: '' | DialogResult
  readonly focusReturned: boolean
}

const [portalHost, setPortalHost] = useState<HTMLDivElement | null>(null)
const [isDialogRendered, setIsDialogRendered] = useState(false)
const [cancelCount, setCancelCount] = useState(0)
const [lastOutcome, setLastOutcome] = useState<CloseOutcome | null>(null)
```

- `portalHost`：当前稳定 DOM target；由 host Callback Ref 发布。
- `isDialogRendered`：React 是否应包含 dialog subtree；不是 `dialog.open` 镜像。
- `cancelCount`：可观察 Escape close request 次数。
- `lastOutcome`：最近一次已经完成关闭的结果和焦点恢复观察值。

不保存 `isModal`、`isInTopLayer`、`backgroundIsInert`、`activeElementId` 或 `dialogReturnValue` 的第二份
实时镜像。这些是浏览器当前状态或一次关闭观察值，不需要另一套同步模型。[H01][H02][R05]

### 5. Ref 与 Callback Ref

```ts
const triggerButtonRef = useRef<HTMLButtonElement | null>(null)
const dialogNodeRef = useRef<HTMLDialogElement | null>(null)
```

- `triggerButtonRef`：在 `close` handler 中验证焦点恢复；不用于手动补焦点。
- `dialogNodeRef`：由 `connectDialog` setup / cleanup 维护，按钮事件读取后调用 `close()`。
- `setPortalHost`：稳定 Callback Ref，发布当前 portal target。
- `connectDialog`：传给 `AccessibleDialog` 的 React 19 ref prop，最终接到 `<dialog>`。

DOM 节点不进入普通业务 State；改写 Ref 不触发 render。[R05]

### 6. 组件边界

| 组件 | 职责 | 不负责 |
| --- | --- | --- |
| `AccessibleDialogDemo` | 固定产品数据、State、host、两个对象 Ref、打开/关闭事件和结果区 | 不渲染 dialog 内部 DOM 细节 |
| `AccessibleDialog` | 接收 host 与 `ref`，渲染语义化 `<dialog>` 并 Portal 到 host | 不创建 host，不保存打开 State，不调用 Effect |
| `DialogSummary`（可选） | 渲染只读公告摘要 | 不新增 State、Ref 或通用抽象 |

`DialogSummary` 只有在主 TSX 可读性明显受益时才拆分；不得为了组件数量制造单次包装。

## 九、事件与状态序列

### 1. 首次页面提交

```text
render: portalHost = null, dialog 不渲染
  -> host commit
  -> setPortalHost(host)
  -> render: portalHost 可用，dialog 仍不渲染
```

这一步只准备稳定目标，不自动打开 modal。[R01][R02]

### 2. 点击触发器

```text
click 触发器
  -> setIsDialogRendered(true)
  -> AccessibleDialog render
  -> createPortal(dialog, portalHost)
  -> dialog commit
  -> connectDialog(dialog)
  -> dialog.showModal()
  -> 标题获得初始焦点，背景 inert
```

`showModal()` 只能在 dialog 已连接后执行；Callback Ref 正好提供该 commit 边界。[R02][R04][H01]

### 3. 点击“继续编辑”

```text
click
  -> dialogNodeRef.current?.close('continue-editing')
  -> 浏览器关闭、恢复触发器焦点
  -> close
  -> 记录 result / focusReturned
  -> setIsDialogRendered(false)
  -> Callback Ref cleanup 清空 dialogNodeRef
```

不触发 `cancel`。[H01][H06][H08]

### 4. 点击“确认发布”

序列与“继续编辑”相同，`returnValue` 为 `publish`。页面只显示“已确认发布”的内存结果，不发送请求。

### 5. 按 Escape

```text
Escape close request
  -> cancel（计数 +1，不 preventDefault）
  -> 浏览器继续关闭、恢复触发器焦点
  -> close（returnValue 为空字符串）
  -> 记录 Escape 结果并撤下子树
```

若练习中加入 `preventDefault()`，则该次只有 `cancel`，没有 `close`，dialog 必须继续打开。[H07][H08]

### 6. Strict Mode 的 Ref 检查

开发环境可能观察到：

```text
connectDialog setup
  -> cleanup
  -> setup
```

第二次 setup 看到 `dialog.open === true`，不重复 `showModal()`；cleanup 只清空匹配节点 Ref，不关闭
dialog。最终 `dialogNodeRef.current` 仍指向当前节点。[R02][R06][H01]

## 十、固定 Demo 验收合同

### A. 结构与语义

1. 页面只有一个触发按钮；初始没有已挂载 dialog。
2. 点击后 DOM 中出现一个 `<dialog open>`，实际 parent 是稳定 `portal-host`。
3. dialog accessible name 来自可见标题 `aria-labelledby`。
4. `<dialog>` 本身没有 `tabindex`、重复 `role="dialog"` 或手写 `aria-modal="true"`。
5. 标题有 `tabIndex={-1}` 与 `autoFocus`；关闭按钮均为真实 `<button type="button">`。
6. DOM 顺序与阅读、Tab 顺序一致；不使用正 `tabindex`。

### B. 打开与 modal

1. 调用 `showModal()` 后 dialog 位于 top layer，`::backdrop` 可见。
2. `document.activeElement` 是 dialog 标题。
3. 背景按钮和链接不能被页面 Tab 顺序聚焦，也不能被指针激活。
4. Tab 从标题进入“继续编辑”，再到“确认发布”；继续导航不进入背景页面。
5. Shift+Tab 反向导航同样不进入背景页面。
6. 所有当前焦点都有清晰可见的 outline，390px 和放大文字下不被容器裁切。

### C. 显式 `close()`

1. “继续编辑”调用 `close('continue-editing')`，只触发 `close`，不增加 `cancelCount`。
2. `close` handler 读取到 `returnValue === 'continue-editing'`。
3. dialog 子树只在 `close` 后撤下。
4. 焦点回到“预览并发布”，页面报告 `focusReturned === true`。
5. “确认发布”重复同样合同，`returnValue === 'publish'`。

### D. Escape、`cancel` 与 `close`

1. Escape 先触发一次 `cancel`，`cancelCount` 增加。
2. Demo 不调用 `preventDefault()`，因此随后发生 `close`。
3. 本次新 dialog 的 `returnValue === ''`，页面显示“Escape 关闭”。
4. 焦点回到触发器，dialog 子树撤下。
5. 再次打开得到新 dialog，显式结果不会污染后续 Escape 结果。

### E. Ref 与 React 边界

1. `AccessibleDialog` 直接接收 `ref?: Ref<HTMLDialogElement>` 并转交给 `<dialog>`。
2. `connectDialog` 返回 cleanup，最终不保留已卸载节点。
3. Strict Mode 额外 setup / cleanup 后仍只打开一个 dialog，console 无异常。
4. Portal host 在 dialog 多次开关中保持同一 DOM Node 对象。
5. TSX 不含 `useEffect`、`useLayoutEffect`、`forwardRef`、`useImperativeHandle` 或手写 focus trap。
6. CSS 不使用 Grid、`gap`、负 letter-spacing 或取消焦点可见性的规则。

### F. 响应式与可观察结果

1. 桌面、390px 与 390px + 32px 根字号下 dialog 内容可滚动且没有横向溢出。
2. 长标题和按钮文字不裁切，操作区可以换行但不互相覆盖。
3. Backdrop、dialog 边界、正文和 focus indicator 具有可分辨对比。
4. 打开、两个按钮关闭、Escape、重复打开均无 console error / warning 和失败请求。

## 十一、高价值错误清单

1. **把 Portal 当成 modal。** Portal 只改变 DOM 落点；必须调用 `showModal()` 才有 top layer、inert 与
   dialog focusing steps。[R01][H01][H02]
2. **认为原生 modal 不需要 accessible name。** 隐式 role / modal 状态不能替代可见标题和
   `aria-labelledby`。[H04][A01][A02]
3. **给 `<dialog>` 本身设置 `tabIndex={-1}`。** HTML Standard 禁止；应聚焦内部静态标题。[H01]
4. **打开后仍把焦点留在触发器。** 触发器已经处于 inert 背景；初始焦点必须进入 dialog。[H01][A01]
5. **默认聚焦“确认发布”而没有解释。** 对结构化确认内容，先聚焦标题更利于理解；不可逆动作还应优先
   考虑较不破坏性的选择。[A01]
6. **手写 `document.querySelector` 查 dialog。** 已经有明确 Ref 链路，应读取当前对象 Ref。[R04][R05]
7. **在 render 中调用 `showModal()`。** DOM 尚未保证提交与连接；应在 Callback Ref setup 中调用。
   [R02][R04][H01]
8. **用 `useEffect` 打开。** 当前需求已有更窄的 Callback Ref commit 边界，且 Effect 尚未教授。
9. **Callback Ref 每次 setup 都无条件 `showModal()`。** callback 更换或 Strict Mode 检查会重入；使用
   `dialog.open` guard。[R02][R06][H01]
10. **Callback Ref cleanup 调用 `close()`。** cleanup 也可能来自 callback 更换或 Strict Mode 探测，
    会把仍应打开的 dialog 关闭。[R02][R06]
11. **Callback Ref 隐式返回节点赋值。** React 19 返回值只能是无值或 cleanup；使用块函数体。[R02]
12. **点击关闭按钮只做 `setIsDialogRendered(false)`。** 这绕过 `close()`、`returnValue`、标准关闭时序
    与统一 `close` handler。[H01][H06][H08]
13. **直接删 `open` 属性。** 规范明确指出这会跳过 `close`，modal 文档还可能保持阻塞。[H01]
14. **把 `cancel` 理解为点击“继续编辑”。** `cancel` 是 close request 事件；`close()` 不先触发它。
    [H01][H07]
15. **在 `close` handler 中 `preventDefault()`。** `close` 不可取消；拦截关闭必须处理可取消的
    `cancel`。[H07][H08]
16. **在祖先 DOM 上监听原生 `cancel` / `close` 冒泡。** 两个事件都不冒泡；handler 应直接挂在
    dialog。[H07][H08]
17. **手动给整个应用根维护 `inert` 与 `aria-hidden`。** 原生 `showModal()` 已负责同文档背景 inert；
    双重状态可能遗留。[H02][H04]
18. **把 inert 当成视觉遮罩。** inert 同时影响焦点、点击、tab order 与 accessibility tree；Backdrop
    只是视觉层。[H03][H09]
19. **只支持鼠标点击 backdrop 退出。** WCAG 键盘与 No Keyboard Trap 要求完整键盘路径；APG 强烈
    推荐可见关闭按钮并要求 Escape。[A01][W02][W03]
20. **用正 `tabindex` 修补顺序。** 应让 DOM 顺序表达含义，避免人为优先级。[A01][W04]
21. **移除 outline 且不给替代。** 键盘焦点必须可见。[W05]
22. **关闭后总是手动 `.focus()` 触发器。** 原生 close 已按规范恢复；手动补焦点会掩盖平台行为，且
    忽略触发器消失或工作流后继例外。[H01][A01]
23. **认为焦点恢复永远成功。** 原元素被移除、失去可聚焦性或流程转向新目标时需要逻辑 fallback。
    [H01][A01]
24. **每次 render 创建 Portal target。** 不同 target 会重建 Portal content，破坏稳定宿主合同。[R01]
25. **用 `aria-modal="true"` 冒充真实 modal。** APG 只允许在所有用户确实不能操作背景且视觉上遮蔽时
    标记 modal；原生 `showModal()` 才是本实战行为来源。[A01][H04]

## 十二、练习设计

### 练习 1：阻止一次 Escape

增加一个 dialog 内复选框“仍有未确认内容”。选中时，`onCancel` 调用 `preventDefault()`；未选中时允许
关闭。验证：[H07][H08]

- 选中时 Escape 只增加 `cancelCount`，不触发 `close`，焦点仍在 dialog；
- 取消选中后 Escape 产生 `cancel -> close`；
- 显式 `close()` 按钮仍直接关闭，因为 `close()` 不经过 `cancel`。

练习只用于区分事件，不引入保存、异步校验或 Effect。

### 练习 2：初始焦点决策

把 dialog 内容改成短确认句，比较两种合理方案：[A01]

1. 结构化或长内容：标题 `tabIndex={-1}` + `autoFocus`；
2. 简短、可逆、主要动作明确：把初始焦点放到最常用按钮。

要求说明选择理由、Tab 起点和屏幕阅读顺序，不以“第一个可聚焦元素”机械代替设计判断。

### 练习 3：触发器消失后的 fallback

纸面分析：若确认发布后触发器被结果区替换，应把焦点送往哪个逻辑后继？根据 APG，可选择新出现的
发布结果标题或下一操作按钮。[A01]

本练习只写判断和验收，不在主 Demo 中移除触发器，以保持原生焦点恢复的可观察合同。

### 练习 4：事件序列记录

为 `cancel`、`close` 和两个 click handler 记录短事件序列，分别执行：[H01][H07][H08]

1. “继续编辑”；
2. “确认发布”；
3. Escape；
4. 被 `preventDefault()` 阻止的 Escape。

预期序列分别是 `click -> close`、`click -> close`、`cancel -> close`、`cancel`。不得声称按钮点击会
触发 `cancel`。

### 练习 5：识别错误实现

给出四段短代码，让学习者判断问题：

- Portal 中的普通 `<div role="dialog">` 未做 modal 行为；
- `<dialog open>` 由 boolean 直接切换；
- Callback Ref cleanup 中调用 `close()`；
- CSS 删除 `outline` 且无替代。

答案必须分别引用 Portal、HTML dialog、React Callback Ref 和 WCAG Focus Visible 合同。

## 十三、本科范围排除项

本实战不包含：

- `useEffect`、`useLayoutEffect`、Effect 依赖、Effect cleanup 或 Strict Mode Effect 重连；
- `forwardRef` 兼容实现、`useImperativeHandle`、自定义句柄或 Ref 合并工具；
- 自制 focus trap、可聚焦元素选择器、MutationObserver 或 roving tabindex；
- 第三方 dialog / focus-lock / floating-ui 组件库；
- 多层嵌套 modal、dialog manager、stack、队列或全局 overlay provider；
- `requestClose()`、`closedby`、light dismiss 的兼容性工程；正文可用一小段区分概念，但 Demo 不实现；
- Shadow DOM、iframe、跨 document Portal、浏览器 chrome 焦点细节；
- SSR、hydration、Server Components、streaming 或无 DOM 环境；
- 路由切换、异步请求、真实发布、权限、持久化、缓存或错误重试；
- 复杂表单、验证库、脏值拦截、乐观更新和撤销；
- screen reader 品牌差异、ARIA platform mapping 内部表或无障碍自动化工具原理；
- top layer 算法内部队列、close watcher 实现、React Fiber 或事件插件内部结构；
- 动画、View Transition、滚动锁、拖拽 dialog、可调整尺寸和定位引擎；
- WCAG 全量审计、法律合规结论或声称单个 Demo “完全无障碍”。

保留这些排除项并不降低主合同：键盘打开、初始焦点、背景 inert、Tab 边界、Escape、显式关闭、
`cancel` / `close` 区分、焦点恢复和可见焦点都必须完整实现和验证。[A01][W01][W02][W03][W04][W05]

## 十四、正文必须覆盖的知识结构

未来课程正文至少包含：

1. 可访问 modal 的五项核心责任：语义名称、进入焦点、背景不可操作、键盘退出、关闭后焦点。
2. Portal 与 `showModal()` 的职责区别。
3. `<dialog>`、top layer、`::backdrop` 和 inert。
4. `showModal()` 的连接前置条件与重复调用保护。
5. `close(result)`、`returnValue`、`cancel`、`close` 的准确顺序。
6. 为什么不直接控制 `open` 属性。
7. 原生 dialog 的隐式 role / modal 语义与 `aria-labelledby`。
8. `aria-describedby` 何时适合、结构化内容为何可省略。
9. 标题 `tabIndex={-1}` + `autoFocus` 的初始焦点选择。
10. Tab / Shift+Tab、Escape、可见关闭按钮和 focus visible。
11. 正常焦点恢复与触发器消失时的 fallback。
12. React 19 `ref` prop 从组件到 `<dialog>` 的转交。
13. Callback Ref setup / cleanup、Strict Mode 与 `dialog.open` guard。
14. 对象 Ref 发起 `close()`，原生 `close` 事件再撤下 React 子树。
15. 稳定 Portal host 的所有权与生命周期。
16. 无 Effect 实现为什么在本实战成立，以及边界在哪里。
17. Demo 全部事件序列、验收方法、易错清单和练习。

正文可以详细展开本课内容，不限制行数；表达必须直接，禁止用篇幅、计划或生产过程替代知识讲解。

## 核心结论

1. Portal 解决 DOM 落点，`showModal()` 才提供原生 modal 的 top layer、背景 inert 与聚焦行为。
   [R01][H01][H02]
2. 可访问对话框必须同时具备 accessible name、合理初始焦点、受限且有序的 Tab 路径、Escape 和可见
   关闭控件、关闭后逻辑焦点恢复。[A01][W02][W03][W04][W05]
3. `cancel` 是可阻止的 close request 事件；`close` 是关闭完成后的不可取消事件；按钮调用
   `close()` 不先触发 `cancel`。[H01][H07][H08]
4. React 只在 `close` 之后撤下 dialog 子树，避免绕过平台关闭、`returnValue` 和焦点恢复合同。[H01]
5. Callback Ref 提供 dialog 节点已经提交的 setup 时机；`dialog.open` guard 和对称 cleanup 让实现承受
   callback 更换与 Strict Mode 检查。[R02][R04][R06]
6. React 19 的 `ref` prop 让 `AccessibleDialog` 直接把调用方 Ref 转交给原生 `<dialog>`；Ref 暴露的
   是当前 `HTMLDialogElement`，不需要 `forwardRef` 或自定义命令式句柄。[R03][R04]
7. 本实战所有同步点都能由 Callback Ref、用户事件和原生 dialog 事件表达，因此不需要提前使用
   Effect。
