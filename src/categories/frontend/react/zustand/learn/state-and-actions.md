---
id: react.zustand.learn.basics.state-and-actions
type: lesson
title: State 与 Action
summary: 在同一份 Store 中声明状态字段与有名称的 Action，让组件通过业务意图读写共享客户端状态。
domain: frontend
technology: react
module: zustand
stage: basics
level: beginner
estimatedMinutes: 45
prerequisites:
  - react.zustand.learn.basics.first-store
related:
  - react.zustand.learn.basics.first-store
  - react.zustand.learn.basics.client-state-and-zustand
tags:
  - Zustand
  - State
  - Action
  - create
  - 状态所有权
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-02
objectives:
  - 能区分 Store 中描述事实的 State 字段与表达业务意图的 Action 函数。
  - 能在初始化函数中把相关 State 与 Action 放在同一份 Store 中。
  - 能为 Action 设计清晰的命名和必要的参数，并在组件中调用它。
  - 能分别选择组件需要的 State 字段和 Action，避免复制状态或直接修改 Store 对象。
recap:
  - State 是当前客户端事实，Action 是改变这些事实的有名称的业务命令。
  - Zustand 推荐把相关 Action 与 State 共置在 Store 中，组件通过 Hook 读取和调用。
  - Action 的参数表达交互意图，组件不需要知道 Store 内部如何完成更新。
  - "`set` 是 Action 写入 Store 的基础入口，本课只识别其位置，不展开合并与函数式更新规则。"
sources:
  - title: Zustand 5.0.15 npm Latest Metadata
    url: https://registry.npmjs.org/zustand/latest
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - npm latest 在核验日指向 Zustand 5.0.15。
      - Zustand 5.0.15 声明支持 React 18 及以上版本。
  - title: Zustand Flux-inspired practice
    url: https://zustand.docs.pmnd.rs/guides/flux-inspired-practice
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - Zustand 官方建议把 Store Action 直接添加到 Store 中。
      - "Store Action 可以调用 `set` 更新 Store，组件消费同一个 Store。"
      - Action 与 State 共置是推荐模式，Redux 风格 reducer 不是普通用法的前置要求。
  - title: Zustand Updating state
    url: https://zustand.docs.pmnd.rs/learn/guides/updating-state
    sourceType: api-doc
    appliesTo: Zustand 5.0.15
    claims:
      - 官方示例把 State 类型和 Action 类型组合到同一份 Store 中。
      - 组件可以分别选择需要的 State 字段和 Action，并从组件事件中调用 Action。
  - title: Zustand 5.0.15 create API
    url: https://zustand.docs.pmnd.rs/apis/create
    sourceType: api-doc
    appliesTo: Zustand 5.0.15
    claims:
      - "`create` 的初始化函数可以接收 `set`、`get` 和 Store API，并返回需要暴露的字段与方法。"
      - "`set`、`get` 和 Store API 不应在初始化同步调用，而应由创建完成后的 Action 使用。"
  - title: Zustand 5.0.15 README
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/README.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - Zustand Store 可以保存基本值、对象和函数。
      - 官方示例在 Store 中声明函数，并从 React 组件中选择和调用这些函数。

---

# State 与 Action

## 一、学习目标

- 区分 Store 中表示当前事实的 State 与表达业务意图的 Action。
- 在初始化函数中把同一领域的 State 和 Action 放到同一份 Store。
- 为 Action 选择清晰的动词命名和必要的参数，并从组件事件中调用它。
- 让组件只选择需要的字段或 Action，不直接改写 Store 对象。

## 二、为什么要同时理解 State 与 Action

第一个 Store 已经解决了“状态放在哪里”和“组件如何读取”的问题。真正开始交互后，还需要回答两个问题：
当前 Store 保存哪些事实，以及组件应该用什么意图改变这些事实。

例如，内容工作区可能保存当前文档标题、当前视图和是否置顶。它们是可被界面读取的 State。用户执行“重命名”、
“切换视图”或“切换置顶”时，组件发出的不是一组零散的字段赋值，而是带有业务含义的 Action。

