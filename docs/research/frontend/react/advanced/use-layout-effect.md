# useLayoutEffect 官方调研

## 结论摘要

`useLayoutEffect` 是在组件提交 DOM 后、浏览器重绘前运行的布局 Effect。它只适合这样的窄场景：
最终可见结果依赖刚提交节点的真实布局，并且产品不能接受用户先看到错误几何、再看到修正后的跳动。

本课需要建立以下判断：

1. 公共签名是 `useLayoutEffect(setup, dependencies?)`；`setup` 可返回 cleanup，Hook 本身返回
   `undefined`。`@types/react@19.2.18` 将其建模为返回 `void`。
2. React 先完成第一次 render 和 DOM 提交，再运行布局 Effect；读取布局并同步更新 State 后，React
   进行第二次 render 和提交，最后才让浏览器显示结果。
3. 布局 Effect 及其安排的 State 更新会阻塞重绘。两次 render 和布局读取都不是免费的，因此
   `useEffect` 仍是默认选择。
4. 依赖变化时先用旧值执行 cleanup，再用新值执行 setup；卸载前还会执行一次 cleanup。依赖必须
   内联、长度固定并包含全部响应值，React 使用 `Object.is` 逐项比较。
5. Strict Mode 会在开发环境为首次挂载额外执行一次 `setup -> cleanup` 压力测试，再执行真实 setup；
   生产环境不能依赖额外次数。
6. `useInsertionEffect` 是 CSS-in-JS 库的样式插入 API。它运行在 layout Effects 之前，但此时 Ref
   尚未挂载、不能更新 State，也不能依赖 DOM 已在某个确定时刻更新，不能拿来做布局测量。
7. Effect 不在服务端渲染期间运行。React `19.2.8` 的 Fizz dispatcher 把 `useLayoutEffect` 设为
   no-op；旧的服务端警告已由 React 官方 PR #26395 移除，因此不能宣称 React 19.2.8 必然输出该警告。
8. 组件库可以把重复的测量协议封装为自定义 Hook，但封装不会创造服务端布局，也不会自动解决
   SSR 首屏跳动。库必须公开输入、依赖、cleanup、返回值和客户端边界。

## A17 冻结合同

| 项目 | 冻结值 | 说明 |
| --- | --- | --- |
| 新路线批次 | `A17` | 权威计划中的高级阶段第 17 个批次 |
| 稳定课程 ID | `react.core.learn.intermediate.use-layout-effect` | 从中级后移，按计划保留旧 ID |
| 目标阶段 | `advanced` | 调研文件迁移到 `docs/research/frontend/react/advanced/` |
| 标题 | `useLayoutEffect` | 不扩展成通用 Effect、DOM 或 SSR 课程 |
| 前一批 | A16 `useImperativeHandle` | 只作为路线前置，不在本课复讲 |
| 后一批 | A18 `hydrateRoot` | 本调研不调查、不预写 A18 |
| 权威进度 | 新路线 `65/74` | 权威计划把 A17-A24、AL5 标记为未开始，下一课是 A17 |
| 核验日期 | `2026-08-18` | 本轮第一方来源核验日期 |

仓库已有旧路线正文、Demo 和 manifest 登记，但 `available` 只证明历史课程曾发布，不等于 A17 已按
新路线完成。本文只是 A17 调研资产，不修改也不替代正文、Demo、manifest、Track、计划、浏览器验收、
独立复审或 signoff。

### 本课必须覆盖

- 签名、参数、cleanup、依赖比较和返回值。
- 提交后、重绘前的布局测量，以及同一可见结果的两次 render。
- 阻塞绘制的成本和 `useEffect` 默认选择。
- Strict Mode 开发期 setup/cleanup 压力测试。
- 浮层、提示框等视觉定位为什么需要真实高度或边界矩形。
- `useEffect`、`useLayoutEffect`、`useInsertionEffect` 的选择边界。
- SSR 不运行、旧警告与 React 19.2.8 的版本差异、客户端内容边界。
- 组件库自定义 Hook 的封装责任和 SSR 支持合同。
- 高价值常见错误和现有 Demo 的可观察目标。

