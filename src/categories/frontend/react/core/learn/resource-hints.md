---
id: react.core.learn.advanced.resource-hints
type: lesson
title: 资源提示 API
summary: 根据已知信息和生效时机，在 DNS、连接、预下载与立即执行之间选择足够且最弱的 React DOM API。
domain: frontend
technology: react
module: core
stage: advanced
level: advanced
estimatedMinutes: 180
prerequisites:
  - react.core.learn.advanced.declarative-async-script-resource
related:
  - react.core.learn.advanced.declarative-stylesheet-resources
  - react.core.learn.advanced.document-metadata-hoisting
  - react.core.learn.advanced.hydrate-root-markup-identity
  - react.core.learn.advanced.error-boundary-render-failures
tags:
  - React DOM
  - prefetchDNS
  - preconnect
  - preload
  - preloadModule
  - preinit
  - preinitModule
  - resource hints
appliesTo: React DOM 19.2
verifiedAt: 2026-08-19
objectives:
  - 能按“已知 origin 或具体 URL、是否允许立即生效、classic 或 module”选择六个资源提示 API。
  - 能解释 DNS、连接、下载、模块准备、脚本执行和样式应用之间的边界。
  - 能写出六个 API 的完整 TypeScript 调用，并为 as、CORS、优先级和图片属性选择正确值。
  - 能预测重复调用、首次属性、精确 URL 身份及 preload 到 preinit 的可观察结果。
  - 能区分浏览器与服务端调用上下文、void 返回值、资源失败和 Error Boundary 的职责。
  - 能在独立 Document 与 JavaScript realm 中验证节点、执行计数、样式和 Root 生命周期。
recap:
  - 只可能访问某个 origin 时用 prefetchDNS，确定会访问但未知资源时用 preconnect。
  - 已知具体 URL 且暂不应生效时用 preload；ESM 使用 preloadModule。
  - classic script 或 stylesheet 应立即生效时用 preinit；ESM 使用 preinitModule。
  - preload 只提前获取，不执行 classic script，也不应用 stylesheet。
  - modulepreload 可以准备模块，但不等于执行模块。
  - 六个 API 都返回 void，不提供 readiness Promise，也不把资源失败交给 Error Boundary。
  - 同一资源的后续等价调用不是属性更新；所有调用点必须共享稳定的 URL 和请求合同。
  - 一个 href 应固定一种资源类型和脚本形态，不能在 classic 与 module 之间复用。
  - 客户端节点属于 Document；Root 卸载不会撤销已建立的节点、脚本副作用或样式。
  - 资源提示是浏览器可采用的提示，不是固定性能收益、请求顺序或缓存命中的保证。
sources:
  - title: React DOM resource preloading APIs
    url: https://react.dev/reference/react-dom#resource-preloading-apis
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 六个 API 的入口、返回值、调用位置与选择关系
  - title: React 19 resource preloading support
    url: https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/blog/2024/12/05/react-19.md#support-for-preloading-resources
    sourceType: official-reference
    appliesTo: React 19
    claims:
      - 从 DNS、连接、下载到立即生效的能力层级
  - title: React DOM 19.2.8 public resource API implementation
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/shared/ReactDOMFloat.js
    sourceType: source-code
    appliesTo: React DOM 19.2.8
    claims:
      - 参数校验、options 归一化、Module 默认值与 dispatcher 调用
  - title: React DOM 19.2.8 client resource implementation
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js
    sourceType: source-code
    appliesTo: React DOM 19.2.8
    claims:
      - Document 作用域、HTML 映射、资源身份、首次属性和跨 API 行为
  - title: React DOM 19.2.8 resource API tests
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMFloat-test.js
    sourceType: official-test
    appliesTo: React DOM 19.2.8
    claims:
      - 参数警告、重复调用、首次属性与客户端服务端输出
  - title: '@types/react-dom 19.2.4 declarations'
    url: https://unpkg.com/@types/react-dom@19.2.4/index.d.ts
    sourceType: source-code
    appliesTo: '@types/react-dom 19.2.4'
    claims:
      - 六个 API 的 TypeScript 签名和 options 类型
  - title: WHATWG preload and modulepreload
    url: https://html.spec.whatwg.org/multipage/links.html#link-type-preload
    sourceType: specification
    appliesTo: HTML Living Standard
    claims:
      - preload 目标类型、module map 与 modulepreload 处理模型
  - title: MDN resource hints
    url: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/preload
    sourceType: official-reference
    appliesTo: Web platform
    claims:
      - as 与消费请求匹配、浏览器提示性质和过量提示成本
  - title: React Error Boundary Reference
    url: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Error Boundary 与一般异步资源错误的职责边界
---

# 资源提示 API

## 一、学习目标

