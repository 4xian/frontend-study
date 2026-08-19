---
id: react.core.learn.intermediate.context-providing-and-reading
type: lesson
title: Context
summary: 创建稳定的 Context 通道，在 Provider 子树中提供值，并读取最近匹配的当前值。
domain: frontend
technology: react
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 90
prerequisites:
  - react.core.learn.basics.props
  - react.core.learn.basics.rules-of-hooks
related:
  - react.core.learn.basics.children-and-composition
  - react.core.learn.intermediate.lifting-state-up
tags:
  - React
  - Context
  - createContext
  - useContext
  - Provider
  - Object.is
appliesTo: React 19.2 官方文档与 React 19.2.8
verifiedAt: 2026-08-16
objectives:
  - 能在模块顶层用 createContext 建立稳定的 Context 对象和准确的默认值合同。
  - 能用 Provider 的 value 为 children 子树提供运行时值。
  - 能在组件顶层用 useContext 读取父树中最近匹配的 Provider 值。
  - 能区分没有 Provider、存在 Provider、显式 undefined 和嵌套覆盖的读取结果。
  - 能解释 Provider 值变化、Object.is、对象引用和 memo 的基本边界。
  - 能根据依赖距离、消费者数量和作用域选择 Props、children 或 Context。
recap:
  - Context 对象是稳定的通道身份，不是当前值，也不是全局可变 State。
  - createContext 的默认值只在父树完全没有匹配 Provider 时使用，并且不会动态变化。
  - Provider 的 value 只对 children 子树生效，useContext 读取父树中最近匹配的值。
  - Provider 明确提供 undefined 时读取结果就是 undefined，不会回退默认值。
  - 同一组件返回的 Provider 不影响该组件自己的 useContext 读取，只影响其后代。
  - 同一 Context 的内层 Provider 只覆盖自己的子树，内层外兄弟仍读取外层值。
  - Context 值按 Object.is 判断是否变化，新对象引用与原对象引用是不同的值。
  - 短路径依赖优先使用 Props 或 children，边界清楚的深层共同信息才适合 Context。
sources:
  - title: React Versions
    url: https://react.dev/versions
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - react.dev 当前文档的版本口径为 React 19.2
  - title: createContext
    url: https://react.dev/reference/react/createContext
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - createContext 的调用位置、返回对象和静态默认值合同
      - React 19 的直接 Provider 语法与旧版本 Provider 写法
  - title: useContext
    url: https://react.dev/reference/react/useContext
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 顶层读取、最近 Provider、同组件 Provider、自动更新和显式 undefined
      - Object.is、memo、对象值身份和重复模块边界
  - title: Passing Data Deeply with Context
    url: https://react.dev/learn/passing-data-deeply-with-context
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Context 穿过中间组件、嵌套覆盖以及 Props 和 children 的选择边界
  - title: Using TypeScript
    url: https://react.dev/learn/typescript
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Context 值类型推断和无合理默认值时的 T 与 null 联合类型
  - title: TypeScript strictNullChecks
    url: https://www.typescriptlang.org/tsconfig/strictNullChecks.html
    sourceType: official-reference
    appliesTo: TypeScript
    claims:
      - null 与 undefined 是独立类型，使用具体值前需要完成收窄
  - title: React 19.2.8 ReactContext Source
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react/src/ReactContext.js
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - Context 默认值初始化、对象身份和 Provider 兼容引用的固定版本证据
  - title: React 19.2.8 ReactFiberNewContext Source
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberNewContext.js
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 嵌套值恢复、Context 依赖、Object.is 比较和变化传播的固定版本证据
---

# Context

## 一、学习目标

- 理解 Context 对象、默认值、Provider 和读取组件各自承担的职责。
- 在模块顶层创建 Context，并让提供方和读取方引用同一个对象。
- 为有意义的默认值和必须提供的值设计准确的 TypeScript 类型。
- 根据组件树判断无 Provider、外层 Provider、内层 Provider 和兄弟分支的读取结果。
- 用 `useContext` 在组件顶层读取当前值，并理解 Provider 的放置方向。
- 解释原始值、对象引用、`Object.is` 和 `memo` 对 Context 更新的影响。
- 根据真实的数据通路选择 Props、`children` 或 Context。

