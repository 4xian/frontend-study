# I08 useRef 官方调研

## 调研结论

- 内部调研身份：`I08`
- 主题：`useRef` 保存不参与渲染的可变值
- 核验日期：`2026-08-16`
- 官方文档基线：React `19.2`
- 仓库依赖快照：React / React DOM `19.2.8`

`useRef` 的本科教学主线可以收敛为一句话：组件需要在多次 render 之间保留某个值，但这个值的变化不应
直接改变页面时，用 Ref 保存它；页面需要显示的值仍然使用 State。

React 19.2 官方资料支持以下核心合同：

1. `useRef(initialValue)` 首次返回 `{ current: initialValue }`，后续 render 返回同一个对象，并忽略新的
   `initialValue`。
2. `ref.current` 可以修改，写入会立即反映在这个普通 JavaScript 对象上。
3. 修改 `current` 不会触发组件重新渲染，因为 React 不跟踪这个属性的变化。
4. 除完全可预测的一次性初始化外，不应在 render 期间读写 `current`。
5. `useRef` 是 Hook，只能在函数组件或自定义 Hook 顶层调用。

当前课程正文和 Demo 的主模型与上述合同一致。需要调整的是课程表达的精度和调研记录的边界，而不是
改换示例方向：保留“内部工作值留在 Ref、公开结果进入 State”的演示；补充官方 `refs` lint 的能力和
本仓库尚未启用该规则的事实；删除与本知识点无关的生产过程叙事。

## 调研范围

### 必须回答的问题

1. `useRef(initialValue)` 的参数、返回值和后续 render 行为是什么？
2. Ref 为什么能跨 render 保留，而普通局部变量不能？
3. 修改 `ref.current` 为什么不会触发 render？
4. 普通局部变量、State 和 Ref 应如何选择？
5. 为什么 render 期间通常不能读写 Ref？
6. 哪一种延迟初始化是官方允许的受限例外？
7. Strict Mode 对 Ref 创建有什么开发期影响？
8. `useRef` 需要遵守哪些 Rules of Hooks？
9. 官方 `eslint-plugin-react-hooks` 的 `refs` 规则检查什么？
10. 当前课程正文与 Demo 是否忠实表达了这些知识？

### 本课边界

本课只讲“用 `useRef` 保存不参与页面输出的可变值”。以下主题与 Ref 有关，但需要额外的宿主、生命周期
或组件接口知识，因此不在正文展开：

- 用 JSX `ref` 属性取得或操作 DOM 节点；
- Callback Ref、动态节点集合和 Ref 清理；
- 组件接收或转交 `ref`、`forwardRef` 兼容知识；
- `useImperativeHandle` 和自定义命令式句柄；
- Effect、计时器清理和外部系统同步；
- 用 Ref 处理闭包、依赖数组或“最新值”问题；
- 外部 Store、远程缓存、持久化和跨组件共享状态；
- 把 Ref 当作渲染优化或强制更新工具。

这些内容只用于说明边界，不应变成正文中的旁支教学。

## 官方来源与核验方法

本轮已知官方 URL 足以覆盖调研问题，因此没有进行关键词外搜。`2026-08-16` 直接读取以下 React 官方
页面，HTTP 响应均为 `200`；结论来自页面正文，不依赖搜索摘要或社区文章。

