# Reducer 纯度研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.intermediate.reducer-purity`
- 标题：Reducer 纯度
- 教学层级：零基础到进阶
- 核验日期：`2026-08-10`
- 研究状态：已完成，正文、同源 Demo 与浏览器验收已闭环
- 官方文档基线：React `19.2`
- 仓库实现基线：React / React DOM `19.2.8`

本课只回答一条主线：reducer 在接收当前 State 和 Action 时，怎样始终返回可预测的下一份 State，
不修改旧对象、不执行请求或其他外部副作用，并能在 Strict Mode 的开发检查和独立测试中暴露错误。

明确排除：Action 命名与载荷设计、Context、Provider、Reducer 与 Context 组合、Effect 生命周期、
异步提交、Immer、Redux、Zustand、服务端数据和生产日志系统。Action 的事件语义属于上一课，
Context 从下一课开始。

## 调研问题

1. React 所说的 reducer 纯度具体约束哪些输入、输出和可观察行为？
2. 为什么相同 State 和 Action 必须得到相同结果，而不能读取时间、随机数或外部可变变量？
3. reducer 为什么不能修改旧 State，数组和对象应怎样返回新的引用？
4. 请求、日志、计时器和 DOM 操作为什么不能放进 reducer？
5. Strict Mode 会怎样调用 reducer，为什么双调用可以暴露不纯实现？
6. 哪些局部构造属于安全的本地变更，哪些变更已经影响了旧 State 或外部系统？
7. 怎样把 reducer 当作独立函数验证，并保持测试关注输入到输出的合同？
8. `useReducer` 的纯度要求与 `useActionState` 允许副作用的边界有什么区别？

## 官方来源与版本

| 来源 | URL | 采用结论 |
| --- | --- | --- |
| React Versions | https://react.dev/versions | 当前官方文档稳定基线为 React 19.2。 |
| Extracting State Logic into a Reducer | https://react.dev/learn/extracting-state-logic-into-a-reducer | reducer 接收 State 和 Action、返回下一份 State；必须纯净，不能请求、定时或执行副作用；对象和数组不能原地修改。 |
| useReducer Reference | https://react.dev/reference/react/useReducer | React 会把当前 State 和 Action 交给 reducer；Strict Mode 开发环境会额外调用 reducer 和 initializer，纯函数不受影响。 |
| StrictMode Reference | https://react.dev/reference/react/StrictMode | Strict Mode 会在开发环境重复调用应当纯净的函数，包括传给 `useReducer` 的 reducer，以发现不纯逻辑。 |
| Components and Hooks must be pure | https://react.dev/reference/rules/components-and-hooks-must-be-pure | 渲染阶段应保持幂等，副作用放在事件处理器或 Effect；State 和 Props 是不可变快照。 |
| Using TypeScript | https://react.dev/learn/typescript | 可为 State、Action 和 reducer 的参数及返回值建立明确的 TypeScript 类型。 |

搜索只用于发现官方页面；以下事实均回到上述 React 官方原文核验。没有使用社区文章或第三方状态库
约定来定义 React reducer 的语义。

## 官方事实

### 1. reducer 的输入和输出

React 将当前 State 和 Action 传给 reducer，reducer 返回下一份 State，React 再保存该结果并重新渲染。
纯度合同可以写成：相同的 State 和相同的 Action，每次都应产生等价的结果。Action 只是输入值，
不能把更新 React State、发送请求或改变 DOM 当作 reducer 的隐含职责。

### 2. 不可变更新

State 和 Props 是渲染使用的不可变快照。对象字段更新应复制外层对象，数组更新应使用返回新数组的
方法或展开语法；不能对 `state.todos` 调用 `push` 后再返回原数组，也不能直接给 `state.title`
赋值。新的引用让 React 和开发者都能观察到状态确实产生了下一份值。

### 3. 副作用属于其他阶段

请求、定时器、随机数、时间读取、日志写入和 DOM 操作都会把外部变化引入函数结果或执行过程。React
可以在渲染期间暂停、重试或丢弃计算，因此这些操作不能放在 reducer 中。用户事件应由事件处理器
触发；与外部系统同步且无法放在事件处理器的逻辑才考虑 Effect。

### 4. Strict Mode 的双调用

在开发环境的 Strict Mode 中，React 会额外调用 reducer 和 initializer，并忽略其中一次结果。纯 reducer
两次调用仍得到相同结果；不纯 reducer 会出现重复插入、递增两次、重复日志或其他可观察差异。
这是开发期诊断，不改变生产环境的调用次数，也不是业务逻辑可以依赖的执行顺序。