## 二、Context 解决什么问题

Props 是组件最直接的输入合同。父组件把值传给子组件，依赖在 JSX 中清晰可见：

```tsx
<Toolbar density="compact" />
```

当真正使用 `density` 的是很深的后代时，中间组件可能只负责继续转交：

```text
App
`- Workspace density
   `- Layout density
      `- Toolbar density
         `- DensityButton  <- 真正使用 density
```

如果 `Workspace`、`Layout` 和 `Toolbar` 都不需要密度，逐层声明和转交同一个 Prop 会把无关依赖写进
这些组件的接口。Context 允许祖先为一棵明确的子树提供值，深层组件直接读取，中间组件不必知道该值。

```text
App
`- DensityContext value="compact"
   `- Workspace
      `- Layout
         `- DensityButton  <- useContext(DensityContext)
```

Context 改变的是值在组件树中的传递路径。它不会自动创建可变数据、不会替应用决定更新规则，也不会把
所有页面共享数据变成一个无边界对象。

## 三、四个核心角色

| 角色 | 典型写法 | 职责 |
| --- | --- | --- |
| Context 对象 | `createContext(defaultValue)` | 表示一条稳定、可识别的数据通道 |
| 默认值 | `defaultValue` | 父树完全没有匹配 Provider 时的静态兜底 |
| Provider | `<SomeContext value={value}>` | 把确定的值放进自己的 `children` 子树 |
| 读取组件 | `useContext(SomeContext)` | 读取父树中最近匹配 Provider 的当前值 |

一次读取可以概括为：

```text
useContext(Context)
  -> 向调用组件的父树查找同一个 Context 对象
  -> 找到最近 Provider：返回它的 value
  -> 完全没有 Provider：返回 createContext 的 defaultValue
```

这里有两个独立判断：先判断是否存在匹配 Provider，再读取该 Provider 的值。React 不会因为值是
`undefined`、`null`、空字符串或 `0` 就改为使用默认值。

## 四、用 createContext 建立通道

### 1. 在模块顶层创建

```tsx
import { createContext } from 'react'

type Density = 'comfortable' | 'compact'

export const DensityContext = createContext<Density>('comfortable')
```

`DensityContext` 是 Context 对象，不是字符串 `'comfortable'`，也不是当前界面的密度。Provider 和
`useContext` 通过同一个对象建立连接，所以它应在组件外创建，并从稳定模块导出。

不要在组件函数中调用 `createContext`：

```tsx
// 错误：每次 render 都会创建另一条通道。
function Panel() {
  const PanelContext = createContext('default')
  return <PanelContext value="provided">内容</PanelContext>
}
```

两次 `createContext('comfortable')` 即使参数、变量名和类型完全相同，返回的仍是两个不同对象。提供方使用
对象 A，读取方使用对象 B 时，读取方找不到 A 的 Provider，只会得到 B 的默认值。

### 2. 默认值是静态 fallback

`createContext(defaultValue)` 的参数只描述一种情况：读取组件的父树上完全没有匹配 Provider。创建后，
默认值不会因为交互而改变，也不会和 Provider 的值合并。

```tsx
type Theme = 'light' | 'dark' | 'system'

const ThemeContext = createContext<Theme>('system')
```

`'system'` 表示组件脱离 Provider 时仍能按系统主题工作。它不是第一份可更新 State，也不是 Provider
暂时没有数据时的加载值。

### 3. 没有合理默认值时使用 null

“当前工作区”必须来自真实业务数据，空 ID 和空名称不是有效工作区：

```tsx
type Workspace = {
  id: string
  name: string
}

const WorkspaceContext = createContext<Workspace | null>(null)
```

`Workspace | null` 准确表达两种状态。启用严格空值检查后，读取代码必须先排除 `null`，再访问工作区字段：

```tsx
import { useContext } from 'react'

/** 读取当前工作区，并显式处理尚未提供的状态。 */
function WorkspaceName() {
  const workspace = useContext(WorkspaceContext)

  if (workspace === null) {
    return <span>尚未选择工作区</span>
  }

  return <span>{workspace.name}</span>
}
```

