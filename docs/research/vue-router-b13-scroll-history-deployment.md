# Vue Router R1-B13：滚动、历史模式与部署调研

> 核验日期：2026-08-04
>
> 适用版本：Vue Router 5.2.0。
>
> 资料范围：Vue Router 官方 Guide/API、`vuejs/router@v5.2.0` 固定标签的滚动/history
> 源码、官方单元测试与 E2E、官方部署示例和 v5.2.0 release。外部入口先通过 Tavily Search /
> Extract 定位，再回到上述一手来源逐项核验。

## 结论

B13 应把三件容易混淆的事情分开：Router 在成功导航后调用 `scrollBehavior`，history adapter
决定 URL 与前进后退语义，部署服务器决定深链接能否回到 SPA 入口。客户端 matcher 不能替服务器
接收首次 HTTP 请求，服务器 fallback 也不能替应用呈现有意义的 404 页面。

本课只用独立 memory router 验证真实 `scrollBehavior(to, from, savedPosition)` 回调，并固定返回
`false`，避免课程 Demo 改动宿主窗口滚动。web/hash/memory 的 URL、base、服务器要求和初始导航
通过责任表讲解，不实例化 web/hash history，也不接管浏览器 back/forward。配置
`scrollBehavior` 仍会把浏览器全局 `history.scrollRestoration` 设为 `manual`，因此隔离 Demo 还必须在
销毁时恢复原值；只返回 `false` 并不足以完成宿主清理。

2026-08-04 的冻结快照中，`package-lock.json` 固定 `vue-router` 为 `5.2.0`；manifest 的
SHA-256 为 `79ffbec0b950480f9090ebb67599bf9695f7c6c0790f51a233160f304ca8330c`，B01-B12
为 `available`，B13-B15 为 `planned`。这些状态只说明研究时的工作区，不能作为 B13 已实施的证据。

