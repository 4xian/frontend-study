# useInsertionEffect 研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.intermediate.use-insertion-effect`
- 标题：`useInsertionEffect`
- 教学层级：中级
- 核验日期：`2026-08-11`
- 研究状态：官方调研、正文、Demo、全部 Gate、Catalog Admission、三视口浏览器验收、独立双轴复审、正式登记与登记后回归均已完成
- 官方文档基线：React `19.2`
- 仓库运行时基线：React / React DOM `19.2.8`
- 固定源码 tag：`v19.2.8`，commit `1dd4ecbdabf826f527fc9a58c05ea70375b7d170`
- RC2 路线 TypeScript 基线：`7.0.2`
- 当前本地类型 / 编译器快照：`@types/react` `19.2.18`、TypeScript `6.0.3`
- 前置课程：`react.core.learn.intermediate.use-layout-effect`（第 28 课，已发布）
- 后续课程：无；本课是 RC2 第 29 课终点
- 当前路线状态：第 1-29 课均为 `available`，权威进度 `29/29`；RC2 路线完成并停止

### 当前正式资产核对

- 第 28、29 课均已在 `react-core-track.ts`、entry manifest 与 demo manifest 登记为 `available`。
- 本课正文位于 `src/categories/frontend/react/core/learn/use-insertion-effect.md`，同源 Demo 位于
  `src/categories/frontend/react/core/demos/use-insertion-effect/`。
- 第 29 课已在全部 Gate 和独立复审通过后完成原子登记；当前只执行登记后回归与最终清理。

本课唯一主线是：**CSS-in-JS 库作者在组件的 layout Effects 运行前插入运行时样式，避免其他 Effect 基于旧样式进行布局读取；它不是普通应用的默认 Effect，也不是更早的 DOM 操作 Hook。**

## 与相邻课程的硬边界

| 课程 | 主线 | 第 29 课边界 |
| --- | --- | --- |
| 第 27 课 `custom-hooks` | 复用有状态逻辑，但每次调用保有独立 State | 不抽取 CSS-in-JS Hook 作为状态复用案例，不讨论自定义 Hook 设计 |
| 第 28 课 `use-layout-effect` | 浏览器绘制前读取已提交 DOM 布局并同步修正 | 只作时机对照；不测量布局、不更新 State、不把插入 Effect 当作布局 Effect |
| 第 29 课 `use-insertion-effect` | CSS-in-JS 库作者在 layout Effects 前插入样式 | 只冻结样式插入与清理时机及其限制，不扩展为通用副作用课程 |

本课可使用 `useState` 保存 Demo 的样式模式，以触发规则替换；但 `useInsertionEffect` callback 内不得调用 State setter。
本课不使用 `useLayoutEffect`、`useEffect`、`useEffectEvent`、Ref、DOM 布局读取、`ResizeObserver`、事件监听、timer、Promise、
`requestAnimationFrame`、动画、Portal、Context、Reducer、memoization、外部 store、网络、随机数或 lint 抑制。运行时 `<style>`
标签只允许在插入 Effect 中创建、更新和清理；不在 render、事件处理器或模块初始化时写入样式。

## 调研问题

1. React 19.2 如何定义 `useInsertionEffect` 的参数、清理和依赖语义？
2. 为什么它只面向 CSS-in-JS 库作者，而不是普通组件的默认选择？
3. 它与 layout Effects 的相对时机是什么，为什么不能假设 Ref 已挂载或 DOM 已更新？
4. 动态样式为什么必须在插入 Effect 中完成，而不是 render、`useLayoutEffect` 或 `useEffect`？
5. 服务端渲染、State 更新和 cleanup/setup 交错行为有哪些边界？
6. TypeScript、AST、浏览器与独立复审各自能验证哪些部分？

## 官方 canonical 核验

当前代理会话未暴露 Tavily 工具，因此没有进行关键词搜索。按已知官方入口直接使用
`curl -L --fail --silent --show-error` 回读 `react.dev` 的 React 19.2 文档，并使用 GitHub 固定 tag 的源码核验
patch 级实现。`git ls-remote` 确认 `v19.2.8` 指向 `1dd4ecbdabf826f527fc9a58c05ea70375b7d170`。第三方文章、
搜索摘要、Issue 与浮动 `main` 均不作为课程事实来源。

