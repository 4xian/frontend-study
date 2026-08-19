# 资源提示 API 研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.advanced.resource-hints`
- 标题：资源提示 API
- 教学层级：高级
- 前置课程：`react.core.learn.advanced.declarative-async-script-resource`
- 核验日期：`2026-08-19`
- 文档基线：React 官方文档 `19.2`
- 运行时基线：React / React DOM `19.2.8`
- 类型基线：`@types/react-dom` `19.2.4`
- 固定文档提交：`reactjs/react.dev@c7d6b700038c63d1aaf2c649af1aefe01ebbacac`
- 固定运行时提交：`facebook/react@1dd4ecbdabf826f527fc9a58c05ea70375b7d170`
- 合并来源：旧 planned 目标“资源连接预热”“资源 preload 发现”“资源 preinit 执行与应用”

本课只回答一条主线：先判断浏览器应提前做到哪一步，再选择足够且最弱的提示。只知道服务器时做
DNS 查询或建连；已经知道具体资源但暂不应生效时 preload；资源一旦可用就应执行脚本或应用样式时
preinit。Classic script 与 ESM 必须分别选择普通或 Module 变体（S1-S8）。

必须覆盖：

1. `prefetchDNS`、`preconnect`、`preload`、`preloadModule`、`preinit`、`preinitModule` 六个 API 的
   能力层级与选择条件。
2. 六个 API 的公开签名、返回值、关键 options，以及 React Reference、当前类型与固定运行时之间的
   张力。
3. 每个 API 在客户端对应的 HTML 元素，以及“连接、下载、解析/编译、执行、应用”五个阶段的边界。
4. `preload` 只下载而不执行 classic script、不应用 stylesheet；`preloadModule` 不执行模块。
5. `preinit` 对 classic script 与 stylesheet 的不同结果，以及 `preinitModule` 的模块执行结果。
6. 同一身份重复调用、首次有效声明保留、后续 options 不更新已有资源的合同。
7. 图片 preload 的 `imageSrcSet` / `imageSizes` 身份，以及普通资源的 `as`、`href` 边界。
8. preload 与 preinit 先后调用时，最终资源、提示节点、属性继承和服务端 flush 时机的边界。
9. 浏览器任意调用位置与 SSR/RSC 仅渲染上下文生效的差异。
10. 客户端固定实现采用全局 Document，而不是当前 React Root 的 `ownerDocument`；iframe Demo 必须在
    iframe 自己的 realm 中加载 React DOM 并调用 API。
11. Root 卸载、同 Document 重建 Root、销毁并重建 iframe Document 三种生命周期。
12. `crossOrigin`、`integrity`、`nonce`、`referrerPolicy`、`fetchPriority` 不是可随意改写的装饰属性。
13. 返回 `void`、无 Promise、资源失败不会自动进入 React Error Boundary 的失败边界。
14. Demo 只用同源、可控资源，以 DOM、脚本计数与 computed style 建立确定性证据。

明确排除：再次完整讲解 A21 stylesheet Resource 或 A22 async script Resource；把 preload 写成通用异步
加载器；HTTP 缓存、Service Worker、CDN、103 Early Hints、完整 Resource Timing 教程；网络协议、DNS、
TLS、QUIC 深入；RSC/Fizz 流式协议细节；框架专属 Metadata/Script/Font/Image API；路由预测、打包器
chunk 图、动态 import 教程；CSP、SRI、CORS 完整部署教程；第三方性能基准；ShadowRoot、多窗口产品
支持；以及任何“浏览器一定执行提示”“提示一定改善性能”“调用顺序就是请求顺序”的承诺。

## 调研方法与版本

1. 按仓库外部搜索顺位使用 Tavily 定位六个 React API Reference、React 19 发布说明、固定 React DOM
   源码与测试、WHATWG HTML 和 MDN 浏览器资料。候选结论全部回到官方文档、规范或项目源码核验，未
   切换到后续搜索服务。
2. 公共教学合同以 React `19.2` Reference 为准；文档措辞缺失或与类型有张力时，再用固定
   `react.dev` 提交保存证据（S1、S2）。
3. 客户端去重、首次属性、全局 Document 和跨 API 行为只作为 React DOM `19.2.8` 冻结实现观察，依据
   `ReactDOMFloat.js` 与客户端 dispatcher（S4、S5）。
4. SSR/RSC 的输出介质、资源分组与未 flush preload 折叠只作为固定服务端实现观察，不升级为未来版本
   的公共保证（S6）。
5. npm registry 中 `react-dom@19.2.8` 的 `gitHead` 是
   `1dd4ecbdabf826f527fc9a58c05ea70375b7d170`，与固定运行时源码一致（S11）。
6. HTML 规范承担 `dns-prefetch`、`preconnect`、`preload`、`modulepreload` 的浏览器语义；React 负责
   何时声明、如何去重及如何输出这些提示（S9、S10）。

## 关键精度结论（事实账本）

1. **选择顺序不是“越强越好”。** 只可能访问某个 origin 时用 `prefetchDNS`；确定会访问但未知具体
   资源时用 `preconnect`；已知 URL 且暂不应生效时用 preload；已知 URL 且应立即生效时才用 preinit
   （S1、S3）。