- 能按“已知 origin 或具体 URL、是否允许立即生效、classic 或 module”选择六个资源提示 API。
- 能解释 DNS、连接、下载、模块准备、脚本执行和样式应用之间的边界。
- 能写出完整 TypeScript 调用，并为 `as`、CORS、优先级和图片属性选择正确值。
- 能预测重复调用、首次属性、精确 URL 身份及 preload 到 preinit 的可观察结果。
- 能区分浏览器与服务端调用上下文、`void` 返回值、资源失败和 Error Boundary 的职责。
- 能在独立 Document 与 JavaScript realm 中验证节点、执行计数、样式和 Root 生命周期。

## 二、为什么需要资源提示

浏览器通常在解析到资源声明后才知道下一步要访问哪个服务器、下载哪个文件。若应用更早知道这些
信息，就可以向浏览器提供提示，把部分准备工作提前。

“提前”并不是一个单一动作。下面四个目标强度不同：

1. 可能访问某个服务器，只想提前解析域名。
2. 确定会访问某个服务器，想提前建立连接，但还不知道具体文件。
3. 已经知道具体文件，只想提前下载，不允许它现在执行或应用。
4. 已经知道具体文件，而且一旦可用就应立即执行脚本或应用样式。

React DOM 为这些目标提供六个函数。正确选择的核心不是“哪个更强”，而是“当前已知多少信息，资源
现在能否产生副作用”。选得太弱，浏览器无法提前完成需要的工作；选得太强，脚本或样式可能在业务
尚未准备好时生效。

## 三、能力阶梯

### 1. 从 origin 到具体资源

`prefetchDNS` 与 `preconnect` 面向服务器 origin，例如 `https://assets.example.com`。它们不知道将来
会使用 `/fonts/main.woff2` 还是 `/images/banner.webp`。

`preload`、`preloadModule`、`preinit` 和 `preinitModule` 面向具体资源 URL。调用者必须已经知道准确的
脚本、样式、字体、图片或其他资源地址。

### 2. 从准备到生效

| 能力 | 最多提前到 | 是否下载具体资源 | 是否执行或应用 |
| --- | --- | ---: | ---: |
| DNS 预取 | 域名解析 | 否 | 否 |
| 预连接 | 域名解析、连接与必要协商 | 否 | 否 |
| preload | 按资源类型提前获取 | 是 | 否 |
| modulepreload | 获取并准备 ESM | 是 | 否 |
| preinit classic script | 获取并执行 classic script | 是 | 是 |
| preinit stylesheet | 获取、插入并应用 stylesheet | 是 | 是 |
| preinit module | 获取并执行 ESM | 是 | 是 |

### 3. 选择最弱且足够的能力

若只知道服务器，不要伪造一个具体文件地址；若已知资源 URL，不要只做连接提示；若资源暂时不能
执行或应用，不要使用 preinit。最弱且足够的提示更容易控制副作用，也减少无用连接和下载竞争。

## 四、prefetchDNS 与 preconnect

### 1. prefetchDNS

`prefetchDNS` 告诉浏览器可能会访问某个服务器，可以提前查询 IP 地址：

```tsx
import { prefetchDNS } from 'react-dom'

prefetchDNS('https://avatars.example.com')
```

它只接收 `href`，返回 `void`。DNS 查询不使用 CORS，因此不要传 `crossOrigin`。当页面只是“可能”访问
多个服务器时，DNS 预取通常比为每个服务器建立完整连接更克制。

### 2. preconnect

`preconnect` 适合已经确定会访问某个服务器，但还不知道具体资源的场景：

```tsx
import { preconnect } from 'react-dom'

preconnect('https://fonts.example.com', {
  crossOrigin: 'anonymous',
})
```

它允许浏览器提前完成 DNS、连接和必要协商，但不会下载字体或其他具体文件。当前 React DOM 类型与
运行时支持可选 `crossOrigin`，取值为匿名模式、`use-credentials` 或空字符串。凭据模式必须与最终
资源请求一致。

### 3. 连接提示的边界

- 传 origin，避免把完整文件路径误认为连接身份。
- 对当前页面自己的 origin 通常没有收益，因为主文档已经建立连接。
- 同一参数的重复调用等同一次，但浏览器仍可根据资源压力决定是否采用提示。
- 过量 preconnect 会占用连接和系统资源，不应为所有候选域名同时建连。

## 五、preload

### 1. 完整调用

`preload` 提前获取已知资源，但不会替应用使用它：

```tsx
import { preload } from 'react-dom'

preload('/assets/course-map.js', {
  as: 'script',
  crossOrigin: 'anonymous',
  fetchPriority: 'high',
})
```

函数返回 `void`。它不返回 Promise，也没有“下载完成”的返回状态。

### 2. as 决定请求类型

`as` 是核心字段。React Reference 列出的常用值包括：

