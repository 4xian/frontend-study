# Callback Ref 研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.intermediate.callback-refs`
- 标题：Callback Ref
- 教学层级：零基础到进阶
- 核验日期：`2026-08-10`
- 研究状态：官方事实、课程边界、课程实现、工程 Gate、浏览器验收与独立双轴复审均已完成
- 官方文档基线：React `19.2`
- 仓库实现基线：React / React DOM `19.2.8`
- RC2 路线 TypeScript 基线：`7.0.2`
- 本地验证基线：TypeScript `6.0.3`、`@types/react` `19.2.18`
- 前置课程：`react.core.learn.intermediate.dom-refs`
- 路线状态：第 1-17 课为 `available`，第 18-29 课保持 `planned`
- 下一课边界：第 18 课 `react.core.learn.intermediate.ref-as-prop`

本课只回答一条主线：组件怎样使用 Callback Ref，把数量会变化的宿主节点按稳定条目 ID 登记到
`Map`，并在节点替换或移除时成对删除旧记录。

Callback Ref 是 React 提交宿主节点时调用的登记与清理接口。列表数据和可见结构仍由 State 与 JSX
声明；`Map` 只保存当前已提交宿主节点的索引，不参与渲染，也不成为第二份列表数据源。

## 调研问题与范围冻结

### 调研问题

1. Callback Ref 在节点接入时收到什么参数，可以返回什么？
2. 节点被替换或卸载时，React 怎样触发 cleanup？
3. React 19 返回 cleanup 后，旧的 `node === null` 调用还有什么兼容边界？
4. 为什么不能在 `items.map()` 中为每个条目调用 `useRef`？
5. 怎样用一个 Ref 中的 `Map` 按稳定 ID 索引数量未知的宿主节点？
6. 增加和删除列表项时，`Map` 怎样与当前已提交 DOM 保持一致？
7. JSX `key` 与 `Map` key 各自负责什么，为什么都应来自稳定数据 ID？
8. 重新 render 传入不同 Callback Ref 时，旧 callback 和新 callback 按什么合同交接？
9. Strict Mode 为什么在开发环境额外执行一次 setup 与 cleanup？
10. React 19 TypeScript 为什么拒绝会隐式返回赋值结果或 `Map` 的 ref callback？

### 课程必须覆盖

- Callback Ref 是传给宿主 JSX `ref` 属性的函数；节点接入时 React 以 DOM 节点调用它。
- React 19 的 Callback Ref 可以返回 cleanup；节点移除或 ref callback 被替换时，React 调用旧 cleanup。
- 返回 cleanup 的 callback 在卸载时不会再收到 `null`；未返回 cleanup 时的 `null` 回调只是兼容行为，
  官方说明未来会移除。
- 不在循环、条件或 `map()` 回调中调用 `useRef`；组件顶层只创建一个保存 `Map` 的 Ref。
- 每个动态列表项使用稳定数据 ID，同时作为 JSX `key` 和节点 `Map` 的索引。
- setup 执行 `map.set(item.id, node)`，返回的 cleanup 执行 `map.delete(item.id)`，两者必须成对。
- 新条目提交到 DOM 后 setup 才登记节点；条目删除、节点替换或 callback 变化时先清理旧登记。
- 不把 Callback Ref 的调用次数当业务信号；内联 callback 在重新 render 时可能发生 cleanup 与重新 setup。
- Strict Mode 在开发环境为每个 Callback Ref 额外运行一次 setup + cleanup，以暴露不对称清理。
- React 19 TypeScript 写法使用块函数体；除有意返回 cleanup 外，不得隐式返回赋值结果或 `Map.set()`。
- 修改 Ref 中的 `Map` 不触发重新渲染；可见验证只在明确用户事件中读取并保存普通 State 快照。

### 明确排除