不要用 `{} as Workspace`、空字符串字段或随意选择一条真实记录充当默认值。类型断言只能隐藏缺失状态，
不能创造有效数据。

### 4. 默认值不会参与合并

```tsx
type Preferences = {
  density: 'comfortable' | 'compact'
  locale: 'zh-CN' | 'en-US'
}

const PreferencesContext = createContext<Preferences>({
  density: 'comfortable',
  locale: 'zh-CN',
})
```

Provider 必须提供完整的 `Preferences`。Context 不会把 Provider 对象与默认对象浅合并，也不会在 Provider
漏掉字段时从默认值补齐。完整性应由 TypeScript 类型和提供方的数据构造保证。

## 五、用 Provider 为子树提供值

### 1. React 19 写法

React 19 可以直接把 Context 对象渲染为 Provider：

```tsx
/** 为工作区子树提供紧凑密度。 */
function Workspace() {
  return (
    <DensityContext value="compact">
      <Toolbar />
      <DocumentList />
    </DensityContext>
  )
}
```

`Toolbar`、`DocumentList` 以及它们任意深度的后代都位于 Provider 的 `children` 子树。Provider 外的父组件、
同级兄弟和其他分支不受这个值影响。

React 19 以前通常写成：

```tsx
<DensityContext.Provider value="compact">
  <Toolbar />
</DensityContext.Provider>
```

React 19.2.8 仍兼容 `.Provider`。新代码可以使用直接写法，维护旧 React 项目时应按项目实际版本保留
兼容语法。

### 2. value 是明确的 Provider 输入

Provider 的公共输入名是 `value`：

```tsx
<DensityContext value="compact">
  <Toolbar />
</DensityContext>
```

省略 `value` 或误写成 `density="compact"` 不会使用 `createContext` 的默认值。省略时语义等同于提供
`undefined`，React 开发模式还会报告缺少 `value` 的警告。

### 3. Provider 只负责提供已有值

Provider 的 `value` 可以来自常量、Props、State 或其他明确数据源。下面用 State 让值随交互变化：

```tsx
import { useState } from 'react'

/** 提供可以由界面控件切换的密度值。 */
function DensitySettings() {
  const [density, setDensity] = useState<Density>('comfortable')

  return (
    <DensityContext value={density}>
      <button
        type="button"
        onClick={() =>
          setDensity((current) => (current === 'comfortable' ? 'compact' : 'comfortable'))
        }
      >
        切换密度
      </button>
      <Toolbar />
    </DensityContext>
  )
}
```

State 负责保存和更新密度，Provider 只把当前 `density` 放进子树。Context 对象本身没有被修改。

## 六、用 useContext 读取当前值

### 1. 在组件顶层调用

```tsx
import { useContext } from 'react'

/** 读取当前密度并显示结果。 */
function DensityBadge() {
  const density = useContext(DensityContext)
  return <strong>当前密度：{density}</strong>
}
```

`useContext` 是 Hook，必须在组件或自定义 Hook 顶层调用，不能放进事件处理器、条件分支、循环或嵌套函数。
它的参数是 Context 对象，返回值类型来自 `createContext` 的类型合同。

### 2. 读取最近的祖先 Provider

React 从 `DensityBadge` 所在位置向父树查找 `DensityContext`。遇到的第一个匹配 Provider 决定返回值；
更远的 Provider 和其他 Context 都不会参与合并。

```tsx
<DensityContext value="comfortable">
  <DensityBadge />
  <DensityContext value="compact">
    <DensityBadge />
  </DensityContext>
</DensityContext>
```

第一个 `DensityBadge` 读取 `'comfortable'`，第二个读取 `'compact'`。

### 3. Provider 必须位于读取组件的父树

同一组件调用 `useContext` 后再返回 Provider，该 Provider 只影响返回的后代，不会反向影响当前组件：

```tsx
/** 先读取父树值，再为真正的子组件提供局部值。 */
function LocalDensity() {
  const inheritedDensity = useContext(DensityContext)

  return (
    <section>
      <p>组件自身读取：{inheritedDensity}</p>
      <DensityContext value="compact">
        <DensityBadge />
      </DensityContext>
    </section>
  )
}
```

