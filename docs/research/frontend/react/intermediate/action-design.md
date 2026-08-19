# Action 设计研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.intermediate.action-design`
- 标题：Action 设计
- 教学层级：零基础到进阶
- 核验日期：`2026-08-10`
- 研究状态：官方事实、正文、同源 Demo、静态检查、浏览器验收与双轴复审已闭环
- 文档基线：React 官方文档 `19.2`

本课只回答一条主线：怎样把一次用户交互表达为最小的事件意图，使用能说明“发生了什么”的
`type`，并只携带 reducer 计算下一份 State 必需的载荷字段。

必须覆盖：

1. Action 是传给 `dispatch` 的普通对象，其形状由组件协议决定。
2. `type` 应描述事件，而不是 setter、字段补丁或 reducer 实现步骤。
3. 载荷只包含 reducer 必需、且不能从当前 State 得到的信息。
4. 一次用户交互通常对应一个 Action，即使它会改变多个 State 字段。
5. Action 日志应足以还原交互或响应的种类与顺序。
6. TypeScript 判别联合把每个 `type` 与自己的载荷字段绑定。
7. 内部 `dispatch` 使用闭合 Action 联合，未知 Action 显式失败而不是静默忽略。
8. React 不要求名为 `payload` 的固定属性；本课把 `type` 之外的必要字段统称为载荷。

明确排除：Reducer 纯度、Context、Provider、Effect、表单 Action、`useActionState`、异步请求、
服务端提交、Redux、外部状态管理、事件溯源系统和生产日志基础设施。

## 调研与证据边界

1. 按仓库外部搜索顺位先使用 Tavily。2026-08-10 完成 4 组 `tavily_search`，4/4 返回可靠的
   `react.dev` 候选；未切换 Exa、Parallel、Perplexity 或原生 Web 搜索。
2. 完成 1 批 `tavily_extract`，4 个 `react.dev` URL 均返回可核验的 `Raw Content`。搜索只用于发现
   URL，课程事实全部回到官方原文核验。
3. 只采用 React 官方 `19.2` 文档。社区文章、Redux 约定、第三方 TypeScript 教程和搜索摘要均不支撑
   本课事实。
4. React Learn 推荐用 `type` 描述“发生了什么”，但 React 官方 TypeScript 示例包含 `setCount`。
   因此事件式命名是本课基于 React Learn 原则冻结的教学规范，不冒充 React 的字符串语法限制。
5. React 允许 Action 使用任意形状。本课采用字符串字面量 `type` 与扁平的事件专属字段，不声称
   `payload` 属性、可序列化或全局命名空间是 React 要求。
6. 本记录只冻结第 8 课事实、教学、Demo 与浏览器合同，不修改课程、Demo、manifest、track、计划、
   测试、构建产物或其他研究文件。

## 官方来源卡

| React 官方一手来源 | URL | 本课采用的结论 |
| --- | --- | --- |
| React Versions | https://react.dev/versions | `react.dev` 当前 latest version 为 `19.2`；同一 major 内持续更新，不为每个 minor 或 patch 发布独立文档。 |
| Extracting State Logic into a Reducer | https://react.dev/learn/extracting-state-logic-into-a-reducer | Action 是普通对象；`type` 通常描述发生了什么；字段保持最小；一个交互对应一个 Action；日志应能重建交互或响应顺序。 |
| useReducer | https://react.dev/reference/react/useReducer | Action 可以是任意形状；常见做法是使用 `type` 和 reducer 所需的最小信息；未知 `type` 应显式报错。 |
| Using TypeScript | https://react.dev/learn/typescript | `CounterAction` 使用字符串字面量对象联合描述可 dispatch 的 Action，并按 `type` 访问分支专属字段。 |

## 一、官方事实与课程推导

### 1. Action 描述发生了什么

