---
id: react.router.learn.basics.query-params-and-url-state
type: lesson
title: 查询参数与 URL 状态
summary: 用 useSearchParams 读写可分享的查询状态，正确处理多值、默认值、编码和导航更新。
domain: frontend
technology: react
module: router
stage: basics
level: beginner
estimatedMinutes: 70
prerequisites:
  - react.router.learn.basics.route-params
related:
  - react.router.learn.basics.link-navigation
  - react.router.learn.basics.dynamic-segments
  - react.router.learn.basics.route-params
tags:
  - React Router
  - useSearchParams
  - URLSearchParams
  - URL state
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-20
objectives:
  - 能判断哪些筛选、搜索和视图选择适合成为可分享、可刷新恢复的 URL 状态。
  - 能用 useSearchParams 和 URLSearchParams 读取单值、多值、空值与缺失值。
  - 能通过 setSearchParams 完整替换或局部更新查询列表，并正确删除键。
  - 能解释 defaultInit、不排队的函数 updater，以及稳定引用仍然可变的边界。
  - 能按标准规则处理空格、字面加号、斜杠和重复键，不手工预编码逻辑值。
recap:
  - 查询参数是 URL 中有顺序、可重复的 name-value 列表，不是普通对象。
  - useSearchParams 返回 URLSearchParams 与会触发导航的 setter。
  - defaultInit 只提供首次读取回退，不会在首次渲染时改写 URL。
  - 局部修改应放进一次函数 updater；同一 tick 的多个 setter 不按 React state 方式排队。
  - Hook 返回引用稳定但对象可变，应只读消费并通过 setter 同步 URL。
sources:
  - title: React Router 8.3.0 Release
    url: https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0
    sourceType: release-note
    appliesTo: React Router 8.3.0
    claims:
      - 8.3.0 是核验时的正式稳定发布，并固定到提交 2edaca7a4f12a50cad002d55d84f73b0cdd462b6。
  - title: npm react-router Latest Metadata
    url: https://registry.npmjs.org/react-router/latest
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - npm latest 在 2026-08-20 返回 8.3.0，预发布版本位于其他 dist-tag。
  - title: React Router 8.3.0 useSearchParams API
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useSearchParams.md#L19-L115
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - useSearchParams 返回 URLSearchParams 与 setter，setter 会触发导航。
      - defaultInit 不会在首次渲染时改写 URL，函数 updater 不支持 React state queueing。
      - searchParams 引用稳定但对象可变，脱离 setter 修改不会同步 URL。
  - title: React Router 8.3.0 Search Params Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/dom/lib.tsx#L2389-L2466
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 固定版本根据 location.search 生成读取结果，并把序列化后的查询交给 navigate。
      - 固定版本向函数 updater 传入当前参数的克隆。
  - title: React Router 8.3.0 createSearchParams Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/dom/dom.ts#L47-L96
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - URLSearchParamsInit 支持字符串、元组、对象、数组值和 URLSearchParams。
      - 默认值只补充当前 URL 中缺失的键。
  - title: React Router 8.3.0 Search Params Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/dom/search-params-test.tsx#L27-L405
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - 官方测试覆盖读取、更新、默认值合并、默认值清除和受阻导航时的参数隔离。
  - title: WHATWG URL Standard - URLSearchParams
    url: https://url.spec.whatwg.org/#urlsearchparams
    sourceType: specification
    appliesTo: WHATWG URL Living Standard
    claims:
      - URLSearchParams 保存有顺序且可重复的 name-value 元组列表。
      - get、getAll、append、set、delete 与迭代按标准列表语义工作。
  - title: WHATWG URL Standard - application/x-www-form-urlencoded
    url: https://url.spec.whatwg.org/#application/x-www-form-urlencoded
    sourceType: specification
    appliesTo: WHATWG URL Living Standard
    claims:
      - 查询字符串解析时加号表示空格，序列化时空格写为加号，其他字符按规则百分号编码。
  - title: React Router 8.3.0 createMemoryRouter API
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/data-routers/createMemoryRouter.md#L19-L31
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - createMemoryRouter 把 history 保存在内存中，可隔离观察查询参数导航。
---

# 查询参数与 URL 状态

## 一、学习目标

- 能判断搜索词、筛选项、排序和视图选择是否应进入 URL。
- 能用 `useSearchParams` 读取当前查询字符串，并区分单值、多值、空值和缺失值。
- 能完整替换查询列表，也能在保留现有键时完成 `append`、`set` 和 `delete`。
- 能说明 `defaultInit`、函数 updater、稳定引用与导航之间的关系。
- 能让 `URLSearchParams` 负责标准编码，避免重复键丢失和双重编码。

