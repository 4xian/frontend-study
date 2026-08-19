# useEffect 同步生命周期调研记录

## 知识点合同

- 目标 ID：`react.core.learn.intermediate.use-effect`
- 目标标题：`useEffect`
- 合并来源：`useEffect`、Effect cleanup、Effect lifecycle
- 适用版本：React `19.2`、React DOM `19.2`、固定源码 `v19.2.8`
- 研究目标：把 Effect 的外部同步、资源清理和独立 start/stop 过程放在同一个可验证模型中。
- 不包含：完整依赖治理与依赖移除策略、无 Effect 重构清单、Effect Event、自定义 Hook、布局 Effect、插入 Effect、
  外部 Store 和数据请求库。

## 合并理由

三个来源共享同一个问题：React 提交后如何让一个不由 React 控制的系统进入当前状态，以及这个同步过程如何在
输入变化和组件移除时正确结束。setup、cleanup 和重新同步如果拆开讲，会重复解释同一依赖与闭包模型，也容易把
cleanup 误认为只在组件卸载时调用。

合并后的知识模型为：

```text
render -> commit -> setup(start) -> 外部系统处于当前状态
依赖改变或移除 -> cleanup(stop) -> 必要时用新闭包 setup(start)
```

小部件、监听器和房间过程三个 Demo 分别观察无资源同步、资源对称清理和过程切换，但都使用同一 setup/cleanup 合同。

## 相邻边界

| 主题 | I12 负责 | 不在 I12 展开 |
| --- | --- | --- |
| 外部同步 | 外部系统识别、提交后 setup、固定依赖、客户端边界 | 把 Effect 当作所有业务回调的入口 |
| cleanup | 同一 setup 取得和撤销资源、handler 身份、旧闭包 | 第三方请求库或复杂取消协议 |
| 生命周期 | start/stop、依赖变化先 stop 后 start、移除时最后 stop、独立过程 | 把组件 mount/update/unmount 当作 Effect 的完整模型 |
| 依赖 | 原始示例中的固定内联数组与响应值 | 对象/函数依赖的系统化重构方法 |
| 调度 | 提交后运行和 Strict Mode 可重复性 | 依赖私有 Fiber、flags 或具体微任务顺序 |

## 官方来源与证据矩阵

