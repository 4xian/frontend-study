# React 文档元数据提升研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.advanced.document-metadata-hoisting`
- 标题：React 文档元数据提升
- 教学层级：高级
- 前置课程：`react.core.learn.advanced.flush-sync-dom-commit`
- 核验日期：`2026-08-18`
- 文档基线：React 官方文档 `19.2`
- 运行时基线：React / React DOM `19.2.8`
- 类型基线：`@types/react` `19.2.18`、`@types/react-dom` `19.2.4`
- 固定文档提交：`reactjs/react.dev@c7d6b700038c63d1aaf2c649af1aefe01ebbacac`
- 固定运行时提交：`facebook/react@1dd4ecbdabf826f527fc9a58c05ea70375b7d170`
- live 路线状态：新路线 `69/74`，A20 已完成，下一课为 A21“声明式样式资源”，Track 为 `available`
- 生产状态：研究、正文、Demo、entry/demo manifest、Track 发布、浏览器验收和独立复审均已完成

本课只回答一条主线：在 React 19.2 客户端组件树中声明普通文档元数据
`<title>`、`<meta>` 和非 stylesheet 的元数据 `<link>`，观察 React 将合格节点放入对应
`ownerDocument.head`，并在同一 React 所有权下更新和卸载它们；同时明确“嵌套声明会累积”与
“普通元数据不会按语义自动去重”。

必须覆盖：

1. `<title>`、普通 `<meta name="..." content="..." />` 与元数据
   `<link rel="..." href="..." />` 的 JSX 写法、属性大小写和当前 TypeScript intrinsic 类型。
2. 合格节点可以写在页面或嵌套组件中，React 会把对应 DOM 节点放入同一文档的 `<head>`；组件原
   DOM 位置不会保留该元数据节点。
3. `itemProp` 会取消 `title`、`meta`、`link` 的文档级提升；SVG namespace 中的 `<title>` 也不是
   文档标题。
4. 本课的元数据 `<link>` 必须有字符串 `rel`、非空字符串 `href`，且不带 `onLoad` / `onError`；
   `rel="stylesheet"`、资源提示与脚本完全留给后续课程。
5. 父布局、页面组件和更深子组件可以各自声明元数据，但 React 不提供“深层覆盖浅层”的原生路由
   优先级；同时存在的声明会同时进入 `<head>`。
6. 同一 Fiber 位置上的普通 hoistable props 会更新现有节点；条件分支离开或 owning root 卸载时，
   React 会移除该所有权下的普通 hoistable 节点。
7. 普通 `title`、`meta` 与非 stylesheet `link` 在 React DOM `19.2.8` 中不是 Resource，不按标题
   文本、`meta[name]`、`meta[content]`、`link[rel]` 或 `link[href]` 自动去重。
8. 同时只能声明一个文档 `<title>`。React 会保留多个 `<title>` DOM 节点，而 WHATWG 要求每个
   document 最多一个；不得用 DOM 顺序推导“最后声明覆盖”。
9. `<title>` 的学习者写法统一为一个已插值的字符串子节点。TypeScript 的 `children: ReactNode`
   不能阻止多节点 JSX，不能把类型通过当作语义有效。
10. 客户端与 SSR 共用同一组声明式标签和 HTML 有效性约束；本课只实证客户端生命周期，不讲服务端
    streaming 的发现、传输、时序或框架集成。
11. Demo 必须使用隔离 document fixture，不能修改课程站点自身的 `document.title`、meta 或 link。
12. 验收只证明 React DOM 放置、节点数量、属性更新和卸载，不承诺搜索引擎抓取、索引或排名效果。

明确排除：A21 stylesheet / `<style>` / `precedence` / Suspense 资源协调、A22 `<script>`、A23
`prefetchDNS` / `preconnect` / `preload` / `preinit` 及 module 变体、A24 `useInsertionEffect`、SEO
效果承诺、爬虫兼容矩阵、框架 Metadata API、React Helmet 教程、HTTP header、Early Hints、Server
Components、Server Functions、服务端 streaming、服务端 head 输出时序、多 Root 协调、Portal/iframe
跨 document 产品支持，以及任何网络性能收益。

## 调研方法与仓库准入

1. 按仓库搜索顺位先调用 Tavily 官方 Search API，查询 React 19 document metadata hoisting、
   `title/meta/link`、更新、卸载和去重。结果命中 React 19 官方发布说明，也返回 YouTube、博客和问答
   等二手材料；二手摘要只用于发现候选，不承担任何结论。
