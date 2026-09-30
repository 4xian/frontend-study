---
id: react.redux.learn.basics.modern-redux-stack
type: lesson
title: 现代 Redux 技术栈
summary: 分清 Redux、Redux Toolkit 与 React Redux 的职责，建立现代 React 客户端状态开发的正确入口。
domain: frontend
technology: react
module: redux
stage: basics
level: beginner
estimatedMinutes: 65
prerequisites: []
related: []
tags:
  - Redux
  - Redux Toolkit
  - React Redux
  - 客户端状态
  - 状态管理
appliesTo: Redux Toolkit 2.12.0、React Redux 9.3.0
verifiedAt: 2026-08-27
objectives:
  - 能区分 Redux 的状态模型、Redux Toolkit 的 Redux 逻辑工具和 React Redux 的 React 绑定职责。
  - 能为新的 React 客户端项目选择 @reduxjs/toolkit 与 react-redux，而不把旧式 Redux API 当作主线。
  - 能从 import 来源判断 configureStore、createSlice、Provider、useSelector 与 useDispatch 分别属于哪个包。
  - 能说明 Redux 客户端状态、局部界面状态与服务端数据缓存的基本边界。
  - 能识别 RTK Query 位于 Redux Toolkit 包内，但不把它与本课的客户端状态主线混为一谈。
recap:
  - Redux 描述共享状态的组织模型，Redux Toolkit 提供现代 Redux 逻辑的标准工具入口。
  - '@reduxjs/toolkit 负责 store、slice、reducer、action、异步逻辑和 middleware 等 Redux 侧能力。'
  - react-redux 是 Redux 的 React UI 绑定层，负责让组件连接已有 Redux store。
  - 新项目通常一起安装 @reduxjs/toolkit 与 react-redux；不要从 react-redux 导入 Redux 逻辑 API。
  - 局部交互状态不因应用安装 Redux 就自动归入 store，远程缓存也不应默认复制到客户端状态中。
sources:
  - title: Redux Toolkit 2.12.0 npm Latest Metadata
    url: https://registry.npmjs.org/@reduxjs%2ftoolkit/latest
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - npm latest 在核验日指向 2.12.0，并给出对应的 Redux Toolkit 官方仓库提交。
  - title: Redux Toolkit 2.12.0 Getting Started
    url: https://github.com/reduxjs/redux-toolkit/blob/576a02f8056fbee2dcaddb4d2e4d2da3b7937c58/docs/introduction/getting-started.md
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - Redux Toolkit 的定位是编写 Redux 逻辑的标准方式，并说明其解决的配置、依赖和样板问题。
      - 官方列出 configureStore、createSlice、createAsyncThunk、createEntityAdapter 和 createSelector 等工具。
      - RTK Query 是 @reduxjs/toolkit 中可选的数据获取与缓存能力，拥有独立入口。
  - title: Redux Toolkit 2.12.0 Public Exports
    url: https://github.com/reduxjs/redux-toolkit/blob/576a02f8056fbee2dcaddb4d2e4d2da3b7937c58/packages/toolkit/src/index.ts
    sourceType: source-code
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - 固定版本源码从 Redux Toolkit 主入口导出 configureStore 与 createSlice。
  - title: React Redux 9.3.0 npm Latest Metadata
    url: https://registry.npmjs.org/react-redux/latest
    sourceType: official-reference
    appliesTo: React Redux 9.3.0
    claims:
      - npm latest 在核验日指向 9.3.0，并给出对应的 React Redux 官方仓库提交。
  - title: React Redux 9.3.0 Getting Started
    url: https://github.com/reduxjs/react-redux/blob/4134f88f179c46d3ae9c4ee7baaa589ff0fecfa8/docs/introduction/getting-started.md
    sourceType: official-reference
    appliesTo: React Redux 9.3.0
    claims:
      - React Redux 是 Redux 的官方 React UI 绑定层，组件可通过它读取 store 数据和分发 action。
      - Provider 使 store 对 React 子树可用，useSelector 与 useDispatch 是组件交互的基础 Hooks。
  - title: React Redux 9.3.0 Public Exports
    url: https://github.com/reduxjs/react-redux/blob/4134f88f179c46d3ae9c4ee7baaa589ff0fecfa8/src/exports.ts
    sourceType: source-code
    appliesTo: React Redux 9.3.0
    claims:
      - 固定版本源码从 React Redux 公共入口导出 Provider、useSelector 与 useDispatch。
  - title: Redux Organizing State
    url: https://github.com/reduxjs/redux/blob/71606661ac515bdd64c199a6bb508401c7cf736f/docs/faq/OrganizingState.md
    sourceType: official-reference
    appliesTo: Redux 官方文档提交 71606661ac515bdd64c199a6bb508401c7cf736f
    claims:
      - 官方说明组件本地状态是合理选择，并给出判断数据是否进入 Redux 的常用问题。
      - 多数组件共同使用同一数据，是考虑把状态放入 Redux 的信号之一。
  - title: Redux Side Effects Approaches
    url: https://github.com/reduxjs/redux/blob/71606661ac515bdd64c199a6bb508401c7cf736f/docs/usage/side-effects-approaches.mdx
    sourceType: official-reference
    appliesTo: Redux 官方文档提交 71606661ac515bdd64c199a6bb508401c7cf736f
    claims:
      - 官方把 RTK Query 定位为 Redux 应用的数据获取与缓存方案，并明确其面向服务端状态。
