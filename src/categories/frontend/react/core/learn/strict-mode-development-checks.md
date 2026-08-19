---
id: react.core.learn.intermediate.strict-mode-development-checks
type: lesson
title: StrictMode
summary: 用开发期额外检查暴露不纯渲染、资源清理缺失、Ref 清理缺失和弃用 API。
domain: frontend
technology: react
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 60
prerequisites:
  - react.core.learn.intermediate.custom-hooks
related:
  - react.core.learn.basics.component-purity
  - react.core.learn.intermediate.use-effect
  - react.core.learn.intermediate.dom-refs
tags:
  - React
  - StrictMode
  - 纯渲染
  - Effect cleanup
  - Ref cleanup
  - 开发诊断
appliesTo: React 19.2
verifiedAt: 2026-08-17
objectives:
  - 能在整个应用或局部子树上启用 StrictMode，并说明检查作用域。
  - 能解释额外 render 检查针对哪些应保持纯净的函数，不把它理解成用户事件重复发生。
  - 能根据额外 Effect setup 与 cleanup 暴露的现象修复资源泄漏。
  - 能为 Callback Ref 写出对称的 setup 与 cleanup，避免节点集合残留。
  - 能正确处理 StrictMode 产生的弃用警告，并定位应用代码或依赖中的来源。
  - 能区分开发诊断行为和生产业务语义，不依赖调用次数实现功能。
recap:
  - StrictMode 不渲染额外界面，也不接收配置 Props；它为包裹子树启用开发期检查。
  - 额外 render 用来暴露不纯计算；组件、初始化器、updater 和 reducer 等应纯函数必须可安全重复执行。
  - 根级 StrictMode 会为 Effect 和 Callback Ref 增加开发期 setup 与 cleanup 检查，最终资源状态应与正常挂载一致。
  - 事件处理器不会因为额外 render 检查而自动执行两次，业务逻辑不能依赖 render 或 Effect 的精确调用次数。
  - 局部 StrictMode 的初次 Effect 行为与根级作用域不同；已经处于 StrictMode 子树内的组件不能自行退出。
  - 所有额外检查都不在生产环境运行，但被检查暴露的纯度、清理和弃用问题仍是真实缺陷。
sources:
  - title: StrictMode
    url: https://react.dev/reference/react/StrictMode
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 额外 render、Effect、Ref callback 与弃用 API 四类开发期检查
      - 根级和局部作用域差异、无 Props 与不可在子树内退出的边界
  - title: Keeping Components Pure
    url: https://react.dev/learn/keeping-components-pure
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Props、State 与 Context 只读，以及局部 mutation 的合法边界
      - 重复调用如何暴露修改既有数组或外部变量的不纯渲染
  - title: Components and Hooks must be pure
    url: https://react.dev/reference/rules/components-and-hooks-must-be-pure
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 幂等、render 无副作用与不修改非局部值的纯度要求
  - title: useEffect
    url: https://react.dev/reference/react/useEffect
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 开发期额外 setup 与 cleanup 压力检查及对称清理要求
  - title: React 19 Ref Cleanup
    url: https://react.dev/blog/2024/12/05/react-19#cleanup-functions-for-refs
    sourceType: official-reference
    appliesTo: React 19
    claims:
      - Callback Ref 返回 cleanup 的运行合同和 TypeScript 返回值边界
  - title: React 19.2.8 StrictMode Test
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react/src/__tests__/ReactStrictMode-test.internal.js#L84-L104
    sourceType: official-test
    appliesTo: React 19.2.8
    claims:
      - 固定版本测试记录 StrictMode 下函数组件的开发期额外 render
---

# StrictMode

## 一、学习目标

- 在应用根部或局部组件树中正确放置 `<StrictMode>`。
- 说清额外 render、Effect 重连、Callback Ref 重设和弃用检查各自发现什么问题。
- 从重复界面、重复连接、残留节点和 console 警告反推错误所在阶段。
- 修复 render 中的非局部 mutation、缺失的 Effect cleanup 和缺失的 Ref cleanup。
- 让开发检查前后的最终 UI 与资源状态保持一致。
- 不把开发调用次数写进业务条件、统计、计费或用户可见结果。

## 二、为什么需要

