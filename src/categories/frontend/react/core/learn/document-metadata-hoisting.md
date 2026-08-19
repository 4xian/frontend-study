---
id: react.core.learn.advanced.document-metadata-hoisting
type: lesson
title: 文档元数据提升
summary: 在组件树中声明 title、普通 meta 与元数据 link，并准确控制它们在 document head 中的更新、重复和卸载边界。
domain: frontend
technology: react
module: core
stage: advanced
level: advanced
estimatedMinutes: 110
prerequisites:
  - react.core.learn.advanced.flush-sync-dom-commit
related:
  - react.core.learn.basics.module-boundaries-and-component-tree
  - react.core.learn.advanced.hydrate-root-markup-identity
tags:
  - React
  - React DOM
  - document metadata
  - title
  - meta
  - link
  - head
appliesTo: React DOM 19.2.8
verifiedAt: 2026-08-18
objectives:
  - 能从任意组件声明 title、普通 meta 和元数据 link，并判断对应 DOM 的实际放置位置。
  - 能写出符合 JSX、TypeScript 与 HTML 约束的 title、meta、link 属性。
  - 能区分文档级元数据与带 itemProp 的条目级元数据。
  - 能说明嵌套声明为何会累积，而不会自动形成父子覆盖或普通元数据去重。
  - 能区分同一 Fiber 的原位更新、条件移除、Root 卸载与静态 head 节点的所有权。
  - 能为动态页面建立单一元数据 owner，并用 DOM 查询验证节点数量、属性与清理结果。
recap:
  - 合格的 title、普通 meta 和元数据 link 可以写在组件树深处，React 会把对应节点放入 ownerDocument.head。
  - title 使用单一文本值；动态内容用模板字符串形成一个 children 值。
  - meta 在 name、httpEquiv、charSet、itemProp 等角色中选择符合语义的一种；itemProp 不会提升。
  - 普通元数据 link 需要有效 rel 与非空 href，带 itemProp、onLoad 或 onError 时不走文档级提升路径。
  - 嵌套组件不会自动覆盖父组件声明；普通 title、meta、link 也不会按内容或属性自动去重。
  - 同一 React 元素位置可以原位更新节点；条件移除或 Root 卸载会清理 React 拥有的普通元数据节点。
  - TypeScript 只检查可表达的属性形状，单标题、单一 title children 和语义唯一性仍需由组件设计保证。
sources:
  - title: React title Reference
    url: https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/components/title.md
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - title 的 head 放置、SVG 与 itemProp 例外、单标题约束和动态文本写法
  - title: React meta Reference
    url: https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/components/meta.md
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - meta 的角色属性、content、head 放置和 itemProp 原位语义
  - title: React link Reference
    url: https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/components/link.md
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 普通元数据 link 的 rel、href、head 放置与退出提升的条件
  - title: React 19 metadata support
    url: https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/blog/2024/12/05/react-19.md
    sourceType: official-reference
    appliesTo: React 19
    claims:
      - 组件内原生 metadata 标签与客户端、服务端公共支持范围
  - title: React DOM 19.2.8 hoistable implementation
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js
    sourceType: source-code
    appliesTo: React DOM 19.2.8
    claims:
      - hoisting 资格、ownerDocument.head 放置、普通节点与 Resource 的身份边界
  - title: React DOM 19.2.8 hoistable tests
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMFloat-test.js
    sourceType: official-test
    appliesTo: React DOM 19.2.8
    claims:
      - title、meta、普通 link 的客户端提升、更新、移除与 hydration 行为
  - title: WHATWG HTML metadata elements
    url: https://html.spec.whatwg.org/multipage/semantics.html#the-title-element
    sourceType: specification
    appliesTo: HTML Living Standard
    claims:
      - title 单一约束、meta 角色属性和 link 关系语义
  - title: '@types/react 19.2.18 declarations'
    url: https://unpkg.com/@types/react@19.2.18/index.d.ts
    sourceType: source-code
    appliesTo: '@types/react 19.2.18'
    claims:
      - title、meta、link 的 JSX intrinsic 属性类型及其语义检查边界
---

# 文档元数据提升

## 一、学习目标

- 在页面组件、嵌套组件或条件分支中声明文档标题、描述和 canonical link。
- 预测这些声明在组件容器与 `document.head` 中各会出现多少个真实 DOM 节点。
- 为动态标题形成单一文本 children，正确使用 `name`、`content`、`rel`、`href`、`charSet` 和
  `httpEquiv` 等 JSX 属性。
- 区分普通文档元数据与带 `itemProp` 的局部条目元数据。
- 解释更新、重复、移除和 Root 卸载时的节点身份与所有权。
- 使用单一 owner 组织页面元数据，不依赖组件深度、DOM 顺序或自动去重。