`LocalDensity` 自身读取外层 Provider 或默认值；它返回的 `DensityContext` 只让 `DensityBadge` 读取
`'compact'`。需要让某段逻辑读取局部值时，应把逻辑拆进 Provider 包裹的子组件。

### 4. Context 可以穿过中间组件

```tsx
import type { ReactNode } from 'react'

/** 只负责布局，不读取也不转发密度。 */
function LayoutShell({ children }: { children: ReactNode }) {
  return <div className="layout-shell">{children}</div>
}

/** 保留读取组件所在的 Provider 子树。 */
function App() {
  return (
    <DensityContext value="compact">
      <LayoutShell>
        <DensityBadge />
      </LayoutShell>
    </DensityContext>
  )
}
```

`LayoutShell` 没有 `density` Prop，也没有调用 `useContext`。只要它把 `children` 保留在原子树中，
`DensityBadge` 仍能读取祖先 Provider。

## 七、无 Provider、显式 undefined 与 null

### 1. 四种读取状态

假设通道声明为：

```tsx
const DensityContext = createContext<Density | undefined>('comfortable')
```

| 父树状态 | 读取结果 | 原因 |
| --- | --- | --- |
| 完全没有 `DensityContext` Provider | `'comfortable'` | 使用静态默认值 |
| 最近 Provider 的 `value="compact"` | `'compact'` | Provider 值替代默认值 |
| 最近 Provider 的 `value={undefined}` | `undefined` | 已找到 Provider，不会回退 |
| 省略 Provider 的 `value` | `undefined` | 合同错误，开发模式会警告 |

如果 `undefined` 不是合法领域值，就不要把它留在 Context 类型中。可以在提供前把可空输入归一化为
确定值，或者用 `T | null` 明确要求读取方处理缺失。

### 2. null 也不会触发默认值

`null` 与 `undefined` 一样，可以是 Provider 明确提供的值：

```tsx
<WorkspaceContext value={null}>
  <WorkspaceName />
</WorkspaceContext>
```

`WorkspaceName` 读取到 `null`，不会寻找更远 Provider，也不会触发 `createContext` 的默认值。最近 Provider
一旦匹配，查找就已经完成。

### 3. 默认值本身为 undefined 的限制

```tsx
const OptionalContext = createContext<string | undefined>(undefined)
```

读取结果为 `undefined` 时，单凭该值无法区分“没有 Provider”和“Provider 明确提供了 `undefined`”。如果
业务必须区分这两种状态，应使用 `null`、判别联合或其他可识别的领域值，而不是依赖猜测。

## 八、嵌套 Provider 与局部覆盖

### 1. 最近匹配形成子树作用域

```text
DensityContext value="comfortable"
|- Header -> comfortable
|- DensityContext value="compact"
|  `- Editor -> compact
`- Footer -> comfortable
```

内层 Provider 不会修改外层 Provider，也不会改变 Context 对象。它只为自己的 `children` 建立一个更近
的值。离开内层子树后，兄弟分支继续读取外层值。

### 2. 外层和内层可以独立变化

```tsx
/** 为页面与编辑区提供彼此独立的密度。 */
function Page() {
  const [pageDensity, setPageDensity] = useState<Density>('comfortable')
  const [editorDensity, setEditorDensity] = useState<Density>('compact')

  return (
    <DensityContext value={pageDensity}>
      <Header />
      <DensityContext value={editorDensity}>
        <Editor />
      </DensityContext>
      <Footer />
    </DensityContext>
  )
}
```

改变 `pageDensity` 会改变 `Header` 和 `Footer` 的 Context 值；只要内层 Provider 仍存在，`Editor` 就
继续读取 `editorDensity`。改变 `editorDensity` 只改变内层子树当前提供的值。

### 3. Provider 边界应贴合真实作用域

只有编辑器需要紧凑密度时，Provider 应包住编辑器区域，而不是整个应用。导航、页脚和其他页面不应因为
实现方便而进入无关作用域。反过来，多个深层分支确实需要同一个值时，应把 Provider 放在这些分支的最近
共同祖先处，避免重复提供互相偏离的副本。

## 九、值变化、Object.is 与引用身份

### 1. 读取组件会接收新的 Context 值