## 二、为什么需要 URL 状态

同一个 pathname 可以对应许多不同视图：课程目录可能有搜索词、技术筛选、排序方式和卡片/列表模式。
如果这些选择只保存在组件 State 中，刷新会丢失，复制链接也无法还原当前视图：

```text
/catalog?query=router&brand=react&brand=typescript&view=cards
```

查询参数把这类状态放进 URL。用户可以分享链接、刷新恢复，也可以让 Router 记录状态变化。它适合表达
“页面当前展示什么”，但不适合保存密码、访问令牌、大对象或只在一个组件瞬间存在的交互细节。

```tsx
function CatalogPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('query') ?? ''
  const brands = searchParams.getAll('brand')

  return <CatalogResults query={query} brands={brands} />
}
```

这里不需要从 `window.location.search` 手动拆字符串。Router 提供当前查询快照，Web 平台的
`URLSearchParams` 负责标准解析。

## 三、核心概念

### 1. 查询部分不参与 pathname 段匹配

问号后的查询部分描述同一页面的可选状态：

```text
/catalog?query=router&page=2
```

pathname 仍是 `/catalog`。RouteObject 用 pathname 决定匹配哪个页面，组件再读取 `query` 和 `page`。
动态 path 参数通常标识资源层级，查询参数通常表达筛选、排序、分页或视图选择；两者不能靠名字互换。

### 2. `URLSearchParams` 是有序多值列表

查询参数不是普通对象，而是有顺序的 name-value 元组列表。同一个名字可以出现多次：

```text
brand=nike&brand=reebok&sort=price
```

因此读取单值与多值必须明确区分：

```tsx
const firstBrand = searchParams.get('brand')
// 'nike'

const allBrands = searchParams.getAll('brand')
// ['nike', 'reebok']
```

`get` 只返回第一个值，缺失时返回 `null`；`getAll` 返回全部值，缺失时返回空数组。迭代
`searchParams.entries()` 会保留重复项与列表顺序。

### 3. 空值与缺失值不同

下面两种地址有不同含义：

```text
/catalog?query=
/catalog
```

第一种包含 `query`，值是空字符串；第二种没有这个键：

```tsx
searchParams.has('query') // true 或 false
searchParams.get('query') // '' 或 null
```

不要用 `get('query') || fallback` 判断键是否存在，因为空字符串也会进入 fallback。是否存在看 `has`，
业务上的空文本是否有效再单独决定。

### 4. `useSearchParams` 返回读取对象与 setter

Hook 的基本返回值是一个元组：

```tsx
const [searchParams, setSearchParams] = useSearchParams()
```

第一个值是当前查询对应的 `URLSearchParams`，第二个值用于写入新查询。调用 setter 会触发一次 Router
navigation，而不是只改某个组件的本地 State。

### 5. `defaultInit` 只提供首次读取回退

可以给 Hook 传入默认值：

```tsx
const [searchParams] = useSearchParams({
  view: 'cards',
  sort: 'relevance',
})
```

首次读取时，如果当前 URL 没有这些键，返回对象中会包含默认值，但地址不会被自动改写。URL 中已经
存在的键优先，即使它的值是空字符串。`defaultInit` 不是 schema，也不是永久存在的默认参数；调用
`setSearchParams` 后可以把查询彻底清空。

### 6. URL 状态仍需要业务解析

`URLSearchParams` 返回字符串，不知道页码、布尔值或枚举的业务规则：

```tsx
const rawPage = searchParams.get('page')
const page = rawPage && /^\d+$/.test(rawPage) ? Number(rawPage) : 1
```

解析成功也不表示数据存在或用户有权限。Router 负责 URL 状态，业务层负责格式、范围、资源和权限。

## 四、用法与示例

### 1. 读取单值、多值和全部条目

```tsx
function FilterSummary() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('query')
  const brands = searchParams.getAll('brand')
  const entries = Array.from(searchParams.entries())

  return (
    <section>
      <p>搜索：{query ?? '未设置'}</p>
      <p>品牌：{brands.join(', ') || '未设置'}</p>
      <p>条目数：{entries.length}</p>
    </section>
  )
}
```

只需要一个值时使用 `get`；协议允许重复值时使用 `getAll`。不要先转成普通对象再处理多值，因为对象
不能保存两个相同属性名。