很多 React 缺陷在第一次挂载时不会立刻出现：修改 Props 数组的组件可能先显示正常，缺少 cleanup 的连接在页面
第一次打开时也只有一个，Callback Ref 忘记删除节点时列表暂时还不大。等到组件重新渲染、路由切换或节点反复加入
和移除后，问题才变成重复内容、资源泄漏或错误引用。

`StrictMode` 主动在开发环境增加一组检查，让这些问题更早出现。它不是错误边界，也不会替应用修复代码；它只把
本来需要多次交互才容易观察到的缺陷放大。正确做法是根据现象修复纯度或清理，而不是关闭检查隐藏现象。

## 三、核心概念

### 1. 它是没有可见输出的边界

`StrictMode` 是 React 内置组件。它接受 `children`，不接受用来开关单项检查的 Props，也不会额外生成 DOM：

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const root = createRoot(document.getElementById('root')!)

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

边界内的所有后代都会接受对应检查，无论嵌套多深。一个后代组件不能声明“退出 StrictMode”；要缩小范围，只能把
`<StrictMode>` 移到更低的共同父级。

### 2. 四类开发期检查

React 19.2 的公共文档列出四类行为：

1. 额外调用应保持纯净的 render 逻辑，用来暴露不纯渲染。
2. 额外运行 Effect 的 setup 与 cleanup，用来暴露缺失或不对称的 Effect cleanup。
3. 额外运行 Callback Ref 的 setup 与 cleanup，用来暴露节点登记没有撤销。
4. 检查 StrictMode 子树是否使用已弃用的 API，并在开发 console 中发出警告。

它们的共同目标不是规定调用次数，而是检查代码能否安全地重复计算、建立资源和撤销资源。

### 3. 不变量比次数重要

稳定的判断标准是最终不变量：

- 相同 Props、State 和 Context 得到相同 JSX。
- 一个挂载的聊天室只保留一份活跃连接。
- 当前列表有几个已挂载节点，Ref 集合就只保留几个节点。
- 用户点击一次只产生一次业务动作。

开发环境可能增加内部调用，React 的未来版本也可能调整诊断细节。只要代码依赖上述不变量，而不是依赖日志出现
几次，它就能承受重复检查。

## 四、启用范围

### 1. 根级启用

新应用通常在 `createRoot(...).render(...)` 的最外层启用 StrictMode。这样应用内的组件、Effect 和 Callback Ref
处于同一个诊断范围：

```tsx
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

根级边界能够执行完整的开发检查。框架负责创建 React root 时，应查看框架自己的配置入口，避免另外创建第二个 root。

### 2. 局部启用

迁移旧应用时，可以先包裹一部分子树：

```tsx
function App() {
  return (
    <>
      <LegacyHeader />
      <StrictMode>
        <AccountWorkspace />
      </StrictMode>
      <LegacyFooter />
    </>
  )
}
```

这里 `AccountWorkspace` 及其后代接受检查，`LegacyHeader` 和 `LegacyFooter` 不在范围内。局部迁移可以缩小
一次修复的代码面，但不应把边界频繁移动来追逐警告；边界应与明确的组件所有权范围一致。

### 3. 局部边界的初次 Effect 差异

如果 StrictMode 没有位于应用根部，React 不会在该局部边界初次挂载时额外重跑 Effect。原因是只重跑子组件 Effect、
却不重跑父组件 Effect，不是生产环境可能出现的父子顺序。

这不表示局部边界失效。额外 render、Ref 和弃用检查仍按 React 当前公共规则工作；Effect 也仍须拥有正确 cleanup，
因为依赖变化和真实卸载都会调用它。需要完整观察初次 Effect 压力检查时，应在根部启用 StrictMode。

## 五、额外 render 检查

### 1. 哪些函数应当纯净

StrictMode 会在开发环境额外调用本来就应保持纯净的函数，包括：

- 函数组件的顶层函数体，不包括稍后由用户触发的事件处理器。
- 传给 `useState` 的 initializer。
- 传给 State setter 的 updater。
- 传给 `useReducer` 的 reducer 和 initializer。
- 传给 `useMemo` 的计算函数。
- 类组件中部分同样要求纯净的生命周期和 render 方法。

其中一次计算结果会被忽略。代码不能通过“只有一次结果会提交”来容忍副作用，因为被忽略的调用仍然执行了普通
JavaScript，修改外部数组、发送请求或写日志都已经发生。

### 2. 事件处理器不会被 render 检查重复触发

点击处理器只有在用户点击时才运行。下面的业务动作可以放在事件中：

```tsx
function SaveButton() {
  function handleSave() {
    saveDraft()
  }

  return <button onClick={handleSave}>保存</button>
}
```

组件函数可能被额外调用，`handleSave` 的函数对象也会重新创建，但 React 不会因此自动调用它。不要把“组件函数调用
两次”扩大成“所有组件内代码都会执行两次”。

### 3. 修改 Props 会暴露重复结果

下面的组件直接修改传入数组：

```tsx
type Story = Readonly<{ id: string; title: string }>