## 二、为什么需要声明式文档元数据

页面正文描述用户正在阅读什么，文档元数据描述整个文档本身。常见信息包括：

- `<title>`：文档名称，浏览器可以把它显示在标签页、历史记录或书签中。
- `<meta name="description">`：文档描述。
- `<link rel="canonical">`：当前文档与一个规范 URL 的关系。

传统写法常在 Effect 中直接修改全局 DOM：

```tsx
useEffect(() => {
  document.title = lessonTitle
}, [lessonTitle])
```

这段代码只处理了标题，还需要自行保存旧值、处理清理、避免多个组件互相覆盖，并为其他 meta/link
重复编写查询和 DOM 操作。更重要的是，命令式修改脱离了组件的条件渲染和所有权：只看 JSX，无法判断
哪个组件负责创建或删除某个 head 节点。

React 支持把文档元数据直接写进组件返回值：

```tsx
/** 声明当前页面拥有的文档级元数据。 */
function LessonPage({ lessonTitle }: { lessonTitle: string }) {
  return (
    <>
      <title>{`${lessonTitle} | 学习站`}</title>
      <meta name="description" content={`学习 ${lessonTitle} 的核心规则。`} />
      <link rel="canonical" href="https://example.com/lessons/current" />

      <main>
        <h1>{lessonTitle}</h1>
      </main>
    </>
  )
}
```

三个标签在 React 组件树中属于 `LessonPage`，对应 DOM 却会被放进这个 Root 所属文档的
`<head>`。页面组件更新时，元数据跟着更新；组件离开时，React 可以移除它拥有的普通元数据节点。

## 三、核心心智模型

### 1. React 树位置与 DOM 位置可以不同

组件从哪里返回 metadata 标签，决定它的 React 所有权；React 把节点放到哪里，决定实际 DOM 位置。
对于符合条件的 `<title>`、普通 `<meta>` 和普通元数据 `<link>`，两者并不相同：

```text
React 组件树                         实际 Document

LessonPage                          html
  ├─ title   --------------------->   head
  ├─ meta    --------------------->     title
  ├─ link    --------------------->     meta
  └─ main   ---------------------->     link
                                        body
                                          #root
                                            main
```

这是“提升”的含义：节点被放入 `ownerDocument.head`。它不是复制。正常情况下，业务容器里不会再保留
同一个 title/meta/link DOM 节点。

### 2. 所有权仍留在原组件树

物理位置变化不等于节点脱离 React 管理。React 仍知道哪个 Fiber 拥有哪个 head 节点，因此可以执行：

- props 变化时更新同一个普通元数据节点；
- 条件分支消失时移除对应节点；
- 拥有节点的 Root 卸载时清理节点；
- 只处理自己拥有的节点，不应顺带删除静态 HTML 或其他系统创建的 head 节点。

### 3. 提升不是元数据合并

React 提供的是声明和放置能力，不是路由优先级或元数据合并算法。组件更深，不代表它自动覆盖外层
组件；标签内容相同，也不代表 React 自动把两个节点合成一个。

```text
父组件声明 title + 子组件声明 title
                 |
                 v
head 中存在两个 title，而不是“子组件覆盖父组件”
```

因此，正确设计依赖明确所有权，而不是依赖组件深度。

## 四、title 的公共合同

### 1. 基本写法

`<title>` 使用成对标签，children 表示文档标题：

```tsx
<title>文档元数据提升</title>
```

它可以位于返回树的任意深度。只要处于 HTML 上下文且没有 `itemProp`，React 会把对应节点放入
文档 head。

### 2. 动态标题必须形成单一文本值

推荐把全部动态内容插值为一个字符串：

```tsx
<title>{`${lessonName} | 前端学习站`}</title>
```

不要把静态文本和表达式写成多个 JSX children：

```tsx
<title>课程：{lessonName}</title>
```

后一种写法表面上是一行文本，JSX 结果却包含静态文本和表达式两个 children。React 对 title 要求一个
可转换为单一文本的 children 值；使用模板字符串可以直接满足这个合同。

### 3. 文档中同时只保留一个 title

React 不会自动删除第二个 title。多个组件同时声明时，所有 title 都会进入 head。HTML 规范要求一个
Document 最多一个 title，因此应用必须建立唯一 owner：

```tsx
interface DocumentMetadataProps {
  title: string
}

/** 由唯一入口声明当前文档标题。 */
function DocumentMetadata({ title }: DocumentMetadataProps) {
  return <title>{`${title}`}</title>
}
```

不要用 `document.title` 最终读到的单个字符串证明 DOM 合法。规范中的 getter 会读取树序中的第一个
title，这不等于 React 提供了“第一个胜出”或“最后一个覆盖”的组件协议。

### 4. 两个不提升的 title 场景