| 官方来源 | 本次采用的事实 |
| --- | --- |
| [React Versions](https://react.dev/versions) | react.dev 当前最新文档版本为 React 19.2 |
| [`useRef`](https://react.dev/reference/react/useRef) | 参数、返回对象、同一对象、非渲染更新、Strict Mode、延迟初始化 |
| [Referencing Values with Refs](https://react.dev/learn/referencing-values-with-refs) | Ref 与 State、普通局部变量的对比，以及选择 Ref 的条件 |
| [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks) | Hook 顶层调用和 React 函数边界 |
| [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure) | render 幂等性、副作用边界和可暂停、重复执行的原因 |
| [`eslint-plugin-react-hooks`: `refs`](https://react.dev/reference/eslint-plugin-react-hooks/lints/refs) | render 期间 Ref 读写的静态检查范围、有效与无效示例 |

未采用旧版 React 文档、社区教程或搜索摘要。DOM Ref、Effect 和组件命令式接口的官方页面也没有作为
本课事实来源，因为它们会扩张正文范围。

## React 19.2 官方事实

### 1. 参数和返回值

```tsx
const ref = useRef(initialValue)
```

`initialValue` 可以是任意类型。首次 render 时，React 返回一个只有 `current` 属性的对象，`current`
初始等于传入值。官方明确说明：这个参数在初始 render 之后会被忽略。

后续 render 返回同一个 Ref 对象。这里的“同一个”指当前组件实例由 React 保留的 Hook 值，不应扩写成
跨卸载、跨组件实例或跨页面的持久化保证。

### 2. `current` 是可变属性

Ref 本身是普通 JavaScript 对象，可以在 render 之外直接读取和修改：

```tsx
const pendingCountRef = useRef(0)

/** 记录一个不需要立即显示的工作值。 */
function handleRecord() {
  pendingCountRef.current += 1
  console.log(pendingCountRef.current)
}
```

赋值后，同一事件处理函数会立即读到新值。它不像 State 那样为某一轮 render 提供固定快照，也不需要
setter 才能修改。

“Ref 可变”不代表任意对象都可以安全变异。官方 `useRef` Caveats 特别指出：如果 Ref 持有的对象同时被
用于渲染，例如它也是 State 的一部分，就不应通过 Ref 修改这个对象。

### 3. 修改 Ref 不会触发 render

React 不知道普通 Ref 对象的 `current` 何时发生变化，因此写入不会请求新的 render。这个特征决定了 Ref
只能保存变化不需要立即反映到页面的信息。

如果一个值决定 JSX 文本、样式、属性、条件、列表或组件树，应该把它放进 State，或从当前 Props / State
派生。把 `ref.current` 放进 JSX，再等待其他更新“顺便刷新”页面，会形成过期且不可预测的界面。

### 4. Ref 能跨 render 保留

普通局部变量会在每次调用组件函数时重新创建。React 则在后续 render 中把同一个 Ref 对象交还给当前
组件实例，所以事件处理函数可以继续读取先前写入的 `current`。

官方学习文档把 Ref 和 State 都描述为能够在 re-render 之间保留信息。区别是：State setter 会安排新的
render，而 Ref 写入不会。

这个合同不包含以下保证：

- 组件卸载后再次挂载仍得到旧 Ref；
- 两个组件实例共享同一个 Ref；
- 刷新页面后仍保留 Ref；
- Ref 自动与 Props 或外部数据同步。

### 5. 普通局部变量、State 与 Ref 的选择

可以用两个问题完成判断：

```text
是否需要跨 render 保留？
├─ 否：普通局部值
└─ 是：变化是否需要进入页面输出？
   ├─ 是：State 或由 Props / State 派生
   └─ 否：Ref
```

| 能力 | 普通局部变量 | State | Ref |
| --- | --- | --- | --- |
| 跨 render 保留 | 否 | 是 | 是 |
| 修改后触发 render | 否 | 是，由 setter 排队 | 否 |
| render 是否应读取 | 可以读取本轮纯计算结果 | 可以读取当前快照 | 通常不应读取 `current` |
| 典型用途 | 本轮派生值、临时计算 | 页面可见数据 | 事件之间的非视觉工作值 |

Ref 不是“可变版 State”，也不是“更快的 State”。先判断值是否参与页面输出，再决定存储位置。

### 6. render 期间通常不能读写 Ref

React 要求组件和 Hook 保持纯净：相同 Props、State、Context 和 Hook 参数应得到相同结果，副作用不应
发生在 render 中。纯 render 让 React 能暂停、恢复、重复或放弃一次计算。

在 render 中读取一个 React 不跟踪的可变量，输出可能依赖不可见的外部变化；在 render 中写入 Ref，未
提交的计算也可能泄漏修改。官方因此要求不要在 render 期间读写 `ref.current`，并明确建议：如果 render
必须读取或写入某个值，应该使用 State。

事件处理函数不在 render 期间执行，可以读写已经创建的 Ref。官方也允许 Effect 中访问 Ref，但 Effect
不是本课知识，正文无需展开。

### 7. 一次性延迟初始化是受限例外

下面的写法只在首次 render 使用创建结果，但 JavaScript 仍会在每次执行组件函数时调用构造函数：

```tsx
const registryRef = useRef(createRegistry())
```

对创建成本较高的对象，可以先存 `null`，再使用完全可预测的初始化分支：

```tsx
const registryRef = useRef<Registry | null>(null)

if (registryRef.current === null) {
  registryRef.current = createRegistry()
}
```

官方允许这个 render 期间写入，是因为结果始终相同，且条件只在初始化时成立。它不能推广为“每次 render
都把最新 Prop 写进 Ref”，也不能包裹网络请求、日志上报、随机数或其他副作用。

### 8. Strict Mode 的开发期边界

在 Strict Mode 中，React 会在开发环境额外调用组件函数，以帮助发现意外的不纯逻辑。每个 Ref 对象会
创建两次，其中一个版本被丢弃；纯组件的可观察行为不应因此改变。

这个事实不能被讲成生产环境固定 render 次数。也不要在 render 期间执行
`renderCountRef.current += 1`：这既违反 Ref 读写边界，也不能可靠表示 commit 次数。

### 9. Rules of Hooks 仍然适用

`useRef` 必须位于函数组件或自定义 Hook 顶层，并在任何提前返回之前调用。不能在以下位置调用：

- 条件或循环；
- 嵌套函数；
- 事件处理函数；
- `try` / `catch` / `finally`；
- 条件 return 之后；
- 普通 JavaScript 函数或类组件。

事件处理函数可以操作组件顶层已经创建的 `ref.current`，但不能在点击时才调用 `useRef`。

### 10. 官方 `refs` lint 检查什么

React 19.2 的 `eslint-plugin-react-hooks` 提供 `refs` 规则。官方页面说明它用于验证 Ref 的正确使用，重点
检查：

- render 期间读取 `ref.current`；
- render 期间修改 `ref.current`；
- 用 Ref 保存本应进入 State 的界面值；
- Ref 经函数参数传递后，在被调用函数中发生的违规访问。

官方有效示例包括事件处理函数或 Effect 中访问 Ref、用 State 保存 UI 值，以及
`current === null` 守卫的一次性延迟初始化。

该规则会从 `useRef()`、`createRef()`、`ref` 参数及名称启发式推断 Ref。官方也提醒，自定义一个同样使用
`.current` 的容器可能被启发式误判；遇到这种情况应换成表达领域含义的属性名，而不是禁用真实 Ref 检查。

当前仓库没有安装 `eslint-plugin-react-hooks`，`.oxlintrc.json` 只启用了 `typescript`、`unicorn` 和
`oxc` 插件。因此官方 `refs` 规则是课程规范依据，但当前 `npm run lint` 并不会证明该规则已经执行。课程
不得把“遵守官方规则”和“仓库已自动启用该规则”写成同一件事。

## 本科教学覆盖建议

### 必须讲清

1. Ref 的对象形状：`{ current: initialValue }`。
2. 初始参数只使用一次，后续 render 返回同一个对象。
3. `current` 可变且写入立即生效。
4. 写 Ref 不触发 render，React 不跟踪其属性变化。
5. 局部变量、State、Ref 的两问选择法。
6. 页面输出不能依赖 Ref 工作值。
7. render 纯度与事件处理函数边界。
8. 完全可预测的一次性延迟初始化。
9. Strict Mode 只是开发期检查，不是 render 计数合同。
10. `useRef` 的 Hook 顶层调用规则。
11. 官方 `refs` lint 检查的典型违规，以及仓库当前未启用该规则的事实。

### 可以作为一句话边界

- 官方也允许在 Effect 中访问 Ref，但 Effect 的执行和清理不在本课展开。
- Ref 也常用于 DOM，但 DOM 节点的取得和操作不在本课展开。
- Ref 只属于当前组件实例，不是持久化或跨实例共享机制。

### 不应进入正文

- DOM 聚焦、滚动、测量和节点集合；
- Ref 转交、`forwardRef` 和命令式组件接口；
- Effect 生命周期、闭包修复和依赖管理；
- 外部状态管理、缓存、请求和持久化；
- React 内部 Hook 链表或调度实现；
- Compiler 优化推测、性能基准和“避免 render”的技巧叙事。

## 常见错误与纠正方式

### 把需要显示的值放进 Ref

```tsx
const countRef = useRef(0)
return <button onClick={() => (countRef.current += 1)}>{countRef.current}</button>
```

点击只修改普通对象，不会让 React 重新计算按钮文字。可见计数应使用 State。

### 在 JSX 中读取 `current`

```tsx
return <p>待处理：{pendingCountRef.current}</p>
```

页面输出依赖 React 不跟踪的值，可能保持过期。需要显示时，把公开快照写入 State，并让 JSX 读取 State。

### 每次 render 都写 Ref

```tsx
latestValueRef.current = value
```

这会把 render 当作必定提交的命令式过程。除一次性、完全可预测的初始化外，不应在组件函数主体写 Ref。

### 期待 `initialValue` 跟随 Prop

```tsx
const limitRef = useRef(limit)
```

后续 `limit` 变化不会自动覆盖 `current`。事件需要当前限制时直接读取当前 Prop；Ref 只适合明确需要首次
快照的场景。

### 用局部变量保存跨事件值

```tsx
let pendingCount = 0
```

组件再次 render 会重新创建局部绑定。非视觉值确实需要跨 render 保留时才使用 Ref。

### 在初始参数中反复创建昂贵对象

```tsx
const registryRef = useRef(createRegistry())
```

后续结果虽被 React 忽略，参数表达式仍会执行。改用 `null` 守卫的一次性初始化，并确保创建过程纯净。

### 在条件或事件中调用 `useRef`

```tsx
function handleClick() {
  const valueRef = useRef(0)
}
```

Hook 调用顺序必须稳定。把 `useRef` 移到组件顶层，事件函数只操作已创建的 Ref。

### 通过 Ref 变异参与渲染的共享对象

```tsx
profileRef.current.name = 'Lin'
```

如果同一个对象还被 Props、State 或 JSX 使用，这会绕过 React 的更新路径并污染旧快照。参与渲染的数据
应通过 State setter 做不可变更新。

## 当前课程正文核验

核验文件：`src/categories/frontend/react/core/learn/use-ref.md`。

### 保留

- 以“跨 render 保留，但不参与页面输出”定义 Ref 的核心用途。
- `initialValue` 只在首次 render 生效、后续返回同一对象的说明。
- 普通局部变量 / State / Ref 的三分选择模型。
- 事件处理函数中写入 Ref、通过 State 发布可见结果的示例。
- 不在 JSX 读取工作 Ref，以及不通过强制更新补救错误建模的提醒。
- Strict Mode、Rules of Hooks、实例隔离和非持久化边界。
- 七类易错示例；它们都能由本次官方来源支撑。

### 补充或收紧

- 在解释 render 纯度时直接点明“同一输入应得到同一输出”，再说明 React 可以暂停和重复 render。
- 把“除初始化外不读写 Ref”收紧为“除完全可预测、只在初始化时成立的分支外”，只把它作为
  render 读写限制的简短例外，不保留独立示例或性能优化教学。
- 明确 `refs` lint 是 `eslint-plugin-react-hooks` 的官方规则，但本仓库当前 lint 配置没有启用它。
- 提到 Ref 内对象可变时，紧接着说明：若该对象参与渲染，就不能通过 Ref 变异。
- 验收用语应观察可见数值是否变化，不应写成“整个 DOM 完全不变”，因为按钮焦点等浏览器状态不属于
  `useRef` 的更新合同。

### 删除

- 与 `useRef` 学科内容无关的旧执行编排、顺序编号、相邻条目状态和历史验收证据。
- 构建、浏览器截图、源码哈希、临时目录和复审结论等过程记录。
- “Ref 更快”“Ref 避免 render”“可变 State”等容易误导的性能或替代关系表述。
- 为说明范围而展开 DOM、Effect、组件命令式接口或外部状态管理的正文内容。

### 移动

- DOM Ref、Callback Ref、Ref 转交和命令式句柄只留在范围边界，不进入核心概念和练习。
- Effect 中可访问 Ref 只作为官方事实旁注，不提供 Effect 示例。
- 本地 lint 配置现状属于调研审计信息，不应写成学习者必须掌握的 useRef API 行为。

## 当前 Demo 核验

核验文件：

- `src/categories/frontend/react/core/demos/use-ref/use-ref-demo.tsx`
- `src/categories/frontend/react/core/demos/use-ref/use-ref-demo.css`

### 已符合官方合同

- `useRef(0)` 位于组件顶层。
- `pendingCountRef.current` 只在 `handleRecord`、`handlePublish`、`handleDiscard`、`handleReset` 事件函数中
  读写。
- JSX、`className`、样式、条件和列表都不读取 `pendingCountRef.current`。
- 点击“登记到 Ref”只增加内部工作值，不调用 State setter。
- 点击“仅更新 State”触发真实 re-render，可证明 Ref 值能跨 render 保留。
- 点击“发布批次”先读取并清空 Ref，再用函数式 State 更新公开结果。
- 点击“丢弃待发布”只清空 Ref；后续发布为 `0` 能间接观察内部值已清空。
- Demo 没有使用 JSX `ref` 属性、DOM API、Effect、计时器、请求或强制更新。
- 所有前端函数上方都有中文职责注释；CSS 未使用 `grid` 或 `gap`。

### 建议保持的可复跑观察

1. 初始四个公开数值均为 `0`。
2. 连续登记三次，四个公开数值仍为 `0`。
3. 点击一次“仅更新 State”，只有独立 State 更新数变为 `1`。
4. 点击“发布批次”，已发布批次、最近发布、累计发布分别变为 `1`、`3`、`3`，说明 Ref 经历
   re-render 后仍保留三个工作值。
5. 再登记两次，点击“丢弃待发布”后发布，最近发布为 `0`，累计发布保持 `3`。
6. 点击“重置全部”，Ref 和公开 State 都回到初始语义。

这些步骤观察的是公开数值和事件结果，不需要把 render 次数、DOM 全量差异或性能数据加入 Demo。

## 建议的正文结构

1. 用“有些值要记住，但不该立即显示”引出 Ref。
2. 解释 `useRef(initialValue)`、`current` 和同一对象。
3. 用两问选择法区分局部变量、State 与 Ref。
4. 在事件处理函数中展示 `current` 的立即读写和不触发 render。
5. 说明 JSX 不应读取工作 Ref，并用 State 发布公开快照。
6. 解释 render 纯度和官方 `refs` lint 的典型违规。
7. 用一句话说明完全可预测的一次性初始化是受限例外，不提供独立示例或性能优化教学。
8. 收束 Strict Mode、Rules of Hooks 和实例边界。
9. 通过现有 Demo 完成“登记、跨 re-render 保留、发布、丢弃、重置”的观察。
10. 用错误示例和存储位置判断题巩固。

正文始终围绕 `useRef` 的值保存语义，不借 Demo 扩展 DOM、Effect、组件接口或性能优化知识。

## 官方参考资料

1. [React Versions](https://react.dev/versions)
2. [`useRef`](https://react.dev/reference/react/useRef)
3. [Referencing Values with Refs](https://react.dev/learn/referencing-values-with-refs)
4. [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
5. [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure)
6. [`eslint-plugin-react-hooks`: `refs`](https://react.dev/reference/eslint-plugin-react-hooks/lints/refs)
