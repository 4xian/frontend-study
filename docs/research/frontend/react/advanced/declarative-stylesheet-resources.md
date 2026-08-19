# 声明式样式资源研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.advanced.declarative-stylesheet-resources`
- 标题：声明式样式资源
- 教学层级：高级
- 前置课程：`react.core.learn.advanced.document-metadata-hoisting`
- 核验日期：`2026-08-18`
- 文档基线：React 官方文档 `19.2`
- 运行时基线：React / React DOM `19.2.8`
- 类型基线：`@types/react` `19.2.18`、`@types/react-dom` `19.2.4`
- 固定文档提交：`reactjs/react.dev@c7d6b700038c63d1aaf2c649af1aefe01ebbacac`
- 固定运行时提交：`facebook/react@1dd4ecbdabf826f527fc9a58c05ea70375b7d170`
- 路线边界：A20 已完成；A21 只研究声明式 stylesheet 资源；A22 异步脚本及其后课程不进入本文

本课只回答一条主线：组件可以在依赖样式的位置声明外链
`<link rel="stylesheet" href="..." precedence="..." />` 或带资源身份的内联
`<style href="..." precedence="...">...</style>`；React DOM 负责把合格资源放入同一
hoistable root 的样式序列、按 `precedence` 分组、按 `href` 复用，并在外链样式加载时协调内容提交。

必须覆盖：

1. 外链 stylesheet 获得 React 特殊资源语义的完整资格条件，以及缺少任一条件时退回普通宿主节点的
   边界。
2. 内联 `<style>` 获得提升与去重语义所需的 `href`、`precedence` 和字符串 CSS children。
3. React `precedence` 是“首次发现顺序”建立的分组标签，不按名字、字母或数字排序。
4. 相同 precedence 的 `<link>` 与 `<style>` 放在同一组，新组排在已有组之后；输出 DOM 使用
   `data-precedence`，不是原样保留 React prop。
5. 只有外链 stylesheet 具有加载状态并参与 Suspense/提交协调；内联 `<style>` 本身不等待其引用的
   字体、图片或其他异步资源。
6. `href` 是资源身份键；同一资源声明多次只对应一个 DOM 资源，其他 props 不参与身份。
7. 同一 `href` 首次建立资源后，props 和 CSS children 不是可变状态；同 href 改写会被忽略。
8. 改为新 `href` 会建立新资源；旧资源不因最后一个声明卸载而保证立即删除。
9. `onLoad`、`onError` 或 `disabled` 表示调用方接管加载/启用状态，会让外链 stylesheet 退出 React
   的提升、去重与等待语义。
10. React 资源所有权、浏览器 stylesheet 生命周期和组件挂载生命周期不是一回事；条件不渲染不等于
    从 document 中撤销已经建立的样式资源。
11. HTML 原生 `style/link` 规则与 React 专用 `href/precedence` 资源协议必须分开说明。
12. Demo 与验收必须使用隔离的同源 document，不得向课程站点自身的 `<head>` 注入课程资源。

明确排除：A22 async script 的放置、去重、执行和所有权；A23 `prefetchDNS`、`preconnect`、
`preload`、`preinit` 及 module 变体的 API 选择；A24 `useInsertionEffect`；CSS-in-JS 库实现；打包器 CSS
拆分策略；CSS Modules、Tailwind、Sass；HTTP `Link` header、Early Hints；CSP 部署教程；框架 Metadata
API；多 Root、Portal、ShadowRoot、跨 iframe 产品支持；Server Components/Functions；完整 streaming
协议；浏览器缓存性能结论；以及任何“React 会在组件卸载时回收样式”的承诺。

## 核验范围与版本

1. 外部入口先通过 Tavily 定位 React 官方 `<link>`、`<style>`、Suspense 和 React 19 stylesheet
   发布说明；搜索已返回可靠官方入口，没有启用后续搜索服务。