带 `itemProp` 的 title 表示局部条目元数据，不代表整个文档；SVG 内的 `<title>` 表示图形的可访问
名称。这两种标签都保持原有上下文，不应被当作文档标题：

```tsx
<svg viewBox="0 0 24 24" role="img">
  <title>保存图标</title>
  <path d="M5 3h12l2 2v16H5z" />
</svg>
```

## 五、meta 的公共合同

### 1. 普通文档元数据

最常用形态以 `name` 指明元数据种类，以 `content` 提供值：

```tsx
<meta name="description" content="介绍 React 文档元数据提升规则。" />
<meta name="author" content="Frontend Team" />
```

这些标签没有 children，使用自闭合写法。只要不带 `itemProp`，React 会把它们放入 head。

### 2. 角色属性

一个 meta 通过角色属性说明自己属于哪类元数据：

| JSX 属性 | 含义 | 常见配套 |
| --- | --- | --- |
| `name` | 命名的文档元数据 | 需要 `content` |
| `httpEquiv` | 文档内的 pragma 指令 | 需要 `content` |
| `charSet` | 文档字符编码声明 | 有效值为 `utf-8` |
| `itemProp` | 某个具体条目的 microdata 属性 | 需要 `content`，不提升 |

HTML 语义要求在这些角色中选择恰当的一种。JSX 使用驼峰属性 `httpEquiv`、`charSet`；实际 DOM 属性会
对应 `http-equiv`、`charset`。

```tsx
<meta charSet="utf-8" />
<meta httpEquiv="refresh" content="300" />
```

编码声明和 pragma 不是普通页面状态。动态页面通常更新 `name/content` 元数据，而不是在页面切换时
反复更新字符编码。

### 3. itemProp 表示局部条目元数据

`itemProp` 是提升的明确退出条件：

```tsx
/** 在商品条目内部声明只属于该商品的结构化属性。 */
function ProductCard({ name }: { name: string }) {
  return (
    <article itemScope>
      <meta itemProp="name" content={name} />
      <h2>{name}</h2>
    </article>
  )
}
```

这里的 meta 留在 article 所在的 body 子树，因为它描述商品条目，不描述整个 Document。不要给普通
description meta 加上 `itemProp`，然后仍期待它出现在 head。

### 4. React 不按 name 自动去重

两个组件都渲染下面的标签，会得到两个真实 meta 节点：

```tsx
<meta name="description" content="相同描述" />
```

`name="description"` 是 HTML 语义，不是 React 的全局 identity key。React reconciliation 只知道两个
不同 Fiber 分别拥有一个节点。

## 六、元数据 link 的公共合同

### 1. rel 与 href

`<link>` 表示当前文档和另一个资源或 URL 的关系。本节只使用不会触发资源加载的
`canonical` 元数据关系：

```tsx
<link rel="canonical" href="https://example.com/lessons/metadata" />
```

要进入普通 head 提升路径，至少需要：

- `rel` 是字符串，说明关系；
- `href` 是非空字符串，说明目标；
- 没有 `itemProp`；
- 没有 `onLoad` 或 `onError`。

缺少 `rel` 或 `href` 的 link 没有形成完整关系。把 `href` 写成空字符串也不能作为有效的文档级 link。

### 2. 常见元数据关系

不同 `rel` 表达不同关系，例如 canonical、icon、alternate、author；其中 icon、stylesheet、preload
等关系可能触发资源加载或应用，不属于本节的普通 metadata link。React 负责节点的声明式放置，不保证
每种关系会被所有浏览器、工具或索引系统采用。使用哪种关系、目标 URL 是否正确，仍是应用语义。

### 3. 普通 link 不按 href 自动去重

两个组件声明相同 canonical URL 时，head 会出现两个 link：

```tsx
<link rel="canonical" href="https://example.com/current" />
<link rel="canonical" href="https://example.com/current" />
```

普通元数据 link 是可更新、可卸载的 hoistable instance。不能把其他资源标签可能拥有的 URL 注册表或
去重规则套到普通 canonical link 上。

### 4. 范围边界

样式表、脚本与资源提示不仅描述文档，还涉及加载、执行、优先级或协调行为。它们有额外合同。本节只
讨论不会触发这些资源行为的 canonical metadata link，不能从 canonical 示例推导 icon、stylesheet 或
其他资源关系的加载、优先级与执行结论。

## 七、JSX 与 TypeScript 属性

### 1. intrinsic element 类型

在 TypeScript 中，三个标签都属于 JSX intrinsic elements：

| 标签 | 主要属性类型 | 本节要点 |
| --- | --- | --- |
| `title` | 通用 `HTMLAttributes<HTMLTitleElement>` | children 类型较宽，不能强制单一文本 |
| `meta` | `MetaHTMLAttributes<HTMLMetaElement>` | 角色属性大多可选，不能表达 exactly-one |
| `link` | `LinkHTMLAttributes<HTMLLinkElement>` | 属性形状可检查，关系与 URL 语义不能完全检查 |

