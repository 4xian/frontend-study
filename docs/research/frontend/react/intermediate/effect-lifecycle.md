# Effect 生命周期研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.intermediate.effect-lifecycle`
- 标题：`Effect 生命周期`
- 教学层级：中级
- 核验日期：`2026-08-11`
- 研究状态：官方调研、正文、Demo、临时验证、Admission、独立复审与登记已完成
- 官方文档基线：React `19.2`
- 仓库运行时基线：React / React DOM `19.2.8`
- 固定源码 tag：`v19.2.8`，commit `1dd4ecbdabf826f527fc9a58c05ea70375b7d170`
- RC2 路线 TypeScript 基线：`7.0.2`
- 当前本地类型/编译器快照：`@types/react` `19.2.18`、TypeScript `6.0.3`
- 前置课程：`react.core.learn.intermediate.effect-cleanup`（第 21 课，已发布）
- 后续课程：第 23 课不需要 Effect、第 24 课 Effect 依赖、第 25 课移除 Effect 依赖、第 26 课 Effect
  Event、第 27 课自定义 Hook、第 28 课 `useLayoutEffect`，以及计划中的第 29 课能力
- 当前路线状态：第 1-22 课 `available`，第 23-29 课 `planned`，权威进度 `22/29`

### 当前正式资产核对

- `src/categories/frontend/react/core/react-core-track.ts` 的第 21、22 课均为 `available`；entry/demo
  manifest 已登记本课资产，第 23 课仍为 `planned`。
- 第 21 课 `effect-cleanup` 已完成 setup/cleanup 对称资源合同；本课承接其 cleanup，但把观察重点提升为
  “一个 Effect 如何开始、停止并在响应值变化时重新同步”。
- 本课不提前改动第 23-29 课的状态、正文、Demo、Reference 或其他技术模块。

## 与相邻课程的硬边界

| 课程 | 主线 | 第 22 课边界 |
| --- | --- | --- |
| 第 20 课 `use-effect` | 在提交后把值同步到 React 外部系统 | 只承接 setup 入口，不重复讲为什么需要 Effect |
| 第 21 课 `effect-cleanup` | setup 与 cleanup 对称撤销同一资源 | 只把 cleanup 当作停止同步的出口，不重复事件监听 API 细节 |
| 第 22 课 `effect-lifecycle` | 把 Effect 看成独立同步过程，观察开始、停止、重新同步 | 只用一个确定性同步过程，不讲完整依赖推导或 linter 决策 |
| 第 23 课 `unnecessary-effects` | 把渲染计算和用户事件留在正确阶段 | 不判断某段业务是否应该使用 Effect |
| 第 24 课 `effect-dependencies` | 识别 Effect 读取的响应值并声明依赖 | 仅使用固定内联 `[process, roomId]`，不展开依赖清单规则 |
| 第 25 课 `removing-effect-dependencies` | 通过改写数据流减少依赖 | 不讲对象/函数依赖消除、状态更新重写或压制 lint |
| 第 26 课 `effect-events` | 提取读取最新值的非响应逻辑 | 不使用 `useEffectEvent` |
| 第 27-29 课 | 自定义 Hook、布局时序与后续能力 | 不引入自定义 Hook、`useLayoutEffect`、`useInsertionEffect` 或 `useSyncExternalStore` |

## 官方来源与证据矩阵