### 明确排除

- A18 及以后批次的知识内容。
- 通用 Effect 教程、Effect Event、外部 store、Portal、动画、Observer、滚动监听和网络同步。
- CSS-in-JS 运行时、样式缓存和 `useInsertionEffect` 的完整实现。
- 框架专用的 Client Component 指令、路由加载策略和 RSC 架构。
- React 私有 Fiber、lane、scheduler 或浏览器渲染管线的完整教程。
- 性能基准数字；没有固定设备、页面和 trace 时只采用 React 官方的定性成本结论。

## 调研过程与证据边界

1. 按仓库规则先使用 Tavily，并限制 `react.dev`、React 官方 GitHub、CSSWG 和精确包来源。Tavily
   找到 `useLayoutEffect` Reference、SSR troubleshooting 和 CSSOM View 规范入口；搜索摘要只用于
   发现候选，最终结论回到原始文档、源码、测试、PR 和类型文件。
2. 固定 React 文档到
   `reactjs/react.dev@c7d6b700038c63d1aaf2c649af1aefe01ebbacac`。GitHub commit API 确认该
   提交存在；固定内容与当前 React 19.2 页面在本课范围内一致。
3. 固定 React / React DOM 到 `v19.2.8`，tag commit 为
   `1dd4ecbdabf826f527fc9a58c05ea70375b7d170`。源码与官方测试只解释该 patch 的实现和测试事实，
   不扩大公共 API 承诺。
4. 类型固定为 `@types/react@19.2.18`。精确 npm 类型文件与当前仓库安装文件的 SHA-256 都是
   `814d5c7384f3ca276e9dc4bcfde5545801a3ea0bfae09916b3336774e662fd1b`；类型只能证明静态签名，
   不能证明浏览器实际 paint 时机。
5. GitHub 匿名 contents API 在并发读取时曾返回 `403`；随后通过已知固定 URL 和 jsDelivr 的固定
   commit 镜像读取同一官方仓库文件。该接替只改变读取通道，不降低来源层级。
6. 第三方文章、社区 Hook、浮动 `main`、搜索摘要和旧 warning 文案均不承担课程事实证明。

## 官方来源卡

