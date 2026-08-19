# 移除 Effect 依赖研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.intermediate.removing-effect-dependencies`
- 标题：`移除 Effect 依赖`
- 教学层级：中级
- 核验日期：`2026-08-11`
- 研究状态：官方调研、正文、Demo、临时验证、Admission、独立复审与正式登记均已完成
- 官方文档基线：React `19.2`
- 仓库运行时基线：React / React DOM `19.2.8`
- 固定源码 tag：`v19.2.8`，commit `1dd4ecbdabf826f527fc9a58c05ea70375b7d170`
- RC2 路线 TypeScript 基线：`7.0.2`
- 当前本地类型/编译器快照：`@types/react` `19.2.18`、TypeScript `6.0.3`
- 前置课程：`react.core.learn.intermediate.effect-dependencies`（第 24 课，已发布）
- 后续课程：第 26 课 Effect Event、第 27 课自定义 Hook、第 28 课 `useLayoutEffect` 与第 29 课
  `useInsertionEffect`
- 当前路线状态：第 1-25 课 `available`，第 26-29 课 `planned`，权威进度 `25/29`

### 当前正式资产核对

- `src/categories/frontend/react/core/react-core-track.ts` 已把第 25 课登记为 `available`；第 26-29 课仍为
  `planned`。路线摘要和 RC2 计划都把下一课固定为“Effect Event”。
- 第 24 课已经建立“Effect 必须如实声明 setup 与 cleanup 所读取的响应值”的前提。本课不删除真实依赖，而是
  只在改写代码后，让依赖数组描述新的实际读取。
- 课程正文、同源 Demo、entry manifest、demo manifest 和 track 第 25 课均已原子登记；正式状态为
  `available`。

本课唯一主线是：**当每次 render 新建的动态 `options` / `config` 对象只服务于本次外部同步时，在
`useEffect` 内创建它。Effect 因而不再读取组件体中的对象，只读取真实原始值 `roomId`，依赖从 `[options]`
回到 `[roomId]`；无关的 `note` render 不得重新同步外部系统。**

## 与相邻课程的硬边界

| 课程 | 主线 | 第 25 课边界 |
| --- | --- | --- |
| 第 23 课 `unnecessary-effects` | 没有外部系统时把计算和动作放回 render / 事件处理器 | 本课假定外部系统确实存在，只减少该同步过程的不必要对象依赖 |
| 第 24 课 `effect-dependencies` | Effect 读取的响应值必须完整、固定长度、内联声明 | 本课承接完整清单；改变清单前必须先改变代码，不能直接删依赖或抑制 lint |
| 第 25 课 `removing-effect-dependencies` | 将只供外部同步的动态对象移入 Effect | 只覆盖对象创建位置这一种改写；不扩展成依赖治理手册 |
| 第 26 课 `effect-events` | 从 Effect 提取读取最新值的非响应逻辑 | 不导入、调用或展示 `useEffectEvent`；`note` 不参与同步，不把“读取最新值”问题提前带入 |
| 第 27 课 `custom-hooks` | 复用有状态逻辑 | 不抽取自定义 Hook，不以封装改变本课依赖关系 |
| 第 28-29 课 | 绘制前测量与 CSS-in-JS 样式插入 | 不使用 `useLayoutEffect`、`useInsertionEffect`，也不讨论渲染时序 |

本课也明确不使用 `useMemo`、`useCallback`、状态更新器、拆分 Effect、把对象移到组件外、从 prop 对象解构原始值
或 lint 抑制。它们各自可能适用其他代码形状，但会把唯一教学变量从“对象仅属于同步过程”扩展成多个方案，无法
证明 `note` render 不同步的原因正是对象创建位置改变。

## 调研问题