function StoryList({ stories }: { stories: Story[] }) {
  stories.push({ id: 'create', title: '新建故事' })
  return <ul>{stories.map((story) => <li key={story.id}>{story.title}</li>)}</ul>
}
```

`stories` 在组件调用前已经存在，第一次 render 把占位项写入原数组，额外 render 又写入一次。修复方式是创建新数组，
或把固定项直接写在 JSX 中：

```tsx
function StoryList({ stories }: { stories: readonly Story[] }) {
  const visibleStories = [...stories, { id: 'create', title: '新建故事' }]
  return <ul>{visibleStories.map((story) => <li key={story.id}>{story.title}</li>)}</ul>
}
```

`readonly` 能阻止直接调用 `push`，展开语法创建的局部数组只属于当前 render。重复计算得到相同结果。

### 4. 局部 mutation 仍然可以使用

纯渲染禁止修改非局部值，不等于禁止所有赋值。下面的数组在当前组件函数内部创建，没有被之前的 render 或其他组件
持有，因此可以在返回前局部修改：

```tsx
function NumberList({ count }: { count: number }) {
  const items = []
  for (let value = 1; value <= count; value += 1) {
    items.push(<li key={value}>{value}</li>)
  }
  return <ul>{items}</ul>
}
```

判断重点是对象的所有权和生命周期：如果对象来自 Props、State、Context、模块变量或之前的调用，就不能在 render
中修改；如果对象刚在当前 render 中创建且没有逃逸，局部组装不会污染下一次调用。

### 5. 不要在 render 中执行外部动作

网络请求、DOM 写入、订阅、计时器、持久化和全局计数都具有可观察副作用，不能放在组件顶层。由具体用户动作触发的
操作放进事件处理器；由组件可见状态与外部系统同步的操作放进 Effect，并提供 cleanup。

## 六、Effect 重连检查

### 1. 开发期压力序列

根级 StrictMode 下，React 会在第一次真实 setup 前增加一次开发期 setup 与 cleanup。可把观察序列写成：

```text
setup（开发检查） -> cleanup（开发检查） -> setup（当前真实同步）
```

这不是“两次挂载”的业务事件，也不能作为发送两次埋点的理由。它检查 cleanup 是否完整撤销 setup，使最后一次 setup
得到与直接 setup 相同的资源状态。

### 2. 缺少 cleanup 会留下重复资源

```tsx
useEffect(() => {
  const connection = createConnection(roomId)
  connection.connect()
}, [roomId])
```

第一次 setup 建立连接后没有可调用的 cleanup。额外 setup 又建立一份连接，活跃数量变成两份。正确写法返回只释放
当前闭包资源的函数：

```tsx
useEffect(() => {
  const connection = createConnection(roomId)
  connection.connect()

  return () => {
    connection.disconnect()
  }
}, [roomId])
```

检查序列结束后，建立次数和释放次数可以不同，但活跃连接仍应只有一份。切换 `roomId` 时也应先释放旧房间，再建立
新房间。

### 3. cleanup 必须镜像 setup

常见资源与撤销动作包括：

| setup | cleanup |
| --- | --- |
| `addEventListener(type, handler)` | 使用相同 type 和 handler 调用 `removeEventListener` |
| `setInterval(callback, delay)` | 对同一个 ID 调用 `clearInterval` |
| `subscribe(listener)` | 调用本次订阅返回的 `unsubscribe` |
| `connection.connect()` | 对同一个 connection 调用 `disconnect()` |
| 打开对话框或媒体状态 | 恢复 setup 改变的外部状态 |

cleanup 不能依赖“当前最新”的资源猜测旧对象，也不能使用清空全部监听器的操作影响其他组件。

### 4. `useRef` 开关不能代替 cleanup

```tsx
const connectedRef = useRef(false)