- 不让自定义组件接收或转交 `ref`，不讲 React 19 ref as prop 或 `forwardRef`；这些属于第 18 课。
- 不讲 `useImperativeHandle`，不向父组件暴露自定义命令式接口；这些属于第 19 课。
- 不使用 `useEffect`、Effect cleanup、Effect 生命周期、依赖数组或 Effect Event；这些属于第 20-26 课。
- 不使用 `useLayoutEffect` 做绘制前测量；这些属于第 28 课。
- 不用 `useCallback`、缓存 callback 或调用次数对比展开性能优化。
- 不把节点集合放进 Context、外部 Store、缓存层或服务端状态。
- 不用 `querySelectorAll()` 重新扫描父节点，不用数组下标或随机值作为节点身份。
- 不把 DOM 节点、`Map` 或 cleanup 函数放入 State，不在 render 中读取节点集合。
- 不引入 Portal、第三方 DOM 库、Observer、请求、定时器、动画或性能 API。
- 不创建课程 Markdown、Demo、manifest 登记或第 18 课资产。

## Tavily 检索与官方原文核验

外部关键词检索严格使用 Tavily，并限制到 `react.dev`。7/7 组 Search 均成功；部分 React 19 Upgrade
Guide 结果先返回官方本地化页面，但同时找到 canonical 英文页面。所有搜索摘要仅用于发现候选 URL，
没有作为课程事实证据，也没有切换 Exa、Parallel、Perplexity 或原生搜索。

### Search 检索词

1. `site:react.dev React 19.2 callback ref Map dynamic list add remove cleanup`
2. `site:react.dev/blog/2024/04/25/react-19-upgrade-guide ref callback cleanup TypeScript implicit return`
3. `site:react.dev/reference/react/StrictMode ref callback extra setup cleanup development`
4. `site:react.dev/reference/react-dom/components/common ref callback cleanup different callback unmount`
5. `site:react.dev callback ref node null cleanup React 19`
6. `site:react.dev/learn/rendering-lists key index stable ID reorder list React`
7. `site:react.dev ref callback set state infinite loop different callback render`

### Extract 与 canonical 原文核验

Tavily `extract` 分 2 批读取 6 个官方 URL 的 `Raw Content`。取得候选页后，再通过 canonical URL 直接
请求 react.dev 的 Markdown 原文，逐段核对动态 `Map` 示例、Callback Ref API、Strict Mode、React 19
cleanup 和 TypeScript 迁移说明。`useRef` 与 Rendering Lists 页面由官方正文链接进入后同样直接核验。

## 候选来源处理

### 采用来源

| 来源 | URL | 采用理由 | 适用版本 |
| --- | --- | --- | --- |
| React Versions | https://react.dev/versions | 确认 react.dev 当前文档版本 | React 19.2 |
| Manipulating the DOM with Refs | https://react.dev/learn/manipulating-the-dom-with-refs#how-to-manage-a-list-of-refs-using-a-ref-callback | 动态列表、单个 Map、setup 的 `set` 与 cleanup 的 `delete` | React 19.2 |
| Common components: ref callback | https://react.dev/reference/react-dom/components/common#ref-callback | Callback Ref 参数、返回值、卸载、callback 变化与兼容 `null` 合同 | React DOM 19.2 |
| StrictMode | https://react.dev/reference/react/StrictMode#fixing-bugs-found-by-re-running-ref-callbacks-in-development | 开发环境额外 setup + cleanup 及缺失清理的可观察后果 | React 19.2 |
| React 19 Upgrade Guide | https://react.dev/blog/2024/04/25/react-19-upgrade-guide#ref-cleanup-required | React 19 TypeScript 隐式返回歧义与迁移写法 | React 19 |
| React v19 | https://react.dev/blog/2024/12/05/react-19#cleanup-functions-for-refs | cleanup 新增、卸载调用及返回 cleanup 后跳过 `null` | React 19 |
| Rendering Lists | https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key | 插入、删除、重排时使用稳定数据 ID 保持条目身份 | React 19.2 |
| useRef | https://react.dev/reference/react/useRef | Ref 可保存任意值，修改 `current` 不触发 render | React 19.2 |
| useState | https://react.dev/reference/react/useState | State setter 请求重新 render，用于核验 callback 写 State 的反馈环 | React 19.2 |

### 排除来源

