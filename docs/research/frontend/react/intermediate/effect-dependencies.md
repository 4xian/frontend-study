# Effect 依赖研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.intermediate.effect-dependencies`
- 标题：`Effect 依赖与稳定化`
- 教学层级：中级
- 核验日期：`2026-08-17`
- 研究状态：官方调研、正文、Demo、临时验证、浏览器回归、独立复核与正式登记均已完成
- 官方文档基线：React `19.2`
- 仓库运行时基线：React / React DOM `19.2.8`
- 固定源码 tag：`v19.2.8`，commit `1dd4ecbdabf826f527fc9a58c05ea70375b7d170`
- RC2 路线 TypeScript 基线：`7.0.2`
- 当前本地类型/编译器快照：`@types/react` `19.2.18`、TypeScript `6.0.3`
- 前置课程：`react.core.learn.intermediate.unnecessary-effects`（已发布）
- 合并来源：历史课程 `react.core.learn.intermediate.removing-effect-dependencies` 的对象与函数依赖改写内容
- 后续课程：`react.core.learn.intermediate.effect-events`、`custom-hooks`、`use-layout-effect` 与后续已冻结课程
- 当前路线状态：I14 已闭环，权威新路线进度为 `41/74`

### 当前正式资产核对

- `src/categories/frontend/react/core/react-core-track.ts` 已公开 `effect-dependencies`，不再公开历史的
  `removing-effect-dependencies` 条目；`progress-migrations.ts` 将两个历史 ID 的进度归并到当前入口。
- 第 20-22 课已分别建立 Effect 的外部同步入口、cleanup 对称性和独立同步生命周期；第 23 课已完成
  “没有外部系统时不需要 Effect”的判断。本课只在“Effect 确实需要保留”的前提下治理依赖清单。
- 正文与两个同源 Demo/CSS 已完成，entry manifest、demo manifest、Track 和进度迁移已登记；历史 Markdown
  文件仅保留为研究来源，不再生成公开课程入口。

本课唯一主线是：**先逐项识别 Effect setup 与 cleanup 直接读取的响应值，再把这些值以固定长度、内联数组完整
声明。依赖由代码决定，不是为了控制执行次数而手选；完整依赖让外部系统在任一相关值变化后重新同步到当前
render。**

## 与相邻课程的硬边界

| 课程 | 主线 | 本课边界 |
| --- | --- | --- |
| `use-effect` | Effect 是可独立开始、停止和重新同步的过程 | 只承接“依赖变化会重新同步”的结果，不重复 start/stop、cleanup 或 Strict Mode 时序 |
| `unnecessary-effects` | 派生值留在 render，用户动作留在事件处理器 | 本课假定外部系统真实存在，不再判断是否应删除整个 Effect |
| `effect-dependencies` | 识别响应值、声明完整清单，并改写只供 Effect 使用的对象或函数 | 只处理依赖数据流与稳定化，不使用 `useEffectEvent` 隐藏非响应读取 |
| `effect-events` | 提取读取最新值的非响应逻辑 | 不导入、不调用、不展示 `useEffectEvent` |
| `custom-hooks` 及后续课程 | 抽取逻辑、布局时序和其他宿主能力 | 不抽取自定义 Hook，不使用 `useLayoutEffect`、`useInsertionEffect` 或后续 API |

遇到对象或函数依赖导致不必要重新同步时，本课先如实声明依赖，再把只供一个 Effect 使用的创建语句移入 Effect，
让清单回到真正决定同步的响应值。遇到“只想读取最新值但不想响应变化”的需求，属于 `effect-events`，本课不
使用 `useEffectEvent` 提前求解。

## 调研问题

1. React 19.2 如何定义响应值，setup 与 cleanup 中哪些读取必须进入依赖清单？
2. 固定长度内联数组、空数组和省略第二参数分别表达什么？
3. React 如何比较前后依赖，缺失依赖为何会形成陈旧闭包？
4. `exhaustive-deps` 能证明什么，运行时又实际使用了什么信息？
5. 如何设计可直接观察完整依赖、对象稳定化与无关 render 的确定性同源 Demo？
6. TypeScript、AST 语义、三视口 Admission 与双轴复审如何共同约束发布？