Action 是传给 `dispatch` 的普通对象。React 约定常用字符串 `type` 识别 Action，但对象形状和名称由
当前组件决定。事件处理器应报告用户刚刚做了什么，而不是告诉 reducer 怎样设置 State。

本课采用 `task_added`、`priority_selected`、`draft_reset` 这类事件式名称。过去式和下划线只是课程
一致性选择，不是 React 强制语法；领域前缀也只在多个 `type` 放在一起仍可能歧义时使用。

| 用户事件 | 推荐 `type` | 不推荐 | 原因 |
| --- | --- | --- | --- |
| 编辑标题 | `title_changed` | `set_title` | 前者描述事件，后者描述 setter。 |
| 选择优先级 | `priority_selected` | `update_draft` | 前者能从日志辨认交互。 |
| 提交反馈 | `feedback_submitted` | `clear_and_increment` | 后者泄漏内部更新步骤。 |
| 重置草稿 | `draft_reset` | `set_title_and_priority` | 一次事件不应按字段拆名。 |

### 2. 载荷只提供最小必要信息

React `useReducer` Reference 要求 Action 包含 reducer 计算下一份 State 所需的最小必要信息。“最小”
不是机械追求字段数，而是排除 reducer 已有的当前 State、可推导值、未读取字段、整份下一 State 和
整个 DOM/SyntheticEvent。React 不要求固定 `{ type, payload }` 结构；官方示例直接使用 `id`、
`text`、`nextName` 等字段。

选择载荷时依次检查：

1. 当前 State 已有哪些事实？
2. 本次交互产生了哪个新事实？
3. 哪些值可以从前两类事实推导？
4. reducer 实际读取哪些字段？
5. UI 事件是否已在边界提取为领域值？

例如切换任务时，当前 State 已有任务内容和完成状态，交互只新增“哪个任务被切换”这一事实，
`{ type: 'task_toggled', id }` 已足够。

### 3. Action 粒度跟随交互边界

React 官方明确说明，一个 Action 描述一次用户交互，即使该交互会引起多处数据变化。五字段表单点击
一次“重置”应 dispatch 一个 `form_reset`，而不是五个 `set_field`。

反过来，编辑标题与选择优先级是两次独立交互，不应合并成模糊的 `draft_updated`。判断标准不是 Action
越少越好，而是每项是否恰好表达一个有意义的交互。

### 4. 可审计性是命名与粒度的验收标准

React Learn 提出的标准是：连续记录 Action 后，应能重建发生了哪些交互或响应，以及它们的顺序。
课程验收时隐藏 reducer 和最终 State，只看 `type` 与载荷，仍应能回答“用户依次做了什么”。

这不等于 React 要求 Action 可序列化，也不等于本课建设生产日志或事件溯源。Demo 中的 Action 序列
只是观察协议清晰度的教学面板。

### 5. TypeScript 判别联合绑定 type 与载荷

本课按 React 官方 TypeScript 对象联合示例，为每个事件定义独立对象分支：

```tsx
type Priority = 'normal' | 'urgent'

type FeedbackAction =
  | { type: 'title_changed'; title: string }
  | { type: 'priority_selected'; priority: Priority }
  | { type: 'feedback_submitted' }
  | { type: 'draft_reset' }
```

`dispatch({ type: 'priority_selected' })` 会因缺少必要字段被拒绝；`draft_reset` 不需要空
`payload: {}`。不要退化为 `{ type: string; title?: string; priority?: Priority }`，否则 `type` 与
载荷失去关联，reducer 只能反复猜测可选字段。

### 6. unknown Action 是类型系统外的运行时边界

内部事件处理器只创建闭合的 `FeedbackAction`，不能把 reducer 参数放宽成 `unknown` 或 `any`。正常
TypeScript 调用中的拼写、漏字段和错字段应在编译期失败。

错误断言或混合 JavaScript 仍可能带来运行时未知值。React 官方示例在未匹配 `action.type` 时抛出
`Unknown action`；静默返回当前 State 会把协议错误伪装成“按钮没有反应”。