2. 公共合同逐项回到 React `19.2` live Reference 与固定 `react.dev` 提交核对；运行时细节只采用
   `react-dom@19.2.8` 对应提交的源码和官方测试。
3. `package.json`、`package-lock.json` 与已安装包一致：React / React DOM 为 `19.2.8`，
   `@types/react` 为 `19.2.18`，`@types/react-dom` 为 `19.2.4`。
4. npm registry 中 `react@19.2.8` 与 `react-dom@19.2.8` 的 `gitHead` 均为
   `1dd4ecbdabf826f527fc9a58c05ea70375b7d170`，与本文固定源码一致。
5. WHATWG HTML 只用于确认 `link/style` 的 HTML 语义、允许属性和浏览器 render-blocking 边界；
   `precedence` 与 `<style href>` 的资源身份是 React 协议，不是 HTML 标准能力。

## 关键精度结论

1. **资源语义必须显式 opt in。** 外链必须同时满足 `rel="stylesheet"`、非空字符串 `href`、字符串
   `precedence`，且没有 `itemProp`、`onLoad`、`onError`，`disabled` 必须为 `null/undefined`；
   `<style>` 必须有非空字符串 `href`、字符串 `precedence`，且没有 `itemProp`（S1、S3、S7）。
2. **`precedence` 不是权重数值。** React 把第一次遇到的值视为较低组，之后首次出现的值依次排在
   后面；`"high"` 不会因为名字自动高于 `"default"`（S1、S3、S9、S12）。
3. **外链与内联共享排序序列。** 同一 precedence 组中的 `<link>` 和资源化 `<style>` 相邻放置；
   新节点追加到同组末尾，不能用组件的最终视觉层级替代首次发现顺序（S1、S3、S9）。
4. **Suspense 等待只属于外链 stylesheet。** 固定实现只有 `stylesheet` Resource 带 loading state；
   `style` Resource 的 state 为 `null`。固定 `<style>` Reference 的概述说 React “can suspend”，但同页
   Usage 明确说 inline stylesheet 不触发 Suspense，源码也支持后者（S3、S4、S6、S10）。
5. **协调的是提交/揭示，不是 render 中的业务 Promise。** React 可以先发起样式请求并延迟提交依赖
   内容；在 Suspense boundary 中，fallback 或已显示内容可以保持到样式 load/error 结束。课程不得把
   它讲成组件代码手工 `throw` 了一个 Promise（S5、S10、S15）。
6. **不是每种调度路径都保证肉眼看到 fallback。** 公共文档承诺加载前协调揭示；固定实现的同步、
   transition、已预载和 media 不匹配路径不同。课程只承诺“避免在允许等待的提交中先揭示依赖内容”，
   不承诺固定 fallback 帧数或所有更新都等待（S10、S13、S15）。
7. **去重身份只有 `href`。** `precedence`、`media`、`integrity`、`crossOrigin`、CSS children 和组件位置
   都不参与 Resource key；字符串相同的 href 命中同一资源（S1、S3、S6）。
8. **`<link>` 与 `<style>` 共用 href 命名空间。** 固定实现把两者都放入同一 `hoistableStyles` map，
   官方开发警告也要求资源化 `<style>` 的 href 不得与任何 hoisted style/link 冲突。不能让同一 href
   同时代表远程 CSS 和另一段 inline CSS（S6、S7、S14）。
9. **资源 props 是首次声明合同，不是 State。** 同 href 再渲染时命中同一 Resource，提交阶段不会对
   同一 Resource 做普通 Host update；公共 Reference 明确说后续 prop 变化会被忽略（S1、S3、S8）。
10. **“更新样式”应换 href，而不是原位改内容。** 新 href 建立新 Resource；从普通 link 切到
    resource link 或反向切换，在同一 Fiber 槽位上是固定实现不支持的 flavor change（S6）。
11. **最后一个 owner 卸载不会回收资源。** 删除 Fiber 只调用 `releaseResource()` 减少 count；
    `19.2.8` 没有在 count 为零时删除 DOM，官方测试明确保留 stylesheet。公共合同因此只说 React
    “may leave”节点，不能承诺永久保留或自动垃圾回收（S1、S3、S9、S11、S16）。
