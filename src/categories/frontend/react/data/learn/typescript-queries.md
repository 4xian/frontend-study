---
id: react.data.learn.basics.typescript-queries
type: lesson
title: TypeScript 查询
summary: 让查询函数、查询数据、查询键和条件禁用保持一致的 TypeScript 类型推断。
domain: frontend
technology: react
module: data
stage: basics
level: beginner
estimatedMinutes: 45
prerequisites:
  - react.data.learn.basics.conditional-queries
related:
  - react.data.learn.basics.query-key
  - react.data.learn.basics.query-status
tags:
  - TanStack Query
  - TypeScript
  - type inference
  - QueryFunctionContext
  - skipToken
  - type-safe query
appliesTo: TanStack Query 5.102.8、React 19.2.8、TypeScript 7.0.2
verifiedAt: 2026-09-09
objectives:
  - 为查询函数定义稳定的服务端数据类型并让 useQuery 自动推断 data。
  - 使用 QueryFunctionContext 的泛型约束 queryKey 与 queryFn 的参数。
  - 使用 skipToken 类型安全地禁用没有有效条件的查询。
  - 解释默认错误类型、显式泛型和错误收窄之间的取舍。
  - '识别 skipToken 与 enabled: false 在 refetch 能力上的差异。'
recap:
  - 优先给请求函数和领域数据定义类型，让 useQuery 从 queryFn 推断结果。
  - queryKey 的元组类型可以约束 QueryFunctionContext 中的参数位置和类型。
  - skipToken 把条件缺失表达为类型安全的 queryFn 分支，条件存在时恢复正常推断。
  - 'skipToken 查询不能调用 useQuery 返回的 refetch；需要手动触发时使用 enabled: false。'
  - 只写一个 useQuery 泛型可能导致其他泛型推断丢失，优先使用类型化 queryFn 和窄化。
sources:
  - title: TypeScript
    url: https://tanstack.com/query/latest/docs/framework/react/typescript
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 内联 query options 时 useQuery 可以自动推断数据类型。
      - skipToken 用于 TypeScript 条件禁用，并保持 queryFn 的类型安全。
      - 默认错误类型可以通过全局 Register 扩展，但本课使用调用点的默认 Error。
  - title: Disabling/Pausing Queries
    url: https://tanstack.com/query/latest/docs/framework/react/guides/disabling-queries
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - 'skipToken 是 enabled: false 的类型安全替代方案。'
      - skipToken 查询调用 refetch 会因为没有可执行 queryFn 而失败。
  - title: useQuery Reference
    url: https://tanstack.com/query/latest/docs/framework/react/reference/useQuery
    sourceType: official-reference
    appliesTo: TanStack Query 5.102.8
    claims:
      - useQuery 结果的 data、error 和 queryKey 泛型定义了查询的类型边界。
  - title: TypeScript Handbook - Narrowing
    url: https://www.typescriptlang.org/docs/handbook/2/narrowing.html
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 控制流检查会缩窄联合类型，类型谓词必须与函数实际检查的结构一致。
  - title: TypeScript 4.9 Release Notes - The satisfies Operator
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html
    sourceType: official-reference
    appliesTo: TypeScript 4.9 及以上
    claims:
      - satisfies 会校验表达式是否符合目标类型，同时保留表达式自身的具体类型。
  - title: React Query type declarations
    url: https://unpkg.com/@tanstack/react-query@5.102.8/src/types.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - UseQueryOptions 和 UseQueryResult 以 TQueryFnData、TError、TData、TQueryKey 描述查询类型。
  - title: skipToken source
    url: https://unpkg.com/@tanstack/query-core@5.102.8/src/utils.ts
    sourceType: source-code
    appliesTo: TanStack Query 5.102.8
    claims:
      - skipToken 是查询核心识别的特殊 queryFn 标记，不能被当作真正的函数执行。
---

# TypeScript 查询