```tsx
/** 根据反馈事件返回下一份编辑状态。 */
function feedbackReducer(state: FeedbackState, action: FeedbackAction): FeedbackState {
  switch (action.type) {
    case 'title_changed':
      return { ...state, title: action.title }
    case 'priority_selected':
      return { ...state, priority: action.priority }
    case 'feedback_submitted':
      return { ...state, title: '', submittedCount: state.submittedCount + 1 }
    case 'draft_reset':
      return { ...state, title: '', priority: 'normal' }
    default:
      throw new Error('Unknown action')
  }
}
```

外部 `unknown` 数据若未来进入系统，应先验证再转换为内部 Action；本课只冻结边界，不教学请求、JSON
解码或 schema 库。Reducer 如何保持纯净属于第 9 课。

## 二、完整易错使用提示

### 1. 用 setter 名称代替事件

- **触发条件：** `type` 写成 `set_title`、`patch_state` 或 `merge_draft`。
- **原因：** 描述了 reducer 怎样改数据，没有描述用户做了什么。
- **后果：** 日志离开 reducer 就无法解释，State 结构变化还会影响调用方协议。
- **错误示例：** `dispatch({ type: 'set_title', value: nextTitle })`。
- **正确示例：** `dispatch({ type: 'title_changed', title: nextTitle })`。
- **验证方式：** 只看日志，确认无需查看 reducer 就能说出交互。

### 2. 把完整 State 当载荷

- **触发条件：** 事件处理器先复制 State，再 dispatch 整份 `nextState`。
- **原因：** 调用方承担了 reducer 的转换，并重复携带当前 State。
- **后果：** Action 失去事件语义，调用方与 State 形状耦合。
- **错误示例：** `dispatch({ type: 'state_replaced', nextState: { ...state, title } })`。
- **正确示例：** `dispatch({ type: 'title_changed', title })`。
- **验证方式：** 删除当前 State 已有字段，确认 reducer 仍能从当前 State 和新标题得到结果。

### 3. 传入整个浏览器事件对象

- **触发条件：** `dispatch({ type: 'title_changed', event })`。
- **原因：** 没有在 UI 边界提取 reducer 真正需要的领域值。
- **后果：** Action 依赖 DOM 事件形状，并携带大量无关字段。
- **错误示例：** `onChange={(event) => dispatch({ type: 'title_changed', event })}`。
- **正确示例：** `dispatch({ type: 'title_changed', title: event.currentTarget.value })`。
- **验证方式：** reducer 若只读取字符串，Action 中就不应出现 `event`。

### 4. 一次重置拆成多个字段 Action

- **触发条件：** 点击一次“重置”后 dispatch 多个字段 Action。
- **原因：** 按 State 字段切分，而不是按用户交互切分。
- **后果：** 日志把一次重置伪装成多次编辑，还会暴露中间状态。
- **错误示例：** 连续 dispatch 两个 `set_field` 清空标题和优先级。
- **正确示例：** 只 dispatch `{ type: 'draft_reset' }`。
- **验证方式：** 点击一次重置，日志只新增一项，两个字段同时复位。

### 5. 用模糊 Action 吞掉不同交互

- **触发条件：** 编辑、选择和重置都 dispatch `draft_updated`。
- **原因：** 把“减少 Action 种类”误当成最小设计。
- **后果：** 日志无法区分交互，载荷退化成大量可选字段。
- **错误示例：** `{ type: 'draft_updated', title?, priority?, reset? }`。
- **正确示例：** 分别使用 `title_changed`、`priority_selected` 与 `draft_reset`。
- **验证方式：** 隐藏载荷后，仍能只凭 `type` 区分三种交互。

### 6. 使用 string type 与可选字段袋