| 候选 | 排除理由 |
| --- | --- |
| React 官方本地化页面 | 只采用 canonical 英文页，避免翻译进度或锚点差异 |
| React 18 与更旧的 callback ref 示例 | React 19 才新增返回 cleanup；旧版不能证明当前返回值合同 |
| React 内部 Fiber、commit 源码与测试 | 公共文档已完整定义本课行为，不需要把内部顺序写成承诺 |
| `forwardRef`、ref as prop 页面 | 属于第 18 课，不把跨组件 ref 边界带入当前课 |
| `useImperativeHandle` | 属于第 19 课，不自定义父组件可见 handle |
| Effect 与 `useLayoutEffect` 页面 | 当前节点登记由 ref callback 自身完成，不引入同步 Hook |
| MDN `Map`、DOM 查询与滚动页面 | 课程不教授 Map 或 DOM API 本身；它们不能证明 React 生命周期 |
| Stack Overflow、博客和搜索摘要 | 非 React 官方一手来源，不支撑任何课程事实 |

## 版本边界

React Versions 明确 react.dev 当前最新文档版本为 React `19.2`。仓库当前安装 React / React DOM
`19.2.8`，处于同一 minor 的公共文档合同内；本地 `@types/react` 为 `19.2.18`。RC2 路线冻结
TypeScript `7.0.2`，本地编译器为 `6.0.3`，但“ref callback 不得返回 cleanup 以外的值”来自 React 19
类型迁移合同，不是 TypeScript 7 新语法。

返回 cleanup 是 React 19 新能力。React 19.2 为兼容旧代码，仍会在 callback 没有返回 cleanup 时以
`null` 调用它；官方已说明该兼容行为未来会移除。本课因此教授显式返回 cleanup，不把 `node === null`
分支当作长期清理合同。

本课只依赖公开的 attach、detach、callback 更换和 Strict Mode 开发行为，不依赖 Fiber 字段、commit
内部函数名、固定 render 次数或浏览器绘制顺序。React major、Callback Ref API 或类型声明变化时必须
重新核验。

## 官方事实

### 1. Callback Ref 的 setup 与 cleanup

宿主元素接入屏幕时，React 以 DOM 节点调用 Callback Ref。React 19 允许 callback 返回一个可选
cleanup；节点移除时 React 调用该 cleanup。它是节点登记的 setup / cleanup 接口，不是用户事件。

### 2. 动态节点集合使用单个 Ref 中的 `Map`

Manipulating the DOM with Refs 明确指出，数量未知的列表不能在 `map()` 内逐项调用 `useRef`，因为 Hook
只能在组件顶层调用。官方替代方案是把函数传给每项的 `ref`，用一个 Ref 保存数组或 `Map`；示例在 setup
执行 `map.set(cat, node)`，并在返回的 cleanup 中执行 `map.delete(cat)`。

### 3. 增加、删除与旧节点清理发生在提交边界

Common components API 规定节点接入时执行 setup、节点移除时执行 cleanup。由此，列表增加条目并提交
宿主节点后才会进入 `Map`；删除条目或替换宿主节点时，旧节点的 cleanup 删除旧登记。render 期间的列表
数据不等同于已经提交的节点集合。

### 4. 不同 callback 会触发旧清理与新登记

当一次 render 传入不同的 Callback Ref 函数时，React 会先调用旧 callback 返回的 cleanup；若旧 callback
没有 cleanup，则以 `null` 调用旧 callback。随后 React 再以 DOM 节点调用新 callback。内联函数每次 render
都是不同函数，因此课程代码必须允许重复 cleanup 与 setup，不能假设“每个节点只登记一次”。

### 5. 返回 cleanup 后不再依赖 `null`

React v19 发布说明明确：组件卸载时会调用 Callback Ref 返回的 cleanup；如果 callback 返回了 cleanup，
React 会跳过过去以 `null` 再次调用 ref 函数的步骤。未返回 cleanup 时的 `null` 调用仅用于向后兼容，未来
版本计划废弃。

### 6. Strict Mode 会在开发环境额外压力测试