Provider 的 `value` 变化后，读取该 Context 的组件会获得最新值。读取方不需要接收 setter，也不需要
手动订阅 Context。

React 使用 `Object.is(previousValue, nextValue)` 判断前后 Context 值是否相同：

| 前值与后值 | `Object.is` | Context 值判断 |
| --- | ---: | --- |
| `'comfortable'` 与 `'compact'` | `false` | 值发生变化 |
| `'compact'` 与 `'compact'` | `true` | 值相同 |
| 同一个对象引用 | `true` | 值相同 |
| 内容相同的两个新对象 | `false` | 值发生变化 |

### 2. 对象值要遵守不可变更新

```tsx
type Settings = {
  density: Density
  locale: 'zh-CN' | 'en-US'
}

const SettingsContext = createContext<Settings | null>(null)
```

每次内联创建对象都会得到新引用：

```tsx
<SettingsContext value={{ density, locale }}>
  <Workspace />
</SettingsContext>
```

只要提供方 render，这个对象引用就与上次不同，React 会把它视为新的 Context 值。反方向的错误是原地
修改旧对象后继续提供同一引用；`Object.is` 仍可能判定相同，而且原地修改也破坏了 State 快照合同。

优先让 Context 值保持职责单一、结构清楚，并通过不可变更新创建真实的新值。是否需要额外稳定对象或函数
引用，应根据实际测量决定，不能把复杂优化当作 Context 正确性的前提。

### 3. memo 不能阻断 Context 更新

`memo` 比较组件的 Props，不会把组件与其读取的 Context 隔离。即使读取组件被 `memo` 包装，只要它读取
的 Context 获得新值，组件仍会重新 render 并显示最新结果。

还要区分两个概念：Provider 所在父组件重新 render，不等于 Context 值一定变化；`Object.is` 描述的是
Context 值传播判断，不是整棵 React 子树所有 render 行为的总开关。

## 十、TypeScript 合同设计

### 1. 有意义默认值使用窄类型

```tsx
type Locale = 'zh-CN' | 'en-US'

const LocaleContext = createContext<Locale>('zh-CN')
```

Provider 只能提供联合类型允许的值，读取结果也不需要空值判断。这适合组件脱离 Provider 仍能正确工作的
环境设置。

### 2. 必须提供的对象保留缺失状态

```tsx
type CurrentAccount = {
  id: string
  displayName: string
}

const CurrentAccountContext = createContext<CurrentAccount | null>(null)
```

读取方可以显示缺失状态，也可以在明确的读取边界抛出错误。无论采用哪种界面策略，类型都应保留真实的
缺失可能，而不是用断言跳过检查。

### 3. undefined 只有在领域允许时才进入类型

为了观察 Provider 边界，可以声明 `Density | undefined`。正式领域模型中，若“密度未知”没有独立业务
含义，就应在数据进入 Provider 前转换为确定的 `Density`，让读取组件获得更小、更可靠的类型。

### 4. Context 只描述一个清晰职责

字段数量不是唯一标准。主题名称、配色和对比度可能属于同一主题合同；当前账号、通知列表和编辑器草稿
即使都在页面根部，也没有共同领域含义。把无关字段塞进一个“大 Context”会让依赖、作用域和更新来源
变得含混。

## 十一、Props、children 与 Context 的选择

| 方案 | 适合情况 | 主要特点 |
| --- | --- | --- |
| Props | 只跨一两层、消费者少、调用点应明确展示依赖 | 合同直接，组件容易独立使用 |
| `children` 组合 | 中间组件只负责布局，可直接接收已配置好的 JSX | 中间层不必理解数据合同 |
| Context | 多个远距离分支读取同类信息，中间层不应转发，Provider 子树边界自然 | 减少逐层转交，但输入来源更隐蔽 |

先尝试保持 Props 直接可见，或通过 `children` 重新划分组件边界。只有数据确实需要跨过多个不相关中间层，
并且作用域能在组件树中清楚表达时，Context 才能带来更清晰的结构。

多个字段是否放进同一 Context，可以依次判断：

1. 它们是否属于同一个可命名的领域合同？
2. 它们是否总由同一个 Provider 边界提供？
3. 它们是否来自同一个数据所有者？
4. 读取组件是否通常需要一起使用它们？