- **触发条件：** Action 定义为 `{ type: string; title?: string; priority?: Priority }`。
- **原因：** `type` 没形成字面量联合，载荷也没有与事件分支绑定。
- **后果：** 拼错 `type`、漏字段和错字段组合可能进入 reducer。
- **错误示例：** `type Action = { type: string; value?: string }`。
- **正确示例：** `type Action = { type: 'title_changed'; title: string } | { type: 'draft_reset' }`。
- **验证方式：** 在 `/tmp` 临时尝试缺少 `title` 的 dispatch，TypeScript 必须拒绝，随后删除资产。

### 7. 强制每个 Action 都有 payload 属性

- **触发条件：** 为无载荷 Action 写 `payload: {}`，或给单字段增加无意义嵌套。
- **原因：** 把其他状态库约定误当成 React 要求。
- **后果：** Action 变长却没有增加语义，学习者还会误以为 React 读取 `payload`。
- **错误示例：** `dispatch({ type: 'draft_reset', payload: {} })`。
- **正确示例：** `dispatch({ type: 'draft_reset' })`。
- **验证方式：** 对照 reducer 读取字段，无载荷事件不应有空对象占位。

### 8. 未知 Action 静默返回当前 State

- **触发条件：** `default` 分支 `return state`，或没有未知类型提示。
- **原因：** 把协议错误当作无操作吞掉。
- **后果：** 拼写错误表现为“没有反应”，新增 Action 漏分支也难定位。
- **错误示例：** `default: return state`。
- **正确示例：** 按 React 官方示例抛出 `new Error('Unknown action')`。
- **验证方式：** 用 `/tmp` 运行时探针越过类型边界调用 reducer，确认显式抛错；Demo 不增加错误按钮。

### 易错点适用版本与来源

| 错误名称 | 适用版本 | 来源 |
| --- | --- | --- |
| 用 setter 名称代替事件 | React 19.2 | Extracting State Logic into a Reducer |
| 把完整 State 当载荷 | React 19.2 | useReducer、Extracting State Logic into a Reducer |
| 传入整个浏览器事件对象 | React 19.2 | useReducer |
| 一次重置拆成多个字段 Action | React 19.2 | Extracting State Logic into a Reducer |
| 用模糊 Action 吞掉不同交互 | React 19.2 | Extracting State Logic into a Reducer |
| 使用 string type 与可选字段袋 | React 19.2 | Using TypeScript |
| 强制每个 Action 都有 payload 属性 | React 19.2 | useReducer |
| 未知 Action 静默返回当前 State | React 19.2 | Extracting State Logic into a Reducer、useReducer |

## 三、课程正文合同

正文按以下顺序完成唯一主线：

1. 用 setter 风格 Action 与事件日志对照引出“发生了什么”。
2. 定义 Reducer Action、事件式 `type` 和载荷；说明 `payload` 不是固定键。
3. 用“当前 State / 交互新事实 / 可推导信息”选择最小载荷。
4. 用表单重置说明“一次交互一个 Action，可改变多个字段”。
5. 用事件专属对象联合绑定 `type` 与字段，不展开通用 TypeScript 类型体操。
6. 说明内部闭合联合和运行时未知 Action 抛错边界。
7. 使用同源 Demo 观察 Action 顺序、载荷与 State 结果。
8. 至少保留上面 6 个完整 pitfalls，练习要求重写坏 Action 并从日志复述交互。

正文首次出现时写“Reducer Action”，避免与 React 19 表单 Actions 混淆。不得声称 React 强制过去式、
下划线、全局唯一名称、固定 `payload`、可序列化或“一个 Action 只能改一个字段”。不得展开 reducer
纯度、Context、Effect 和异步请求。

## 四、同源 Demo 合同

建议后续新增
`react.core.learn.intermediate.action-design.feedback-action-demo`，使用确定性的本地“反馈草稿”：