| ID | 来源 | 版本 | 支撑结论 |
| --- | --- | --- | --- |
| S1 | [useEffect Reference](https://react.dev/reference/react/useEffect) | React 19.2 | 签名、setup/cleanup、依赖比较、客户端限制、依赖改变和移除时序 |
| S2 | [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects) | React 19.2 | render/commit 后同步外部系统；重复同步后仍应得到同一最终状态 |
| S3 | [Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects) | React 19.2 | Effect 的 start/stop 独立于组件生命周期；每个 Effect 代表一个同步过程 |
| S4 | [StrictMode Reference](https://react.dev/reference/react/StrictMode) | React 19.2 | 开发环境额外 setup -> cleanup -> setup 压力检查 |
| S5 | [ReactFiberCommitEffects mount](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberCommitEffects.js#L141-L177) | v19.2.8 | commit 阶段调用 setup 并保存其返回值，仅作固定版本实现证据 |
| S6 | [ReactFiberCommitEffects cleanup](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberCommitEffects.js#L248-L294) | v19.2.8 | 清理阶段读取、清空并调用已保存 cleanup，仅作固定版本实现证据 |
| S7 | [React effect tests](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/__tests__/ReactHooksWithNoopRenderer-test.js#L1092-L1162) | v19.2.8 | 依赖变化时旧 passive destroy 先于新 create，移除时执行最后 destroy |

## 研究结论

### 1. Effect 的公共合同

`useEffect(setup, dependencies?)` 在组件顶层调用。setup 没有参数，可以返回 `undefined` 或 cleanup 函数。依赖数组
必须直接写在调用点且保持固定长度；React 用 `Object.is` 比较每项。setup 读取的响应值如果未进入依赖数组，就无法
表达真实的重新同步条件。

### 2. setup 与 cleanup 是同一个过程的两端

setup 取得监听、连接、计时器或取消器，cleanup 只撤销这一轮取得的对象。React 会在需要重新同步前调用旧 cleanup，
再用新闭包运行 setup；组件移除时调用最后 cleanup。cleanup 不能通过“当前最新值”猜旧资源，也不能清空其他实例的
共享资源。

### 3. Effect 与组件生命周期不同

组件仍挂载时，`roomId`、`channel` 或 `mode` 改变也会结束旧同步过程并开始新过程。没有响应依赖变化的无关 render 不
应创建新过程。把 Effect 称为“只在 mount 执行一次”会直接丢失重新同步语义。

### 4. 每个 Effect 只描述一个外部系统

标题、连接、事件监听和计时器拥有不同响应输入时，应拆为不同 Effect。拆分后每个 cleanup 的资源所有权清楚，一个
系统的变化不会无谓重建其他系统。

### 5. Strict Mode 的验收不变量

开发环境可能额外运行一次 setup -> cleanup -> setup。正确代码的最终结果应与一次正确 setup 相同：一个监听、一个连接、
一个计时器，或一个已同步的小部件状态。不能用 Ref 旗标跳过第二次 setup，更不能把调用次数作为业务状态。

### 6. 客户端和渲染边界

Effect 不在服务端渲染阶段运行。服务端首屏必须出现的结构由 render 产生，浏览器 API 和外部对象在客户端由 Effect
同步。普通 Effect 不是绘制前布局测量工具。

## Demo 合同

### 外部模式 Widget

- 文件：`src/categories/frontend/react/core/demos/use-effect/use-effect-demo.tsx` 和同名 CSS。
- `ExternalModeWidget` 只拥有一个宿主节点，`setMode` 写入 `data-mode` 和文本，不注册全局资源。
- 组件 State 只保存 `compact`/`expanded`，Effect 固定使用 `[mode]`，按钮只改变 State。
- 可观察结论：React 目标值和 Widget 值在每次提交后相同；无 cleanup 不代表所有外部系统都不需要 cleanup。

### 事件监听对称性

- 文件：`src/categories/frontend/react/core/demos/effect-cleanup/event-listener-symmetry-demo.tsx` 和同名 CSS。
- 本地 `SignalChannel` 只保存监听器集合和确定性计数，不访问网络、不使用随机数或 timer。
- `ListenerRegistration` 在 setup 中创建 handler 并注册，在 cleanup 中用同一 handler 撤销，依赖固定为 `[channel]`。
- 可观察结论：切换频道后旧 listener 为 `0`、新频道为 `1`；卸载后两个频道均为 `0`；发送消息只到活动频道。

### 房间同步过程

- 文件：`src/categories/frontend/react/core/demos/effect-lifecycle/room-sync-process-demo.tsx` 和同名 CSS。
- `RoomSyncProcess` 保存当前活动房间和最近两条有序事件；不使用网络、随机数、Promise、timer 或浏览器全局事件。
- `RoomSynchronizer` 只有一个顶层 Effect，setup 调用 `start(roomId)`，cleanup 调用同一闭包的 `stop(roomId)`，依赖为
  `[process, roomId]`。
- 可观察结论：无关 render 只增加 render 计数；`alpha -> beta` 产生“停止 alpha、开始 beta”；隐藏产生 stop，重新显示产生
  start；重置创建新的冷过程。

## 实现约束

- 运行组件和源码展示必须引用同一 TSX/CSS 文件；源码 loader 只负责拼接文件，不复制另一份示例。
- 新增函数、组件、类构造函数和方法上方添加简洁中文职责注释。
- Demo 样式使用 Flexbox 和普通流，不使用 `grid`、`gap` 或非零 `letter-spacing`。
- 不创建持久测试、fixture、截图或 trace；验证资产放在 `/tmp`，完成后删除。
- 课程正文只描述 Effect 知识点、示例和适用边界，不写路线、批次、完成度、构建、复审或篇幅叙事。

## 验收清单

### 内容

- [x] frontmatter 的目标 ID、标题、前置和版本信息正确。
- [x] 正文覆盖 setup、cleanup、依赖、资源所有权、重新同步、独立过程、Strict Mode 和客户端边界。
- [x] 易错点覆盖 render 副作用、无 cleanup、handler 身份、共享清理、旧闭包、空依赖、错误返回值、Strict Mode 旗标、
  State 循环和多系统耦合。
- [x] 正文没有课号、计划、批次、完成计数或生产流程叙事。

### 清单与迁移

- [x] 旧 `effect-cleanup`、`effect-lifecycle` 从公开 entry 和 Track 移除。
- [x] 三个来源的完成状态迁移到 `use-effect`；不完整历史来源进入 `legacyCompletedEntryIds`。
- [x] 三个 Demo 的公开 ID 归属 `use-effect`，旧文件保留为迁移来源，不再生成独立公开入口。
- [x] 相邻课程的相关/前置 ID 不指向已经退出公开清单的旧条目。

### 浏览器与工程

- [x] 桌面、390px 和 390px 根字号 32px 下完成三个 Demo 的可观察路径。
- [x] 页面和 Demo 无横向溢出、控件裁切或重叠；console error/warning、page error 和失败请求为 0。
- [x] `type-check`、`lint`、`build`、`test:unit`、`test:e2e` 和限定 diff 检查通过；聚焦 Prettier 通过。
- [x] 独立 Standards 与 Spec 复审均为 `PASS / 0 finding`。

## 参考资料

1. [useEffect Reference](https://react.dev/reference/react/useEffect)
2. [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
3. [Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects)
4. [StrictMode Reference](https://react.dev/reference/react/StrictMode)
5. [React v19.2.8 ReactFiberCommitEffects.js](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberCommitEffects.js)
6. [React v19.2.8 ReactHooksWithNoopRenderer tests](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/__tests__/ReactHooksWithNoopRenderer-test.js)