### 2. 完整替换查询列表

setter 支持字符串、元组数组、对象、`URLSearchParams` 和函数 updater。直接传值时，该输入会建立
一份新的完整查询列表：

```tsx
setSearchParams({
  query: 'router basics',
  brand: ['react', 'typescript'],
})
```

未出现在对象中的旧键不会自动保留。对象中的数组值会展开为重复键：

```text
query=router+basics&brand=react&brand=typescript
```

### 3. 在一次 updater 中局部修改

需要保留旧键时，使用函数 updater：

```tsx
setSearchParams((previous) => {
  previous.set('query', 'router')
  previous.delete('page')
  previous.append('brand', 'react')
  return previous
})
```

- `append` 在列表末尾新增一个值，不覆盖同名项。
- `set` 保留一个指定值，并移除同名的其他值。
- `delete` 删除指定键的全部值。

这些修改应组合在一次调用中。函数 updater 的写法类似 React State，但不支持 React State 的 queueing；
同一 tick 连续调用 setter，不会逐个基于尚未完成的更新累积。

### 4. 选择 push 或 replace

setter 的第二个参数接受导航选项。默认导航通常添加一个 history entry；高频输入或瞬时筛选往往适合
替换当前 entry：

```tsx
setSearchParams(
  (previous) => {
    previous.set('query', 'router')
    return previous
  },
  { replace: true },
)
```

当一次筛选变化值得让用户通过后退返回时，可以保留默认 push。`replace` 只改变本次查询导航如何进入
history，不改变参数的解析、编码或多值规则。

### 5. 让标准实现负责编码

逻辑值应直接交给 `URLSearchParams`：

```tsx
setSearchParams({ query: 'a+b / c' })
// query=a%2Bb+%2F+c
```

查询解析遵循 form-urlencoded 规则：原始 `+` 表示空格；字面加号序列化为 `%2B`；斜杠作为值
序列化为 `%2F`。不要先调用 `encodeURIComponent`，否则百分号可能再次编码为 `%25`。

### 6. 把返回对象当作只读快照

官方文档说明 `searchParams` 在同一 `location.search` 下是稳定引用，因此可以作为 Effect 依赖。但
`URLSearchParams` 对象本身仍可变：

```tsx
// 错误：对象变了，URL 和 Router state 没有同步
searchParams.set('query', 'router')
```

稳定引用不等于不可变对象。读取时只读消费；所有需要写进 URL 的变更都通过 `setSearchParams` 完成。

## 五、用 Demo 观察查询状态

下面的观察台使用 `createMemoryRouter` 和 `RouterProvider`。它在内存 URL 中读写查询参数，不接管外层
学习站地址，也不配置 loader 或外部请求。

:::demo{id="react.router.learn.basics.query-params-and-url-state.search-params-demo"}
:::

按顺序观察：

1. 首次挂载时，原始 `location.search` 没有 `view` 和 `sort`，有效读取结果包含两个默认值。
2. `get('brand')` 只显示第一项，`getAll('brand')` 保留 `nike`、`reebok` 的顺序。
3. `q=red+shoes` 读取为空格文本，`path=%2Fdocs` 读取为 `/docs`。
4. `empty` 存在且值为空，`missing` 不存在且读取为 `null`。
5. 追加品牌会保留原值；更新搜索词会由标准实现编码加号、空格和斜杠。
6. 替换全部筛选会移除未提供的旧键；清空查询后默认值不会自动复活。

## 六、易错使用提示

:::pitfalls
### 错误：用 `get` 读取全部重复值

**触发条件：** URL 中一个筛选键出现多次，但组件只调用 `get`。

**原因：** `get` 的合同只返回第一个同名值。

**后果：** 后续筛选值被静默忽略，界面与分享链接表达的状态不一致。

**错误示例：**

```tsx
const brands = [searchParams.get('brand')]
```

**正确写法：**

```tsx
const brands = searchParams.getAll('brand')
```

**验证方式：** 使用 `?brand=nike&brand=reebok`，确认结果数组按顺序包含两项。

### 错误：把查询列表转换为普通对象再写回

**触发条件：** 使用 `Object.fromEntries(searchParams)` 保存或修改查询状态。

**原因：** 普通对象不能保留重复属性名，也不表达同名项之间的顺序。

**后果：** 多值筛选在往返转换后只剩一个值。

**错误示例：**

```tsx
const next = Object.fromEntries(searchParams)
setSearchParams(next)
```

**正确写法：**

