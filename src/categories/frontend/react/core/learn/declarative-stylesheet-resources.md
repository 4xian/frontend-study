---
id: react.core.learn.advanced.declarative-stylesheet-resources
type: lesson
title: 声明式样式资源
summary: 用 link 与 style 声明组件依赖的样式资源，并准确控制放置、顺序、去重、提交等待和生命周期边界。
domain: frontend
technology: react
module: core
stage: advanced
level: advanced
estimatedMinutes: 120
prerequisites:
  - react.core.learn.advanced.document-metadata-hoisting
related:
  - react.core.learn.advanced.suspense-fallback-boundary
  - react.core.learn.advanced.hydrate-root-markup-identity
tags:
  - React
  - React DOM
  - stylesheet
  - link
  - style
  - precedence
  - Suspense
appliesTo: React DOM 19.2.8
verifiedAt: 2026-08-18
objectives:
  - 能判断一组 link 或 style props 何时进入 React 特殊样式资源路径，何时仍是普通宿主元素。
  - 能用稳定 href 与 precedence 声明外链和内联样式资源，并区分资源身份、顺序分组与 CSS 级联。
  - 能根据 precedence 首次发现顺序和 href 去重规则，预测 React 声明与 document head 资源的差异。
  - 能解释外链 stylesheet 的提交与 Suspense 协调，以及内联 style 不触发加载等待的原因。
  - 能处理同 href 属性固定、新 href 建立资源及组件卸载后资源可能保留的生命周期边界。
  - 能用 DOM 查询、加载事件和 Root 内容状态验证样式资源的资格、顺序、去重与提交合同。
recap:
  - link 只有在 rel 为 stylesheet、href 有效、precedence 为字符串且没有手动加载属性时，才进入特殊样式资源路径。
  - style 同时提供非空 href 与 precedence 后才会提升、按 href 去重并参与 precedence 分组。
  - href 是资源身份；相同 href 必须始终表示同一份样式内容和兼容属性。
  - precedence 的字符串没有内建高低，React 按不同值首次出现的顺序建立组，同组资源保持相邻。
  - 外链 stylesheet 在客户端加载完成前可以延迟依赖内容的提交；内联 style 不需要等待网络加载。
  - 特殊样式资源首次渲染后的 props 更新会被忽略，不能把它当作普通可变 DOM 节点。
  - 特殊资源卸载后可能继续留在 document head，业务逻辑不能依赖卸载立即删除样式。
  - CSS 级联仍由来源、层、important、选择器权重、作用域和源码顺序共同决定，precedence 只管理资源放置分组。
sources:
  - title: React link Reference
    url: https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/components/link.md
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - stylesheet link 的 precedence、head 放置、去重、提交等待、禁用条件和生命周期 caveat
  - title: React style Reference
    url: https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/components/style.md
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 内联 style 的 href 身份、precedence、提升、去重、额外属性和非 Suspense 行为
  - title: React 19 stylesheet support
    url: https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/blog/2024/12/05/react-19.md
    sourceType: official-reference
    appliesTo: React 19
    claims:
      - 组件内样式声明、并发客户端提交、服务端输出和 Suspense reveal 协调
  - title: React DOM 19.2.8 stylesheet implementation
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js
    sourceType: source-code
    appliesTo: React DOM 19.2.8
    claims:
      - 样式资源资格、href key、precedence 插入、资源取得、加载状态和释放边界
  - title: React DOM 19.2.8 stylesheet tests
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMFloat-test.js
    sourceType: official-test
    appliesTo: React DOM 19.2.8
    claims:
      - link 与 style 混合分组、同 href 去重、加载协调、属性固定和卸载保留行为
  - title: WHATWG link and style elements
    url: https://html.spec.whatwg.org/multipage/semantics.html#the-link-element
    sourceType: specification
    appliesTo: HTML Living Standard
    claims:
      - stylesheet link、style 元素和文档级样式资源的 HTML 语义
  - title: '@types/react 19.2.18 declarations'
    url: https://unpkg.com/@types/react@19.2.18/index.d.ts
    sourceType: source-code
    appliesTo: '@types/react 19.2.18'
    claims:
      - LinkHTMLAttributes 与 StyleHTMLAttributes 中 href、precedence 和相关属性的静态类型
---

# 声明式样式资源

## 一、学习目标

- 能判断一组 link 或 style props 何时进入 React 特殊样式资源路径，何时仍是普通宿主元素。
- 能用稳定 href 与 precedence 声明外链和内联样式资源，并区分资源身份、顺序分组与 CSS 级联。
- 能根据 precedence 首次发现顺序和 href 去重规则，预测 React 声明与 document head 资源的差异。
- 能解释外链 stylesheet 的提交与 Suspense 协调，以及内联 style 不触发加载等待的原因。
- 能处理同 href 属性固定、新 href 建立资源及组件卸载后资源可能保留的生命周期边界。
- 能用 DOM 查询、加载事件和 Root 内容状态验证样式资源的资格、顺序、去重与提交合同。