若答案大多是否定的，应拆成多个 Context。不同 Context 彼此独立，可以在同一子树中嵌套，不会互相覆盖。

## 十二、综合示例

下面的 Demo 保留多个同时可见的读取点：

- 无 Provider 的读取固定显示默认值。
- 显式 `undefined` 的 Provider 固定显示 `undefined`，不会回退。
- 外层 Provider 可以在两个密度值和 `undefined` 之间切换。
- 内层 Provider 可以切换值或移除，内层外兄弟始终读取外层值。
- `LayoutShell` 不读取 Context，深层组件仍能得到祖先值。
- 一个组件先读取外层值，再返回 Provider；它自身与其后代显示不同结果。
- 读取组件经过 `memo` 包装后仍会随 Context 值变化。
- 重置操作恢复所有确定的初始状态。

::::demo{id="react.core.learn.intermediate.context-providing-and-reading.context-tree-demo"}
::::

## 十三、易错使用提示

:::pitfalls
### 错误：创建不稳定或不同身份的 Context

**触发条件：** 在组件中调用 `createContext`，或让提供方和读取方分别创建同名 Context。

**原因：** 每次 `createContext` 都返回新的对象，Context 依靠对象身份而不是变量名连接。

**后果：** 读取方找不到提供方使用的通道，只能读取自己的默认值。

**错误示例：**

```tsx
/** 每次 render 都创建另一条通道。 */
function Panel() {
  const LocalContext = createContext('default')
  return <LocalContext value="provided">内容</LocalContext>
}
```

**正确写法：**

```tsx
export const SharedContext = createContext('default')

/** 使用模块顶层的稳定通道。 */
function Panel() {
  return <SharedContext value="provided">内容</SharedContext>
}
```

**验证方式：** 检查 `createContext` 的调用位置，并确认提供方和读取方导入同一对象。

### 错误：把默认值当成动态 State

**触发条件：** 期望修改 `createContext(defaultValue)` 后让读取组件获得新值。

**原因：** 默认值是无 Provider 时的静态 fallback，不是可更新容器。

**后果：** 交互无法改变读取结果，动态值的数据所有者也不明确。

**错误示例：**

```tsx
const ThemeContext = createContext('light')
// 错误思路：尝试修改 ThemeContext 来切换主题。
```

**正确写法：**

```tsx
/** 用 State 产生 Provider 的当前值。 */
function ThemeArea() {
  const [theme, setTheme] = useState('light')
  return <ThemeContext value={theme}>内容</ThemeContext>
}
```

**验证方式：** 对照无 Provider 读取点与动态 Provider 读取点，只有后者随 `value` 变化。

### 错误：把 Provider 放在读取方下方

**触发条件：** 同一组件先调用 `useContext`，再在返回值中渲染 Provider。

**原因：** `useContext` 只向调用组件的父树查找，不会向下查看自己返回的 JSX。

**后果：** 组件自身仍读取外层值或默认值，被误判为 Provider 失效。

**错误示例：**

```tsx
/** 自身读取不会看到自己返回的 Provider。 */
function Panel() {
  const theme = useContext(ThemeContext)
  return <ThemeContext value="dark">{theme}</ThemeContext>
}
```

**正确写法：**

```tsx
/** 在 Provider 的真实后代中读取局部值。 */
function ThemeLabel() {
  return <span>{useContext(ThemeContext)}</span>
}

/** 让 Provider 包住读取组件。 */
function Panel() {
  return <ThemeContext value="dark"><ThemeLabel /></ThemeContext>
}
```

**验证方式：** 同时显示提供组件自身与其子组件的读取结果，只有子组件读取局部值。

### 错误：省略或拼错 value

**触发条件：** 写成 `<ThemeContext>` 或 `<ThemeContext theme="dark">`。

**原因：** Provider 的公共输入名固定为 `value`。

**后果：** 读取结果为 `undefined`，开发模式还会出现缺少 `value` 的警告。

**错误示例：**

```tsx
<ThemeContext theme="dark">
  <ThemeLabel />
</ThemeContext>
```

**正确写法：**

```tsx
<ThemeContext value="dark">
  <ThemeLabel />
</ThemeContext>
```