1. React 19.2 为什么要求依赖先匹配 Effect 代码，而不是把 `[options]` 任意改为 `[roomId]`？
2. 为什么组件体内的对象字面量会使无关 `note` render 触发外部重新同步？
3. 对象只供外部同步时，移入 `useEffect` 后真实的响应读取和正确依赖分别是什么？
4. `note` 为何不应进入 Effect 或依赖数组，浏览器如何可观察地证明这一点？
5. 为什么本课不以 `useMemo`、`useCallback`、lint 抑制或 Effect Event 作为解法？
6. TypeScript、AST、Admission、三视口、独立复审和原子登记如何共同防止把“少重连”误写成“漏依赖”？

## Tavily 检索与官方 canonical 核验

外部发现严格先走 Tavily。本轮以 React 19.2、`removing effect dependencies`、动态 object dependency 和
`useEffect` 为关键词限定 `react.dev` 检索；Tavily 成功返回 `Removing Effect Dependencies`、`useEffect` 与
`useCallback` 官方页，因此没有触发 Exa、Parallel、Perplexity 或原生搜索回退。搜索结果只用于发现候选 URL，随后
使用 `curl -L --fail --silent --show-error` 读取 `react.dev/*.md` 原文，并以
`git ls-remote https://github.com/facebook/react.git refs/tags/v19.2.8` 核验固定 tag 为
`1dd4ecbdabf826f527fc9a58c05ea70375b7d170`。

第三方文章、Issue、MDN、非 React 仓库和浮动 `main` 均不作为课程事实来源。`useCallback` 官方页只用于明确它是
缓存函数身份的性能 API，从而界定本课不应以它掩盖对象创建位置；它不构成本课可运行方案。

## 官方事实与证据矩阵