---

# 现代 Redux 技术栈

## 一、学习目标

- 分清 Redux、Redux Toolkit 与 React Redux 各自解决的问题。
- 为新的 React 项目选择现代 Redux 的两个入口包。
- 从导入语句判断 store 逻辑和 React 组件绑定分别属于哪个包。
- 判断一个状态问题应该先留在组件、进入 Redux，还是交给专门的服务端数据方案。
- 知道 RTK Query 的位置与职责边界，不在本课展开它的 API。

## 二、为什么需要现代 Redux 技术栈

一个课程列表可以在筛选面板、顶部统计和详情页同时使用同一份“当前筛选条件”。当状态跨越多个组件层级，
并且多个区域都需要在明确时机读写它时，单靠逐层传递 Props 会让状态来源和更新路径越来越难追踪。

Redux 提供了组织共享状态的模型，但它不等于一套专门为 React 设计的组件 API。现代 React 应用把职责拆开：
Redux Toolkit 负责 Redux 一侧的配置和状态逻辑，React Redux 负责把已有 store 接到 React 组件树。这样既不必
从旧式 Redux 样板开始，也不会把组件订阅能力误认为是 store 的实现能力。

本课只建立这三个名称和包职责的地图，不展开 store、Provider、slice 与 Hooks 的具体写法。

## 三、核心概念

### 1. 三层职责

现代 Redux 技术栈可以按下面的边界理解：

| 层次 | 负责什么 | 本课需要记住的名称 |
| --- | --- | --- |
| Redux | 组织共享状态、action 与 reducer 的通用模型 | Redux |
| Redux Toolkit | 用推荐工具编写 Redux 逻辑 | `@reduxjs/toolkit` |
| React Redux | 让 React 组件读取 store 并发起 action | `react-redux` |

Redux 不绑定 React。它描述 store 中状态如何由 action 和 reducer 协作维护；本课只需识别这套模型的职责。
Redux Toolkit 不替换 Redux 的模型，而是把新项目最常需要的 store 配置、slice、异步和 middleware 工具集中在
`@reduxjs/toolkit`。官方把它定位为编写 Redux 逻辑的标准方式。

React Redux 也不创建业务状态逻辑。它是 Redux 的官方 React UI 绑定层：组件通过它接入已有 store，在需要的
位置读取数据或分发 action。没有 React 的 Redux 程序不需要 React Redux；使用 React 的 Redux 应用通常需要它。

### 2. 从 import 来源识别职责

完整的 Redux 应用会同时出现这些名称。现在先记住它们的来源，不要求在本课实现它们：