把这两类内容放在同一份 Store 中，可以让状态的所有权和改变入口一起被发现：State 描述“现在是什么”，Action
描述“允许怎样改变”。组件只需要调用 Action，不必重复实现 Store 内部的更新细节。

## 三、核心概念

### 1. State 描述当前客户端事实

State 是 Store 对外提供的当前值，例如：

```tsx
const useWorkspaceStore = create(() => ({
  documentTitle: '未命名文档',
  viewMode: '编辑',
  isPinned: false,
}))
```

`documentTitle`、`viewMode` 和 `isPinned` 都是事实字段。组件可以读取它们来决定当前界面显示什么，但不应该
把同一份事实再复制到另一个组件 State 中。

### 2. Action 表达有名称的业务意图

Action 是 Store 中可调用的函数。它的名称应说明用户或业务正在做什么，而不是只暴露某个底层赋值动作：

```tsx
type WorkspaceStore = {
  documentTitle: string
  renameDocument: (title: string) => void
}

const useWorkspaceStore = create<WorkspaceStore>()((set) => ({
  documentTitle: '未命名文档',
  renameDocument: (title: string) => set({ documentTitle: title }),
}))
```

`renameDocument` 比 `setDocumentTitle` 更能表达这次交互的意图。Action 内部使用 `set` 完成写入；本课只需知道
Action 是写入 Store 的稳定入口，`set` 如何合并字段、如何基于前一个值更新，不在本课展开。

### 3. State 与 Action 共置

Zustand 的常用模式是把相关 State 和 Action 一起返回：

```tsx
type WorkspaceStore = {
  documentTitle: string
  viewMode: string
  isPinned: boolean
  renameDocument: (title: string) => void
  switchView: (viewMode: string) => void
  togglePinned: () => void
}

const useWorkspaceStore = create<WorkspaceStore>()((set) => ({
  documentTitle: '未命名文档',
  viewMode: '编辑',
  isPinned: false,
  renameDocument: (title: string) => set({ documentTitle: title }),
  switchView: (viewMode: string) => set({ viewMode }),
  togglePinned: () => set((state) => ({ isPinned: !state.isPinned })),
}))
```

这里的 State 与 Action 都属于工作区这个领域。组件不需要另外维护一份标题、视图或置顶状态，也不需要把更新
函数通过多层 Props 传递。

### 4. Action 参数承载必要意图

Action 需要外部信息时，通过参数接收最小载荷：

```tsx
const renameDocument = useWorkspaceStore((state) => state.renameDocument)

function handleTitleChange(nextTitle: string) {
  renameDocument(nextTitle)
}
```

组件只负责把事件中的新标题交给 Action。不要把组件事件对象、DOM 节点或整份组件 Props 直接塞进 Store；Action
参数应该是完成这次业务操作所需的最小值。

### 5. 组件分别选择 State 与 Action

组件可以选择一个 State 字段和一个 Action：

```tsx
function WorkspaceToolbar() {
  const isPinned = useWorkspaceStore((state) => state.isPinned)
  const togglePinned = useWorkspaceStore((state) => state.togglePinned)

  return <button onClick={togglePinned}>{isPinned ? '取消置顶' : '置顶'}</button>
}
```

State 用于渲染当前结果，Action 用于响应用户事件。选择 Action 不等于把函数复制到本地；组件仍然连接到同一份
Store。Selector 的结果稳定性和更细的订阅策略不在本课展开。

## 四、用法与示例

### 1. 声明一个有 State 和 Action 的 Store

下面的 Store 保存工作区事实，并提供三个有名称的操作：

```tsx
import { create } from 'zustand'

type WorkspaceStore = {
  documentTitle: string
  viewMode: string
  isPinned: boolean
  renameDocument: (title: string) => void
  switchView: (viewMode: string) => void
  togglePinned: () => void
}

const useWorkspaceStore = create<WorkspaceStore>()((set) => ({
  documentTitle: '未命名文档',
  viewMode: '编辑',
  isPinned: false,
  renameDocument: (title: string) => set({ documentTitle: title }),
  switchView: (viewMode: string) => set({ viewMode }),
  togglePinned: () => set((state) => ({ isPinned: !state.isPinned })),
}))
```