类型声明能发现不存在的属性名或明显错误的值类型，但不会证明：

- 整个 Document 只有一个 title；
- title 实际只有一个 children；
- meta 的角色属性组合符合 HTML 语义；
- description 或 canonical 没有重复；
- href 指向业务上正确的 URL。

### 2. 用窄 Props 建立应用合同

应用可以在 metadata 组件自己的接口中收窄输入：

```tsx
interface PageMetadataProps {
  title: string
  description: string
  canonicalUrl: `https://${string}`
}

/** 只接受完整的一组页面文档元数据。 */
function PageMetadata({ title, description, canonicalUrl }: PageMetadataProps) {
  return (
    <>
      <title>{`${title}`}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
    </>
  )
}
```

这个接口把 title、description、canonical 作为一组值交给唯一 owner。模板字面量类型只能要求字符串以
`https://` 开头，不能验证 URL 一定存在或一定属于正确页面。

### 3. key 只服务于 reconciliation

`key` 可以帮助 React 在同一列表中识别元素，但不会建立跨组件的全局元数据身份：

```tsx
<meta key="description" name="description" content={description} />
```

如果两个不同组件各自使用相同 key，它们仍属于不同父级和不同 Fiber，head 中仍可能出现两个节点。

## 八、嵌套组件与单一 owner

### 1. 嵌套只改变声明来源

页面可以把 metadata 封装进深层组件，React 仍会提升：

```tsx
/** 声明文章详情的文档级信息。 */
function ArticleMetadata({ title, slug }: { title: string; slug: string }) {
  return (
    <PageMetadata
      title={title}
      description={`阅读文章：${title}`}
      canonicalUrl={`https://example.com/articles/${slug}`}
    />
  )
}
```

封装的价值是把相关值放在同一组件，不是赋予深层组件更高优先级。

### 2. 父子同时声明不会覆盖

下面的组合会产生两套元数据：

```tsx
/** 同时渲染默认值和具体值会产生重复节点。 */
function NestedDocument() {
  return (
    <>
      <PageMetadata
        title="默认标题"
        description="默认描述"
        canonicalUrl="https://example.com"
      />
      <ArticleMetadata title="具体文章" slug="react-metadata" />
    </>
  )
}
```

React 不知道“默认标题”是 fallback，也不知道文章组件应该覆盖它。两者都是合法的 React 元素，因而
各自创建节点。

### 3. 在上层先计算最终值

更稳定的模式是先确定当前页面对应的最终 metadata，再只渲染一次：

```tsx
interface RouteDocumentProps {
  page: 'catalog' | 'article'
  articleTitle?: string
}

/** 根据当前页面计算唯一的一组文档元数据。 */
function CurrentDocument({ page, articleTitle }: RouteDocumentProps) {
  const isArticle = page === 'article' && articleTitle
  const title = isArticle ? articleTitle : '文章目录'
  const description = isArticle ? `阅读文章：${articleTitle}` : '浏览全部文章。'
  const canonicalUrl = isArticle
    ? 'https://example.com/articles/current'
    : 'https://example.com/articles'

  return (
    <>
      <PageMetadata
        title={title}
        description={description}
        canonicalUrl={canonicalUrl}
      />
      <main>{isArticle ? <article>{articleTitle}</article> : <p>文章目录</p>}</main>
    </>
  )
}
```

单一 owner 并不要求 metadata 必须写在应用最顶层；它只要求同一时刻有一个明确入口负责当前文档级
语义。

## 九、更新与节点身份

### 1. 同一元素位置更新 props

页面状态变化但组件结构保持一致时，React reconciliation 会延续同一个元素位置：

```tsx
<PageMetadata
  title={currentPage.title}
  description={currentPage.description}
  canonicalUrl={currentPage.canonicalUrl}
