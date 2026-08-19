# useReducer 与 Action 调研记录

## 一、范围与冻结合同

- 目标课程 ID：`react.core.learn.intermediate.use-reducer`
- 稳定 slug：`use-reducer`
- 最终短标题：`useReducer 与 Action`
- 路线位置：中级 I04，前置为已完成的“实战：多步骤编辑器”
- 核验日期：`2026-08-16`
- 公共文档基线：React 官方文档 `19.2`
- 固定实现基线：`facebook/react` tag `v19.2.8`
- TypeScript 核验基线：官方 Narrowing Handbook；仓库编译器为 `6.0.3`
- 合并来源：`react.core.learn.intermediate.action-design`、
  `react.core.learn.intermediate.reducer-purity`

本课只建立一条完整主线：组件把关联的 State 更新集中到纯 reducer，事件处理器用 Action 描述意图并
调用 `dispatch`，React 在后续 render 中提供 reducer 返回的下一份 State。范围限定为：

1. `useReducer(reducer, initialArg, init?)` 的签名和三个参数。
2. 当前 State、Action、reducer、`dispatch` 的职责。
3. `initialArg` 与 `init(initialArg)` 的初始化差异。
4. 用 TypeScript 判别联合绑定 `type` 和分支专属字段。
5. reducer 的纯函数合同和对象、数组的不可变返回。
6. 事件处理器只提取交互产生的新事实并 dispatch 意图。
7. `dispatch` 的稳定身份、下一次 render 更新时机和当前快照。
8. StrictMode 开发期双调用提示、常见错误和 `useState` / `useReducer` 选择边界。

不在本调研中展开下一课，也不研究 Context、Provider、Effect、Ref、外部 Store、异步副作用、
middleware、Redux、Immer、服务器、网络、持久化或性能优化。

## 二、一手来源与证据等级