| 交互 | Action | 最小载荷 | 可观察结果 |
| --- | --- | --- | --- |
| 编辑标题 | `title_changed` | `title: string` | 标题变化，日志显示新标题。 |
| 选择优先级 | `priority_selected` | `priority: Priority` | 优先级变化，日志新增一项。 |
| 提交反馈 | `feedback_submitted` | 无 | 提交数增加、标题清空；日志只新增一项。 |
| 重置草稿 | `draft_reset` | 无 | 标题和优先级一起复位；日志只新增一项。 |

Demo 显示当前草稿、提交数和最近 6 个 Action；它只是教学观察面板，不发送日志。初始状态确定，不用
请求、Promise、Effect、Context、时间或随机数。不提供“未知 Action”按钮。运行组件与展示 TSX 来自
同一文件；新增方法上方写规范中文注释；样式只用 Flexbox、margin 和正常文档流，不使用 CSS Grid 或
`gap`。输入、选择和按钮使用原生元素与可读 label，Action 长文本可换行且不只依赖颜色表达信息。

## 五、浏览器与验证合同

后续实现完成后使用 Playwright 建立可复跑反馈环：

1. 冷会话进入课程，正文、Demo、源码可见，console 为 `0 error / 0 warning`。
2. 编辑标题、选择紧急，日志依次出现 `title_changed`、`priority_selected`，只含各自最小载荷。
3. 点击提交，只新增一个 `feedback_submitted`；提交数增加且标题清空。
4. 再编辑并选择紧急后点击重置，只新增一个 `draft_reset`，两个字段同时复位。
5. 日志超过 6 项后只保留最近 6 项且顺序正确；键盘可完成全部交互。
6. 源码展示与实际运行 TSX 同源，Action 联合和 dispatch 形状一致。
7. 桌面、390px、390px + 200% 根字号下无横向溢出、裁切、遮挡或文字越界。

未知 Action 和 TypeScript 负例只在 `/tmp` 最小临时资产中验证：错误 `type`、缺失/多余载荷应编译
失败；越过类型边界传未知 `type` 应抛出 `Unknown action`。验证后删除临时目录并确认不存在，不在仓库
保留测试。实现 Gate 还包括 `type-check`、`lint`、`format:check`、相关 build 与 scoped
`git diff --check`；研究阶段没有实现，不把这些检查写成已通过。

## 六、拆课边界

- Reducer 纯度、不可变返回和 Strict Mode 双调用留给第 9 课。
- Context、Provider 与 reducer 组合留给第 10 至第 14 课。
- Effect、外部同步、异步请求和服务端提交属于后续独立课程。
- 通用 `never`、运行时 schema、Redux 约定和生产日志系统不属于 React reducer 公共合同。

## 七、官方参考资料

1. [React Versions](https://react.dev/versions)：React 官方文档当前稳定版本基线。
2. [Extracting State Logic into a Reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer)：
   事件式命名、最小信息、一次交互一个 Action 与日志可审计性。
3. [useReducer](https://react.dev/reference/react/useReducer)：Action 形状、最小必要信息和未知 Action。
4. [Using TypeScript](https://react.dev/learn/typescript)：Reducer Action 对象联合示例。

## 八、实施与验收证据

- 正文：`src/categories/frontend/react/core/learn/action-design.md`。
- 同源 Demo：`react.core.learn.intermediate.action-design.feedback-action-demo`，运行组件和 raw 源码均指向
  `demos/action-design/feedback-action-demo.tsx`。
- Playwright 验证 `title_changed`、`priority_selected`、`feedback_submitted` 与 `draft_reset`
  的顺序、最小载荷和最近 6 条日志；三种视口均无溢出或裁切，冷会话 console 为
  `0 error / 0 warning`。
- 展示源码与运行 TSX 在去除末尾空白后均为 `3834` 字符、`4102` UTF-8 字节，
  SHA-256 均为 `84d2896f475020340f4148e1b0aef68a217124d8ffdbf756a65ca445c793930f`。
- 第 8 课已登记为 `available`，第 13 课保持 `planned`。
