# React 更新模型研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.basics.render-commit-and-state-snapshot`
- 标题目标：React 更新模型
- 教学层级：本科范围内的 React 基础公开模型
- 核验日期：`2026-08-16`
- 研究状态：官方调研已完成，可据此合并旧课程
- 运行时基线：React / React DOM `19.2.8`
- 文档基线：React 官方文档 `19.2`
- 固定文档提交：`c7d6b700038c63d1aaf2c649af1aefe01ebbacac`
- 类型基线：`@types/react` `19.2.18`、TypeScript `6.0.3`

本目标保留原课程 ID，并吸收退出路线的 `react.core.learn.basics.state-update-queue`。课程必须用一条
连续因果链解释：什么触发更新、React render 做什么、commit 做什么、browser paint 在哪里、某次
render 的 State / Props / handler 为什么是固定快照、React 如何 batching 更新，以及直接值与 updater
怎样按队列顺序得到下一 State。

课程应覆盖 updater 纯度。StrictMode 只用于说明开发期可能额外调用应纯函数，`flushSync` 只用于标出
少数第三方同步集成的逃生舱；两者都不能扩写成独立专题。

## 一、研究范围与排除项

### 1.1 必须回答的问题

1. 初次 `root.render` 与 State 更新怎样触发 React render。
2. React render、React commit 与 browser paint 各自负责什么。
3. 为什么一次 render 得到的 State、Props、局部变量、JSX 和 handler 属于同一份时间快照。
4. 为什么 setter 只影响后续 render，当前 handler 仍读取旧快照。
5. batching 的公开教学边界，以及 React 18+ `createRoot` 的 automatic batching 边界。
6. 直接值为什么是当前位置的替换指令，updater 为什么接收 pending State。
7. 多个 updater 和直接值、updater 混合时怎样按加入顺序求值。
8. updater 为什么必须纯净，以及 StrictMode 对 updater 的开发期检查边界。

### 1.2 明确排除

| 排除主题 | 原因与本目标允许的边界 |
| --- | --- |
| `useState` 基础签名、初始化、类型推断、函数 State | 已由独立基础课完成；这里只使用现成 setter，不重新教学 API 入门。 |
| 对象与数组 State 更新 | 由不可变更新目标统一负责；本目标只使用原始数字 State。 |
| Effect、Ref、DOM 测量 | 不用这些 API 探测 render、commit 或 paint，也不教学提交后同步。 |
| Reducer、Context、外部 store | 不扩展单个 `useState` 队列的公开模型。 |
| Transition、并发内部机制 | 不讨论中断、优先级、后台更新或可见性策略。 |
| Fiber、lane、scheduler 实现 | 官方教学模型已经足够；内部字段与时序不是公共合同。 |
| hydration、SSR、RSC、streaming | 本目标只讨论当前客户端 `createRoot` 路径。 |
| 表单 | 不借表单提交或输入受控行为扩大示例范围。 |
| 生产计划叙事 | 未来课程正文不得出现编号、批次、测试、构建、复审或后续课程安排。 |

### 1.3 准确边界而非展开教学

- **render 纯度：** 只需说明组件与 updater 在 render 期间必须可安全重复；组件纯度的系统教学不在本目标
  重复。
- **StrictMode：** 只说明开发期额外调用组件函数和 updater、忽略一次 updater 结果、事件 handler 不因
  此自动执行两次、生产环境没有该检查。
- **`flushSync`：** 只说明它可在少数第三方集成中同步提交 DOM、可能损害性能并冲刷其他 pending work；
  不展示 Effect、Suspense、DOM 测量或具体浏览器 API 示例。

## 二、研究方法与证据边界

1. 冻结范围来自当前 React 课程总计划中的合并映射和目标表；研究不改写计划或实现状态。
2. 两份旧调研已经给出官方入口，本轮直接读取已知的 `react.dev`、React 官方 GitHub 文档提交和 React
   `v19.2.8` tag，不需要关键词发现，也不使用二手文章支撑事实。
3. 通过 GitHub Contents API 核对固定提交与当前 `reactjs/react.dev` 主分支；本课引用的九份文档在
   `2026-08-16` 的 blob SHA 与固定提交完全一致。
4. React / React DOM 的运行时 patch 同时以本地 lockfile、安装包和 React 官方 `v19.2.8` tag 核对；
   类型与 TypeScript 只记录当前工具链版本，不把静态类型当成运行时证据。
5. 队列只采用 React 官方的 `replace with value` / updater 教学模型。文中的“队列”不是应用可访问的
   JavaScript 数组，也不是对内部 update 节点、lane 或 scheduler 的描述。
6. “事件处理器结束后再处理”是官方 batching 教学边界；不由此推导 microtask、macrotask、事件循环、
   跨 root 顺序或精确 render 次数。
7. “browser paint”只采用官方顺序：React 更新 DOM 后，浏览器再绘制。它不保证一次 commit 对应一个
   独立帧，也不保证 setter 返回时已 paint。
8. 本记录可以描述合并与处置计划；未来课程正文必须去掉这些生产过程信息。

## 三、版本基线

