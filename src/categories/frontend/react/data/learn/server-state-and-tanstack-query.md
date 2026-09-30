---
id: react.data.learn.basics.server-state-and-tanstack-query
type: lesson
title: 服务端状态与 TanStack Query
summary: 识别服务端状态和客户端状态的职责边界，并为 React 应用选择合适的数据所有者。
domain: frontend
technology: react
module: data
stage: basics
level: beginner
estimatedMinutes: 30
prerequisites: []
related: []
tags:
  - TanStack Query
  - 服务端状态
  - 客户端状态
  - 数据所有权
appliesTo: TanStack Query 5.102.8、React 19.2.8
verifiedAt: 2026-08-31
objectives:
  - 根据数据来源、共享范围和生命周期，判断一段数据的状态所有权。
  - 说明服务端状态为什么需要处理异步、共享和可能过期的事实。
  - 说明 TanStack Query 负责服务端状态的获取、缓存、同步和更新。
  - 为同时包含远程数据和界面交互的 React 面板划分清晰的数据所有者。
recap:
  - 服务端状态由远程系统拥有，通常异步到达、可被共享并可能过期。
  - 客户端状态由当前界面或客户端应用拥有，服务于交互和本地工作流。
  - TanStack Query 管理服务端状态，不替代 React State、Redux 或 Zustand。
  - 同一面板可以同时使用服务端状态工具和客户端状态工具，但同一事实只能有一个主要所有者。
sources:
  - title: TanStack Query React Overview
    url: https://tanstack.com/query/latest/docs/framework/react/overview
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - TanStack Query 负责服务端状态的获取、缓存、同步与更新。
      - 服务端状态通常由远程持久化系统拥有，具有异步、共享和可能过期的特征。
  - title: TanStack Query Does This Replace Client State?
    url: https://tanstack.com/query/latest/docs/framework/react/guides/does-this-replace-client-state
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - TanStack Query 不替代 Redux、Zustand 等客户端状态工具。
      - 服务端状态与客户端状态可以在同一个应用中并存。
---

# 服务端状态与 TanStack Query

## 一、学习目标

- 根据数据来源、共享范围和生命周期，判断一段数据是服务端状态还是客户端状态。
- 说明服务端状态为什么需要处理异步、共享和可能过期的事实。
- 说明 TanStack Query 负责什么，以及它不负责替代什么。
- 为同时包含远程数据和界面交互的 React 面板划分清晰的数据所有者。

## 二、为什么需要区分两种状态

一个任务面板可能同时显示服务端返回的任务，以及当前用户选择的筛选条件。它们都能改变页面，但并
不是同一种状态：任务由远程系统拥有，筛选条件由当前界面拥有。

如果把两者放进同一个对象，就很难回答“哪个值应该重新从服务器读取”“哪个值只在本次交互中保留”这
类问题。失去网络连接时，任务列表可能暂时无法更新；筛选条件却仍然可以继续改变。清晰的所有权能让
这两种生命周期分别演进。

## 三、服务端状态的特征

服务端状态是由 API、数据库或其他远程持久化系统拥有的事实。它通常有四个特征：

1. **远程拥有：** 浏览器不是最终事实的唯一来源。
2. **异步到达：** 读取需要等待，可能失败或暂时不可用。
3. **可被共享：** 多个组件、页面、窗口或用户可能读取同一份事实。
4. **可能过期：** 其他写入者可能在当前页面之外改变它。

文章、用户资料、任务列表和库存数量通常属于服务端状态。它们不是因为“放在 React 组件里显示”就变
成了客户端状态。

## 四、客户端状态的特征

客户端状态由当前界面或客户端应用拥有，用来描述本地交互和工作流。筛选词、展开面板、弹窗开关和未
提交草稿通常属于客户端状态。

判断一段数据时，可以依次问三个问题：

1. 谁是事实的最终拥有者？
2. 这个值是否需要跨组件或跨页面共享？
3. 这个值是否需要随着远程系统重新同步？

前两个问题指向远程系统、需要同步的事实时，它更可能是服务端状态；如果值只描述当前界面的交互，它
更可能是客户端状态。一个值是否“复杂”或“会变化”不是充分的判断依据。

## 五、TanStack Query 的职责边界

TanStack Query 是服务端状态工具。它围绕远程事实提供获取、缓存、共享、同步和更新所需的运行时能力，
帮助 React 应用处理“这份远程数据目前能否使用、是否需要再次读取”这类问题。

它不是以下工具的替代品：

- React State、Redux 或 Zustand 等客户端状态工具；
- 浏览器 `fetch` 或其他 HTTP 客户端；
- 业务 API、数据库和服务端的最终事实来源。

TanStack Query 与客户端状态工具可以并存。前者拥有远程任务列表，后者拥有当前筛选条件；重要的是不要
为同一份远程事实建立两个需要手动同步的主要副本。

本课只建立状态所有权模型，不展开 TanStack Query 客户端实例、查询声明、查询身份和生命周期状态的完整
使用方式。

## 六、用法示例：远程事实与本地视图

下面的 Demo 使用一个延迟的本地 Promise 模拟远程任务读取。任务列表由 TanStack Query 管理，当前视图筛
选由 React State 管理。切换筛选不会修改远程任务，也不会把筛选条件写进服务端数据。

:::demo{id="react.data.learn.basics.server-state-and-tanstack-query.server-state-boundary-demo"}
:::

观察 Demo 时，先等待任务列表出现，再切换“当前视图”。列表会按筛选条件改变，但任务的标题、负责人和
状态仍来自同一份远程快照。这就是“远程事实”和“本地派生视图”各自拥有自己的生命周期。

## 七、易错使用提示