| as | 典型资源 | 需要特别核对的属性 |
| --- | --- | --- |
| `script` | classic script | CORS、SRI、最终 script 形态 |
| `style` | stylesheet | 最终 stylesheet URL 与 CORS |
| `font` | 字体 | 跨域字体通常需要匹配的 CORS 模式 |
| `image` | 图片 | `imageSrcSet`、`imageSizes`、`type` |
| `fetch` | fetch/XHR 将使用的数据 | Reference 要求 `crossOrigin` |
| `audio` / `video` | 媒体 | MIME、CORS 与最终消费请求 |
| `worker` | Worker 脚本 | 资源类型和最终 Worker 请求 |

错误的 `as` 可能让浏览器使用不同的请求模式，导致预载响应无法被最终消费者复用。

### 3. 常用 options

| 字段 | 作用 | 使用要求 |
| --- | --- | --- |
| `crossOrigin` | 选择 CORS 凭据模式 | 与最终消费请求一致 |
| `integrity` | 校验响应摘要 | 与真实内容和最终元素一致 |
| `nonce` | 配合 CSP | 由可信服务器策略生成 |
| `referrerPolicy` | 控制 referrer | 与目标请求策略一致 |
| `fetchPriority` | 提示相对优先级 | 不是请求顺序锁 |
| `type` | 声明 MIME | 与响应内容一致 |
| `imageSrcSet` | 声明响应式图片候选 | 只用于图片 |
| `imageSizes` | 描述响应式图片显示尺寸 | 与 `imageSrcSet` 协同 |

### 4. preload 不执行也不应用

```tsx
preload('/assets/chart-runtime.js', { as: 'script' })
preload('/assets/report-theme.css', { as: 'style' })
```

第一行不会执行脚本，第二行不会把样式表应用到页面。浏览器只是按 `as` 提前获取。需要立即执行脚本
或应用样式时，应选择 `preinit`，而不是在 preload 后立刻读取脚本全局变量或 computed style。

## 六、preloadModule

### 1. ESM 使用独立 API

ESM 不使用 classic script 的 preload 形态：

```tsx
import { preloadModule } from 'react-dom'

preloadModule('/assets/search-panel.js', {
  as: 'script',
  crossOrigin: 'anonymous',
})
```

浏览器可获取模块、放入当前 Document 的 module map，并提前进行部分解析和编译工作。模块不会因此
求值，顶层副作用也不会执行。

### 2. 推荐显式写 as

当前运行时允许省略 Module options，TypeScript 声明与 Reference 的必填程度也存在差异。稳定写法是
显式传 `{ as: 'script' }`。不要利用当前类型中的其他 `RequestDestination` 扩展来教授尚未形成稳定
公共用法的模块类型。

### 3. preload 与 preloadModule 不能互换

`preload(url, { as: 'script' })` 描述 classic script 请求；`preloadModule(url, { as: 'script' })` 描述
ESM 请求。即使 URL 后缀都是 `.js`，浏览器处理模型和最终消费者仍不同。

## 七、preinit 与 preinitModule

### 1. 立即执行 classic script

```tsx
import { preinit } from 'react-dom'

preinit('/assets/map-runtime.js', {
  as: 'script',
  crossOrigin: 'anonymous',
  fetchPriority: 'high',
})
```

React DOM 在客户端建立 async classic script。脚本下载完成后会执行，因此 URL 必须可信，脚本副作用
必须允许在调用后立即发生。

### 2. 立即应用 stylesheet

```tsx
preinit('/assets/course-theme.css', {
  as: 'style',
  precedence: 'medium',
})
```

stylesheet 会被插入 Document 并应用。Reference 要求提供 `precedence`，常见值为 `reset`、`low`、
`medium`、`high`。固定运行时接受其他字符串并为省略值使用内部默认值，但推荐代码应遵守 Reference，
显式表达样式顺序。

### 3. 立即执行 ESM

```tsx
import { preinitModule } from 'react-dom'

preinitModule('/assets/search-panel.js', {
  as: 'script',
  crossOrigin: 'anonymous',
})
```

`preinitModule` 建立 module script 并触发模块求值。它仍返回 `void`，不会返回模块 namespace，也不能
替代 `import()` 取得导出值。

### 4. preinit 的副作用边界

preinit 不是“更彻底的 preload”。它改变页面可观察状态：脚本可以注册监听器、修改全局对象或启动
后台工作；stylesheet 会立刻改变样式。只有业务已经允许这些结果发生时才使用。

## 八、六个 API 的选择矩阵

| 已知信息 | 现在允许的动作 | 资源形态 | 选择 |
| --- | --- | --- | --- |
| 只知道可能访问的 origin | 只解析域名 | 任意 | `prefetchDNS` |
| 确定访问 origin，未知文件 | 建立连接 | 任意 | `preconnect` |
| 已知 URL，只提前获取 | 不立即生效 | classic、style、font、image 等 | `preload` |
| 已知 ESM URL，只提前准备 | 不执行 | module | `preloadModule` |
| 已知 URL，立即执行或应用 | 立即生效 | classic script / stylesheet | `preinit` |
| 已知 ESM URL，立即执行 | 立即生效 | module | `preinitModule` |