### 5. 本地临时构造的边界

在 reducer 内基于输入创建临时数组、对象或局部变量，只要它们没有引用并修改旧 State，就属于计算下一份
结果的一部分。安全的是“复制后修改新值”；危险的是“修改 State 里已有的对象、修改模块级可变变量，
或在计算过程中触碰外部系统”。

### 6. 可独立测试

reducer 不依赖组件实例或 DOM，可以用给定的初始 State 和 Action 直接断言返回值。独立测试适合验证
状态转换分支和引用替换；它不能替代组件交互测试，也不应要求请求、时间或随机值的全局 mock 才能通过。

### 7. 与 `useActionState` 的边界

React 官方将 `useReducer` 的 UI State reducer 定义为纯函数，而 `useActionState` 的 Action 函数可以
异步并执行副作用。两者名字相似但合同不同；本课不把 `useActionState` 的服务端或异步提交能力混入
Reducer 纯度。

## 课程推导

- “同输入同输出”是诊断规则：先把 reducer 当成 `State × Action -> NextState` 的计算，再检查是否读取了
  隐藏输入或改变了隐藏输出。
- “返回新引用”不是为了形式上的不可变，而是为了让旧快照保持可回溯，并让引用比较能够识别真实更新。
- Strict Mode 双调用不是业务契约；它是一台开发期探针，专门放大写入外部变量和原地修改 State 的错误。
- 日志如果只用于观察，应放在事件处理器或调试边界，不要把 `console.log` 作为 reducer 结果的一部分。
- 纯度只约束 reducer 的计算；事件处理器可以响应用户动作，Effect 可以同步外部系统，三者职责不能互换。

## 基础用法

```tsx
type Task = { id: number; title: string; done: boolean }

type TaskAction =
  | { type: 'task_added'; task: Task }
  | { type: 'task_toggled'; id: number }

type TaskState = { tasks: Task[] }

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'task_added':
      return { ...state, tasks: [...state.tasks, action.task] }
    case 'task_toggled':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id ? { ...task, done: !task.done } : task,
        ),
      }
  }
}
```

每个分支都返回新的 State；没有分支会给旧数组 `push`，也没有分支读取当前时间或调用外部 API。实际
项目应为未知 Action 保留显式失败分支，避免协议错误被静默吞掉。

## 不可变更新规则

| 目标 | 错误方向 | 纯净方向 |
| --- | --- | --- |
| 更新对象字段 | `state.form.title = action.title` | `{ ...state, form: { ...state.form, title: action.title } }` |
| 添加数组项 | `state.tasks.push(action.task); return state` | `{ ...state, tasks: [...state.tasks, action.task] }` |
| 删除数组项 | `state.tasks.splice(index, 1); return state` | `{ ...state, tasks: state.tasks.filter(...) }` |
| 更新数组项 | `state.tasks[index].done = true` | `map` 返回目标项的新对象 |
| 生成标识 | 在 reducer 内依赖递增模块变量 | 在事件边界生成并放入 Action |

复制只需要覆盖从根 State 到被修改字段的路径；不需要无关地深拷贝整个 State。未改变的分支可以继续
复用旧引用，但不能让新 State 里的可变路径指回已经被修改的旧对象。

## 易错点合同

### 1. 错误：在 reducer 中原地修改数组

- **触发条件：** 调用 `push`、`splice` 或排序方法后返回原数组或原 State。
- **原因：** 把 State 快照当成了可直接编辑的临时容器。
- **实际后果：** 旧 State 被污染，引用没有变化，Strict Mode 可能让一项插入两次。
- **错误示范：** `state.tasks.push(action.task); return state`
- **正确示范：** `return { ...state, tasks: [...state.tasks, action.task] }`
- **验证方式：** 记录旧 State 的数组和长度，调用 reducer 后旧数组保持不变且新数组引用不同。

### 2. 错误：只复制顶层对象

- **触发条件：** 返回 `{ ...state }`，随后继续修改 `next.form.title` 或 `next.tasks[index]`。
- **原因：** 忽略了嵌套对象仍与旧 State 共享引用。
- **实际后果：** 新旧 State 同时被修改，回溯和比较失去意义。
- **错误示范：** `const next = { ...state }; next.form.title = action.title`
- **正确示范：** `return { ...state, form: { ...state.form, title: action.title } }`
- **验证方式：** 断言旧嵌套对象引用和值均不变，只有目标路径获得新引用。