## 二、为什么需要声明式样式资源

组件通常既依赖结构，也依赖样式。若组件只返回 DOM，却要求应用入口提前加载所有 CSS，组件的依赖会
分散在不同文件和层级中：删除组件时容易遗留资源，按需显示组件时也难以判断样式是否已经准备好。

React 允许组件直接声明自己依赖的 stylesheet：

```tsx
/** 显示依赖独立样式文件的报告面板。 */
function ReportPanel() {
  return (
    <>
      <link rel="stylesheet" href="/styles/report-panel.css" precedence="components" />
      <section className="report-panel">季度报告</section>
    </>
  )
}
```

这不是把 `<link>` 原样塞进组件容器。满足资源条件后，React 会负责四件互相关联的事：

1. 把 stylesheet 放到当前 Root 对应的文档 `<head>`。
2. 按 `precedence` 组织不同样式组的 DOM 顺序。
3. 按 `href` 合并多个组件对同一资源的声明。
4. 外链样式加载完成前，延迟依赖内容的提交或 reveal。

因此，声明式样式资源的核心不是“在 JSX 中写 link”，而是建立稳定的资源身份、顺序和加载合同。

## 三、两种样式资源

### 1. 外链 stylesheet

外链样式由浏览器根据 URL 获取：

```tsx
<link rel="stylesheet" href="/styles/chart.css" precedence="components" />
```

进入 React 特殊资源路径需要同时满足：

- `rel` 是字符串 `stylesheet`；
- `href` 是非空字符串；
- `precedence` 是字符串；
- 没有 `itemProp`；
- 没有 `onLoad` 或 `onError`；
- 完全省略 `disabled`；即使写成 `disabled={false}`，也会退出特殊资源路径。

满足这些条件后，React 才能把 URL 当作稳定身份，统一管理放置、去重、顺序和加载状态。

### 2. 内联 style 资源

内联 CSS 可以通过 `<style>` 声明：

```tsx
const chartStyles = `
  .chart-value {
    font-variant-numeric: tabular-nums;
  }
`

/** 声明图表组件使用的内联样式资源。 */
function ChartStyles() {
  return (
    <style href="chart-value-styles" precedence="components">
      {chartStyles}
    </style>
  )
}
```

这里的 `href` 是 React 使用的资源身份，不要求浏览器通过它下载文件。`precedence` 决定它属于哪个顺序
组。两者都提供时，React 才能把 style 提升到 head 并按 `href` 去重。

内联 style 已经包含完整 CSS 文本，不需要等待外部网络，因此不会因为字体、背景图等 CSS 内部引用而
触发 React 的 stylesheet 提交等待。

### 3. 行为对照

| 声明 | 特殊资源条件 | 去重身份 | 等待加载 | 典型 DOM 放置 |
| --- | --- | --- | --- | --- |
| `<link rel="stylesheet">` | 有效 `href`、字符串 `precedence`，无手动加载 props | `href` | 是 | 文档 head |
| `<style>` | 非空 `href`、字符串 `precedence` | `href` | 否 | 文档 head |
| 缺少资源条件的 link/style | 不进入特殊资源路径 | 普通 React 身份 | 否 | 按普通宿主规则处理 |

“普通宿主规则”不等于可以随意把标签放在任何位置。HTML 内容模型仍然有效；如果需要文档级样式资源，
应提供完整资源合同，而不是依赖浏览器修正无效结构。

## 四、外链 stylesheet 的最小合同

### 1. 使用稳定常量

资源 URL 与分组应在渲染前确定，并在资源生命周期内保持稳定：

```tsx
const profileStylesheet = {
  href: '/styles/profile-card.v3.css',
  precedence: 'components',
} as const

/** 显示依赖资料卡样式的用户摘要。 */
function ProfileCard({ name }: { name: string }) {
  return (
    <>
      <link rel="stylesheet" {...profileStylesheet} />
      <article className="profile-card">
        <h2>{name}</h2>
      </article>
    </>
  )
}
```

版本号放入 URL 后，内容改变会得到新的 `href`。缓存、去重和发布回滚都能围绕同一个资源身份工作。

### 2. 资源声明可以靠近依赖组件

stylesheet 不必集中在应用入口。多个功能组件可以各自声明依赖：

```tsx
/** 显示账单列表，并声明列表专用样式。 */
function InvoiceList() {
  return (
    <>
      <link rel="stylesheet" href="/styles/invoice-list.css" precedence="features" />
      <section className="invoice-list">{/* 账单条目 */}</section>
    </>
  )
}
```

物理 DOM 节点进入 head，但资源所有权仍来自渲染它的组件树。这样可以从组件源码直接看到结构与样式
依赖，而不需要手工查询或移动 head 节点。

### 3. 浏览器属性仍有原本含义

`media`、`crossOrigin`、`referrerPolicy`、`integrity`、`fetchPriority`、`title` 等属性仍描述浏览器
如何处理外链资源。例如：