```tsx
setSearchParams((previous) => {
  previous.append('brand', 'reebok')
  return previous
})
```

**验证方式：** 更新前后比较 `getAll('brand')` 与 `entries()`，确认重复项没有丢失。

### 错误：用空字符串表示删除

**触发条件：** 想移除筛选键时调用 `set('query', '')`。

**原因：** 空字符串仍是一个存在的值，会序列化为 `query=`。

**后果：** `has('query')` 仍为 true，业务代码可能把“清空”和“未提供”混为一谈。

**错误示例：**

```tsx
previous.set('query', '')
```

**正确写法：**

```tsx
previous.delete('query')
```

**验证方式：** 删除后同时检查 `has('query') === false` 和 `get('query') === null`。

### 错误：连续调用 setter 并期待自动排队

**触发条件：** 在同一事件中分别更新搜索词和页码。

**原因：** 函数 updater 不支持 React State updater 的 queueing 语义。

**后果：** 后一次更新不会基于前一次尚未完成的值，先前改动可能丢失。

**错误示例：**

```tsx
setSearchParams((previous) => {
  previous.set('query', 'router')
  return previous
})
setSearchParams((previous) => {
  previous.set('page', '1')
  return previous
})
```

**正确写法：**

```tsx
setSearchParams((previous) => {
  previous.set('query', 'router')
  previous.set('page', '1')
  return previous
})
```

**验证方式：** 单次交互后确认新 URL 同时包含 `query=router` 与 `page=1`。

### 错误：直接修改 Hook 返回对象

**触发条件：** 因为 `searchParams` 引用稳定，就直接调用它的 `set` 或 `append`。

**原因：** 稳定引用仍指向可变对象，直接 mutation 不会发起 Router navigation。

**后果：** 对象内容可能在无关 render 中看似改变，但 URL 没有同步。

**错误示例：**

```tsx
searchParams.set('view', 'list')
```

**正确写法：**

```tsx
setSearchParams((previous) => {
  previous.set('view', 'list')
  return previous
})
```

**验证方式：** 修改后比较界面读取值与内存 URL，确认二者通过一次导航同步变化。

### 错误：把 `defaultInit` 当作首次 URL 写入

**触发条件：** 传入 `{ view: 'cards' }` 后期待地址栏自动出现 `?view=cards`。

**原因：** `defaultInit` 只提供首次读取回退，官方合同明确不在首次渲染时改写 URL。

**后果：** 组件显示默认视图，但复制出的 URL 不包含该值，分享行为与预期不符。

**错误示例：**

```tsx
const [searchParams] = useSearchParams({ view: 'cards' })
// 错误期待：首次 render 已导航到 ?view=cards
```

**正确写法：**

```tsx
const [searchParams, setSearchParams] = useSearchParams({ view: 'cards' })
// 需要把默认值规范进 URL 时，在明确的用户动作中调用 setter。
```

**验证方式：** 首次挂载时分别观察 `location.search` 和 `searchParams.toString()`。

### 错误：先编码值再交给 `URLSearchParams`

**触发条件：** 先对逻辑值调用 `encodeURIComponent`，再传给 setter。

**原因：** `URLSearchParams` 本身会按查询字符串规则编码，预编码的百分号会再次被编码。

**后果：** `/docs` 可能从 `%2Fdocs` 变成 `%252Fdocs`，读取后得到错误文本。

**错误示例：**

```tsx
setSearchParams({ path: encodeURIComponent('/docs') })
```

**正确写法：**

```tsx
setSearchParams({ path: '/docs' })
```

**验证方式：** 序列化结果应为 `path=%2Fdocs`，再次读取应得到 `/docs`。
:::

## 七、源码推导与适用场景

### 1. 默认值与真实 URL 分层

**官方事实：** 公开文档保证 `defaultInit` 不会在首次渲染时改写 URL。8.3.0 固定源码只为当前
`location.search` 中缺失的键补充默认值，官方测试证明调用 setter 后可以把默认值清除。

**课程推导：** 默认值适合提供首次显示回退，不适合充当 URL schema。需要可分享的规范地址时，应由
明确的交互写入 URL。

**边界：** 缺失键的具体合并顺序是固定版本实现事实；跨版本依赖的是公开的“不首写 URL”合同。

### 2. setter 是查询导航

**官方事实：** setter 会触发 navigation。8.3.0 固定实现把新参数序列化为查询字符串，并把导航选项
交给内部 `navigate`。