useEffect(() => {
  if (connectedRef.current) return
  connectedRef.current = true
  connect(roomId)
}, [roomId])
```

这个开关只隐藏第二次 setup，没有在依赖变化或组件卸载时释放旧连接；`roomId` 改变后还可能拒绝连接新房间。正确
修复是让每次 setup 取得自己的资源并返回 cleanup，而不是阻止 React 检查。

### 5. 用户不应感知检查序列

判断 cleanup 是否完整的实用规则是：用户不能分辨“setup 一次”和“setup -> cleanup -> setup”。如果开发环境出现
闪烁、重复订阅、重复弹窗或两条连接，先检查 Effect 是否承担了错误职责，再检查 cleanup 是否镜像 setup。

## 七、Callback Ref 检查

### 1. Callback Ref 也有 setup 和 cleanup

Callback Ref 常用于登记动态节点。React 19 允许 callback 在收到节点时返回 cleanup：

```tsx
function registerItem(node: HTMLLIElement) {
  visibleItems.add(node)

  return () => {
    visibleItems.delete(node)
  }
}

function Item({ label }: { label: string }) {
  return <li ref={registerItem}>{label}</li>
}
```

节点传入 callback 是 setup，返回函数是 cleanup。根级 StrictMode 会额外执行这组过程，帮助暴露只添加不删除的集合。

### 2. 动态列表必须删除同一个记录

节点集合通常按稳定数据 ID 保存：

```tsx
function registerItem(id: string, node: HTMLLIElement) {
  itemMap.set(id, node)

  return () => {
    itemMap.delete(id)
  }
}
```

cleanup 闭包记录了本次 setup 的 `id` 与 `node`。如果 ID 可能被新节点替换，可以在删除前确认 Map 中仍是同一节点，
避免旧 cleanup 删除新记录。核心仍是“一次登记对应一次撤销”。

### 3. 返回值必须明确

React 19 的 Ref callback 可以返回 cleanup 或不返回值。不要用隐式赋值返回 DOM 节点：

```tsx
// 错误：赋值表达式会返回 node。
<input ref={(node) => (inputNode = node)} />