| 编号 | 第一方或标准来源 | 固定范围 | 支撑事实 |
| --- | --- | --- | --- |
| S1 | [`useLayoutEffect` Reference](https://react.dev/reference/react/useLayoutEffect) | React 文档 `19.2` | 签名、返回值、提交后/重绘前时机、依赖、cleanup、阻塞成本、Strict Mode、两次 render、SSR 方案 |
| S2 | [固定 `useLayoutEffect` API](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/useLayoutEffect.md#L21-L68) | `react.dev@c7d6b700...` | setup、cleanup、依赖、`Object.is`、返回值与 caveats |
| S3 | [固定两次 render 模型](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/useLayoutEffect.md#L73-L122) | `react.dev@c7d6b700...` | Tooltip 的第一次提交、测量、立即重渲染和最终显示 |
| S4 | [固定 SSR troubleshooting](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/useLayoutEffect.md#L717-L741) | `react.dev@c7d6b700...` | 服务端无布局、`useEffect`、client-only、hydration 后挂载和外部 store 四类边界 |
| S5 | [固定 `useEffect` caveats](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/useEffect.md#L55-L71) | `react.dev@c7d6b700...` | 非交互通常先 paint、交互例外、State 更新仍可能在 paint 后及客户端限定 |
| S6 | [固定 `useInsertionEffect` 文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/useInsertionEffect.md#L5-L61) | `react.dev@c7d6b700...` | CSS-in-JS 库范围、早于 layout Effects、不能更新 State、Ref 未挂载、DOM 时机限制 |
| S7 | [固定自定义 Hook 文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/reusing-logic-with-custom-hooks.md#L214-L231) | `react.dev@c7d6b700...` | `use` 命名、只有组件和 Hook 可调用其他 Hook、封装浏览器 API 实现细节 |
| S8 | [自定义 Hook 独立性](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/reusing-logic-with-custom-hooks.md#L443-L450) | `react.dev@c7d6b700...` | 复用的是有状态逻辑，不是共享 State；每次调用独立 |
| S9 | [CSSOM View `getBoundingClientRect()`](https://drafts.csswg.org/cssom-view/#dom-element-getboundingclientrect) | CSSWG Living Draft | 返回覆盖元素 client rects 的最小 `DOMRect`，结果不是 live 对象 |
| S10 | [React 19.2.8 `ReactHooks.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/ReactHooks.js#L119-L132) | React `v19.2.8` | Flow 签名、`void` 返回和 dispatcher 分派 |
| S11 | [React 19.2.8 layout Hook 注册](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js#L2771-L2789) | React `v19.2.8` | `HookLayout`、`LayoutStaticEffect` 和开发期 `MountLayoutDevEffect` |
| S12 | [React 19.2.8 layout phase](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberWorkLoop.js#L3933-L3959) | React `v19.2.8` | host tree 已 mutation 后进入读取布局的 layout phase；仅作实现佐证 |
| S13 | [React 19.2.8 Strict Effects 测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/__tests__/StrictEffectsMode-test.js#L54-L115) | React `v19.2.8` | 开发期 layout/passive setup、cleanup、再次 setup 及更新/卸载顺序 |
| S14 | [读取已提交 host 内容的官方测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/__tests__/ReactHooksWithNoopRenderer-test.js#L3100-L3129) | React `v19.2.8` | layout Effect 观察到本次提交后的新 host 内容，而不是上一轮内容 |
| S15 | [布局 Effect 调度更新的官方测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/__tests__/ReactHooksWithNoopRenderer-test.js#L976-L1013) | React `v19.2.8` | setup 内的 State 更新立即形成后续 render 和 layout Effect |
| S16 | [React DOM Fizz 配置](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/server/ReactFizzConfigDOM.js#L116-L120)、[Fizz Hook dispatcher](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-server/src/ReactFizzHooks.js#L800-L845) | React DOM `v19.2.8` | DOM SSR 支持 client APIs；对应路径把 layout/passive Effects 设为 no-op |
| S17 | [React DOM 服务端 Hook 测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMServerIntegrationHooks-test.js#L640-L654)、[测试 helper](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/utils/ReactDOMServerIntegrationTestUtils.js#L81-L121) | React DOM `v19.2.8` | callback 未执行且服务端仍产出内容；helper 不能证明零条 warning 时的期望计数 |
| S18 | [移除服务端布局 Effect 警告 PR](https://github.com/facebook/react/pull/26395) | React 官方，2023-03-22 合并 | 官方移除旧 warning，并说明环境别名只绕过 warning、不能修复错误首屏 |
| S19 | [`@types/react@19.2.18`](https://unpkg.com/@types/react@19.2.18/index.d.ts) | npm 精确版本 | `EffectCallback`、`Destructor`、`DependencyList` 与 `useLayoutEffect(...): void` |

## 公共 API 与 TypeScript 合同

### 1. 签名和返回值

公开写法：

```tsx
useLayoutEffect(setup, dependencies?)
```

- `setup` 是无参数函数，包含布局 Effect 的同步逻辑。
- `setup` 可以不返回值，也可以返回无参数 cleanup 函数。
- `dependencies` 可选；它必须是内联、项目数固定的响应值列表。
- React Reference 说 Hook 返回 `undefined`；TypeScript 把返回类型写成 `void`。课程应解释两者表达
  的层次不同，不把 `void` 说成某个可读取的运行时值。

`@types/react@19.2.18` 的关键形状是：

```ts
type Destructor = () => void
type DependencyList = readonly unknown[]
type EffectCallback = () => void | Destructor

function useLayoutEffect(effect: EffectCallback, deps?: DependencyList): void
```

精确声明还用内部哨兵类型限制 cleanup 返回值；课程无需展示该内部技巧，但必须禁止 callback 返回
Promise、对象或其他业务值。

### 2. setup、cleanup 与依赖

初次客户端提交后，React 运行 setup。后续某项依赖按 `Object.is` 比较发生变化时，顺序是：

```text
旧 cleanup -> 新 setup
```

组件从 DOM 移除前，React 再执行最后一次 cleanup。纯粹读取一次几何并写入 State 的 setup 没有外部
订阅，通常不需要伪造空 cleanup；若 setup 建立监听、observer 或第三方连接，cleanup 必须撤销同一资源，
但这些扩展场景不进入 A17 Demo。

依赖三种形态不能混淆：

- 省略依赖：每次组件提交后都重新运行。
- `[]`：只适合 setup 不读取会随 render 改变的响应值；Strict Mode 开发期仍有额外压力测试。
- `[a, b]`：任一项变化时先 cleanup 再 setup。

Ref 对象身份通常稳定，但 `ref.current` 指向的是提交结果。若宽度模式、内容、锚点或其他 Props / State
会改变测量结果，就必须把对应响应值列入依赖；把真实依赖藏在自定义 Hook 中也不能省略它们。

### 3. Hook 调用位置

`useLayoutEffect` 只能在函数组件或自定义 Hook 顶层调用，不能放在条件、循环、事件回调、普通工具
函数或提前返回之后。若只有某个分支需要测量，应抽出只在该分支渲染的组件，让 Hook 在新组件顶层
无条件调用。

## 两次 render 与首次 paint

### 1. 官方 Tooltip 模型

官方示例的最终位置依赖 tooltip 的真实高度。第一次 render 还不知道高度，只能先输出一个可测量的
节点；节点提交后才能读取真实矩形，再用高度判断浮层应在锚点上方还是下方。

```text
render #1：高度未知，输出临时几何
    -> React 提交 DOM
    -> useLayoutEffect setup
    -> getBoundingClientRect() 读取已提交节点
    -> setState(真实高度)
    -> render #2：按真实高度计算最终位置
    -> React 再次提交 DOM
    -> 浏览器显示最终结果
```

React 公开保证布局 Effect 内代码和其中安排的 State 更新会在浏览器重绘前处理，因此用户不必看到
第一次错误位置。它没有保证任意异步工作、Promise continuation、timer 或网络结果也能加入同一
pre-paint 窗口。

官方 Tooltip 还区分了两类读取：已存在的锚点按钮可以在 `onPointerEnter` 中读取当前矩形；刚挂载的
tooltip 内容则要等本次提交后在布局 Effect 中测量。事件阶段测量不是一律错误，选择依据仍是目标节点
是否已经存在，以及本次新提交的错误中间几何能否被用户看见。

### 2. `getBoundingClientRect()` 的边界

CSSOM View 定义 `getBoundingClientRect()` 返回覆盖元素非零 client rects 的最小 `DOMRect`，且该对象
不是 live 对象。后续布局变化不会自动改写旧矩形；需要新几何时必须重新读取。

课程可以读取 `width`、`height`、`top`、`right`、`bottom`、`left` 做视觉定位，但不应把某次机器上的
固定像素值写成公共结果。字体、内容、容器宽度、缩放和样式都会影响布局。

### 3. 成本模型

使用布局 Effect 至少引入三类成本：

1. 第一次 render 和提交后还要测量，并可能触发第二次 render 与提交。
2. DOM 几何读取要求浏览器提供当前布局结果。
3. setup 及其 State 更新占用 pre-paint 关键路径，执行越久，用户越晚看到画面。

React 19.2 还明确说明：若布局 Effect 触发 State 更新，React 会立即执行所有剩余 Effects，包括
`useEffect`。这进一步要求测量和同步更新保持最小，不能把无关工作塞进同一 callback。

因此课程只采用 React 官方的定性判断：两次 render 和阻塞绘制会伤害性能，应尽量避免。没有本批
固定 trace 或基准，不声称某个毫秒阈值，也不把 `useLayoutEffect` 叫作“更快的 Effect”。

## Effect 选择

| 需求 | 首选 | 原因与边界 |
| --- | --- | --- |
| 只由 Props / State 推导 JSX | 普通 render | 不需要 Effect |
| 同步外部系统，允许先显示当前 UI | `useEffect` | 默认选择，不提供阻止本次 paint 的保证 |
| 读取已提交 DOM，且错误中间几何不能被用户看见 | `useLayoutEffect` | 测量与同步 State 更新位于 paint 前，但会阻塞 paint |
| CSS-in-JS 库必须在 layout Effects 之前插入样式 | `useInsertionEffect` | 仅库作者边界；Ref 未挂载、不能更新 State，不适合测量 |

`useEffect` 不能被简单描述为“永远在 paint 后”。React 19.2 文档明确指出：非交互更新通常允许浏览器
先 paint；交互触发的 Effect 可能在 paint 前运行；即使 Effect 本身在 paint 前，里面的 State 更新仍
可能留到 paint 后处理。A17 的选择依据不是猜测某次调度，而是是否必须阻止错误几何被画出。

`useInsertionEffect` 也不是“更早的 `useLayoutEffect`”。它的职责是先插入样式，使后续布局读取看到
正确样式；其 Ref 和 State 限制恰好排除了本课的测量协议。

## Strict Mode 与幂等性

开启 Strict Mode 时，React 在开发环境首次真实 setup 前额外执行一次 setup 和 cleanup。固定
`v19.2.8` 测试记录的关键序列是：

```text
layout setup -> passive setup -> layout cleanup -> passive cleanup
-> layout setup -> passive setup
```

这是一项压力测试，不是生产环境生命周期次数合同。由此得到三条课程要求：

1. setup 重复执行不能累积不可逆外部状态。
2. cleanup 必须精确撤销 setup 建立的资源，且容忍开发期很快执行。
3. 测量后设置同一个数值 State 通常会被 React 按相同值跳过，但不能依赖副作用计数只发生一次。

不要为了“让 Strict Mode 只运行一次”使用模块变量或 Ref 跳过第二次 setup；这会掩盖 cleanup 不对称，
并使真实卸载、重挂载和隐藏/恢复路径更难验证。

## SSR 与客户端边界

### 1. 服务端没有布局，Effect 不运行

服务端 renderer 生成 HTML 时没有浏览器布局可读。React 19.2 Reference 明确说 Effect 只在客户端
运行；固定 React 19.2.8 Fizz dispatcher 在支持客户端 API 的常规 SSR 路径把 `useLayoutEffect` 和
`useEffect` 映射为 no-op。官方服务端测试让 layout callback 一旦执行就抛错，但服务端仍成功输出内容，
佐证 callback 未运行。该测试用例
标题仍写着 “should warn” 并传入期望计数 `1`，但它调用的旧 helper 在 `console.error` 为零时不会执行
计数断言；因此本课只采用“不执行 callback、仍产出 HTML”这两项可证事实，不把它当作 warning 证据。

### 2. 不把旧 warning 写成 React 19.2.8 保证

React Reference 仍保留“`useLayoutEffect` does nothing on the server”故障排查标题，但 React 官方已在
2023 年合并 PR #26395，移除 core server renderer 的该 warning。PR 说明大量代码通过环境判断在服务端
把 `useLayoutEffect` 换成 `useEffect`，只是绕过 warning，并没有修复错误首屏。

因此 A17 应使用以下准确表述：

- React 18 时代、旧 renderer、框架或第三方工具可能仍显示该 warning。
- React 19.2.8 的公开事实是“服务端不运行”，不能要求或断言一定出现某条 warning。
- 诊断重点是 SSR HTML 是否在没有布局信息时仍有效，而不是终端有没有警告字符串。

### 3. React 官方给出的客户端边界

按页面是否能接受服务端初始内容选择：

1. 初始 HTML 本身有效，只是增强逻辑稍后执行：改用 `useEffect`，明确允许先显示初始结果。
2. 该组件本就只在交互后出现：按框架能力将其标为 client-only，并让最近 Suspense 边界提供 fallback。
3. 必须等 hydration 后才出现：先渲染不调用布局 Effect 的稳定 fallback，在客户端 `useEffect` 设置
   `isMounted` 后再挂载真实组件。
4. 实际需求是外部 store 的服务端快照一致性：使用支持服务端快照的 `useSyncExternalStore`，不要
   借布局 Effect 伪装。

这些方案都不能让服务端测到浏览器矩形；它们只是在正确的位置承认客户端能力边界。

## 组件库自定义 Hook 封装

React 允许自定义 Hook 调用其他 Hook，并规定 Hook 名以 `use` 开头。组件库可以把重复的“提交后测量、
按依赖重测、返回矩形”协议封装成 `useMeasuredRect` 一类语义 Hook。以下是由 S1、S4、S7、S8 得到的
课程工程推导，不是 React 新增的公共 API；封装需要满足以下合同：

1. 输入显式：接收要测量的 Ref，以及真正会改变测量结果的响应值或语义参数。
2. 输出显式：返回不可共享的本次调用结果，例如 `DOMRectReadOnly` 的必要字段或 `null`；不隐藏第二份
   全局可变状态。
3. 依赖完整：Hook 内部的布局 Effect 仍遵守相同依赖规则，不接收一个无法审计的“随便传数组”接口。
4. cleanup 对称：若库扩展到监听或 Observer，Hook 自己建立并销毁资源；A17 基础 Demo 不引入该扩展。
5. SSR 合同公开：声明“服务端返回什么”“hydration 前显示什么”“何时首次得到矩形”，而不是靠
   `typeof window` 切换 Hook 名掩盖边界。
6. 每次调用独立：自定义 Hook 复用的是逻辑，不共享 State。多个组件需要共享矩形时必须另建明确的
   State 所有权，而不是期待 Hook 调用自动联动。

封装的价值是把组件意图从底层浏览器 API 中分离，不是把 `useLayoutEffect` 普及成组件库的默认内部
实现。若消费者允许 paint 后增强，库仍应选择 `useEffect`；若服务端初始 UI 无效，应提供显式 client-only
组件或 fallback 合同。

## 高价值常见错误

| 错误 | 触发条件 | 原因与后果 | 正确判断 |
| --- | --- | --- | --- |
| 把布局 Effect 当作更快的 Effect | 任何 DOM 或视觉工作都用它 | 阻塞 paint，扩大关键路径 | 只有错误中间几何不可见时才用 |
| 在 render 中测量 | 组件函数直接读 Ref 几何 | 首次 render 尚未提交新 DOM，也破坏纯 render 边界 | 在顶层布局 Effect 中读已提交节点 |
| 在事件回调里伪造最终高度 | 点击时按模式写死像素 | 没有证明真实布局，字体/内容变化后失真 | 事件可读已存在锚点；新提交节点由布局 Effect 读取 |
| 漏掉几何依赖 | 内容、宽度或锚点改变，依赖仍为 `[]` | 旧 `DOMRect` 不是 live，显示值过期 | 列出会改变测量结果的响应值 |
| 每次 setup 都生成不同 State | 省略依赖并写入新对象 | 每次提交后重跑，可能形成无限更新 | 依赖明确，必要时只保存实际需要的标量 |
| cleanup 与 setup 不对称 | 建立监听却不移除 | Strict Mode、依赖变化和卸载后重复订阅 | cleanup 撤销同一资源 |
| 返回 Promise 或业务对象 | 把 callback 写成 `async` | API 只接受无返回或 cleanup；异步结果不属于 pre-paint 保证 | 保持同步，把异步工作移出布局 Effect |
| 用 `useInsertionEffect` 测量 | 认为“越早越好” | Ref 尚未挂载、不能更新 State、DOM 时机不保证 | 样式注入才用 insertion，测量用 layout |
| 用环境别名宣称解决 SSR | 服务端切成 `useEffect` 后认为首屏正确 | 两个 Effect 都不在服务端运行，初始几何问题仍存在 | 选择有效 SSR fallback 或 client-only 边界 |
| 自定义 Hook 暗中共享测量状态 | 多次调用读写模块级矩形 | 调用之间互相污染，违反独立性 | 每次调用自有 State，跨组件共享另建所有权 |

## Demo 可观察合同

继续复用稳定 Demo ID：

`react.core.learn.intermediate.use-layout-effect.prepaint-measurement-demo`

现有宽度、内容和无关外壳三类交互与 A17 主线一致，应保留并补足解释，而不是重写成动画或复杂浮层：

1. 冷启动使用 `wide + detailed`；稳定后 `measurement.width` 与 `measurement.height` 均为正数，
   且分别与测量盒 `getBoundingClientRect()` 的真实宽高相差不超过 1px。React 宿主启用 Strict Mode，
   因此不冻结冷启动的绝对测量轮次，只验证交互前后的相对变化。
2. 切换宽窄后，`measurement.width` 与 `measurement.height` 都和新的真实矩形同步，误差分别不超过
   1px，且 `measurement.revision` 相对交互前增加。
3. 切换长短内容后重新测量宽高，展示值仍与真实矩形同步，且 `measurement.revision` 相对交互前增加。
4. 点击“只更新外壳”只让 `shellRevision` 增加；`measurement.revision`、`measurement.width` 与
   `measurement.height` 均保持不变。
5. 源码中布局 Effect callback 只调用一次 `getBoundingClientRect()`，同步写入包含宽、高和轮次的同一
   `measurement` State；依赖精确为 `[contentMode, widthMode]`，明确不包含 `shellRevision`，也不建立
   timer、RAF、Observer、事件监听或第二测量通道。
6. 宽高读数和几何标尺共用这份 `measurement` State；按钮只改变输入或无关外壳 State，不直接写入
   任何测量像素。
7. 页面重进后恢复冷状态，不继承上一轮组件 State；控制台无 error，React 19.2.8 不以服务端 warning
   字符串作为客户端 Demo 验收项。
8. 稳定 DOM 和截图只能证明最终几何一致，不能单独证明中间结果从未 paint。pre-paint 时序由 React
   公开合同支撑；若需要运行时证据，应使用浏览器 performance trace，不把 DOM Mutation 记录误称为
   已绘制帧。
9. 不增加 `useEffect` 对照运行面板。人为延迟制造闪烁会把不稳定调度与第二套 Demo 逻辑带入课程；
   静态对照和 React 官方示例足以说明选择边界。

官方 Tooltip 用“测得高度后决定上方或下方”说明视觉定位；A17 Demo 用“宽度或内容改变后测量真实
宽高、无关外壳更新不重复测量，同一 State 驱动读数和标尺”观察同一因果链。课程正文可以引用浮层
定位场景，但不需要引入 Portal、碰撞检测或动画作为第二知识点。

## 正文与实现约束

- frontmatter 保留稳定 ID，但把 `stage` 和 `level` 调整为 `advanced`；`verifiedAt` 使用本批真实日期。
- 课程只围绕“已提交 DOM 的真实测量 -> 必要时绘制前同步修正”展开。
- 必须解释签名、返回值、cleanup、依赖、Strict Mode、三类 Effect 选择、SSR 和组件库封装边界。
- 正文中的 TypeScript 代码使用 TSX；函数和组件上方遵守仓库中文职责注释规则。
- 固定源码与测试进入“官方事实 -> 课程推导 -> 边界”段落，不把 `HookLayout`、Fiber flags 或 Fizz
  dispatcher 写成应用层 API。
- 不声称 React 19.2.8 在 SSR 时必然发出旧 warning，不把环境别名包装成 SSR 修复。
- 不新增持久测试、fixture、截图、trace 或浏览器产物。

## 已知边界与重核条件

1. `react.dev` 是滚动文档；升级 React minor 或正文引用发生变化时，要重读 live page，并用固定提交
   记录差异。
2. React 19.2.8 已移除 core server warning，但具体框架、旧 renderer 或测试工具可能自行输出诊断；
   没有固定框架版本和复现时不承诺其文案。
3. 浏览器稳定截图无法证明 paint 前后关系；本课不伪造这一证据。
4. 本轮没有性能 trace，因此只保留官方“阻塞 paint、过度使用会变慢”的定性结论。
5. 本文不调查 A18 及以后批次，也不为它们预先下结论。

## Stop Boundary

- 本子批次只迁移并补强 A17 官方调研文档。
- 不修改课程正文、Demo、manifest、Track、权威计划、进度迁移或 signoff。
- 不暂存、不提交、不推送、不 stash、不 reset，也不清理无关 dirty worktree。
- 旧调研路径移除后，以 advanced 新路径的 scoped Prettier 和 `git diff --check` 作为本批验证。