## Tavily 检索与官方 canonical 核验

外部发现严格先走 Tavily。本轮执行两次限定 `react.dev` 的 `tavily_search`：

1. `site:react.dev React 19.2 lifecycle reactive effects reactive values dependencies Object.is exhaustive dependencies useEffect official`
2. `site:react.dev/reference/eslint-plugin-react-hooks/lints/exhaustive-deps React 19.2 official exhaustive-deps missing dependency stale closure`

Tavily 成功返回 `useEffect`、Lifecycle 与 `exhaustive-deps` 官方页，页面版本标记为 React `19.2`；没有触发
Exa、Parallel、Perplexity 或原生搜索回退。搜索摘要只用于发现候选，随后使用
`curl -L --fail --silent --show-error` 回到 `react.dev/*.md` 和 `facebook/react` raw 固定 tag 逐段核验。
`git ls-remote https://github.com/facebook/react.git refs/tags/v19.2.8` 返回
`1dd4ecbdabf826f527fc9a58c05ea70375b7d170`，因此源码与测试不引用浮动 `main`。第三方文章、Issue、MDN 与
非 React 仓库均未作为课程事实来源。

## 官方事实与证据矩阵

| ID | 来源 | 版本 | 支撑结论 |
| --- | --- | --- | --- |
| S1 | [`useEffect` Reference - Parameters](https://react.dev/reference/react/useEffect#parameters) | React 19.2 | 依赖是 setup 中所有响应值的清单；props、state、组件体内变量与函数属于响应值；数组必须固定长度并内联；逐项使用 `Object.is` 比较；省略第二参数会在每次 commit 后运行 |
| S2 | [`useEffect` Reference - Specifying reactive dependencies](https://react.dev/reference/react/useEffect#specifying-reactive-dependencies) | React 19.2 | 依赖不能手选；代码读取 `serverUrl`、`roomId` 就必须声明二者；漏项会被正确配置的 linter 报告 |
| S3 | [Lifecycle - Effects react to reactive values](https://react.dev/learn/lifecycle-of-reactive-effects#effects-react-to-reactive-values) | React 19.2 | props、state 和 render 中计算出的值参与 React 数据流；响应值变化时 Effect 需要重新同步 |
| S4 | [Lifecycle - All variables declared in the component body are reactive](https://react.dev/learn/lifecycle-of-reactive-effects#all-variables-declared-in-the-component-body-are-reactive) | React 19.2 | render 派生变量同样是响应值；模块级常量不因 render 变化；`ref.current` 等可变值不能充当响应触发器 |
| S5 | [Lifecycle - React verifies every reactive dependency](https://react.dev/learn/lifecycle-of-reactive-effects#react-verifies-that-you-specified-every-reactive-value-as-a-dependency) | React 19.2 | linter 静态检查 Effect 使用的每个响应值；完整 `[serverUrl, roomId]` 修复外部系统停留在旧值的问题；React 保证稳定的 state setter/ref 对象可省略 |
| S6 | [`exhaustive-deps` Rule Details](https://react.dev/reference/eslint-plugin-react-hooks/lints/exhaustive-deps#rule-details) | React 19.2 | 漏掉引用值时 Hook 不会在该值变化后重新执行，闭包会继续读取旧值；依赖数组告诉 React 何时重新同步 |
| S7 | [`ReactFiberHooks.js` dependency comparison](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberHooks.js#L454-L500) | `v19.2.8` | 固定实现按索引调用共享 `objectIs`；开发环境还检查依赖数组长度必须保持不变 |
| S8 | [`ReactFiberHooks.js` effect update](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberHooks.js#L2615-L2669) | `v19.2.8` | 有依赖且全部相等时不添加 `HookHasEffect`；省略依赖映射为 `null`，更新时不会走相等跳过分支 |
| S9 | [`shared/objectIs.js`](https://github.com/facebook/react/blob/v19.2.8/packages/shared/objectIs.js#L10-L24) | `v19.2.8` | 固定实现优先使用原生 `Object.is`，否则使用同语义 polyfill；内部导入与公开文档的比较规则一致 |
| S10 | [React Effect dependency tests](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/__tests__/ReactHooksWithNoopRenderer-test.js#L1767-L1855) | `v19.2.8` | 官方测试证明省略依赖时每次更新都会 destroy/create；完整依赖未变时跳过，任一位置变化时重新执行 |

### 精确锚点核对

- S1 Markdown 的 `parameters` 段明确给出“所有响应值”“固定数量”“内联数组”“逐项 `Object.is`”和省略参数
  行为；S2 的 `specifying-reactive-dependencies` 段明确写出依赖由周围代码决定，不能任意挑选。
- S3 Markdown 第 353-395 行把 module 常量与 props/state 区分；S4 第 553-590 行说明 render 派生变量也响应，
  并说明全局可变值和 `ref.current` 不是 React 可感知的依赖触发器。
- S5 第 594-692 行显示漏掉 `roomId`、`serverUrl` 会让连接停在初始值，并记录 React 保证 state setter 与
  ref 对象稳定；S6 Markdown 第 11-19 行把漏项直接关联到 stale closure。
- S7 第 454-500 行检查长度并逐项调用 `is`；该符号由 `ReactFiberHooks.js` 第 112 行从
  `shared/objectIs` 导入。S8 第 2632-2669 行只在数组非 `null` 且全部相等时跳过 `HookHasEffect`。
- S10 第 1767-1800 行覆盖省略依赖，1803-1855 行覆盖 `label`/`count` 任一变化与二者均未变化的对照。

## 研究结论

### 1. 依赖是 Effect 代码的静态描述，不是执行次数开关

依赖清单回答的是“这个同步过程读取了当前 render 的哪些响应值”。它不表达“我想只运行一次”“我只关心某个
值”或“这个值变化得太频繁”。如果 setup 或 cleanup 直接读取某个响应值，该值就属于当前 Effect 的依赖；不满意
清单时应在后续课程改写代码，而不是先删掉清单项（S1、S2、S5）。

运行时不会分析 JavaScript 闭包来猜测读取关系。`v19.2.8` 固定实现只接收作者给出的数组并逐项比较（S7、S8）；
“清单是否完整”由 `exhaustive-deps` 静态分析负责（S5、S6）。因此 lint 通过和运行时比较是互补证据，不能用
“页面目前看起来正常”替代完整清单。

### 2. 先圈出 Effect 边界，再逐项识别响应值

识别步骤固定为：

1. 圈出 setup 函数以及它返回的 cleanup；两处直接读取都属于同一个 Effect 闭包。
2. 标记 props、state、Context 值，以及组件函数体内声明或计算出的变量与函数。
3. 只保留 Effect 实际直接读取的响应值，逐项写进内联数组；未被 Effect 读取的无关 State 不应为了“保险”加入。
4. 模块级不可变常量、Effect 内部才声明的局部值不是组件 render 的响应值；React 保证稳定的 state setter 与 ref
   对象可省略。`ref.current` 或任意全局可变值的改变不会触发 render，不能把它列入数组后假装已建立订阅。

render 派生值同样需要检查。若 `endpoint` 在组件体内由 `region` 计算，Effect 直接读取的是 `endpoint`，则本课
清单包含 `endpoint`。若对象或函数只服务于一个 Effect，可以把创建语句移入 setup，再让清单只保留真正的响应
输入；`useMemo` 和 `useCallback` 不作为默认修复（S3、S4）。

### 3. 清单必须固定长度、内联并保持位置语义

课程只接受 `useEffect(setup, [endpoint, roomId])` 这类内联数组。不能使用条件 push、spread、动态排序或在不同
render 间改变元素数量。React 按同一索引用 `Object.is` 比较新旧值；全部相同则跳过本轮 Effect，任一项不同则
重新同步（S1、S7-S10）。对象和函数按身份比较；当它们只供一个 Effect 使用时，本课教学将创建语句移入 setup，
再声明它们真正读取的原始响应值（S3、S4）。

三个形态需要准确区分：

- `[a, b]`：首次 commit 后执行，之后只在 `a` 或 `b` 按 `Object.is` 不同时重新同步。
- `[]`：只在 Effect 确实没有读取任何响应值时才是完整清单；开发 Strict Mode 仍可能额外检查。
- 省略第二参数：每次组件 commit 后都运行；它不等于“让 linter 自动推导”。

### 4. 漏项保留的是旧闭包，不是“最新值但不重新执行”

每次 render 都会创建属于该 render 的函数与值。若 Effect 读取 `roomId` 却把清单写成 `[]`，React 没有理由在
`roomId` 改变后替换旧同步过程；旧 Effect 及其回调会继续闭包捕获初始值。这就是官方 stale value 示例和
`exhaustive-deps` 所防止的问题（S5、S6）。本课修复只有一个：恢复完整依赖。读取最新值而不响应其变化的专门
建模属于 `effect-events`，禁止在本课引入 `useEffectEvent`。

### 5. 固定源码只解释机制，不升级成公共 API

`areHookInputsEqual`、`HookHasEffect`、Fiber flags 和 `pushSimpleEffect` 是 `v19.2.8` 内部实现名。它们支持
“逐项相等时跳过、任一变化时执行”的生产推导，但正文只能承诺 React 19.2 文档公开的 `Object.is` 与依赖行为。
官方测试覆盖的 create/destroy 日志也是实现回归证据，不能让学习者读取内部队列或 flag 作为业务判断（S7-S10）。

## 高价值易错点

1. **把 `[]` 当成“只运行一次”指令。** Effect 仍读取 `endpoint`、`roomId`，却用空数组阻止重新同步；外部
   Widget 永远保留初始组合。应声明全部响应值。
2. **只列 Props，漏掉 render 派生变量。** `endpoint` 虽不是 State，却在组件体内由 `region` 计算并被 Effect
   读取；它仍是响应值。
3. **只检查 setup，漏掉 cleanup 的读取。** cleanup 读取的响应值也来自同一 render 闭包，必须一起纳入清单；
   不能只按 setup 调用参数扫描。
4. **把所有 State 都塞进数组。** `note` 没有被 Effect 读取，就不属于依赖；额外加入会让无关输入触发同步，
   也掩盖“依赖由代码决定”的判断。
5. **动态构造依赖数组。** 条件、spread 或排序会破坏固定长度和位置比较合同；必须直接写内联字面量。
6. **用 lint 抑制掩盖缺失项。** 关闭 `exhaustive-deps` 只会让未来新增读取也失去检查，运行时不会代替 linter
   推导闭包依赖。
7. **把 `ref.current` 或全局变量列入数组后当成订阅。** 这些值改变不会触发 React render，数组无法感知变化；
   需要外部订阅时应另立课程边界，本课不引入 `useSyncExternalStore`。
8. **直接从清单删除对象或函数依赖。** 当前 Effect 只要仍读取它，就必须如实声明；只有先把仅供该 Effect
   使用的创建语句移入 setup，才能让清单回到原始响应值。`useEffectEvent` 属于 `effect-events`。

## 确定性同源 Demo 合同

### 资产建议

- Demo ID：`react.core.learn.intermediate.effect-dependencies.dependency-map-demo`
- 运行与展示源码：
  `src/categories/frontend/react/core/demos/effect-dependencies/dependency-map-demo.tsx`
- 样式：
  `src/categories/frontend/react/core/demos/effect-dependencies/dependency-map-demo.css`
- Demo ID：`react.core.learn.intermediate.effect-dependencies.options-sync-demo`
- 运行与展示源码：
  `src/categories/frontend/react/core/demos/removing-effect-dependencies/options-sync-demo.tsx`
- 样式：
  `src/categories/frontend/react/core/demos/removing-effect-dependencies/options-sync-demo.css`
- 两个 Demo 均由当前 manifest 以 TSX 与 CSS 的真实文件合并加载源码；历史目录名不影响公开课程 ID。

### 数据与组件合同

1. `Region = 'north' | 'south'`、`RoomId = 'alpha' | 'beta'`；模块级只读映射把 `region` 转换为本地
   `endpoint`。`endpoint` 在 render 中计算，因此是本课要识别的响应派生值。
2. `DependencyWidget` 是确定性的本地外部系统替身，保存最近同步的 `endpoint`、`roomId` 与同步调用次数。
   每次 `synchronize` 都递增次数，使无关 render 是否错误触发 Effect 可被直接观察；不发网络请求，不使用随机数、timer、
   Promise、全局 listener 或动画。
3. `DependencyScene` 使用稳定 `widgetRef` 持有 Widget。唯一顶层 `useEffect` 只调用
   `widgetRef.current?.synchronize(endpoint, roomId)`，依赖精确写成 `[endpoint, roomId]`。ref 对象由 React
   保证稳定，`ref.current` 不是响应触发器，不进入数组。
4. `note` 是只用于制造无关 render 的 State，不传入同步组件，不被 Effect 读取，也不进入依赖；编辑备注后
   Widget 快照和 Effect 同步次数必须保持不变。
5. 切换 `region` 会改变 `endpoint`，切换 `roomId` 会改变另一个依赖；两条路径都必须让 Widget 快照同步到
   当前输入并把 Effect 同步次数增加一次。重置通过新的 key 重新创建 Widget，恢复 `north`、`alpha` 与空备注。
6. Demo 不创建错误分支、不暂时抑制 lint，也不并列展示“不完整清单”运行版本；错误写法留在正文静态片段，
   可运行主线始终使用完整依赖。
7. 依赖清单 Demo 的 `useEffect` 运行组件与“查看源码”合并加载同一 TSX/CSS 文件；以每个真实文件的
   `trimEnd()` 内容核对同源，禁止复制展示代码。

### 对象依赖稳定化 Demo 合同

1. `OptionsSyncScene` 的 `roomId` 是唯一决定外部同步的响应值；`note` 只用于制造无关 render。
2. `options` 仅供一个 Effect 使用，在 setup 内创建并传给 `RoomSyncWidget.synchronize`，依赖数组为 `[roomId]`。
3. 切换房间让 Effect 同步次数增加一次；输入备注不改变次数；重置恢复 `alpha` 与空备注。
4. Demo 不使用 `useMemo`、`useCallback`、`useEffectEvent`，也不保留历史课程 ID 的公开引用。
5. 运行组件和查看源码都来自 `options-sync-demo.tsx` 与 `options-sync-demo.css` 的同一组加载器。

### 可观察路径

1. 冷启动：React 输入为 `north`、`alpha`，派生 endpoint 与 Widget 快照一致。当前 Demo 宿主启用开发 Strict
   Mode，初始 `setup -> cleanup -> setup` 检查使 DOM 中的 Effect 同步次数为 `2`；不开启该开发检查时初始值为 `1`。
2. 记下当前次数作为基线后切换到 `south`：派生 endpoint 与 Widget endpoint 同步改变，room 仍为 `alpha`，次数增加 `1`。
3. 切换到 `beta`：Widget room 变为 `beta`，endpoint 保持 `south` 对应值，次数再增加 `1`。
4. 输入备注：备注可见，但 Widget 的 endpoint、room 与 Effect 同步次数均不变，证明无关 State 不应进入依赖。
5. 重置：恢复 `north`、`alpha` 与空备注，同步次数回到新实例的冷启动值；离开再进入课程也不继承旧 Widget 快照。
6. 浏览器只读取 DOM 状态、控件行为、几何与同源源码；不读取 Fiber、Effect queue、Hook flags 或私有对象。

对象依赖 Demo 的可观察路径：

1. 冷启动：房间为 `alpha`，Widget 快照与当前输入一致；当前开发 Strict Mode 宿主中同步次数为 `2`。
2. 记下当前次数作为基线后切换到 `beta`：Widget 房间变为 `beta`，次数增加 `1`。
3. 输入备注：备注可见，Widget 房间和 Effect 同步次数保持不变。
4. 重置：恢复 `alpha` 与空备注，次数回到新实例的冷启动值。

## 临时 TypeScript 7.0.2 Gate

实施阶段用 `mktemp -d /tmp/effect-dependencies-ts.XXXXXX` 创建唯一目录，在其中放最小 `.tsx` fixture，并让
fixture 从只读链接解析当前 React 类型；验证后删除该目录，对实际路径执行 `test ! -e`。不得把 fixture、依赖
链接或输出写入仓库。命令合同：

```sh
npx --yes --package typescript@7.0.2 tsc \
  --ignoreConfig --jsx react-jsx --strict --noEmit --skipLibCheck \
  --moduleResolution node16 --module node16 --target es2022 --esModuleInterop \
  "$lesson24_fixture_dir/fixture.tsx"
```

fixture 最少验证：

- `Region`、`RoomId`、只读 endpoint 映射与 `DependencyWidget.synchronize(endpoint, roomId): void` 的窄类型；
- `useEffect` setup 调用 Widget 时参数与 `[endpoint, roomId]` 标识符一致；
- 一条 `@ts-expect-error` 覆盖非法 `Region` 或 `RoomId`，不得用多条测试扩张范围；
- `DependencyList = readonly unknown[]` 只证明数组类型可传入。TypeScript 不会证明依赖完整、数组内联、顺序固定
  或没有 lint 抑制，这些必须由语义 Gate 覆盖。

## 临时语义 Gate

针对未来同一冻结 snapshot 的 TSX/CSS 建立最小 TypeScript AST/Node 断言，临时脚本只放 `/tmp`：

- 恰好一个本课 `useEffect` 调用，位于组件顶层；第二参数必须是数组字面量，元素按顺序精确为
  `[endpoint, roomId]`，不含 spread、条件表达式、别名或动态构造；
- setup 与任何 cleanup 中的组件作用域响应读取集合，除 React 保证稳定的 `widgetRef` 外，必须与依赖集合完全
  相等；`note`、`region`、state setter 和 module 常量均未被 Effect 直接读取；
- `endpoint` 确实在 render 中由 `region` 和 module 只读映射计算；`region`、`roomId` 改变路径存在，备注只触发
  无关 render，Widget 的每次 `synchronize` 调用都使 DOM 同步次数递增；
- 正文同时覆盖对象与函数的完整依赖、身份问题、移入 setup 及保留原始响应值的前后对照；
- 不存在 eslint/oxlint 抑制、空依赖、缺省依赖、`useMemo`、`useCallback`、`useEffectEvent` 或自定义 Hook；
- 不发起 `fetch`/XHR 请求，不使用 timer、Promise、随机数、动画、Observer、Portal、外部 store、`useLayoutEffect`、
  `useInsertionEffect` 或 `useSyncExternalStore`；
- 新增函数、组件、类构造函数和方法上方都有简洁中文职责注释；CSS 禁止 `grid`、`gap` 与非零
  `letter-spacing`；
- 运行 TSX 与展示源码来自同一文件，`trimEnd()` 后字符数、UTF-8 字节数和 SHA-256 完全一致。

## 工程与 Catalog Gate

正文/Demo 实施和发布阶段必须在同一 snapshot 运行：

```sh
npm run type-check
npm run lint
npm run format:check
npm run build
npm run test:unit
npm run test:e2e
git diff --check -- docs/research/frontend/react/intermediate/effect-dependencies.md \
  src/categories/frontend/react/core/learn/effect-dependencies.md \
  src/categories/frontend/react/core/demos/effect-dependencies/ \
  src/categories/frontend/react/core/demos/removing-effect-dependencies/ \
  src/categories/frontend/react/core/entry-manifest.ts \
  src/categories/frontend/react/core/demo-manifest.ts \
  src/categories/frontend/react/core/react-core-track.ts \
  src/categories/frontend/react/core/progress-migrations.ts \
  src/categories/frontend/react/core/learn/effect-events.md
```

不得新增持久测试、fixture、截图、trace 或浏览器输出。临时 TypeScript fixture、AST 脚本和 Playwright runner
只能放在 `/tmp`，验证完成后删除并确认路径不存在。

## 三视口 Admission Gate

实施后使用 Playwright 冷会话从 `about:blank` 进入本课，监听 HTTP、console error/warning、page error、失败请求
与 `4xx/5xx`：

1. `1440px`：两个 Demo 均完成冷启动、真实依赖变化、无关备注、重置、离开与返回；Widget 快照只响应
   各自真正的依赖，错误与失败请求均为 `0`。
2. `390px`：重复两个 Demo 的完整路径；课程目录、选择控件、备注、依赖状态与 Widget 快照无横向溢出、裁切或遮挡。
3. `390px + 200%`：将根字号设为 `32px` 后重复两项依赖变化和备注路径；控件允许换行但仍可操作，页面与
   Demo 横向滚动为 `0`。
4. 三种视口都核对两个 Demo 的 TSX/CSS 与展示源码同源；重新进入恢复各自初始状态，不产生重复 React root
   warning。浏览器只读取 DOM 公开的同步次数，不读取 Fiber、Effect queue 或 Hook flags。

## 实施与 Admission 结果

- 正文、两个同源 TSX/CSS Demo、entry manifest、demo manifest、Track、进度迁移和相邻课程前置已实施。
- 修复后的本课文件级 Prettier、限定 `git diff --check`、`npm run type-check`、`npm run lint`、
  `npm run test:unit`、`npm run test:e2e` 和完整 `npm run build` 均通过；构建转换 `1799` 个模块。全仓
  `format:check` 仅被四个 I14 范围外的既有索引文件阻塞，本课未跨范围改写它们。
- TypeScript `7.0.2` 对当前两个真实 TSX Demo 的定向编译通过；临时语义检查确认根级 H2/H3 编号、两个
  Effect 的固定依赖与每次 `synchronize` 直接递增公开次数。
- Playwright 在桌面视口确认完整依赖 Demo 从冷值 `2` 经区域、房间变化到 `3`、`4`，备注保持
  `4`，重置回到 `2`；对象稳定化 Demo 从 `2` 变为 `3`，备注保持 `3`，重置回到 `2`。
- `390x844` 与 `390x844 + 32px` 根字号下页面均为 `scrollWidth = clientWidth = 390`；两个源码区均展示真实
  `syncCount` 与 CSS。console error/warning、动态失败请求、静态 `4xx/5xx` 和 failed 请求均为 `0`。
- 验证过程未向仓库新增持久测试、fixture、截图或 trace，浏览器与开发服务已关闭。

## 独立 Standards / Spec 双轴复审

### Standards 轴

独立复审者按课程内容规范、Demo 与交互规范和本研究记录检查：单知识点结构、React 19.2 / 19.2.8 版本分层、
TypeScript 7.0.2 Gate、中文职责注释、同源源码、三视口无溢出、CSS 禁用项、无持久临时资产，以及
`use-effect`、`unnecessary-effects`、`effect-dependencies`、`effect-events` 的边界。任一 finding 都不能用浏览器
可运行抵销规范失败。

### Spec 轴

独立复审者只检查冻结主线：是否从 setup/cleanup 的实际读取识别响应值；`endpoint` 与 `roomId` 是否完整、固定
长度、内联声明；对象 Demo 是否把 `options` 放在 Effect 内并保留 `[roomId]`；无关 `note` 是否不在清单且不触发
同步；是否误把 `[]`、省略参数或 lint 抑制当控制工具；是否提前使用 `useEffectEvent`。两轴必须对同一冻结 SHA
分别达到 `PASS / 0 finding`。

### 首轮独立复审结果

- Standards 轴发现根级 H2/H3 未编号，且本记录提前声明复审通过与进度完成。
- Spec 轴发现函数依赖缺少完整前后示例、本记录对重构范围表述冲突，以及两个 Demo 的同值短路使同步次数无法
  证明 Effect 未重新执行。
- 上述 finding 已定位，修复、回归和同一复审者复核完成前，I14 不得登记完成。

### 二轮独立复核结果

- 同一复审者确认 `Standards PASS / 0 finding`：课程结构、标题编号、学习者正文边界、中文职责注释、
  同源源码、CSS 禁用项、三视口表现和临时资产边界均通过。
- 同一复审者确认 `Spec PASS / 0 finding`：响应值识别、固定内联依赖、对象与函数重构、可观察同步次数、
  manifest、Track、进度迁移与后续课程前置关系均一致。

## 最终闭环条件

以下条件已在同一 I14 快照完成：

- [x] 研究记录、课程正文、两个同源 TSX/CSS Demo、TypeScript/语义 Gate、工程命令、三视口浏览器证据和独立双轴复审齐全。
- [x] Standards 与 Spec 均为 `PASS / 0 finding`。
- [x] entry manifest、demo manifest、Track 和进度迁移在一次变更中登记，历史 `removing-effect-dependencies`
  不再作为公开入口。
- [x] 登记后重新冷启动 Catalog，重跑 build 与本课生产路径，两个 Demo 的依赖变化和源码展示正常。
- [x] 未新增持久测试、fixture、截图、trace 或浏览器输出，临时验证资产未进入仓库。

## 当前结论

- React 19.2 的公共规则是：Effect 的依赖由 setup 与 cleanup 实际读取的响应值决定；props、state、Context、
  组件体变量与函数都可能是响应值，清单必须固定长度、内联且完整（S1-S5）。
- React 逐项使用 `Object.is` 比较依赖；完整清单未变时跳过，任一项变化时重新同步，省略第二参数则每次 commit
  后运行。`v19.2.8` 源码与官方测试只作为这套公共规则的固定实现证据（S7-S10）。
- 漏项会让旧闭包继续读取陈旧值；`exhaustive-deps` 是静态完整性 Gate，不能通过抑制规则或运行时表象替代（S5、S6）。
- 确定性 Demo 分为完整依赖清单和对象依赖稳定化两条路径：前者使用 `[endpoint, roomId]`，后者把只供
  Effect 使用的 `options` 移入 setup 并使用 `[roomId]`；两个 Demo 的无关 `note` 都不触发同步，不使用
  `useEffectEvent`。
- I14 已在双轴复核达到 `PASS / 0 finding` 后登记完成；权威新路线进度为 `41/74`，下一课为
  `effect-events`。

## 参考资料

1. [`useEffect` Reference](https://react.dev/reference/react/useEffect) - 支撑响应依赖定义、内联固定长度、
   `Object.is`、空数组与省略依赖语义。
2. [Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects) - 支撑响应值识别、render
   派生变量、稳定值例外、完整依赖与 stale value 边界。
3. [`exhaustive-deps`](https://react.dev/reference/eslint-plugin-react-hooks/lints/exhaustive-deps) - 支撑静态检查、
   缺失依赖和陈旧闭包结论。
4. [React v19.2.8 `ReactFiberHooks.js` comparison](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberHooks.js#L454-L500) - 固定版本逐项比较与长度检查证据。
5. [React v19.2.8 `ReactFiberHooks.js` update](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberHooks.js#L2615-L2669) - 固定版本相等跳过与变化标记证据。
6. [React v19.2.8 `objectIs`](https://github.com/facebook/react/blob/v19.2.8/packages/shared/objectIs.js#L10-L24) -
   固定版本 `Object.is` 实现入口。
7. [React v19.2.8 Effect dependency tests](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/__tests__/ReactHooksWithNoopRenderer-test.js#L1767-L1855) - 省略依赖、未变化跳过与任一依赖变化的官方测试证据。