| 编号 | 一手来源 | 适用版本 | 证据等级 | 本课采用的事实 |
| --- | --- | --- | --- | --- |
| R1 | [React Versions](https://react.dev/versions) | React 官方文档 19.2，2026-08-16 核验 | 公共版本入口 | `react.dev` 当前稳定文档口径为 19.2。 |
| R2 | [`useReducer`](https://react.dev/reference/react/useReducer) | React 官方文档 19.2 | 公共 API 合同 | 签名、参数、返回值、稳定 dispatch、更新时机、初始化、不可变返回和 StrictMode 提示。 |
| R3 | [Extracting State Logic into a Reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer) | React 官方文档 19.2 | 官方教学合同 | Action 描述发生了什么、最小信息、一次交互一个 Action、纯 reducer 和适用边界。 |
| R4 | [Using TypeScript](https://react.dev/learn/typescript#usereducer) | React 官方文档 19.2 | 官方 TSX 示例 | 为 State、Action、初始 State、reducer 参数和返回值建立类型。 |
| T1 | [TypeScript Narrowing: Discriminated unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions) | TypeScript 6.0.3 核验；Handbook 2026-08-16 | 语言公共合同 | 共同字面量属性构成判别字段，检查该字段后联合在分支中收窄。 |
| S1 | [`ReactFiberHooks.js` at `v19.2.8`](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberHooks.js) | React 19.2.8 | 固定实现证据，非公共 API | 初始化时创建 dispatch 并存入 Hook queue，更新时复用该 dispatch；开发双调用与更新入队的当前实现位置。 |

R1-R4 与 T1 支撑学习者可以依赖的公开结论。S1 只解释 React 19.2.8 如何实现这些公开行为，不能把
queue、lane、函数绑定位置或具体调用路径写成跨版本保证。本课没有需要官方测试才能成立的额外结论，
因此不为了增加链接而引用测试文件。

## 三、现状审计

### 1. 调研与正文

| 现有资产 | 保留 | 补充 | 删除或移动 | 合并结果 |
| --- | --- | --- | --- | --- |
| `use-reducer` 调研与正文 | Hook 签名、四个角色、`initialArg/init`、dispatch 后旧快照、选择边界 | dispatch 稳定身份、Action 判别联合、纯度、不可变返回、StrictMode | 删除“Action 与纯度留到第 8/9 课”、旧课序号、旧闭环和哈希叙事 | 作为目标文件与稳定 ID 的主体 |
| `action-design` 调研与正文 | 事件式 `type`、最小载荷、一次交互一个 Action、判别联合 | 明确 React 只约定常见形状，事件式命名是官方建议与课程规范，不是语法限制 | 删除独立课程身份、独立 Demo 生产叙事、日志系统延伸 | 吸收到 Action 与事件边界章节 |
| `reducer-purity` 调研与正文 | 相同输入得到等价结果、不得修改旧 State、不可变返回、StrictMode 开发提示 | 与 Hook 更新时机、Action 输入合同放在同一数据流中解释 | 删除独立课程身份、独立测试教学、后续主题说明和越界工具 | 吸收到 reducer 合同与易错章节 |

可复用内容的正确核心已经存在，但三篇正文反复解释 State、Action、reducer、dispatch，且用“上一课、
下一课、第 8/9 课”维持已经废弃的拆课边界。合并后只保留一次完整定义，再按数据流顺序展开，不把旧
生产路线带入学习者正文。

### 2. Demo

| 现有 Demo | 可复用观察 | 需要收口的旧叙事 |
| --- | --- | --- |
| `use-reducer/task-board-demo.tsx` | `init`、添加/切换/删除/清空、State 统计、稳定目标 Demo ID | “一个按钮连续 dispatch 两个 Action”与“一次交互一个 Action”冲突；Action 名称和纯度观察不足 |
| `action-design/feedback-action-demo.tsx` | 判别联合、事件专属载荷、Action 顺序 | 独立课程与独立 Demo ID 不再保留；日志只作为观察手段，不扩展为生产日志 |
| `reducer-purity/reducer-purity-demo.tsx` | 不可变任务转换、相同输入重算、旧数组不变 | 独立课程与独立 Demo ID 不再保留；不把独立测试框架或外部系统带入本课 |

目标 Demo 应以现有任务看板为单一基础，吸收另外两个 Demo 的高价值观察，不并列保留三套相似交互。

## 四、逐条结论与证据

### 1. 签名和初始化

| Claim | 结论 | 类型 | 适用版本与来源 |
| --- | --- | --- | --- |
| C1 | 签名是 `const [state, dispatch] = useReducer(reducer, initialArg, init?)`。reducer 接收当前 State 与 Action，返回下一份 State。 | 公共合同 | React 19.2，R2 |
| C2 | 未传 `init` 时首次 State 为 `initialArg`；传入 `init` 时首次 State 为 `init(initialArg)`。State 与 Action 可以是任意类型。 | 公共合同 | React 19.2，R2 |
| C3 | 应把初始化函数本身作为第三参数传入。React 保存首次初始化结果；后续 render 忽略新的初始参数值。StrictMode 开发检查可能额外调用 initializer。 | 公共合同 | React 19.2，R2 |
| C4 | 把原始输入转成结构化 State 是 `init` 的合适职责；`init` 不是监听输入变化并重置已有 State 的机制。 | 课程推导 | 基于 React 19.2 的 C2-C3 |

`createInitialState(owner)` 直接写在第二参数位置会由 JavaScript 在每次组件函数执行时先求值；React
随后只使用首次结果。`useReducer(reducer, owner, createInitialState)` 才把初始化调用交给 React。

### 2. State、dispatch 与更新时机

| Claim | 结论 | 类型 | 适用版本与来源 |
| --- | --- | --- | --- |
| C5 | `useReducer` 精确返回当前 State 和 `dispatch` 两个值；`dispatch(action)` 没有返回值。 | 公共合同 | React 19.2，R2 |
| C6 | dispatch 后，React 用当前 State 和该 Action 调用 reducer，并把返回值用于后续 render。正在运行的处理器仍读取发起 dispatch 前的 State 快照。 | 公共合同 | React 19.2，R2 |
| C7 | `dispatch` 在 render 之间具有稳定身份，不会因为组件再次 render 而变成新函数。 | 公共合同 | React 19.2，R2 |
| C8 | React 19.2.8 在 mount 时把绑定后的 dispatch 存到 Hook queue，update/rerender 时取回同一个 `queue.dispatch`；dispatch 会创建更新并入队、安排后续工作。 | 实现细节 | React 19.2.8，S1 第 1257-1291、1573-1596、3556-3596 行 |

C8 只能帮助解释 C6-C7，课程正文应以“稳定身份”和“下一次 render 更新”为公共结论，不教授 queue、
lane 或调度函数名。

### 3. Action 和 TypeScript 判别联合

| Claim | 结论 | 类型 | 适用版本与来源 |
| --- | --- | --- | --- |
| C9 | Action 可以是任意类型；常见约定是带字符串 `type` 的对象，并只携带 reducer 计算下一份 State 所需的最少信息。 | 公共合同 | React 19.2，R2-R3 |
| C10 | Action 的 `type` 应描述“发生了什么”。一次有意义的用户交互通常对应一个 Action，即使 reducer 同时改变多个字段。 | 官方教学合同 | React 19.2，R3 |
| C11 | 事件处理器只提取本次交互新增的事实并 dispatch Action；“怎样更新 State”集中在 reducer。 | 课程推导 | 基于 React 19.2 的 C9-C10 |
| C12 | 当联合的每个成员都含共同的字面量属性时，该属性是判别字段；检查 `action.type` 后，TypeScript 在对应分支收窄到具有专属字段的成员。 | 语言公共合同 | TypeScript 6.0.3，T1；React TSX 形状见 R4 |

课程采用以下最小模型，不把下划线、过去式、`payload` 字段或全局唯一名称冒充 React 语法要求：

```tsx
type TaskAction =
  | { type: 'task_added'; title: string }
  | { type: 'task_toggled'; id: number }
  | { type: 'tasks_cleared' }
```

`type` 与分支字段必须一起组成联合。`{ type: string; title?: string; id?: number }` 虽然看起来通用，
却允许缺字段、错字段组合进入 reducer，不能体现本课的 Action 合同。

### 4. reducer 纯度和不可变返回

| Claim | 结论 | 类型 | 适用版本与来源 |
| --- | --- | --- | --- |
| C13 | reducer 必须纯：相同 State 与 Action 应得到等价结果，不修改参数，也不在返回值之外产生可观察变化。 | 公共合同 | React 19.2，R2-R3 |
| C14 | 对象和数组 State 视为只读快照。更新时返回新对象或新数组；只复制从根到实际修改位置的路径，不要求无条件深拷贝。 | 公共合同与课程推导 | React 19.2，R2-R3 |
| C15 | React 用 `Object.is` 比较新旧 State；原地修改后返回同一对象可能让 React 忽略更新，同时污染旧快照。 | 公共合同 | React 19.2，R2 |
| C16 | reducer 不应读取时间、随机数或模块级可变值等隐藏输入，也不应写外部可变值。若某个事实参与转换，应在事件边界形成明确 Action 字段。 | 课程推导 | 基于 React 19.2 的 C13 |

### 5. StrictMode 开发期双调用

| Claim | 结论 | 类型 | 适用版本与来源 |
| --- | --- | --- | --- |
| C17 | StrictMode 下，React 在开发环境会额外调用 reducer 与 initializer 以帮助发现意外不纯；其中一次结果被忽略，生产环境不受影响。 | 公共合同 | React 19.2，R2 |
| C18 | React 19.2.8 的 mount 路径在开发标记开启时再次执行 `init(initialArg)`，处理 reducer 更新时也会先额外调用一次 reducer。 | 实现细节 | React 19.2.8，S1 第 1264-1272、1516-1527 行 |
| C19 | 不应计数或依赖 reducer / initializer 的调用次数。双调用是诊断提示，不是业务流程。 | 课程推导 | 基于 React 19.2 的 C17 |

### 6. 适用边界

R3 明确比较两种 Hook：简单更新下 `useState` 代码更少、更直观；当多个事件处理器修改同一份关联
State、更新规则重复或错误难定位时，`useReducer` 可把“发生了什么”和“怎样更新”分开。两者可以在
同一组件中并存，不存在“useReducer 更高级，所以所有 State 都应迁移”的结论。

## 五、课程结构建议

学习者正文建议按以下顺序形成一个连续解释，不保留旧三课的重复开场：

1. **学习目标与为什么需要：** 从多个事件处理器分散修改同一份 State 引出集中转换。
2. **最小数据流：** 定义 State、Action、reducer、dispatch，并展示完整签名。
3. **初始化：** 对比 `initialArg` 与 `init(initialArg)`，说明首次初始化和后续 render。
4. **用 Action 表达意图：** 最小字段、一次交互一个 Action、事件处理器不拼下一份 State。
5. **判别联合：** 用 `action.type` 绑定和收窄专属字段，只讲本课所需 TypeScript 能力。
6. **纯 reducer 与不可变返回：** 对象、数组、嵌套路径、完整 State 形状和未知 Action。
7. **dispatch 与开发提示：** 稳定身份、下一次 render、当前快照、StrictMode 双调用。
8. **选择边界、易错提示、Demo、练习、小结和一手资料。**

学习者正文标题只用“useReducer 与 Action”，不得出现 I04、计划、路线、批次、迁移、复审、构建、
测试、篇幅、旧课序号或后续课程生产信息。

## 六、Demo 观察合同

### 1. 单一 Demo 与稳定身份

- 保留 Demo ID：`react.core.learn.intermediate.use-reducer.task-board-demo`。
- 以现有 `demos/use-reducer/task-board-demo.tsx` 为基础吸收另外两个 Demo 的必要观察。
- 运行组件和展开源码继续来自同一份 TSX；样式只用 Flexbox、margin 和正常文档流。
- 旧 `action-design`、`reducer-purity` Demo ID 不再作为新路线独立资产。

### 2. 必须可观察的行为

| 观察目标 | 操作 | 可见结果 |
| --- | --- | --- |
| `initialArg/init` | 用确定性 owner 初始化看板，随后只编辑原始输入 | 首次 State 来自 `init(owner)`；普通 render 不重建已有任务 |
| 事件只 dispatch 意图 | 添加、切换、删除、清空 | 每次交互只产生一个明确 Action，不在处理器拼接整份 State |
| 判别联合载荷 | 检查展示源码与最近 Action | 添加只带 `title`，切换/删除只带 `id`，清空无空 `payload` |
| 纯 reducer | 重放一组固定 State/Action 计算，或用只读观察面板展示 | 相同输入结果等价，输入 State 与旧任务数组保持不变 |
| 不可变返回 | 切换、删除或清空任务 | 页面得到新 State；未修改任务可复用，目标路径不修改旧对象 |
| 更新时机 | dispatch 后观察当前处理器快照与下一次 render 结果 | 处理器中的 State 仍是旧快照，页面在后续 render 显示新值 |
| 边界状态 | 删除最后一项、清空后再添加 | 空状态明确；再次添加仍得到有效且不冲突的 ID |

不要用 reducer 调用计数器演示 StrictMode；计数本身会诱导学习者依赖开发调用次数。StrictMode 只在
正文用公共合同和一个不纯 mutation 对照说明。Demo 不加入未知 Action 错误按钮，未知分支用最小静态
或函数探针验证即可。

## 七、八个高价值易错点

### 1. 提前调用 initializer，或把 init 当成输入同步器

- **触发条件：** 写 `useReducer(reducer, createInitialState(owner))`，或期待 owner 改变后自动重置。
- **原因：** JavaScript 每次 render 都先求值；React 只保存首次初始 State。
- **后果：** 重复做无用初始化计算，且输入改变并不会重建 State。
- **错误 / 正确：** `useReducer(reducer, createInitialState(owner))` / `useReducer(reducer, owner, createInitialState)`。
- **适用版本与来源：** React 19.2，R2。

### 2. 把 dispatch 当 setter 传下一份 State

- **触发条件：** 事件处理器先复制 State，再写 `dispatch(nextState)`，而 reducer 期待 Action。
- **原因：** 混淆了 dispatch 输入合同和 reducer 返回值。
- **后果：** 更新规则重新散落到处理器，Action 无法描述发生了什么。
- **错误 / 正确：** `dispatch({ ...state, title })` / `dispatch({ type: 'title_changed', title })`。
- **适用版本与来源：** React 19.2，R2-R3。

### 3. 使用宽泛 string 和可选字段袋

- **触发条件：** `type Action = { type: string; title?: string; id?: number }`。
- **原因：** `type` 不是字面量判别字段，专属字段也没有与分支绑定。
- **后果：** 拼错 type、漏字段和错字段组合可能进入 reducer。
- **错误 / 正确：** 可选字段袋 / 每个字面量 `type` 对应一个对象联合成员。
- **适用版本与来源：** TypeScript 6.0.3，T1；React TSX 形状见 R4。

### 4. 用字段补丁命名 Action，或一次交互 dispatch 多个字段 Action

- **触发条件：** 使用 `set_title`、`patch_state`，或点击一次重置后连续 dispatch 多个字段更新。
- **原因：** Action 描述了实现步骤，没有描述一次有意义的交互。
- **后果：** 调用方与 State 结构耦合，Action 顺序难以复述。
- **错误 / 正确：** 多个 `set_field` / 一个 `{ type: 'form_reset' }`。
- **适用版本与来源：** React 19.2，R3；事件式命名是官方建议，不是语法限制。

### 5. 原地修改对象、数组或只复制顶层

- **触发条件：** 对旧数组 `push/splice`，直接改旧对象，或 `{ ...state }` 后修改仍共享的嵌套对象。
- **原因：** State 是只读快照；浅复制只切断被复制那一层的引用。
- **后果：** 旧快照被污染，返回同一引用时更新还可能被 `Object.is` 判为相同。
- **错误 / 正确：** `state.tasks.push(task); return state` / 返回新数组，并复制到目标字段的完整路径。
- **适用版本与来源：** React 19.2，R2-R3。

### 6. reducer 读取隐藏输入或写外部值

- **触发条件：** reducer 读取当前时间、随机数、模块级递增变量，或修改模块级对象。
- **原因：** 实际输入不再只有 State 与 Action，返回值也不再是唯一可观察结果。
- **后果：** 同一 State/Action 不能稳定重放，StrictMode 会放大差异。
- **错误 / 正确：** reducer 内生成 ID / 在事件边界生成并作为 Action 字段传入。
- **适用版本与来源：** React 19.2，R2-R3。

### 7. 分支返回不完整 State，或静默吞掉未知 Action

- **触发条件：** 对象 State 分支只返回一个字段，或 `default` 无条件 `return state`。
- **原因：** reducer 返回值不会自动与旧对象合并；未知协议错误也不是合法无操作。
- **后果：** 其他字段丢失，新增/拼错 Action 表现成“没有反应”。
- **错误 / 正确：** `return { tasks: [] }` / 返回完整形状；闭合联合未覆盖时显式失败。
- **适用版本与来源：** React 19.2，R2-R3；类型收窄见 T1。

### 8. dispatch 后立即把当前变量当成新 State，或依赖双调用次数

- **触发条件：** 同一处理器在 dispatch 后读取 `state` 判断新结果，或用 reducer 调用次数推进逻辑。
- **原因：** dispatch 只影响下一次 render；StrictMode 双调用只是开发期诊断。
- **后果：** 条件使用旧快照，开发与生产结果还可能不同。
- **错误 / 正确：** dispatch 后同步读取新值 / 在下一次 render 观察 State；每次 reducer 调用只由输入决定。
- **适用版本与来源：** React 19.2，R2。

## 八、练习建议

### 练习 1：从分散 setter 迁移到 reducer

给定一个任务列表的添加、切换、删除和清空处理器，将更新逻辑集中到 reducer。验收条件：每个处理器
只提取必要值并 dispatch 一个 Action；reducer 返回完整 State；清空后再添加仍保持合法 ID。

### 练习 2：收紧 Action 联合

把 `{ type: string; title?: string; id?: number; reset?: boolean }` 改成判别联合。验收条件：漏掉分支专属
字段、把字段放到错误 type 或拼错 type 时由 TypeScript 拒绝；`switch` 分支能直接读取已收窄字段。

### 练习 3：验证纯度、初始化和快照

修复一个会修改旧数组并在 reducer 内生成 ID 的实现，再用同一 State/Action 调用两次。验收条件：结果
结构等价，旧 State 不变；初始化函数作为第三参数传入；能够解释 dispatch 后为何仍读到当前快照。

## 九、Manifest、Track 与进度迁移影响

### 1. 当前只读事实

- `entry-manifest.ts` 目前分别登记 `use-reducer`、`action-design`、`reducer-purity` 三个 slug 和 loader。
- `react-core-track.ts` 目前把三个旧 ID 连续登记为 `available`。
- `demo-manifest.ts` 目前分别登记三个独立 Demo ID。
- `progress-migrations.ts` 目前尚未登记 I04 合并映射。
- 目标 `use-reducer` 已有稳定 ID 与 slug，不能新建替代 ID，也不能改 URL。

### 2. 后续实现阶段的原子迁移

1. entry manifest 只保留目标 `use-reducer`；退出 `action-design`、`reducer-purity` 的 import、slug 与 loader。
2. Track 在原 I04 位置只保留 `react.core.learn.intermediate.use-reducer`；目标元数据与正文标题统一为
   短标题，两个旧 ID 退出新路线完成分母。
3. demo manifest 保留 `react.core.learn.intermediate.use-reducer.task-board-demo`，移除两个旧独立 Demo
   登记；是否删除旧源码要与正文、loader 引用同批确认，不能留下孤儿。
4. 所有下游 `prerequisites`、`related` 和其他 manifest 引用若仍指向两个旧 ID，应改为稳定目标 ID；
   本调研不读取或预写下一课内容。
5. 新增如下显式进度迁移，并按现有 schema 规则验证完整、部分、最近访问和重复读取：

```ts
{
  targetEntryId: 'react.core.learn.intermediate.use-reducer',
  sourceEntryIds: [
    'react.core.learn.intermediate.use-reducer',
    'react.core.learn.intermediate.action-design',
    'react.core.learn.intermediate.reducer-purity',
  ],
}
```

三项旧来源全部完成时，稳定目标记为完成并清除旧来源；只完成部分来源时，已完成旧 ID 转入
`legacyCompletedEntryIds`，不提前完成目标；最近访问若指向任一来源则迁到目标。旧 slug 退出后按项目
既有规则不建立重定向。

本文件只冻结影响，不实施正文、Demo、manifest、Track 或进度迁移。

## 十、明确排除项

- 不调研、不撰写或登记 I05。
- 不讲 Context、Provider 或 reducer 跨组件共享。
- 不讲 Effect、Ref、外部 Store 或任何第三方状态库。
- 不讲异步副作用、middleware、Redux、Immer。
- 不讲服务器、网络、持久化或性能优化。
- 不把 React 内部 queue、lane、调度路径写成公共 API。
- 不建设生产日志、事件溯源、运行时 schema 或通用类型体操。

## 十一、验收清单

### 1. 本调研文件

- [x] 稳定 ID、slug 和最终短标题与总计划 I04 一致。
- [x] 明确合并 `action-design` 与 `reducer-purity`，并区分保留、补充、删除、移动和合并。
- [x] 签名、初始化、State/dispatch、Action、纯度、不可变返回、更新时机、StrictMode 和选择边界逐条绑定一手来源与版本。
- [x] 公共合同、课程推导和 React 19.2.8 实现细节已分层。
- [x] Demo 只有一个稳定目标和可观察合同。
- [x] 易错点共 8 个，没有拆项凑数。
- [x] 已记录 manifest、Track、Demo 与进度迁移影响，但未修改实现。
- [x] 排除后续和外部范围，未读取或预写 I05。

### 2. 后续课程闭环

- [ ] 学习者正文使用标题“useReducer 与 Action”，不出现生产叙事。
- [ ] 正文、Demo、entry manifest、demo manifest、Track 和进度迁移在同一批同步。
- [ ] 目标正文覆盖 C1-C19 的课程层结论，不教授 S1 内部名词。
- [ ] Demo 可观察初始化、单 Action 意图、判别联合、纯 reducer、不可变返回、快照和空状态。
- [ ] 临时类型探针验证 Action 漏字段/错字段，临时函数探针验证旧 State 不变和未知 Action。
- [ ] 聚焦解析、类型、lint、格式、构建与浏览器验收通过，临时资产清理后再进入独立复审。

## 十二、参考资料

1. [React Versions](https://react.dev/versions) - React 官方文档 19.2 版本口径。
2. [`useReducer`](https://react.dev/reference/react/useReducer) - 签名、参数、返回值、初始化、dispatch、不可变更新和 StrictMode。
3. [Extracting State Logic into a Reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer) - Action 意图、纯 reducer、一次交互一个 Action 与选择边界。
4. [Using TypeScript](https://react.dev/learn/typescript#usereducer) - React reducer 的 State 与 Action 类型示例。
5. [TypeScript Narrowing: Discriminated unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions) - 判别字段与分支收窄。
6. [`ReactFiberHooks.js` at `v19.2.8`](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberHooks.js) - 仅用于固定版本实现核对。