StrictMode API 明确：开发环境会为每个 Callback Ref 额外运行一次 setup + cleanup。修正后的官方示例
观察到集合大小按“登记到预期数量、清空到 0、重新登记到预期数量”变化；缺失 cleanup 的版本会持续
累积节点，形成生产缺陷并破坏定位行为。

### 7. React 19 TypeScript 拒绝非 cleanup 返回值

React 19 Upgrade Guide 明确指出，因为 ref callback 现在可以返回 cleanup，TypeScript 会拒绝其他返回值。
`current => (instance = current)` 会隐式返回 `HTMLDivElement`，类型系统无法判断它是否被误当作 cleanup；
修复通常是改用块函数体，只在确实需要时显式返回 cleanup。

### 8. 稳定条目身份与 Ref 的非渲染性质

Rendering Lists 说明插入、删除和重排时，稳定 `key` 帮助 React 对应数据条目与 DOM；数组下标和临时随机
值会造成身份错配或重建。`useRef` API 同时说明修改 `ref.current` 不触发 render，因此节点 `Map` 只适合
保存命令式索引，不适合直接驱动可见列表或计数。

## 官方事实到课程推导

### 推导 1：一个顶层 Ref 管理整组动态节点

- **官方事实：** Hook 不能在 `map()` 内调用；官方动态列表示例用一个 Ref 保存 `Map`。
- **课程推导：** 组件顶层创建 `useRef(new Map<ItemId, HTMLLIElement>())`，每项 Callback Ref 只负责该
  ID 的 `set` 与 `delete`。
- **边界：** `Map` 不是列表 State，也不在 render 中读取；本课不比较数组与 Map 的性能。

### 推导 2：数据 ID 同时连接 React 身份与节点索引

- **官方事实：** 稳定 `key` 帮助 React 在插入、删除和重排时对应条目；Callback Ref 可按 ID 访问节点。
- **课程推导：** 使用同一个 `item.id` 作为 JSX `key` 与 `Map` key，让数据条目、宿主节点和查询目标可追踪。
- **边界：** `key` 决定 React 的列表身份，`Map` key 只服务课程的节点查询；两者职责不能互相替代。

### 推导 3：setup 与 cleanup 必须成对修改同一个 `Map`

- **官方事实：** 节点接入时 React 调用 callback，节点移除时调用其返回的 cleanup。
- **课程推导：** setup 捕获本条目的稳定 ID 和当前 `Map`，执行 `set`；cleanup 对同一 ID 执行 `delete`。
- **边界：** 不在 cleanup 中更新列表 State，不把 cleanup 扩展为 Effect、订阅或外部资源生命周期。

### 推导 4：增加和删除用 DOM 证据验证，不靠 render 猜测

- **官方事实：** Callback Ref 的调用与宿主节点 attach / detach 相连，Ref 修改本身不触发 render。
- **课程推导：** Demo 先用 State 声明增加或删除条目，再由 Callback Ref 自动维护 `Map`；用户点击“检查
  集合”时读取当前 `Map` 并保存普通字符串快照。
- **边界：** 不在 State setter 下一行断言新节点已经登记，不使用 Effect、`flushSync` 或计时器等待提交。

### 推导 5：每一次 setup 都应能被 cleanup 完整撤销

- **官方事实：** 不同 callback 会触发旧 cleanup 与新 setup，Strict Mode 还会增加开发期 setup + cleanup。
- **课程推导：** 课程只验证最终 `Map` 与当前 DOM 条目一致，不断言 callback 的固定调用次数；重复周期后
  集合仍应回到相同内容。
- **边界：** 不为减少 callback 次数引入 `useCallback` 或缓存策略，也不把 Strict Mode 行为描述为生产次数。

### 推导 6：React 19 主路径显式返回 cleanup

- **官方事实：** 返回 cleanup 后，卸载时 React 调用 cleanup 并跳过旧的 `null` 回调；无 cleanup 的
  `null` 路径只是兼容行为。
- **课程推导：** 正确示例在非空节点 setup 后直接返回删除该条目登记的函数，不依靠 `else` 分支清理。
- **边界：** callback 参数类型仍可能包含 `null`；代码可以窄化它，但不能把兼容 `null` 当长期生命周期。