/>
```

从目录页切到详情页时，普通 title/meta/link 节点的文本或属性会更新。这个结果来自同一 Fiber 的更新，
不是 React 扫描整个 head 后按 `name` 或 `href` 找到语义相同节点。

### 2. 改变类型、位置或 key 可能重建

React 元素身份仍遵守 reconciliation。条件分支改变树位置、元素类型变化或 key 改变时，旧节点可以被
移除并创建新节点。代码不应长期保存 head 节点引用，再要求每次页面变化后引用都不变。

### 3. 不在 render 中读取 head

render 只负责描述下一棵树，DOM commit 尚未完成。下面的读取不能证明当前 render 的 metadata 已经
提交：

```tsx
/** 错误示例：render 阶段读取的仍是提交前 DOM。 */
function MetadataProbe() {
  const count = document.head.querySelectorAll('meta[name="description"]').length
  return <output>{count}</output>
}
```

自动验证应在提交后查询 DOM。产品组件通常不需要读取自己刚声明的元数据；它应以 State/Props 作为
事实来源。

## 十、移除、卸载与外部节点

### 1. 条件移除

条件变为 false 时，React 会移除该分支拥有的普通元数据节点：

```tsx
{isDocumentActive ? (
  <PageMetadata
    title="活动文档"
    description="当前文档仍处于活动状态。"
    canonicalUrl="https://example.com/active"
  />
) : null}
```

如果另一个组件仍在声明自己的 meta/link，它们不会因为当前分支离开而自动删除。所有权是逐节点的。

### 2. Root 卸载

`root.unmount()` 会卸载整个 React 树。这个 Root 拥有的普通 hoistable title/meta/link 会随之移除。
Root 卸载后不能继续调用该 Root 的 `render`；需要重新挂载时创建新的 Root。

### 3. 静态和第三方节点

文档 head 可能同时包含：

- 服务器或静态 HTML 中的基础节点；
- 当前 React Root 拥有的元数据；
- 其他 Root、框架外壳或第三方脚本拥有的节点。

React 的声明式清理只应覆盖它拥有的节点。不要在 cleanup 中使用宽泛选择器删除所有 description meta
或所有 canonical link，这可能破坏其他 owner 的内容。

## 十一、客户端与服务端公共边界

React 的 title/meta/link 声明可用于客户端渲染，也可用于服务端渲染。两端共享这些基本要求：

- 标签和属性必须符合 HTML 语义；
- title 保持单一且只有一个文本值；
- 服务端输出与客户端首次声明应匹配；
- 嵌套声明不会自动产生路由覆盖规则。

服务端如何发现、传输或刷新 head，取决于具体服务端渲染入口和应用框架。HTTP header、流式输出时序、
爬虫执行策略和索引结果都不是普通客户端 metadata 标签的保证。不能因为节点最终进入 head，就承诺
任何搜索排名或抓取效果。

## 十二、可验证的设计清单

### 1. 声明前

- 当前 Document 是否只有一个文档级 metadata owner？
- title 是否已经合成为一个字符串值？
- meta 是否选择了正确的角色属性，并为需要的角色提供 `content`？
- link 是否具有准确的 `rel` 和非空 `href`？
- 这条信息描述整个文档，还是只描述一个带 `itemScope` 的局部条目？

### 2. 更新时

- 页面变化是否更新同一 owner 的 Props，而不是额外挂载第二套默认值？
- 是否错误地把 `key`、`name`、`href` 当作跨组件全局去重键？
- 是否在 render 中读取旧 head DOM 并据此做业务判断？

### 3. 移除时

- 条件分支离开后，React-owned 节点是否归零或回到预期数量？
- Root 卸载后，静态和第三方节点是否仍然保留？
- cleanup 是否只释放当前 owner 的资源，没有使用宽泛 DOM 删除？

### 4. DOM 断言

可以用精确选择器验证实际集合：

```ts
const titles = document.head.querySelectorAll('title')
const descriptions = document.head.querySelectorAll('meta[name="description"]')
const canonicals = document.head.querySelectorAll('link[rel="canonical"]')

console.assert(titles.length === 1)
console.assert(descriptions.length === 1)
console.assert(canonicals.length === 1)
```

如果页面还包含其他系统的合法节点，应为当前 owner 增加 `data-*` 标识，避免把未知节点混进计数或删除
操作。

## 十三、完整页面模式

下面的模式集中管理最终值，同时允许正文组件自由嵌套：

```tsx
interface PageDocument {
  title: string
  description: string
  canonicalUrl: `https://${string}`
}

interface ArticlePageProps {
  document: PageDocument
  heading: string
  summary: string
}