Store 的返回对象同时包含 State 和 Action。它们属于同一个工作区状态边界，但 Action 不是需要展示给用户的
第二份数据；Action 是改变 State 的入口。

### 2. 从组件事件调用 Action

标题输入框和视图按钮可以直接消费 Store：

```tsx
function WorkspaceControls() {
  const documentTitle = useWorkspaceStore((state) => state.documentTitle)
  const viewMode = useWorkspaceStore((state) => state.viewMode)
  const renameDocument = useWorkspaceStore((state) => state.renameDocument)
  const switchView = useWorkspaceStore((state) => state.switchView)

  return (
    <section>
      <input
        value={documentTitle}
        onChange={(event) => renameDocument(event.target.value)}
      />
      <button type="button" onClick={() => switchView('编辑')}>
        编辑
      </button>
      <button type="button" onClick={() => switchView('预览')}>
        预览
      </button>
      <p>当前视图：{viewMode}</p>
    </section>
  )
}
```

事件处理器调用 Action，组件不直接调用 `useWorkspaceStore.setState`，也不改写选择到的对象。这样，后续改变
更新实现时，组件的业务事件仍然保持稳定。

### 3. 观察 State 与 Action 的协作

下面的 Demo 提供一个最小工作区：输入标题、切换视图和切换置顶都会通过 Store Action 产生变化，同时页面顶部
展示当前 State。源码面板展示的就是实际运行的 TSX 与 CSS 文件。

:::demo{id="react.zustand.learn.basics.state-and-actions.state-and-actions-demo"}
:::

## 五、易错使用提示

:::pitfalls
### 错误：在组件中直接修改 Store 选择到的字段

**触发条件：** 先读取对象，再写入 `workspace.documentTitle = nextTitle`。

**原因：** 把 Store State 当成普通可变对象，绕过了 Action 和 Store 的通知机制。

**后果：** 更新入口不可追踪，组件也可能看不到符合预期的重新渲染。

**错误示例：**

```tsx
const workspace = useWorkspaceStore((state) => state)
workspace.documentTitle = '新的标题'
```

**正确写法：**

```tsx
const renameDocument = useWorkspaceStore((state) => state.renameDocument)
renameDocument('新的标题')
```

**验证方式：** 检查组件是否只调用 Store Action，是否没有给 Store 选择结果的字段重新赋值。

### 错误：把 Action 当成组件本地回调再复制一份

**触发条件：** 组件读取 State 后，又用 `useState` 或 `useCallback` 重新实现一份同名更新逻辑。

**原因：** 没有把改变共享 State 的职责留在 Store。

**后果：** 同一份事实出现多个改变入口，后续规则容易分叉。

**错误示例：**

```tsx
const documentTitle = useWorkspaceStore((state) => state.documentTitle)
const [localTitle, setLocalTitle] = useState(documentTitle)
```

**正确写法：**

```tsx
const documentTitle = useWorkspaceStore((state) => state.documentTitle)
const renameDocument = useWorkspaceStore((state) => state.renameDocument)
```

**验证方式：** 确认共享事实只有 Store 一个主要所有者；组件本地 State 只保留确实私有的临时输入或交互。

### 错误：Action 名称只暴露底层字段赋值

**触发条件：** 所有操作都命名为 `setValue`、`updateState`，调用处还要自己拼出业务规则。

**原因：** Action 没有承载业务意图，Store 只变成一组无语义的字段入口。

**后果：** 调用方需要知道更多内部字段，代码难以阅读和统一修改。

**错误示例：**

```tsx
updateState({ isPinned: true, documentTitle: nextTitle })
```

**正确写法：**

```tsx
renameDocument(nextTitle)
togglePinned()
```

**验证方式：** Action 名称使用清晰动词；参数只传完成该操作所需的最小值。

### 错误：在渲染过程中调用会改变 State 的 Action

**触发条件：** 在 JSX 求值或组件函数顶层直接执行 `togglePinned()`。

**原因：** 把事件操作误当成渲染计算。

**后果：** 渲染会触发更新，更新又触发渲染，形成循环或难以预测的行为。

**错误示例：**

```tsx
return <button onClick={togglePinned()}>置顶</button>
```

**正确写法：**