| ID | 来源 | 版本 | 支撑结论 |
| --- | --- | --- |
| S1 | [Removing Effect Dependencies - Dependencies should match the code](https://react.dev/learn/removing-effect-dependencies#dependencies-should-match-the-code) | React 19.2 | lint 会核验 Effect 读取的响应值；依赖由周围代码决定，不能为了控制执行次数任意选择 |
| S2 | [Removing Effect Dependencies - To change the dependencies, change the code](https://react.dev/learn/removing-effect-dependencies#to-change-the-dependencies-change-the-code) | React 19.2 | 改变依赖列表前先改周围代码，再让 lint 按新代码校验；抑制检查是在向 React 隐瞒依赖 |
| S3 | [Removing Effect Dependencies - Dynamic objects inside an Effect](https://react.dev/learn/removing-effect-dependencies#move-dynamic-objects-and-functions-inside-your-effect) | React 19.2 | 组件体内新建 `options` 每次 render 都是不同对象，`[options]` 会多次重同步；移入 Effect 后只依赖原始 `roomId` |
| S4 | [`useEffect` Reference - Parameters](https://react.dev/reference/react/useEffect#parameters) | React 19.2 | 依赖是 setup 中所有响应值的固定长度内联列表，逐项用 `Object.is` 比较；依赖变化后先 cleanup 再 setup |
| S5 | [`useEffect` Reference - Caveats](https://react.dev/reference/react/useEffect#caveats) | React 19.2 | 组件内定义的对象和函数可能导致 Effect 运行过多，推荐移除不必要的对象和函数依赖 |
| S6 | [`useCallback` Reference - Caveats](https://react.dev/reference/react/useCallback#caveats) | React 19.2 | `useCallback` 缓存函数定义，官方定位为性能优化；它不是让 Effect 正确同步的前提 |
| S7 | [`ReactFiberHooks.js` dependency comparison](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberHooks.js#L454-L500) | `v19.2.8` | 固定实现逐项比较依赖，并要求开发环境中依赖数组长度保持不变 |
| S8 | [`shared/objectIs.js`](https://github.com/facebook/react/blob/v19.2.8/packages/shared/objectIs.js#L10-L24) | `v19.2.8` | 固定实现优先采用原生 `Object.is`，与公开文档的比较语义一致 |

### 精确锚点核对

- S1 的开篇和 `To remove a dependency, prove that it's not a dependency` 段说明：所有 Effect 实际读取的响应值都
  必须声明；若要移除依赖，必须先证明它不再是响应读取。
- S2 的 `To change the dependencies, change the code` 段把顺序固定为“先修改 surrounding code，再按 lint 调整
  dependencies”；紧随其后的 lint suppression 示例说明压制规则会隐藏错误。
- S3 的 `Does some reactive value change unintentionally?` 与 `Move dynamic objects and functions inside your
  Effect` 段明确：每个 render 都会新建对象，即使字段相同也与前一对象不同；在 Effect 内构造 `options` 后，唯一
  组件级响应读取是 `roomId`，依赖为 `[roomId]`。
- S4 的 `parameters` 段明确 setup / cleanup 与响应值、固定长度内联数组、`Object.is`、依赖变化后的 cleanup / setup
  顺序；S5 的 caveat 直接指向移除不必要对象和函数依赖。
- S6 说明 `useCallback` 缓存的是函数本身，并警告它只应作为性能优化依赖；本课没有函数身份问题，不应引入该 API。
- S7 第 454-500 行按索引比较并在开发环境检查数组长度；S8 第 10-24 行定义同语义的 `Object.is` 入口。它们仅为
  固定版本实现证据，不是正文向学习者暴露的 API。

## 研究结论

### 1. 先让依赖如实匹配当前代码，再决定是否需要改写代码

`[options]` 在对象仍定义于组件体、且 Effect 直接读取该对象时，是正确的完整依赖。直接把它改为 `[roomId]` 或
`[]` 只是遗漏当前 closure 读取，不能修复问题。正确顺序是先确认“这个对象是否只为该外部同步而存在”，若是则把
对象创建语句移进 Effect；随后 Effect 实际从组件作用域读取的值才变成 `roomId`，依赖才合法地写为 `[roomId]`
（S1、S2、S4）。

这不是“手选更短数组”，而是让数组继续准确描述新代码。`note` 从未被 Effect 读取，所以它既不能为了保险加入
依赖，也不需要任何“排除”操作。

### 2. 相同字段的新对象仍是不同依赖

组件函数每次 render 执行时，`const options = { endpoint: roomEndpoint, roomId }` 会新建对象。即使 `roomEndpoint`
和 `roomId` 的文本相同，`Object.is(previousOptions, options)` 仍为 `false`；React 因 `[options]` 改变而重新同步
Effect。因此编辑只显示用的 `note` 虽不改变配置字段，仍会引起断开 / 再同步等不必要外部操作（S3、S4、S7、S8）。

问题不在“对象里字段太多”，也不在 React 漏做深比较。依赖的身份变化是真实的 JavaScript 语义；本课通过不让
组件体对象进入 Effect closure 消除这个不必要身份变化。

### 3. 把仅服务同步的动态对象移入 Effect，依赖回到原始值

冻结前后只允许这一处结构改变：

```tsx
// 改写前：每次 render 都新建对象。
const options = { endpoint: roomEndpoint, roomId }

useEffect(() => {
  widgetRef.current?.synchronize(options)
}, [options])

// 改写后：对象仅在本轮同步 setup 内构造。
useEffect(() => {
  const options = { endpoint: roomEndpoint, roomId }
  widgetRef.current?.synchronize(options)
}, [roomId])
```

实施 Demo 中 `roomEndpoint` 必须为模块级只读常量，避免新增另一个响应读取。移入后 `options` 是 Effect 内部局部变量，
不属于组件 render 的响应值；`roomId` 是 setup 直接读取的唯一组件级原始值，所以依赖精确为 `[roomId]`（S3、S4）。
若真实代码还读取了其他 prop、state 或组件体变量，它们仍必须留在数组；本课不得暗示“对象移入 Effect 总会得到
单元素数组”。

### 4. `note` 是无关 render 的反证，不是依赖控制开关

`note` 只用于触发一次组件 re-render，并显示在 UI 中。它既不参与 `options` 的字段，也不在 setup / cleanup 中被
读取。改写前，`note` 会间接导致新对象身份，从而触发 `[options]` 的同步；改写后，`note` 不改变 `roomId`，Effect
不会重跑，Widget 快照与同步版本保持不变。这条路径证明的是对象创建位置已经改变，而不是用空依赖、Ref 或 lint
抑制把同步藏起来（S2、S3、S4）。

### 5. 其他官方配方不是本课方案

React 官方页还列出了状态更新器、拆分多个 Effect、Effect Event、静态对象外移、从 prop object 读原始值和函数
处理等配方。它们都解决不同的数据流问题。本课不使用它们：`useEffectEvent` 留给第 26 课；自定义 Hook 留给第 27
课；`useLayoutEffect` / `useInsertionEffect` 留给第 28-29 课；`useMemo` 和 `useCallback` 是 memoization 或性能
接口，不能代替“依赖要匹配代码”的正确性证明（S1-S6）。

## 高价值易错点

1. **只把 `[options]` 改为 `[roomId]`。** 对象还在组件体、Effect 还直接读取它时，这会漏依赖。必须先把创建语句
   移进 Effect。
2. **把 `note` 放进依赖数组。** `note` 不是同步输入；加入它会让编辑备注主动重同步，正好破坏本课可观察结论。
3. **用 `useMemo` 固定对象身份。** 这会引入缓存策略和第二个依赖清单，偏离“对象只属于同步过程”的主线。
4. **用 `useCallback` 或内联函数绕过对象问题。** 本课不是函数身份课程，且 `useCallback` 是性能 API，不能替代
   对实际读取的依赖分析。
5. **用 `eslint-disable`、`[]` 或漏项停止重连。** 它们向 React 隐瞒当前读取，风险是陈旧 closure，而非完成依赖
   移除。
6. **把 `roomEndpoint` 声明在组件体。** 这会让它成为另一个 Effect 读取；冻结 Demo 应让 endpoint 是模块级只读
   常量，确保 `[roomId]` 的语义真实。
7. **为了少同步而不再更新 `roomId`。** 正确结果必须仍在房间变化时同步新配置；优化的是无关 render，不是切断
   真实数据流。
8. **提前使用 Effect Event。** 本课没有“读取最新值但不响应”需求；`note` 根本不被 Effect 读取，不能把它伪装为
   第 26 课问题。

## 确定性同源 Demo 合同

### 资产建议

- Demo ID：`react.core.learn.intermediate.removing-effect-dependencies.options-sync-demo`
- 运行与展示源码：
  `src/categories/frontend/react/core/demos/removing-effect-dependencies/options-sync-demo.tsx`
- 样式：
  `src/categories/frontend/react/core/demos/removing-effect-dependencies/options-sync-demo.css`
- 本课实施前状态：资产不存在，manifest 未登记，课程保持 `planned`

### 数据与组件合同

1. `RoomId = 'alpha' | 'beta'`；模块级只读 `roomEndpoint = 'https://rooms.example.local'`。组件只保存 `roomId`
   与 `note`；不得建立 `options` State、缓存对象、Ref 形式的配置或额外派生 State。
2. `RoomSyncWidget` 是确定性的本地外部系统替身，只保存最近同步的 `endpoint`、`roomId` 与递增版本；同值
   `synchronize` 幂等，不使用网络、timer、Promise、随机数、全局 listener 或动画。
3. `OptionsSyncScene` 使用稳定 `widgetRef` 持有 Widget。唯一顶层 `useEffect` 内创建
   `const options = { endpoint: roomEndpoint, roomId }`，再调用 `widgetRef.current?.synchronize(options)`；唯一
   依赖数组按顺序精确为 `[roomId]`。
4. `note` 只绑定备注输入并展示，不进入 `options`、setup、cleanup 或依赖数组。编辑备注会 render，但 Widget
   endpoint、room 和同步版本不得改变。
5. 选择 `beta` 会使 Widget room 切为 `beta` 并将版本从 `1` 变为 `2`；随后编辑备注版本仍为 `2`；重置恢复
   `alpha`、空备注和冷版本 `1`。开发 Strict Mode 的同值额外 setup 由 Widget 幂等处理，不增加可观察版本。
6. Demo 只运行改写后的正确结构，不并列可运行的 `[options]` 反例。错误写法只可在正文静态片段中出现，且必须
   明确不应运行。
7. 运行组件与“查看源码”加载同一 TSX 文件；以 `trimEnd()` 后字符数、UTF-8 字节数和 SHA-256 验证同源，禁止
   复制展示代码。

### 可观察路径

1. 冷启动：`roomId` 为 `alpha`，Widget 显示 `rooms.example.local / alpha / v1`，备注为空。
2. 输入备注：备注更新，Widget 快照仍为 `rooms.example.local / alpha / v1`，证明无关 render 不同步。
3. 切换房间到 `beta`：Widget room 为 `beta`，版本变为 `v2`，证明真实原始依赖仍会同步。
4. 再输入备注：Widget 保持 `beta / v2`，无第二次同步。
5. 重置：恢复 `alpha / 空备注 / v1`；离开再进入课程不继承旧 Widget 或备注状态。
6. 浏览器只读取 DOM 可见值、交互、几何与同源源码，不读取 Fiber、Hook queue 或私有 Effect 状态。

## 临时 TypeScript 7.0.2 Gate

实施阶段使用 `mktemp -d /tmp/removing-effect-dependencies-ts.XXXXXX` 创建唯一目录，在其中写最小 `.tsx`
fixture，并让 fixture 从只读链接解析当前 React 类型；验证后删除目录，并对实际路径执行 `test ! -e`。不得把
fixture、依赖链接或输出写入仓库。命令合同：

```sh
npx --yes --package typescript@7.0.2 tsc \
  --ignoreConfig --jsx react-jsx --strict --noEmit --skipLibCheck \
  --moduleResolution node16 --module node16 --target es2022 --esModuleInterop \
  "$lesson25_fixture_dir/fixture.tsx"
```

fixture 最少验证：

- `RoomId`、模块级 `roomEndpoint`、`SyncOptions` 和 `RoomSyncWidget.synchronize(options): void` 的窄类型；
- `useEffect` 内对象字段与 `synchronize` 参数匹配，依赖数组中唯一标识符为 `roomId`；
- 一条 `@ts-expect-error` 覆盖非法 `RoomId`；不得用多条测试扩张范围；
- TypeScript 只能证明类型，不证明对象创建位置、Effect 数量、依赖数组内联、`note` 不同步或无 lint 抑制；这些
  必须由 AST Gate 覆盖。

## 临时语义 Gate

对同一冻结 snapshot 的 TSX/CSS 编写最小 TypeScript AST / Node 断言，临时脚本只放 `/tmp`：

- 恰好一个本课 `useEffect`，位于 `OptionsSyncScene` 顶层；第二参数必须是数组字面量，元素按顺序精确为
  `[roomId]`，不得有 spread、别名、条件表达式、空数组或省略参数；
- `const options = { endpoint: roomEndpoint, roomId }` 只声明在该 Effect setup 内；组件体不存在同名 `options` /
  `config` 对象、`useMemo`、`useCallback` 或缓存对象；
- Effect setup / cleanup 的组件作用域响应读取集合精确为 `{ roomId }`；`note`、state setter、`widgetRef` 与
  模块级 `roomEndpoint` 不进入该集合；唯一同步调用只接收 Effect 内对象；
- `roomId` 改变路径存在，`note` 输入路径存在且不会改变 Widget 同步版本；Widget 的同值同步实现幂等；
- 不存在 `useEffectEvent`、自定义 Hook、`useLayoutEffect`、`useInsertionEffect`、eslint / oxlint 抑制、fetch /
  XHR、URL、timer、Promise、随机数、动画、Observer、Portal、外部 store 或持久测试资产；
- 新增函数、组件、类构造函数和方法上方均有简洁中文职责注释；CSS 禁止 `grid`、`gap` 与非零 `letter-spacing`；
- 运行 TSX 与展示源码必须来自同一文件，`trimEnd()` 后字符数、UTF-8 字节数和 SHA-256 完全一致。

## 工程与 Catalog Gate

正文 / Demo 实施和发布阶段必须在同一 snapshot 执行：

```sh
npm run type-check
npm run lint
npm run format:check
npm run build
npm run test:unit
npm run test:e2e
git diff --check -- docs/research/frontend/react/intermediate/removing-effect-dependencies.md \
  src/categories/frontend/react/core/learn/removing-effect-dependencies.md \
  src/categories/frontend/react/core/demos/removing-effect-dependencies/
```

不得新增持久测试、fixture、截图、trace 或浏览器输出。浏览器 Admission 前若课程仍未正式登记，只能在 `/tmp`
隔离快照或可恢复临时 overlay 中登记本课 entry/demo；必须记录 overlay 前后 track、entry manifest、demo manifest
哈希。冷会话验收完成后恢复第 25 课 `planned` 基线，并确认临时目录不存在。

## 三视口 Admission Gate

实施后使用 Playwright 冷会话从 `about:blank` 进入本课，监听 HTTP、console error/warning、page error、失败请求
与 `4xx/5xx`：

1. `1440x900`：完成冷启动、备注输入、房间切换、再次备注、重置、离开与返回；只在 `roomId` 改变时同步，备注
   两次均不改变版本，错误与失败请求均为 `0`。
2. `390x844`：重复完整路径；课程目录、房间选择、备注、代码和 Widget 快照无横向溢出、裁切或遮挡。
3. `390x844 + 200%`：将根字号设为 `32px` 后重复房间切换和备注路径；控件可换行但仍可操作，页面与 Demo 横向
   滚动均为 `0`。
4. 三种视口都核对运行 TSX 与展示源码同源；重新进入恢复 `alpha`、空备注和冷版本 `1`，不得产生重复 React root
   warning。浏览器不检查内部 Effect 次数或 Fiber 状态。

## 独立 Standards / Spec 双轴复审

### Standards 轴

独立复审者按课程内容规范、Demo 与交互规范和本研究记录检查：单知识点结构、React 19.2 / 19.2.8 版本分层、
TypeScript 7.0.2 Gate、中文职责注释、同源源码、三视口无溢出、CSS 禁用项、无持久临时资产，以及第 23-29 课硬
边界。任何 finding 都保持第 25 课 `planned`，不能由页面可运行抵销。

### Spec 轴

独立复审者只检查冻结主线：动态对象是否只在 Effect 内创建；Effect 是否只从组件作用域读取 `roomId`；唯一依赖
是否为内联固定 `[roomId]`；`note` render 是否不重新同步；`roomId` 改变是否仍同步；是否出现 `useMemo`、
`useCallback`、lint 抑制、`useEffectEvent`、自定义 Hook、布局 / 插入 Effect 或其他依赖移除配方。两轴必须对同一
冻结 SHA 分别达到 `PASS / 0 finding`。

## planned -> available 原子条件

只有以下条件在同一冻结 snapshot 全部通过，才允许发布第 25 课：

1. 本研究记录、课程正文、同源 TSX/CSS、TypeScript / AST Gate、工程命令、临时 Catalog Admission、三视口
   浏览器证据和独立双轴复审均齐全；
2. Standards 与 Spec 均为 `PASS / 0 finding`，且复审 SHA 与所有 Gate、源码同源哈希完全一致；
3. 在一次原子变更中登记第 25 课 entry 与 Demo，把 track 第 25 课从 `planned` 切为 `available`，权威进度从
   `24/29` 更新为 `25/29`，下一课指向第 26 课“Effect Event”；
4. 原子登记后重新冷启动 Catalog，重跑 build 与本课生产路径；任一失败必须整体保持或恢复为第 25 课 `planned`，
   不得提前写成部分发布；
5. 本课登记后仍不得暂存、提交或扩展到第 26 课，直到本课的登记后回归完成。

## 本轮实现与验收记录

- 已新增课程正文 `src/categories/frontend/react/core/learn/removing-effect-dependencies.md`，同源 Demo 为
  `react.core.learn.intermediate.removing-effect-dependencies.options-sync-demo`。Demo 只包含
  `roomEndpoint`、`RoomSyncWidget` 和 `OptionsSyncScene`；唯一 Effect 在内部构造 `options`，依赖精确为
  `[roomId]`。
- 临时 TypeScript `7.0.2` fixture 与临时 AST Gate 均通过：AST 确认唯一 `useEffect`、内联 `[roomId]`、
  `options` 只在 Effect 内创建，且 `note` 不被 Effect 读取。
- `npm run type-check`、`npm run lint`、`npm run format:check`、`npm run test:unit`、`npm run test:e2e` 和
  Catalog overlay 下的 `npm run build` 均通过；build 转换 `1539` 个模块。
- 生产路由的 `1440x900` 路径验证：冷启动版本为 `1`；编辑备注后仍为 `1`；切换到 `beta` 后为 `2`；再次编辑
  备注仍为 `2`；重置恢复 `alpha / 空备注 / v1`。
- `390x844` 与根字号 `32px` 的 200% 路径均验证 `beta / v2 / 200% 备注`；页面 `scrollWidth=390`，Demo
  `scrollWidth=306`，console 为 `0 error / 0 warning`，无动态请求。
- 验收后已删除本轮 Playwright 快照并关闭本轮预览服务；待发布基线的 entry manifest、demo manifest 和 track
  均已恢复并通过独立 Standards / Spec `PASS / 0 finding` 复审。随后正式登记第 25 课为 `available`，下一课改为
  第 26 课“Effect Event”。

## 当前结论

- React 19.2 要求依赖描述 setup / cleanup 实际读取的响应值；要减少依赖，必须先通过改写代码消除该读取，不能
  直接缩短数组或压制 lint（S1、S2、S4）。
- 每个 render 创建的新对象即使字段相同也有新身份，`[options]` 会让无关 `note` render 重同步；这是 `Object.is`
  身份比较的结果，不是 React 应做深比较的遗漏（S3、S4、S7、S8）。
- 当动态对象只服务于外部同步时，在 `useEffect` 内创建它会让唯一组件级读取回到 `roomId`，所以唯一依赖精确为
  `[roomId]`；`note` 不参与对象、Effect 或依赖，编辑备注不改变同步版本（S3、S4）。
- 第 25 课只冻结这一种对象改写。`useMemo`、`useCallback`、lint 抑制、`useEffectEvent`、自定义 Hook、
  `useLayoutEffect` 与 `useInsertionEffect` 均禁止。当前正式进度为 `25/29`，本课已登记为 `available`，下一课为
  第 26 课“Effect Event”。

## 参考资料

1. [Removing Effect Dependencies](https://react.dev/learn/removing-effect-dependencies) - 依赖与代码一致、先改代码、
   动态对象移动进 Effect 和 lint 抑制风险。
2. [`useEffect` Reference](https://react.dev/reference/react/useEffect) - 响应依赖、`Object.is` 比较、对象依赖 caveat
   与外部同步生命周期。
3. [`useCallback` Reference](https://react.dev/reference/react/useCallback) - 缓存函数身份的性能 API 边界。
4. [React v19.2.8 `ReactFiberHooks.js` comparison](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberHooks.js#L454-L500) - 固定版本逐项依赖比较证据。
5. [React v19.2.8 `objectIs`](https://github.com/facebook/react/blob/v19.2.8/packages/shared/objectIs.js#L10-L24) - 固定版本
   `Object.is` 入口。