// 正确：大括号明确丢弃赋值结果。
<input ref={(node) => {
  inputNode = node
}} />
```

TypeScript 会拒绝既不是 cleanup 也不是 `void` 的返回值。需要 React 19 cleanup 时显式 `return () => { ... }`。

### 4. Inline callback 的身份变化是另一个问题

每次 render 新建的 inline Ref callback 可能导致旧 callback 被清理、新 callback 被设置。这个行为与 StrictMode 的
额外检查可以同时出现。诊断时先保证 setup/cleanup 正确，再判断是否确实需要稳定 callback 身份；不要只根据 console
行数猜测是哪一种原因。

## 八、弃用 API 检查

### 1. 警告会沿子树暴露

StrictMode 会检查其后代对已弃用 React API 的使用。React 19.2 文档明确列出的主要对象是旧类组件中的
`UNSAFE_` 生命周期方法，例如 `UNSAFE_componentWillMount`。现代函数组件通常不会直接使用这些方法，但旧代码或
第三方依赖仍可能包含。

### 2. 根据警告定位所有者

处理步骤应当是：

1. 阅读完整警告和组件栈，确定最接近的组件名称。
2. 检查该组件来自应用源码还是依赖包。
3. 应用源码按当前 API 文档迁移，不用重命名或过滤 console 隐藏警告。
4. 依赖包先查当前版本是否已经修复，再评估升级、替换或向维护者报告。
5. 修复后保留 StrictMode，重新进入触发路径确认警告消失。

弃用警告不是生产崩溃证明，也不等于可以永久忽略；它表示代码依赖的接口已不再推荐，后续升级风险更高。

## 九、开发与生产边界

### 1. 额外检查不会在生产环境运行

StrictMode 的额外 render、Effect、Ref 和弃用检查只在开发环境运行，不影响生产行为。`<StrictMode>` 可以保留在
组件树中，不需要通过环境变量手动删除。

开发与生产的差异只说明诊断行为不进入生产，不说明开发中暴露的问题是假的。修改 Props、遗漏 cleanup 和使用弃用
API 都可能在真实交互、重新挂载或未来升级中导致生产缺陷。

### 2. 生产环境也没有“只调用一次”合同

关闭额外检查不等于 React 承诺组件函数、Effect 或 Ref callback 在整个生命周期只调用一次。State 更新、Props 变化、
条件渲染、key 变化和真实卸载都会触发正常的重新计算或清理。业务代码只依赖输入、提交结果和资源不变量。

### 3. console 次数不是验收标准

React DevTools 可能把第二次 render 的 `console.log` 显示为较淡颜色，也可以选择隐藏这类日志。日志显示策略不改变
组件行为。不要用日志行数驱动条件，也不要把某个版本观察到的精确次数写成公共 API。

### 4. StrictMode 不是完整正确性证明

通过 StrictMode 只说明当前交互没有触发它能发现的部分问题。它不能替代类型检查、静态规则、单元测试、真实浏览器
流程、错误边界或资源监控，也不会自动检查所有业务不变量。

## 十、诊断流程

### 1. 先按症状定位阶段

| 症状 | 优先检查 | 常见修复 |
| --- | --- | --- |
| 列表项、编号或全局计数重复 | render 顶层代码 | 不修改 Props/State/Context/模块对象；改用局部新值 |
| 初次进入出现两份连接、监听或计时器 | Effect setup | 返回只释放本轮资源的 cleanup |
| 节点 Map 数量不断增加 | Callback Ref | setup 登记，cleanup 删除同一记录 |
| console 出现弃用警告 | 组件栈和依赖版本 | 迁移应用 API，或升级/替换依赖 |
| 点击一次业务动作发生两次 | 事件绑定与 Effect 职责 | 确认是否重复绑定，不归因于 render 双调用 |

### 2. 保留最小可重复路径

先记录触发步骤和最终不变量，例如“进入页面后活跃连接应为 1”“移除列表项后 Map 数量应减少 1”。再减少无关组件，
但保留根级 StrictMode。去掉 StrictMode 只能让症状暂时变弱，不能证明问题消失。

### 3. 修复后重复同一反馈环

修复 render mutation 后重复触发重新渲染；修复 Effect 后重新挂载并切换依赖；修复 Ref 后反复添加、移除和重排节点；
修复弃用 API 后重新进入原组件路径。最终验证的是数据、资源与节点集合，而不是 console 是否安静。

## 十一、用法示例或 Demo

下面的 Demo 在根级 StrictMode 宿主中运行。故事列表每次 render 都从只读数据创建新数组；聊天室 Effect 每次 setup
取得自己的连接并返回 cleanup。普通重新渲染不会改变连接次数，切换房间会先释放旧连接再建立新连接。

:::demo{id="react.core.learn.intermediate.strict-mode-development-checks.resource-symmetry-demo"}
:::

观察顺序：

1. 初次进入后，开发环境可能显示额外 setup 与 cleanup，但活跃连接保持 `1`。
2. 点击“触发普通重新渲染”，用户动作增加一次，故事数量不变，Effect 计数不变。
3. 切换房间，setup 与 cleanup 各增加一次，活跃连接仍为 `1`。
4. 点击“重置观察”，组件使用新的 key 重新挂载，所有可见计数回到新实例的开发期初始状态。

## 十二、易错使用提示

:::pitfalls
### 错误：关闭 StrictMode 解决重复现象

**触发条件：** 看到重复列表或连接后，直接删除根部 `<StrictMode>`。

**原因：** StrictMode 放大了已有的不纯渲染或清理缺失，不是缺陷来源。

**后果：** 开发现象暂时减少，真实重新渲染、依赖变化或重新挂载时仍会出错。

**错误示例：**

```tsx
root.render(<App />)
```

**正确写法：** 保留诊断边界，并修复被检查暴露的纯度或 cleanup 问题。

```tsx
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**验证方式：** 保留 StrictMode，重复原交互后 UI 与资源不变量仍成立。

### 错误：把事件处理器当成自动双调用对象

**触发条件：** 点击一次保存出现两次请求，就认定 StrictMode 调用了两次 `onClick`。

**原因：** 额外 render 检查调用组件顶层和其他应纯函数，不会替用户调用事件处理器。

**后果：** 真正的重复绑定、Effect 发送请求或冒泡问题被忽略。

**错误示例：**

```tsx
useEffect(() => {
  if (submitted) sendOrder()
}, [submitted])
```

**正确写法：**

```tsx
function handleSubmit() {
  sendOrder()
}
```

**验证方式：** 在 handler 入口记录真实用户动作，并检查是否存在多个 listener、父子重复处理或 Effect 再发送。

### 错误：在 render 中修改传入数组