/** 渲染唯一文档元数据和对应正文。 */
function ArticlePage({ document, heading, summary }: ArticlePageProps) {
  return (
    <>
      <PageMetadata
        title={document.title}
        description={document.description}
        canonicalUrl={document.canonicalUrl}
      />

      <main>
        <article>
          <h1>{heading}</h1>
          <p>{summary}</p>
        </article>
      </main>
    </>
  )
}
```

这段代码有三个清晰边界：

1. `PageDocument` 是页面计算后的最终值，不包含“默认值再覆盖”的隐式规则。
2. `PageMetadata` 只负责声明当前 Document 的 title、description、canonical。
3. `ArticlePage` 的正文结构不会决定 metadata 优先级，组件嵌套与文档语义分开管理。

## 十四、交互演示

下面的隔离 Document 不连接真实课程页。切换“目录页”和“课程页”可以观察同一 primary 节点更新；
打开嵌套声明可以看到三类节点各从 1 变为 2；移除文档元数据后，带 `itemProp` 的 meta 仍留在 body；
卸载 Root 后 React-owned 节点全部清理，预先存在的静态 head 标记继续保留。

:::demo{id="react.core.learn.advanced.document-metadata-hoisting.isolated-document-demo"}
:::

## 十五、易错使用提示

:::pitfalls
### 错误：把深层声明当成自动覆盖

**触发条件：** 父布局声明默认 title、description、canonical，页面组件又声明一套具体值。

**原因：** React 只把各自节点提升到 head，不理解“默认值”和“具体值”的业务优先级。

**后果：** head 中出现多个 title、description meta 和 canonical link，文档语义冲突。

**错误示例：**

```tsx
<>
  <PageMetadata
    title="默认页"
    description="默认描述"
    canonicalUrl="https://example.com"
  />
  <PageMetadata
    title="详情页"
    description="详情描述"
    canonicalUrl="https://example.com/detail"
  />
</>
```

**正确写法：**

```tsx
<PageMetadata
  title="详情页"
  description="详情描述"
  canonicalUrl="https://example.com/detail"
/>
```

**验证方式：** 查询三类 owner 节点，正常状态下 title、description、canonical 应各为 1。

### 错误：用多个 title 表示 fallback

**触发条件：** 为全站标题和页面标题各保留一个 `<title>`，期待浏览器选更具体的值。

**原因：** React 会保留所有 title；HTML 又要求一个 Document 最多一个 title。

**后果：** DOM 无效，`document.title` 的观察值无法代表稳定的组件覆盖规则。

**错误示例：**

```tsx
<>
  <title>学习站</title>
  <title>文档元数据提升 | 学习站</title>
</>
```

**正确写法：**

```tsx
<title>文档元数据提升 | 学习站</title>
```

**验证方式：** 使用 `document.head.querySelectorAll('title').length` 断言数量严格为 1。

### 错误：把 title 写成多个 children

**触发条件：** 在 title 内混写静态文本和 JSX 表达式。

**原因：** JSX 会形成 children 数组，而 title 需要一个可以转换成单一文本的值。

**后果：** 开发环境可能警告，标题结果不满足 React 的支持合同。

**错误示例：**

```tsx
<title>课程：{lessonName}</title>
```

**正确写法：**

```tsx
<title>{`课程：${lessonName}`}</title>
```

**验证方式：** 开发控制台无 title children 警告，title 的 `textContent` 等于预期完整字符串。

### 错误：认为相同 name 的 meta 会自动去重

**触发条件：** 两个组件都渲染相同的 `<meta name="description">`。

**原因：** `name` 是 HTML 语义属性，不是普通 meta 的 React 全局 identity。

**后果：** head 中保留两个 description 节点，消费者可能得到冲突信息。

**错误示例：**

```tsx
<>
  <meta name="description" content="相同描述" />
  <meta name="description" content="相同描述" />
</>
```

**正确写法：**

```tsx
<meta name="description" content="相同描述" />
```

**验证方式：** 查询 `meta[name="description"]`，确认当前 owner 只产生一个节点。

### 错误：认为相同 href 的普通 link 会自动去重

**触发条件：** 多个组件声明相同 canonical link，期待 React 按 href 合并。

**原因：** 普通元数据 link 不使用资源级 href registry，两个 Fiber 各自拥有一个节点。

**后果：** head 中出现重复 canonical 关系。

**错误示例：**

```tsx
<>
  <link rel="canonical" href="https://example.com/current" />
  <link rel="canonical" href="https://example.com/current" />
</>
```

**正确写法：**

```tsx
<link rel="canonical" href="https://example.com/current" />
```

**验证方式：** 查询 `link[rel="canonical"]`，检查数量和 href，不以源码文本相同作为去重证据。

### 错误：给文档 meta 添加 itemProp

**触发条件：** 把 `itemProp` 当作 description 的附加标识。

**原因：** `itemProp` 把标签语义改为局部条目元数据，并取消文档级提升。

**后果：** meta 留在 body 子树，head 中缺少预期的文档 description。

**错误示例：**

```tsx
<meta itemProp="description" content="整个文档的描述" />
```

**正确写法：**

```tsx
<meta name="description" content="整个文档的描述" />
```

**验证方式：** 同时查询 head 中的 `meta[name="description"]` 和 body 中的 `meta[itemprop]`，确认位置与
语义一致。

### 错误：link 缺少完整关系属性

**触发条件：** 省略 `rel`、省略 `href` 或把 href 设为空字符串。

**原因：** link 没有同时说明关系和目标，不能形成完整的文档级 link。

**后果：** 节点不满足普通 head 提升的正例条件，文档关系缺失。

**错误示例：**

```tsx
<link href="" />
```

**正确写法：**

```tsx
<link rel="canonical" href="https://example.com/current" />
```

**验证方式：** 检查 head 中目标 link 的 `rel` 与原始 `href` 属性都准确且非空。

### 错误：给元数据 link 添加加载回调后仍期待提升

**触发条件：** 在普通 metadata link 上添加 `onLoad` 或 `onError`。

**原因：** 事件回调表示组件要在原上下文管理加载行为，React 不再按普通深层声明提升它。

**后果：** 实际放置位置与预期不同，还把文档关系和资源事件职责混在一起。

**错误示例：**

```tsx
<link
  rel="canonical"
  href="https://example.com/current"
  onLoad={() => console.log('loaded')}