依据：[课程总计划](./vue-router-course-plan.md)、
[Scroll Behavior](https://router.vuejs.org/guide/advanced/scroll-behavior)、
[Different History modes](https://router.vuejs.org/guide/essentials/history-mode)。

## 官方契约

### scrollBehavior

- `RouterScrollBehavior` 接收 loaded `to`、`from` 和
  `_ScrollPositionNormalized | null`，返回 `false | void | ScrollPosition` 或 Promise-like 结果。
- 官方 Guide 的应用层规则是：`savedPosition` 在浏览器 back/forward 的 popstate 恢复路径提供，普通
  programmatic push 得到 `null`。5.2.0 源码还有一个窄例外：首次导航可复用
  `history.state.scroll`，官方 E2E 以保留 state 的 reload 验证了刷新恢复；正文必须把它标成固定
  版本源码推导，不能反过来承诺任意首次导航都有 saved position。
- 返回 `{ top, left }` 表示窗口坐标；两轴都可省略。`behavior` 直接交给浏览器
  `window.scrollTo()`，如 `auto` / `smooth`，实际效果取决于浏览器支持与用户偏好。
- `el` 可接 DOM element 或字符串。以 `#` 开头的字符串由 5.2.0 通过 `getElementById()` 查找，其余
  字符串按 CSS selector 查询；此时 `top`/`left` 是从目标元素位置扣除的偏移量，而不是绝对坐标。
- `to.hash` 不会自动等同于滚动策略。要模拟锚点，应显式返回 `{ el: to.hash }`；同一路由/同一
  hash 的 duplicated push 也会再次触发滚动处理，以允许重新定位当前锚点。
- 返回 falsy 值或空对象没有可见滚动；课程 Demo 固定返回类型明确的 `false`。返回 Promise 可把
  滚动与页面级 transition 事件协调，但 `router.push()` 不等待该 Promise。
- 固定头部优先读取目标元素的 `scroll-margin-top` 计算值作为 offset，而不是在所有页面硬编码同一
  像素值。Promise 应由真实 transition 完成事件结算，不用固定 timer 猜持续时间。

依据：[Scroll Behavior](https://router.vuejs.org/guide/advanced/scroll-behavior)、
[`RouterScrollBehavior`](https://router.vuejs.org/api/interfaces/routerscrollbehavior)、
[`router.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/router.ts)、
[`scrollBehavior.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/scrollBehavior.ts)、
[`scroll-behavior E2E@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/e2e/specs/scroll-behavior.spec.ts)。

### 导航与滚动的时间线

```text
导航守卫通过
  -> history push/replace 或接受 pop 位置
  -> currentRoute 写入 to
  -> 调度 handleScroll（不 await）
  -> markAsReady / afterEach / navigation Promise 结算
  -> Vue nextTick
  -> 调用 scrollBehavior(to, from, savedPosition)
  -> 可选等待用户返回的 Promise
  -> to 仍是 currentRoute 时应用 scroll result
```

这条顺序只表示源码控制流，不把所有微任务压成可依赖的毫秒顺序。稳定的业务 contract 是：导航
Promise 与 scroll Promise 分离；需要验收滚动完成时，应等待可观察的 scroll/transition 完成信号，
不能在 `await router.push()` 后立即假定滚动已结束。

### 三种 history

| 模式 | URL 与初始位置 | base 语义 | 服务器责任与取舍 |
| --- | --- | --- | --- |
| `createWebHistory(base?)` | 正常 pathname；初始位置来自当前浏览器 URL | 显式 base 优先；否则读取 `<base href>` 或 `/`，去掉 origin 与末尾 `/` | 推荐模式；真实文件/目录之外必须 fallback，深链接依赖服务器 |
| `createWebHashHistory(base?)` | route 位于第一个 `#` 后；初始位置来自该 hash | 有 host 时默认 `location.pathname + location.search`，未含 `#` 会追加；`file://` 下忽略传入 base | fragment 不发送给服务器，通常不需 route fallback；SEO 与传统 fragment 语义较弱 |
| `createMemoryHistory(base?)` | 从特殊 `START = ''` 开始；不读取或改写地址栏 | base 参与 `createHref()`，默认逻辑根为 `/`；内部 location 仍由调用方 push/replace | 面向 SSR/受控环境；必须显式初始导航，浏览器按钮和地址栏不承载其队列 |

以部署在 `/academy/`、内部 route 为 `/guide/start` 为例：web history 的公开 URL 是
`/academy/guide/start`，hash history 是 `/academy/#/guide/start`，memory history 不改变地址栏但
`createHref('/guide/start')` 可带上 `/academy` base。base 属于 history factory，不是
`createRouter()` 的同名选项。

子目录部署时，构建工具的资源 base、Router history base 和服务器 rewrite 前缀必须对齐。只改
Router base 会让 route href 看似正确，却仍可能让 JS/CSS 资源或刷新深链接落到错误根目录。

memory history 源码确实维护内部 queue 并实现 `go()`；官方 Guide 所说“没有 history”应理解为不
接入浏览器地址栏和浏览器 back/forward，而不是内部连一条可遍历记录都没有。B13 不把这条内部队列
用来模拟 web popstate/savedPosition。

依据：[Different History modes](https://router.vuejs.org/guide/essentials/history-mode)、
[`createWebHistory()`](https://router.vuejs.org/api/functions/createwebhistory)、
[`createWebHashHistory()`](https://router.vuejs.org/api/functions/createwebhashhistory)、
[`createMemoryHistory()`](https://router.vuejs.org/api/functions/creatememoryhistory)。

### fallback 与 404

HTML5 history 的首次深链接请求先到服务器。服务器应在请求不是实际文件/目录时返回 SPA 的
`index.html`，让客户端 router 接管。这样做会使未知路径通常先得到 HTTP 200，因此应用还需要
catch-all route 显示 404；需要真实 HTTP 404/SEO 状态时，应由 SSR 或服务器 matcher 决定响应状态。

hash history 避免了这项服务器 rewrite，不表示它“没有代价”：fragment 不会发送给服务器，搜索
引擎处理也较差；`/academy/#/guide` 的服务器请求仍是 `/academy/`，所以入口文件本身仍须在该位置
可访问。route hash 内再带锚点时，形态可以是 `#/guide#section`，定位责任仍由 Router 的
`scrollBehavior` 承担，不能期待服务器或首个 fragment 自动处理。

官方根目录部署示例提供了同一原则的多种表达：

| 环境 | 官方核心规则 | 课程应强调的边界 |
| --- | --- | --- |
| nginx | `try_files $uri $uri/ /index.html;` | 先保留真实文件/目录，再回退入口 |
| Apache | `!-f`、`!-d` 后 rewrite 到 `index.html` | 关闭 MultiViews，子目录同步调整 RewriteBase |
| Firebase / Netlify / Vercel | rewrite 所有 client paths 到 `/index.html` | 这是 rewrite/200，不等于真实 HTTP 404 |
| Node/Express | 返回入口或使用 history fallback middleware | API/静态资源路由必须先于 SPA fallback |

这些官方示例默认部署在根目录。子目录需要同时调整资源输出位置、history base、fallback 匹配前缀和
入口目标；课程只展示责任表和代表配置，不宣称本仓库已经在 nginx、CDN 或 SSR 上验证。

memory history 更不是静态部署捷径，它本来面向 Node/SSR 与受控环境。SSR 若要返回真实 HTTP 404，
必须按请求 URL 主动 push、等待 router ready、检查匹配并由服务器决定 status；B13 只解释责任，
不实现 SSR。

依据：[Different History modes: server configurations and caveat](https://router.vuejs.org/guide/essentials/history-mode#example-server-configurations)。

## Vue Router 5.2.0 源码证据

### 1. 配置 scrollBehavior 会接管浏览器恢复策略

`createRouter()` 在浏览器存在 `scrollBehavior` 且支持时把 `history.scrollRestoration` 设为
`manual`。应用既然接管恢复，就必须明确处理 savedPosition、hash 和默认 top 策略。

### 2. 导航结算与滚动执行不是同一个 Promise

`finalizeNavigation()` 先写入 `currentRoute`，再调用 `handleScroll()`，但不 await 其返回值；之后
Router 标记 ready。业务代码不能把 `await router.push()` 等同于滚动或页面过渡已经完成。

### 3. scrollBehavior 在 nextTick 后执行

`handleScroll()` 先等待 Vue `nextTick()`，再调用用户回调。此时新 route 已提交，目标页面 DOM 更
可能存在；需要等待更长 transition 时，应返回由真实 transition 事件结算的 Promise。

### 4. 过期异步结果会被丢弃

5.2.0 在应用 scroll result 和上报 scroll error 前比较 `to === currentRoute.value`。用户快速导航到
更新位置后，旧导航晚到的异步 scroll 结果不会改动当前页面，旧结果的 rejection 也不会作为当前
页面错误上报。这里的精确判据是 normalized route 对象身份仍为 current，不应扩写成通用任务取消
协议。

### 5. savedPosition 来自 history entry 身份

pop listener 已处于目标 history state；它用“目标 state position - 本次 delta +
`from.fullPath`”还原离开 entry 的 key，并保存当前窗口坐标。`handleScroll()` 再以目标 entry 的
position + `to.fullPath` 查一次性内存 store，未命中时回退到目标 `history.state.scroll`。因此
savedPosition 属于 history entry，不是笼统的“上一个页面坐标”，也不保证每次导航都有值。

内存 store 的读取会立刻删除该 key；web history 还会在 programmatic push 前把离开 entry 的坐标写
入其 history state，并在 pagehide/页面隐藏时更新当前 entry。官方 E2E 覆盖 back、forward、再次
back、reload 和“保存位置优先于 anchor”的行为。

### 6. history adapter 共享公开接口

web、hash 与 memory history 都向 Router 提供 base、location、state、push、replace、go、listen、
createHref 和 destroy。matcher 不需要知道 URL 存储在哪里，但每个 adapter 的环境与初始位置语义
不同。

### 7. 三个 adapter 的 base 与初始位置实现不同

`normalizeBase()` 让显式参数优先于 `<base>`，去掉完整 origin 和末尾斜杠。hash adapter 在有 host
时默认取 pathname + search，并确保 base 含 `#`，最后复用 HTML5 adapter；memory adapter 则用
`[[START, {}]]` 初始化内部 queue。三者接口一致不代表可以互换环境语义。

### 8. 同一锚点导航仍可触发滚动

当 `push()` 识别到 duplicated location 时，Router 不重新提交 route，但仍调用
`handleScroll(from, from, true, false)`，让当前锚点可以再次定位。官方 scroll E2E 也覆盖相同
`/bar#anchor` 的再次点击；课程不能把“duplicated navigation”误写成“所有后续处理都不会发生”。

固定源码：

- [`router.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/router.ts)
- [`scrollBehavior.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/scrollBehavior.ts)
- [`history/common.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/history/common.ts)
- [`history/html5.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/history/html5.ts)
- [`history/hash.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/history/hash.ts)
- [`history/memory.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/history/memory.ts)
- [`router.spec.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/router.spec.ts)
- [`scrollBehavior.spec.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/scrollBehavior.spec.ts)
- [`history tests@v5.2.0`](https://github.com/vuejs/router/tree/v5.2.0/packages/router/__tests__/history)
- [`scroll-behavior E2E@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/e2e/specs/scroll-behavior.spec.ts)
- [v5.2.0 release](https://github.com/vuejs/router/releases/tag/v5.2.0)

## 课程冻结

- ID：`vue.router.learn.advanced.scroll-history-deployment`
- 标题：滚动、历史模式与部署
- collection / level：`advanced`
- 硬前置：L01 建立路由器、L05 编程式导航、L11 导航失败
- 相邻：previous 为 B12；B14 必须继续保持 `planned`
- 唯一 Demo：`scroll-history-deployment-lab-demo`
- 交付边界：1 篇 entry、1 个隔离 scroll Demo、最多 1 个 catalog test 和 1 条专项 E2E；本研究
  不创建或修改这些文件

## 唯一 Demo contract

Demo 在自己的挂载节点创建 mini-app、`createMemoryHistory('/academy')` 与两条具名 route：

- `/guide/:chapter`：展示 params 与可选 query；
- `/search`：展示不同 record 的导航。

真实 `scrollBehavior` 每次记录 to/from/savedPosition，并固定返回 `false`。可见状态必须包含：

- generation、宿主路径、current fullPath、matched names、params/query；
- navigation outcome、scroll call count、最近一次 to/from/savedPosition/return；
- 完整 navigation log 与 scroll callback log；
- web/hash/memory 的 URL、base、初始导航、服务器责任表；
- HTML5 fallback 与应用 404 的两层责任提示。

初始 push 在 mount 前完成，因此初始化 callback 也必须是真实 Router 行为。普通按钮导航只能证明
`savedPosition === null`；Demo 不手造 popstate，不操作宿主 history，也不把静态部署表伪装成运行时
验证。

Demo 创建 router 前应保存宿主 `window.history.scrollRestoration`；mini-app 销毁时执行
`app.unmount()`、`routerHistory.destroy()`，并在该属性存在时恢复原值。配置 `scrollBehavior` 后
Router 会把它设为 `manual`，而 router/app unmount 源码不会替 Demo 自动复原。

`await router.push()` 之后不要直接递增伪造 callback 完成标记。可见日志必须由真实
`scrollBehavior` 写入，E2E 等待相应 token；不加 timer。memory history 的 base 只通过
`history.base` / `createHref()` 可见证明，不把地址栏未变化误写为 base 没有作用。

## 结构化易错项

| # | 错误方向 | 原因与可观察后果 | 正确方向 |
| --- | --- | --- | --- |
| 1 | HTML5 history 不配 fallback | 服务器先处理首次深链接，客户端 matcher 根本没有运行机会，刷新直接 404 | 保留真实资源后，把 client paths rewrite 到正确 base 下的入口 |
| 2 | fallback 后不加应用内 404 | 未知 URL 也得到入口与 HTTP 200，页面没有 NotFound 语义 | 加 `/:pathMatch(.*)` UI；真实 HTTP 404 由服务器/SSR 决定 |
| 3 | 把 hash mode 说成“零配置、无代价” | route fragment 不发给服务器，SEO、分享形态和传统 anchor 语义都有差异 | 只在无 host/不能配服务器或明确接受取舍时选用 |
| 4 | memory history 等待浏览器自动首导航 | 它从 nowhere 开始且不读取地址栏，RouterView 没有真实 starter location | 安装后显式 push/replace 请求或 Demo 初始位置，再等待 ready |
| 5 | 认为 savedPosition 每次都有 | 普通 push 得到 null；pop 还要有对应 entry 的已保存坐标 | `savedPosition ?? policyForNewEntry`，并把 reload 复用标为源码边界 |
| 6 | 看到 `to.hash` 就期待浏览器自动滚动 | Router 需要由 scroll result 决定 element/offset，hash mode 还占用首个 fragment | 显式返回 `{ el: to.hash }`，固定头部读取可靠 offset |
| 7 | 把 `await router.push()` 当滚动完成 | `handleScroll()` 不被 finalize await，异步 result 可以在 navigation Promise 后到达 | 等 callback/transition 的真实可观察完成信号 |
| 8 | 用固定 timer 协调 transition | 动画时长、reduced motion 和快速连续导航会改变时序；旧结果还可能晚到 | Promise 绑定真实事件；理解 5.2.0 只应用仍属 current route 的结果 |
| 9 | 子目录只改 router base | route href、静态资源和 fallback 入口会分属不同根，刷新或加载资源失败 | 对齐构建资源 base、history base、rewrite 前缀与入口目标 |
| 10 | 认为 `return false` 已完全隔离宿主 | 窗口不滚动，但创建 Router 已把全局 `scrollRestoration` 设为 manual | teardown 恢复原值，并验证宿主 URL/scroll 均未改变 |

每项进入正文时必须继续保留原因、后果、错误示范和正确示范；不能为凑数量加入未经一手来源支持的
通用部署建议。

## 最小 E2E

单一用户路径应验证：

1. B13 页面与 Demo 唯一存在，宿主 URL 不变。
2. 初始 `/guide/start?mode=read` 的 matched、params/query 与首个真实 scroll callback。
3. 键盘触发到 `/search`，callback 的 to/from 正确，savedPosition 为 null，返回值为 false。
4. 再到 `/guide/deploy?mode=check`，callback count 严格增加，currentRoute 与可见状态同步。
5. reset/unmount 后 `scrollRestoration` 恢复进入 Demo 前的值，宿主 pathname/history 长度与页面
   scroll 坐标不被独立 router 改写。
6. 390px、200% 文字、reduced-motion、双层横向溢出、console/pageerror。
7. history/deployment 责任表三行可见，但不据此声称真实服务器部署已运行。

## 明确排除

- 不实例化 web/hash history，不修改宿主 router、Vite base、服务器或部署配置。
- 不操作 `window.history.back/forward`，不劫持宿主滚动，不手造 savedPosition。
- 不实现全站滚动恢复、焦点管理或 page transition 协调器。
- 不把 memory history 的内部 queue 当 web popstate 模拟器，不验证浏览器原生滚动像素。
- 不进入 B14 的 addRoute/removeRoute/useLink，也不进入 B15 文件路由 fixture。
- 不把 SPA smoke 当成 nginx/CDN/SSR 或 HTTP status 验证。

## 来源清单

- [Scroll Behavior](https://router.vuejs.org/guide/advanced/scroll-behavior)
- [Different History modes](https://router.vuejs.org/guide/essentials/history-mode)
- [`RouterScrollBehavior`](https://router.vuejs.org/api/interfaces/routerscrollbehavior)
- [`createWebHistory()`](https://router.vuejs.org/api/functions/createwebhistory)
- [`createWebHashHistory()`](https://router.vuejs.org/api/functions/createwebhashhistory)
- [`createMemoryHistory()`](https://router.vuejs.org/api/functions/creatememoryhistory)
- [`RouterHistory`](https://router.vuejs.org/api/interfaces/routerhistory)
- [`router.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/router.ts)
- [`scrollBehavior.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/scrollBehavior.ts)
- [`history/common.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/history/common.ts)
- [`history/html5.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/history/html5.ts)
- [`history/hash.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/history/hash.ts)
- [`history/memory.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/history/memory.ts)
- [`router.spec.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/router.spec.ts)
- [`scrollBehavior.spec.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/scrollBehavior.spec.ts)
- [`history tests@v5.2.0`](https://github.com/vuejs/router/tree/v5.2.0/packages/router/__tests__/history)
- [`scroll-behavior E2E@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/e2e/specs/scroll-behavior.spec.ts)
- [v5.2.0 release](https://github.com/vuejs/router/releases/tag/v5.2.0)

## B13 Stop Boundary

本文件只关闭 B13 的前置研究，不代表 B13 实施完成：

- 已冻结课程 ID、L01/L05/L11 前置、唯一 memory-router Demo seam、三种 history/base 责任表、部署
  fallback/404 边界、10 个高质量易错项、8 条源码推导与一个最小 E2E 路径。
- 已核实 savedPosition、Promise/nextTick、element/offset/behavior、hash anchor、history adapter、base、
  5.2.0 stale async scroll result 和官方部署示例。
- 没有修改 catalog、manifest、课程正文、Demo、E2E、总实施计划、样式或运行时代码。
- 没有启动服务、打开页面、构建或提交。
- B13 实施前必须重新核对 manifest/lock/dirty workspace；实施后仍需 catalog 红绿、正文、唯一
  Demo、专项 E2E、静态与全量 Gate、独立双轴复审和计划落账。
- 完成并验收 B13 之前不得开始 B14；本研究任务在此停止，不把 B14 改为 `available`。