**触发条件：** 为列表追加占位项时直接对 Props 数组调用 `push`。

**原因：** Props 在本次组件调用前已经存在，属于只读输入。

**后果：** 额外 render 或普通更新会不断追加，产生重复 key 和错误界面。

**错误示例：**

```tsx
stories.push(createStory)
return <StoryList stories={stories} />
```

**正确写法：**

```tsx
const visibleStories = [...stories, createStory]
return <StoryList stories={visibleStories} />
```

**验证方式：** 触发多次重新渲染，原数组长度和界面条目数都保持预期。

### 错误：用 Ref 开关阻止 Effect 第二次 setup

**触发条件：** 用 `hasRun.current` 跳过后续 Effect，而不返回 cleanup。

**原因：** 开关隐藏检查，却没有定义依赖变化和卸载时如何释放资源。

**后果：** 旧连接残留，新依赖不能建立正确连接，重新挂载仍可能泄漏。

**错误示例：**

```tsx
if (hasRun.current) return
hasRun.current = true
connect(roomId)
```

**正确写法：**

```tsx
const connection = createConnection(roomId)
connection.connect()
return () => connection.disconnect()
```

**验证方式：** 初次挂载、切换依赖和移除组件后分别检查活跃资源数量。

### 错误：cleanup 清理全局全部资源

**触发条件：** 当前组件卸载时调用 `removeAllListeners()` 或 `disconnectAll()`。

**原因：** cleanup 没有使用本次 setup 闭包拥有的资源身份。

**后果：** 当前组件的清理会破坏其他仍挂载组件的资源。

**错误示例：**

```tsx
return () => channel.removeAllListeners()
```

**正确写法：**

```tsx
channel.addEventListener('message', handleMessage)
return () => channel.removeEventListener('message', handleMessage)
```

**验证方式：** 同时挂载两个实例，移除其中一个后另一个仍能正常接收消息。

### 错误：Callback Ref 只登记不删除

**触发条件：** callback 收到节点时写入 Map，却不返回 cleanup。

**原因：** 节点移除、替换或开发期重设时，旧记录没有对应撤销。

**后果：** Map 包含已经离开 DOM 的节点，焦点和滚动操作命中错误对象。

**错误示例：**

```tsx
ref={(node) => {
  if (node) itemMap.set(item.id, node)
}}
```

**正确写法：**

```tsx
ref={(node) => {
  if (!node) return
  itemMap.set(item.id, node)
  return () => itemMap.delete(item.id)
}}
```

**验证方式：** 反复添加和移除条目，Map 大小始终与已挂载节点数一致。

### 错误：把开发计数写成业务条件

**触发条件：** 根据 render、Effect setup 或 cleanup 次数决定是否收费、发送通知或展示成功状态。

**原因：** 这些次数受开发检查和正常生命周期影响，不是用户业务事件。

**后果：** 开发与生产结果不同，升级或组件重挂载后逻辑失效。

**错误示例：**

```tsx
if (setupCount === 2) markReady()
```

**正确写法：**

```tsx
const ready = activeConnections === 1
```

**验证方式：** 分别在开发和生产环境检查最终业务状态，不要求内部计数相同。

### 错误：过滤弃用警告而不定位来源

**触发条件：** 用 console 过滤规则隐藏 `UNSAFE_` API 警告。

**原因：** 警告对应应用代码或依赖仍在使用已弃用接口。

**后果：** 后续 React 升级时迁移成本和失效风险继续累积。

**错误示例：**

```tsx
console.error = () => undefined
```

**正确写法：** 阅读组件栈，迁移应用代码，或升级、替换产生警告的依赖。

```tsx
function CurrentPanel() {
  useEffect(() => {
    const subscription = subscribe()
    return () => subscription.unsubscribe()
  }, [])

  return <Panel />
}
```

**验证方式：** 恢复完整 console，重新进入原路径后警告不再出现，其他错误仍能正常报告。
:::

## 十三、源码推导与适用场景

### 1. 公共合同优先于固定实现

React 19.2 的 StrictMode 文档定义四类开发行为、作用域和生产边界。React 19.2.8 的官方测试进一步记录函数组件
在 StrictMode 中产生额外 render 日志。固定测试只能说明该版本如何验证公共合同，不能推出所有 React 版本永远使用
完全相同的调用次数和内部步骤。

### 2. 纯度让 render 可以安全重算