2. Tavily 已正常返回可靠官方候选，因此没有切换 Exa、Parallel、Perplexity 或原生 Web 搜索。
3. 事实逐项回到 React `19.2` live Reference、固定 `reactjs/react.dev` Markdown、固定
   React DOM `19.2.8` 发布提交源码与官方测试、精确版本的公开类型、npm 发布元数据和 WHATWG HTML
   Living Standard 核验。
4. npm registry 中 `react@19.2.8` 与 `react-dom@19.2.8` 的 `gitHead` 都是
   `1dd4ecbdabf826f527fc9a58c05ea70375b7d170`，与固定源码提交一致。
5. 现行总计划把 A20 限定为 `title`、普通 `meta`、`link`、嵌套声明、更新和去重；A21-A24 与 AL5
   均未开始。旧 RC3 冻结稿同样要求隔离 fixture，并明确排除 SEO 承诺、框架 Metadata API、HTTP
   header、stylesheet/preload 与服务端 head streaming。
6. live `react-core-track.ts` 已把本课登记为 `available`；`entry-manifest.ts`、demo manifest、课程正文和
   Demo 目录均已完成并通过浏览器验收。本研究记录与已发布课程资产保持一致。
7. `package.json`、`package-lock.json` 与安装版本三层已经核对；本文采用 live 版本，不修改旧计划中
   可能过时的工具版本文字。
8. 本轮已完成正文、Demo、manifest、Track、计划记录、进度状态、独立复审和 signoff；A21 及其后续课程资产
   尚未开始。

## 关键精度结论

1. **提升是 DOM 放置规则，不是路由元数据合并器。** 组件层级只决定 React 所有权；它不提供父子
   覆盖、优先级或“最深页面胜出”。
2. **普通元数据没有语义去重。** React DOM `19.2.8` 的 `getResource()` 对 `meta`、`title` 和非
   stylesheet `link` 返回 `null`；它们是 Hoistable Instance，而不是按 URL 或属性注册的 Resource。
3. **多个标题不会自动合并。** React Reference 明确会把所有标题都放进 head；WHATWG 同时要求一个
   document 最多一个 `title`。课程必须把“单一 owner”作为设计约束。
4. **更新与替换必须区分。** 同一 Fiber 的 props 更新会原位更新节点；两个组件各自声明相同 meta 是
   两个节点，不是对同一语义记录的替换。
5. **普通 hoistable 可回收。** 条件卸载会移除对应节点，root 卸载会移除它拥有的普通
   `title/meta/link`；不要把 A21 stylesheet 可能保留的 caveat 套到 A20。
6. **`itemProp` 是文档级提升的 opt-out。** 它表示条目级 microdata，节点按普通宿主元素留在原上下文；
   SVG `<title>` 也保持 SVG 语义。
7. **元数据 link 的提升有资格条件。** 缺少 `rel`、缺少/空 `href`、带 `onLoad` 或 `onError` 时，不走
   本课的 head hoisting 路径。
8. **TypeScript 只检查属性形状。** `title` 的 intrinsic 类型仍允许广义 `ReactNode`；meta/link 的
   类型也不会验证 exactly-one 属性、URL 意义、单标题或语义重复。
9. **固定文档对 title 子组件存在表述张力。** Props 段说可传“只渲染文本”的组件，但同页 Usage 要求
   单一字符串/数字/可字符串化对象，`19.2.8` 官方测试还会对 React element child 发出开发警告。
   本课采用更窄且确定的单一插值字符串写法。
10. **Hydration 匹配不是客户端去重 API。** 固定实现会按特定属性寻找未被 React 拥有的服务端节点；
    这只用于接管既有 markup，不能推导 `createRoot` 会收养或覆盖任意静态 head 节点。

## 固定来源表

