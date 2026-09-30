---
id: react.zustand.learn.basics.client-state-and-zustand
type: lesson
title: 客户端状态与 Zustand
summary: 识别客户端状态的所有权和共享范围，并判断何时适合使用 Zustand。
domain: frontend
technology: react
module: zustand
stage: basics
level: beginner
estimatedMinutes: 35
prerequisites: []
related:
  - react.core.learn.basics.state-ownership-and-thinking-in-react
  - react.data.learn.basics.server-state-and-tanstack-query
tags:
  - Zustand
  - 客户端状态
  - 状态所有权
  - React 状态管理
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-02
objectives:
  - 能说明客户端状态与服务端状态的所有权差异。
  - 能根据使用范围判断状态应留在组件、提升到共同父组件，还是进入 Zustand。
  - 能识别 Zustand 的 React 绑定 Store、Hook 消费方式和默认无需 Provider 的特点。
  - 能避免重复保存同一事实，并为常见界面状态选择唯一的主要所有者。
recap:
  - 客户端状态描述当前浏览器中的界面和工作流，最终所有者位于客户端应用。
  - 状态应尽量靠近真实使用者；共享范围扩大不等于所有状态都要全局化。
  - Zustand 适合协调多个相距较远组件共同读写的客户端状态。
  - 普通 React 绑定 Store 以 Hook 形式消费，默认不要求在根组件包裹 Provider。
  - 服务端事实、URL 状态和组件私有交互仍应由各自更合适的工具负责。
sources:
  - title: Zustand 5.0.15 npm Latest Metadata
    url: https://registry.npmjs.org/zustand/latest
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - npm latest 在核验日指向 Zustand 5.0.15。
      - Zustand 5.0.15 声明支持 React 18 及以上版本。
  - title: Zustand 5.0.15 README
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/README.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - Zustand 是基于 Hook 的状态管理方案。
      - React 组件可以通过 Store Hook 选择状态，普通使用方式不需要 Provider。
      - Zustand Store 可以保存基本值、对象和函数。
  - title: Zustand Introduction
    url: https://zustand.docs.pmnd.rs/learn/getting-started/introduction
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - Zustand 官方入门以 create 创建 React 绑定 Store，并以 Hook 形式供组件使用。
      - 组件选择的状态变化时，对应消费组件重新渲染。
  - title: React Sharing State Between Components
    url: https://react.dev/learn/sharing-state-between-components
    sourceType: official-reference
    appliesTo: React 19.2.8
    claims:
      - 每一份状态都应有明确的单一事实来源。
      - 只在相邻组件间共享的状态可以提升到最近共同父组件，不必全部进入外部 Store。
  - title: TanStack Query Does This Replace Client State
    url: https://tanstack.com/query/latest/docs/framework/react/guides/does-this-replace-client-state
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - TanStack Query 管理服务端状态，不替代 Zustand 等客户端状态工具。
      - 服务端状态工具与客户端状态工具可以在同一个应用中并存。
---

# 客户端状态与 Zustand

## 一、学习目标

- 识别客户端状态，并说清它与服务端状态的所有权差异。
- 根据状态的使用范围，判断它应留在组件、提升到共同父组件，还是进入 Zustand。
- 识别 Zustand 的包入口、React 绑定 Store 和 Hook 消费方式。
- 避免重复保存同一事实，为界面状态选择唯一的主要所有者。

## 二、为什么需要客户端状态工具

一个内容管理页面可能同时包含筛选条件、当前选中的文章、未提交草稿、侧栏开关和服务端返回的文章列表。
这些值都会改变界面，但它们并不属于同一种状态。

筛选条件、选中项、草稿和侧栏开关由当前浏览器中的交互产生，属于客户端状态。文章列表的最终事实来自
远程系统，属于服务端状态。先分清所有权，再选择工具，可以避免把远程缓存、URL 和短暂交互全部塞进同
一个共享对象。

React 组件自己的 State 很适合局部交互。随着页面扩大，同一份客户端状态可能被顶部工具栏、侧栏和内容区
共同读取或更新。此时继续逐层传递 Props，或者在多个组件中各保存一份副本，会让状态来源和更新路径变得
难以追踪。Zustand 提供了一个独立于组件层级的共享客户端状态入口。

## 三、核心概念

### 1. 客户端状态由谁拥有

客户端状态描述当前客户端应用中的界面和工作流，例如：

- 当前选中的筛选条件；
- 尚未提交的编辑草稿；
- 跨多个区域共享的主题偏好；
- 多步骤流程当前填写到的本地内容。

判断的关键不是“这个值会不会变化”，而是谁拥有最终事实。如果关闭页面后不需要从远程系统重新同步，
并且它主要描述当前界面的交互，那么它通常属于客户端状态。