组件只读取 Props、State 和 Context，且不修改非局部值时，相同输入可重复得到相同 JSX。StrictMode 利用这一要求
额外调用应纯函数：纯代码结果不变，不纯代码则更容易暴露累积 mutation。由此可以推导，修复目标是恢复幂等性，
不是判断哪一次结果会被 React 丢弃。

### 3. setup 与 cleanup 构成可逆过程

Effect 和 Callback Ref 都可以抽象为“setup 取得资源，cleanup 撤销本次资源”。额外运行的价值在于验证过程可逆：

```text
初始资源 + setup - cleanup + setup = 初始资源 + setup
```

这个等式不要求计数相同，只要求最终活跃资源相同。连接、监听、计时器、观察器和节点 Map 都可以用这一不变量检查。

### 4. 适用场景

StrictMode 适合整个新应用，也适合按所有权边界逐步迁移旧子树。它特别能帮助检查包含以下代码的组件：

- 根据 Props、State 或 Context 组装复杂列表和对象。
- 建立网络连接、事件监听、计时器、观察器或第三方实例的 Effect。
- 用 Callback Ref 维护动态 DOM 节点集合。
- 包含旧类组件或依赖较旧第三方 React 组件的区域。

它不用于捕获 render 异常、隔离失败 UI、优化性能或规定生产调用次数；这些问题需要对应的 API 和验证方法。

## 十四、练习

:::exercise
### 练习一：修复不纯列表

**要求：** 找出一个在 render 中对 Props 数组调用 `sort` 和 `push` 的组件。改为不修改原数组，并让相同输入每次返回
相同顺序和条目数。

**验收：** 在 StrictMode 中反复触发普通重新渲染，原 Props 数组内容不变，列表没有重复 key 或重复占位项。
:::

:::exercise
### 练习二：补全连接 cleanup

**要求：** 为房间连接 Effect 增加 cleanup。连续切换 `general -> travel -> music`，记录 setup、cleanup 和活跃连接。

**验收：** 每次切换先释放旧房间再连接新房间；无论开发计数如何，当前始终只有一份活跃连接。
:::

:::exercise
### 练习三：维护节点 Map

**要求：** 用 Callback Ref 把动态列表节点按数据 ID 写入 Map，并返回 cleanup 删除同一记录。添加、删除和重排列表。

**验收：** Map 只包含当前已挂载节点；删除条目后不能再取得旧 DOM，重排不会把 ID 指向错误节点。
:::

:::exercise
### 练习四：判断检查边界

**要求：** 分析根级 StrictMode、局部 StrictMode 和生产环境三个场景，分别说明额外 render、初次 Effect 重连和生产
业务结果应如何理解。

**验收：** 能说明局部边界的初次 Effect 例外、所有额外检查的开发限定，以及业务代码不得依赖精确次数。
:::

## 十五、本节小结

- `<StrictMode>` 为整个包裹子树启用开发诊断，不生成 DOM，也没有单项开关 Props。
- 额外 render 只调用应保持纯净的逻辑；事件处理器不会因此自动执行两次。
- 不修改 Props、State、Context 和模块对象；当前 render 内新建对象的局部 mutation 可以使用。
- 根级 StrictMode 会额外检查 Effect 和 Callback Ref 的 setup/cleanup，对称清理后最终资源状态不变。
- 不用 Ref 开关、console 过滤或删除 StrictMode 隐藏问题。
- 开发和生产内部次数可以不同，业务结果与资源不变量必须一致。

## 十六、参考资料

- [StrictMode](https://react.dev/reference/react/StrictMode) - 四类开发检查、作用域、局部 Effect 例外、无 Props 与生产边界。
- [Keeping Components Pure](https://react.dev/learn/keeping-components-pure) - 只读输入、局部 mutation 与重复 render 暴露不纯代码。
- [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure) - 幂等、render 无副作用和不修改非局部值。
- [useEffect](https://react.dev/reference/react/useEffect) - 开发期额外 setup/cleanup 压力检查和镜像清理要求。
- [React 19：Ref cleanup](https://react.dev/blog/2024/12/05/react-19#cleanup-functions-for-refs) - Callback Ref 返回 cleanup 与 TypeScript 返回值规则。
- [React 19.2.8 StrictMode test](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/__tests__/ReactStrictMode-test.internal.js#L84-L104) - 固定版本函数组件额外 render 的官方测试证据。