### 3. 错误：在 reducer 中读取当前时间

- **触发条件：** 用 `Date.now()` 或 `new Date()` 生成状态字段。
- **原因：** 把时间当作了没有进入 Action 的隐藏输入。
- **实际后果：** 相同 State 和 Action 在不同调用中返回不同结果，重试和 Strict Mode 产生差异。
- **错误示范：** `return { ...state, updatedAt: Date.now() }`
- **正确示范：** 在事件边界生成时间并传入 Action，或把同步外部时间的职责放到 Effect。
- **验证方式：** 用同一输入连续调用两次并比较结果；纯 reducer 不应因时钟变化而不同。

### 4. 错误：在 reducer 中使用随机数或递增模块变量

- **触发条件：** 用 `Math.random()`、`nextId++` 或其他模块级可变值创建新数据。
- **原因：** 把外部可变状态偷偷加入 reducer 输入。
- **实际后果：** Strict Mode 双调用可能生成两个 ID，重放同一 Action 不能得到同一结果。
- **错误示范：** `return { ...state, id: nextId++ }`
- **正确示范：** 在事件处理器生成 ID 并作为 Action 字段传入。
- **验证方式：** 连续重放同一 State/Action，结果值和引用结构应符合纯函数合同。

### 5. 错误：在 reducer 中发送请求、写日志或操作 DOM

- **触发条件：** 在 `switch` 分支调用 `fetch`、`console.log`、`setTimeout` 或 `document.querySelector`。
- **原因：** 把状态计算和外部系统同步混成一个阶段。
- **实际后果：** 重试渲染会重复执行外部动作，测试还必须依赖网络或全局环境。
- **错误示范：** `fetch('/api/tasks'); return nextState`
- **正确示范：** reducer 只返回 State；事件处理器或 Effect 根据明确生命周期处理外部动作。
- **验证方式：** 单独调用 reducer 时不需要 DOM、网络或计时器环境。

### 6. 错误：把 reducer 的双调用当作业务流程

- **触发条件：** 依赖 reducer 被调用一次，或用调用次数推进业务计数。
- **原因：** 把 Strict Mode 的开发诊断误认为 React 的业务 API。
- **实际后果：** 开发和生产行为不一致，关闭 Strict Mode 后出现不同结果。
- **错误示范：** `if (calls++ === 1) return ...`
- **正确示范：** 让每次调用仅由输入决定，业务次数显式放在 State 或 Action 中。
- **验证方式：** 在 Strict Mode 和非 Strict Mode 下，给定同一输入得到同一 State。

### 7. 错误：用深拷贝掩盖错误的所有权

- **触发条件：** 每个分支都对整个 State 做 JSON 序列化或无条件深拷贝。
- **原因：** 没有识别真正修改的路径，试图用复制规模替代不可变建模。
- **实际后果：** 丢失非 JSON 值、浪费计算，且不能修复副作用或错误的嵌套引用。
- **错误示范：** `const next = structuredClone(state); ...`
- **正确示范：** 只复制从根到目标字段的路径，并保留未改变分支引用。
- **验证方式：** 断言无关分支引用保持稳定，目标分支引用改变。

### 8. 错误：把未知 Action 静默当成成功

- **触发条件：** `default` 直接 `return state`。
- **原因：** 把协议拼写错误和合法的无操作混为一谈。
- **实际后果：** UI 没有反应，调用方无法发现 Action 类型遗漏或拼写错误。
- **错误示范：** `default: return state`
- **正确示范：** `default: throw new Error('Unknown action: ' + action.type)`
- **验证方式：** 临时越过 TypeScript 类型边界传入未知 Action，应获得明确错误。

### 易错点适用版本与来源

| 错误名称 | 适用版本 | 来源 |
| --- | --- | --- |
| 在 reducer 中原地修改数组 | React 19.2 | Extracting State Logic into a Reducer、useReducer |
| 只复制顶层对象 | React 19.2 | Updating Objects in State |
| 在 reducer 中读取当前时间 | React 19.2 | Components and Hooks must be pure |
| 在 reducer 中使用随机数或递增模块变量 | React 19.2 | Components and Hooks must be pure、useReducer |
| 在 reducer 中发送请求、写日志或操作 DOM | React 19.2 | Components and Hooks must be pure、useReducer |
| 把 reducer 的双调用当作业务流程 | React 19.2 | useReducer |
| 用深拷贝掩盖错误的所有权 | React 19.2 | Updating Objects in State |
| 把未知 Action 静默当成成功 | React 19.2 | Extracting State Logic into a Reducer |