每一份状态都应有一个主要所有者。单一事实来源不表示所有状态必须放在同一个地方，而是同一事实不能在
组件 State、Context 和 Zustand 中各保存一份需要手动同步的副本。

### 2. 状态应尽量靠近使用者

状态的共享范围决定它应放在哪里：

| 使用范围 | 优先所有者 | 典型例子 |
| --- | --- | --- |
| 只有一个组件使用 | 组件本地 State | 单个按钮的展开状态 |
| 少量相邻组件共同使用 | 最近共同父组件 | 表单字段与预览区 |
| 多个相距较远区域共同读写 | Zustand 等客户端 Store | 顶部、侧栏和列表共享的筛选条件 |
| 需要刷新、分享或参与导航 | URL | 搜索词、分页和当前标签 |
| 最终事实来自远程系统 | 服务端状态工具 | 文章、用户资料和订单列表 |

Zustand 不是状态的默认终点。只有当客户端状态确实跨越组件边界，并且共享 Store 能让所有权更清晰时，
才值得把它移入 Zustand。

### 3. Zustand 的位置

Zustand 是客户端状态管理库。普通 React 用法从 `zustand` 包导入 `create`，得到一个与 Store 绑定的 Hook。
组件通过这个 Hook 选择自己需要的状态；被选择的状态变化时，对应组件重新渲染。

下面的代码只用于识别 Zustand 的入口和消费形态：

```tsx
import { create } from 'zustand'

const useWorkspaceStore = create(() => ({
  selectedStatus: 'all',
}))

function ResultSummary() {
  const selectedStatus = useWorkspaceStore((state) => state.selectedStatus)
  return <p>当前筛选：{selectedStatus}</p>
}
```

这里的 `useWorkspaceStore` 同时连接 Store 与 React 组件。普通使用方式不要求在应用根组件额外包裹 Provider。
Store 的完整类型、更新函数和组织方式不属于本篇的重点。

## 四、用法与示例

### 1. 先画出状态所有权

假设任务工作区包含以下信息：

| 状态 | 主要使用者 | 合适的所有者 |
| --- | --- | --- |
| 帮助按钮是否展开 | 帮助按钮组件 | 组件本地 State |
| 编辑器草稿 | 编辑器与实时预览 | 最近共同父组件或 Zustand，取决于组件距离 |
| 当前任务筛选 | 顶部统计、侧栏、任务列表 | Zustand |
| 当前页码 | 页面导航与可分享地址 | URL |
| 任务列表 | 远程 API 的多个消费者 | 服务端状态工具 |

这张表先回答“谁拥有”，再回答“用什么工具”。如果筛选条件只被任务列表自己使用，它仍然可以留在组件中；
只有顶部统计、侧栏和列表都需要读写它时，共享 Store 才开始提供明确价值。

### 2. 识别 Zustand 的最小职责

在这个工作区中，Zustand 可以负责当前筛选、批量选择和跨区域草稿等同步客户端状态。它不应自动接管：

- 只在一个组件中短暂存在的 hover、展开和输入状态；
- 需要刷新后仍能分享的 URL 参数；
- 由 API 或数据库拥有的远程事实；
- 可以从其他状态直接计算出的重复结果。

工具边界越清楚，状态更新时需要同步的地方越少。

## 五、易错使用提示

:::pitfalls
### 错误：安装 Zustand 后把所有界面状态都放进 Store

**触发条件：** 为每个按钮开关、输入框内容和 hover 状态都增加 Store 字段。

**原因：** 把“可以共享”误解为“必须共享”。

**后果：** 组件私有细节扩散到全应用，简单交互也需要跨文件追踪。

**错误示例：**

```tsx
const isHelpOpen = useWorkspaceStore((state) => state.isHelpOpen)
```

**正确写法：**

```tsx
const [isHelpOpen, setHelpOpen] = useState(false)
```

**验证方式：** 确认这个值是否被组件外部读取或更新；如果没有，保留在组件中。

### 错误：在组件 State 和 Zustand 中保存同一事实

**触发条件：** 组件先保存筛选条件，再用 Effect 把它同步到 Store。

**原因：** 没有为同一份状态选择唯一的主要所有者。

**后果：** 两个值可能在不同更新顺序下失去一致性，并产生不必要的同步逻辑。

**错误示例：**

```tsx
const [status, setStatus] = useState('all')
const setStoreStatus = useWorkspaceStore((state) => state.setStatus)

useEffect(() => {
  setStoreStatus(status)
}, [setStoreStatus, status])
```

**正确写法：**

```tsx
const selectedStatus = useWorkspaceStore((state) => state.selectedStatus)

// 其他组件也读取同一 Store，不再建立第二份本地副本。
```

**验证方式：** 搜索状态名称，确认只有一个地方保存值，其他位置只读取或发起更新。