可以用三个问题完成选择：

1. 只知道 origin，还是已经知道具体 URL？
2. 具体资源现在是否允许执行或应用？
3. 脚本是 classic 还是 ESM？

## 九、React 调用与 HTML 映射

固定客户端实现会产生或复用以下元素：

| React 调用 | HTML 结果 | 可观察边界 |
| --- | --- | --- |
| `prefetchDNS(origin)` | `<link rel="dns-prefetch">` | 只证明提示已声明 |
| `preconnect(origin)` | `<link rel="preconnect">` | 不下载具体资源 |
| `preload(url, {as})` | `<link rel="preload" as="...">` | 不执行、不应用 |
| `preloadModule(url, ...)` | `<link rel="modulepreload">` | 不执行模块 |
| `preinit(url, {as: 'script'})` | `<script async>` | classic script 执行 |
| `preinit(url, {as: 'style'})` | `<link rel="stylesheet">` | stylesheet 应用 |
| `preinitModule(url, ...)` | `<script type="module" async>` | ESM 执行 |

DOM 元素存在只证明 React 已向浏览器声明资源。它不能单独证明 DNS 已完成、连接已复用、响应已进入
缓存或性能指标已经改善。

## 十、资源身份与首次声明

### 1. 重复调用不是更新 API

```tsx
preload('/assets/course-map.js', {
  as: 'script',
  crossOrigin: 'anonymous',
  fetchPriority: 'high',
})

preload('/assets/course-map.js', {
  as: 'script',
  crossOrigin: 'use-credentials',
  fetchPriority: 'low',
})
```

固定客户端对同一 classic script preload 身份保留首次声明，第二次不会把已有节点改成 low 或
`use-credentials`。React 的去重不是冲突合并器，调用者必须先统一合同。

### 2. 精确字符串很重要

`/assets/chart.js`、`./assets/chart.js` 与 `https://example.com/assets/chart.js` 可能指向同一响应，但不要
依赖 React 或浏览器把不同输入字符串自动视为同一声明。共享资源应由单一常量提供准确 URL。

### 3. 图片身份更复杂

普通 preload 主要围绕资源类型与 href；响应式图片还使用 `imageSrcSet` 和 `imageSizes` 描述候选。改变
srcset 或 sizes 可能建立不同的图片预载候选，不能只看 href 数量。

### 4. classic 与 module 不共享地址

固定客户端的最终 classic/module script 资源可能围绕同一 src key 协作，先到声明可能决定实际形态。
为两个产物使用不同 URL，并让一个 URL 永远只对应 classic 或 module。

## 十一、preload 与 preinit 的组合

### 1. 先发现，稍后允许生效

只有业务确实存在两个时刻时，组合才有意义：

```tsx
/** 用户看到入口时只提前下载脚本。 */
function warmReportRuntime(): void {
  preload('/assets/report-runtime.js', {
    as: 'script',
    crossOrigin: 'anonymous',
  })
}

/** 用户确认进入报告后允许脚本执行。 */
function activateReportRuntime(): void {
  preinit('/assets/report-runtime.js', {
    as: 'script',
    crossOrigin: 'anonymous',
  })
}
```

客户端通常保留 preload link，再建立最终 script 或 stylesheet。不要把它描述为对原 link 的 `rel`
原位修改。

### 2. 属性采用是有限实现行为

固定客户端会在部分资源组合中采用预载阶段的 CORS、referrer policy 或 integrity 等信息，但并非所有
options 都会自动转移。最终 preinit 应显式提供一致的请求合同，不依赖内部采用列表。

### 3. 服务端结果可能不同

服务端可能把未发送的弱提示折叠到最终资源，也可能在提示已经发送后保留二者。HTTP `Link` header、
HTML 元素和 flush 时机都会影响外观，因此客户端 DOM 节点数不能作为服务端输出位置的永久合同。

### 4. 已知立即生效时直接 preinit

如果首次知道 URL 时就允许执行或应用，直接调用 preinit。先 preload 再立刻 preinit 不会凭空创造额外
提前量，反而让调用点和属性合同更难维护。

## 十二、调用位置与渲染边界

### 1. 浏览器中不是 Hook

六个函数都不是 Hook。浏览器中可以在 render、Effect、事件处理器或普通模块函数中调用。应放在
“第一次可靠知道资源”的位置，而不是为了形式放进 Effect。

```tsx
import { preconnect } from 'react-dom'

/** 在组件渲染时声明其后代确定会访问的服务器。 */
function AvatarPanel() {
  preconnect('https://avatars.example.com')
  return <section>用户头像</section>
}
```