### 推导 7：块函数体消除 TypeScript 返回值歧义

- **官方事实：** React 19 类型只接受无返回值或 cleanup；赋值表达式和 `Map.set()` 会返回其他值。
- **课程推导：** setup 使用花括号执行语句，只有 `return () => { ... }` 表示 cleanup。
- **边界：** 这是 React 19 Callback Ref 返回类型的迁移要求，不延伸为通用箭头函数风格课程。

## 基础用法

下面的写法只创建一个节点 `Map`。每个列表项用稳定 ID 登记当前宿主节点，并返回删除同一 ID 的 cleanup：

```tsx
import { useRef } from 'react'

type Item = {
  id: string
  label: string
}

type ItemListProps = {
  items: Item[]
}

/** 使用 Callback Ref 维护当前已提交列表项的节点索引。 */
export function ItemList({ items }: ItemListProps) {
  const itemNodesRef = useRef(new Map<string, HTMLLIElement>())

  /** 为一个稳定条目 ID 创建成对登记和清理节点的 Callback Ref。 */
  function createItemRef(itemId: string) {
    return (node: HTMLLIElement | null) => {
      if (node === null) {
        return
      }

      itemNodesRef.current.set(itemId, node)

      return () => {
        itemNodesRef.current.delete(itemId)
      }
    }
  }

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id} ref={createItemRef(item.id)}>
          {item.label}
        </li>
      ))}
    </ul>
  )
}
```

`createItemRef` 每次 render 会产生新函数，因此 React 可以清理旧 callback 再 setup 新 callback。该过程是
公开合同内的正确行为；成对 `set` / `delete` 保证最终 `Map` 仍只含当前宿主节点。本课不通过缓存 callback
来改变这条主线。

## 完整易错点

### 1. 在 `map()` 中逐项调用 `useRef`

- **错误名称：** 循环中的 Hook Ref。
- **触发条件：** 为每个动态条目在 `items.map()` 回调内执行 `useRef(null)`。
- **原因：** Hook 只能在函数组件或自定义 Hook 顶层调用，动态列表数量还会改变调用次数。
- **后果：** 违反 Hooks 调用顺序，构建或运行期检查失败，节点集合也无法稳定对应条目。
- **错误示例：** `{items.map((item) => { const ref = useRef(null); return <li ref={ref} /> })}`。
- **正确示例：** 顶层创建一个保存 `Map` 的 Ref，每项通过 Callback Ref 执行 `set` 并返回 `delete` cleanup。
- **适用版本：** React 19.2；Hooks 顶层规则同样适用于更早版本。
- **来源：** Manipulating the DOM with Refs 的动态列表 Deep Dive。

### 2. 用数组下标同时充当 `key` 与节点索引

- **错误名称：** 位置冒充条目身份。
- **触发条件：** 可插入、删除或重排的列表使用 `key={index}`，并用同一 index 存取节点 `Map`。
- **原因：** 数组位置会随列表操作改变，不是条目的稳定身份。
- **后果：** 数据条目可能对应旧位置的 DOM 节点，定位、聚焦或删除登记命中错误目标。
- **错误示例：** `<li key={index} ref={createItemRef(String(index))}>...</li>`。
- **正确示例：** 数据创建时生成稳定 `item.id`，并写成 `<li key={item.id} ref={createItemRef(item.id)}>`。
- **适用版本：** React 19.2；动态列表稳定 key 规则同样适用于更早版本。
- **来源：** Rendering Lists；Manipulating the DOM with Refs。

### 3. 只登记节点而不返回 cleanup

- **错误名称：** 只增不减的节点 `Map`。
- **触发条件：** Callback Ref 只执行 `map.set(item.id, node)`，删除条目时没有对应 `map.delete()`；或只依赖
  旧式 `node === null` 分支作为长期方案。
- **原因：** 忽略节点移除、callback 更换和 Strict Mode 都会要求撤销先前 setup；`null` 回调只是 React 19
  的向后兼容行为。