```ts
import { configureStore, createSlice } from '@reduxjs/toolkit'
import { Provider, useDispatch, useSelector } from 'react-redux'
```

`configureStore` 和 `createSlice` 属于 Redux Toolkit，服务于 Redux 逻辑的配置与组织。`Provider`、
`useSelector` 和 `useDispatch` 属于 React Redux，服务于 React 组件树与 store 的连接。把两组名称混在一起
使用时，先回到“谁负责 Redux 逻辑，谁负责 React 绑定”这个判断。

### 3. 新项目的安装入口

已有 React 项目需要现代 Redux 客户端状态能力时，安装两个公开包：

```sh
npm install @reduxjs/toolkit react-redux
```

这里的第一项给 Redux 逻辑提供推荐工具，第二项给 React 组件提供绑定层。不要因为教程出现旧式
`createStore`、`connect` 或手写 action type 字符串，就把它们当作新代码的默认入口；它们只在理解历史代码和
迁移边界时才有价值。

安装不等于要立即把全部状态放进 store。应用仍然可以保留组件自己的输入框、展开状态和短暂交互状态；
Redux 的价值出现在状态确实需要跨组件协调，并且读写过程需要保持清晰时。

### 4. RTK Query 的位置

RTK Query 是 `@reduxjs/toolkit` 包内可选的数据获取与缓存能力，入口位于 `@reduxjs/toolkit/query`，React
项目还可使用 `@reduxjs/toolkit/query/react`。它的存在不改变前三层的职责：Redux Toolkit 仍负责 Redux
侧能力，React Redux 仍负责 React 与 store 的通用连接。

本课不会把请求结果默认复制进 Redux store，也不会把 RTK Query 当作所有远程数据的唯一答案。这里仅识别
包边界，不展开服务端状态、缓存失效和请求生命周期。

## 四、用法与示例

### 1. 用目录职责而不是文件名猜测代码

一个常见的 React 项目会让每个文件只承担一种职责：

```text
src/
  app/store.ts                  # Redux Toolkit：组织应用 store
  features/tasks/tasksSlice.ts  # Redux Toolkit：组织任务状态逻辑
  main.tsx                      # React Redux：用 Provider 接入 React 根树
  features/tasks/TaskList.tsx   # React Redux：在组件中读取或分发
```

这不是唯一目录结构，也不是要求现在创建这些文件。它表达的是依赖方向：业务状态逻辑不从 React 组件文件中
反向导入，React 绑定层也不负责替业务功能定义 reducer。

### 2. 先判断状态所有权

开始写代码前先问状态由谁拥有：

| 问题 | 优先选择 | 本课的边界 |
| --- | --- | --- |
| 只影响一个组件的输入、展开或临时交互 | 组件本地 State | 不因安装 Redux 而自动迁移 |
| 多个相距较远的客户端区域需要一致地读取和更新 | Redux Toolkit + React Redux | 本课只判断职责，不展开实现细节 |
| 数据来自服务端并需要请求、缓存与失效策略 | 专门的服务端状态方案 | 不默认长期复制到客户端 store |

这个表是选择入口的起点，不是固定规则。实际归属还取决于共享范围、是否需要派生数据、谁负责加载与缓存；
本课只要求能说明选择理由。

## 五、易错使用提示

:::pitfalls
### 错误：从 Redux Toolkit 导入 React 绑定 API

**触发条件：** 安装完成后把 `Provider`、`useSelector` 或 `useDispatch` 写成从 `@reduxjs/toolkit` 导入。

**原因：** Redux Toolkit 负责 Redux 逻辑工具，React 组件绑定由另一个包提供。

**后果：** 导入在类型检查或运行时失败，或者团队成员无法从依赖来源判断 API 的职责。

**错误示例：**

```ts
import { Provider, useSelector } from '@reduxjs/toolkit'
```

**正确写法：**

```ts
import { Provider, useSelector } from 'react-redux'
```

**验证方式：** 查看 import 来源：组件绑定 API 必须来自 `react-redux`。

### 错误：把 React Redux 当成 store 配置工具