render 可以重复，开发环境也可能额外执行检查。正确代码依赖 React 的资源去重，而不是假设组件只
render 一次。

### 2. 服务端需要渲染上下文

服务端渲染与 Server Components 中，调用只有在组件 render 或源自该 render 的 async context 中才能
关联当前响应。模块初始化、无关定时器或没有渲染上下文的调用可能被忽略。

### 3. 服务端输出不只一种介质

固定服务端实现可以把部分提示写入 HTTP `Link` header，也可以输出 HTML 元素。使用者依赖的是 React
可以把提示交给浏览器，而不是每个 API 都保证产生一个可在最终 head 中查询的元素。

## 十三、void、就绪和失败通道

### 1. 返回值不能表示完成

六个函数都返回 `void`：

```tsx
const result = preload('/assets/report.js', { as: 'script' })
// result 是 undefined，不是 Promise。
```

不能 `await preload(...)`，也不能根据返回值判断 DNS、连接或下载已经完成。

### 2. 没有 React 级资源事件参数

这些 API 不接收 React `onLoad` 或 `onError` 回调。需要真实就绪状态的业务，必须由最终消费者、资源
自身协议或专用加载机制提供信号。

### 3. Error Boundary 不接管网络失败

DNS、CORS、SRI、CSP、HTTP 或脚本异步执行失败发生在浏览器资源通道。它们不是后代 render 抛出的
异常，不会因为调用 preinit 就自动进入 React Error Boundary。

## 十四、Document、Root 与 JavaScript realm

### 1. 客户端作用域是 Document

固定 React DOM 客户端在模块求值时捕获全局 `document`，六个 API 使用该 Document，而不是从某个
React Root 的 container 反向寻找 owner document。

因此，把父页面已经加载的 React Root 挂进 iframe body，不足以证明提示会写入 iframe head。React DOM
仍可能使用父 realm 中捕获的 Document。

### 2. Root 卸载不撤销资源

这些 link、script、module map、已执行脚本和已应用样式属于 Document 或 realm 级状态。Root unmount
不会把它们恢复到零，同一 Document 中重建 Root 也应继续复用既有资源身份。

### 3. 可信隔离需要独立 realm

可靠实验需要让 iframe 加载独立页面，并在 iframe 自己的脚本入口中 import React DOM。这样模块求值
捕获的是 iframe 的 `document`；销毁 iframe 才会同时销毁 Document、module map、脚本全局状态和样式。

## 十五、TypeScript 合同

### 1. 推荐显式完整调用

当前类型、Reference 和固定运行时在少数字段的必填程度上存在差异。应用代码统一采用下面的稳定形态：

```tsx
prefetchDNS('https://assets.example.com')
preconnect('https://assets.example.com', { crossOrigin: 'anonymous' })
preload('/assets/chart.js', { as: 'script' })
preloadModule('/assets/panel.js', { as: 'script' })
preinit('/assets/chart.js', { as: 'script' })
preinit('/assets/theme.css', { as: 'style', precedence: 'medium' })
preinitModule('/assets/panel.js', { as: 'script' })
```

### 2. 类型通过不等于运行时有效

当前 `.d.ts` 可能允许省略 `preload` 或 `preinit` 的 options，但固定开发运行时会警告并忽略无有效 `as`
的调用。遵守 Reference 并显式传值，避免把类型声明的宽松处当成推荐用法。

### 3. 暂不依赖有张力的字段

`preloadModule` 的 `nonce` 在 Reference、类型和固定公共 wrapper 之间存在转发张力。安全策略应使用
经过目标版本端到端验证的配置，不把单一类型字段当作 CSP 已生效的证明。

## 十六、安全与性能边界

### 1. 请求属性必须一致

`crossOrigin`、`integrity`、`nonce`、`referrerPolicy`、`type` 和 `fetchPriority` 会影响请求、安全校验或
调度提示。它们不是可在后续等价调用中随意覆盖的装饰字段。

### 2. preinit 只接受可信 URL

preinit 会执行代码或应用样式。不要把未经校验的用户输入直接作为 href，也不要依赖 React 去重修复
冲突的 SRI、CORS 或 CSP 配置。

### 3. 提示不是性能保证

- 浏览器可以根据支持度、缓存和资源压力调整或忽略提示。
- 过多 preconnect 会占用连接，过多 preload 会与真正关键资源竞争。
- `fetchPriority` 是相对提示，不是网络完成顺序锁。
- 节点在 head 中的顺序不等于请求开始或完成顺序。
- 性能收益需要在真实产品网络、缓存和设备条件下单独测量。

## 十七、隔离观察 Demo

下面的 Demo 使用独立同源 iframe。React DOM 在 iframe 自己的 realm 中求值，父页面只通过
`postMessage` 发送动作和接收快照。

:::demo{id="react.core.learn.advanced.resource-hints.isolated-realm-demo"}
:::

