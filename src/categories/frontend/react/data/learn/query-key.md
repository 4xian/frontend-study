---
id: react.data.learn.basics.query-key
type: lesson
title: Query Key
summary: 为每份查询声明稳定且唯一的数组标识，让查询函数依赖的变量与它读取的数据保持一致。
domain: frontend
technology: react
module: data
stage: basics
level: beginner
estimatedMinutes: 35
prerequisites:
  - react.data.learn.basics.query-function-and-fetch
related: []
tags:
  - TanStack Query
  - Query Key
  - queryKey
  - 查询标识
  - 确定性哈希
appliesTo: TanStack Query 5.102.8、React 19.2.8
verifiedAt: 2026-08-31
objectives:
  - 能说明 queryKey 是查询数据的唯一数组标识。
  - 能为固定资源和带参数的资源编写数组形式的 queryKey。
  - 能把 queryFn 依赖的动态变量放入同一查询的 queryKey。
  - 能判断对象成员顺序和数组成员顺序对查询 key 的不同影响。
  - 能避免使用不可序列化值或与数据无关的变量作为查询 key 的组成。
recap:
  - Query Key 顶层必须是数组，并且要唯一描述它对应的数据。
  - 查询函数依赖会变化的变量时，应把这些变量放入 queryKey。
  - key 中对象的属性顺序不影响相等性，但数组项顺序会影响相等性。
  - key 应由可被 JSON.stringify 序列化的值组成，不要放入函数、Promise 或 DOM 节点。
  - 本课只建立查询身份规则；大型应用的 key 组织约定另行学习。
sources:
  - title: Query Keys
    url: https://tanstack.com/query/latest/docs/framework/react/guides/query-keys
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - Query Key 顶层必须是数组，并且可以包含字符串、原始值和嵌套对象。
      - Query Key 必须可被 JSON.stringify 序列化，并且唯一描述查询数据。
      - 对象属性顺序不会改变 key 的相等性，但数组项顺序会改变相等性。
      - queryFn 依赖的变量应包含在 queryKey 中，变量变化时查询会按 key 区分数据。
  - title: useQuery Reference
    url: https://tanstack.com/query/latest/docs/framework/react/reference/useQuery
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - useQuery 的 queryKey 是必需选项，并用于标识查询。
      - queryFn 接收包含 queryKey 的 QueryFunctionContext。
---

# Query Key

## 一、学习目标

- 说明 `queryKey` 是查询数据的唯一数组标识。
- 为固定资源和带参数的资源编写数组形式的 `queryKey`。
- 把 `queryFn` 依赖的动态变量放入同一查询的 `queryKey`。
- 判断对象成员顺序和数组成员顺序对查询 key 的不同影响。
- 避免使用不可序列化值或与数据无关的变量作为查询 key 的组成。

## 二、为什么需要 Query Key

同一个应用可能同时读取全部任务、已完成任务和某个任务详情。它们都可以由 `useQuery` 执行，但返回的
数据不是同一份事实。TanStack Query 需要一个明确的身份，才能判断两个查询是否描述同一份数据。

`queryKey` 就是这份身份。它不是请求 URL 的字符串别名，也不是给开发者看的标签；它要完整描述查询函数
读取的数据。查询函数依赖的筛选条件、资源 ID 等变量如果改变，查询 key 也应该随之改变。

## 三、Query Key 的核心模型

### 1. 顶层必须是数组

当前版本的 Query Key 顶层必须是数组。最简单的固定资源可以只包含一个字符串：

```tsx
useQuery({
  queryKey: ['todos'],
  queryFn: loadTodos,
})
```

数组中的值可以继续包含字符串、数字、布尔值和可序列化对象。数组形式让固定资源和带参数资源使用同一套
声明方式。

### 2. key 要唯一描述查询数据

如果两个查询读取的数据不同，它们的 key 就不能相同；如果两个查询确实描述同一份数据，key 的结构应保持
一致：

```tsx
// 全部任务
useQuery({ queryKey: ['tasks'], queryFn: loadAllTasks })

// 已完成任务，是另一份数据
useQuery({ queryKey: ['tasks', { status: 'done' }], queryFn: loadDoneTasks })
```

这里的 `status` 不是装饰信息，而是返回数据的组成条件。省略它会让不同筛选结果共享同一个身份。

### 3. 把动态变量放入 key

查询函数使用会变化的变量时，把变量放入 key，并在函数中从 `QueryFunctionContext.queryKey` 读取：

```tsx
type TaskQueryKey = readonly ['tasks', { status: 'all' | 'done' }]

/** 根据查询 key 中的筛选条件读取任务。 */
async function loadTasks({
  queryKey,
}: QueryFunctionContext<TaskQueryKey>): Promise<Task[]> {
  const [, filters] = queryKey
  return fetchTasks(filters.status)
}
```