- **后果：** 已移除节点仍留在集合中，集合大小持续增长，节点查询命中过期 DOM；Strict Mode 会更早暴露累积。
- **错误示例：** `ref={(node) => { if (node) itemNodesRef.current.set(item.id, node) }}`。
- **正确示例：** setup 执行 `set` 后返回 `() => { itemNodesRef.current.delete(item.id) }`。
- **适用版本：** React 19.2；返回 cleanup 从 React 19 开始支持。
- **来源：** Common components: ref callback；StrictMode；React v19。

### 4. 让 `Map.set()` 从 Callback Ref 隐式返回

- **错误名称：** cleanup 返回值歧义。
- **触发条件：** 用表达式箭头函数写 `ref={(node) => itemNodesRef.current.set(item.id, node!)}`，或隐式返回
  一次赋值。
- **原因：** `Map.set()` 返回 `Map`，赋值表达式返回被赋的值；React 19 类型只能接受无返回值或 cleanup。
- **后果：** TypeScript 拒绝 JSX `ref`，或开发者误把非函数返回值当成可忽略结果。
- **错误示例：** `ref={(node) => itemNodesRef.current.set(item.id, node!)}`。
- **正确示例：** 使用块函数体执行 `set`，再显式 `return () => { itemNodesRef.current.delete(item.id) }`。
- **适用版本：** React 19 对应的 TypeScript 类型；当前核验基线为 React 19.2。
- **来源：** React 19 Upgrade Guide 的 `ref` cleanups required。

### 5. 在 Callback Ref 中用 State 保存节点集合

- **错误名称：** 登记回调驱动重新 render。
- **触发条件：** callback 收到节点后执行 `setRegisteredNodes(...)`，把 DOM 节点数组写入 State。
- **原因：** State 更新会请求重新 render；内联 callback 随之变为新函数，React 又执行旧 cleanup 与新 setup，
  形成额外甚至持续的更新循环。
- **后果：** 新 State 值持续触发 render，而新的内联 callback 又触发 cleanup / setup，形成持续更新循环；
  Strict Mode 下问题更容易暴露。
- **错误示例：** `ref={(node) => { if (node) setNodes((current) => [...current, node]) }}`。
- **正确示例：** Callback Ref 只维护 Ref 中的 `Map`；如需可见证据，在独立按钮事件中读取 ID 列表并保存
  普通字符串快照。
- **适用版本：** React 19.2。
- **来源：** Common components: ref callback；useRef；useState；StrictMode。

## 课程正文合同

正文应按以下顺序完成唯一主线：

1. 从“动态列表数量未知，不能为每项预先声明对象 Ref”引出 Callback Ref。
2. 定义节点接入时的 setup、返回 cleanup 和 React 19 的 `null` 兼容边界。
3. 解释为什么不能在 `map()` 内调用 `useRef`，改为顶层一个 Ref 保存 `Map`。
4. 使用稳定数据 ID 同时连接 JSX `key` 与节点 `Map`，区分两种 key 的职责。
5. 写出 `map.set(id, node)` 与 `return () => map.delete(id)` 的最小 TSX。
6. 通过增加条目观察 setup 后登记，通过删除条目观察 cleanup 后旧 ID 消失。
7. 说明不同 callback 会重新 cleanup / setup，代码不得依赖固定调用次数。
8. 用 Strict Mode 的额外开发周期检查清理对称性，不把它描述为生产调用次数。
9. 单独解释 React 19 TypeScript 隐式返回歧义，并改为块函数体。
10. 明确 ref as prop、`useImperativeHandle`、Effect、外部 Store、缓存和性能优化的后续边界。

正文不得使用“Callback Ref 只运行一次”“卸载一定以 `null` 调用”“Map 变化会刷新页面”“数组下标就是
条目 ID”或“Strict Mode 的调用次数就是生产行为”等绝对表述。不得出现自定义组件 ref 转交、
`forwardRef`、`useImperativeHandle`、Effect、`useLayoutEffect`、外部 Store、请求缓存或性能优化教学。

## 确定性同源 Demo 设计

建议同源 Demo 使用一个“动态节点登记台”，列表数据与节点索引职责分开：