## 高级用法与适用边界

- 用判别联合定义 Action、State 和 reducer 返回值，让错误字段在编译期暴露；这只是类型约束，不能替代
  运行时对外部不可信输入的校验。
- 可以把 reducer 导出为独立函数，使用表格化输入/输出用例检查新增、切换、删除和未知 Action；测试不应
  依赖组件 DOM 才能证明转换逻辑。
- 若 State 很大，只复制实际修改路径；若更新逻辑仍然简单，继续使用 `useState`，不要为了纯度课程引入
  reducer 或深层抽象。
- Immer 可以提供 draft 语法，但它改变的是实现工具，不改变“对外返回下一份 State、不得把副作用放进
  reducer”的教学合同，本课不展开其 API。
- 需要网络、时间、随机性或 DOM 时，先确定这是用户事件还是外部同步；把事实作为 Action 传入，或将同步
  生命周期交给 Effect，而不是在 reducer 内隐式读取。

## Demo 设计

Demo 使用一个小型任务板，展示四个纯转换分支：新增任务、切换完成状态、删除任务和清空任务。界面提供
当前 State、最后一次 Action 与 reducer 结果的可观察面板，并提供“重放相同 Action”按钮，以证明相同输入
得到相同输出。Demo 不执行真实请求、计时器或 DOM 副作用；正文和独立验证合同分别说明原地修改、未知
Action 等错误边界。展示源码和运行源码都来自同一个 `reducer-purity-demo.tsx` 文件。

正常状态显示任务列表和计数；空状态显示“暂无任务”；边界状态覆盖重复切换、删除最后一项和未知 Action
的显式错误提示。Demo 不使用随机数据、网络请求、CSS Grid 或 `gap`。

## 验证合同

1. 静态检查：类型检查、Lint、Prettier、构建、单元与 E2E 命令，以及目标文件的 `git diff --check`。
2. 纯函数检查：相同 State/Action 连续调用两次，结果结构一致；旧 State、旧数组和未修改分支保持不变。
3. Strict Mode 检查：开发环境双调用不会重复任务、计数或错误日志；未知 Action 得到明确错误。
4. 同源检查：展示源码去除末尾空白后与运行 TSX 的字符数、UTF-8 字节数和 SHA-256 一致。
5. 浏览器检查：桌面、390px、390px + 200% 根字号，无横向溢出和控件裁切，核心交互正常，console 为
   `0 error / 0 warning`。
6. 临时测试和截图均放在 `/tmp`，验证结束后删除，不在仓库保留测试文件或浏览器产物。

## 实施与验收证据

- 正文：`src/categories/frontend/react/core/learn/reducer-purity.md`
- 同源 Demo：`src/categories/frontend/react/core/demos/reducer-purity/reducer-purity-demo.tsx`
- 浏览器路由：`/frontend/react/core/learn/reducer-purity`
- 核心交互：已验证新增、完成、删除、清空、清空后的空状态，以及重放最后 Action；重放结果显示相同输入得到相同结果，旧任务数组保持不变。
- 视口：`1440px`、`390px`、`390px + 200%` 根字号；三者 `scrollWidth === clientWidth`，Demo 内输入框和按钮均未越出视口。
- Console：`0 error / 0 warning`（仅保留 React DevTools 信息提示）。
- 同源检查（去除末尾空白）：`4655` 字符、`5117` UTF-8 字节，SHA-256 `3e3e60dfc86329f471a2b9984d4d534fd0eaf914c9f1ae884bb9cfe267a0167a`。
- 状态登记：第 9-12 课已登记为 `available`；第 13-29 课保持 `planned`，下一课为“Reducer 与 Context 组合”。

## 拆课判断

Reducer 纯度、不可变更新、Strict Mode 诊断和独立测试都服务同一个“输入决定下一份 State、无隐藏副作用”
心智模型，属于同一课的教学深度而非并列 API。Action 命名与载荷已经在第 8 课完成；Context、Provider
和 Reducer 组合各自拥有独立的读取或作用域心智模型，继续保持为第 10-13 课，不在本课展开。

## 课程正文顺序

1. 学习目标与为什么需要纯 reducer。
2. `State × Action -> NextState` 心智模型和最小 TSX 示例。
3. 对象/数组不可变更新，以及纯函数与副作用的边界。
4. Strict Mode 双调用与独立测试的诊断价值。
5. 八个结构化易错点。
6. 高级边界、练习、小结和官方来源。