按顺序观察：

1. 连接阶段出现一份 dns-prefetch 和一份 preconnect，重复声明不增加节点。
2. 提前发现阶段出现 classic preload 与 modulepreload，但两种脚本执行数仍为零。
3. 立即生效阶段建立 classic/module script 与 stylesheet，两个脚本各执行一次，样式变为已应用。
4. 冲突的第二次 classic preload 不能把首次 high/anonymous 改成 low/use-credentials。
5. Root 卸载后节点、执行数和样式保留；同 Document 重建 Root 仍不重复执行。
6. 重建 iframe 后新 Document 从零开始，新 realm 可以再次各执行一次。

宿主资源节点必须始终为零。该断言证明隔离，没有宣称同源连接提示产生性能收益。

## 十八、易错使用提示

:::pitfalls
### 错误：把 preconnect 当成资源下载

**触发条件：** 已知 `/assets/report.js` 后只调用 `preconnect`，并立即尝试使用脚本。

**原因：** preconnect 面向服务器 origin，只提前建立连接，不获取具体资源。

**后果：** 业务仍要等待脚本请求，脚本全局变量也不会因为连接提示出现。

**错误示例：**

```tsx
preconnect('https://assets.example.com/report.js')
window.ReportRuntime.open()
```

**正确写法：**

```tsx
preload('https://assets.example.com/report.js', { as: 'script' })
```

**验证方式：** 查询 head 只能看到 `rel="preconnect"`；不得出现该脚本的 preload 或 script 节点。

### 错误：把 preload 当成执行或应用

**触发条件：** preload 后立即读取脚本全局变量或 stylesheet 的 computed style。

**原因：** preload 只提前获取，不执行 classic script，也不应用 stylesheet。

**后果：** 代码读取到未定义 API，页面样式仍保持原值。

**错误示例：**

```tsx
preload('/assets/theme.css', { as: 'style' })
document.body.dataset.theme = 'ready'
```

**正确写法：**

```tsx
preinit('/assets/theme.css', {
  as: 'style',
  precedence: 'medium',
})
```

**验证方式：** 分别检查 preload link 与 stylesheet link；只在 stylesheet 存在并加载后读取目标样式。

### 错误：用普通 preload 预载 ESM

**触发条件：** 对 ESM 调用 `preload(url, { as: 'script' })`，并声称模块已进入 module map。

**原因：** classic script preload 与 modulepreload 使用不同的浏览器处理模型。

**后果：** 最终 module script 可能无法复用预载结果，模块准备结论也不成立。

**错误示例：**

```tsx
preload('/assets/search-panel.js', { as: 'script' })
```

**正确写法：**

```tsx
preloadModule('/assets/search-panel.js', { as: 'script' })
```

**验证方式：** ESM 预载必须产生 `rel="modulepreload"`，不是 `rel="preload" as="script"`。

### 错误：认为 modulepreload 会执行模块

**触发条件：** modulepreload 节点出现后立即读取模块顶层副作用。

**原因：** modulepreload 可获取并准备模块，但不触发模块求值。

**后果：** 计数或全局状态仍为初始值，业务误判模块已经就绪。

**错误示例：**

```tsx
preloadModule('/assets/metrics.js', { as: 'script' })
console.log(window.metricsReady)
```

**正确写法：**

```tsx
preinitModule('/assets/metrics.js', { as: 'script' })
```

**验证方式：** modulepreload 阶段执行计数应为零；module script 执行后才变为一。

### 错误：用第二次调用更新 options

**触发条件：** 先用 low 预载，随后对同一身份改成 high，期待已有节点更新。

**原因：** 等价调用用于去重，不是属性更新；固定客户端保留首次有效声明。

**后果：** DOM 仍使用首次优先级或 CORS 模式，调用点之间的意图冲突被隐藏。

**错误示例：**

```tsx
preload('/assets/chart.js', { as: 'script', fetchPriority: 'low' })
preload('/assets/chart.js', { as: 'script', fetchPriority: 'high' })
```

**正确写法：**

```tsx
const chartPreloadOptions = {
  as: 'script' as const,
  fetchPriority: 'high' as const,
}
preload('/assets/chart.js', chartPreloadOptions)
```

**验证方式：** 读取唯一 preload 节点的 `fetchpriority`；所有调用点应使用同一个 options 常量。

### 错误：同 href 混用 classic 与 module

**触发条件：** 同一 `/widget.js` 先按 classic 预载，后按 ESM 预初始化。

**原因：** 两种脚本的浏览器语义不同，固定客户端的最终资源身份还可能围绕同一 src 协作。

**后果：** 先到声明可能决定实际形态，客户端与服务端观察也可能不同。

**错误示例：**

```tsx
preload('/widget.js', { as: 'script' })
preinitModule('/widget.js', { as: 'script' })
```

**正确写法：**