2. **连接提示面向 origin，资源提示面向具体 URL。** 把完整脚本 URL 传给 `preconnect` 虽仍是 URL，
   但课程统一传 `location.origin` 或明确服务器 origin，避免把路径误当连接身份（S1、S9）。
3. **preload 不等于使用资源。** `preload(..., {as: 'script'})` 不执行 classic script；
   `preload(..., {as: 'style'})` 不应用 stylesheet。浏览器只是提前获取并按目标类型缓存（S1、S9、S10）。
4. **modulepreload 也不等于执行。** 浏览器会获取模块，把结果放入当前 Document 的 module map，并可
   提前解析和编译；模块真正执行仍需要 module script、import 或 `preinitModule`（S1、S9、S10）。
5. **preinit 会产生真实副作用。** `as: 'script'` 建立 async classic script 并在可用时执行；
   `as: 'style'` 建立 stylesheet 并应用；`preinitModule` 建立并执行 module script（S1、S5）。
6. **六个 API 都返回 `void`。** 没有 readiness Promise，也不能 `await preload(...)` 判断下载完成。
   浏览器加载/执行错误不会自动变成 Error Boundary 可捕获的渲染异常（S1、S12）。
7. **重复调用不是更新 API。** 同一身份首次有效调用建立资源；后续等价调用不会用新的
   `fetchPriority`、`crossOrigin`、`integrity` 或其他 options 更新已有节点（S1、S5、S7）。
8. **preconnect 的当前身份包含凭据模式。** 固定客户端把无 `crossOrigin`、匿名模式
   (`anonymous` / `''`) 和 `use-credentials` 视为可共存的三类连接提示；React Reference 的“同一
   server 只一次”是更高层的简化描述（S1、S4、S5）。
9. **preload 的身份不是所有 options 的笛卡尔积。** 图片有 `imageSrcSet` 时按 srcset 与 sizes 区分；
   固定客户端对普通 preload 使用 `as + href`，其他 options 采用首次声明（S1、S5）。
10. **同一 href 不应混用 classic 与 module 形态。** 固定客户端的 classic/module script 资源共享 src
    key，先到者可能决定实际形态；固定服务端却分别记录两类资源。课程要求一个 href 永远对应一种脚本
    形态（S5、S6）。
11. **preload 到 preinit 不是 DOM 节点原位升级。** 客户端通常保留 preload link，再建立最终 script 或
    stylesheet；服务端尚未 flush 的 preload 可以被抑制。只能继承实现明确采用的部分属性（S5、S6）。
12. **调用位置的客户端与服务端规则不同。** 浏览器中可在 render、Effect、事件处理器等位置调用；
    SSR/RSC 只有组件 render 或源自 render 的 async context 生效，其他调用被忽略（S1、S6）。
13. **服务端不保证出现可查询的 head 节点。** 固定实现可把提示写入 HTTP `Link` header，也可输出 HTML
    元素；因此客户端 DOM 数量不能反推服务端是否发过提示（S6）。
14. **这些 API 的客户端作用域不是 React Root。** 固定客户端在 React DOM 模块求值时捕获全局
    `document`；把父页面已加载的 React Root 挂到 iframe body，不会自动把提示切到 iframe head（S5）。
15. **Root 与 Document 是两层生命周期。** Root unmount 不清除这些 Document 级节点或已发生的脚本/
    样式副作用；同 Document 重建 Root 仍复用；销毁 iframe 才同时销毁节点、registry、module map 与
    JavaScript realm（S5、S7）。

## 固定来源表