```tsx
<link
  rel="stylesheet"
  href="https://cdn.example.com/print.css"
  precedence="print"
  media="print"
  crossOrigin="anonymous"
  integrity="sha384-完整摘要"
/>
```

这些属性不是可随意改变的附加状态。相同 `href` 被去重时，各处声明必须对资源内容和加载属性达成一致。

## 五、内联 style 的资源合同

### 1. href 必须唯一标识 CSS 内容

内联 style 的 `href` 不负责下载，而是把 CSS 文本映射到稳定身份：

```tsx
const badgeStyles = `
  .status-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
  }
`

/** 声明状态徽标的共享内联样式。 */
function StatusBadgeStyles() {
  return (
    <style href="status-badge-v1" precedence="components">
      {badgeStyles}
    </style>
  )
}
```

如果 CSS 文本改变，应同步改变资源身份，例如从 `status-badge-v1` 升为 `status-badge-v2`。同一个
`href` 不能在两个位置对应不同 CSS 文本，否则哪个声明先建立资源会影响结果。

### 2. children 应是完整字符串

样式文本应在渲染前形成一个字符串：

```tsx
const color = '#14503f'
const noticeCss = `.notice { color: ${color}; }`

<style href={`notice-${color}`} precedence="components">
  {noticeCss}
</style>
```

动态 CSS 必须同时解决身份问题。若 `color` 改变，但 `href` 不变，React 不会把已建立的特殊资源当作
普通 style 节点更新。资源 key 应准确反映会改变生成结果的输入。

### 3. 特殊 style 的 DOM 属性会被转换

React 用 JSX 中的 `href` 和 `precedence` 管理资源。真实 style 节点通常以 `data-href` 和
`data-precedence` 表示这两个管理字段：

```html
<style data-href="status-badge-v1" data-precedence="components">
  .status-badge { ... }
</style>
```

这属于 React 当前实现的可观察结果，不应把 `data-*` 名称当作应用接口。业务代码应通过声明本身管理
资源，不应查询这些内部 DOM 标记再修改节点。

### 4. 不要把任意 props 塞给特殊 style

启用特殊处理后，React 只保留资源管理和样式语义所需的信息，并可能丢弃额外 props。需要业务标识、
事件或可变 data 属性时，应放在依赖样式的内容节点上，而不是放在特殊 style 元素上。

## 六、precedence 的顺序模型

### 1. 字符串是分组名称

`precedence` 可以写成 `foundation`、`components`、`overrides`，但这些名称没有内建权重。React 不会
把 `high` 理解为比 `low` 高，也不会按字母或数字排序。

真正规则是：不同 precedence 值按首次发现顺序建立分组；之后发现的同组资源会插入该组末尾。

```tsx
/** 声明三个资源，并让相同分组保持相邻。 */
function PageStyles() {
  return (
    <>
      <link rel="stylesheet" href="/styles/reset.css" precedence="foundation" />
      <link rel="stylesheet" href="/styles/dialog.css" precedence="components" />
      <link rel="stylesheet" href="/styles/tokens.css" precedence="foundation" />
    </>
  )
}
```

即使 `tokens.css` 在组件树中晚于 `dialog.css` 被发现，它仍会进入 `foundation` 组，与 `reset.css`
相邻，并保持在 `components` 组之前。

### 2. link 与 style 共享分组

外链 link 和特殊内联 style 都参与同一套 precedence 分组：

