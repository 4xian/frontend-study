# useCallback 与函数身份研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.advanced.use-callback-function-identity`
- 标题：`useCallback` 与函数身份
- 教学层级：本科高级
- 前置课程：A02“`useMemo` 与值缓存”、A03“`memo` 与组件跳过渲染”
- 核验日期：`2026-08-17`
- 官方文档基线：React `19.2`
- 运行时基线：React / React DOM `19.2.8`
- 固定文档提交：`reactjs/react.dev@383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a`
- 固定运行时提交：`facebook/react@1dd4ecbdabf826f527fc9a58c05ea70375b7d170`

本课只回答一条主线：当测量已经证明一个 `memo` 子组件因为函数 Prop 每次获得新引用而重复
render 时，怎样用 `useCallback` 在依赖未变的 render 之间复用函数身份，并在依赖变化时取得读取
最新响应值的新函数。

必须覆盖：

1. `useCallback(fn, dependencies)` 返回什么，以及 React 不会调用 `fn`。
2. 初次 render、依赖未变和依赖变化时分别返回哪一个函数。
3. 响应值依赖、固定长度内联数组和逐项 `Object.is` 比较。
4. 函数表达式仍会在 render 中创建，`useCallback` 只决定返回哪个函数身份。
5. 新函数 Prop 如何破坏 `memo` 的默认 bailout，以及其他新 Prop 仍会破坏整条优化链。
6. updater function 只在 State 仅用于计算下一份 State 时缩减该 State 依赖。
7. Effect 依赖优先通过移动函数和重写代码消除，`useCallback` 是仍需共享函数身份时的次级选择。
8. 自定义 Hook 返回函数时如何为调用方提供可优化的接口。
9. Strict Mode、缓存丢弃和“性能优化而非语义保证”的准确边界。

明确排除：A02 `useMemo` 的完整教学、A03 `memo` 的完整教学、自定义 comparator、React Compiler
配置与迁移、服务端组件 / RSC、服务端 `cache`、请求缓存、数据获取、外部 store 和持久化。相邻 API
只保留理解 A04 所必需的接口边界，不展开第二条教学主线。

## 调研方法与证据等级

1. 按仓库顺位先用 Tavily 搜索 `react.dev`，成功发现并抽取 React 19.2 `useCallback` 官方页；搜索
   摘要只负责候选发现，课程结论回到官方原文核验。
2. 对 `reactjs/react.dev` 直接按指定 commit 获取 `useCallback`、`memo`、`useMemo`、Removing Effect
   Dependencies、Reusing Logic with Custom Hooks、`StrictMode` 和 React Compiler Introduction 的固定
   blob，避免官网滚动更新改变证据。
3. 对 `facebook/react` 直接按指定 commit 获取 `ReactHooks.js`、`ReactFiberHooks.js` 和
   `objectIs.js`。同一提交中的 `packages/react/package.json`、`packages/react-dom/package.json` 与
   `ReactVersion.js` 均标记 `19.2.8`。
4. 公共课程结论以 React 文档为主；源码只解释指定版本的 Dispatcher、Hook 槽位、依赖比较与
   Strict Mode 调用路径，不把 Fiber 实现升级成跨版本 API 保证。
5. 本记录是课程生产依据，可以保存版本、源码与验证证据；学习者正文不得出现提交哈希、调研工具、
   Gate、构建、复审或完成度叙事。

## 官方来源卡