/>
```

**正确写法：**

```tsx
<link rel="canonical" href="https://example.com/current" />
```

**验证方式：** 正例不注册加载回调，提交后节点位于 `ownerDocument.head`。

### 错误：把 TypeScript 通过当作语义有效

**触发条件：** 只运行类型检查，不检查 title 数量、children 形状或 meta 角色组合。

**原因：** intrinsic 类型为了覆盖通用 JSX 写法较宽，无法编码整个 Document 的全局约束。

**后果：** 代码可以通过编译，却产生多个 title、重复 meta 或不完整 link。

**错误示例：**

```tsx
<meta name="description" itemProp="description" content="冲突角色" />
```

**正确写法：**

```tsx
<meta name="description" content="文档描述" />
```

**验证方式：** 在类型检查之外，用 DOM 选择器断言角色、位置和数量。

### 错误：卸载时删除所有同类 head 节点

**触发条件：** cleanup 使用宽泛选择器手动删除所有 description 或 canonical 节点。

**原因：** 选择器无法区分 React、静态 HTML 和第三方系统的所有权。

**后果：** 当前组件卸载时破坏其他 owner 的合法元数据。

**错误示例：**

```tsx
useEffect(() => {
  return () => {
    document.head.querySelectorAll('meta[name="description"]').forEach((node) => node.remove())
  }
}, [])
```

**正确写法：**

```tsx
{isActive ? <meta name="description" content="活动页面" /> : null}
```

**验证方式：** 条件分支或 Root 卸载后只检查 React-owned 节点消失，静态标记仍然存在。
:::

## 十六、源码推导与适用场景

### 1. 固定实现证明的事实

React DOM 在判断 host hoistable 类型时：

- HTML 上下文中的 meta、title 可以进入普通提升路径；
- SVG namespace 或存在 `itemProp` 时退出文档级提升；
- link 需要字符串 `rel`、非空字符串 `href`，且不能带 `onLoad/onError`；
- 挂载普通 hoistable 时，目标是 Root 容器对应的 `ownerDocument.head`；
- 普通 meta、title 和非资源 link 不进入资源 map；
- 普通 hoistable 删除时，React 从其 parent 移除对应实例。

固定官方测试进一步覆盖了客户端创建、title 更新、条件移除和 hydration 接管。这些测试用于确认当前
版本行为，但内部 Fiber tag、缓存字段和匹配算法都不是应用可调用的公共 API。

### 2. 可以推导的设计规则

从公共文档、HTML 规范和当前实现可以得到：

1. 页面元数据应有一个明确 owner，避免依赖深度覆盖。
2. 普通元数据的唯一性应由数据模型和组件接口保证，不依赖 React 语义去重。
3. 更新同一 owner 的 Props 比并排挂载“默认值 + 具体值”更符合 reconciliation。
4. 验证必须查询实际 head 节点数量和属性，不能只读取 `document.title` 或只看 TypeScript 结果。
5. 条目级 metadata 和文档级 metadata 应使用不同组件接口，避免误加 `itemProp`。

### 3. 适用场景

- 客户端页面切换时更新 title、description 和 canonical。
- 可复用页面组件把自己的最终文档元数据与正文放在同一 React 所有权下。
- 对话框、全屏编辑器或临时文档视图在挂载期间声明唯一文档标题，并在离开时自动清理。
- 独立 iframe 或 detached Document 中验证元数据，而不污染宿主页面。

### 4. 不适用的推断

- 节点进入 head 不等于任何爬虫一定执行、抓取或采用它。
- 普通 metadata link 的行为不能外推到样式、脚本或资源提示。
- hydration 的属性匹配不能外推成 `createRoot` 的静态 head 收养或去重能力。
- 一个 Root 内的所有权不能自动解决多个 Root、第三方脚本或框架外壳之间的协调。

## 十七、练习

:::exercise
### 1. 建立单一 owner

**要求：** 给定一个布局组件和详情组件，它们都声明 title、description、canonical。重构为一个
`PageMetadata` 调用：先在页面入口计算最终值，再用 DOM 查询证明三类节点各只有一个。

**验收：** 页面切换前后三类节点数量始终为 `1 / 1 / 1`，值对应当前页面，布局和详情不会同时声明。

**参考答案：** 先把默认值与页面值合并成一个 `PageDocument`，再交给唯一 metadata owner 渲染。
:::

:::exercise
### 2. 预测节点数量

**要求：** 在不运行代码的情况下，预测下列状态中的 title/meta/link 数量：只挂载父 owner、父子 owner 同时挂载、
移除子 owner、更新父 owner Props、卸载整个 Root。写出每一步的所有权理由，再用隔离 Document 验证。

**验收：** 数量依次为 `1 / 2 / 1 / 1 / 0`；父 owner 更新只改值，不能解释成按语义属性查找替换。

**参考答案：** 每个活跃 Fiber 拥有自己的普通节点；更新延续同一 Fiber，移除和卸载按所有权回收。
:::

:::exercise
### 3. 区分文档与条目元数据

**要求：** 创建一个商品页面：head 中保留唯一文档 description，商品 article 内使用 `itemScope` 和
`meta itemProp="name"`。分别查询 head 与 body，解释两个 meta 为什么具有不同物理位置。

**验收：** head 中有一个 `meta[name="description"]`，article 中有一个 `meta[itemprop="name"]`，两者内容独立。

**参考答案：** `name` 描述 Document，`itemProp` 描述具体 item 并退出文档级提升。
:::

:::exercise
### 4. 验证原位更新

**要求：** 在同一元素位置切换目录页和详情页 metadata，保存首次提交的 title/meta/link DOM 引用。更新后比较
引用和属性，再把当前分支设为 `null`，确认 React-owned 节点被移除。

**验收：** 三个引用在 Props 更新后严格相等且值改变；分支移除后精确查询结果都为零。

**参考答案：** 同一元素类型和位置延续 Fiber，因此普通 host props 原位更新；渲染 `null` 结束所有权。
:::

:::exercise
### 5. 审查类型之外的语义

**要求：** 列出三段“TypeScript 可以接受但文档语义错误”的 JSX：多个 title、多个 title children、meta 角色冲突
或重复 canonical。为每段补一个 DOM 或 console 验证条件，并改成窄接口可以表达的正确写法。

**验收：** 每段都区分类型形状与 HTML/React 语义，至少包含一个节点数量断言和一个 title warning 检查。

**参考答案：** 使用单一 owner、模板字符串和角色明确的窄 Props；类型检查之外继续验证 DOM 与 console。
:::

## 十八、本节小结

- React 允许从组件树任意深度声明文档级 title、普通 meta 和普通元数据 link，并把合格节点放到
  `ownerDocument.head`。
- title 必须保持单一，动态标题用模板字符串形成一个文本 children；SVG title 与带 `itemProp` 的 title
  不属于文档标题。
- 普通 meta 使用合适的角色属性；`itemProp` 表示局部条目元数据，因此保留在原 body 子树。
- 普通元数据 link 需要准确的 `rel` 与非空 `href`，不能把带加载回调或资源行为的 link 当成相同合同。
- 嵌套组件不形成自动覆盖，普通 title/meta/link 也不按文本、name、rel 或 href 语义去重。
- 同一 Fiber 可以原位更新普通元数据节点；条件移除与 Root 卸载会清理 React 拥有的节点，不应删除
  静态或第三方 owner 的节点。
- TypeScript 负责属性形状，Document 全局唯一性、HTML 角色组合和 URL 业务正确性仍需组件设计与 DOM
  验证共同保证。

## 十九、参考资料

- [React `<title>`](https://react.dev/reference/react-dom/components/title) - head 放置、单一文本、SVG/
  itemProp 例外与多标题边界。
- [React `<meta>`](https://react.dev/reference/react-dom/components/meta) - meta 角色、content 与条目级
  metadata 原位语义。
- [React `<link>`](https://react.dev/reference/react-dom/components/link) - 普通元数据 link 的属性、提升
  条件与例外。
- [React 19: Support for metadata tags](https://react.dev/blog/2024/12/05/react-19#support-for-metadata-tags) -
  原生 metadata 标签的稳定支持范围。
- [React DOM 19.2.8 hoistable implementation](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js) -
  当前版本的提升资格、head 放置、普通实例与资源身份边界。
- [React DOM 19.2.8 hoistable tests](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMFloat-test.js) -
  客户端提升、更新、移除与 hydration 的官方测试证据。
- [WHATWG `<title>`](https://html.spec.whatwg.org/multipage/semantics.html#the-title-element) - 单一 title、
  文本内容与文档标题语义。
- [`@types/react@19.2.18`](https://unpkg.com/@types/react@19.2.18/index.d.ts) - JSX intrinsic 属性类型与
  TypeScript 检查边界。