```tsx
preload('/widget-classic.js', { as: 'script' })
preinitModule('/widget-module.js', { as: 'script' })
```

**验证方式：** 为每个 URL 建立资源形态清单，确保同一地址只出现 classic 或 module 一种调用族。

### 错误：省略 options 只因为 TypeScript 通过

**触发条件：** 当前类型允许调用 `preload('/theme.css')`，于是省略 `as`。

**原因：** 类型声明的可选性比 Reference 和固定运行时的有效调用条件更宽。

**后果：** 开发运行时发出警告并忽略调用，不会建立有效资源节点。

**错误示例：**

```tsx
preload('/theme.css')
preinit('/theme.css')
```

**正确写法：**

```tsx
preload('/theme.css', { as: 'style' })
preinit('/theme.css', { as: 'style', precedence: 'medium' })
```

**验证方式：** 除类型检查外，还要查询目标 link，并确认开发控制台没有参数警告。

### 错误：认为 Root unmount 会清除资源

**触发条件：** 卸载声明提示的组件后，期待 head 节点、脚本计数和样式归零。

**原因：** 这些状态属于 Document、资源 registry 或 JavaScript realm，不是普通 Root 子节点。

**后果：** 重挂时错误地等待第二次执行，或手工删除节点造成 DOM 与内部 registry 不一致。

**错误示例：**

```tsx
root.unmount()
document.querySelectorAll('link, script').forEach((node) => node.remove())
```

**正确写法：**

```tsx
root.unmount()
// 保留 Document 级资源；需要全新环境时销毁整个 iframe。
```

**验证方式：** Root 卸载前后分别记录节点数、执行数和 computed style；三者应保持。

### 错误：只把父 realm 的 Root 挂进 iframe

**触发条件：** 父页面先 import React DOM，再对 iframe container 调用 `createRoot`。

**原因：** 固定客户端使用 React DOM 模块求值时捕获的全局 Document，不从 Root container 推导。

**后果：** 资源提示可能污染父页面 head，隔离测试得到错误结论。

**错误示例：**

```tsx
const container = frame.contentDocument?.getElementById('root')
if (container) createRoot(container).render(<Fixture />)
```

**正确写法：**

```tsx
// iframe 的独立入口文件在自己的 realm 中 import react-dom/client 与 react-dom。
```

**验证方式：** 完整流程前后分别统计父页面和 iframe 的目标资源；父页面必须始终为零。

### 错误：用请求时序证明提示正确

**触发条件：** 只依据一次 Resource Timing、缓存命中或请求先后顺序判定 API 行为。

**原因：** 浏览器策略、缓存、网络、并发和运行顺序都会改变这些观察。

**后果：** 测试不稳定，并把提示错误写成固定性能保证。

**错误示例：**

```tsx
const firstRequest = performance.getEntriesByType('resource')[0]
// 第一条记录不等于 React 保证的最高优先级资源。
```

**正确写法：**

```tsx
const preloadCount = document.head.querySelectorAll('link[rel="preload"]').length
const executionCount = window.__RESOURCE_HINT_CLASSIC_RUNS__ ?? 0
```

**验证方式：** 用 DOM、执行计数和 computed style 建立主要证据；性能收益另做真实环境测量。
:::

## 十九、源码推导与适用场景

### 1. 固定版本事实

React DOM 公共 wrapper 校验 href 与 options，再把规范化参数交给当前 dispatcher。客户端 dispatcher
在模块求值时捕获全局 Document，并为连接提示、preload、stylesheet 与 script 维护不同的选择器或资源
身份。重复命中时不会把后续 options 当作普通 DOM 更新。

固定客户端把 preinit classic script 建立为 async script，把 preinitModule 建立为 async module script；
preinit stylesheet 进入 stylesheet 资源集合。官方测试覆盖参数警告、重复调用、首次属性和客户端/服务端
输出差异。

### 2. 课程推导

由这些事实可以得到三条工程规则：

1. URL、资源形态和安全属性应由单一配置拥有，避免多个调用点竞争首次声明。
2. 提前提示与真实就绪是两个状态；业务需要就绪时必须另有明确协议。
3. 文档级资源测试必须控制 Document 与 realm，不能只更换 React Root container。

### 3. 公共边界

内部 selector、registry、属性采用列表和服务端 flush 顺序不是应用 API。未来版本可以改变内部实现，只要
保留公开的资源提示语义。依赖固定实现的精细观察必须在升级 React DOM 时重新核验。

### 4. 适用场景

资源提示适合应用能提前知道关键 origin 或资源 URL，并能明确区分“只准备”和“立即生效”的场景，例如
进入报表前准备运行时、在确定导航前建立字体源连接，或在功能确认启用后预初始化可信脚本。