```tsx
return <button onClick={togglePinned}>置顶</button>
```

**验证方式：** Action 只出现在事件处理器、明确的业务流程或生命周期边界中，不在 JSX 求值阶段执行。
:::

## 六、原理与适用场景

### 1. 官方事实

Zustand 官方推荐把 Store Action 直接放进 Store，并通过 `set` 完成状态更新。官方更新状态示例也把 State
与 Action 组合成一份 Store，组件分别选择字段和 Action 后再从事件中调用。Zustand 不要求使用 Redux 风格的
Action 对象和 reducer 才能组织状态。

### 2. 课程推导

State 和 Action 共置的价值不在于让每个字段都变成全局状态，而在于把一个共享客户端状态的“事实”和“改变
入口”放在同一边界内。组件只表达用户意图，Store 负责维护事实的一致性。

### 3. 适用边界

适合放入 Store 的 Action 通常对应跨组件共享的工作流，例如重命名文档、切换当前视图和切换置顶。组件私有的
输入草稿、hover 或弹窗展开仍可留在组件本地；URL 参数、服务端事实和远程缓存也不因为存在 Action 就转入
Zustand。

本课不展开 `set` 的浅合并、函数式更新、嵌套对象和替换更新，也不引入 `get`、Selector 优化、Middleware 或
异步 Action。

## 七、练习

:::exercise
### 为任务工作区设计 State 与 Action

**要求：** 为一个任务工作区设计一份 Store，至少包含 `selectedStatus` 和 `selectedTaskId` 两个 State 字段，
以及 `selectStatus(status)`、`selectTask(taskId)` 两个 Action。再写一个组件读取当前筛选和任务，并在按钮事件
中调用对应 Action。

**验收：** State 字段只保存当前事实；Action 使用清晰动词命名并接收最小参数；组件不直接修改 Store 对象；
相关 State 与 Action 位于同一份 Store；不为同一事实再创建本地副本。

**参考答案：**

```tsx
import { create } from 'zustand'

type TaskStore = {
  selectedStatus: string
  selectedTaskId: string
  selectStatus: (status: string) => void
  selectTask: (taskId: string) => void
}

const useTaskStore = create<TaskStore>()((set) => ({
  selectedStatus: 'all',
  selectedTaskId: '',
  selectStatus: (status: string) => set({ selectedStatus: status }),
  selectTask: (taskId: string) => set({ selectedTaskId: taskId }),
}))

function TaskToolbar() {
  const selectedStatus = useTaskStore((state) => state.selectedStatus)
  const selectedTaskId = useTaskStore((state) => state.selectedTaskId)
  const selectStatus = useTaskStore((state) => state.selectStatus)
  const selectTask = useTaskStore((state) => state.selectTask)

  return (
    <div>
      <button type="button" onClick={() => selectStatus('done')}>
        当前筛选：{selectedStatus}
      </button>
      <button type="button" onClick={() => selectTask('task-1')}>
        当前任务：{selectedTaskId || '未选择'}
      </button>
    </div>
  )
}
```
:::

## 八、本节小结

- State 描述 Store 当前拥有的客户端事实，Action 描述改变这些事实的业务意图。
- 相关 State 和 Action 可以由同一个初始化函数返回，组件通过同一个 Store Hook 消费。
- Action 使用清晰动词和最小参数，组件只调用 Action，不直接修改 Store 选择结果。
- Action 的更新入口是 `set`；本课不展开合并与函数式更新规则。

## 九、参考资料

- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版与 React peer 版本范围。
- [Zustand Flux-inspired practice](https://zustand.docs.pmnd.rs/guides/flux-inspired-practice) - State 与 Action 共置及 Store Action 推荐模式。
- [Zustand Updating state](https://zustand.docs.pmnd.rs/learn/guides/updating-state) - State、Action 与组件事件调用示例。
- [Zustand 5.0.15 create API](https://zustand.docs.pmnd.rs/apis/create) - 初始化函数参数与 Store Hook 返回值。
- [Zustand 5.0.15 README](https://github.com/pmndrs/zustand/blob/v5.0.15/README.md) - 固定版本的基础 Store 和 Action 示例。