## 一、学习目标

- 为查询函数定义稳定的服务端数据类型并让 `useQuery` 自动推断 `data`。
- 使用 `QueryFunctionContext` 的泛型约束 `queryKey` 与 `queryFn` 的参数。
- 使用 `skipToken` 类型安全地禁用没有有效条件的查询。
- 解释默认错误类型、显式泛型和错误收窄之间的取舍。
- 识别 `skipToken` 与 `enabled: false` 在 `refetch` 能力上的差异。

## 二、为什么需要类型安全的查询

查询函数把网络响应带进组件。若响应类型只停留在 `any` 或 `unknown`，组件就无法可靠地知道字段是否存在；
若查询键和请求参数类型不一致，切换条件时还可能把错误值传给接口。

TanStack Query 的类型会沿着查询函数、查询键和结果一路传递。把类型放在请求函数和 Key 的边界上，组件通常
不需要重复填写泛型，就能获得 `data`、`error` 和 `queryFn` 上下文的提示。

## 三、核心概念

### 1. 让 queryFn 成为类型推断起点

先定义领域数据，再让请求函数声明 `Promise<User>`。内联到 `useQuery` 时，`query.data` 会被推断为
`User | undefined`，不需要手动写 `useQuery<User>`。

```tsx
type User = {
  id: string
  name: string
  role: 'admin' | 'member'
}

/** 读取一个类型明确的用户。 */
async function fetchUser(userId: string): Promise<User> {
  const response = await fetch(`/api/users/${userId}`)
  if (!response.ok) throw new Error('读取用户失败')
  return response.json() as Promise<User>
}

const query = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
})

// query.data?.role 会被限制为 'admin' | 'member'
```

类型断言只描述接口已经确认的响应形状；如果接口不可信，应该在请求边界运行校验，再返回经过校验的领域
类型。类型断言本身不会在运行时检查 JSON。

### 2. 为 QueryFunctionContext 约束 queryKey

请求函数需要读取 Key 中的条件时，可以给 Key 声明只读元组类型：

```tsx
type UserQueryKey = readonly ['user', string]

/** 从类型化查询键读取用户编号。 */
async function fetchUserByKey({
  queryKey,
}: QueryFunctionContext<UserQueryKey>): Promise<User> {
  const [, userId] = queryKey
  return fetchUser(userId)
}

useQuery({
  queryKey: ['user', userId] satisfies UserQueryKey,
  queryFn: fetchUserByKey,
})
```

这样 Key 的顺序和第二项类型由一个地方决定。影响返回结果的条件都应该进入 Key；不要只在闭包里读取一个
外部变量，却让 Key 看起来与实际请求无关。

### 3. 使用 skipToken 表达条件缺失

`skipToken` 是 TanStack Query 为 TypeScript 提供的类型安全禁用标记。条件不存在时把 `queryFn` 设为
`skipToken`，条件存在时返回真正的函数：

```tsx
import { skipToken, useQuery } from '@tanstack/react-query'

const query = useQuery({
  queryKey: ['user', userId],
  queryFn: userId ? () => fetchUser(userId) : skipToken,
})
```

分支中的 `userId` 会被 TypeScript 窄化为非空字符串，查询函数不需要使用非空断言。`skipToken` 不会执行请求，
也不会因为空条件创建一个需要实现的假 queryFn。

### 4. skipToken 与 enabled: false 的选择

两者都能表达“暂时不自动请求”，但手动触发能力不同：

| 方式 | 条件缺失时的类型安全 | `refetch` |
| --- | --- | --- |
| `enabled: false` | 需要保证 queryFn 自己能处理当前条件 | 可以手动执行 |
| `queryFn: skipToken` | 条件存在时才提供真正的 queryFn | 不可用，会缺少可执行 queryFn |