| 项目 | live 版本 | 当前证据 | 采用方式 |
| --- | --- | --- | --- |
| React | `19.2.8` | `package.json`、lockfile、安装包、React 官方 `v19.2.8` tag | 课程运行时基线 |
| React DOM | `19.2.8` | `package.json`、lockfile、安装包、React 官方 `v19.2.8` tag | 客户端 Root 与 `flushSync` 边界 |
| `@types/react` | `19.2.18` | `package.json`、lockfile、安装包 | 只记录类型工具链，不教学 `useState` 类型 |
| TypeScript | `6.0.3` | lockfile与安装包；`package.json` 范围为 `~6.0.0` | TSX 编译基线 |
| React 文档 | `19.2` | `react.dev` 当前文档及固定提交 | 公开行为事实来源 |

React 文档按 minor 展示，运行时按 patch 锁定，因此“文档 `19.2`”与“运行时 `19.2.8`”并不冲突。

## 四、一手来源表

| ID | 一手来源 | 固定或版本入口 | 本目标采用的事实 |
| --- | --- | --- | --- |
| `react-runtime` | [React `v19.2.8`](https://github.com/facebook/react/tree/v19.2.8) | React / React DOM `19.2.8` tag | 锁定运行时 patch；不引用 Fiber、lane 或调度器内部实现。 |
| `react-render` | [Render and Commit](https://react.dev/learn/render-and-commit) | [固定文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/render-and-commit.md) | Trigger、render、commit 三阶段，初次与 State 更新触发，最小 DOM 变化和 browser paint。 |
| `react-snapshot` | [State as a Snapshot](https://react.dev/learn/state-as-a-snapshot) | [固定文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/state-as-a-snapshot.md) | setter 请求后续 render；State、局部变量、JSX 与 handler 属于特定 render。 |
| `react-props` | [Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component) | [固定文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/passing-props-to-a-component.md) | Props 是只读的时间快照，每次 render 接收一版 Props。 |
| `react-queue` | [Queueing a Series of State Updates](https://react.dev/learn/queueing-a-series-of-state-updates) | [固定文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/queueing-a-series-of-state-updates.md) | batching、直接值替换、updater 顺序、混合队列、纯度与多次有意事件边界。 |
| `react-use-state` | [`useState`](https://react.dev/reference/react/useState) | [固定文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/useState.md) | setter 只影响下一 render、updater 接收 pending State、队列处理和 StrictMode caveat。 |
| `react-purity` | [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure) | [固定文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/rules/components-and-hooks-must-be-pure.md) | Props / State 不可变快照和 render 纯度边界。 |
| `react-strict` | [`<StrictMode>`](https://react.dev/reference/react/StrictMode) | [固定文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/StrictMode.md) | 开发期额外调用应纯函数，不包含事件 handler 内部代码，生产构建不受影响。 |
| `react-batching-18` | [React 18 Upgrade Guide](https://react.dev/blog/2022/03/08/react-18-upgrade-guide#automatic-batching) | [固定文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/blog/2022/03/08/react-18-upgrade-guide.md) | `createRoot` 下 Promise、timeout、原生事件等来源的 automatic batching。 |
| `react-flush-sync` | [`flushSync`](https://react.dev/reference/react-dom/flushSync) | [固定文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/flushSync.md) | 同步 DOM 提交、第三方集成、性能与额外 pending work 风险、last resort 定位。 |

## 五、两份旧调研的逐项审计

### 5.1 旧《Render、Commit 与 State 快照研究记录》

| 原部分 | 处置 | 理由与目标位置 |
| --- | --- | --- |
| 冻结知识点合同 | **重写** | 保留课程 ID，标题改为“React 更新模型”，取消旧的“队列全部排除”边界。 |
| 研究方法与证据边界 | **保留并补充** | 保留公开模型、paint 和内部机制边界；补充合并范围、live blob 与版本核对。 |
| 官方来源卡 | **合并** | 保留 render、snapshot、purity、StrictMode、useState；加入 queue、automatic batching 和 `flushSync`。 |
| 一、术语模型 | **保留并扩展** | 继续区分 trigger、render、commit、paint；新增 snapshot、batch 和 queue 的相互关系。 |
| 二、Trigger | **保留并收窄** | 保留初次 `root.render` 与 State 更新两类基础触发，不穷举所有 React API。 |
| 三、Render | **保留主结论，删除重复教学** | 保留“React 调用组件计算 UI”；组件纯度的长篇示例属于已完成知识点，不在新正文重讲。 |
| 四、Commit 与 paint | **保留** | 最小 DOM 变化和 paint 顺序是合并后完整模型的必要尾部。 |
| 五、Snapshot | **保留并合并队列** | State / Props / handler 快照是解释三次直接值和 setter 后旧值的前提。 |
| 六、StrictMode render | **压缩** | 仅保留开发 / 生产、应纯函数与事件 handler 边界，并与 updater 纯度放在一起。 |
| 七、TypeScript / TSX | **删除教学，保留版本** | `useState` 签名和类型已由前置内容覆盖；B16 只使用可编译 TSX。 |
| 八、高价值易错点 | **合并去重** | 与旧队列研究的错误矩阵合成一张，避免重复“setter 后旧值”。 |
| 九、正文与 Demo 边界 | **重写** | 旧合同禁止多个 setter，已不符合合并目标；改成单一合并正文与单一合并 Demo。 |
| 十、不采用的说法 | **合并** | 保留阶段、快照与 StrictMode 禁区，加入 batching 和队列禁区。 |
| 研究结论 | **重写** | 结论必须从交互快照走到队列、下一 render、commit 与 paint，不再停在旧课程边界。 |

### 5.2 旧《State 更新队列研究记录》

| 原部分 | 处置 | 理由与目标位置 |
| --- | --- | --- |
| 冻结知识点合同 | **并入后删除旧目标** | 旧课程 ID 退出路线，全部教学价值归入保留 ID。 |
| 研究方法与证据边界 | **保留并修正** | 保留公开队列与 `createRoot` 边界；删除“前一课/第 14 课”等失效叙事。 |
| 官方来源卡 | **合并** | queue、useState、StrictMode、React 18 upgrade、`flushSync` 均进入新来源表。 |
| 一、事实矩阵 | **合并** | setter 请求、batching、queue、StrictMode 与阶段模型放入同一 claim 矩阵。 |
| 二、batching | **保留** | 事件处理结束、多变量批处理价值和不跨有意事件是必讲事实。 |
| 三、直接值替换 | **保留并精简** | 保留三次直接值和 replace 语义；删除与 API 入门重复的状态联合类型示例。 |
| 四、updater queue | **保留主线** | 保留 pending State、顺序求值和纯度；删除 `SetStateAction` 类型教学。 |
| 五、混合队列 | **完整保留** | `replace 5 -> updater -> replace 42` 是防止错误简化的核心证据。 |
| 六、automatic batching / `flushSync` | **压缩为边界** | automatic batching 可讲公共行为；`flushSync` 的案例和机制留给专门目标。 |
| 七、StrictMode | **合并** | 与 render 纯度放在同一小节，只保留 updater 双调用的准确限定。 |
| 八、TypeScript / TSX | **删除教学，保留编译要求** | 不重复前置 `useState` 类型课程。 |
| 九、高价值易错点 | **合并去重** | 与阶段 / 快照错误合并为新矩阵。 |
| 十、正文与 Demo 边界 | **重写** | 四种队列动作保留，但并入目标 Demo，旧 Demo ID 不继续独立存在。 |
| 十一、不采用的说法 | **合并** | 所有公开模型禁区继续有效，并加入完整更新链语境。 |
| 研究结论 | **并入** | 不再宣称旧课程可单独实现，改成合并目标的事实结论。 |

## 六、逐 claim 证据矩阵

| Claim | 可以采用的准确表述 | 不能推出 | 来源 |
| --- | --- | --- | --- |
| 初次触发 | 客户端调用 Root 的 `render` 请求初次 render。 | 所有宿主、hydration 和服务端入口都相同。 | `react-render` |
| 后续触发 | 组件或祖先 State 更新可触发后续 render。 | 每个 setter 都对应一次独立同步 render。 | `react-render`、`react-use-state` |
| React render | render 是 React 调用组件并计算下一版 UI。 | render 就是 DOM 更新或浏览器绘制。 | `react-render` |
| 递归计算 | React 会继续 render 返回的嵌套组件，直到得到要显示的树。 | 每次都必须调用整棵应用树，或能据此预测次数。 | `react-render` |
| commit | React 在 commit 阶段应用让 DOM 匹配结果所需的变化。 | 每次 render 都会重建或修改全部 DOM。 | `react-render` |
| browser paint | React 更新 DOM 后，浏览器再绘制屏幕。 | 一次 commit 必定立即产生一个独立帧。 | `react-render` |
| State 快照 | React 为特定 render 提供该次 State；setter 只影响后续 render。 | 快照是深拷贝、冻结对象或可由 setter 原地改写。 | `react-snapshot`、`react-use-state` |
| Props 快照 | Props 是只读时间快照，每次 render 接收一版 Props。 | 父组件变化会回写正在运行的旧 handler。 | `react-props`、`react-purity` |
| handler 快照 | handler 与局部变量由某次 render 创建，继续读取该次 State / Props。 | 延迟执行会自动切换到最新值。 | `react-snapshot` |
| setter 后旧值 | 当前 handler 中的 State 绑定不会因 setter 立即变化。 | setter 慢、更新失败或可以 `await` 到新 State。 | `react-snapshot`、`react-use-state` |
| 事件内 batching | React 等事件处理器代码执行完后处理其中的 State 更新并更新屏幕。 | handler 内每个 setter 都先更新一次 UI。 | `react-queue`、`react-use-state` |
| 有意事件边界 | React 不跨多个有意事件（如两次 click）统一 batching。 | 快速点击一定进入同一批。 | `react-queue` |
| React 18+ automatic batching | `createRoot` 下 Promise、timeout、原生事件等来源默认也会 batching。 | 可依赖任意 callback 的精确 render 次数或事件循环时序。 | `react-batching-18` |
| 直接值 | `setNumber(5)`在公开教学模型中是当前位置的“replace with 5”。 | 直接值会物理清空队列，或自动读取 pending State。 | `react-queue` |
| updater | updater 入队，在下一 render 处理时接收 pending State 并返回下一 State。 | updater 在 setter 调用行就拿到最终 State。 | `react-queue`、`react-use-state` |
| 队列顺序 | 前一 updater 的返回值成为后一 updater 的输入；混合项也按加入顺序处理。 | updater 总在直接值之后处理，或最后一个函数跳过前项。 | `react-queue` |
| updater 纯度 | updater 只能根据 pending State 计算并返回结果，不执行副作用。 | 可以在 updater 中请求 State、写存储、发请求或修改输入。 | `react-queue`、`react-use-state` |
| StrictMode | 开发期可额外调用组件函数和 updater，忽略一次 updater 结果以发现不纯逻辑。 | 事件 handler 自动双调用，或生产环境也固定双调用。 | `react-strict`、`react-use-state` |
| `flushSync` | 少数第三方集成可强制 callback 内更新同步提交到 DOM。 | 当前 handler 的 State 变量变新、浏览器已经 paint，或只冲刷 callback 内一项。 | `react-flush-sync` |

## 七、完整公开心智模型

### 7.1 先区分八个术语

| 术语 | 本目标中的含义 |
| --- | --- |
| Trigger | 请求 React 开始一次界面计算。 |
| Render | React 调用组件，处理所需更新并计算下一版 JSX。 |
| Snapshot | 某次 render 使用的 State、Props、局部变量、JSX 与 handler 的时间归属。 |
| Update request | setter 交给 React 的直接值或 updater。 |
| Batching | React 把安全范围内的多个更新一起处理，避免半成品 UI 和不必要的中间 render。 |
| Queue model | 对同一 State，按加入顺序应用 replace 项与 updater 项的公开教学模型。 |
| Commit | React 把必要变化应用到 DOM。 |
| Browser paint | 浏览器在 DOM 更新后绘制屏幕。 |

“render”还常被浏览器资料用于“渲染页面”。课程全文应写“React render”和“browser paint”，避免把
两个系统的术语混成一个动作。

### 7.2 初次显示

```text
root.render(<App />)
        |
        v
Trigger -> React render -> Commit necessary DOM -> Browser paint
```

这个流程只表达职责与概念顺序，不表达固定时长、线程、任务队列或帧数。

### 7.3 一次用户交互产生更新

```text
render R0 提供 State S0 + Props P0
        |
        v
创建 JSX 与 handler H0
        |
        v
用户触发 H0；H0 始终读取 S0 / P0
        |
        v
setter 提交直接值或 updater；React batching 请求
        |
        v
H0 代码结束后，React 在后续 render 中按顺序处理队列
        |
        v
得到 State S1，组件以 S1 和该次 Props 创建 render R1
        |
        v
Commit 必要 DOM 变化 -> Browser paint
```

这条链把旧两课的核心统一起来：快照解释“请求是怎样形成的”，队列解释“多个请求怎样得到下一
State”，render / commit / paint 解释“结果怎样变成屏幕上的下一版 UI”。

### 7.4 Snapshot 的四个关键限定

1. **State 属于 render：** setter 不会改写当前函数已经得到的 State 绑定。
2. **Props 属于 render：** 当前 handler 看到的是创建它时那次 render 的 Props，不是一个会被父组件
   原地回写的通道。
3. **Handler 属于 render：** 同步或延迟执行都继续使用创建该函数时闭包中的值。
4. **快照不是复制算法：** 它不意味着对象被深拷贝或冻结；Props / State 仍必须按不可变输入使用。

### 7.5 Render、commit 与 paint 的验证边界

- 组件函数中的日志只能证明相应 render 逻辑执行，不能证明 DOM 已 commit。
- DOM 文本变化能证明相应结果已提交，不能证明每个 setter 分别产生过一次 commit。
- 普通自动化浏览器断言最终 DOM 与交互结果即可，不用固定延时声称已经观察到某个独立 paint。
- `flushSync` 最多提供同步 DOM 提交边界，不会把旧 handler 的闭包变成“最新 State”，也不保证 paint。

## 八、队列求值模型

### 8.1 两类队列项

| setter 输入 | 公开教学模型 | 求值规则 |
| --- | --- | --- |
| 直接值 `setNumber(5)` | `replace with 5` | 忽略当前位置的 pending 值，结果替换为 `5`。 |
| updater `setNumber(n => n + 1)` | 纯 updater | 接收当前位置的 pending 值，返回值成为下一项输入。 |

这里不重新讲 `useState` 签名或类型。只要求学生能识别调用点传入的是已经算好的值，还是基于 pending
State 的纯函数。

### 8.2 三次直接值

假设当前 render 的 `number = 0`：

```tsx
setNumber(number + 1)
setNumber(number + 1)
setNumber(number + 1)
```

三个表达式先在同一 handler 快照中都算成 `1`：

| 顺序 | 队列项 | 输入 | 结果 |
| ---: | --- | --- | ---: |
| 1 | `replace with 1` | `0`（不使用） | `1` |
| 2 | `replace with 1` | `1`（不使用） | `1` |
| 3 | `replace with 1` | `1`（不使用） | `1` |

最终 State 是 `1`。根因不是“第三个 setter 偶然覆盖前两个”，而是三次请求都由同一快照形成相同的
replace 项，再按队列位置求值。

### 8.3 三个 updater

```tsx
setNumber((pending) => pending + 1)
setNumber((pending) => pending + 1)
setNumber((pending) => pending + 1)
```

| 顺序 | 队列项 | 接收的 `pending` | 返回值 |
| ---: | --- | ---: | ---: |
| 1 | `pending => pending + 1` | `0` | `1` |
| 2 | `pending => pending + 1` | `1` | `2` |
| 3 | `pending => pending + 1` | `2` | `3` |

最终 State 是 `3`。`pending` 是队列当前位置的值，不是旧 handler 中固定的 `number` 变量。

### 8.4 先替换，再更新

```tsx
setNumber(number + 5)
setNumber((pending) => pending + 1)
```

基准 State 为 `0`：

| 顺序 | 队列项 | 输入 | 结果 |
| ---: | --- | ---: | ---: |
| 1 | `replace with 5` | `0`（不使用） | `5` |
| 2 | `pending => pending + 1` | `5` | `6` |

最终 State 是 `6`。直接值没有删除后面的 updater。

### 8.5 最后再替换

```tsx
setNumber(number + 5)
setNumber((pending) => pending + 1)
setNumber(42)
```

| 顺序 | 队列项 | 输入 | 结果 |
| ---: | --- | ---: | ---: |
| 1 | `replace with 5` | `0`（不使用） | `5` |
| 2 | `pending => pending + 1` | `5` | `6` |
| 3 | `replace with 42` | `6`（不使用） | `42` |

最终 State 是 `42`。直接值在自己的位置完整替换当前结果；把它移动到队列前面会得到不同结果。

### 8.6 通用手算规则

1. 从该 State 的基准值开始。
2. 遇到直接值，把当前结果替换成该值。
3. 遇到 updater，把当前结果作为参数，使用返回值继续。
4. 到达队列末尾，得到后续 render 使用的 State。

课程可以让学生手算，但不能把该规则实现成“React 内部队列模拟器”并宣称它就是 React 源码或公共 API。

### 8.7 选择直接值还是 updater

- 下一值已经确定且不依赖同一 State 的 pending 结果时，直接值最清楚，例如归零。
- 同一批内需要根据前一个待处理结果连续计算时，使用 updater。
- 不应把 updater 当成统一风格；也不应让一个 State 的 updater 假装能自动读取另一个 State 的 pending
  值。

## 九、Batching、纯度与逃生舱边界

### 9.1 Batching 的公共合同

React 官方入门页说明，React 等事件处理器中的代码执行完成后再处理其中的 State 更新。这样可以减少
不必要的中间 render，并避免只更新部分 State 的半成品 UI。不同的有意事件分别处理；两次 click 不会
因为发生得快就被永久合成一批（来源：`react-queue`）。

当前客户端课程使用 React `19.2.8` 与 `createRoot`。React 18 官方升级指南进一步说明，Promise、
`setTimeout`、原生事件 handler 等来源也默认 automatic batching（来源：`react-batching-18`）。正文
只需说明这个当前行为，不比较旧 Root API，也不推导微任务、宏任务、优先级或精确 render 次数。

### 9.2 Updater 必须纯净

updater 会在 React 处理更新的 render 期间运行，因此只做两件事：接收 pending State，返回下一 State。
不能在 updater 中：

- 写 `localStorage`、发送请求、记录必须只发生一次的日志；
- 调用另一个 setter 或修改外部变量；
- 修改接收到的对象或数组；
- 依赖随机数、时间或调用次数得到业务结果。

对象与数组的正确不可变写法不在本目标展开，但“不修改输入”仍是 updater 纯度的必要边界。

### 9.3 StrictMode 只保留准确限定

- 在开发环境中，StrictMode 会额外调用组件函数和传给 setter 的 updater，以发现不纯逻辑。
- React 忽略一次 updater 结果；纯 updater 不会因此让最终 State 多更新一次。
- 事件 handler 内部代码不属于这项组件函数双调用，因此不能把两次 updater 调用解释为用户点击两次。
- 生产构建没有这项额外检查；不能为了隐藏重复日志而关闭 StrictMode。

### 9.4 `flushSync` 只保留准确限定

`flushSync` 可以在少数第三方浏览器 API 或 UI 库集成中，强制 callback 内的更新同步提交到 DOM。它
不适合普通计数或为了“让 setter 下一行读到新 State”而使用，因为旧 handler 的绑定不会改变。

官方还明确警告：它可能显著影响性能，可能冲刷 callback 外的 pending updates 或 Effects，并可能让
pending Suspense fallback 再次显示。因此未来正文只给出“不常用、第三方同步集成、last resort”三项
边界，不提供导入与调用示例，完整教学交给独立高级目标。

## 十、现有两课正文的逐项处置

### 10.1 现有《Render、Commit 与 State 快照》正文

| 现有资产 | 处置 | 具体要求 |
| --- | --- | --- |
| frontmatter ID | **保留** | 继续使用 `react.core.learn.basics.render-commit-and-state-snapshot`。 |
| 标题、summary、objectives、recap、tags | **重写** | 标题统一为“React 更新模型”，目标和小结必须包含 batching 与队列。 |
| sources | **合并** | 保留阶段 / 快照来源，加入 queue、React 18 batching；`flushSync` 只作边界来源。 |
| “为什么需要区分阶段” | **保留并改写开场** | 从“setter、render、DOM、paint 不等价”自然引出批处理和队列。 |
| “一次更新的最小模型” | **保留并扩展** | 在 trigger 与下一 render 之间加入 handler snapshot、update requests、batching 和 queue。 |
| “Render 必须纯净” | **大幅删除** | 删除 Price、CourseList、Profile 等重复示例；只留一句组件和 updater 必须可安全重复。 |
| “每次 Render 的 State 快照” | **保留主线** | 保留 Props + State + handler、setter 前后旧值和延迟回调；与三次直接值推理连接。 |
| `await setCount` 示例 | **可保留为易错项** | 只说明 setter 无完成 Promise，不能等待新 State / commit，不展开异步模式。 |
| StrictMode 独立长节 | **压缩并移动** | 与 updater 纯度合并，不重讲组件纯度课程。 |
| 现有 Demo 段 | **改为合并 Demo** | 保留 snapshot 行为，并加入四种队列结果；不再声称每次点击只有一个请求。 |
| pitfalls | **去重合并** | 阶段、快照、队列、StrictMode 和 `flushSync` 只各保留最高价值错误。 |
| 练习与小结 | **补充 / 重写** | 练习至少手算一组混合队列；小结走完整更新链。 |
| 参考资料 | **合并** | 只列实际支撑正文 claim 的官方来源。 |

### 10.2 现有《State 更新队列》正文

| 现有资产 | 处置 | 具体要求 |
| --- | --- | --- |
| 旧 frontmatter ID 与独立路由 | **退出** | 教学内容迁入保留目标，不继续保留独立课程身份。 |
| 学习目标 / 开场 | **合并** | 删除“前一课”叙事，接到同一篇正文的 snapshot 小节之后。 |
| 三个时间点与 batching | **保留** | 改写成完整 Trigger -> snapshot handler -> queue -> render -> commit -> paint 链。 |
| `SetStateAction<S>` 类型段 | **删除** | 属于 `useState` 基础签名与类型教学。 |
| 三次直接值 | **完整保留** | 必须展示快照替换和结果 `1`。 |
| 三个 updater | **完整保留** | 必须展示 pending 值 `0 -> 1 -> 2` 和结果 `3`。 |
| 两组混合队列 | **完整保留** | 必须展示结果 `6` 与 `42`，并明确 replace 不清空队列。 |
| Updater 选择规则 | **保留并压缩** | 只保留“确定下一值”与“依赖同一 State pending 值”两问。 |
| “不要用一个 updater 读取另一个 State” | **保留一句边界** | 不延伸到 State 结构、Reducer 或 Context。 |
| updater 纯度 | **保留** | 删除 Effect 教学，只说副作用不属于 updater。 |
| automatic batching | **保留边界** | 说明当前 `createRoot` 行为，不比较旧 React 的课程用法。 |
| `flushSync` 示例 | **删除实现，保留警告** | 不导入、不运行，只说明第三方同步集成的 last resort。 |
| queue Demo 段 | **合并** | 四种动作迁入目标 Demo，旧 Demo ID 退出。 |
| pitfalls / 原理 / 练习 / 小结 | **去重后保留** | 不出现后续课程、计划、测试或批次叙事。 |

## 十一、现有两个 Demo 的逐项处置

### 11.1 `render-commit-and-state-snapshot-demo.tsx`

| 现有部分 | 处置 | 具体要求 |
| --- | --- | --- |
| 目标 Demo 身份 | **作为合并目的地保留** | 优先保留稳定 ID `react.core.learn.basics.render-commit-and-state-snapshot.snapshot-demo`。 |
| `label` / `step` Props | **保留** | 用于证明 Props、State 与 handler 属于同一 render；不扩展 Props 教学。 |
| `count` / `nextCount` 展示 | **保留** | 继续显示当前 render 值与本次可计算的下一值。 |
| setter 前后 `console.info` | **保留或改成可断言记录** | 必须能证明同一 handler 两次日志读取同一快照；不要依赖 render 次数。 |
| 单次递增 | **保留** | 作为 snapshot 最小入口。 |
| reset | **保留** | 提供统一的 `0` 基准。 |
| Trigger / Render / Commit 静态说明 | **补充** | 加入 browser paint，并明确静态说明不是运行时计时器。 |
| 现有样式 | **按需保留** | 合并后仍使用 Flex、margin 与 normal flow；不得加入 `grid` 或 `gap`。 |

### 11.2 `state-update-queue-demo.tsx`

| 现有部分 | 处置 | 具体要求 |
| --- | --- | --- |
| 旧 Demo ID / 独立目录 | **合并后退出** | 行为迁入目标 Demo；旧课程身份和孤立资产不继续保留。 |
| 三次直接值 handler | **完整迁入** | 从 `0` 得到 `1`。 |
| 三个 updater handler | **完整迁入** | 从 `0` 得到 `3`。 |
| replace 后 updater | **完整迁入** | 从 `0` 得到 `6`。 |
| 最后 replace `42` | **完整迁入** | 从 `0` 得到 `42`。 |
| reset | **与目标 Demo 合并** | 只保留一个统一 reset。 |
| 四张规则说明 | **保留信息，压缩呈现** | 结果和求值序列应可读；不实现可编辑内部队列。 |
| 现有样式 | **不要求原样保留** | 只吸收必要布局，避免把两个视觉容器机械嵌套。 |

### 11.3 合并后 Demo 的最小行为合同

合并后只登记目标课程的一个同源 Demo，使用单个数字 State 和一个目标组件。至少提供：

1. 单次直接值请求：观察 setter 前后 handler 快照相同，页面随后显示下一 State。
2. 三次直接值：从 `0` 得到 `1`。
3. 三个 updater：从 `0` 得到 `3`。
4. `replace 5 -> updater +1`：从 `0` 得到 `6`。
5. `replace 5 -> updater +1 -> replace 42`：从 `0` 得到 `42`。
6. reset：恢复统一基准 `0`。

Demo 不得：

- 使用对象 / 数组 State、Reducer、Context、Effect、Ref、Transition 或 `flushSync`；
- 用第二份业务 State、模块变量或 DOM 查询统计 render / commit / updater 调用次数；
- 用 timeout、Promise 或原生事件制作 automatic batching 探针；
- 声称静态阶段列表观察到了实际 browser paint；
- 暴露可编辑“React queue”数组或把教学求值器包装成内部实现；
- 依赖 StrictMode 下 updater 的调用次数；浏览器只验证最终 State 与 handler 快照。

## 十二、高风险易错点

| 错误说法或做法 | 风险 | 准确处理 | 来源 |
| --- | --- | --- | --- |
| render 就是 DOM 更新 | 把计算期与宿主变更混淆 | React render 计算 UI，commit 才改必要 DOM。 | `react-render` |
| commit 就是 paint | 把 React 与浏览器阶段混淆 | 浏览器在 DOM 更新后 paint，不承诺独立帧。 | `react-render` |
| 一个 setter 等于一次 render / commit / paint | 误判 batching 与 StrictMode 结果 | 只说 setter 请求后续 render。 | `react-render`、`react-queue` |
| 快照是深拷贝或冻结 | 错误推导对象语义 | 快照描述 render 归属；不可变更新另行教学。 | `react-snapshot`、`react-purity` |
| setter 后旧值说明更新失败 | 用速度解释语义 | 当前 handler 继续读取所属 render 的值。 | `react-snapshot` |
| `await setter` 等待 DOM | setter 没有完成 Promise | 不用 `await` 推导 render、commit 或 paint。 | `react-use-state` |
| 延迟 handler 自动读取最新值 | 忽略闭包所属 render | 延迟逻辑仍读取创建它的快照。 | `react-snapshot` |
| 三次直接值等于加三 | 忽略相同快照和 replace 项 | 三次都形成相同 replace，结果为 `1`。 | `react-queue` |
| 直接值清空整个队列 | 无法解释后续 updater | replace 只在当前位置替换，后续项继续。 | `react-queue` |
| updater 在调用点立即求值 | 混淆 handler 与下一 render | updater 入队，并在后续 render 处理时接收 pending State。 | `react-queue` |
| updater 总优于直接值 | 制造无意义函数包装 | 下一值确定时直接值完全准确。 | `react-queue`、`react-use-state` |
| updater 执行副作用 | StrictMode 或重算时重复外部动作 | updater 只计算并返回下一 State。 | `react-use-state`、`react-strict` |
| batching 跨多个 click | 破坏有意事件边界 | 多个有意事件分别处理。 | `react-queue` |
| batching 保证任何 callback 只 render 一次 | 把性能模型写成次数合同 | 只陈述官方默认合并来源，不断言精确次数。 | `react-batching-18` |
| StrictMode 会双击事件 handler | 错判用户动作 | 双调用针对应纯函数，不包括 handler 内部代码。 | `react-strict` |
| `flushSync` 让局部 State 变新 | 混淆 DOM 提交与闭包 | 它最多同步提交 DOM，旧 handler 值不变。 | `react-flush-sync` |
| `flushSync` 保证 paint | 超出官方合同 | 官方只保证 DOM 更新，不保证独立浏览器绘制。 | `react-flush-sync`、`react-render` |

## 十三、未来课程正文合同

### 13.1 建议教学顺序

1. 用 setter、render、DOM 和屏幕不是同一件事建立问题。
2. 给出 Trigger -> React render -> Commit -> Browser paint 的最小骨架。
3. 说明 State / Props / handler 属于某次 render 的快照。
4. 用 setter 前后旧值和延迟 handler 验证快照，不讲 Ref 解决方案。
5. 把同一 handler 的多个请求接入 batching。
6. 用三次直接值说明 snapshot 先形成三个相同 replace 项。
7. 用三个 updater 表格说明 pending State 的顺序传递。
8. 用两组混合队列表格建立通用手算规则。
9. 说明 updater 纯度与 StrictMode 开发期边界。
10. 用一句 automatic batching 和一句 `flushSync` last resort 收束边界。
11. 运行合并 Demo，完成一组混合队列练习并总结完整更新链。

### 13.2 正文内容要求

- frontmatter、页面 H1、导航标题统一为“React 更新模型”。
- 原目标 ID 保持不变，旧队列课程 ID 不作为新正文身份继续出现。
- 至少包含 trigger、React render、commit、browser paint、snapshot、batching、replace、updater、pending
  State、mixed queue 和 updater purity。
- 所有代码块使用 `tsx` / `ts`，只使用原始数字 State；不要重新教学 `useState` 初始化和类型推断。
- 每个阶段只陈述可观察公开合同，不使用 Fiber、lane、scheduler、并发或事件循环解释。
- Sources 中的每条 claim 必须能回到本记录的一手来源。
- 正文不以“下一课/前一课”分配内容，使用主题本身的准确边界说明排除项。

### 13.3 正文生产叙事禁区

未来课程正文、frontmatter、Demo 可见文案和源码注释不得出现：

- `B16` 或其他路线编号；
- 计划、批次、任务、完成度、Gate；
- 测试、构建、复审、signoff；
- “后续课程”“下一课”“前一课”等课程生产顺序叙事；
- 本轮调研、合并、迁移、删除旧资产等实施过程。

这些词可以出现在本研究的处置合同中，但不能泄漏到学习者内容。

## 十四、临时验证合同

未来实现完成后采用最小临时资产验证，不在仓库保留测试文件或 fixture：

1. 在 `/tmp` 的 `mktemp` 目录生成一次性校验脚本，调用生产 Markdown 解析 / 校验入口读取目标正文。
2. 断言 ID、标题、objectives、recap、sources、Demo directive 与最终 manifest 登记一致。
3. 断言旧课程 ID、旧课程正文和旧 Demo ID 已按合并合同退出，不留下可访问孤立入口。
4. 用聚焦文本扫描确认正文没有生产叙事禁词，也没有 `useEffect`、`useRef`、`useReducer`、
   `useContext`、`startTransition`、`flushSync(` 或对象 / 数组 State 教学片段。
5. 用当前 TypeScript 配置验证目标 Demo TSX；不新建持久类型测试。
6. 用一次性纯函数或浏览器操作从 `0` 核对四组结果：`1`、`3`、`6`、`42`。
7. 比较 Demo 展示源码与实际运行 TSX 的规范化内容，证明两者同源。
8. 运行聚焦格式、type-check、lint、build 和限定 diff check；全仓阻塞与本目标结果分开记录。
9. 验证完成后删除 `/tmp` 临时目录，不改动 `tests/unit/`、`tests/e2e/` 或仓库 fixture。

## 十五、浏览器验收合同

使用可复跑的 Playwright 流程验证正式深链，不用固定等待时间推测 paint：

1. 正式 URL 能直接打开，页面标题与导航均为“React 更新模型”，无旧队列独立入口残留。
2. 页面初始 `count` 为 `0`；单次请求后 DOM 显示 `1`，setter 前后日志中的 snapshot 值相同。
3. 每组队列操作前 reset 到 `0`，分别断言三次直接值为 `1`、三个 updater 为 `3`、替换后更新为
   `6`、最后替换为 `42`。
4. 不断言 render、commit、paint 或 updater 的精确调用次数；StrictMode 开发日志不能作为业务结果。
5. Demo 展开源码与运行源码同源，且不包含排除 API 或内部队列模拟器。
6. 前后导航与课程目录只保留合并目标，旧 ID 不再可访问或被 related / prerequisite 引用。
7. `1440x900` 与 `390x844` 都无横向溢出、文本裁切、按钮标签越界或内容重叠。
8. 浏览器 console 为 `0 error / 0 warning`；有意的 snapshot `console.info` 单独捕获并核对值。
9. 关键文档、Demo 源码和运行请求返回成功；不把 HMR 噪声或无关并行改动混入本目标结论。

## 十六、研究结论

React `19.2.8` 的基础更新行为可以用一条稳定的公开模型完整解释：一次 render 创建 State、Props、
局部变量、JSX 与 handler 的时间快照；handler 调用 setter 时提交直接值或 updater，React 在安全边界
内 batching 请求，并在后续 render 中按顺序处理同一 State 的队列。直接值是当前位置的 replace，
updater 接收当前 pending State 并返回下一值，混合队列仍严格按加入顺序求值。React 得到下一版 UI 后
只把必要变化 commit 到 DOM，浏览器随后 paint。

旧《Render、Commit 与 State 快照》提供阶段和快照骨架，旧《State 更新队列》提供 batching 与队列
求值；两者应合并，而不是继续以“前置课 + 后续课”重复讲 setter 和快照。实现时保留原目标 ID 和目标
Demo 身份，把旧队列正文与四种 Demo 行为吸收进来，删除重复的组件纯度、`useState` 签名 / 类型、
Effect / Ref、对象 / 数组更新及内部调度叙事。StrictMode 与 `flushSync` 只保留上述准确边界。