**验证方式：** 检查开发控制台，并确认读取结果等于明确提供的值。

### 错误：认为 undefined 会回退默认值

**触发条件：** Provider 传入 `undefined`，却期待 `createContext` 的默认值。

**原因：** 已经找到匹配 Provider，默认值不再参与读取。

**后果：** 读取组件得到 `undefined`，未处理的属性访问可能失败。

**错误示例：**

```tsx
<DensityContext value={undefined}>
  <DensityBadge />
</DensityContext>
```

**正确写法：**

```tsx
const normalizedDensity = inputDensity ?? 'comfortable'

<DensityContext value={normalizedDensity}>
  <DensityBadge />
</DensityContext>
```

**验证方式：** 对照无 Provider 与 `value={undefined}` 两个读取点，确认结果不同。

### 错误：认为内层 Provider 会修改外层值

**触发条件：** 内层覆盖后，期待外层兄弟也读取内层值。

**原因：** 把最近祖先作用域误解为对 Context 对象的全局赋值。

**后果：** 为追求错误结果继续扩大 Provider，局部设置泄漏到无关区域。

**错误示例：**

```tsx
<DensityContext value="comfortable">
  <DensityContext value="compact"><Editor /></DensityContext>
  <Footer />
</DensityContext>
// 错误预期：Footer 读取 compact。
```

**正确写法：**

```tsx
<DensityContext value="comfortable">
  <DensityContext value="compact"><Editor /></DensityContext>
  <Footer />
</DensityContext>
// 正确结果：Editor 读取 compact，Footer 读取 comfortable。
```

**验证方式：** 同时观察内层读取方和内层外兄弟，后者应保持外层值。

### 错误：原地修改对象后继续提供同一引用

**触发条件：** 修改 Context 值对象的字段，却没有创建新对象。

**原因：** `Object.is` 仍可能判定前后引用相同，而且原地修改破坏快照合同。

**后果：** 读取组件不能可靠获得更新，旧 render 中的数据也可能被污染。

**错误示例：**

```tsx
settings.density = 'compact'
setSettings(settings)
```

**正确写法：**

```tsx
setSettings((current) => ({ ...current, density: 'compact' }))
```

**验证方式：** 比较更新前后的对象引用，并核对旧快照没有被修改。

### 错误：每次 render 都组合无关的大对象

**触发条件：** 一个 Provider 内联组合多个无关对象、数组和函数。

**原因：** 每次都会产生新引用，且 Context 的职责和实际消费者难以辨认。

**后果：** 读取组件持续收到新值，无关领域也被绑定到同一作用域。

**错误示例：**

```tsx
<AppContext value={{ theme, account, notifications, draft, saveDraft }}>
  <App />
</AppContext>
```

**正确写法：**

```tsx
<ThemeContext value={theme}>
  <AccountContext value={account}><App /></AccountContext>
</ThemeContext>
```

**验证方式：** 检查每个值的领域含义、Provider 边界和真实读取者，再决定组合或拆分。

### 错误：用 memo 阻止 Context 更新

**触发条件：** 认为 `memo(ContextReader)` 会让读取组件忽略 Provider 的新值。

**原因：** `memo` 比较 Props，Context 读取是独立依赖。

**后果：** 对 render 时机产生错误预期，业务逻辑依赖不存在的阻断行为。

**错误示例：**

```tsx
const FrozenReader = memo(DensityReader)
// 错误预期：Provider value 改变后 FrozenReader 仍显示旧值。
```

**正确写法：**

```tsx
const MemoReader = memo(DensityReader)
// 正确预期：Props 未变时可跳过父级路径，但 Context 新值仍会到达。
```

**验证方式：** 用 `memo` 包装读取组件并切换 Provider 值，结果应同步更新。

### 错误：短路径数据全部改用 Context

**触发条件：** 数据只经过一个父子边界，却为了少写一个 Prop 建立 Context。

**原因：** 忽略了显式依赖的可读性和组件独立性。

**后果：** 组件离开特定 Provider 就难以复用，输入来源也更难追踪。

**错误示例：**

```tsx
<TitleContext value="课程详情">
  <PageTitle />
</TitleContext>
```

**正确写法：**

```tsx
<PageTitle title="课程详情" />
```