| 编号 | 一手来源 | 版本固定 | 本课采用的事实 |
| --- | --- | --- | --- |
| S1 | [prefetchDNS](https://react.dev/reference/react-dom/prefetchDNS)、[preconnect](https://react.dev/reference/react-dom/preconnect)、[preload](https://react.dev/reference/react-dom/preload)、[preloadModule](https://react.dev/reference/react-dom/preloadModule)、[preinit](https://react.dev/reference/react-dom/preinit)、[preinitModule](https://react.dev/reference/react-dom/preinitModule) | React DOM 文档 `19.2` | 六 API 的目的、参数、返回值、重复调用、调用位置与选择建议。 |
| S2 | [固定六 API Reference 目录](https://github.com/reactjs/react.dev/tree/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom) | `react.dev@c7d6b700...` | 防止 live Reference 漂移；核对 options 必填措辞和示例。 |
| S3 | [React 19：Support for preloading resources](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/blog/2024/12/05/react-19.md#support-for-preloading-resources) | React `19` stable 固定提交 | “可能不请求 / 确定请求但未知资源 / 已知资源 / 立即生效”的能力层级。 |
| S4 | [`ReactDOMFloat.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/shared/ReactDOMFloat.js#L24-L333) | React DOM `19.2.8` | 参数校验、options 归一化、Module 默认值、preloadModule nonce 转发缺口。 |
| S5 | [客户端资源 dispatcher](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js#L4571-L5015) / [preload 属性采用](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js#L5523-L5544) | React DOM `19.2.8` | 全局 Document、DOM 映射、身份 key、首次属性、preload 到最终资源的有限属性采用。 |
| S6 | [服务端六 API](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/server/ReactFizzConfigDOM.js#L6195-L6792) / [`Link` header 序列化](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/server/ReactFizzConfigDOM.js#L6873-L6936) | React DOM `19.2.8` | render context、header/元素输出、classic/module 分组、未 flush preload 折叠与凭据继承。 |
| S7 | [`ReactDOMFloat-test.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMFloat-test.js) | React DOM `19.2.8` | 参数警告、客户端/服务端元素、重复调用、首次属性及 preload/preinit 组合的官方回归证据。 |
| S8 | [`@types/react-dom@19.2.4`](https://unpkg.com/@types/react-dom@19.2.4/index.d.ts) | npm `19.2.4` | TypeScript options、`RequestDestination` 张力和可选参数声明。 |
| S9 | [WHATWG preload](https://html.spec.whatwg.org/multipage/links.html#link-type-preload)、[modulepreload](https://html.spec.whatwg.org/multipage/links.html#link-type-modulepreload) | HTML Living Standard，核验于 `2026-08-19` | preload 目标类型匹配、module map 与 modulepreload 的处理模型。 |
| S10 | [MDN preload](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/preload)、[modulepreload](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/modulepreload)、[preconnect](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/preconnect)、[dns-prefetch](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/dns-prefetch) | MDN，核验于 `2026-08-19` | 浏览器阶段解释、模块预处理、跨域属性匹配和过量提示成本。 |
| S11 | [`react-dom@19.2.8` npm 元数据](https://registry.npmjs.org/react-dom/19.2.8) | npm `19.2.8` | 发布包 `gitHead` 与固定运行时提交一致。 |
| S12 | [React Error Boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) | React 文档 `19.2` | Error Boundary 不捕获事件处理器或一般异步代码错误；资源网络失败不是渲染异常通道。 |

## 六 API 选择矩阵

| 已知信息与目标 | 选择 | 浏览器最多提前到哪一步 | 不会替你做什么 |
| --- | --- | --- | --- |
| 可能访问某服务器，但不确定是否发请求 | `prefetchDNS(origin)` | DNS 解析 | 不建完整连接，不下载资源 |
| 确定会访问某服务器，但还不知道具体资源 | `preconnect(origin)` | DNS、连接与必要协商 | 不下载具体资源 |
| 已知 classic script、style、font、image 等 URL，只想提前下载 | `preload(href, options)` | 按 `as` 获取并缓存 | 不执行 script，不应用 style |
| 已知 ESM URL，只想提前准备 | `preloadModule(href, options)` | 获取、module map、可解析/编译 | 不执行模块 |
| 已知 classic script，下载后应立即执行 | `preinit(href, {as: 'script'})` | 下载并执行 | 不变成 module script |
| 已知 stylesheet，下载后应立即应用 | `preinit(href, {as: 'style', precedence})` | 下载、插入并应用 | 不等待业务组件再“启用” |
| 已知 ESM，下载后应立即执行 | `preinitModule(href, {as: 'script'})` | 下载并执行模块 | 不提供模块导出值或 Promise |

决策时先问“资源现在可以生效吗”，再问“classic 还是 module”。如果答案只是“可能以后用”，不得为了
看起来更快而选择 preinit；执行脚本和应用 stylesheet 都是可观察副作用（S1、S3）。

## 推荐调用形态

```tsx
import {
  preconnect,
  prefetchDNS,
  preinit,
  preinitModule,
  preload,
  preloadModule,
} from 'react-dom'

prefetchDNS('https://assets.example.com')
preconnect('https://assets.example.com', { crossOrigin: 'anonymous' })

preload('/course-map.js', { as: 'script', fetchPriority: 'high' })
preloadModule('/search-panel.js', { as: 'script' })

preinit('/course-map.js', { as: 'script' })
preinit('/course-theme.css', { as: 'style', precedence: 'medium' })
preinitModule('/search-panel.js', { as: 'script' })
```

课程示例统一显式写 `options` 与 `as`，即使当前 Module 运行时允许省略。连接提示使用 origin，资源提示
使用稳定、精确、同源 URL；一个脚本 URL 不在 classic 和 module API 间复用（S1、S4、S8）。

## 签名、options 与返回值

| API | Reference 主签名 | 关键 options | 返回 |
| --- | --- | --- | --- |
| `prefetchDNS` | `prefetchDNS(href)` | 无；DNS 不使用 `crossOrigin` | `void` |
| `preconnect` | `preconnect(href)` | 当前运行时/类型另支持 `crossOrigin` | `void` |
| `preload` | `preload(href, options)` | 必填 `as`；另有 `crossOrigin`、`referrerPolicy`、`integrity`、`type`、`nonce`、`fetchPriority`、图片 options；当前类型/运行时另有 `media` | `void` |
| `preloadModule` | `preloadModule(href, options)` | Reference 要求 `as: 'script'`；另有 `crossOrigin`、`integrity`、`nonce` | `void` |
| `preinit` | `preinit(href, options)` | 必填 `as: 'script' | 'style'`；style 要 `precedence`；另有 `crossOrigin`、`integrity`、`nonce`、`fetchPriority` | `void` |
| `preinitModule` | `preinitModule(href, options)` | Reference 要求 `as: 'script'`；另有 `crossOrigin`、`integrity`、`nonce` | `void` |

### preload 的 as 与专属属性

Reference 列出的 `as` 包括 `audio`、`document`、`embed`、`fetch`、`font`、`image`、`object`、
`script`、`style`、`track`、`video`、`worker`。`as: 'fetch'` 时 Reference 要求提供 `crossOrigin`；图片
才使用 `imageSrcSet` 和 `imageSizes`。`type` 应描述真实 MIME，`as`、CORS 模式和最终消费请求不匹配
可能让浏览器无法复用预载结果（S1、S9、S10）。

### preinit stylesheet 的 precedence

Reference 把 stylesheet 的 `precedence` 写成必填，并列出 `reset`、`low`、`medium`、`high`。固定运行时
和 `@types/react-dom` 接受任意字符串，省略时内部回退到 `default`。正文应教授 Reference 合同并显式
传入；`default` 只用于解释固定实现容忍度，不作为推荐省略理由（S1、S4、S5、S8）。

## React 与 HTML 的映射

| React 调用 | 固定客户端产生或复用的 HTML | 下载 | 执行 / 应用 |
| --- | --- | ---: | --- |
| `prefetchDNS(origin)` | `<link rel="dns-prefetch" href="...">` | 否 | 否 |
| `preconnect(origin)` | `<link rel="preconnect" href="...">` | 否 | 否 |
| `preload(url, {as: 'script'})` | `<link rel="preload" as="script" href="...">` | 是 | classic script 不执行 |
| `preload(url, {as: 'style'})` | `<link rel="preload" as="style" href="...">` | 是 | stylesheet 不应用 |
| `preloadModule(url, {as: 'script'})` | `<link rel="modulepreload" href="...">` | 是 | module 不执行 |
| `preinit(url, {as: 'script'})` | `<script async src="..."></script>` | 是 | classic script 执行 |
| `preinit(url, {as: 'style', precedence})` | `<link rel="stylesheet" href="..." data-precedence="...">` | 是 | stylesheet 应用 |
| `preinitModule(url, {as: 'script'})` | `<script type="module" async src="..."></script>` | 是 | module 执行 |

`preconnect` 与 `prefetchDNS` 的 DOM 只能证明声明存在，不能在同源 localhost Demo 中证明实际性能收益。
同理，preload link 存在只能证明 React 声明了提示；是否发请求、何时完成、是否命中缓存仍由浏览器和
网络环境决定（S5、S9、S10）。

## 资源身份与首次声明

### 公共合同与固定实现必须分层

React Reference 对重复调用给出面向使用者的合同：同 server 的连接提示等同一次；同 href 的
Module/preinit 调用等同一次；`preload` 通常按 href，图片另考虑 `imageSrcSet` 和 `imageSizes`（S1）。

固定 `19.2.8` 客户端为了与最终 Resource 协作，使用更具体的内部 key（S5）：

| 资源族 | 固定客户端身份 | 结论 |
| --- | --- | --- |
| DNS | `rel + 精确 href` | 同 href 一个 dns-prefetch |
| Preconnect | `rel + 精确 href + 归一化 crossOrigin` | 无 CORS、anonymous/空串、use-credentials 可共存 |
| 普通 preload | `as + 精确 href` | 同 href 不同 as 当前可分组；课程仍禁止含糊复用 |
| 图片 preload，无 srcset | `as=image + href` | href 是候选身份 |
| 图片 preload，有 srcset | `as=image + imageSrcSet + imageSizes` | 固定实现省略 href 选择器，srcset/sizes 决定候选 |
| Module preload | `as + href`，script 等映射到 script key | 与最终 module script 协作 |
| Stylesheet preinit | stylesheet 资源族的精确 href key | precedence 和安全属性不参与身份 |
| Classic / module script preinit | 客户端共享精确 src key | 同 src 混用形态会先到者获胜 |

身份比较基于传入的精确字符串，不应依赖 `/asset.js`、`./asset.js` 与绝对 URL 最终指向同一网络资源就
自动去重。课程和 Demo 始终复用完全相同的 href 字符串（S5）。

### 首次声明合同

```tsx
preload('/course-map.js', {
  as: 'script',
  crossOrigin: 'anonymous',
  fetchPriority: 'high',
})

preload('/course-map.js', {
  as: 'script',
  crossOrigin: 'use-credentials',
  fetchPriority: 'low',
})
```

固定客户端第二次调用命中同一 script preload key，不会更新第一个节点。Demo 可断言节点数仍为 `1`，
`crossOrigin` 与 `fetchPriority` 仍为首次值。不要用冲突的 `integrity` 做演示：错误 SRI 会改变资源是否
可用，把“首次声明”与“安全校验失败”混成一个问题（S5、S7）。

生产代码应在同一资源的所有调用点共享 URL、资源类型、CORS、SRI、nonce、referrer policy 与优先级
合同。React 去重不是冲突合并器，也不会判断哪一次 options 更正确。

## preload 与 preinit 的先后关系

### 先 preload，后 preinit

客户端固定实现通常保留已经插入的 preload link，同时新增最终资源：

- style preload 后 `preinit(..., {as: 'style'})` 新建 stylesheet link；
- classic script preload 后 `preinit(..., {as: 'script'})` 新建 async script；
- modulepreload 后 `preinitModule(...)` 新建 async module script；
- 最终资源可能采用 preload 中当前实现明确允许继承的属性，但不是原 preload 节点改 `rel` 或改标签。

客户端 stylesheet 当前只采用 API 可传入的 `crossOrigin`、`referrerPolicy`；script 当前采用
`crossOrigin`、`referrerPolicy`、`integrity`。最终 preinit 自己显式给出的值优先。不得把所有 preload
options 都写成“会自动升级继承”的公共合同（S5）。

服务端固定实现若同一 render pass 中的 preload 尚未 flush，后续 preinit 可以清空弱提示，只输出最终
资源；若 preload 已 flush，则二者可共存。它还只保存并采用有限的凭据信息（S6）。

### 先 preinit，后 preload

固定客户端若已找到最终 stylesheet/script，后续对应 preload 通常不再插入冗余 link。服务端资源
registry 也会抑制较弱提示。这个顺序规则有实现与 flush 条件，不应扩写成跨版本永久保证（S5、S6）。

### 冻结的教学规则

1. 如果最终就是立即执行或应用，直接 preinit，不先写一遍 preload 来“升级”。
2. 只有确实存在“先发现、稍后允许生效”的业务时序，才组合 preload 与 preinit。
3. 一个 href 固定一种资源类型和脚本形态。
4. 所有调用点使用一致的安全与请求属性。
5. 验收同时观察 hint 与最终资源，不把节点替换当成要求。

## 调用位置与服务端边界

### 浏览器

六个 API 都不是 Hook，可以在组件 render、Effect、事件处理器或普通浏览器代码中调用。它们不会返回
State，也不要求放进 Effect。何时调用应由“何时第一次知道这个资源”决定；越晚调用，提前提示的价值
通常越小（S1）。

render 可能重复执行，因此代码必须依赖 React 的资源去重，而不能在调用旁维护“render 只会一次”的
假设。开发环境 Strict Mode 或中断渲染都不应让 Demo 以调用次数作为节点数（S1、S5）。

### SSR 与 Server Components

服务端只有 render 或源自 render 的 async context 能关联当前请求的 resource state；普通模块初始化、
定时器或无渲染上下文调用会被忽略。六个 API 仍返回 `void`，不能用返回值确认服务端是否采用了提示
（S1、S6）。

固定服务端可按资源类型、优先级和 header 容量选择 HTTP `Link` header，也可把 link/script 输出到 HTML。
因此课程只讲“React 可把提示提前交给浏览器”，不承诺元素一定位于 `<head>`，也不把浏览器最终 DOM
作为服务端输出介质的唯一证据（S6）。

## Document、Root 与 realm

### 为什么普通 iframe Root 不够

固定客户端 dispatcher 在模块求值时执行：

```ts
const globalDocument = typeof document === 'undefined' ? null : document
```

后续六 API 从这个捕获值取 Document，而不是从当前 Fiber container 或 Root 的 `ownerDocument` 推导。
如果父页面先加载 React DOM，再把一个 Root 挂到同源 iframe 的 body，组件虽然渲染在 iframe，资源提示
仍可能写进父页面 head（S5）。

### Demo 的唯一可信隔离方式

1. iframe 加载独立、同源 fixture 页面，而不是只给父页面 React Root 换 container。
2. fixture 自己的脚本入口在 iframe realm 内 import React、React DOM client 与六个 API。
3. iframe 内建立自己的 Root，并在 iframe 内调用资源 API、读取自己的 head、window 计数与 computed
   style。
4. 父页面只通过 `postMessage` 发送动作并接收纯状态快照；iframe 代码不读取或写入父页面
   `window` / `document.head`。
5. 所有资源 URL 都是同源静态 fixture，不访问公网。

这样 React DOM 模块求值时捕获的是 iframe 的 `document`，module map、全局脚本副作用与 stylesheet
也都属于同一隔离 realm。

### 三种生命周期

| 操作 | Root | Document / head | registry / module map | 已执行脚本与样式 |
| --- | --- | --- | --- | --- |
| `root.unmount()` | 销毁 | 保留 | 保留 | 保留 |
| 同 Document `createRoot()` | 新 Root | 复用 | 复用 | 不应因等价调用重新执行 |
| 销毁 iframe | 一并销毁 | 销毁 | 销毁 | realm 与样式一并销毁 |
| 重建 iframe | 新 Root | 新 Document | 全新 | 首次 preinit 可再次执行 |

Root unmount 不是资源撤销 API。不要手动删除 React 管理的 link/script 来伪造 cleanup；固定 registry 仍
可能记住旧资源，造成 DOM 与内部记录失配（S5、S7）。

## TypeScript 与文档张力

| 张力 | 固定证据 | 本课写法 |
| --- | --- | --- |
| `preload` / `preinit` options | Reference 和运行时要求；`@types/react-dom@19.2.4` 却声明可选 | 始终传 options 与有效 `as` |
| `preloadModule` options / as | Reference 写必填且只允许 script；运行时允许省略，类型把 as 放宽为 `RequestDestination` | 显式 `{as: 'script'}`，本科不教其他 destination |
| `preinitModule` options / as | Reference 写必填；运行时与类型允许省略并默认 script | 显式 `{as: 'script'}` |
| `preinit` precedence | Reference 对 style 必填并列四个值；运行时/类型接受任意 string，缺省回退 `default` | 显式使用 Reference 值 |
| `preload.media` | 当前类型与运行时支持，Reference options 表未列 | 记录张力，不作为本科主示例 |
| `preloadModule.nonce` | Reference 与类型列出；固定公共 wrapper 没有把 nonce 转交 dispatcher | 不用它设计 CSP Demo，等待上游澄清 |

`preload('/x.js')` 和 `preinit('/x.js')` 在当前 `.d.ts` 下可能通过 TypeScript，但固定运行时开发构建会
警告并且不创建资源。类型可通过不等于运行时合同成立；正文应展示完整调用，不把这一差异交给学习者
踩坑（S1、S4、S8）。

## 失败、安全与性能边界

### 失败通道

- 六 API 返回 `void`，不能 `await`，也没有 React 级 onLoad/onError 参数（S1）。
- 网络失败、CORS、SRI、CSP 或脚本运行错误发生在浏览器资源通道，不是 API 调用返回的 rejected
  Promise（S1、S9）。
- Error Boundary 负责后代 render/lifecycle 等 React 错误，不负责一般事件处理器或异步资源错误；不要
  把 preload/preinit 当作 Error Boundary 数据源（S12）。
- Demo 只用自有脚本计数、computed style 与 DOM 快照判断状态；不解析 console warning 文案。

### 安全属性

`crossOrigin` 决定请求凭据模式，`integrity` 校验响应内容，`nonce` 配合 CSP，`referrerPolicy` 控制
referrer。它们必须与最终资源请求一致；React 的去重和有限属性采用不会替业务修复冲突配置（S1、S5、
S9）。`crossOrigin` 也不会授予服务器未提供的 CORS 权限。

preinit 会执行代码或应用 CSS，因此 href 只能来自可信、审查过的配置，不能直接接受用户输入。课程
fixture 全部同源且静态；不通过第三方 CDN、data URL 或 blob URL 绕开来源和 CSP 问题。

### 性能提示不是性能保证

- 浏览器可以根据资源压力、支持度和缓存状态调整或忽略提示（S9、S10）。
- 过多 preconnect 会占用连接和系统资源；只对确定即将使用的关键 origin 建连（S10）。
- 过多 preload 会竞争真正关键的下载，还可能触发 unused preload 诊断（S10）。
- `fetchPriority` 是提示，不是请求顺序锁；head 节点顺序也不是网络完成顺序（S3、S9）。
- 同源 Demo 的连接提示没有可宣称的实际加速，DOM 断言只证明 React 声明行为。
- 真实产品收益必须使用与生产一致的网络和性能测量另行验证，不从课程 fixture 外推。

## 完整易错项候选（最多十项）

### 1. 把 preconnect 当成资源下载

- **错误：** 已知 `/report.js` 后只调用 `preconnect('/report.js')`，期待脚本进入缓存。
- **原因：** preconnect 面向服务器连接，不获取具体资源。
- **修正：** 已知 URL 且暂不执行时用 `preload(..., {as: 'script'})`。

### 2. 把 preload 当成执行或应用

- **错误：** preload 后立即读取脚本全局变量或 stylesheet 的 computed style。
- **原因：** preload 只提前获取；classic script 不执行，stylesheet 不应用。
- **修正：** 需要立即生效时选择对应 preinit，并单独验证副作用。

### 3. 用 preload 预载 ESM

- **错误：** 对 ESM 调用 `preload(url, {as: 'script'})`，再声称模块已进入 module map。
- **原因：** classic script preload 与 modulepreload 是不同处理模型。
- **修正：** ESM 使用 `preloadModule(url, {as: 'script'})`。

### 4. 认为 modulepreload 会执行模块

- **错误：** modulepreload 节点出现后就期待模块计数加一。
- **原因：** 它提前获取并准备模块，但不触发模块求值。
- **修正：** 用 `preinitModule` 或真实 import/module script 才验证执行。

### 5. 用第二次调用更新 options

- **错误：** 先 `fetchPriority: 'low'`，随后用同 href 的 `'high'` 覆盖。
- **原因：** 同一身份是首次声明合同，后续等价调用不更新节点。
- **修正：** 在所有调用点统一 options，并在首次调用前决定优先级。

### 6. 同 href 混用 classic 与 module

- **错误：** 同一 `/widget.js` 先 preload classic，后 preinit module。
- **原因：** 固定客户端的 script 资源族共享 src key，客户端/服务端分组还不完全相同。
- **修正：** 一个 href 固定一种脚本形态；需要两种产物时使用不同 URL。

### 7. 省略 options 只因为 TypeScript 通过

- **错误：** 写 `preload('/theme.css')` 或 `preinit('/theme.css')`。
- **原因：** 当前类型把 options 声明为可选，但固定运行时会警告并忽略。
- **修正：** 遵守 Reference，显式传有效 `as` 和必要 options。

### 8. 认为 Root unmount 会清资源

- **错误：** unmount 后期待 head 节点、脚本全局变量和已应用样式归零。
- **原因：** 这些是 Document/realm 级资源，不是普通 Root 子节点。
- **修正：** 区分 Root 与 Document；需要全新环境时销毁并重建 iframe。

### 9. 在父 realm 加载 React DOM 后把 Root 挂进 iframe

- **错误：** 只把 container 换成 iframe body，就认为 API 写入 iframe head。
- **原因：** 固定客户端使用 React DOM 模块求值时捕获的全局 Document。
- **修正：** 在 iframe 自己的脚本 realm 中 import 并执行 React DOM。

### 10. 用请求时序证明提示正确

- **错误：** 把一次 Resource Timing、缓存命中或 unused preload warning 作为唯一 PASS 证据。
- **原因：** 网络、缓存、浏览器策略和测试运行顺序都会改变这些观察。
- **修正：** 主验收使用 DOM、执行计数与 computed style；性能收益另做生产测量。

## 六组练习

### 练习一：选择最弱且足够的提示

- **目标：** 给“可能访问头像域名”“确定访问字体域名但未知文件”“已知字体 URL”“已知 ESM 且暂不
  执行”“已知可信 ESM 且应立即执行”分别选 API。
- **要求：** 写出选择与被排除的更强 API；说明浏览器最多提前到哪一步。
- **通过证据：** 五个场景依次落在 DNS、连接、普通 preload、modulepreload、module preinit。

### 练习二：证明下载不等于执行或应用

- **目标：** preload 一个会增加 window 计数的 classic script，并 preload 一个设置 CSS 自定义属性的
  stylesheet。
- **要求：** 只查询 iframe head、window 计数和 computed style；不依赖请求时间。
- **通过证据：** 两个 preload link 存在，脚本计数仍为 `0`，CSS 自定义属性仍为初始值。

### 练习三：区分 classic 与 module

- **目标：** 对两个不同 URL 分别使用 `preload` / `preinit` 和 `preloadModule` / `preinitModule`。
- **要求：** 不让同一 href 跨形态复用；模块只写本地计数副作用。
- **通过证据：** 两类 preload 阶段计数均为 `0`；对应 preinit 后各自恰好为 `1`。

### 练习四：验证首次声明与身份

- **目标：** 对同一 classic URL 连续两次 preload，第二次传冲突的 `fetchPriority` 与 `crossOrigin`；再对
  另一 URL 调用 preload。
- **要求：** 不使用错误 integrity；记录精确 href。
- **通过证据：** 同 URL 只有一个节点并保留首次属性；另一 URL 建立第二个节点。

### 练习五：验证 Root 与 Document 生命周期

- **目标：** 依次执行首次 preinit、Root unmount、同 Document 重建 Root、iframe 重建。
- **要求：** 每步记录节点数、脚本计数、样式值和 Document 世代号。
- **通过证据：** 前三步资源与副作用保留且不重复；新 iframe 从零开始并可再次执行一次。

### 练习六：解释服务端输出边界

- **目标：** 阅读固定服务端源码，解释为什么 `document.head.querySelector()` 不能证明 SSR 是否发送过
  preload。
- **要求：** 同时指出 HTTP `Link` header、HTML 元素和 render context 三个变量。
- **通过证据：** 结论不承诺固定输出位置，也不把无 DOM 节点误判成服务端 API 无效。

## Demo 冻结合同

### 隔离架构

- 使用同源 iframe fixture；iframe 内部独立加载 React / React DOM `19.2.8` 与 Demo 入口。
- 六 API 只能由 iframe realm 调用；iframe 只读写自己的 `document.head`、`window` 计数和测试元素。
- 父页面通过 `postMessage` 发动作、收序列化快照，不直接执行资源 API，不读写 iframe 的资源节点。
- 连接提示使用 iframe 自己的 `location.origin`，只验证 DOM，不声称同源连接获得性能收益。
- classic 与 module 各用一个固定同源 URL；同一形态的 preload 和 preinit 复用精确 URL。
- stylesheet 使用固定同源 CSS URL，通过专属元素的 computed style 或 CSS 自定义属性验证应用。
- 所有静态资源都必须返回真实 MIME 与 `200`；不访问外网，不使用 data/blob URL。

### 资源与可观察副作用

| 资源 | preload 观察 | preinit 观察 |
| --- | --- | --- |
| Classic script | `link[rel="preload"][as="script"]` 为 1，`classicRuns=0` | async script 为 1，最终 `classicRuns=1` |
| ESM | `link[rel="modulepreload"]` 为 1，`moduleRuns=0` | async module script 为 1，最终 `moduleRuns=1` |
| Stylesheet | 本课主线可不单独 preload | stylesheet 为 1，目标 computed style 从初始值变为固定值 |
| DNS | `link[rel="dns-prefetch"]` 为 1 | 无执行状态 |
| Preconnect | `link[rel="preconnect"]` 为 1 | 无执行状态 |

### 精确状态表

| 状态 | Root | DNS / connect | preload / modulepreload | classic / module 执行 | style | 必须成立的证据 |
| --- | --- | --- | --- | --- | --- | --- |
| 新 Document | mounted | `0 / 0` | `0 / 0` | `0 / 0` | 初始 | head 无本科资源节点 |
| 连接提示 | mounted | `1 / 1` | `0 / 0` | `0 / 0` | 初始 | 重复调用后仍各 1 |
| 提前发现 | mounted | `1 / 1` | `1 / 1` | `0 / 0` | 初始 | 两类 link 存在但脚本都未执行 |
| 立即生效 | mounted | `1 / 1` | `1 / 1` | `1 / 1` | 已应用 | 最终 script/stylesheet 存在且副作用准确 |
| 重复调用 | mounted | `1 / 1` | `1 / 1` | `1 / 1` | 已应用 | 节点不增加，首次 fetchPriority/CORS 属性保留 |
| Root unmount | none | `1 / 1` | `1 / 1` | `1 / 1` | 已应用 | head、副作用和样式保留 |
| 同 Document 重建 Root | remounted | `1 / 1` | `1 / 1` | `1 / 1` | 已应用 | 再调用仍去重，不重新执行 |
| 重建 iframe | mounted | `0 / 0` | `0 / 0` | `0 / 0` | 初始 | 新世代 Document、registry、module map、realm |
| 新 iframe 再执行 | mounted | `1 / 1` | `1 / 1` | `1 / 1` | 已应用 | 新 realm 中可各执行一次 |

执行计数到 `1` 允许等待静态资源完成，但 PASS 不使用固定毫秒延迟。fixture 应在脚本副作用写入后主动
发布新快照，父页面只等待有界状态消息。连接提示和 preload 阶段不等待网络完成才显示 DOM 证据。

### 重复与首次属性场景

1. 第一次 classic preload 使用 `fetchPriority: 'high'`、`crossOrigin: 'anonymous'`。
2. 第二次同 href 使用 `fetchPriority: 'low'`、`crossOrigin: 'use-credentials'`。
3. 断言仍只有一个 classic preload link，DOM 属性保留第一组值。
4. preinit 使用与最终请求一致的固定 options；最终执行一次。
5. 不用冲突 integrity、CSP nonce 或跨域响应制造演示差异。

### 验收清单

- [ ] React DOM 模块在 iframe realm 中求值；父页面 head 在完整流程前后没有本科资源节点。
- [ ] DNS 与 preconnect 重复调用各只有一个相同身份节点。
- [ ] Classic preload 节点存在时 `classicRuns` 仍为 `0`。
- [ ] Modulepreload 节点存在时 `moduleRuns` 仍为 `0`。
- [ ] Classic preinit 最终只执行一次。
- [ ] Module preinit 最终只执行一次。
- [ ] Stylesheet preinit 后 computed style 或 CSS 自定义属性发生固定变化。
- [ ] 等价重复调用不增加节点，首次 fetchPriority/CORS 属性保留。
- [ ] Root unmount 后 head 节点、脚本副作用与应用样式保留。
- [ ] 同 Document 重建 Root 后仍去重且脚本不重新执行。
- [ ] 销毁并重建 iframe 后所有计数和节点归零，新 realm 可再次执行。
- [ ] 不以请求先后、缓存命中、Resource Timing、console warning 或 unused preload warning 作为唯一
  PASS 证据。
- [ ] 所有资源同源且无公网请求；静态脚本、模块和 CSS 均为真实运行文件。

## 正文覆盖与排除边界

正文应覆盖：

1. 从 DNS 到执行/应用的能力阶梯，而不是按 API 名逐篇孤立罗列。
2. 六 API 的推荐完整签名、options 表和 TypeScript 张力。
3. Classic、module、style 的阶段对照与 HTML 映射。
4. 精确身份、首次声明、同 href 脚本形态稳定性。
5. preload/preinit 的组合时序与有限属性采用。
6. 浏览器/服务端调用位置、`void` 与失败通道。
7. Root、Document、realm 的生命周期和可信 iframe 隔离。
8. 安全属性一致性与“提示不保证性能”的边界。
9. 恰好十个完整易错项与六组结构化练习。

正文不得：

- 重复 A21 的 stylesheet precedence/加载协调完整课程或 A22 的 script Resource 资格课程；
- 把 React DOM 固定源码的内部 key、flush 优先级或属性采用写成公共永久保证；
- 教授 `preloadModule` 的非 script `RequestDestination` 扩展；
- 用 `preloadModule.nonce` 设计 CSP 成功示例，直到文档/固定 wrapper 张力得到上游澄清；
- 承诺 preload 下载完成、命中缓存、一定复用或一定提升指标；
- 让学习者正文出现课号、计划、路线、任务、批次、Gate、复审、完成度或篇幅叙事；
- 访问父页面 head/window、外部 CDN 或不受控第三方资源；
- 把手工删除 React 管理节点当作 cleanup。

## 未决歧义与后续编写决定

1. **`preloadModule.nonce`：** Reference 和 `@types/react-dom@19.2.4` 暴露 `nonce`，但固定
   `ReactDOMFloat.js` 的 `preloadModule` wrapper 未把它传给 dispatcher。正文只记录张力，不提供依赖
   该属性的 CSP 示例（S1、S4、S8）。
2. **Module options 必填性：** Reference 要求 options/`as`，固定运行时允许省略；课程采用显式
   `{as: 'script'}`，不把简写当主线（S1、S4、S8）。
3. **`preload` 等价措辞：** Reference 主要按 href 描述，固定客户端对普通资源实际按 `as + href`；课程
   要求同一 href 固定资源类型，不让学习者依赖差异（S1、S5）。
4. **服务端输出位置：** header 容量、资源类型与 flush 时机会影响 `Link` header 或 HTML 输出；正文只
   保留“React 可提前发送提示”的公共层结论（S6）。
5. **跨 API 折叠：** 未 flush preload 的抑制和有限凭据采用是固定实现细节；Demo 允许 preload link 与
   最终资源共存，不把“自动升级替换”设为验收条件（S5、S6）。

以上歧义不阻塞本科正文与 Demo：推荐完整显式调用、稳定资源身份、同源隔离和 DOM/副作用双证据已经
足以形成确定性教学合同。