当 `status` 从 `all` 变成 `done` 时，组件声明的是另一个 key，查询函数也会收到与该 key 对应的变量。不要
只把变量留在闭包里却让 key 保持不变。

### 4. 对象顺序与数组顺序

TanStack Query 对 key 做确定性哈希。对象成员的书写顺序不影响相等性：

```tsx
['todos', { status, page }]
['todos', { page, status }]
```

这两种 key 的对象内容相同，因此被视为相等。数组项的顺序则是语义的一部分：

```tsx
['todos', status, page]
['todos', page, status]
```

这两种 key 不相等。数组项的位置应表达稳定的层次或参数顺序，不要通过随意调换顺序表示同一份数据。

### 5. 只放可序列化值

Query Key 必须能用 `JSON.stringify` 序列化。字符串、数字、布尔值、数组和普通对象适合作为 key 的成员；
函数、Promise、DOM 节点等运行时对象不适合作为查询身份。key 只应包含能描述数据的值，不要把无关的组件
实例或临时对象放进去。

## 四、用法与示例

### 1. 固定资源

没有动态参数的资源使用常量数组即可：

```tsx
const profileQuery = useQuery({
  queryKey: ['profile'],
  queryFn: loadProfile,
})
```

固定 key 的重点是保持资源名称稳定；不要在每次渲染中把随机数或当前时间追加进去，否则每次都变成一份新
的查询身份。

### 2. 详情资源

读取某个实体时，把实体 ID 放在 key 中：

```tsx
type TodoQueryKey = readonly ['todo', number]

function TodoDetail({ todoId }: { todoId: number }) {
  const todoQueryKey: TodoQueryKey = ['todo', todoId]
  const todoQuery = useQuery({
    queryKey: todoQueryKey,
    queryFn: ({ queryKey }) => fetchTodoById(queryKey[1]),
  })

  return todoQuery.data ? <h2>{todoQuery.data.title}</h2> : null
}
```

`todoId` 改变时，key 同时改变；每个 ID 的数据因此拥有自己的查询身份。请求函数如何检查 HTTP 响应属于
上一课的请求合同，本例只展示变量与 key 的对应关系。

### 3. 带筛选条件的列表

多个筛选条件可以放进一个普通对象中，保持 key 结构容易阅读：

```tsx
const filters = { status: 'done', page: 1 }

const tasksQuery = useQuery({
  queryKey: ['tasks', filters],
  queryFn: () => fetchTasks(filters),
})
```

对象适合承载同一列表的选项集合。对象属性顺序不承担语义，但数组项顺序仍然承担语义；后续课程再讨论
大型应用如何统一这些 key 的组织方式。

## 五、用法示例：观察变量如何进入 Query Key

下面的 Demo 使用三个固定状态筛选。每次切换筛选按钮，`queryKey` 都会带上新的 `status`，查询函数从
上下文读取它并返回对应任务。界面同时显示当前 key，便于把“筛选变量”和“查询身份”对照起来。