```tsx
<style href="inline-tokens" precedence="foundation">
  {`:root { --accent: #146b58; }`}
</style>
<link rel="stylesheet" href="/styles/button.css" precedence="components" />
<style href="inline-dialog" precedence="components">
  {`.dialog { isolation: isolate; }`}
</style>
```

同组混合资源保持相邻。这样组件可以选择外链或内联承载方式，而不必建立两套顺序系统。

### 3. 分组顺序不替代 CSS 级联

资源位置只是 CSS 级联的一个输入。最终样式还受以下因素影响：

- 样式来源与级联层；
- `!important`；
- 选择器权重；
- 作用域接近度；
- 同等条件下的源码顺序；
- 媒体条件是否匹配。

后出现的低权重规则不能覆盖更高权重规则。`precedence` 解决的是资源 DOM 分组，不是完整 CSS 冲突
求解器。

### 4. 建立少量稳定分组

常见设计使用少量全局常量：

```ts
export const stylePrecedence = {
  foundation: 'foundation',
  components: 'components',
  overrides: 'overrides',
} as const
```

调用方复用这些值，可以避免拼写差异意外创建新组。不要为每个组件生成一个 precedence；组件身份应由
`href` 表达，precedence 只表达覆盖层级。

## 七、href 去重与资源身份

### 1. 多个声明可以指向一个 DOM 资源

```tsx
/** 声明所有图表共享的样式。 */
function ChartStyles() {
  return <link rel="stylesheet" href="/styles/chart.css" precedence="components" />
}

/** 同时显示两个图表。 */
function Dashboard() {
  return (
    <>
      <ChartStyles />
      <ChartStyles />
      <section className="chart">收入</section>
      <section className="chart">支出</section>
    </>
  )
}
```

组件树中有两个 link 元素声明，但当前文档 head 中只需要一个对应 stylesheet 节点。特殊内联 style
同样按 `href` 去重。

### 2. href 不是普通 key 的别名

React 元素的 `key` 解决同一父节点下的 reconciliation 身份；样式资源 `href` 解决当前 hoistable root
中的资源身份。给两个不同 URL 设置相同 React `key` 不会合并资源；给多个特殊样式声明相同 `href` 才会
共享资源记录。

### 3. 同 href 必须具有同一合同

相同 `href` 的声明必须指向同一内容，并保持兼容的 `precedence`、`media`、CORS 和完整性属性。不要利用
“先发现者胜出”选择配置。正确做法是在一个共享模块中导出资源常量，让所有声明使用同一份数据。

### 4. 去重范围属于当前样式资源根

资源由对应 Document 或 ShadowRoot 的 hoistable root 管理。不能把一个文档里的去重结果推导为跨 iframe、
跨 Document 或任意独立宿主的全局单例。需要隔离文档时，应分别检查每个 root 的资源节点。

## 八、外链样式与提交协调

### 1. 为什么要等待

如果依赖内容先提交，stylesheet 稍后才生效，用户会短暂看到无样式内容，布局也可能在资源到达后跳变。
React 取得特殊外链 stylesheet 后，会跟踪它的加载结果，并在客户端等待新资源就绪后再提交相关渲染。

```tsx
/** 在样式就绪后显示账户面板。 */
function AccountPanel() {
  return (
    <Suspense fallback={<p>正在准备账户面板</p>}>
      <link rel="stylesheet" href="/styles/account-panel.css" precedence="features" />
      <section className="account-panel">账户信息</section>
    </Suspense>
  )
}
```

初次渲染和更新时，可见结果取决于已有 UI、边界和调度上下文：边界可能继续显示已有内容或 fallback，
而不是先提交缺少样式的新内容。稳定判断是“依赖新 stylesheet 的内容不会在资源就绪前作为完成结果
显示”，不是承诺某个固定毫秒数或固定过渡画面。

### 2. 失败也必须结束等待

浏览器会以 `load` 或 `error` 结束资源加载。React 不能让一次失败永远阻塞提交，但样式获取失败后的界面
可能缺少必要规则。生产系统仍需通过资源监控、发布回滚、缓存策略和错误边界处理整体可靠性。

不要给特殊 stylesheet 自己添加 `onError` 再期待 React 同时管理加载；手动回调会退出特殊路径。需要
自定义加载状态时，应明确选择手动资源管理方案，并承担放置、去重、顺序和可见性控制。

### 3. 内联 style 不触发加载等待

特殊内联 style 的 CSS 文本已经随渲染提供。即使 CSS 内含 `url()` 或 `@font-face`，React 也不会跟踪
其中每个二级资源并让当前 Suspense 边界等待。图片和字体有自己的浏览器加载生命周期。

### 4. 服务端与客户端使用同一声明

同一 link/style 声明可以参与服务端渲染。React 可以在服务端把已发现的样式放进 head；晚发现的外链
样式会与客户端 Suspense reveal 协调。本节只建立公共声明和客户端可观察行为，不把具体框架的流式传输、
HTTP header 或部署策略当作 React 标签的通用合同。

## 九、更新和卸载边界

### 1. 特殊资源不是可变 DOM 节点

`href` 是特殊 link/style 的资源身份。同一 `href` 再次声明时，React 不会像普通 DOM 更新那样改写
`precedence`、CSS children 或加载属性；这些变化会被忽略，并可能在开发环境提示问题。改成新 `href`
则会建立新 Resource，而不是修改旧 Resource。

不要为每次可撤销的主题切换建立新资源：

```tsx
/** 错误地把同一资源位置当作主题开关。 */
function MutableTheme({ dark }: { dark: boolean }) {
  return (
    <link
      rel="stylesheet"
      href={dark ? '/styles/dark.css' : '/styles/light.css'}
      precedence="theme"
    />
  )
}
```

这段代码会为新的 `href` 建立新 Resource，但旧资源可能继续留在 head，因此它不能提供严格的主题启停。
主题属于可撤销 UI State，应让 href 保持稳定，只改变内容根属性：

```tsx
/** 用稳定资源与内容属性切换主题。 */
function ThemeResource({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <>
      <link rel="stylesheet" href="/styles/theme-v1.css" precedence="theme" />
      <main data-theme={theme}>{/* 内容 */}</main>
    </>
  )
}
```

只有 CSS 资源内容本身发布新版本时，才应把不可变地址从 `theme-v1.css` 更新为 `theme-v2.css`。新 href
会建立新 Resource；它表示资源版本替换，不表示一次需要撤销的交互状态。

### 2. 卸载不等于删除

React 会记录有多少声明引用同一资源，但特殊样式节点在引用归零后仍可能留在 DOM。保留已经下载和解析的
样式可以避免重新挂载时重复工作，也意味着不能把“组件卸载”当作“CSS 已撤销”的信号。

### 3. 需要可撤销样式时改变设计

可撤销视觉状态通常应由普通内容属性控制：

```tsx
/** 用稳定 stylesheet 与可变根属性控制密集模式。 */
function ResultsPanel({ compact }: { compact: boolean }) {
  return (
    <>
      <link rel="stylesheet" href="/styles/results.css" precedence="components" />
      <section className="results" data-density={compact ? 'compact' : 'comfortable'}>
        搜索结果
      </section>
    </>
  )
}
```

stylesheet 保持稳定，组件状态只改变内容节点属性。这样更新走普通 React DOM 路径，不依赖资源删除。

## 十、退出特殊处理的属性

### 1. onLoad 与 onError

添加加载回调表示组件要自行管理资源状态，React 因而不会再为该 link 提供特殊提升、去重和提交协调：

```tsx
<link
  rel="stylesheet"
  href="/styles/manual.css"
  precedence="components"
  onLoad={() => console.info('loaded')}
/>
```

这不是“特殊资源外加一个通知”，而是另一套手动管理模式。不要混合两种所有权。

### 2. disabled

`disabled` 表示调用方准备启用或停用 stylesheet，也会退出特殊资源行为。需要在多个样式集之间切换时，
应先选择明确的主题架构，而不是同时依赖 React 去重和命令式 disabled 切换。

### 3. itemProp

`itemProp` 表示元素描述某个条目，而不是整个文档资源。React 不会把这类元素当作文档级样式资源提升。
stylesheet link 一般不应与 microdata 条目元数据混用。

### 4. 缺少 precedence

stylesheet 的 DOM 顺序会影响级联。没有 precedence 时，React 无法安全判断它应进入哪个样式组，因此
不会启用特殊资源行为。不要把缺失值理解成隐式 `default`；应显式选择项目约定的组名。

## 十一、TypeScript 与 HTML 边界

### 1. 当前 intrinsic 类型

`@types/react` 为 link 和 style 增加了 React 专用属性：

```ts
interface LinkHTMLAttributes<T> extends HTMLAttributes<T> {
  href?: string
  media?: string
  integrity?: string
  crossOrigin?: CrossOrigin
  precedence?: string
}

interface StyleHTMLAttributes<T> extends HTMLAttributes<T> {
  media?: string
  href?: string
  precedence?: string
}
```

这些字段大多是可选的，类型系统不会表达“rel 为 stylesheet 时 href 与 precedence 必须同时存在”。
资格组合仍需由组件 API 约束。

### 2. 用 Props 收窄资源合同

```tsx
interface StylesheetResourceProps {
  href: string
  precedence: 'foundation' | 'components' | 'overrides'
  media?: string
}

/** 声明一个由应用统一管理的外链样式资源。 */
function StylesheetResource({ href, precedence, media }: StylesheetResourceProps) {
  return <link rel="stylesheet" href={href} precedence={precedence} media={media} />
}
```

联合类型可以限制允许的分组名称，但仍不能证明 URL 非空、同 href 配置一致或文件实际返回 CSS。运行时
和发布流程必须继续验证这些事实。

### 3. HTML 语义仍然成立

`rel="stylesheet"` 表示外部资源是样式表；`media` 决定适用条件；`integrity` 与 `crossOrigin` 影响跨源
完整性校验。React 的提升和去重没有取消浏览器对 MIME、CORS、CSP、URL 和 CSS 语法的要求。

## 十二、组合设计方法

### 1. 共享资源常量

```ts
export const accountPanelStyles = {
  rel: 'stylesheet',
  href: '/styles/account-panel.v2.css',
  precedence: 'features',
} as const
```

```tsx
import { accountPanelStyles } from './account-panel-styles'

/** 显示账户资料并复用统一资源合同。 */
export function AccountProfile() {
  return (
    <>
      <link {...accountPanelStyles} />
      <article className="account-profile">账户资料</article>
    </>
  )
}
```

常量同时固定 URL、rel 和 precedence，避免不同组件对同 href 提供冲突属性。

### 2. 资源组件不承担业务状态

资源组件只声明稳定资源，不读取频繁变化的表单或交互状态。业务状态应改变内容 class、data 属性或
CSS 自定义属性：

```tsx
/** 使用稳定样式资源显示可变进度。 */
function ProgressPanel({ percent }: { percent: number }) {
  return (
    <>
      <link rel="stylesheet" href="/styles/progress.css" precedence="components" />
      <section className="progress-panel" style={{ '--progress': percent } as React.CSSProperties}>
        完成 {percent}%
      </section>
    </>
  )
}
```

### 3. 使用 DOM 事实验证合同

验证声明式资源时，应查询真实 Document：

```ts
const resources = document.head.querySelectorAll(
  'link[rel="stylesheet"][data-precedence], style[data-precedence]',
)

const duplicateCount = document.head.querySelectorAll(
  'link[rel="stylesheet"][href="/styles/chart.css"]',
).length
```

高价值断言包括：资源位于 head、同 href 数量为一、同 precedence 相邻、外链就绪前依赖内容未提交、
无关静态节点未被删除。不要仅检查 JSX 字符串或组件 State。

## 十三、交互观察

下面的隔离示例先提交一个目录视图，再请求依赖外链 stylesheet 的新视图。外链资源使用可控加载事件，
不会访问真实网络，也不会修改学习站自身的 head。

:::demo{id="react.core.learn.advanced.declarative-stylesheet-resources.isolated-resource-demo"}
:::

观察顺序：

1. 初始 Root 已有目录视图，独立 head 只有静态标记。
2. 进入依赖视图后，React 先准备样式加载，Root 显示 fallback，依赖内容尚未揭示。
3. 两份相同 link 声明只产生一个 stylesheet 节点；两份同 href style 也只产生一个节点。
4. 标记 stylesheet 已加载后，依赖视图完成提交。
5. 卸载 Root 后正文清空，静态标记保留，特殊资源节点可能继续存在。

## 十四、易错使用提示

:::pitfalls
### 错误：缺少 precedence 却期待特殊资源行为

**触发条件：** 只写 `rel="stylesheet"` 和 `href`。

**原因：** React 不知道该资源应进入哪个顺序组。

**后果：** 不会获得预期的提升、按 href 去重和提交等待；在不合适的 DOM 上下文中还可能出现开发警告。

**错误示例：**

```tsx
<link rel="stylesheet" href="/styles/panel.css" />
```

**正确写法：**

```tsx
<link rel="stylesheet" href="/styles/panel.css" precedence="components" />
```

**验证方式：** 查询 head 中的 `link[data-precedence]`，并确认依赖内容在资源就绪后提交。

### 错误：按 precedence 名称或数字判断高低

**触发条件：** 使用 `low`、`high` 或 `10`、`20` 后，假定 React 会排序字符串。

**原因：** precedence 值只是组名，组顺序由首次发现决定。

**后果：** 实际 DOM 顺序与命名直觉不一致。

**错误示例：**

```tsx
<link rel="stylesheet" href="/styles/high.css" precedence="high" />
<link rel="stylesheet" href="/styles/low.css" precedence="low" />
```

**正确写法：**

```tsx
<link rel="stylesheet" href="/styles/foundation.css" precedence="foundation" />
<link rel="stylesheet" href="/styles/overrides.css" precedence="overrides" />
```

**验证方式：** 保证 `foundation` 在应用中先被发现，再读取 head 中所有 `data-precedence` 的实际顺序，
不检查字符串大小。

### 错误：让同一个 href 表示不同 CSS

**触发条件：** 两个特殊 style 使用同一 href，却生成不同 children。

**原因：** href 是去重身份，不是描述文本。

**后果：** 后续声明不会建立第二份预期资源，最终 CSS 取决于首次建立的身份。

**错误示例：**

```tsx
<style href="button" precedence="components">{`.button { color: red; }`}</style>
<style href="button" precedence="components">{`.button { color: blue; }`}</style>
```

**正确写法：**

```tsx
<style href="button-red-v1" precedence="components">{`.button { color: red; }`}</style>
<style href="button-blue-v1" precedence="components">{`.button { color: blue; }`}</style>
```

**验证方式：** 建立 href 到内容摘要的映射，并拒绝同 key 多内容。

### 错误：渲染后修改特殊资源 props

**触发条件：** 保持同一 href，却根据 State 改变 precedence、加载属性或 style children。

**原因：** 相同 href 会继续命中首次建立的 Resource，其他 props 不参与身份，后续改写会被忽略。

**后果：** UI State 已改变，但 head 资源仍是旧配置，开发环境还会产生警告。

**错误示例：**

```tsx
<style href="theme-styles-v1" precedence="theme">
  {theme === 'dark' ? '.panel { color: white; }' : '.panel { color: black; }'}
</style>
```

**正确写法：**

```tsx
<link rel="stylesheet" href="/styles/theme.css" precedence="theme" />
<main data-theme={theme}>{/* 内容 */}</main>
```

**验证方式：** 切换 State 后同时检查 console、head href 和内容节点属性。

### 错误：添加 onLoad 后仍期待 React 管理加载

**触发条件：** 给带 precedence 的 stylesheet 添加 `onLoad` 或 `onError`。

**原因：** 回调表示调用方选择手动加载所有权，特殊资源行为会关闭。

**后果：** 提升、去重和提交协调不再遵循特殊 stylesheet 合同。

**错误示例：**

```tsx
<link
  rel="stylesheet"
  href="/styles/table.css"
  precedence="components"
  onLoad={() => setReady(true)}
/>
```

**正确写法：**

```tsx
<link rel="stylesheet" href="/styles/table.css" precedence="components" />
```

**验证方式：** 扫描特殊资源声明，确认没有 `onLoad`、`onError` 或 `disabled`。

### 错误：认为内联 style 会等待内部图片或字体

**触发条件：** style children 包含 `url()` 或 `@font-face`，并期待 Suspense 等待二级资源。

**原因：** 内联 CSS 文本本身无需网络加载；React 不跟踪 CSS 引用的每个资源。

**后果：** 内容已经提交，但图片或字体仍可能稍后变化；不能把 style 的提交当作二级资源就绪信号。

**错误示例：**

```tsx
<style href="hero" precedence="components">
  {`.hero { background-image: url('/hero.jpg'); }`}
</style>
```

**正确写法：** style 只负责 CSS 声明；图片保留自己的尺寸和加载生命周期。

```tsx
<>
  <style href="hero-layout" precedence="components">
    {`.hero { aspect-ratio: 16 / 9; background-size: cover; }`}
  </style>
  <img className="hero" src="/hero.jpg" width="1600" height="900" alt="课程封面" />
</>
```

**验证方式：** 分开观察 style DOM 已提交与图片/字体网络状态。

### 错误：把组件卸载当作 CSS 撤销

**触发条件：** 卸载最后一个声明资源的组件后，立即假定 stylesheet 节点被删除。

**原因：** 特殊资源可以在引用归零后继续保留。

**后果：** 依赖“卸载即失效”的主题、实验或隔离逻辑出现样式泄漏，`enabled=false` 也不能证明实验 CSS
已经撤销。

**错误示例：**

```tsx
{enabled ? <ExperimentStyles /> : null}
```

**正确写法：** 使用稳定资源和内容根属性限定规则：

```css
[data-experiment='enabled'] .result {
  color: #14503f;
}
```

**验证方式：** 卸载后同时检查内容节点、head 资源和实际 computed style。

### 错误：用 precedence 代替 CSS 权重设计

**触发条件：** 只调整资源组顺序，却忽略 `!important`、选择器权重或级联层。

**原因：** DOM 顺序只在其他级联条件相同时决定胜负。

**后果：** 资源已经位于预期位置，规则仍无法覆盖。

**错误示例：**

```css
#app .button {
  color: red;
}