**触发条件：** 认为只要引入 `react-redux` 就已经创建并配置了应用的 Redux store。

**原因：** React Redux 只连接 React 与已有 Redux store，不负责定义业务 reducer 或 store 配置。

**后果：** 项目没有明确的 Redux 逻辑入口，Provider 也没有正确的 store 可提供。

**错误示例：**

```ts
import { Provider } from 'react-redux'

// 错误：这里没有由 Redux Toolkit 建立的 store。
```

**正确写法：**

```ts
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'

// store 配置与 React 根树接入属于不同职责。
```

**验证方式：** 分别指出 Redux 逻辑工具和 React 绑定 API 的包来源。

### 错误：把旧式 Redux API 当作新项目主线

**触发条件：** 新功能从 `createStore`、`connect` 和手写 action type 样板开始。

**原因：** 教程或旧项目代码展示的是历史实现方式，而不是当前 Redux Toolkit 的推荐入口。

**后果：** 配置和样板代码增加，团队还会错过 Redux Toolkit 提供的默认能力。

**错误示例：**

```ts
import { createStore } from 'redux'
```

**正确写法：**

```ts
import { configureStore } from '@reduxjs/toolkit'
```

**验证方式：** 新模块的 Redux 配置从 `@reduxjs/toolkit` 导入推荐 API；旧 API 只在迁移代码中保留。

### 错误：安装 Redux 后把所有界面状态都放进 store

**触发条件：** 每个输入框内容、单个弹层开关和短暂 hover 状态都创建全局 Redux 字段。

**原因：** 把“应用安装了 Redux”误解为“所有状态都必须全局化”。

**后果：** 状态所有权变模糊，简单组件交互也需要跨文件处理 action 与 reducer。

**错误示例：**

```ts
// 只有一个输入框使用的临时内容也进入全局 store。
const globalDraft = ''
```

**正确写法：**

```tsx
const [draft, setDraft] = useState('')
```

**验证方式：** 先确认状态是否被相距较远的客户端区域共同读取或更新；若否，保留在组件或更近的所有者。

### 错误：把 RTK Query 与客户端状态主线混为一谈

**触发条件：** 看到它位于 `@reduxjs/toolkit` 包内，就把所有请求结果长期手动复制到普通 Redux slice。

**原因：** 没有区分客户端状态协调与服务端数据获取、缓存和失效的职责。

**后果：** 同一远程数据可能出现两个无明确所有者的缓存，更新时难以判断应该刷新哪一份。

**错误示例：**

```ts
// 请求缓存与普通客户端状态重复保存，但没有所有权约定。
const state = { tasksFromApi: [], taskCache: [] }
```

**正确写法：**

```ts
// 先为远程数据确定唯一的请求与缓存所有者。
```

**验证方式：** 对每份远程数据标明唯一缓存所有者；本课只识别 RTK Query 的包位置，不在这里实现请求层。
:::

## 六、源码推导与适用场景

### 1. 官方事实

Redux Toolkit 2.12.0 的固定源码从包主入口导出 `configureStore` 与 `createSlice`；React Redux 9.3.0
的固定源码从公共入口导出 Provider、`useSelector` 与 `useDispatch`。官方入门文档分别把两套 API 定位为
Redux 逻辑工具和 React UI 绑定。

### 2. 课程推导

因此，新 React 项目可以把“业务状态逻辑”和“React 组件接入”分到两个明确的 import 来源。阅读陌生代码时，
先看它从 `@reduxjs/toolkit` 还是 `react-redux` 导入，可以帮助判断问题属于 Redux 逻辑层还是 React 组件层。

### 3. 适用边界

源码中的导出关系证明的是当前固定版本的公共入口，不代表所有 API 的内部实现都位于入口文件。这套技术栈也
不是要求所有状态全局化的规则；Redux 官方允许组件保留局部状态，并把 RTK Query 明确定位为服务端数据获取与
缓存方案。旧 Redux API 和 `connect` 在维护旧项目时仍可能出现，但不改变新代码的推荐入口。

## 七、练习

阅读下面的导入：