需要“用户点击后执行”时选择 `enabled: false` 并提供可执行的 queryFn；需要让条件缺失在类型层面不可调用时，
选择 `skipToken`，让条件变化通过 React 状态和 `queryKey` 声明。

### 5. 默认错误类型与显式泛型

TanStack Query 默认把 `error` 视为 `Error`。这适合使用 `throw new Error()` 的请求函数：

```tsx
const query = useQuery({ queryKey: ['user', userId], queryFn: () => fetchUser(userId) })

if (query.isError) {
  return <p role="alert">{query.error.message}</p>
}
```

如果请求库会抛出专用错误类型，优先使用它提供的类型守卫进行收窄。不要只为改变错误类型而填写一个泛型，
因为 `useQuery` 还有数据、选择结果和 Key 等泛型，部分显式泛型可能使其他位置失去推断。确实需要完整控制
所有边界时，再按 `UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>` 的顺序全部声明。

## 四、用法与示例

### 1. 让组件消费推断结果

```tsx
/** 根据可选用户编号读取并显示用户。 */
function UserCard({ userId }: { userId: string | undefined }): ReactElement {
  const query = useQuery({
    queryKey: ['user', userId],
    queryFn: userId ? () => fetchUser(userId) : skipToken,
  })

  if (!userId) return <p>请选择用户</p>
  if (query.isPending) return <p>正在读取</p>
  if (query.isError) return <p role="alert">{query.error.message}</p>
  return <p>{query.data.name}（{query.data.role}）</p>
}
```

组件只处理查询状态和已推断的数据类型。`query.data` 在成功分支中是 `User`，不会要求组件再次断言字段。

### 2. 类型化错误的边界

网络响应的 JSON 不是 TypeScript 类型的证明。请求函数可以先解析为 `unknown`，完成最小运行时检查后再返回
`User`；这样错误会在接口边界暴露，而不是在深层 JSX 中才出现。

```tsx
/** 判断未知响应是否满足完整用户结构。 */
function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    (candidate.role === 'admin' || candidate.role === 'member')
  )
}

/** 读取并校验用户响应。 */
async function fetchCheckedUser(userId: string): Promise<User> {
  const response = await fetch(`/api/users/${userId}`)
  if (!response.ok) throw new Error('读取用户失败')
  const value: unknown = await response.json()
  if (!isUser(value)) throw new Error('用户响应格式不正确')
  return value
}
```

运行时校验属于请求函数的职责；它不需要改变 `useQuery` 的基本类型推断方式。

### 3. 保持 Key 和参数同步

```tsx
type ArticleQueryKey = readonly ['article', string | undefined]

/** 根据可选文章编号创建类型安全的查询。 */
function useArticle(articleId: string | undefined) {
  return useQuery({
    queryKey: ['article', articleId] satisfies ArticleQueryKey,
    queryFn: articleId ? () => fetchArticle(articleId) : skipToken,
  })
}
```

当 `articleId` 改变时，Key 和 queryFn 一起描述新的请求；当它为空时，`skipToken` 保持查询不可执行。

## 五、用法示例：用类型检查代替浏览器 Demo

本课的结果发生在 TypeScript 编译期：`data` 的字段、查询键元组和 `skipToken` 分支是否合法，都不能用浏览器状态面板代替，因此不额外挂载 Demo。上面的请求函数、查询键和条件分支通过类型检查验证。

## 六、易错使用提示

:::pitfalls
### 错误：让 queryFn 返回 any

**触发条件：** 请求函数没有声明返回类型，并把未经类型约束的客户端结果直接返回。

**原因：** `useQuery` 会沿用 queryFn 的返回类型；`any` 会让 data 的字段访问失去检查。

**后果：** 拼错字段、错误处理空值或误用数据结构时，TypeScript 无法给出反馈。

**错误示例：**

```tsx
/** 返回没有类型边界的响应。 */
async function fetchUser(userId: string) {
  return fetch(`/api/users/${userId}`).then((response) => response.json())
}
```