不适合的场景包括：URL 尚不确定、脚本来源不可信、需要 Promise 形式就绪、需要每次挂载重新执行、
需要随组件卸载撤销副作用，或真实框架已经拥有资源调度权。此时应使用承担相应合同的框架或加载层。

## 二十、练习

:::exercise
### 练习一：选择最弱且足够的提示

**要求：** 为“可能访问头像域名”“确定访问字体域名但未知文件”“已知字体 URL”“已知 ESM 但暂不执行”
“已知可信 ESM 且应立即执行”分别选择 API，并写出被排除的更强选项。

**验收：** 五个场景依次落在 DNS、连接、普通 preload、modulepreload 和 module preinit；每项说明最多
提前到哪一步。
:::

:::exercise
### 练习二：证明下载不等于执行或应用

**要求：** preload 一个增加 window 计数的 classic script，并 preload 一个设置 CSS 自定义属性的
stylesheet。只查询 head、计数和 computed style，不依赖请求时间。

**验收：** 两个 preload link 存在，脚本计数仍为零，CSS 自定义属性仍为初始值。
:::

:::exercise
### 练习三：区分 classic 与 module

**要求：** 对两个不同 URL 分别使用 `preload` / `preinit` 和 `preloadModule` / `preinitModule`，禁止同一
href 跨脚本形态复用。

**验收：** 两类 preload 阶段执行数都为零；对应 preinit 完成后各自恰好执行一次。
:::

:::exercise
### 练习四：验证首次声明

**要求：** 对同一 classic URL 连续两次 preload，第二次传冲突的 `fetchPriority` 与 `crossOrigin`；再
对另一 URL 调用 preload。不要用错误 integrity 制造差异。

**验收：** 同 URL 只有一个节点并保留首次属性；另一 URL 建立第二个节点。
:::

:::exercise
### 练习五：验证 Root 与 Document 生命周期

**要求：** 依次执行首次 preinit、Root unmount、同 Document 重建 Root、iframe 重建。每步记录节点数、
脚本计数、样式值和 Document 世代。

**验收：** 前三步资源与副作用保留且不重复；新 iframe 从零开始并可再次执行一次。
:::

:::exercise
### 练习六：解释服务端输出边界

**要求：** 说明为什么客户端 `document.head.querySelector()` 不能证明服务端是否发送过 preload，并同时
考虑 HTTP `Link` header、HTML 元素与 render context。

**验收：** 结论不承诺固定输出位置，也不把“没有最终 DOM 节点”误判成服务端调用无效。
:::

## 二十一、本节小结

- 只可能访问 origin 时用 `prefetchDNS`，确定访问但未知资源时用 `preconnect`。
- 已知 URL 且暂不生效时用 preload；ESM 必须使用 `preloadModule`。
- 允许立即生效时才用 preinit；classic/style 使用 `preinit`，ESM 使用 `preinitModule`。
- preload 不执行 classic script、不应用 stylesheet；modulepreload 不执行模块。
- `as`、CORS、SRI、nonce、referrer policy 和优先级必须与最终消费请求保持一致。
- 同一身份的后续调用不是更新；首次声明前就要统一 URL、形态与 options。
- 六个 API 返回 `void`，不提供 readiness Promise，也不把资源失败交给 Error Boundary。
- 客户端资源属于 Document 与 realm；Root unmount 不撤销节点或已发生副作用。
- 独立 iframe 必须在自身 realm 中加载 React DOM，才能真正隔离宿主 Document。
- 资源提示不保证浏览器采用、缓存命中、请求顺序或固定性能收益。

## 二十二、参考资料

- [React DOM resource preloading APIs](https://react.dev/reference/react-dom#resource-preloading-apis) - 六个 API 的入口、参数、返回值、调用位置与选择关系。
- [React 19 resource preloading support](https://react.dev/blog/2024/12/05/react-19#support-for-preloading-resources) - DNS、连接、下载和立即生效的能力阶梯。
- [React DOM 公共资源 API 实现](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/shared/ReactDOMFloat.js) - 参数校验、options 归一化与 dispatcher 调用。
- [React DOM 客户端资源实现](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js) - Document 作用域、HTML 映射、身份与首次属性。
- [React DOM 资源 API 官方测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMFloat-test.js) - 参数警告、重复调用和客户端/服务端行为。
- [`@types/react-dom@19.2.4`](https://unpkg.com/@types/react-dom@19.2.4/index.d.ts) - TypeScript 签名与 options 类型。
- [WHATWG preload](https://html.spec.whatwg.org/multipage/links.html#link-type-preload) - preload 目标类型与浏览器处理模型。
- [WHATWG modulepreload](https://html.spec.whatwg.org/multipage/links.html#link-type-modulepreload) - module map、依赖准备与执行边界。
- [MDN preload](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/preload) - `as`、CORS、MIME 与最终消费请求匹配。
- [React Error Boundary Reference](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) - Error Boundary 与异步资源错误的职责边界。