:::pitfalls
### 错误：把远程数据复制到普通 State

**触发条件：** 请求完成后把任务列表写入 `useState`，并把这个副本当作页面的主要数据源。

**原因：** 只看到数据需要渲染，没有区分远程事实和本地交互。

**后果：** 重新读取、失效或其他页面更新后，副本可能与远程事实不一致。

**错误示例：**

```tsx
const [tickets, setTickets] = useState<Ticket[]>([])

async function loadTickets(): Promise<void> {
  setTickets(await readTickets())
}
```

**正确写法：**

```tsx
const [filter, setFilter] = useState('全部')

// 远程任务由 TanStack Query 负责，filter 只描述当前视图。
const visibleTickets = tickets.filter((ticket) => filter === '全部' || ticket.status === filter)
```

**验证方式：** 重新读取远程任务后，确认页面不需要额外同步一个本地任务副本。

### 错误：把界面筛选写回远程数据

**触发条件：** 为了显示“只看处理中”，直接修改任务对象或把筛选结果保存成新的服务端数据。

**原因：** 把派生视图误认为远程事实。

**后果：** 筛选动作可能覆盖原始任务，其他消费者看到被错误修改的数据。

**错误示例：**

```tsx
const filteredTickets = tickets.map((ticket) => ({
  ...ticket,
  hidden: ticket.status !== selectedStatus,
}))
```

**正确写法：**

```tsx
const visibleTickets = tickets.filter((ticket) => ticket.status === selectedStatus)
```

**验证方式：** 清空筛选后，确认原始任务字段没有被添加或删除界面专用标记。

### 错误：用客户端 Store 维护远程事实的第二份副本

**触发条件：** 同一份用户资料同时存入 TanStack Query 和 Redux、Zustand 或 Context。

**原因：** 把“多个组件要读取”误解为“必须复制到客户端 Store”。

**后果：** 两份数据需要手动同步，更新顺序不同就会出现旧值覆盖新值。

**错误示例：**

```tsx
const user = useUserQuery()
const dispatch = useDispatch()

useEffect(() => {
  if (user.data) dispatch(saveUser(user.data))
}, [dispatch, user.data])
```

**正确写法：**

```tsx
const user = useUserQuery()
const [isEditing, setIsEditing] = useState(false)
```

**验证方式：** 远程用户更新后，确认页面只需要刷新一个远程事实来源，编辑开关仍保持本地行为。

### 错误：因为状态会变化就统一交给客户端 Store

**触发条件：** 把任务列表、筛选条件和弹窗开关都放进同一个全局对象。

**原因：** 用“会变化”作为唯一的状态分类标准。

**后果：** 远程生命周期和本地交互生命周期耦合，缓存更新时可能重置界面工作流。

**错误示例：**

```tsx
const [workspace, setWorkspace] = useState({
  tickets: [],
  filter: '全部',
  isHelpOpen: false,
})
```

**正确写法：**

```tsx
const [filter, setFilter] = useState('全部')
const [isHelpOpen, setHelpOpen] = useState(false)
// tickets 保留在服务端状态工具的所有权范围内。
```

**验证方式：** 重新获取任务后，确认筛选条件和帮助弹窗不会因为远程数据变化而被重置。
:::

## 八、原理与适用场景

### 1. 官方事实

TanStack Query 官方文档把服务端状态描述为由远程系统持久化、通过异步 API 到达、可能被多个消费者共
享且可能过期的数据。官方同时明确，TanStack Query 是服务端状态工具，不替代 Redux、Zustand 等客户端
状态工具。

### 2. 课程推导

可以用“最终拥有者 -> 是否异步 -> 是否需要同步”来判断状态归属。判断结果后，再让一个主要工具负责这
份事实，避免通过副本把同步责任扩散到多个组件。

### 3. 适用边界

远程文章、任务、用户资料和库存适合进入服务端状态管理；筛选、展开、草稿和弹窗开关适合保留在客户端
状态中。两类状态在一个页面中同时存在是正常的，关键是不要混淆所有权。

## 九、练习

:::exercise
### 练习目标

**要求：** 为一个“订单列表”面板划分状态所有权：将“订单列表”“当前状态筛选”“详情抽屉是否打开”“未提交备注”分别归类为服务端状态或
客户端状态，并为每项写出最终拥有者。

**验收：** 订单列表只有一个主要远程事实来源；筛选、抽屉和未提交备注不需要写回订单列表；重新读取订单
后，三个本地交互值仍能按各自生命周期工作。

**参考答案：** 订单列表是服务端状态，最终拥有者是订单 API 或数据库，由 TanStack Query 管理读取和同步；
当前状态筛选是客户端状态，最终拥有者是当前列表视图；详情抽屉是否打开是客户端状态，最终拥有者是
当前界面；未提交备注是客户端状态，最终拥有者是当前编辑工作流，提交前不属于远程订单事实。
:::

## 十、本节小结

- 服务端状态由远程系统拥有，通常异步、共享且可能过期。
- 客户端状态由当前界面或客户端应用拥有，描述筛选、草稿和其他本地工作流。
- TanStack Query 管理服务端状态，不替代客户端状态工具或 HTTP 客户端。
- 同一面板可以同时使用两类状态工具，但同一远程事实不应维护多个需要手动同步的主要副本。

## 十一、参考资料

- [TanStack Query React Overview](https://tanstack.com/query/latest/docs/framework/react/overview) - 服务端状态的特征以及 TanStack Query 的职责。
- [Does This Replace Client State?](https://tanstack.com/query/latest/docs/framework/react/guides/does-this-replace-client-state) - TanStack Query 与 React State、Redux、Zustand 的职责边界。