**正确写法：**

```tsx
/** 返回明确的用户类型。 */
async function fetchUser(userId: string): Promise<User> {
  const response = await fetch(`/api/users/${userId}`)
  if (!response.ok) throw new Error('读取用户失败')
  return response.json() as Promise<User>
}
```

**验证方式：** 尝试读取 `query.data?.missingField`，确认编译器会报告字段不存在。

### 错误：用非空断言掩盖条件缺失

**触发条件：** 参数类型是 `string | undefined`，却在 queryFn 中写 `userId!`。

**原因：** 非空断言只关闭编译器检查，不会让运行时值变为有效字符串。

**后果：** 条件缺失时仍可能请求 `/api/users/undefined`。

**错误示例：**

```tsx
useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId!),
})
```

**正确写法：**

```tsx
useQuery({
  queryKey: ['user', userId],
  queryFn: userId ? () => fetchUser(userId) : skipToken,
})
```

**验证方式：** 保持 userId 为 undefined，确认 queryFn 不执行且代码不包含非空断言。

### 错误：从 skipToken 查询调用 refetch

**触发条件：** 条件缺失时使用 `skipToken`，同时保留一个手动刷新按钮。

**原因：** `skipToken` 代表没有可执行的 queryFn，refetch 无法恢复被跳过的函数。

**后果：** 点击按钮会得到缺少 queryFn 的错误，而不是发起条件查询。

**错误示例：**

```tsx
const query = useQuery({
  queryKey: ['user', userId],
  queryFn: userId ? () => fetchUser(userId) : skipToken,
})

<button onClick={() => void query.refetch()}>读取</button>
```

**正确写法：**

```tsx
const query = useQuery({
  queryKey: ['user', submittedUserId],
  queryFn: () => fetchUser(submittedUserId),
  enabled: submittedUserId !== '',
})
```

**验证方式：** 需要按钮手动执行时使用 enabled，并确认 queryFn 在禁用状态下仍是有效函数。

### 错误：查询键类型与请求参数不同步

**触发条件：** queryFn 读取用户 ID，但 queryKey 只写固定字符串或使用不同类型的参数。

**原因：** Key 没有准确描述请求输入，也没有通过元组类型约束参数。

**后果：** 不同用户可能错误共享缓存，或请求函数收到与预期不符的值。

**错误示例：**

```tsx
useQuery({ queryKey: ['user'], queryFn: () => fetchUser(userId) })
```

**正确写法：**

```tsx
useQuery({
  queryKey: ['user', userId] satisfies UserQueryKey,
  queryFn: fetchUserByKey,
})
```

**验证方式：** 改变 Key 的第二项类型，确认 TypeScript 在调用点或 QueryFunctionContext 中报告错误。

### 错误：只填写一个泛型改变错误类型

**触发条件：** 为了获得专用错误类型，直接写一个不完整的 useQuery 泛型列表。

**原因：** useQuery 的多个泛型相互关联，部分显式指定可能让 data、select 或 queryKey 的推断退化。

**后果：** 调用点需要补更多断言，原本由 queryFn 提供的推断信息被覆盖。

**错误示例：**

```tsx
const query = useQuery<User, ApiError>({
  queryKey: ['user', userId],
  queryFn: () => loadUser(userId),
})
```

**正确写法：**

```tsx
type ApiError = Error & { code: string }

/** 复用已定义的用户请求，并保留明确的数据类型。 */
async function loadUser(userId: string): Promise<User> {
  return fetchUser(userId)
}

/** 将默认 Error 收窄为带业务编码的 API 错误。 */
function isApiError(error: Error): error is ApiError {
  return 'code' in error && typeof (error as { code?: unknown }).code === 'string'
}

const query = useQuery({
  queryKey: ['user', userId],
  queryFn: () => loadUser(userId),
})

if (query.error && isApiError(query.error)) {
  return <p>{query.error.code}</p>
}
```