1. 固定候选数据包含 5 个稳定 ID，初始显示前 3 项；不使用时间、随机数或网络生成身份。
2. `items` State 决定当前 JSX 列表；`itemNodesRef` 只保存 `Map<string, HTMLLIElement>`。
3. 每项以同一稳定 ID 作为 JSX `key` 和 `Map` key；setup 登记节点，cleanup 删除登记。
4. “添加下一项”从固定候选中加入首个未显示条目；“移除已选项”从 State 删除当前选择。
5. “检查集合”在点击事件中读取当前 `Map` 的有序 ID 和每个节点的 `data-item-id`，保存普通字符串快照。
6. “定位已选项”通过 `Map.get(selectedId)` 取得当前节点并聚焦；列表项使用 `tabIndex={-1}`。
7. 可见证据只展示 State 快照、当前选择和操作结果，不在 render 中直接读取 `Map`。

不在 Callback Ref 中调用 State setter。不同 render 导致的 cleanup / setup 和 Strict Mode 额外周期都不得
留下重复或过期 ID。不使用 Effect、`useLayoutEffect`、`flushSync`、`useCallback`、Promise、timer、
Observer、请求、外部 Store、缓存或性能 API。展示源码与运行源码必须来自同一个 TSX 文件。

### 可复跑行为

1. 初始列表精确显示 3 个稳定 ID；首次点击“检查集合”得到同样 3 个 ID，节点 ID 全部匹配。
2. 点击“添加下一项”后 DOM 变为 4 项；再点击“检查集合”，`Map` 精确包含新增 ID 且大小为 `4`。
3. 选择新增项并点击“定位已选项”后，该 `<li>` 成为浏览器 active element，可见结果显示命中的稳定 ID。
4. 点击“移除已选项”后 DOM 回到 3 项；再次检查时被删 ID 不存在，其他 3 个 ID 各出现一次。
5. 触发只改变选择的重新 render 后再次检查，集合内容不增加；证明 cleanup / setup 周期保持对称。
6. 继续添加到 5 项、逐项删除到 1 项再恢复，检查结果始终与当前 DOM 的稳定 ID 集合一致。

## 未来验收合同

### 静态与行为验收

1. **Hook 检查：** `useRef` 只在组件顶层调用；`map()`、循环、条件和事件中没有 Hook。
2. **身份检查：** JSX `key` 与 `Map` key 都来自稳定数据 ID，不使用 index、随机数或临时序号。
3. **登记检查：** 每个 setup 只向一个 Ref `Map` 执行一次 `set`，并返回对同一 ID 的 `delete` cleanup。
4. **React 19 检查：** 主清理路径不依赖 `node === null`；注释和正文准确保留兼容与未来废弃边界。
5. **TypeScript 检查：** Callback Ref 不隐式返回赋值、节点、`Map` 或其他值，只返回 `void` 或 cleanup。
6. **State 边界：** callback 内不调用 State setter；State 不保存 DOM 节点、`Map` 或 cleanup 函数。
7. **阶段检查：** render 不读取节点 `Map`；只在 Callback Ref 和明确用户事件中访问它。
8. **范围检查：** 不包含 ref as prop、`forwardRef`、`useImperativeHandle`、Effect、`useLayoutEffect`、
   `flushSync`、外部 Store、缓存或性能优化。
9. **行为路径：** 初始检查、增加、定位、删除、普通重新 render 和完整增减序列符合可复跑行为。
10. **同源检查：** 展示源码与运行 TSX 去除约定末尾空白后的字符数、UTF-8 字节数和 SHA-256 一致。

### 浏览器与工程验收

1. **桌面：** Playwright 在 1440px 复跑完整增减与定位路径，DOM ID 和 `Map` 快照逐步一致。
2. **移动：** 在 390px 复跑同一路径，页面与 Demo 无横向溢出，按钮和列表文字无裁切。
3. **200% 文本：** 在 390px + 根字号 32px 复跑；控件换行后仍可操作，证据文本不覆盖或越界。
4. **Strict Mode：** 开发会话中额外 setup + cleanup 不造成重复或过期 ID，不断言固定 callback 次数。
5. **Console：** 使用全新浏览器会话收集 `console error / warning` 与 page error，目标均为 `0`。
6. **源码同源：** 浏览器展开“查看源码”后提取文本，与运行 TSX 比较字符数、UTF-8 字节和 SHA-256。
7. **工程 Gate：** `npm run type-check`、`npm run lint`、`npm run format:check`、`npm run build`、
   `npm run test:unit`、`npm run test:e2e` 与 scoped `git diff --check` 全部通过。