12. **React prop 与最终 HTML 属性不同。** 外链保留 `href` 并把 `precedence` 转成
    `data-precedence`；内联 style 把 React 身份 href 转成 `data-href`，并同样输出
    `data-precedence`。`href`/`precedence` 不是 `HTMLStyleElement` 的原生资源 API（S6、S17、S19）。

## 固定来源表

| 编号 | 一手来源 | 版本固定 | 本课采用的事实 |
| --- | --- | --- | --- |
| S1 | [React `<link>`](https://react.dev/reference/react-dom/components/link) | React DOM 文档 `19.2` | stylesheet 资格、precedence、Suspense、href 去重、props 更新与卸载 caveat。 |
| S2 | [固定 `<link>` Reference](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/components/link.md#L31-L218) | `react.dev@c7d6b700...` | 固定 props、特殊行为、排序和去重示例。 |
| S3 | [React `<style>`](https://react.dev/reference/react-dom/components/style) | React DOM 文档 `19.2` | inline stylesheet 的 href 身份、precedence、提升、去重、更新与卸载边界。 |
| S4 | [固定 `<style>` Reference](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/components/style.md#L31-L104) | `react.dev@c7d6b700...` | inline style 不触发 Suspense、children/href/precedence 合同及文档措辞张力。 |
| S5 | [React 19 stylesheet 发布说明](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/blog/2024/12/05/react-19.md#L600-L647) | React `19` stable 固定提交 | 客户端提交前等待、服务端 head 放置、late boundary 揭示前插入、重复组件只保留一份。 |
| S6 | [`getResource()` 与 href key](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js#L5018-L5327) | React DOM `19.2.8` | link/style 共用 href key；resource/instance flavor 转换限制；DOM props 转换。 |
| S7 | [hoistable 资格判定](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js#L5720-L5865) | React DOM `19.2.8` | HTML namespace、itemProp、非空 href、precedence、事件回调与 disabled 的精确条件。 |
| S8 | [Resource 更新分支](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberCompleteWork.js#L1172-L1257) | React `19.2.8` | 同一 Resource 不做普通 prop update；换 Resource 才标记更新并重新等待。 |
| S9 | [获取、插入与释放 Resource](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js#L5338-L5519) | React DOM `19.2.8` | link/style 实例创建、data 属性、precedence 插入算法、count 仅递减。 |
| S10 | [stylesheet 提交等待实现](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js#L5944-L6389) | React DOM `19.2.8` | 仅外链 stylesheet 等待；media 不匹配跳过等待；load/error 解锁；插入后再提交。 |
| S11 | [HostHoistable 提交与卸载](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberCommitWork.js#L1427-L1458) / [更新提交](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberCommitWork.js#L2047-L2119) | React `19.2.8` | Resource 卸载只 release；普通 hoistable 才移除；新旧 Resource 的所有权切换。 |
| S12 | [客户端 precedence 官方测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMFloat-test.js#L1792-L1881) | React DOM `19.2.8` | 同 precedence 成组、后发现的新节点进入已有组、输出 data-precedence。 |
| S13 | [stylesheet 资格与 media 官方测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMFloat-test.js#L7898-L8121) | React DOM `19.2.8` | 空 href、事件回调、`disabled={false}` 退出 Resource；不匹配 media 不阻塞揭示。 |
| S14 | [inline style Resource 官方测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMFloat-test.js#L8122-L8265) | React DOM `19.2.8` | style 进入 head、data-href/data-precedence、与 link 共用 precedence 顺序。 |
| S15 | [stylesheet 与 Suspense 官方测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMFloat-test.js#L3237-L3485) | React DOM `19.2.8` | transition commit 等待、同步更新 fallback、预载完成与取消更新的当前版本行为。 |
| S16 | [资源保留官方测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMFloat-test.js#L7210-L7476) | React DOM `19.2.8` | client/hydration 放置、precedence、最后引用卸载后仍保留资源。 |
| S17 | [`@types/react@19.2.18`](https://unpkg.com/@types/react@19.2.18/index.d.ts) | npm `19.2.18` | `LinkHTMLAttributes` 和 `StyleHTMLAttributes` 的 href/precedence；children 仍继承 `ReactNode`。 |
| S18 | [React npm 元数据](https://registry.npmjs.org/react/19.2.8) / [React DOM npm 元数据](https://registry.npmjs.org/react-dom/19.2.8) | npm `19.2.8` | 两个发布包的 `gitHead` 对齐固定运行时提交。 |
| S19 | [WHATWG `link`](https://html.spec.whatwg.org/multipage/semantics.html#the-link-element) / [`style`](https://html.spec.whatwg.org/multipage/semantics.html#the-style-element) / [`stylesheet` link type](https://html.spec.whatwg.org/multipage/links.html#link-type-stylesheet) | HTML Living Standard，核验于 `2026-08-18` | HTML metadata 内容模型、style 文本、stylesheet link 与 parser-created render-blocking 边界。 |

## JSX 与资源资格

### 外链 stylesheet

推荐的资源化写法只有一条：

```tsx
function ReportStyles() {
  return (
    <link
      rel="stylesheet"
      href="/styles/report-v1.css"
      precedence="feature"
    />
  )
}
```

`ReportStyles` 可以位于依赖它的深层组件中。满足资格后，Fiber 所有权仍留在该组件树，实际 DOM link
进入组件所在 owner document 的 head（或对应 hoistable root），业务容器中不保留副本（S1、S7）。

| 条件 | 资源化结果 | 边界 |
| --- | --- | --- |
| `rel="stylesheet"` | 进入 stylesheet 分支 | 其他 rel 属于 A20 metadata 或 A23 resource hint，不是本课资源 |
| 非空字符串 `href` | 建立资源身份并发起加载 | 缺少、空字符串或非字符串时不建立 Resource |
| 字符串 `precedence` | 启用提升、排序和等待 | 缺少时作为普通 `<link>` 处理 |
| 没有 `itemProp` | 使用 document 级资源语义 | 有 `itemProp` 时留在条目上下文 |
| 没有 `onLoad/onError` | React 管理加载协调 | 回调表示调用方接管，React 不提升、不去重、不等待 |
| `disabled == null` | React 管理启用状态 | 即使 `disabled={false}` 也退出特殊处理 |

`disabled={false}` 仍退出 Resource 是容易遗漏的当前版本事实：固定实现判断的是 prop 是否为
`null/undefined`，不是布尔值是否为 `true`（S7、S13）。课程示例应完全省略 `disabled`。

### 内联 style Resource

```tsx
const reportCss = `
  .report-summary {
    color: #1f2937;
  }
`

function ReportInlineStyles() {
  return (
    <style href="report-summary-v1" precedence="feature">
      {reportCss}
    </style>
  )
}
```

这里的 `href` 是 React 用于去重的稳定资源键，不是浏览器要请求的 URL。固定客户端输出为：

```html
<style data-href="report-summary-v1" data-precedence="feature">
  .report-summary { color: #1f2937; }
</style>
```

只有同时提供非空字符串 href 和字符串 precedence 才会提升；普通 `<style>{css}</style>` 没有 React
Resource 身份，按普通宿主节点处理。`itemProp` 同样取消提升（S3、S6、S7）。

React Reference 要求 style children 是字符串；当前 TypeScript 类型从 `DOMAttributes` 继承
`children?: ReactNode`，无法阻止 element、数组或多个子节点。课程必须使用单一 CSS 字符串，不把类型
通过当作 style 内容有效性的证明（S3、S17、S19）。

## 放置与 precedence

### 首次发现建立组顺序

以下名称没有内建权重：

```tsx
<link rel="stylesheet" href="/first.css" precedence="high" />
<link rel="stylesheet" href="/second.css" precedence="base" />
```

因为 `high` 首先出现，它反而成为较低的第一组；`base` 是之后才发现的第二组。React 不进行字典排序，
也不知道 `base/default/theme/high` 的自然语言含义（S1、S3）。

适合教学的稳定顺序是先声明低层组，再声明高层组，并在整个应用保持同一词汇：

```tsx
<link rel="stylesheet" href="/base-v1.css" precedence="base" />
<style href="feature-card-v1" precedence="feature">{featureCss}</style>
<link rel="stylesheet" href="/overrides-v1.css" precedence="overrides" />
```

若随后发现另一个 `precedence="feature"`，它插到 feature 组末尾、overrides 组之前。link 和 style 不分
两套队列；二者都通过 `data-precedence` 参加同一插入算法（S9、S12、S14）。

### precedence 不替代 CSS 规则

React 只管理 DOM stylesheet 顺序。最终是否覆盖仍取决于浏览器样式系统中的 origin、layer、
specificity、importance、媒体条件和源顺序。课程只能说“在其他条件可比较时，后面的 stylesheet 有机会
覆盖前面”，不能把 `precedence="high"` 讲成 CSS 权重或 `!important`（S1、S3、S19）。

## Suspense 与提交协调

### 外链 stylesheet

首次遇到资源化 link 时，固定客户端实现会建立 href Resource、准备加载状态，并可能先插入内部使用的
`<link rel="preload" as="style">`。真正的 stylesheet link 在待提交资源集合中按 precedence 插入；若匹配
当前 `media` 且仍未 settle，提交等待 load 或 error 信号（S6、S10）。

因此公开可教授的顺序是：

1. render 发现外链 stylesheet Resource；
2. React 发起或复用该 href 的加载；
3. 依赖内容暂不揭示，Suspense 保持可用的 fallback 或旧内容；
4. stylesheet load/error 结束等待；
5. React 先保证 link 已按 precedence 放入样式序列，再提交/揭示依赖内容。

自动出现的 preload 是当前协调机制的可观察副产物，不属于本课要教授的 A23 resource-hint API。DOM
计数应分别统计 `link[rel="stylesheet"]` 与 `link[rel="preload"][as="style"]`，否则会把一个样式资源误报成
两个 stylesheet（S6、S15）。

`media` 不匹配时，固定实现跳过等待但仍可插入 link；这避免用当前不生效的 CSS 阻塞内容。它是
`19.2.8` 的旁证，不应扩写为跨浏览器 media 切换时序承诺（S10、S13）。

### 内联 style

inline CSS 文本无需网络获取，所以固定 Resource 没有 loading state。即便其中引用字体、背景图或
`@import`，React `<style>` Reference 也明确说它不会因此触发 Suspense boundary（S3、S4、S6）。

若 `<style>` 与另一个数据读取组件共同位于 Suspense 内，boundary 可能因数据而显示 fallback；style 会在
boundary 揭示时被放入正确位置，但不能反推“style 自己 suspend 了”。

### 客户端与服务端边界

React 19 发布说明给出的公共边界是：客户端在可等待的路径中先等待新外链 stylesheet 再提交；服务端
把已知 stylesheet 放入 head，late streaming boundary 会在客户端揭示前先插入依赖 stylesheet（S5）。

本文不教授 Fizz 指令、template 标记、60 秒内部 timeout、lane、preload map 或错误 digest。这些是固定
实现细节，不是 A21 学习者应依赖的 API。

## 去重、更新与所有权

### href 身份

下面两个组件共享同一个 Resource 和 DOM link：

```tsx
function ChartStyles() {
  return <link rel="stylesheet" href="/chart-v1.css" precedence="feature" />
}

function TableStyles() {
  return <link rel="stylesheet" href="/chart-v1.css" precedence="other" />
}
```

第二个声明不会创建另一份“other 版本”；href 已命中第一个资源，precedence 不参与身份。设计上必须让
同一 href 对应同一份不可变内容和同一套资源 props（S1、S6、S8）。

资源化 style 同理：两个 `<style href="card-v1" ...>` 不会按 children 比较 CSS。若 children 不同，后者
不是更新，而是身份冲突。正确做法是内容变化时使用新 href，例如 `card-v2` 或内容 hash（S3、S6）。

### 更新矩阵

| 操作 | `19.2.8` 结果 | 教学结论 |
| --- | --- | --- |
| 同 href 改 `precedence` | 仍命中同一 Resource，DOM 不作普通 prop update | precedence 首次声明后不可变 |
| 同 href 改 `media/integrity/crossOrigin` | 仍命中同一 Resource | 不得把资源 props 当响应式 State |
| 同 href 改 style children | 原 Resource 保持 | CSS 内容变化必须换资源身份 |
| link/style 改为新 href | 建立新 Resource，旧引用被 release | 版本化 href 是声明式替换边界 |
| 普通 link 与 resource link 在同一槽位互切 | 固定实现抛出 flavor-change error | 用不同 key/条件分支保持元素身份清楚 |
| 条件移除最后一个声明 | count 递减，DOM Resource 当前仍保留 | 组件卸载不等于样式撤销 |

公共 Reference 说 props 变化会被忽略并在开发环境警告。课程应依赖“不可更新”合同，而不依赖某条精确
warning 必然出现；固定实现对 resource/instance flavor change 则明确抛错（S1、S3、S6、S8）。

### 所有权边界

- Fiber 声明决定哪个 React tree 引用 Resource；href map 决定是否共用 DOM 实例。
- `acquireResource()` 增加引用计数，`releaseResource()` 只减少引用计数；当前版本没有 count-zero 删除。
- 普通 A20 hoistable 在卸载时调用 `unmountHoistable()`，stylesheet/style Resource 走另一条 release 路径。
- 已存在于目标 document、href 相同的 stylesheet/style 节点可能被当前实现复用；不能据此承诺 React 会
  接管任意第三方节点的完整生命周期。
- link/style href 共用身份空间，跨类型复用不是内容迁移工具；必须预先避免键冲突。
- 资源保留能避免组件切换时反复移除/重新加载，但也意味着不能用条件 JSX 实现“禁用主题 CSS”。

## HTML 与 TypeScript 边界

| 表面写法 | 标准/类型事实 | React 资源事实 |
| --- | --- | --- |
| `<link rel="stylesheet">` | HTML stylesheet link；href 是资源地址 | 加 `precedence` 且满足资格后才获得提升、去重、等待 |
| `<style>{css}</style>` | HTML metadata element；children 应是有效 stylesheet 文本 | 加稳定 href 与 precedence 后才获得 Resource 身份 |
| `precedence` | 不是 WHATWG `link/style` 标准属性 | `@types/react` 明确标为 React prop；输出为 data-precedence |
| `<style href>` | 不是浏览器下载地址 | React 专用去重键；输出为 data-href |
| `blocking="render"` | WHATWG render-blocking token | React Reference 不推荐，A21 使用 Suspense 协调而不教授它 |
| `children` | HTML 要求 style 文本 | TypeScript 仍允许 ReactNode，课程主动收窄为一个字符串 |

WHATWG 还区分 parser-created stylesheet 的原生潜在 render-blocking 与脚本动态插入。组件 render 产生的
link 不是靠“解析器天然阻塞”完成 React 协调；是 React DOM 在自己的提交路径上追踪资源加载（S10、
S19）。

## 高价值易错候选

### 1. 把 precedence 名称当成数值权重

错误：`precedence="high"` 无论何时都比 `precedence="base"` 高。

修正：首次发现的值建立组顺序；名称只是团队约定。

### 2. 只写 rel 与 href 就期待 React 提升和等待

错误：普通 `<link rel="stylesheet" href="..." />` 自动获得全部 React 19 行为。

修正：缺少 precedence 时没有 stylesheet Resource 特殊行为。

### 3. 用 disabled={false} 表示“当前启用”

错误：false 不会影响 Resource 资格。

修正：当前版本只要 supplied disabled 非 null 就退出特殊处理；资源化声明应省略该 prop。

### 4. 用 onLoad 观察 React 管理的加载

错误：既让 React 协调 Suspense，又用组件 onLoad 监听同一 link。

修正：onLoad/onError 表示调用方接管，反而取消提升、去重与等待。

### 5. 用相同 href 发布不同 inline CSS

错误：React 会比较 children，并把 style 文本更新成后一份。

修正：href 是唯一身份；内容变更时必须换 href。

### 6. 认为两个 precedence 不同的同 href link 会保留两份

错误：precedence 参与去重 key。

修正：只有 href 参与身份，第一份资源合同获胜。

### 7. 认为 inline style 会等字体或图片

错误：style 中引用异步资源就会让 boundary fallback 保持。

修正：inline style 不触发 Suspense；只在关联 View Transition 等其他机制中可能另有等待规则，后者不
属于本课。

### 8. 把条件卸载当成 CSS 回收

错误：组件隐藏后 head 中的 link/style 一定消失。

修正：当前 Resource 只 release 引用且保留 DOM；公共合同也只给出 may leave caveat。

### 9. 把 data-precedence 当成作者应直接维护的 API

错误：在 JSX 中写 `data-precedence` 就等价于 precedence。

修正：JSX 使用 React prop `precedence`；data 属性是当前 DOM 输出和 hydration 标记。

### 10. 把自动 preload 当成 A23 API 教程

错误：看到 DOM preload 就扩写 `preload/preinit` 的选择矩阵。

修正：A21 只把它作为外链加载协调的计数旁证；资源提示 API 留给 A23。

## 隔离 Demo 可观察合同

### 隔离原则

- React root 必须挂在同源隔离 document 的 body 容器中；所有查询都从
  `fixtureDocument.head/body` 开始。
- 课程站点的 `document.head`、全局样式和 `document.styleSheets` 不能作为 Demo 断言对象。
- 外链 CSS 使用本课程独立且版本化的同源 URL；inline style 使用与 URL 不冲突的稳定 href key。
- 样式规则只作用于隔离 document 内的 class，避免污染课程壳。
- 重新挂载 Demo 时必须卸载 React root，但不能声称该操作会清除 Resource；fixture document 整体销毁
  才是确定的隔离清理边界。

### 最小状态模型

| 状态 | 声明 | 必须可观察 |
| --- | --- | --- |
| 初始 shell | 尚未声明样式资源 | fixture head 只有 React 外的静态 meta，body 显示目录视图 |
| 外链等待 | 两次声明同一 foundation link，并同时请求四份 inline Resource | preload 为 1，fallback 可见，stylesheet 与 inline Resource 尚未提交 |
| 加载结算 | 依次结算 React 创建的 preload 和 stylesheet | 依赖内容出现；foundation、components、overrides 三组顺序正确 |
| 重复引用 | link 与 token style 各声明两次 | stylesheet DOM 与对应 token style DOM 都为 1 |
| 取消重复 | link 与 token style 各保留一次声明 | 两组计数从 `2 / 1` 变为 `1 / 1`，资源节点保持同一份 |
| 同 href 改 props | 改 token precedence 和 inline children，不改 href | 原 data-precedence 与文本保持，说明更新被忽略 |
| 新版本 | token 改为新 href | 新 Resource 出现；旧 Resource 当前仍保留 |
| 卸载引用 | 卸载专属 Root | body 清空，`19.2.8` Resource 节点与静态 meta 仍在 fixture head |
| 重建 fixture | 销毁旧 Document，并为新 Document 分配新的同源受控 URL | 新一轮 preload、等待和提交可独立复跑 |

### DOM 观察矩阵

| 观察项 | selector/值 | 不应混淆 |
| --- | --- | --- |
| stylesheet 数量 | `link[rel="stylesheet"][data-precedence]` | 自动 preload 不是 stylesheet |
| inline Resource 数量 | `style[data-href][data-precedence]` | 普通 style 不进入该计数 |
| precedence 顺序 | head 中上述两类节点的 `data-precedence` 序列 | 不按组件 DOM 容器位置推断 |
| 去重身份 | `href` 或 `data-href` | key、precedence、children 都不是资源 key |
| 资源输出 | link 的 href/data-precedence；style 的 data-href/data-precedence/textContent | JSX `precedence` 不会原样成为 precedence 属性 |
| fallback/内容 | fixture body 中 boundary fallback 与依赖内容 | 不用加载指示器推断 head 节点个数 |
| 保留行为 | 所有 owners 卸载后的 fixture head | fixture 销毁与 Resource release 是两件事 |

为了让外链等待验收可复跑，Demo 使用没有浏览上下文的独立同源 Document：React 先建立目标 preload，
控制按钮依次向 React 创建的 preload 和 stylesheet 派发 `load`。结算前断言 fallback 仍在且依赖内容未
揭示，结算后断言 stylesheet 已按 precedence 放置且内容出现。该 fixture 只验证 React 的资源事件与提交
协调，不把模拟事件冒充真实网络；不能用远程 CDN、浏览器缓存命中速度或固定延迟充当 Suspense 证据。

inline style 的验证不需要制造网络延迟：同一次状态更新加入资源化 style 和对应 class 内容，断言 style
进入 head、内容直接提交，并且没有由该 style 自身产生的 fallback。若 boundary 还读取数据，必须把
数据等待与 style 行为分开观察。

## 未决与不承诺边界

1. `<style>` Reference 的 Special rendering behavior 概述包含 “suspend” 字样，但 Usage 明确说 inline
   stylesheet 不触发 Suspense；`19.2.8` 源码也只有外链 stylesheet 有 loading state。本文采用后两项
   一致证据，保留上游措辞差异，不替 React 推导未来版本。
2. 公共 Reference 说资源 props 更新会在开发环境警告；固定提交清楚证明更新被忽略，但不能把某一条
   warning 文本或触发时机升级为生产合同。
3. `19.2.8` 官方测试注明资源保留只成立到未来可能加入垃圾回收为止；课程必须说“当前保留/公共合同
   允许保留”，不能说“React 永远不会删除”。
4. urgent、transition、同步更新、已预载资源和 media 不匹配的调度细节存在差异；A21 不教授 lane 或
   timeout，只验证一个受控的可等待 Suspense 路径。
5. link 加载 error 会结束当前等待，但这不等于 CSS 成功应用，也不等于 React render error 的通用合同；
   课程不设计失败恢复体系。
6. 同一 href 跨 `<link>` 与 `<style>` 冲突会落入共享资源空间；官方要求避免冲突。本文不定义“哪一个
   获胜”的应用语义。
7. 自动 preload 是当前实现细节；A21 不承诺其 DOM 位置、永久保留或跨版本形态，也不借此进入 A23。
8. SSR 只保留“head 放置、late boundary 揭示前先准备 stylesheet”的公共边界；不提供 Fizz、框架或
   streaming 时序实验。

## 课程实施结论

A21 应建立四个不可混淆的心智模型：

1. `href + precedence` 让普通 JSX 标签成为 React stylesheet Resource；
2. precedence 是按首次发现建立的跨 link/style 分组顺序；
3. 外链 link 协调加载与提交，inline style 只参与放置和去重；
4. Resource 是文档级、href 身份稳定、props 不可原位更新且不随最后 owner 卸载而保证回收的对象。

课程若能在隔离 document 中同时证明 head 放置、跨类型 precedence 顺序、href 去重、同 href 更新忽略、
新 href 建立新资源、外链响应前后揭示顺序以及 owner 卸载后资源保留，就覆盖了 A21 的完整本科范围。
任何 async script、resource hint API、CSS-in-JS 插入时机或框架 streaming 细节都应留在本课之外。