| ID | 来源 | 版本 | 支撑结论 |
| --- | --- | --- | --- |
| S1 | [Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects) | React 19.2 | Effect 生命周期不同于组件生命周期；Effect 只描述开始和停止同步；依赖变化时可在组件仍挂载时多次重新同步；每个 Effect 是独立同步过程 |
| S2 | [`useEffect` Reference](https://react.dev/reference/react/useEffect) | React 19.2 | setup 在提交后运行；依赖变化时先用旧值 cleanup 再用新值 setup；移除时执行最后 cleanup；setup/cleanup 只能组成一个同步过程 |
| S3 | [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects) | React 19.2 | cleanup 必须停止或撤销 setup 所做的同步；开发重复 setup 不应改变用户可观察的最终状态 |
| S4 | [`StrictMode` Reference](https://react.dev/reference/react/StrictMode) | React 19.2 | 开发环境首次真实 setup 前会额外运行 setup -> cleanup -> setup，属于压力检查，不是业务调用次数合同 |
| S5 | [`ReactFiberCommitEffects.js` mount](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberCommitEffects.js#L141-L177) | v19.2.8 | 固定版本 commit 阶段调用 Effect 的 `create()`，并保存返回值为内部 destroy；这是内部实现证据，不是公共 API |
| S6 | [`ReactFiberCommitEffects.js` unmount](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberCommitEffects.js#L248-L294) | v19.2.8 | 固定版本清理阶段读取并清空 destroy，再安全调用 cleanup；这是内部实现证据 |
| S7 | [`ReactFiberWorkLoop.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberWorkLoop.js#L4546-L4564) | v19.2.8 | passive 阶段按 `commitPassiveUnmountEffects` 后 `commitPassiveMountEffects` 的顺序处理旧清理与新建立 |
| S8 | [React effect tests](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/__tests__/ReactHooksWithNoopRenderer-test.js#L1092-L1162) | v19.2.8 | 官方测试观察依赖变化时旧 passive destroy 先于新 create，组件移除时执行最后 passive destroy；测试中的调度时机不作为本课公共 API |

## 研究结论

### 1. Effect 与组件生命周期是两套视角

React 官方把组件的 mount、update、unmount 与 Effect 的 start、stop 明确区分（S1）。一个组件仍然挂载时，
其 Effect 也可能因为同步输入改变而停止旧过程并开始新过程；组件移除时，当前过程最后停止。教学上应从一个
独立 Effect 的单次 start/stop 周期出发，而不是给 Effect 贴“挂载回调”或“卸载回调”的标签。

### 2. 重新同步是不重叠的过程切换

当 `roomId` 变化并触发提交时，React 先以旧闭包执行 cleanup，再以新值运行 setup（S1、S2、S7）。因此 Demo
必须能读出 `停止 alpha` 发生在 `开始 beta` 之前；不能只展示最终“当前房间”而丢失顺序。组件被隐藏时只执行当前
过程的 stop，重新显示时重新 start。

### 3. 每个 Effect 只负责一个同步过程

官方教程要求每个 Effect 代表独立、互不耦合的同步过程（S1）。本课 Demo 只创建一个“房间同步过程”并让
UI 控制其输入；渲染计数等 UI 状态不属于该过程。不要把两个互不相关的外部系统塞进同一个 Effect，也不要用
一个全局布尔值跳过重新同步。

### 4. Strict Mode 只改变开发期调用次数

Strict Mode 可能在首次真实 setup 前执行一次额外 setup -> cleanup -> setup（S2、S4）。正确的资源对称性应让
用户只观察到一个活动过程；浏览器验收检查活动过程、停止/开始顺序和最终结果，不断言 setup 或 cleanup 恰好执行
一次。Demo 的事件历史可保留最近两条，避免把开发探针的调用次数写成教学合同。

### 5. 固定源码只用于解释时序，不暴露内部 API

`v19.2.8` 的 `commitHookEffectListMount` 保存 `create()` 返回值，`commitHookEffectListUnmount` 读取、清空并
调用该值（S5、S6）；passive flush 先运行 unmount 再运行 mount（S7）。官方测试在 `bar` 不变、`foo` 改变时
观察到 `passive foo destroy` 先于 `passive foo create`，移除时执行最后 destroy（S8）。这些是当前固定版本的
实现和测试证据，正文只能用它们解释公共合同，不能让学习者依赖 Fiber、flags 或内部函数名。

## 确定性同源 Demo 合同

### 资产建议

- Demo ID：`react.core.learn.intermediate.effect-lifecycle.room-sync-process-demo`
- 运行与展示源码：`src/categories/frontend/react/core/demos/effect-lifecycle/room-sync-process-demo.tsx`
- 样式：`src/categories/frontend/react/core/demos/effect-lifecycle/room-sync-process-demo.css`
- 本课实施前状态：资产尚未创建，manifest 尚未登记，课程仍为 `planned`

### 资源与组件合同

1. `SyncProcess` 是确定性的本地外部系统替身，保存当前活动房间和最近两条带顺序的事件；不发网络请求、不使用
   随机数、timer、Promise、动画或浏览器全局事件。
2. 负责同步的组件只包含一个顶层 `useEffect`：setup 调用 `process.start(roomId)`，cleanup 调用
   `process.stop(roomId)`，依赖固定写成 `[process, roomId]`；两次调用共享同一个房间闭包。
3. 页面控件只改变观察目标：切换房间触发重新同步，隐藏/重新显示同步组件触发停止/开始，无关渲染按钮只增加
   render 计数，不改变同步事件；重置恢复 `alpha`、显示状态和计数。
4. 状态区展示活动过程、当前房间、最近两条事件及无关渲染次数；每条事件明确“停止/开始”和房间 ID，能直接
   验证切换顺序。
5. Strict Mode 的额外 setup/cleanup 不计入固定调用次数；只以活动过程和用户可观察顺序验收。重新挂载后不能继承
   旧 Demo 实例的事件历史或活动连接。

### 可观察路径

1. 冷启动：`alpha` 活动过程为 `1`，状态显示 `alpha`；开发环境允许最近两条事件为 `停止 alpha`、`开始 alpha`。
2. 点击无关渲染：render 计数增加，活动过程和最近事件不变，证明 Effect 不是普通 render 回调。
3. 切换到 `beta`：最近两条事件严格为 `停止 alpha`、`开始 beta`，活动过程只显示 `beta`。
4. 隐藏同步组件：活动过程变为 `0`，最后事件为 `停止 beta`；再次显示后活动过程恢复为 `beta`，最后事件为
   `开始 beta`。
5. 重置：恢复 `alpha`、显示状态和 render 计数；随后重复切换得到同样顺序。离开并重新进入课程后不得保留旧历史。
6. 浏览器只检查可读状态、事件顺序、按钮可操作性、横向几何和同源源码，不读取 Fiber、Effect queue 或私有 flag。

## 临时 TypeScript 7.0.2 Gate

在 `/tmp/effect-lifecycle-ts` 创建最小 `.tsx` fixture，验证后删除并执行 `test ! -e /tmp/effect-lifecycle-ts`。
不得把 fixture、依赖链接或编译输出写入仓库。命令合同：

```sh
npx --yes --package typescript@7.0.2 tsc \
  --ignoreConfig --jsx react-jsx --strict --noEmit --skipLibCheck \
  --moduleResolution node16 --module node16 --target es2022 --esModuleInterop \
  /tmp/effect-lifecycle-ts/fixture.tsx
```

fixture 最少验证：

- `RoomId = 'alpha' | 'beta'` 与 `SyncProcess.start/stop(roomId: RoomId): void` 的同源签名；
- 顶层 `useEffect` 以同一 `roomId` 调用 start/stop，并固定使用 `[process, roomId]`；
- cleanup 返回同步函数；临时类型错误覆盖 Promise 和非函数返回值；
- `process.stop(roomId)` 直接调用和条件 Hook 属于语义错误，由临时静态断言覆盖，不假装 TypeScript 会拒绝合法的
  `void` 表达式。

## 临时语义 Gate

针对未来同一 snapshot 的 TSX/CSS 做最小扫描/Node 断言：

- 只有一个本课 Effect 主线；setup/cleanup 都使用同一 `process`、`roomId` 和闭包，不新增第二个外部同步系统；
- Demo 必须包含 `[process, roomId]`，但不动态拼接依赖、不使用 `useEffectEvent`、自定义 Hook 或依赖抑制注释；
- 无 `fetch`/XHR、网络 URL、timer、Promise、随机数、动画、Observer、Portal、外部 store、`useLayoutEffect`、
  `useInsertionEffect` 或 `useSyncExternalStore`；
- 新增函数、组件、类构造函数和方法上方都有简洁中文职责注释；CSS 禁止 `grid`、`gap` 和非零 `letter-spacing`；
- 运行 TSX 与展示源码来自同一文件，`trimEnd()` 后字符数、UTF-8 字节数和 SHA-256 完全一致。

## 工程与 Catalog Gate

本课正文/Demo 实施与发布阶段运行：

```sh
npm run type-check
npm run lint
npm run format:check
npm run build
npm run test:unit
npm run test:e2e
git diff --check -- docs/research/frontend/react/intermediate/effect-lifecycle.md \
  src/categories/frontend/react/core/learn/effect-lifecycle.md \
  src/categories/frontend/react/core/demos/effect-lifecycle/
```

不得创建持久测试、fixture、截图、trace 或浏览器输出。若浏览器适配需要 Catalog 条目，只能使用临时 overlay，
记录 overlay 前后 manifest/track 哈希，冷会话验证后恢复 planned 基线，并以 `test ! -e` 确认临时资产删除。

## 三视口浏览器 Gate

用 Playwright 冷会话从 `about:blank` 进入实现后的课程，监听 HTTP、console error/warning 和 page error：

1. `1440px`：完成冷启动、无关渲染、房间切换、旧过程停止、新过程开始、隐藏、重新显示和重置；顺序和活动状态
   均可读，错误与失败请求为 `0`。
2. `390px`：重复完整路径，课程目录、Demo、按钮、事件列表无横向溢出、裁切或遮挡。
3. `390px + 200%`：将根字号设为 `32px`，重复切换和隐藏/显示；按钮换行但仍可操作，页面横向滚动为 `0`。
4. 离开后重新进入：恢复 `alpha` 活动过程与冷事件历史，不继承上一轮实例；不产生重复 React root warning。

## 独立 Standards / Spec 复审与原子发布

### 实施与 Admission 结果

- 正文、同源 TSX Demo 与 CSS 已按冻结合同完成；TypeScript `7.0.2` 临时 fixture、AST 语义 Gate、
  type-check、lint、format、build、unit、e2e、scoped diff 与 CSS 禁用项检查均通过。临时 fixture 已删除。
- Admission 临时登记前后三份权威清单 SHA-256 均恢复为 planned 基线：track
  `4410df7a98aef82b56ac41d5cdcb2d5a7c0cecafed839c7597e90315b37cb9a3`、entry
  `214006620270689575bf79fec938d487d7e2ce9915f36d094a537018f909744e`、demo
  `f5a17eab79d147da1a2de7fcef955db5cf13e1b2f934613bb38bae668695c383`。
- Admission 时并发写入中的 Java 数据库分片草稿未满足 Markdown schema，真实开发服务器无法重新挂载；浏览器
  Gate 因此在 `/tmp` 隔离快照中排除 Java 技术清单后执行，没有修改真实后端资产。隔离项目和 Playwright 输出
  均已删除并确认不存在。
- `1440px`、`390px` 与 `390px + 根字号 32px` 均通过冷启动、无关渲染、切换到 `beta`、隐藏、重新显示和
  重置：切换最近事件为 `停止 alpha -> 开始 beta`，页面与 Demo 横向溢出为 `0`，按钮裁切为 `0`；console
  warning/error、page error、失败请求和 `4xx/5xx` 均为 `0`。离开后返回恢复 `alpha` 冷状态。
- 展示源码与运行 TSX 去除末尾换行后均为 `4862` 字符、`5554` UTF-8 字节，SHA-256 为
  `937ba73be05de930bbae6d3e99bd8b01c71869e415d494d3b89a64c8739a1525`。
- 首轮独立复审为 Standards `FAIL / 1 finding`、Spec `PASS / 0 finding`；把重复的“空依赖数组”易错项
  改为独立的“cleanup 读取可变最新输入并停止错房间”后，第二轮两轴均为 `PASS / 0 finding`。随后已原子登记
  entry/demo manifest 并把第 22 课切为 `available`。
- 原子登记后的最终 `npm run build-only` 已通过，共转换 `1524` 个模块，仅保留既有大 chunk 提示；此前并发
  Java 草稿造成的临时 Markdown schema 阻塞已经消失，本课没有改动相关后端资产。
- 生产预览冷路由 `http://127.0.0.1:4176/frontend/react/core/learn/effect-lifecycle` 返回 HTTP `200`，H1
  正确，初始状态为“已同步 alpha”；离开后重新进入仍恢复 `alpha`，console warning/error、page error、失败
  请求和 `4xx/5xx` 均为 `0`。

### Standards 轴

独立复审者按课程规范、Demo 规范和本记录检查：单知识点结构、中文职责注释、React/React DOM 19.2.8 与
TypeScript 7.0.2 边界、同源源码、三视口无溢出、CSS 禁止项、无持久临时资产，以及第 21-26 课硬边界。任一
finding 都保持本课 `planned`，不得用功能运行结果抵销。

### Spec 轴

独立复审者只检查冻结主线：Effect 是否作为可独立开始/停止/重新同步的过程；房间变化是否观察到旧 stop 先于新
start；隐藏/重新显示是否停止/开始当前过程；无关 render 是否不制造同步事件；是否错误把组件 mount/update/unmount
当作 Effect 的完整生命周期，或引入第 23-29 课范围。两轴必须针对同一冻结 snapshot 达到 `PASS / 0 finding`。

### planned -> available 原子条件

只有以下条件在同一冻结 snapshot 全部通过，才允许发布第 22 课：

1. 研究记录、正文、同源 Demo/CSS、TypeScript/语义 Gate、工程命令、Catalog overlay、三视口浏览器证据和双轴
   复审均齐全；
2. Standards 与 Spec 独立复审均为 `PASS / 0 finding`，复审针对同一 SHA，不接受陈旧快照；
3. 在一次原子变更中登记第 22 课 entry 与同源 Demo，把 track 第 22 课从 `planned` 切为 `available`，权威进度从
   `21/29` 更新为 `22/29`，随后冷启动 Catalog 并重跑相关路径；
4. 任一单项未闭环都保持第 22 课 `planned`；本调研任务不执行登记、track 修改、发布、提交、暂存或无关清理。

## 当前结论

- React 公共合同不是“组件挂载时执行一次回调”，而是 Effect 描述一个同步过程：setup 开始，cleanup 停止；依赖变化
  时旧过程停止后重新开始，组件移除时执行最后停止（S1、S2）。
- 每个 Effect 应代表一个独立同步过程；本课以确定性房间同步替身观察过程顺序，不把开发调用次数写成业务状态（S1、S3、S4）。
- `v19.2.8` 的内部 commit/passive 实现与官方测试支持旧 destroy 先于新 create，但内部 Fiber 名称不进入公共教学合同（S5-S8）。
- 当前权威进度为 `22/29`；第 22 课调研、正文、Demo、临时验证、Admission、独立复审与登记均已完成；
  第 23-29 课仍为 `planned`，下一课为“不需要 Effect 的场景”。

## 参考资料

1. [Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects) - 支撑 Effect 与组件生命周期的区别、
   独立同步过程、重新同步与每个 Effect 的独立边界。
2. [`useEffect` Reference](https://react.dev/reference/react/useEffect) - 支撑 setup/cleanup、依赖变化时序、卸载和 Strict Mode。
3. [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects) - 支撑 cleanup 停止或撤销 setup 所做的同步。
4. [`StrictMode` Reference](https://react.dev/reference/react/StrictMode) - 支撑开发期额外 setup -> cleanup -> setup 的压力检查。
5. [React v19.2.8 ReactFiberCommitEffects mount](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberCommitEffects.js#L141-L177) - 固定版本 setup 返回值保存证据。
6. [React v19.2.8 ReactFiberCommitEffects cleanup](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberCommitEffects.js#L248-L294) - 固定版本 cleanup 调用证据。
7. [React v19.2.8 ReactFiberWorkLoop passive phase](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberWorkLoop.js#L4546-L4564) - 固定版本 passive unmount/mount 顺序证据。
8. [React v19.2.8 effect tests](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/__tests__/ReactHooksWithNoopRenderer-test.js#L1092-L1162) - 固定版本依赖变化和卸载 destroy 顺序证据。