### 错误：把服务端事实复制进 Zustand 作为第二份主要数据源

**触发条件：** 请求得到文章列表后，再把完整列表复制到 Zustand，并让组件读取这个副本。

**原因：** 把“多个组件需要读取”当成客户端 Store 的充分条件，没有判断远程所有权。

**后果：** 远程缓存和 Zustand 副本需要手动同步，重新获取或更新后容易出现旧数据。

**错误示例：**

```tsx
const articlesQuery = useArticlesQuery()
const saveArticles = useWorkspaceStore((state) => state.saveArticles)

useEffect(() => {
  if (articlesQuery.data) saveArticles(articlesQuery.data)
}, [articlesQuery.data, saveArticles])
```

**正确写法：**

```tsx
const articlesQuery = useArticlesQuery()
const selectedStatus = useWorkspaceStore((state) => state.selectedStatus)
```

**验证方式：** 远程文章只有一个缓存所有者，Zustand 只保存筛选等客户端状态。

### 错误：因为多个组件使用就立即引入 Zustand

**触发条件：** 两个相邻子组件需要同一状态时，直接创建应用级 Store。

**原因：** 忽略最近共同父组件已经可以提供清晰的单一事实来源。

**后果：** 很小的局部功能获得了不必要的全应用可见性，组件复用边界反而变模糊。

**错误示例：**

```tsx
const previewText = useWorkspaceStore((state) => state.previewText)
```

**正确写法：**

```tsx
function EditorPanel() {
  const [text, setText] = useState('')
  return <EditorWithPreview text={text} onTextChange={setText} />
}
```

**验证方式：** 找到所有使用者的最近共同父组件；如果状态不需要越过这个边界，先提升 State。
:::

## 六、原理与适用场景

### 1. 官方事实

Zustand 官方入门把普通 React Store 描述为 Hook。组件通过 Selector 选择状态，所选状态变化时消费组件重新
渲染；这种用法默认不要求 Provider。React 官方同时强调，每一份状态都应有明确的单一事实来源，但不同
状态可以分别位于不同组件或不同层级。

### 2. 课程推导

可以用“最终所有者 -> 使用范围 -> 生命周期”三步选择工具：先排除远程事实和 URL，再判断客户端状态是否
只服务于局部组件。只有需要跨越明显组件边界的客户端状态，才是 Zustand 的主要候选。

### 3. 适用边界

Zustand 适合筛选条件、跨区域选择、客户端草稿和同步工作流等共享客户端状态。它不替代组件本地 State、
URL、服务端缓存或后端持久化。普通用法无需 Provider，也不表示所有应用都只能有一个 Store；具体作用域和
多实例需求应由真实所有权决定。

## 七、练习

:::exercise
### 状态所有权判断

**要求：** 为一个内容管理工作区中的“远程文章列表”“当前状态筛选”“帮助弹窗开关”“URL 中的页码”和
“编辑器与预览区共享的未提交草稿”选择主要所有者，并说明哪些状态适合进入 Zustand。

**验收：** 每一项只有一个主要所有者；远程文章不复制进 Zustand；页码保留在 URL；只有跨越明显组件边界
的客户端状态进入 Zustand。

**参考答案：** 远程文章列表由服务端状态工具管理；当前状态筛选若被顶部、侧栏和列表共同读写，适合进入
Zustand；帮助弹窗开关留在弹窗触发组件；页码由 URL 管理；未提交草稿若只在同一父组件下的编辑器与预览区
共享，可以提升到父组件，如果跨越多个独立区域再进入 Zustand。
:::

## 八、本节小结

- 客户端状态描述当前浏览器中的界面和工作流，服务端状态由远程系统拥有。
- 每一份状态都需要单一事实来源，但不同状态不必集中在同一个 Store。
- Zustand 适合多个相距较远组件共同读写的客户端状态。
- 普通 React 绑定 Store 通过 Hook 消费，默认不要求 Provider。
- 组件私有状态、URL 和服务端事实仍应由更接近其所有权的工具负责。

## 九、参考资料

- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验最新稳定版本与 React peer 版本范围。
- [Zustand 5.0.15 README](https://github.com/pmndrs/zustand/blob/v5.0.15/README.md) - Zustand 的定位、Hook 消费方式与普通用法边界。
- [Zustand Introduction](https://zustand.docs.pmnd.rs/learn/getting-started/introduction) - 官方安装入口、React 绑定 Store 和组件选择状态的基本形态。
- [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components) - 单一事实来源、状态提升与状态所有权。
- [Does TanStack Query Replace Client State?](https://tanstack.com/query/latest/docs/framework/react/guides/does-this-replace-client-state) - 服务端状态与 Zustand 等客户端状态工具的职责边界。