## 官方事实与证据矩阵

| ID | 来源 | 版本 | 支撑结论 |
| --- | --- | --- | --- |
| S1 | [`useInsertionEffect` Reference](https://react.dev/reference/react/useInsertionEffect) | React 19.2 | setup 在组件加入 DOM 后、任何 layout Effect 运行前执行；依赖变化时先 cleanup 再 setup；卸载时执行 cleanup |
| S2 | [`useInsertionEffect` Caveats](https://react.dev/reference/react/useInsertionEffect#caveats) | React 19.2 | 仅客户端运行；不能在其中更新 State；Ref 尚未挂载；不能依赖 DOM 已在某个特定时机更新；cleanup/setup 按组件交错执行 |
| S3 | [Injecting dynamic styles from CSS-in-JS libraries](https://react.dev/reference/react/useInsertionEffect#injecting-dynamic-styles-from-css-in-js-libraries) | React 19.2 | CSS-in-JS 有静态提取、内联样式和运行时 `<style>` 注入三类方案；官方推荐前两类，必须运行时注入时在插入 Effect 中完成 |
| S4 | [How is this better than injecting styles during rendering or useLayoutEffect?](https://react.dev/reference/react/useInsertionEffect#how-is-this-better-than-injecting-styles-during-rendering-or-uselayouteffect) | React 19.2 | render 期间注入可能在非阻塞更新的每一帧触发样式重算；插入 Effect 让其他 Effect 运行时已能看到样式 |
| S5 | [`useEffect` Reference](https://react.dev/reference/react/useEffect) | React 19.2 | 普通 Effect 是常规默认选择；本课只在 CSS-in-JS 插入时机上作边界对照 |
| S6 | [`useLayoutEffect` Reference](https://react.dev/reference/react/useLayoutEffect) | React 19.2 | layout Effect 用于读取布局等绘制前工作；本课不能把插入 Effect 当作布局测量 API |
| S7 | [`ReactHooks.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/ReactHooks.js#L103-L117) | React `v19.2.8` | 公共 Flow 签名接收 Effect callback 与可选依赖，返回 `void`，并转交当前 dispatcher |
| S8 | [`ReactFiberHooks.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js#L2757-L2769) | React `v19.2.8` | mount/update 路径使用独立的 `HookInsertion` 标签 |
| S9 | [`ReactFiberCommitWork.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberCommitWork.js#L2012-L2024) | React `v19.2.8` | mutation 提交中先卸载并挂载 insertion effects，再进入 layout-effect 的卸载阶段；实现佐证不等于应用层私有 API |

## 版本与类型基线

- `react.dev` 页面标记 React `19.2`，不声称它是 `19.2.8` 文档快照；patch 级实现事实只引用固定 tag / commit。
- React core 使用 Flow。`ReactHooks.js` 的 `useInsertionEffect` 签名为
  `create: () => (() => void) | void`、`deps: Array<mixed> | void | null`，返回 `void`；不能把本地 TypeScript 声明误写为 React core 源码。
- 仓库锁定的 `@types/react` 为 `19.2.18`。TypeScript 能验证样式模式、字符串规则、cleanup 函数和依赖值的类型，
  但不能证明 callback 位于 layout Effect 前、State setter 未被调用、Ref 尚未挂载或 DOM 更新时机不可依赖；这些由官方合同、AST 和浏览器 Gate 覆盖。

## 研究结论

### 1. 插入 Effect 是 CSS-in-JS 的时机适配层

组件若使用静态 CSS 或普通 inline style，不需要额外 Hook。只有 CSS-in-JS 库在运行时必须把动态规则写入 `<style>` 标签时，
才需要一个比 layout Effect 更早的提交阶段，让同一提交中其他组件的 layout Effect 看到最新规则（S1、S3、S4）。运行时注入本身可能触发更多样式重算，
因此官方推荐静态提取或 inline style；`useInsertionEffect` 只解决“注入时机错误”这一项，而不是让运行时注入变成首选方案（S3）。

### 2. callback 只负责插入与清理，不负责读取或更新组件状态

`setup` 可以创建 `<style>`、写入 CSS 文本并挂入目标文档；依赖变化时应清理旧节点再插入新规则，卸载时也应清理。官方明确禁止在 callback 内更新 State，
因为插入阶段不是用于驱动新的渲染（S1、S2）。样式模式 State 可以存在于组件并作为依赖，但 setter 必须在事件处理器或其他合适的数据流中调用，不能从插入 Effect 反向写入。

在开发态固定实现中，插入 Effect 期间调度更新会输出 `useInsertionEffect must not schedule updates.` 诊断；它不是课程可以依赖的同步 `throw` 或生产态拦截机制。
课程应把“不得更新 State”表述为 React 的公开 API 合约（S2），而非编造某个版本必然抛出的运行时行为。

### 3. 不能依赖 Ref 或 DOM 的精确更新时机

插入 Effect 的唯一时序承诺是早于 layout Effects；官方同时明确 Ref 尚未挂载，且 callback 可能在 DOM 更新前或更新后运行（S2）。
所以 callback 不应读取 `ref.current`、调用 `getBoundingClientRect()`、查询刚渲染的节点或修改业务 DOM。它应只操作 CSS-in-JS 库自己管理的样式资源，并把 DOM 更新时机留给后续阶段。

### 4. 与 render、layout Effect 和普通 Effect 的边界

render 期间注入会在可中断的非阻塞更新中反复触发样式重算；放在 `useLayoutEffect` 或 `useEffect` 又可能让其他布局读取先看到旧样式（S4）。
插入 Effect 只在库确实需要运行时样式注入时承担这个窄职责。普通应用中的数据获取、事件订阅或一般 DOM 副作用应继续使用 `useEffect`；需要读取布局的组件应使用已发布的 `useLayoutEffect` 课程，不能用本课替代。

### 5. SSR 与 cleanup/setup 交错是公开边界

Effects 不在服务端渲染运行；若 CSS-in-JS 需要 SSR 收集规则，应在 render 数据流中单独收集，不能等待插入 Effect（S2、S3）。
与其他 Effect 的批量 cleanup/setup 不同，插入 Effect 按组件交错执行 cleanup 与 setup；库的资源管理必须能承受旧规则清理后立即插入新规则的过程（S2）。

### 6. 固定源码只解释实现分层，不扩大用户合同

React 19.2.8 的公共 Hook 通过 dispatcher 分派，reconciler 用 `HookInsertion` 建立 mount/update 路径（S7、S8）。提交变更时，
实现先执行 insertion cleanup/setup，再进入 layout-effect 的清理阶段（S9）。这解释了公开的相对时机，但不允许 Demo 或正文读取 Fiber、effect tag、
dispatcher 或调度器私有状态；官方文档才是应用层可依赖的合同。

## 高价值易错点

1. **把 `useInsertionEffect` 当成普通组件的默认 Effect。** 触发条件是普通组件直接用它处理数据或 DOM 副作用；原因是忽略官方只面向 CSS-in-JS 库作者的范围；后果是把不需要的同步插入阶段带入应用；正确做法是静态 CSS、inline style 或 `useEffect`。
2. **在 callback 中调用 State setter。** 触发条件是把样式插入后顺手更新组件状态；原因是插入阶段不支持 State 更新；后果是违反公开 Hook 合同；正确做法是由外部事件或正常渲染数据决定样式规则。
3. **在 callback 中读取 Ref 或布局。** 触发条件是访问 `ref.current`、`getBoundingClientRect()` 或业务 DOM；原因是 Ref 尚未挂载且 DOM 更新时机没有承诺；后果是空 Ref、旧节点或不稳定布局读数；正确做法是把布局读取交给 `useLayoutEffect`。
4. **在 render 中直接写 `<style>`。** 触发条件是 JSX 渲染期间把新规则追加到 `document.head`；原因是 render 可能被中断或重复执行；后果是每帧重算、重复节点和难以清理；正确做法是把运行时注入集中在插入 Effect，并实现 cleanup。
5. **把运行时 `<style>` 注入当成首选 CSS 方案。** 触发条件是所有动态样式都走该 Hook；原因是忽略官方对静态提取与 inline style 的优先建议；后果是额外样式重算和生命周期成本；正确做法是仅在库的运行时注入确有必要时使用。
6. **把 DOM 一定已经更新写进 callback。** 触发条件是通过查询刚渲染节点推断当前结构；原因是官方允许 callback 在 DOM 更新前或后运行；后果是依赖实现细节导致版本或并发更新不稳定；正确做法是只管理样式资源，不依赖 DOM 时序。

## 确定性同源 Demo 合同

### 资产登记

- Demo ID：`react.core.learn.intermediate.use-insertion-effect.css-in-js-style-insertion-demo`
- 运行与展示源码：`src/categories/frontend/react/core/demos/use-insertion-effect/css-in-js-style-insertion-demo.tsx`
- 样式：`src/categories/frontend/react/core/demos/use-insertion-effect/css-in-js-style-insertion-demo.css`
- 登记前 Admission 使用隔离 overlay；全部 Gate 与独立复审通过后，entry / demo manifest 已正式登记，
  track 已切为 `available`

### 数据与组件合同

1. `CssInJsStyleInsertionDemo` 顶层声明一个 `styleMode` State，初始为 `neutral`；只用它选择两套固定 CSS 规则，不在插入 Effect 中更新 State。
2. 组件顶层恰好调用一次 `useInsertionEffect`，依赖数组精确为 `[styleMode]`。callback 创建带稳定 `data-course-style` 标记的 `<style>`，写入当前模式规则，追加到 `document.head`，并返回只移除本次节点的 cleanup。
3. callback 只调用 `document.createElement('style')`、设置 `dataset` / `textContent`、`document.head.appendChild` 和 cleanup 的 `remove`；不得读取 `ref`、布局、业务 DOM 或组件状态 setter，不得在模块初始化或事件 handler 写入样式。
4. 页面显示一个使用当前 CSS class 的受控卡片、当前模式和“样式节点已由插入 Effect 管理”的状态说明；按钮只切换 `styleMode`。两种规则至少改变卡片的背景色、边框和内边距，变化来自 `<style>` 规则而非 inline style。
5. 冷启动为 `neutral`，页面稳定后恰有一个 `data-course-style` 样式节点且卡片已应用中性规则；切换到 `accent` 后旧节点被清理、同一标记的新节点生效，卡片计算样式变化；再切回 `neutral` 恢复初始规则。
6. 离开课程再进入恢复 `neutral`，不残留上一轮样式节点；Strict Mode 重复 setup/cleanup 不得留下重复节点。
7. Demo 不使用 `useEffect`、`useLayoutEffect`、`useEffectEvent`、Ref、State setter（插入 Effect 内）、DOM 测量、`ResizeObserver`、事件监听、timer、Promise、网络、Context、Reducer、memoization、随机数、动画、Portal 或 lint 抑制；CSS 不使用 `grid`、`gap` 或非零 `letter-spacing`。
8. 运行组件与“查看源码”加载同一 TSX 文件；以 `trimEnd()` 后字符数、UTF-8 字节数和 SHA-256 验证同源。浏览器只读取可见 DOM、公开样式节点和计算样式，不读取 React 私有实现。

### 可观察路径

1. 冷启动为 `neutral`，卡片可见样式已生效；`data-course-style` 节点数量为 1，节点文本包含当前规则。
2. 切换 `accent`：按钮状态、卡片计算样式和 style 节点文本同步变化；节点数量仍为 1，无旧规则残留。
3. 切回 `neutral`：卡片恢复初始计算样式，节点数量仍为 1；不存在第二套注入通道。
4. 离开课程再进入：恢复 `neutral`，style 节点重新由当前实例创建；无上次会话遗留节点。
5. 浏览器能证明公开 DOM 的最终样式与 cleanup 结果；插入 Effect 先于 layout Effects 的精确调度顺序由 S1/S2 与固定源码支持，不通过截图臆测绘制帧。

## 正文 Markdown Gate

- frontmatter 的 ID、标题、stage、level、前置课程和 React 19.2 来源必须与本研究合同一致；正文按课程规范的固定章节顺序编写，Demo ID 精确对应同源 Demo。
- 学习目标、核心概念、示例、约五个受控 pitfalls、源码推导、练习、小结和参考资料只服务“CSS-in-JS 运行时样式在 layout Effects 前插入”这一条主线。
- 正文必须明确 `useInsertionEffect` 只面向 CSS-in-JS 库作者、官方不推荐泛化运行时 `<style>` 注入、callback 不能更新 State，以及 Ref / DOM 更新时机限制。
- 与 `useLayoutEffect` 的对照只能说明“布局测量应留给另一课”；不得导入、创建或展示布局测量、Ref 或 State 更新的替代 Demo。
- 学习者正文不得出现本地版本、临时脚本、Gate、哈希、构建或复审过程，不得引入冻结边界外的第二知识点。

## 临时 TypeScript 7.0.2 Gate

实施阶段使用 `mktemp -d /tmp/use-insertion-effect-ts.XXXXXX` 创建唯一临时目录，fixture 从只读链接解析当前 React 类型；验证后删除该目录并用 `test ! -e` 检查准确路径不存在。不得把 fixture、依赖链接或输出写入仓库。命令合同：

```sh
npx --yes --package typescript@7.0.2 tsc \
  --ignoreConfig --jsx react-jsx --strict --noEmit --skipLibCheck \
  --moduleResolution node16 --module node16 --target es2022 --esModuleInterop \
  "$lesson29_fixture_dir/fixture.tsx"
```

fixture 最少验证：

- `styleMode` 是 `'neutral' | 'accent'`，`useInsertionEffect` callback 可以创建并清理 `HTMLStyleElement`，依赖数组包含当前模式；
- cleanup 的返回类型为 `() => void`，样式文本为 `string`，模式 setter 只在组件事件数据流中使用；
- 一条 `@ts-expect-error` 覆盖把数字写入 `style.textContent`，不扩张为多条类型测试；
- TypeScript 不能证明 Hook 顶层调用、插入先于 layout Effects、callback 未调用 State setter、Ref 尚未挂载、DOM 更新时机不可依赖或运行时样式节点不会重复；这些由 AST、官方合同与浏览器 Gate 覆盖。

## 临时 AST / 语义 Gate

对同一冻结 snapshot 的 TSX / CSS 编写最小 TypeScript AST / Node 断言，临时脚本只放 `/tmp`：

- TSX 只从 `react` 导入 `useInsertionEffect` 和用于受控切换的 `useState`；`CssInJsStyleInsertionDemo` 顶层恰好一次 `useInsertionEffect`、一次 `useState`，无自定义 Hook、子组件或条件 Hook 调用；
- 唯一插入 Effect 的 callback 内创建一个 `<style>`、设置稳定数据标记和 `textContent`、追加到 `document.head`，并返回移除本节点的 cleanup；第二参数只能是字面量内联数组 `[styleMode]`；
- callback 内不存在 State setter、`useRef`、`ref.current`、`getBoundingClientRect`、`querySelector`、`getComputedStyle` 或业务 DOM 读取；所有 style 节点写入只位于该 callback；
- 事件 handler 只能更新 `styleMode`，不能创建、追加或移除 style 节点；render 不得访问 `document`、`window` 或 `document.head`；
- 不存在 `useEffect`、`useLayoutEffect`、`useEffectEvent`、`ResizeObserver`、`MutationObserver`、`requestAnimationFrame`、timer、Promise、网络、动画、Portal、Context、Reducer、memoization、外部 store 或 eslint / oxlint 抑制；
- 新增函数和组件上方都有简洁中文职责注释；CSS 禁止 `grid`、`gap` 与非零 `letter-spacing`；
- 运行 TSX 与展示源码来自同一文件，`trimEnd()` 后字符数、UTF-8 字节数和 SHA-256 完全一致。

## 工程与 Catalog Admission Gate

正文 / Demo 实施与发布阶段必须在同一冻结 snapshot 执行：

```sh
npm run type-check
npm run lint
npm run format:check
npm run build
npm run test:unit
npm run test:e2e
git diff --check -- docs/research/frontend/react/intermediate/use-insertion-effect.md \
  src/categories/frontend/react/core/learn/use-insertion-effect.md \
  src/categories/frontend/react/core/demos/use-insertion-effect/
```

不得新增持久测试、fixture、截图、trace 或浏览器输出。浏览器 Admission 前若课程仍未正式登记，只能在 `/tmp` 隔离快照或可恢复临时 overlay 中登记本课 entry / demo；必须记录 overlay 前后 track、entry manifest、demo manifest 哈希。冷会话验收完成后恢复第 29 课 `planned` 基线，并确认临时目录不存在。

## 三视口 Admission Gate

实施后使用 Playwright 冷会话从 `about:blank` 进入本课，监听 HTTP、console error/warning、page error、失败请求与 `4xx/5xx`：

1. `1440x900`：记录冷启动 `neutral` 卡片的计算样式与 style 节点；完成 `neutral -> accent -> neutral`，每一步卡片计算样式、可见模式、style 文本和唯一节点约束一致；离开再进入恢复 `neutral`。
2. `390x844`：重复完整路径；课程目录、模式按钮、卡片、状态和源码无横向溢出、裁切或遮挡；`document.documentElement.scrollWidth` 与 viewport 宽度相等。
3. `390x844 + 200%`：冷导航前将根字号设为 `32px`，重复模式切换；文本可换行、按钮可操作，页面与 Demo 横向滚动均为 `0`，不依赖固定像素高度。
4. 三种视口都核对运行 TSX 与展示源码同源；重新进入恢复冷状态，console error/warning、page error、失败请求和动态请求均为 `0`。浏览器只读取公开 DOM、样式节点和计算样式，不读取 Fiber、dispatcher 或 Effect tag。

## 独立 Standards / Spec 双轴复审

### Standards 轴

独立复审者按课程内容规范、Demo 与交互规范和本研究记录检查：单知识点固定结构、React 19.2 / 19.2.8 版本分层、TypeScript 7.0.2 Gate、中文职责注释、同源源码、三视口无溢出、CSS 禁用项、无持久临时资产，以及第 27-29 课边界。任何 finding 都保持第 29 课 `planned`，不能由页面可运行抵销。

### Spec 轴

独立复审者只检查冻结主线：是否只在 `useInsertionEffect` 中创建、追加和清理运行时样式；是否只面向 CSS-in-JS 库作者；`neutral -> accent -> neutral` 是否无旧节点、重复节点或 stale rule；是否明确不能更新 State、依赖 Ref 或 DOM 更新时机；是否出现布局测量、业务 DOM 读取、render 写样式、通用 Effect 或第二知识点。两轴必须对同一冻结 SHA 分别达到 `PASS / 0 finding`。

## planned -> available 原子条件

只有以下条件在同一冻结 snapshot 全部通过，才允许发布第 29 课：

1. 本研究记录、课程正文、同源 TSX / CSS、Markdown / TypeScript / AST Gate、工程命令、临时 Catalog Admission、三视口浏览器证据和独立双轴复审均齐全；
2. Standards 与 Spec 均为 `PASS / 0 finding`，且复审 SHA 与所有 Gate、源码同源哈希完全一致；
3. 在一次原子变更中登记第 29 课 entry 与 Demo，把 track 第 29 课从 `planned` 切为 `available`，权威进度从 `28/29` 更新为 `29/29`，并将 RC2 计划标记为 `29/29`、路线完成；
4. 原子登记后重新冷启动 Catalog，重跑工程 Gate、build 与本课生产路径；任一失败必须整体保持或恢复为第 29 课 `planned`，不得提前写成部分发布；
5. 登记后回归、复审记录同步与临时资源清理完成后，本批次才可停止；不得继续创建高级课程、Reference 或其他 React 资产。

## 实施与 Admission 证据

- 课程正文、同源 TSX 与 CSS 已按冻结合同创建；TypeScript `7.0.2` fixture 与 AST / CSS Gate 通过，确认唯一
  `useInsertionEffect`、唯一 `useState`、精确依赖 `[styleMode]`、唯一运行时样式写入通道，以及 callback 内无 setter、Ref、
  布局读取或业务 DOM 查询。临时 Gate 目录已删除并确认不存在。
- 登记前实际工作区的 type-check、lint、全量 format、unit、e2e 与 scoped diff check 通过；隔离 Admission 副本的生产构建转换
  `1561` 个模块。独立复审通过后，真实工作区已原子登记 entry manifest、demo manifest 与 track。
- `1440x900`、`390x844` 与 `390x844 + 根字号 32px` 均完成 `neutral -> accent -> neutral`。中性规则为
  `20px / 2px / rgb(241, 245, 244)`，强调规则为 `28px / 4px / rgb(255, 240, 232)`；每一步样式节点数均为 `1`，
  离开课程后为 `0`，重新进入恢复中性模式。
- 三种视口的页面、Demo 与按钮横向溢出均为 `0`；有效 200% 会话确认根字号为 `32px`，课程标题在 `42px` 下完整单行，
  console error/warning、page error、失败请求与 `4xx/5xx` 均为 `0`。
- 运行 TSX 与页面“查看源码”的 `trimEnd()` 指纹一致：`2317` 字符、`2647` UTF-8 字节、SHA-256
  `7f67bd9add8fe67fd4eb473881e88b49969f9e76370da757a6206ce6b5ab0196`。
- 正式登记后重新通过 type-check、lint、全量 format、unit、e2e、scoped diff check 与生产 build；build 转换
  `1561` 个模块。正式生产路由在三种视口重新完成完整模式切换，style 节点数始终为 `1`，离页后为 `0`，
  重进恢复中性模式；页面、Demo 与按钮横向溢出均为 `0`。
- 登记后有效 200% 会话确认根字号 `32px`、标题 `42px` 且完整单行；运行与展示源码指纹保持不变，console
  error/warning、失败请求和 `4xx/5xx` 均为 `0`。

## 临时资源清理与 Stop Boundary

- 所有 fixture、AST runner、隔离项目、Catalog overlay、Playwright screenshot/trace 和浏览器输出只放本轮 `mktemp` 目录或 `/tmp`；验证后删除，并以准确路径执行不存在性检查。
- 预览服务和 Playwright 会话在验收后必须关闭；不得误删其他课程或并行代理的临时资产。
- 不使用 `rm -f`，不暂存、不提交、不推送、不 stash、不 reset，不格式化或清理无关 dirty worktree。
- 本研究子批次的 hard stop 是“研究稿新增、scoped Prettier、scoped diff check 和只改一文件核对完成”。本研究稿不能单独被当作第 29 课已经实现或发布的证据。
- 完整第 29 课批次的最终 stop 是“正式登记后回归与 signoff 完成，路线达到 `29/29`”；之后不得进入高级课程或 Reference。

## 当前结论

- `useInsertionEffect` 是 CSS-in-JS 库作者在 layout Effects 前插入运行时样式的窄 API；官方推荐静态提取和 inline style，只有必须运行时注入时才使用（S1-S4）。
- callback 只能管理样式资源的插入和清理，不能更新 State、依赖已挂载 Ref，或假设 DOM 在某个特定时刻已更新（S1、S2）。
- React 19.2.8 固定实现通过 dispatcher 和 `HookInsertion` 路径调度，并在 mutation commit 中先处理 insertion effects，再进入 layout-effect 阶段；这是源码佐证，不是可读取的用户 API（S7-S9）。
- 本课已正式登记并完成登记后回归，路线为 RC2 `29/29`；临时资源清理后停止，不进入高级课程或 Reference。

## 参考资料

1. [`useInsertionEffect` Reference](https://react.dev/reference/react/useInsertionEffect) - 参数、清理、依赖、限制、CSS-in-JS 用法和时序边界。
2. [`useEffect` Reference](https://react.dev/reference/react/useEffect) - 普通 Effect 的默认边界，仅作选型对照。
3. [`useLayoutEffect` Reference](https://react.dev/reference/react/useLayoutEffect) - 布局读取的相邻课程边界。
4. [React v19.2.8 `ReactHooks.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/ReactHooks.js#L103-L117) - 公共 Flow 签名与 dispatcher 转发。
5. [React v19.2.8 `ReactFiberHooks.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js#L2757-L2769) - `HookInsertion` mount/update 路径。
6. [React v19.2.8 `ReactFiberCommitWork.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberCommitWork.js#L2012-L2024) - insertion 与 layout 阶段的固定提交顺序佐证。