.button {
  color: blue;
}
```

**正确写法：** 先比较来源、层、important 和权重，再把 precedence 用作资源分组工具。

```css
@layer foundation, components, overrides;

@layer overrides {
  #app .button {
    color: blue;
  }
}
```

**验证方式：** 在 DevTools 中检查最终匹配规则、权重与来源文件，而不只看 head 顺序。
:::

## 十五、源码推导与适用场景

1. React DOM 会把满足资格的 link/style 映射为样式 Resource；外链和内联样式都使用 `href` 形成 key。
2. 资源表位于对应 hoistable root，多个声明取得同一记录，因此 DOM 去重不是 JSX 元素数量去重。
3. 插入算法扫描带 `data-precedence` 的 link/style：同组新节点放在该组末尾，不同新组放在已发现组之后。
4. 外链 stylesheet 具有加载状态和提交期等待；内联 style 没有需要跟踪的 stylesheet 加载状态。
5. 特殊资源更新路径不会像普通宿主节点一样 patch props；公共文档明确要求把首次 props 视为固定值。
6. 释放资源会减少引用计数，但当前实现不以引用归零删除样式 DOM；公共文档因此只承诺“可能保留”。
7. 这些内部事实用于解释公共行为，不能把内部字段名、计数器或具体插入函数当作长期 API。
8. 适合使用该能力的场景是组件依赖稳定、可寻址的样式资源，并需要 React 协调顺序、去重或 reveal。
9. 频繁变化的视觉 State 应通过 class、data 属性、CSS 自定义属性或内联 `style` prop 表达，而不是改写
   特殊样式资源。
10. 完整 CSS-in-JS 插入时机、资源提示函数、脚本资源和构建工具 CSS pipeline 分别有不同合同，不能从本节
    结论直接推导。

## 十六、练习

:::exercise
### 练习一：判断资源资格

**要求：**

```tsx
<link rel="stylesheet" href="/a.css" precedence="components" />
<link rel="stylesheet" href="/b.css" />
<link rel="stylesheet" href="/c.css" precedence="components" disabled />
<style href="inline-d" precedence="components">{`.d { color: teal; }`}</style>
<style>{`.e { color: navy; }`}</style>
```

**验收：** 结论必须分别覆盖外链 link 的 `rel`、`href`、`precedence`、`disabled`，以及内联 style 的
`href`、`precedence` 和字符串 CSS children；不能只按标签名称判断。

**参考答案：** `/a.css` 具备完整外链资源合同；`/b.css` 缺少 `precedence`；`/c.css` 因提供
`disabled` 而退出特殊处理；`inline-d` 具备内联样式资源合同；最后一个 style 缺少 `href` 和
`precedence`，是普通 style 节点。
:::

:::exercise
### 练习二：预测 precedence 顺序

**要求：** 按 `foundation -> features -> foundation -> overrides -> features` 的发现顺序声明五个不同
href，写出最终 head 中的分组顺序和每组内部顺序，再用 DOM 查询验证。

**验收：** 结果必须保持同组资源相邻、同组内部保持发现顺序，并说明 precedence 名称没有字典序或数值
权重。

**参考答案：** 最终顺序为两个 `foundation` 资源、两个 `features` 资源、一个 `overrides` 资源；第二个
`foundation` 会插入第一组末尾，第二个 `features` 会插入第二组末尾，不会简单追加到整个序列末尾。
:::

:::exercise
### 练习三：修复冲突身份

**要求：** 给定两个同 href、不同 CSS children 的 style 声明，设计由内容版本生成稳定 href 的方式，
并解释哪些输入必须进入身份，哪些展示 State 不应生成新资源。

**验收：** 任意会改变 CSS 字符串或资源加载合同的输入都必须改变 href；选中项、展开状态等仅改变内容
节点的 State 不得改写资源身份。

**参考答案：** 可以把组件名和 CSS 发布版本组成 `report-card-v2` 之类的 href；颜色、规则或媒体合同
改变时发布新版本。当前选中项、面板开关和筛选条件应通过 class、data 属性或 CSS 自定义属性表达，不应
为每个交互状态建立 stylesheet 资源。
:::

:::exercise
### 练习四：验证提交等待

**要求：** 先提交已有内容，再渲染依赖受控 stylesheet 的新视图；加载完成前记录 root 文本、preload
和 stylesheet，结算加载后再次记录。

**验收：** 加载前 head 中存在目标 preload，root 显示 fallback 且依赖内容尚未揭示；结算后目标
stylesheet 与内联资源按 precedence 进入 head，新内容才成为已提交结果。统计时必须区分 preload 与
stylesheet。

**参考答案：** 首次记录应证明 preload 已建立而依赖视图尚未揭示；依次结算目标 preload 和随后插入的
stylesheet，再等待 React 完成提交并断言 root 显示新视图。若外链未就绪时依赖内容已经出现，就没有
证明提交协调。
:::

:::exercise
### 练习五：设计可切换主题

**要求：** 把“根据 State 改写 stylesheet href”的实现改为稳定资源加 `data-theme`，并列出需要检查的
资源节点、内容属性和 computed style。

**验收：** 主题切换前后 stylesheet href 和 precedence 必须保持不变，只有内容根的 `data-theme`
改变；切回初始主题后无需删除或重新下载资源即可恢复样式。

**参考答案：** 只声明一次同时包含各主题选择器的稳定 stylesheet，例如使用
`[data-theme='dark'] .panel`；State 只更新内容根的 `data-theme`。验证同一资源节点仍在 head、根属性已
切换且目标元素的 computed style 与所选主题一致，因此实现不依赖组件卸载时回收资源。
:::

## 十七、本节小结

- 特殊 stylesheet link 需要 `rel="stylesheet"`、有效 `href` 和字符串 `precedence`，且不能混入手动
  加载属性。
- 特殊内联 style 需要稳定 `href` 与 `precedence`；它能提升和去重，但不触发网络加载等待。
- `href` 定义资源身份，`precedence` 定义顺序组，两者职责不同。
- precedence 按不同值首次发现的顺序建立组，同组资源保持相邻，不按名称排序。
- 外链 stylesheet 可以延迟依赖内容提交，避免内容先于所需样式显示。
- 特殊资源首次 props 应视为不可变；动态视觉状态应放在普通内容节点上。
- 卸载组件不保证删除特殊样式节点，不能用资源移除表达可撤销 UI State。
- DOM 顺序只是 CSS 级联的一部分，仍需分析层、important、权重、作用域和媒体条件。

## 十八、参考资料

- [React `<link>` Reference](https://react.dev/reference/react-dom/components/link) - stylesheet link 的
  特殊资格、precedence、去重、加载协调和更新边界。
- [React `<style>` Reference](https://react.dev/reference/react-dom/components/style) - 内联样式资源的
  href 身份、提升、去重、分组和非加载行为。
- [React 19：Support for stylesheets](https://react.dev/blog/2024/12/05/react-19#support-for-stylesheets) -
  组件组合、客户端提交等待和服务端 Suspense reveal 的设计目标。
- [React DOM stylesheet implementation](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js) -
  固定版本的资格、资源 key、插入、加载和释放实现。
- [React DOM stylesheet tests](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMFloat-test.js) -
  link/style 分组、去重、加载、更新和卸载行为的官方测试。
- [WHATWG link element](https://html.spec.whatwg.org/multipage/semantics.html#the-link-element) -
  stylesheet 外链关系、属性与浏览器处理语义。
- [WHATWG style element](https://html.spec.whatwg.org/multipage/semantics.html#the-style-element) -
  内联 CSS 样式表的 HTML 内容模型与属性语义。
- [`@types/react@19.2.18`](https://unpkg.com/@types/react@19.2.18/index.d.ts) - link/style intrinsic
  attributes 与 React 专用 `precedence`、`href` 类型。