| 编号 | 一手来源 | 本课采用的事实 |
| --- | --- | --- |
| S1 | [`useCallback` Reference](https://react.dev/reference/react/useCallback) | React 19.2 当前公共 API、参数、返回值、依赖、使用场景与 caveat。 |
| S2 | [固定 `useCallback` API](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react/useCallback.md#L27-L60) | `fn` 只被返回而不被调用；完整响应值依赖；固定长度内联数组；`Object.is`；顶层 Hook；精确缓存丢弃边界。 |
| S3 | [固定 `useCallback`、`useMemo` 与 `memo` 边界](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react/useCallback.md#L174-L244) | `useMemo` 缓存计算结果，`useCallback` 缓存函数本身；只有存在身份消费者时才值得缓存；函数仍会创建。 |
| S4 | [固定 updater、Effect 与自定义 Hook 用法](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react/useCallback.md#L669-L809) | updater 缩减 State 依赖；Effect 优先移入函数；自定义 Hook 推荐缓存返回函数。 |
| S5 | [固定 `memo` 文档](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react/memo.md#L27-L125) | `memo` 是组件 Props 优化且非保证；普通新函数会让 Props 总是不同。 |
| S6 | [固定 `memo` Props 最小化](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react/memo.md#L276-L328) | 默认逐 Prop 使用 `Object.is`；传给记忆化组件的函数可在组件外声明或用 `useCallback` 缓存。 |
| S7 | [固定 `useMemo` 文档](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react/useMemo.md#L27-L61) | `useMemo` 会调用纯计算函数并缓存结果；Strict Mode 会额外调用该计算函数，与 `useCallback` 不调用回调形成边界。 |
| S8 | [固定 Removing Effect Dependencies](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/learn/removing-effect-dependencies.md#L174-L276) | Effect 依赖描述代码读取的全部响应值；要删依赖，先修改周围代码并证明它不再是依赖。 |
| S9 | [固定对象与函数 Effect 重构](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/learn/removing-effect-dependencies.md#L900-L1067) | 无响应输入的函数移出组件；动态对象和函数优先移入 Effect。 |
| S10 | [固定 Reusing Logic with Custom Hooks](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/learn/reusing-logic-with-custom-hooks.md#L444-L452) | 自定义 Hook 共享有状态逻辑而不共享 State；其代码随组件 render 重跑并读取最新 Props/State。 |
| S11 | [固定 `StrictMode` 文档](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react/StrictMode.md#L23-L94) | 开发期额外 render、Effect 和 Ref callback 检查；这些检查不影响生产构建。 |
| S12 | [固定 React Compiler Introduction](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/learn/react-compiler/introduction.md#L19-L60) | Compiler 可在构建期自动记忆化；额外箭头函数仍能破坏手写函数 Prop 记忆化。仅作排除项。 |
| S13 | [固定 `ReactHooks.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/ReactHooks.js#L135-L140) | 公共 `useCallback` 入口把 `callback` 与 `deps` 转交当前 Dispatcher。 |
| S14 | [固定依赖比较](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js#L454-L500) | 开发期检查依赖长度，固定版本按索引调用内部 `is` 逐项比较。 |
| S15 | [固定 callback/memo 分支](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js#L2896-L2961) | `useCallback` 只保存/返回函数；`useMemo` 另行调用计算函数，二者执行语义不同。 |
| S16 | [固定 `objectIs.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/shared/objectIs.js#L10-L24) | 当前版本优先使用原生 `Object.is`，否则使用同语义 polyfill。 |

## 官方事实与课程推导

### 1. 定义、签名与返回值

```tsx
const cachedFn = useCallback(fn, dependencies)
```

`fn` 可以接收任意参数并返回任意值。初次 render 时，`useCallback` 原样返回本次传入的 `fn`；后续
render 中，如果每一项依赖都与上次相同，返回上一次保存的函数，否则返回并保存本次传入的函数。
React 不会因为调用 `useCallback` 而执行 `fn`，何时、是否调用由组件或调用方决定（S1、S2）。

因此，本科课程可用定义是：**`useCallback` 缓存的是函数身份，不是函数执行结果，也不是阻止函数
创建的语法。** 组件每次 render 仍会求值函数表达式；依赖命中时 React 忽略这个新函数并返回旧引用
（S3、S15）。

如果省略第二个参数，React 每次 render 都返回本次的新函数，不能形成身份复用。空数组则表示回调
没有读取任何会随 render 变化的响应值；它不是“强制永久稳定”的开关。

### 2. 依赖数组是闭包输入合同

依赖必须包含回调读取的所有响应值：Props、State，以及组件函数体中声明的变量和函数。数组必须
直接写成固定长度的内联字面量，项目顺序也应稳定（S2、S14）。

```tsx
const handleSave = useCallback(
  (draft: Draft) => saveDraft(projectId, locale, draft),
  [projectId, locale],
)
```

`draft` 是调用时参数，不是闭包依赖；`projectId` 和 `locale` 来自组件 render，必须列入。漏项会让
React 在依赖表面未变时返回旧函数，使调用方读到旧闭包。运行时只比较给出的数组，不会分析函数体
并补齐依赖；完整性由 linter、代码审查和验证负责。

比较规则是按相同位置逐项使用 `Object.is`，不是深比较。对对象、数组和函数，内容看似相同但引用
不同仍判定变化；`Object.is(NaN, NaN)` 为 `true`，`Object.is(0, -0)` 为 `false`（S2、S14、S16）。

### 3. 函数 Prop 如何影响 `memo` bailout

父组件 render 中直接声明的普通函数每次都是新引用。`memo` 默认逐 Prop 使用 `Object.is`，因此新函数
Prop 会被判定为变化，即使函数体文本完全相同（S5、S6）。

```tsx
const ReportToolbar = memo(function ReportToolbar({ onSave }: Props) {
  return <button onClick={onSave}>保存</button>
})

// 父组件每次 render 都给出新引用，ReportToolbar 没有函数 Prop bailout 机会。
<ReportToolbar onSave={() => saveReport(reportId)} />

// reportId 未变时，onSave 可以保持同一引用。
const onSave = useCallback(() => saveReport(reportId), [reportId])
<ReportToolbar onSave={onSave} />
```

这里有三个必要边界：

1. 子组件必须存在会消费函数身份的优化边界，例如已经合理使用 `memo` 的昂贵子组件。
2. 子组件收到的其他 Props 也要保持相同；任一总是新建的对象、数组或包装箭头函数仍会破坏 bailout。
3. `useCallback` 不会阻止父组件 render，也不会阻止子组件自己的 State 或 Context 更新。

所以“给函数套 Hook”不是收益证据。只有相同交互下测得子组件重复工作，并观察到稳定函数确实恢复了
bailout 机会，才有理由保留这项优化（S3、S5）。

### 4. updater function 只缩减一种 State 读取

当回调读取某个 State 的唯一目的，是根据它计算下一份同一 State，可以把“当前值”改成传给 setter
的 updater instruction，从而不再闭包外层 State（S4）：

```tsx
const handleAdd = useCallback((newTodo: Todo) => {
  setTodos((currentTodos) => [...currentTodos, newTodo])
}, [])
```

这不等于可以任意删除 `todos`。如果回调还要根据 `todos` 判断上限、记录内容、生成返回值或传给别的
API，它仍然读取外层 State，必须保留依赖。updater 缩减的是实际不再读取的输入，而不是绕过依赖规则。

### 5. Effect 依赖优先重构

如果一个函数只在某个 Effect 中使用，首选把函数定义移入该 Effect；如果它不读取组件响应值，首选
移出组件。这样依赖数组直接描述 `roomId` 等真正输入，不需要额外维护函数身份（S4、S8、S9）。

```tsx
useEffect(() => {
  function createOptions() {
    return { serverUrl, roomId }
  }

  const connection = createConnection(createOptions())
  connection.connect()
  return () => connection.disconnect()
}, [serverUrl, roomId])
```

只有函数还必须被多个调用方共享，或它的身份确实是另一个 Hook 的输入时，才把 `useCallback` 作为
次级选择。课程不教学生“先包 `useCallback` 再压制 linter”，也不把缓存身份当成 Effect 永不重新同步
的语义保证。

### 6. 自定义 Hook 返回函数的接口边界

React 官方建议自定义 Hook 用 `useCallback` 包裹它返回的函数，使调用方在需要时可以优化自己的代码
（S4）。依赖仍要包含函数读取的全部响应值：

```tsx
function useReportActions(dispatch: Dispatch) {
  const save = useCallback(
    (reportId: string) => dispatch({ type: 'save', reportId }),
    [dispatch],
  )

  return { save }
}
```

这个合同只保证 `save` 在 `dispatch` 未变时可保持身份；每次创建的返回对象 `{ save }` 本身并不会因此
自动稳定。A04 不展开如何缓存返回对象。自定义 Hook 的函数体仍随使用它的组件一起 render，并读取最新
Props 与 State；每次调用自定义 Hook 也拥有独立的 Hook 状态（S10）。

### 7. Strict Mode 与缓存失效的准确边界

`StrictMode` 在开发期会额外调用组件函数体来发现不纯 render，也会额外检查 Effect 和 Ref callback。
固定文档还明确指出 `useMemo` 的纯计算函数会额外调用（S7、S11）。这不能类推为
“`useCallback` 会调用两次 callback”：公共入口和 mount/update 实现只保存或返回传入函数，没有执行
callback 的路径（S13、S15）。组件函数体额外 render 会再次创建函数表达式，但只有事件或调用方真正
调用返回函数时才会运行其业务代码。

官方 `useCallback` caveat 只明确给出以下当前缓存丢弃情形（S2）：

- 开发环境编辑组件文件时，React 丢弃缓存；
- 开发和生产环境中，组件在初次挂载时 suspend，React 丢弃这次挂载的缓存。

未来虚拟列表可能丢弃离开视口项目的缓存只是官方举例的未来可能性，不是 React 19.2 已承诺的当前
行为。Strict Mode 本身也不能写成固定清空 `useCallback` 缓存的条件。

### 8. 性能优化，不是语义存储

业务正确性不能依赖函数引用永远不变。删除 `useCallback` 后，功能结果仍必须正确；差异只能是是否
出现不必要的 render 或 Hook 重执行。需要保存业务状态用 State，需要跨 render 保存可变值用 Ref，不能
把 `useCallback` 当资源句柄、唯一 ID、订阅所有权或持久缓存（S2、S3、S5）。

先确认交互存在可感知或可测量的重复工作，再在相同输入、相同构建和相同交互路径下比较优化前后。
开发期 Strict Mode 日志数量不是生产性能结论；函数身份相同也不能单独证明用户体验已经改善。

## 相邻 API 的接口边界

| API | 缓存或优化对象 | A04 只采用的接口事实 | 本课排除内容 |
| --- | --- | --- | --- |
| `useCallback` | 函数本身 | 依赖未变时可返回旧函数身份，React 不执行该函数 | 无 |
| `useMemo` | 调用计算函数得到的结果 | 用来对照“缓存结果”与“缓存函数本身” | A02 的纯计算、对象/数组缓存、测量与完整用法 |
| `memo` | 组件的 Props 更新入口 | 默认 Props 比较会观察函数引用，稳定函数可恢复 bailout 机会 | A03 的完整 State/Context 边界、自定义 comparator 与完整优化教学 |
| React Compiler | 构建期自动记忆化 | 只说明它可能减少手写记忆化需求 | 配置、安装、迁移、指令和编译输出教学 |

服务端/RSC、服务端 `cache` 与请求缓存解决的是不同生命周期和数据共享问题，不进入函数 Prop 身份
课程，也不得借用“缓存”一词把它们混为一谈。

## 常用场景

1. 已测得的昂贵 `memo` 子组件接收函数 Prop，父组件的无关 State 更新使普通函数引用反复变化。
2. 一个函数确实是另一个 Hook 的依赖，并且在优先重构后仍需要跨调用方共享函数身份。
3. 自定义 Hook 返回命令函数，希望调用方可以把该函数传入记忆化组件或作为 Hook 依赖。
4. 记忆化回调只读取 State 来计算下一份 State，可用 updater 消除这项闭包读取。

若不存在身份消费者、组件更新不昂贵、依赖几乎每次都变化，或一个其他 Prop 始终是新引用，直接声明
普通函数通常更清楚。

## 易错点账本

正文覆盖八个不重复的高价值错误。每项均按“错误名称 -> 触发条件 -> 原因 -> 后果 -> 错误示例 ->
正确示例 -> 适用版本 -> 来源”记录，正文再提供完整解释和验证动作：

| 错误名称 | 触发条件 | 原因 | 后果 | 错误示例 | 正确示例 | 适用版本 | 来源 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 把 `useCallback` 当成执行函数或缓存执行结果 | 把 Hook 返回值当成已执行结果，或为了缓存计算结果包裹函数 | React 只返回函数定义，不会在 Hook 调用时执行它 | 结果没有更新，或为了没有收益的身份缓存增加依赖维护 | `<code>const total = useCallback(() => sum(items), [items])</code>` | `<code>const handleTotal = useCallback(() => onTotal(sum(items)), [items, onTotal])</code>` | React 19.2 | [useCallback](https://react.dev/reference/react/useCallback) |
| 省略依赖数组却期待稳定身份 | 调用 `useCallback(fn)`，再把返回值传给 `memo` 子组件 | 没有第二个参数时没有缓存复用条件，每次返回本次函数 | 函数 Prop 仍变化，子组件继续获得 render 机会 | `<code>useCallback(() => refresh())</code>` | `<code>useCallback(() => refresh(), [])</code>`（确认无 reactive value） | React 19.2 | [useCallback](https://react.dev/reference/react/useCallback) |
| 用 `[]` 隐瞒回调读取的 Props/State | 回调读取 `reportId`，却为了保持身份写成空数组 | 旧函数继续闭包首次 render 的值，依赖合同被破坏 | 页面显示新报告，点击保存却操作旧报告 | `<code>useCallback(() => save(reportId), [])</code>` | `<code>useCallback(() => save(reportId), [reportId])</code>` | React 19.2 | [useCallback](https://react.dev/reference/react/useCallback) |
| 在条件、循环、嵌套函数或事件处理器内调用 Hook | 根据分支或列表项改变 `useCallback` 的调用次数 | Hook 调用顺序无法在 render 间保持一致 | 状态槽位错位，违反 Rules of Hooks | `<code>if (canSave) useCallback(save, [])</code>` | `<code>const save = useCallback(() => { if (canSave) submit() }, [canSave])</code>` | React 19.2 | [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks) |
| 已缓存函数却又传入包装箭头函数或其他新对象 Prop | 缓存回调后再次写 `() => cached()`，或同时创建新对象 Prop | `memo` 比较的是最终收到的引用，包装函数和对象仍然每次变化 | bailout 链继续失效，缓存函数没有减少子组件工作 | `<code>&lt;Toolbar onSave={() =&gt; cachedSave()} options={{ compact: true }} /&gt;</code>` | `<code>&lt;Toolbar onSave={cachedSave} options={stableOptions} /&gt;</code>` | React 19.2 | [memo](https://react.dev/reference/react/memo) |
| 把 updater 当成删除所有 State 依赖的通用技巧 | 只把 `setState` 改成 updater，却仍在回调外层读取 State | updater 只接管下一状态计算，不能替代日志、判断或其他读取 | 其他输入陈旧，或依赖数组继续不完整 | `<code>useCallback(() => { setItems(xs =&gt; [...xs, item]); log(items) }, [])</code>` | `<code>useCallback(() => setItems(xs =&gt; [...xs, item]), [item])</code>` | React 19.2 | [Updating state in a callback](https://react.dev/reference/react/useCallback#updating-state-from-a-memoized-callback) |
| Effect 出现函数依赖就立即套 `useCallback` | 只为压低 Effect 运行次数而把局部函数移到 Hook 外并缓存 | 缓存层没有消除真实同步输入，反而增加依赖合同 | 代码更难读，Effect 可能仍因其他输入重复同步 | `<code>const createOptions = useCallback(() =&gt; ({ roomId }), [roomId]); useEffect(connect, [createOptions])</code>` | `<code>useEffect(() =&gt; connect({ roomId }), [roomId])</code>` | React 19.2 | [Removing Effect dependencies](https://react.dev/learn/removing-effect-dependencies) |
| 宣称 Strict Mode 双调 callback，或缓存永不失效 | 用 render 日志推断 callback 被调用，或把引用当永久业务身份 | 混淆额外 render、缓存函数返回和显式调用；官方允许特定场景丢弃优化缓存 | 业务正确性依赖性能优化，或把开发期日志误当生产结论 | `<code>registry.set(handleSave, reportId)</code>` | `<code>registry.set(reportId, { canSave: true })</code>`，事件中显式调用函数 | React 19.2 | [useCallback caveats](https://react.dev/reference/react/useCallback#caveats) |

## Demo 合同

正式 Demo ID：

`react.core.learn.advanced.use-callback-function-identity.callback-bailout-demo`

Demo 使用同一个 `memo` 工具栏组件形成两个实例。普通实例接收父组件 render 中直接创建的保存函数；
缓存实例接收以“报告版本”为真实依赖的 `useCallback` 保存函数。除函数身份外，两个实例的标量 Props、
确定性工作量和渲染记录方式保持一致。

确定性交互合同：

1. 冷挂载后两个工具栏各产生一次真实 `mount` commit 记录。
2. 清空记录不会安排两个被测工具栏重新 render。
3. 点击“仅更新父组件”后，普通实例新增一次 commit，缓存实例保持零条。
4. 点击“修改报告版本”后，两边都新增一次 commit，因为普通函数和缓存函数都得到新引用。
5. 点击两个保存按钮时，都显示当前报告版本，证明依赖变化后缓存实例没有保留旧闭包。
6. 再次清空并重复无关父更新，仍能观察普通实例更新、缓存实例跳过的同一路径。

每个工具栏内部放置 Profiler，被测分支的 `onRender` 只写入固定 Ref 日志，不用日志 State 反向触发
被测 render。Demo 不使用 `useMemo`、自定义 comparator、Effect、Context、网络、timer、随机数、异步
延迟、React Compiler 或请求缓存；运行代码和源码展示读取同一 TSX/CSS 文件。

## 验证合同

### 静态与类型验证

- Markdown 保留稳定课程 ID、标题、八个完整易错点和唯一 Demo ID。
- TSX 必须包含一处真实 `useCallback`、一个 `memo` 工具栏的两个实例，以及普通函数/缓存函数对照。
- `useCallback` 依赖只包含回调真实读取的响应值；不得用禁用 lint 或伪造空数组隐藏读取。
- 扫描 TSX/CSS，拒绝 `useMemo`、自定义 comparator、Effect、Compiler、网络、timer、随机数、CSS
  Grid、`gap` 和非零 `letter-spacing`。
- TypeScript 只能证明 Props、回调参数和 Ref 类型，不能证明函数身份命中、`memo` 一定跳过或优化有收益。
- 需要自动化验证时，只在 `/tmp` 创建最小临时资产，成功后删除，不在仓库保留测试文件或 fixture。

### 浏览器可观察路径

1. 在同一正式深链完成 `mount -> 清空 -> 仅更新父组件 -> 修改报告版本 -> 点击保存`。
2. 清空后的计数路径应为 `0/0 -> 1/0 -> 2/1`；普通实例在前，缓存实例在后。
3. 两个保存结果都显示修改后的版本；再次无关父更新不改变缓存实例的回调结果。
4. 展开源码可看到当前运行的 TSX 与 CSS，不出现禁区 API 或复制源码。
5. `1440x900`、`390x844` 与 `390x844 + 32px` 根字号下无横向溢出、遮挡或按钮文字裁切。
6. 全路径 console error/warning 和失败请求均为零；开发期额外 render 不当成 callback 被调用的证据。

## 独立复审清单

### Standards

- 单课只讲 `useCallback` 的函数身份与依赖，没有重教 A02、A03 或 Compiler。
- 结论逐项绑定 React 官方文档或指定固定源码，不使用搜索摘要和社区文章证明事实。
- 学习者正文没有本地依赖、版本提交、调研、Gate、构建、复审或完成度叙事。

### Spec

- API 返回值、React 不执行 callback、依赖/`Object.is`、updater、Effect 重构与自定义 Hook 边界准确。
- 新函数 Prop 可观察地破坏 bailout，依赖未变时缓存函数恢复机会，依赖变化时得到最新闭包。
- Strict Mode 和缓存失效只写官方可证明的准确边界，未来 virtualization 明确标为可能性。
- 服务端/RSC、请求缓存、自定义 comparator 和 Compiler 配置均未进入课程或 Demo。

两轴必须在同一冻结 snapshot 达到 `PASS / 0 finding`。