**验证方式：** 画出真实消费者和传递层级，比较 Props、`children` 与 Context 的依赖是否清晰。
:::

## 十四、源码事实与公共边界

React 19.2.8 的固定源码可以验证以下行为：

1. `createContext` 保存初始默认值并返回带有稳定身份的 Context 对象；`.Provider` 兼容引用仍连接到同一
   Context。
2. 进入 Provider 子树时，React 保存外层值并使用当前 `value`；离开子树后恢复外层值，因此嵌套覆盖不会
   修改全局变量。
3. 读取依赖按 Context 对象身份登记，值变化按 `Object.is` 比较，并通知读取同一 Context 的组件。
4. 即使组件在 Props 路径上可以跳过，新的 Context 值仍会触发对应读取更新。

Context 的公共合同是对象身份、默认值、Provider 子树、最近祖先和变化传播。内部字段、渲染器栈、Fiber
节点和调度细节可能随版本改变，不应由应用代码直接访问，也不属于使用 Context 的必要知识。

## 十五、练习

### 练习一：预测读取结果

```tsx
<DensityContext value="comfortable">
  <DensityBadge />
  <DensityContext value="compact">
    <LayoutShell>
      <DensityBadge />
    </LayoutShell>
  </DensityContext>
  <DensityBadge />
</DensityContext>
```

写出三个 `DensityBadge` 的读取结果，并说明每个结果对应哪个最近 Provider。

### 练习二：修复 Provider 位置

下面的组件为什么不能读取到 `'compact'`？把真正的读取逻辑拆到正确的子树中：

```tsx
/** 包含错误 Provider 位置的密度区域。 */
function DensityArea() {
  const density = useContext(DensityContext)
  return <DensityContext value="compact">{density}</DensityContext>
}
```

### 练习三：设计必须提供的类型

为 `CurrentProject` 创建 Context。它没有可信默认项目，读取组件应在缺失时显示“未选择项目”。写出类型、
`createContext` 和读取组件，不使用类型断言伪造对象。

### 练习四：判断引用变化

分别判断以下值在两次 render 之间是否满足 `Object.is`，并解释对 Context 值判断的影响：

1. 两次都是字符串 `'compact'`。
2. 两次都引用模块顶层的同一个对象。
3. 两次分别创建 `{ density: 'compact' }`。
4. 原地修改同一对象的 `density` 后继续提供该对象。

### 练习五：选择传递方式

为以下情形选择 Props、`children` 或 Context，并说明作用域：

1. 父组件只把按钮文本交给直接子组件。
2. 页面框架只负责放置一段已经配置好的工具栏 JSX。
3. 同一工作区中的导航、编辑器和状态栏都需要当前密度，中间布局组件不使用它。

## 十六、本节小结

- `createContext` 在模块顶层建立稳定通道；两次调用会得到两条不同通道。
- 默认值只在父树完全没有匹配 Provider 时使用，并且不会动态更新或与 Provider 值合并。
- React 19 使用 `<Context value={value}>` 提供值，旧 React 项目使用兼容的 `.Provider` 写法。
- Provider 只影响 `children` 子树，`useContext` 在组件顶层读取最近祖先 Provider。
- 同一组件返回的 Provider 只影响后代，不影响组件自己的读取。
- 内层 Provider 只覆盖自己的子树，内层外兄弟继续读取外层值。
- 显式 `undefined` 和 `null` 都是 Provider 值，不会触发默认值。
- Context 值通过 `Object.is` 判断变化，对象值必须重视引用身份和不可变更新。
- `memo` 不能阻止组件接收新的 Context 值。
- Props、`children` 和 Context 应按依赖距离、消费者和真实作用域选择。

## 十七、参考资料

- [React：createContext](https://react.dev/reference/react/createContext)
- [React：useContext](https://react.dev/reference/react/useContext)
- [React：Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context)
- [React：Using TypeScript](https://react.dev/learn/typescript)
- [TypeScript：strictNullChecks](https://www.typescriptlang.org/tsconfig/strictNullChecks.html)
- [React 19.2.8：ReactContext.js](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/ReactContext.js)
- [React 19.2.8：ReactFiberNewContext.js](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberNewContext.js)