```ts
import { configureStore, createSlice } from '@reduxjs/toolkit'
import { Provider, useDispatch, useSelector } from 'react-redux'
```

:::exercise
### 练习目标

**要求：** 为上面每项导入写出“Redux 逻辑”或“React 绑定”。再选择一个你正在开发的界面状态，说明它为什么
应保留在组件本地，或为什么需要跨组件协调。若它来自服务端，额外写出谁负责请求与缓存，避免默认复制到两个位置。

**验收：** 能正确把 `configureStore`、`createSlice` 归为 Redux 逻辑，把 `Provider`、`useDispatch` 与
`useSelector` 归为 React 绑定；所选状态拥有唯一且能解释的所有者。

**参考答案：**

```ts
import { configureStore, createSlice } from '@reduxjs/toolkit' // Redux 逻辑
import { Provider, useDispatch, useSelector } from 'react-redux' // React 绑定

const toolkitApis = { configureStore, createSlice }
const reactBindings = { Provider, useDispatch, useSelector }

type StateOwnershipAnswer = {
  localState: string
  sharedClientState: string
  serverStateOwner: string
}

const answer: StateOwnershipAnswer = {
  localState: '任务编辑框是否展开，只影响当前组件',
  sharedClientState: '当前选中的项目需要由导航栏和任务列表共同读取',
  serverStateOwner: '项目详情由数据请求与缓存层负责，不再复制一份到组件和 Redux store',
}

console.log({ toolkitApis, reactBindings, answer })
```
:::

## 八、本节小结

- Redux 提供共享状态组织模型，Redux Toolkit 提供现代 Redux 逻辑的推荐工具，React Redux 提供 React 绑定层。
- 新 React 项目通常安装 `@reduxjs/toolkit` 和 `react-redux`，并从正确的包导入 API。
- 先确定状态所有权，再决定是否使用 Redux；局部交互和服务端缓存不能因为安装 Redux 而失去边界。
- RTK Query 位于 Redux Toolkit 包内，但完整的服务端状态策略不属于本课。

## 九、参考资料

- [Redux Toolkit Getting Started](https://github.com/reduxjs/redux-toolkit/blob/576a02f8056fbee2dcaddb4d2e4d2da3b7937c58/docs/introduction/getting-started.md) - 支持 Redux Toolkit 的定位、安装方式、工具范围与 RTK Query 的包边界。
- [Redux Toolkit Public Exports](https://github.com/reduxjs/redux-toolkit/blob/576a02f8056fbee2dcaddb4d2e4d2da3b7937c58/packages/toolkit/src/index.ts) - 证明固定版本主入口导出 `configureStore` 与 `createSlice`。
- [React Redux Getting Started](https://github.com/reduxjs/react-redux/blob/4134f88f179c46d3ae9c4ee7baaa589ff0fecfa8/docs/introduction/getting-started.md) - 支持 React Redux 的官方绑定层定位以及 Provider、Hooks 的职责。
- [React Redux Public Exports](https://github.com/reduxjs/react-redux/blob/4134f88f179c46d3ae9c4ee7baaa589ff0fecfa8/src/exports.ts) - 证明固定版本公共入口导出 Provider、`useSelector` 与 `useDispatch`。
- [Redux Organizing State](https://github.com/reduxjs/redux/blob/71606661ac515bdd64c199a6bb508401c7cf736f/docs/faq/OrganizingState.md) - 支持组件局部状态与 Redux 状态所有权的判断依据。
- [Redux Side Effects Approaches](https://github.com/reduxjs/redux/blob/71606661ac515bdd64c199a6bb508401c7cf736f/docs/usage/side-effects-approaches.mdx) - 支持 RTK Query 的服务端数据获取与缓存边界。
- [Redux Toolkit npm Latest Metadata](https://registry.npmjs.org/@reduxjs%2ftoolkit/latest) - 支持本课核验时的稳定版本与固定仓库提交。
- [React Redux npm Latest Metadata](https://registry.npmjs.org/react-redux/latest) - 支持本课核验时的稳定版本与固定仓库提交。