8. **临时资产：** fixture、runner、截图、trace 和浏览器输出只放 `/tmp`，验证后删除并确认目录不存在。
9. **独立复审：** Standards 与 Spec 两轴都达到 `PASS / 0 finding` 后才可把第 17 课标为 `available`。

样式只能使用 Flexbox、margin 和正常文档流，不使用 CSS Grid、`gap`、负字距或随视口宽度缩放字号。
新增函数和组件上方必须有简洁、规范的中文职责注释。

## 拆课判断

本课维持一个知识点。Callback Ref 的 setup / cleanup、单个 `Map` 的动态宿主节点索引、列表增减、
旧节点清理、Strict Mode 压力测试和 React 19 TypeScript 返回值合同，共同服务“让节点集合与已提交 DOM
保持一致”这一条心智模型，不需要继续拆分。

第 18 课 ref as prop 负责 React 19 自定义组件的接收与转交；第 19 课 `useImperativeHandle` 负责收窄父组件
可调用的命令式接口。第 20-26 课处理 Effect 同步生命周期，第 28 课处理绘制前布局测量。当前课不得借
任一后续能力扩大范围。

## 待闭环证据

- [x] 完成 Tavily 候选检索并回到 React 19.2 官方 canonical 原文核验。
- [x] 冻结 Callback Ref、动态 `Map`、增加 / 删除、旧节点 cleanup、Strict Mode 和 TypeScript 合同。
- [x] 冻结 5 个字段完整的高价值易错点及逐条三段式课程推导。
- [x] 创建第 17 课课程 Markdown，正文严格遵守唯一主线和排除项。
- [x] 创建确定性同源 TSX Demo 与必要 CSS，不创建第 18 课资产。
- [x] 完成 entry manifest 与 demo manifest 登记；双轴复审通过后 track 已登记第 17 课为 `available`。
- [x] 补齐桌面、390px 与 390px + 200% 文本的完整 `3 -> 5 -> 1 -> 恢复` 路径。
- [x] 完成同一复审者双轴复核，Standards 与 Spec 均为 `PASS / 0 finding`。
- [x] 双轴达到 `PASS / 0 finding` 后原子登记第 17 课为 `available`、回填 `17/29` 并进入第 18 课。

首轮独立复审结论为 Standards 1 项、Spec 2 项 finding：发布状态早于复审；计划只记录了基础
`3 -> 4 -> 3` 路径，未完整记录两种视口下的 `3 -> 5 -> 1 -> 恢复`。第 17 课先保持为
`planned / 16/29`，待复审通过后再登记。三种视口现均已验证 `3 -> 5 -> 4 -> 3 -> 2 -> 1 -> 恢复 3`，每一步
Map 与 DOM ID 一致；定位、单项删除禁用、无横向溢出与 `0 error / 0 warning` 也已通过。同一复审者
最终确认 Standards 与 Spec 均为 `PASS / 0 finding`，第 17 课已按合同登记为 `available`。

## 官方参考资料

1. [React Versions](https://react.dev/versions)
2. [Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs#how-to-manage-a-list-of-refs-using-a-ref-callback)
3. [Common components: ref callback](https://react.dev/reference/react-dom/components/common#ref-callback)
4. [StrictMode](https://react.dev/reference/react/StrictMode#fixing-bugs-found-by-re-running-ref-callbacks-in-development)
5. [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#ref-cleanup-required)
6. [React v19](https://react.dev/blog/2024/12/05/react-19#cleanup-functions-for-refs)
7. [Rendering Lists](https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key)
8. [useRef](https://react.dev/reference/react/useRef)
9. [useState](https://react.dev/reference/react/useState)