:::demo{id="react.data.learn.basics.query-key.query-key-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：把动态变量留在闭包中却不放入 key

**触发条件：** `queryFn` 使用 `status` 或 `todoId`，但 `queryKey` 只有固定字符串。

**原因：** 把 key 当成请求函数的标签，没有把它当成数据身份。

**后果：** 不同变量对应的数据共享同一个查询身份，查询结果可能无法按变量区分。

**错误示例：**

```tsx
function TodoDetail({ todoId }: { todoId: number }) {
  return useQuery({
    queryKey: ['todo'],
    queryFn: () => fetchTodoById(todoId),
  })
}
```

**正确写法：**

```tsx
function TodoDetail({ todoId }: { todoId: number }) {
  return useQuery({
    queryKey: ['todo', todoId],
    queryFn: () => fetchTodoById(todoId),
  })
}
```

**验证方式：** 修改 `todoId`，确认 key 的数组内容也随之改变。

### 错误：用字符串代替顶层数组

**触发条件：** 把 `'todos'` 直接作为 `queryKey`。

**原因：** 沿用自定义缓存或旧示例中的字符串标识。

**后果：** 类型检查会拒绝该声明；开发环境运行时也会提示 `queryKey` 必须使用数组形式，但不能依赖运行时提示才发现问题。

**错误示例：**

```tsx
useQuery({
  queryKey: 'todos',
  queryFn: loadTodos,
})
```

**正确写法：**

```tsx
useQuery({
  queryKey: ['todos'],
  queryFn: loadTodos,
})
```

**验证方式：** 检查 `queryKey` 的顶层值是否为数组。

### 错误：用随机值或当前时间制造 key

**触发条件：** 在 key 中追加 `Math.random()`、`Date.now()` 或每次渲染新生成的请求编号。

**原因：** 把一次执行的临时标识误当成数据身份。

**后果：** 每次渲染都得到不同 key，查询无法稳定识别同一份数据。

**错误示例：**

```tsx
useQuery({
  queryKey: ['todos', Date.now()],
  queryFn: loadTodos,
})
```

**正确写法：**

```tsx
useQuery({
  queryKey: ['todos'],
  queryFn: loadTodos,
})
```

**验证方式：** 连续两次渲染组件，确认同一资源的 key 内容不因渲染次数改变。

### 错误：调换数组项顺序表示同一 key

**触发条件：** 一个位置使用 `['todos', status, page]`，另一个位置使用 `['todos', page, status]`，并认为两者等价。

**原因：** 把数组项当成无序集合，而不是有序的查询身份。

**后果：** 两个声明会被视为不同 key，无法共享同一查询身份。

**错误示例：**

```tsx
const firstKey = ['todos', 'done', 1]
const secondKey = ['todos', 1, 'done']
```

**正确写法：**

```tsx
const firstKey = ['todos', { status: 'done', page: 1 }]
const secondKey = ['todos', { page: 1, status: 'done' }]
```

**验证方式：** 比较两组 key 的成员位置和对象属性，确认只有对象属性顺序变化时才表达同一组参数。

### 错误：把不可序列化对象放入 key

**触发条件：** 将函数、Promise、DOM 节点或其他运行时实例直接作为 key 成员。

**原因：** 把执行依赖或对象引用误当成可持久的查询身份。

**后果：** key 不能可靠地序列化和比较，查询身份可能不稳定或无法按预期区分。

**错误示例：**

```tsx
const loadOptions = () => ({ preview: true })

useQuery({
  queryKey: ['todos', loadOptions],
  queryFn: loadTodos,
})
```

**正确写法：**

```tsx
useQuery({
  queryKey: ['todos', { preview: true }],
  queryFn: loadTodos,
})
```

**验证方式：** 检查 key 是否只包含可以通过 JSON.stringify 表达的数据值。
:::

## 七、源码推导与适用场景

### 1. 官方事实

官方 Query Keys 指南规定，Query Key 顶层必须是数组，并且只要能被 `JSON.stringify` 序列化且唯一描述
查询数据，就可以包含字符串、原始值和嵌套对象。指南还说明，对象属性顺序不影响 key 的确定性哈希，而数组
项顺序会影响相等性；queryFn 依赖的变量应放入 key。

### 2. 课程推导

可以用一个判断问题设计 key：只要这个值改变，queryFn 可能读取的数据是否也会改变？如果答案是“会”，就
应将它放进 key；如果只是组件渲染所需的临时状态，就不应把它伪装成远程数据身份。

### 3. 适用边界

本课适合为单个查询声明身份。大型项目的 key 工厂、跨模块命名约定、失效匹配和缓存操作会在后续课程根据
实际场景展开；本课不把这些组织策略提前合并进基础规则。

## 八、练习

:::exercise
### 练习目标

**要求：** 为一个按 `category` 和 `page` 读取商品列表的查询编写 `productsQueryKey` 与 `useQuery` 配置。
`queryFn` 需要使用这两个变量，并让 key 能区分不同分类或页码。

**验收：** `queryKey` 顶层是数组；`category` 和 `page` 都出现在 key 中；两个变量的值变化时 key 内容也
变化；key 只包含可序列化值。

**参考答案：**

```tsx
import { useQuery } from '@tanstack/react-query'

type Product = {
  id: string
  name: string
}

type ProductsQueryKey = readonly ['products', { category: string; page: number }]

const productRows: Product[] = [
  { id: 'p-1', name: '键盘' },
  { id: 'p-2', name: '显示器' },
]

/** 模拟按分类和页码返回商品数据。 */
function fetchProducts(category: string, page: number): Promise<Product[]> {
  return Promise.resolve(
    productRows.map((product) => ({
      ...product,
      name: `${category}-${page}-${product.name}`,
    })),
  )
}

/** 使用分类和页码读取商品列表。 */
async function loadProducts(category: string, page: number): Promise<Product[]> {
  return fetchProducts(category, page)
}

/** 声明包含所有查询变量的商品列表 key。 */
function ProductsList({ category, page }: { category: string; page: number }) {
  const productsQueryKey: ProductsQueryKey = ['products', { category, page }]
  const productsQuery = useQuery({
    queryKey: productsQueryKey,
    queryFn: () => loadProducts(category, page),
  })

  return productsQuery.data?.map((product) => <p key={product.id}>{product.name}</p>)
}
```
:::

## 九、本节小结

- Query Key 顶层必须是数组，并且要唯一描述对应的查询数据。
- queryFn 依赖的动态变量必须进入 key，变量变化才有不同的查询身份。
- 对象属性顺序不影响确定性哈希，数组项顺序会影响 key 相等性。
- key 只使用可序列化且真正描述数据的值，不放入函数、Promise 或随机标识。

## 十、参考资料

- [Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys) - 数组形式、变量依赖、确定性哈希和序列化规则。
- [useQuery Reference](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery) - `queryKey` 选项与 `QueryFunctionContext`。