**验证方式：** 悬停查看 data 和 error 类型，确认 data 仍从 queryFn 推断，专用错误通过类型守卫收窄。
:::

## 七、源码推导与适用场景

1. **官方事实：** 当前 `UseQueryOptions` 使用 `TQueryFnData`、`TError`、`TData` 和 `TQueryKey` 描述查询；
   核心的 `skipToken` 是特殊标记，执行器会拒绝把它当作普通函数调用。
2. **课程推导：** 让请求函数返回值和 Query Key 先拥有明确类型，通常比在每个 `useQuery` 调用点重复泛型更稳；
   条件缺失时用 `skipToken` 可以同时表达运行边界和类型边界。
3. **适用边界：** `skipToken` 适合类型安全的条件读取，但不能满足手动 `refetch` 的需求；共享查询配置和全局
   类型注册属于更高层的数据层组织问题，应在专门的配置复用或架构主题中处理。

## 八、练习

:::exercise
### 练习目标

**要求：** 编写一个 `UserCard`，接收 `string | undefined` 的用户 ID；使用 `skipToken` 在没有 ID 时禁用查询，
   让 `query.data` 推断为 `User`，并分别处理选择用户、首次加载、错误和成功状态。

**验收：** TypeScript 编译通过；没有用户 ID 时不会执行请求；成功分支可以直接读取 `name` 和 `role`，不使用类型
   断言；不要调用 skipToken 查询的 `refetch`。

**参考答案：**

```tsx
import { skipToken, useQuery } from '@tanstack/react-query'
import type { ReactElement } from 'react'

type User = {
  id: string
  name: string
  role: 'admin' | 'member'
}

/** 读取一个类型明确的用户。 */
async function fetchUser(userId: string): Promise<User> {
  const response = await fetch(`/api/users/${userId}`)
  if (!response.ok) throw new Error('读取用户失败')
  return response.json() as Promise<User>
}

/** 根据可选用户编号读取并显示用户。 */
export function UserCard({ userId }: { userId: string | undefined }): ReactElement {
  const query = useQuery({
    queryKey: ['user', userId],
    queryFn: userId ? () => fetchUser(userId) : skipToken,
  })

  if (!userId) return <p>请选择用户</p>
  if (query.isPending) return <p>正在读取...</p>
  if (query.isError) return <p role="alert">{query.error.message}</p>
  return <p>{query.data.name}（{query.data.role}）</p>
}
```
:::

## 九、本节小结

- 先类型化请求函数，再让 `useQuery` 推断 `data` 和成功分支字段。
- 用只读 Key 元组约束 `QueryFunctionContext`，确保 Key 与请求参数同步。
- 用 `skipToken` 表达条件缺失，避免用非空断言掩盖无效请求。
- `skipToken` 不能手动 `refetch`；需要手动请求时使用 `enabled: false`。
- 不要随意只填写一个 `useQuery` 泛型；优先保持请求函数、错误和 Key 的推断链完整。

## 十、参考资料

- [TypeScript](https://tanstack.com/query/latest/docs/framework/react/typescript) - 支持查询类型推断与 skipToken。
- [Disabling/Pausing Queries](https://tanstack.com/query/latest/docs/framework/react/guides/disabling-queries) - 支持 skipToken 与 refetch 边界。
- [useQuery Reference](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery) - 支持查询泛型和结果类型。
- [TypeScript Handbook - Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) - 支持控制流收窄与类型谓词。
- [TypeScript 4.9 Release Notes - The satisfies Operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html) - 支持 satisfies 的类型校验行为。
- [React Query type declarations](https://unpkg.com/@tanstack/react-query@5.102.8/src/types.ts) - 支持当前版本类型参数定义。
- [skipToken source](https://unpkg.com/@tanstack/query-core@5.102.8/src/utils.ts) - 支持特殊 queryFn 标记的实现事实。