**课程推导：** URL 是筛选状态的所有者时，不需要再维护一份重复组件 State；push 或 replace 应根据
用户是否需要通过后退恢复该状态来选择。

**边界：** 数据重新验证、等待状态、取消和滚动恢复属于各自的路由流程；本课不把一次查询导航等同于
所有这些能力。

### 3. 函数 updater 与可变对象

**官方事实：** 文档允许修改 updater 参数后返回，但明确说明多次 setter 不支持 React State queueing。
8.3.0 固定实现先克隆当前参数，再把克隆交给 updater。

**课程推导：** 把相关修改集中在一次 updater；Hook 返回对象只读消费，避免 URL 与内存对象分离。

**边界：** updater 使用克隆是固定版本源码事实，不应作为未来实现细节的永久承诺。

### 4. Router 委托 Web 标准编码

**官方事实：** `createSearchParams` 展开对象中的数组值后交给原生 `URLSearchParams`。重复键、顺序、
空值和 form-urlencoded 编码由 WHATWG URL Standard 定义。

**课程推导：** 应传入未编码的逻辑值，使用 `getAll`、`append` 与 `delete` 表达真实查询协议，不建立
自定义字符串拆分器。

**边界：** Router 的对象数组输入是库扩展；加号、百分号和元组列表行为属于 Web 平台规则。

### 5. 适合与不适合的状态

适合放进查询参数的状态通常具备至少一个特征：刷新后应恢复、链接应可分享、同一 pathname 下有多个
可命名视图。常见例子是搜索词、筛选、排序、分页和展示模式。

不适合放进查询参数的内容包括秘密信息、体积较大的编辑草稿、临时 hover/focus 状态，以及无法由文本
稳定表示的对象。查询参数公开可见，也不提供格式校验、权限判断或服务端缓存。

## 八、练习

:::exercise
### 练习目标

**要求：** 为 `/courses` 页面实现 `query`、可重复的 `level`、`sort` 三类查询状态。使用
`useSearchParams({ sort: 'relevance' })` 提供首次读取回退；用 `get` 读取单值、`getAll` 读取全部 level，
并明确区分 `query=` 与 query 缺失。添加一个操作，在同一次函数 updater 中更新 query、删除 page 并
追加 level；再添加一个 `{ replace: true }` 的清空操作。逻辑值 `C++ / React` 必须由标准实现编码，
不能预先调用 `encodeURIComponent`。

**验收：** 首次地址不被默认 sort 改写；重复 level 保持顺序；局部更新保留未修改键；清空后默认值不
自动复活；`C++ / React` 往返序列化后仍读回原文本。
:::

## 九、本节小结

- 查询参数是 URL 中有顺序、可重复的 name-value 列表，适合保存可分享、可恢复的页面状态。
- `get` 读取第一个值，`getAll` 读取全部值，`has` 用来区分空值与缺失。
- `useSearchParams` 返回 `URLSearchParams` 和会触发导航的 setter。
- 直接传值会建立完整查询列表；局部修改应集中在一次函数 updater 中。
- `defaultInit` 不会首次写 URL，函数 updater 不支持 React State queueing。
- 返回引用稳定但对象可变；只读消费它，并通过 setter 同步 Router state。
- 把未编码逻辑值交给标准实现，避免重复参数丢失和双重编码。

## 十、参考资料

- [React Router 8.3.0 Release](https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0) - 核验正式稳定发布与固定提交。
- [npm react-router Latest Metadata](https://registry.npmjs.org/react-router/latest) - 核验 2026-08-20 的 npm latest 稳定版本。
- [React Router 8.3.0 useSearchParams API](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useSearchParams.md#L19-L115) - 返回值、setter、defaultInit、queueing 和稳定引用合同。
- [Search Params Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/dom/lib.tsx#L2389-L2466) - 固定版本的默认值、克隆 updater 与导航实现。
- [createSearchParams Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/dom/dom.ts#L47-L96) - 输入类型、对象数组展开和缺失默认键合并。
- [Search Params Tests](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/dom/search-params-test.tsx#L27-L405) - 读写、默认值、清除和受阻导航测试。
- [WHATWG URLSearchParams](https://url.spec.whatwg.org/#urlsearchparams) - 有序多值列表与读取、写入、迭代行为。
- [WHATWG form-urlencoded](https://url.spec.whatwg.org/#application/x-www-form-urlencoded) - 加号、空格与百分号编码规则。
- [createMemoryRouter API](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/data-routers/createMemoryRouter.md#L19-L31) - 内存 history 与隔离 Demo 宿主。