| 编号 | 一手来源 | 版本固定 | 本课采用的事实 |
| --- | --- | --- | --- |
| S1 | [React `<title>`](https://react.dev/reference/react-dom/components/title) | React DOM 文档 `19.2` | 任意组件声明、head 放置、SVG/itemProp 例外、多标题 caveat、单一文本 children。 |
| S2 | [固定 `<title>` Reference](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/components/title.md#L21-L89) | `react.dev@c7d6b700...` | 固定提升资格、多标题和模板字符串写法；也保留 Props/Usage 表述张力供核对。 |
| S3 | [React `<meta>`](https://react.dev/reference/react-dom/components/meta) | React DOM 文档 `19.2` | 文档级 meta 的 props、head 放置与 `itemProp` opt-out。 |
| S4 | [固定 `<meta>` Reference](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/components/meta.md#L21-L93) | `react.dev@c7d6b700...` | exactly-one 属性、普通 `name/content` 示例与 item metadata 原位放置。 |
| S5 | [React `<link>`](https://react.dev/reference/react-dom/components/link) | React DOM 文档 `19.2` | 元数据 link props、head 放置、`itemProp`/事件回调例外；stylesheet 是另一套特殊行为。 |
| S6 | [固定 `<link>` Reference](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/components/link.md#L21-L106) | `react.dev@c7d6b700...` | `rel`/`href`、提升例外和普通 metadata link 范围；stylesheet 段只用于划定 A21 边界。 |
| S7 | [React 19 文档元数据发布说明](https://react.dev/blog/2024/12/05/react-19#support-for-metadata-tags) | React `19` stable | 原生 `title/link/meta`、client-only 与 server rendering 适用性，以及简单标签不提供路由覆盖能力。 |
| S8 | [固定 React 19 发布说明](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/blog/2024/12/05/react-19.md#L565-L598) | `react.dev@c7d6b700...` | 固定 React 19 stable 身份、嵌套组件示例和 metadata library 的覆盖能力边界。 |
| S9 | [`getResource()` 固定源码](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js#L5032-L5099) | React DOM `19.2.8` | 普通 meta/title 与非 stylesheet link 返回 `null`，没有 stylesheet Resource 去重身份。 |
| S10 | [提升资格与 head 挂载源码](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js#L5720-L5855) | React DOM `19.2.8` | owner document head、itemProp/SVG opt-out、meta/title 恒合格、link 的 rel/href/事件资格。 |
| S11 | [Hydration 匹配源码](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js#L5550-L5642) | React DOM `19.2.8` | title、meta、link 接管既有服务端节点时的当前 patch 匹配字段；不是客户端语义去重。 |
| S12 | [更新与挂载提交源码](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberCommitWork.js#L2047-L2119) | React `19.2.8` | Hoistable Instance 首次挂载、普通 props commit update 与 Resource 分支的区别。 |
| S13 | [卸载提交源码](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberCommitWork.js#L1427-L1458) | React `19.2.8` | 普通 Hoistable Instance 删除时调用 `unmountHoistable`。 |
| S14 | [普通 hoistable 客户端官方测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMFloat-test.js#L8862-L9083) | React DOM `19.2.8` | meta、非 stylesheet link、title 在客户端进入 head，条件移除后 head 清空；同范围旁证 SSR/hydration 公共标签。 |
| S15 | [title 更新官方测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMFloat-test.js#L9408-L9426) | React DOM `19.2.8` | title 文本和普通属性随同一 Fiber 更新。 |
| S16 | [`@types/react@19.2.18` 固定类型](https://unpkg.com/@types/react@19.2.18/index.d.ts) | npm `19.2.18` | `title/meta/link` intrinsic 映射、`MetaHTMLAttributes`、`LinkHTMLAttributes` 和广义 common props。 |
| S17 | [React `19.2.8` npm 元数据](https://registry.npmjs.org/react/19.2.8) / [React DOM `19.2.8` npm 元数据](https://registry.npmjs.org/react-dom/19.2.8) | npm `19.2.8` | 两个包的 `gitHead` 都对齐固定运行时提交。 |
| S18 | [React DOM `19.2.8` package metadata](https://registry.npmjs.org/react-dom/19.2.8) | npm `19.2.8` | `gitHead` 固定到 `1dd4ecbd...`；不得声称 metadata hoisting 由该 patch 新增。 |
| S19 | [WHATWG `title`](https://html.spec.whatwg.org/multipage/semantics.html#the-title-element) / [`Document.title`](https://html.spec.whatwg.org/multipage/dom.html#document.title) | Living Standard，核验于 `2026-08-18` | 每个 document 最多一个 title、只含文本；`Document.title` 基于 tree order 中第一个 title。 |
| S20 | [WHATWG `link`](https://html.spec.whatwg.org/multipage/semantics.html#the-link-element) / [`meta`](https://html.spec.whatwg.org/multipage/semantics.html#the-meta-element) | Living Standard，核验于 `2026-08-18` | link 的 rel/href 关系、meta 的 exactly-one 属性与 content 约束、文档级 metadata 内容模型。 |

## 版本与 TypeScript 基线

### live 依赖三层证据

| 包 | `package.json` | `package-lock.json` | 安装版本 |
| --- | --- | --- | --- |
| `react` | `19.2.8` | `19.2.8` | `19.2.8` |
| `react-dom` | `19.2.8` | `19.2.8` | `19.2.8` |
| `@types/react` | `19.2.18` | `19.2.18` | `19.2.18` |
| `@types/react-dom` | `19.2.4` | `19.2.4` | `19.2.4` |
| `vite` | `^8.1.5` | `8.1.5` | `8.1.5` |
| `@vitejs/plugin-react` | `6.0.5` | `6.0.5` | `6.0.5` |
| `typescript` | `~6.0.0` | `6.0.3` | `6.0.3` |

`package-lock.json` 的关键位置是：`@types/react` 第 1681 行、`@types/react-dom` 第 1691 行、
`react` 第 5133 行、`react-dom` 第 5142 行、TypeScript 第 5753 行。本文不修改 lockfile。

### JSX 属性冻结

| 标签 | 本课主线 props | 当前类型入口 | 必须强调 |
| --- | --- | --- | --- |
| `<title>` | 单一文本 `children` | `HTMLAttributes<HTMLTitleElement>` | 类型把 children 保持为 `ReactNode`，不会强制“一个字符串”。使用成对标签。 |
| `<meta>` | `name: string`、`content: string` | `MetaHTMLAttributes<HTMLMetaElement>` | JSX 使用 `charSet`、`httpEquiv`；本课 Demo 只用普通 `name/content`，并自闭合。 |
| `<link>` | `rel: string`、`href: string` | `LinkHTMLAttributes<HTMLLinkElement>` | `rel` 从 common HTML attributes 继承；本课只用非 stylesheet 元数据关系，并自闭合。 |

补充边界：

- `itemProp`、`property`、`rel` 等位于当前 `HTMLAttributes` 公共层；TypeScript 允许它们不等于 React
  Reference 承诺所有组合都具有文档元数据语义。
- 当前类型允许 `<meta property="..." content="..." />`，固定 hydration 实现也比较 `property`；但
  react.dev `<meta>` 公共 Reference 的 exactly-one 列表是 `name/httpEquiv/charset/itemProp`。A20
  Demo 采用无争议的 `name/content`，不把 RDFa/Open Graph 扩成另一条主线。
- `precedence?: string` 出现在 `LinkHTMLAttributes`，但它属于 A21 stylesheet 合同；类型可见不等于
  A20 获得教学授权。
- HTML 的 `charset` 属性在 React JSX/TypeScript 中写成 `charSet`，DOM 输出才是 `charset`。本课只在
  API 表提及，不用它设计更新 Demo，因为编码声明不是普通页面 metadata 状态。
- `key` 是 React reconciliation 身份提示，不会把不同组件中语义相同的 meta/link 变成一个节点。

## Hoisting 资格与 head 放置

### 资格矩阵

| 标签 | 进入本课 hoisting 的条件 | 不提升或不进入本课的情况 |
| --- | --- | --- |
| `<title>` | HTML namespace；没有 `itemProp` | SVG namespace 的无障碍标题；带 `itemProp` 的条目元数据 |
| 普通 `<meta>` | HTML namespace；没有 `itemProp` | 带 `itemProp` 时按普通宿主节点放置 |
| 元数据 `<link>` | HTML namespace；字符串 `rel`；非空字符串 `href`；无 `onLoad/onError`；没有 `itemProp` | 缺少/空 rel 或 href、事件回调、itemProp；stylesheet/script/resource hint 另课处理 |

源码中的 `outsideHostContainerContext` 主要决定开发警告文本；正常 SPA 在某个元素上 `createRoot()`，
只要标签满足上表，React 仍会从深层组件把 DOM 节点放入该 root 容器所属 document 的 `<head>`。

### 物理放置与组件树

```tsx
interface PageMetadataProps {
  title: string
  description: string
  canonicalUrl: string
}

function PageMetadata({ title, description, canonicalUrl }: PageMetadataProps) {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
    </>
  )
}
```

`PageMetadata` 可以由页面组件深层渲染。React Fiber 所有权仍处于原组件树，但三个 DOM 节点进入
`ownerDocument.head`；Fragment 不产生包裹 DOM。组件卸载时，React 仍能沿 Fiber 所有权找到并移除
这些远离原容器的节点。

不要把“提升”理解为复制：正常客户端挂载后，元数据节点不再同时出现在业务容器中。`itemProp` 或
SVG opt-out 才会保留普通宿主放置行为。

### 嵌套与路由式组件

正确的原生标签模式不是“父布局给默认值，子路由再覆盖”，而是由一个 current-route owner 计算并
声明最终集合：

```tsx
interface RouteMetadata {
  title: string
  description: string
  canonicalUrl: string
}

function CurrentRoute({ metadata }: { metadata: RouteMetadata }) {
  return (
    <>
      <PageMetadata {...metadata} />
      <main>{/* 当前路由内容 */}</main>
    </>
  )
}
```

父布局和子页面如果都渲染 `PageMetadata`，head 会同时出现两套标签。React 19 发布说明明确把
“按当前路由用具体 metadata 覆盖通用 metadata”列为 library/framework 可以提供的更强能力，而不是
原生标签的内建规则。本课不得悄悄实现框架 Metadata API；只冻结单 owner 设计。

## 身份、重复与去重边界

### 客户端普通节点身份

普通 `title/meta/非 stylesheet link` 的实际身份来自 React reconciliation：元素类型、树位置和
`key` 决定 Fiber 是否延续。语义属性不构成全局 registry key。

| 场景 | `19.2.8` 结果 | 教学结论 |
| --- | --- | --- |
| 同一位置 `<meta content={next} />` | 现有 meta 节点更新 content | 这是同一 Fiber 更新，不是按 `name` 查找后替换。 |
| 两个组件各渲染相同 description meta | head 中有两个 meta | 普通 meta 不按 name/content 去重。 |
| 两个组件各渲染相同 canonical link | head 中有两个 link | 普通 metadata link 不按 rel/href 去重。 |
| 两个组件各渲染 title | head 中有两个 title | React 不选“最深”或“最后”标题。 |
| 条件分支移除 owning component | 该 Fiber 的普通 hoistable 被移除 | 另一个组件或静态脚本拥有的节点不应被顺带删除。 |

固定 `getResource()` 是这里最重要的源码分界：meta/title 直接返回 `null`；link 只有同时满足
`rel="stylesheet"`、字符串 `href` 和字符串 `precedence` 才进入 Resource map。A20 的普通 metadata
link 也返回 `null`。因此不能从 A21 的“同 href stylesheet 去重”反推普通 link。

### title 的重复边界

React Reference 要求同时只渲染一个 title，并明确多个 title 都会进入 head。WHATWG 又规定一个
document 最多一个 title，`Document.title` getter 取 tree order 中第一个 title 的文本。两条证据共同
说明：

- 不得用 `document.title` 的一个字符串掩盖 DOM 中已经存在多个 `<title>` 的错误；
- 不得把某次浏览器观察到的 first/last 行为写成 React 的覆盖协议；
- Demo 的正常路径必须断言 `head.querySelectorAll('title[data-a20-owned]').length === 1`；
- 重复模式只作为明确标红的边界观察，PASS 条件是“看见 2 个节点且不宣称谁胜出”。

### meta 与 link 的重复边界

HTML/React 类型允许多个不同用途的 meta/link，但“允许多个标签”不等于允许同一语义重复。React
不会自动把两条 `<meta name="description">` 或两条同 canonical link 合成一个。课程采用以下所有权
规则：

1. 一个 current-route metadata owner 负责唯一 title、唯一 description 和唯一 canonical。
2. 父布局若提供全站常量 metadata，必须与页面 owner 使用不同语义，不能依赖深层覆盖。
3. route 更新应更新同一 owner 的 props；route 离开应卸载旧 owner，再挂载新 owner。
4. 不查询并手改任意静态 head 节点，也不删除未知第三方节点。

### Hydration 匹配不等于去重

React DOM `19.2.8` 固定实现的 hydration 候选匹配字段为：

- title：寻找第一个尚未被 React 拥有、非 SVG、无 `itemprop` 的 title；
- link：`href`、`rel`、`title`、`crossorigin`；
- meta：`content`、`name`、`property`、`http-equiv`、`charset`。

这是 patch-sensitive 的既有服务端 DOM 接管机制，不是公开的 author-facing identity API。课程正文只用
它澄清两点：SSR markup 必须与客户端声明一致；普通 `createRoot` 客户端渲染不能借 hydration 匹配规则
声称会收养静态 meta/link。A18 已教授 hydration，本课不重复展开 mismatch 或错误回调。

## 更新、卸载与所有权

### 更新

React reconciler 对仍是 Hoistable Instance 的同一 Fiber 调用普通 host props update。固定官方测试直接
覆盖 title 文本和 `data-*` 属性更新；同一提交路径也服务普通 meta/link。

本轮使用当前安装的 React DOM `19.2.8` 与 JSDOM 做了无持久文件的补充探针：

```text
mount-counts 2 2 2
same-nodes true true true
updated-values Title b Description b https://example.test/b
removed-count 0
```

该探针只说明当前快照：两套相同语义 title/meta/link 都保留；关闭重复分支并更新 route 值后，主集合的
三个 DOM node identity 都保持不变且属性更新；渲染 `null` 后 React-owned 节点归零。它不替代 S9-S15
的一手源码/测试，也不升级成未来版本承诺。

### 卸载

普通 hoistable 的删除路径最终调用 `unmountHoistable(instance)`，从其 parent 移除节点。官方客户端测试
分别验证 meta、普通 link 和 title 在条件移除后从 head 消失。Demo 必须覆盖：

1. 当前 route metadata 挂载后，fixture head 各有一个 owned title/meta/link；
2. route props 更新后，值变化但 owned 数量仍各为一；
3. duplicate child 打开后数量各为二，关闭后只移除 child 自己的三个节点；
4. route 设为 `none` 后 owned 数量为零；
5. fixture head 中预先放置的 `data-a20-static` 标记仍保留；
6. Demo 自身卸载时调用 fixture root 的 `unmount()`，不遗留 React-owned 节点。

不要把 stylesheet Reference 的“可能在组件卸载后仍留在 DOM”写到普通 metadata link 上；那是 A21
Resource 语义，恰好与本课普通 Hoistable Instance 的删除路径不同。

## 错误与 caveats

### title children

冻结的安全写法：

```tsx
<title>{`课程：${lessonTitle}`}</title>
```

拒绝写法：

```tsx
<title>课程：{lessonTitle}</title>
```

后一种 JSX 会形成多个 children。固定 Reference 把它标为问题并要求模板字符串；官方 `19.2.8`
测试对长度大于 1 的数组和 React element child 发出开发警告。由于 TypeScript 仍接受 `ReactNode`，
必须靠作者规则与验证捕获，不得承诺编译器会报错。

### meta 形状

- 普通文档 meta 使用且只使用 `name` 与 `content`；这满足本课目标。
- WHATWG/React Reference 要求 `name/httpEquiv/charSet/itemProp` 角色中恰好一个；有 name/httpEquiv/
  itemProp 时要有 content。
- `itemProp` 改变语义并取消文档级提升，不能同时把它当 description meta 的“另一个 key”。
- `charSet` 是编码声明，最多一个且只接受 UTF-8；不放进 route 更新 Demo。
- TypeScript 不验证 exactly-one 组合，多个角色 props 同时出现仍可能通过类型检查。

### 元数据 link 形状

- 本课示例使用 `rel="canonical"` 与绝对的 `https://example.test/...` fixture URL；它不触发真实资源下载。
- `rel` 或 `href` 缺失、href 为空、带 `onLoad/onError` 都不能作为“深层声明后自动提升”的正例。
- `itemProp` 与 rel 表达的是不同语义，WHATWG 要求 link 使用两者之一而不是同时使用。
- link type 是否被浏览器/爬虫采用不属于 React DOM 放置合同；不做 SEO 结果承诺。

### 所有权与外部节点

- React 只应回收自己拥有的普通 hoistable；静态 HTML、Vue 外壳或第三方脚本创建的节点不归本 Demo
  管理。
- 如果生产应用需要父子路由合并、优先级、跨 root 协调或第三方节点接管，应选择明确的上层 owner 或
  metadata library/framework；A20 不实现这些系统。
- 不把 head DOM 顺序当作 meta/link 优先级。除 title 的 HTML 单一约束外，本课只断言节点集合、属性和
  所有权生命周期。

## 客户端与 SSR 公共边界

| 边界 | 本课可以承诺 | 本课不能承诺 |
| --- | --- | --- |
| 公共 JSX | title/meta/link 是 React 19 稳定原生标签；HTML 有效性与单标题约束两端相同 | 框架 Metadata API、路由覆盖、SEO 结果 |
| 客户端 | 合格节点进入 ownerDocument.head；同 Fiber 更新；普通 owned 节点卸载移除 | 自动收养静态节点、跨 root 去重、未知第三方节点清理 |
| SSR/hydration | 官方发布说明确认 server rendering 可使用原生 metadata；客户端声明应匹配服务端 markup | streaming 发现/刷新时序、header、RSC、框架序列化策略、crawler 执行策略 |

S14 的官方测试同一范围同时覆盖服务端输出、hydrateRoot 接管与客户端 createRoot，但课程只引用它证明
“标签 API 跨环境成立”和“客户端节点可接管/移除”。测试内部的 streaming harness 不进入正文、Demo
或验收步骤。服务端生产方案应由所用 SSR 框架的官方文档另行负责。

## 高价值易错候选（10 个）

### 1. 把嵌套组件理解成子路由自动覆盖父布局

- **错误模型：** 父组件的 title/description 是默认值，子组件声明同类标签后 React 会只保留子级。
- **证据结论：** 原生标签只提升放置，不实现层级优先级；React 19 发布说明把 route override 归为
  library 可以提供的更强能力。
- **教学决策：** 采用单一 current-route owner；重复模式明确显示两套节点。

### 2. 认为相同 `meta[name="description"]` 会去重

- **错误模型：** name 是 React 的全局 key。
- **证据结论：** 普通 meta 的 `getResource()` 返回 `null`，两个 Fiber 对应两个 DOM 节点。
- **教学决策：** Demo 重复开关断言 description 数量从 1 变 2，而不是“最后一个覆盖”。

### 3. 认为相同 canonical href 会让普通 link 去重

- **错误模型：** 所有 link 都像 stylesheet 一样按 href 去重。
- **证据结论：** 只有 A21 stylesheet + precedence 进入 Resource map；普通 metadata link 不进入。
- **教学决策：** A20 显示两个相同 canonical link，且不讲 stylesheet 的加载/保留行为。

### 4. 用多个 `<title>` 表达默认值与具体值

- **错误模型：** 浏览器或 React 会稳定选最后一个。
- **证据结论：** React 保留全部 title；WHATWG 要求每文档最多一个，`Document.title` 的 first-title
  算法也不是 React 路由覆盖协议。
- **教学决策：** 正常模式严格断言一个 title；重复模式只观察无效状态，不比较胜出文本。

### 5. 把 JSX 文本拼接写成多个 title children

- **错误模型：** `<title>课程：{name}</title>` 与模板字符串完全等价。
- **证据结论：** 前者形成 children array；Reference 和官方测试都把它视为不支持/警告路径。
- **教学决策：** 所有 title 统一用单个模板字符串，验证 console 为零警告。

### 6. 认为 TypeScript 通过就满足 HTML/React 语义

- **错误模型：** intrinsic 类型会检查单标题、title 单 child、meta exactly-one 和重复关系。
- **证据结论：** title children 仍是 ReactNode，meta/link 属性大多是可选字符串，语义组合未编码。
- **教学决策：** 类型表明确“形状检查”边界，验收直接查询 fixture DOM。

### 7. 把 `itemProp` 当作文档 metadata 的补充标识

- **错误模型：** 加 itemProp 后仍会提升，只是多一个属性。
- **证据结论：** React 明确将 itemProp 视为 opt-out；它描述具体 item，而非 document。
- **教学决策：** API 表记录，不在正常 Demo 集合添加 itemProp，避免把条目 metadata 混入 head。

### 8. 缺少 `rel/href` 或带加载回调仍期待 link 提升

- **错误模型：** 只要标签名是 link 就会进入 head。
- **证据结论：** 固定实现要求字符串 rel、非空字符串 href 且无 onLoad/onError。
- **教学决策：** 正例固定为无网络副作用的 canonical URL；资格失败只做 caveat，不做不稳定事件 Demo。

### 9. 把 hydration 匹配字段当成客户端语义身份

- **错误模型：** createRoot 会按 content/name 或 href/rel 找到静态节点并更新它。
- **证据结论：** 属性匹配属于 hydrateHoistable；普通客户端 identity 仍来自 Fiber。
- **教学决策：** detached fixture 使用 createRoot，不预置同语义 metadata，只预置独立 static marker。

### 10. 把 A21 stylesheet 卸载 caveat 套到普通 metadata link

- **错误模型：** 所有 hoisted link 都可能永久留在 head。
- **证据结论：** 普通 metadata link 是 Instance，删除路径直接移除；stylesheet 是 Resource 另课处理。
- **教学决策：** A20 必须验收 canonical link 卸载归零，不展开 precedence/Suspense/加载状态。

## 确定性隔离 Demo 设计

### 设计目标

一个 Demo 同时证明五件事：深层声明进入隔离 document head、route props 原位更新、普通 metadata 不
语义去重、条件卸载可回收、真实课程 document 完全不受影响。

### 隔离策略

1. 用 `document.implementation.createHTMLDocument()` 创建不带初始 title 的 detached HTMLDocument。
2. 在 fixture body 放置唯一 React root 容器，在 fixture head 放置
   `<meta data-a20-static="true" name="fixture-owner" content="outside-react" />`。
3. 所有教学 title/meta/link 都带 `data-a20-owned="primary|nested"`，查询时不把 static marker 混入计数。
4. 由 fixture 专属 `createRoot(container)` 渲染路由式组件；正式课程站点的 ReactDemoHost/Vue document
   只显示控制器和序列化观察结果。
5. fixture controller 内部可以复用前置 A19 已学的同步 commit 工具保证取样发生在提交后，但正文不
   再教学该 API，也不让它成为产品建议。
6. Demo 卸载时显式 `fixtureRoot.unmount()`；detached document 不注册全局监听、不发网络请求。

### 状态模型

```ts
type FixtureRoute = 'catalog' | 'lesson' | 'none'

interface FixtureControls {
  route: FixtureRoute
  includeNestedDuplicate: boolean
}
```

- `catalog`：Title A、Description A、`https://example.test/catalog`
- `lesson`：Title B、Description B、`https://example.test/lesson`
- `none`：不渲染任何 React-owned metadata
- `includeNestedDuplicate`：在更深组件再声明一套与当前 route 完全相同的 title/meta/link

### 交互与呈现

- route 使用三段 segmented control；重复边界使用 checkbox/toggle；重建 fixture 使用刷新图标按钮并
  配 tooltip。
- 输出区展示 owned title/meta/link 数量、各节点关键属性、primary 节点是否与上次同一 DOM identity、
  static marker 是否仍存在，以及过滤后的 `fixture.head` markup。
- 页面布局使用 Flexbox、普通流和 margin；禁止 CSS Grid 与 `gap`。输出容器必须在 390px 下换行，
  不显示真实站点 head 的敏感/无关内容。
- UI 不写使用教程或特性宣传；标签与状态值本身应足以解释观察结果。

### 确定性观察矩阵

| 步骤 | 操作 | title/meta/link owned 数量 | 节点 identity | static marker |
| ---: | --- | --- | --- | --- |
| 1 | 初始 `catalog + duplicate off` | `1 / 1 / 1` | 建立 primary 基线 | 保留 |
| 2 | 切到 `lesson` | `1 / 1 / 1` | primary 三节点均与步骤 1 相同，值更新 | 保留 |
| 3 | 打开 duplicate | `2 / 2 / 2` | primary 保持，新增 nested 三节点 | 保留 |
| 4 | 关闭 duplicate | `1 / 1 / 1` | 只移除 nested | 保留 |
| 5 | 切到 `none` | `0 / 0 / 0` | primary 移除 | 保留 |
| 6 | 卸载 fixture root | `0 / 0 / 0` | 无 React-owned 节点 | 保留 |

PASS 不依赖节点在 head 中的相对顺序，也不比较重复模式下的 `document.title`；这两个观察都不是本课
承诺。canonical 使用 `example.test`，不会加载 stylesheet、icon、script 或 hint 资源，network 应为零。

## 未来实现验证清单

### 静态与类型

- [ ] 正文只出现 A20 允许的 title、普通 name/content meta、非 stylesheet metadata link。
- [ ] 所有 title 使用单一插值字符串；没有多个 JSX text/value children 或 React element child。
- [ ] meta/link 自闭合，JSX 使用 `charSet`、`httpEquiv`、`crossOrigin` 等 React 属性名。
- [ ] A21-A24 API、框架 Metadata API、HTTP header 和 SEO 结果没有进入正文/Demo。
- [ ] TypeScript、lint、format、build 全部通过；不新增持久测试文件。

### fixture DOM

- [ ] 真实课程 `document.title` 与相关 meta/link 在 Demo 前后逐项相等。
- [ ] 初始 primary 三节点只出现在 fixture head，不出现在 fixture root 容器中。
- [ ] catalog -> lesson 后 owned 数量保持 `1/1/1`，三个 primary DOM identity 保持且属性全部更新。
- [ ] duplicate on 后精确为 `2/2/2`，证明普通 metadata 不按语义去重。
- [ ] duplicate off 后只剩 primary；route none 后 owned 数量归零。
- [ ] `data-a20-static` 节点在所有更新、移除与 root unmount 后仍存在。
- [ ] 正常交互 console 为 `0 error / 0 warning`，pageerror 为 `0`。
- [ ] 没有 stylesheet、style、script、preload/preconnect 等请求；fixture network 为零。

### 页面与可访问性

- [ ] 桌面与 390px 下 segmented control、toggle、计数和 markup 无横向页面溢出或文字裁切。
- [ ] 200% 文本缩放后控件仍可操作，长 URL/markup 在自己的输出容器内换行或滚动。
- [ ] icon-only 重建按钮有可访问名称和 tooltip；状态变化有可读文本，不只靠颜色。
- [ ] CSS 不使用 Grid 或 `gap`，不修改课程站点全局样式。

### 证据与边界

- [ ] 浏览器断言查询 fixture document，不把真实 document 或视觉截图当作 head DOM 证据。
- [ ] 重复 title 模式只验证两个节点存在，不宣称浏览器/搜索引擎选择结果。
- [ ] 卸载结论只覆盖普通 metadata link，不外推 stylesheet Resource。
- [ ] SSR 只在边界说明中出现；没有 streaming fixture、header 或框架集成实现。
- [ ] 完成正文/Demo/manifest/Track 后按复杂课程要求独立 `/code-review`，最终需 `PASS / 0 finding`。

## 课程实施结论

A20 在当前 React DOM `19.2.8` SPA 基线上可确定性完成。最小且精确的课程不是“React 19 自动管理
SEO”，而是“React 让组件声明文档级标签并负责普通节点的客户端生命周期”。正式实现应坚持单一
current-route metadata owner，通过 detached document 展示更新、重复与卸载，并把 stylesheet、script、
resource hints、`useInsertionEffect`、server streaming 和 SEO 效果严格留在边界之外。
