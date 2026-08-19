---
id: react.core.learn.advanced.declarative-async-script-resource
type: lesson
title: 声明式异步脚本资源
summary: 用 src 与 async 声明可提升、按地址去重并只在插入时执行一次的外部脚本资源。
domain: frontend
technology: react
module: core
stage: advanced
level: advanced
estimatedMinutes: 150
prerequisites:
  - react.core.learn.advanced.declarative-stylesheet-resources
related:
  - react.core.learn.advanced.document-metadata-hoisting
  - react.core.learn.advanced.hydrate-root-markup-identity
  - react.core.learn.basics.react-root-lifecycle
tags:
  - React
  - React DOM
  - script
  - async
  - src
  - Resource
appliesTo: React DOM 19.2
verifiedAt: 2026-08-18
objectives:
  - 能判断 script 声明何时进入 React 特殊资源路径，何时仍是普通宿主元素。
  - 能解释脚本 Resource 的 head 放置、精确 src 身份、同地址去重与一次执行合同。
  - 能预测同 src 属性变化、React key 变化、新 src 和多个 owner 对 DOM 与执行次数的影响。
  - 能区分组件提交、脚本下载、async 执行、全局 API 就绪和 Suspense 等待。
  - 能处理事件回调、inline script、脚本类型、安全属性和卸载保留的边界。
  - 能在真实隔离文档中分别验证 owner 数、DOM 数、执行数与 Root 生命周期。
recap:
  - 非空 src、async 为 true、没有 onLoad/onError 且没有 itemProp 时，外部 script 才进入特殊资源路径。
  - React 把新脚本 Resource 放入 owner document 的 head，并按精确 src 字符串复用。
  - 同 src 的多个声明共享一个 DOM 节点；React key、type、安全属性和 data 属性不参与资源身份。
  - 同 src 的后续属性变化被忽略，首次声明必须提供完整且一致的加载合同。
  - 新 src 建立新 Resource，旧节点不会因为最后一个 owner 消失而保证删除。
  - Script Resource 不等待加载后才提交组件，也不为多个 async 脚本建立执行顺序。
  - onLoad/onError 会退出特殊资源路径，不能同时依赖事件回调和 React 的脚本 Resource 去重。
  - inline script 不提升、不去重；普通客户端 script 与 Resource script 的创建和执行路径不同。
  - Root 卸载不会撤销脚本已经产生的全局状态、监听器或其他副作用。
sources:
  - title: React script Reference
    url: https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/components/script.md
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - script props、特殊资源资格、src 去重、属性更新、卸载和 inline script 边界
  - title: React 19 async scripts
    url: https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/blog/2024/12/05/react-19.md
    sourceType: official-reference
    appliesTo: React 19
    claims:
      - 任意组件声明、异步执行、跨渲染环境去重与 head 放置
  - title: React DOM 19.2.8 script resource implementation
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js
    sourceType: source-code
    appliesTo: React DOM 19.2.8
    claims:
      - 资源资格、src key、已有节点复用、head 插入和释放边界
  - title: React DOM 19.2.8 resource commit implementation
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberCommitWork.js
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - Resource acquire、release、替换和卸载行为
  - title: React DOM 19.2.8 script resource tests
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMFloat-test.js
    sourceType: official-test
    appliesTo: React DOM 19.2.8
    claims:
      - 同 src 属性固定、事件回调退出、head 放置、卸载保留和上下文边界
  - title: WHATWG script element
    url: https://html.spec.whatwg.org/multipage/scripting.html#the-script-element
    sourceType: specification
    appliesTo: HTML Living Standard
    claims:
      - 外部与内联脚本、async 获取和执行、already-started 与内容模型
  - title: React DOM server script serialization
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/server/ReactFizzConfigDOM.js
    sourceType: source-code
    appliesTo: React DOM 19.2.8
    claims:
      - 服务端资源资格、脚本文本和公共输出边界
  - title: '@types/react 19.2.18 declarations'
    url: https://unpkg.com/@types/react@19.2.18/index.d.ts
    sourceType: source-code
    appliesTo: '@types/react 19.2.18'
    claims:
      - ScriptHTMLAttributes 的 async、src、type、CORS、SRI 和 referrerPolicy 类型
---

# 声明式异步脚本资源

## 一、学习目标

- 能判断 script 声明何时进入 React 特殊资源路径，何时仍是普通宿主元素。
- 能解释脚本 Resource 的 head 放置、精确 src 身份、同地址去重与一次执行合同。
- 能预测同 src 属性变化、React key 变化、新 src 和多个 owner 对 DOM 与执行次数的影响。
- 能区分组件提交、脚本下载、async 执行、全局 API 就绪和 Suspense 等待。
- 能处理事件回调、inline script、脚本类型、安全属性和卸载保留的边界。
- 能在真实隔离文档中分别验证 owner 数、DOM 数、执行数与 Root 生命周期。

## 二、为什么需要脚本资源

组件有时依赖浏览器外部脚本，例如地图运行时、支付控件或可视化引擎。把所有脚本固定写在入口 HTML
会造成两个问题：入口必须提前知道每个功能的依赖；即使用户从未进入对应功能，浏览器也可能下载和
执行脚本。

React 允许组件在依赖发生的位置声明外部异步脚本：

```tsx
/** 声明地图面板使用的外部运行时。 */
function MapRuntime() {
  return <script async={true} src="/scripts/map-runtime-v1.js" />
}
```

满足特殊资源条件后，这个元素不再只是组件容器中的普通 script。React 会把它作为文档级 Resource：

1. DOM 节点放入当前 Root 所属文档的 `head`。
2. 相同 `src` 的声明共用同一个 DOM 节点。
3. 浏览器只为这一个节点准备并执行脚本。
4. 组件移除后，不保证立刻删除已经建立的脚本节点。

这套能力解决的是脚本的声明、身份和复用，不负责判断脚本何时可供业务调用，也不负责撤销脚本副作用。

## 三、四个必须分开的对象

### 1. React owner

每个返回 `<script>` 的组件都是一个声明 owner。两个组件可以同时声明同一地址，因此 owner 数可能是
2，而最终 DOM 节点数仍是 1。owner 属于 React 树。

### 2. Script Resource

Resource 是 React 在当前文档中按 `src` 识别的共享身份。不同 Fiber、不同组件位置和不同 React `key`
都可以取得同一个 Resource。Resource 属于文档级注册表。

### 3. HTMLScriptElement

首次取得 Resource 时，React 创建或复用一个真实 `HTMLScriptElement`。新建节点通常进入
`ownerDocument.head`。这个节点属于浏览器 DOM。

### 4. 已执行的 JavaScript

浏览器准备并执行脚本后，脚本可能创建全局变量、注册事件监听器、启动任务或修改其他 DOM。脚本节点
是否仍有 React owner，和这些副作用是否仍存在，没有自动等价关系。

因此必须分别记录 owner 数、Resource DOM 数、执行次数和脚本产生的业务状态。只看其中一个数字无法
证明完整生命周期。

## 四、取得特殊资源资格

### 1. 推荐写法

```tsx
/** 声明一份可以安全移动和去重的外部脚本。 */
function FeatureRuntime() {
  return <script async={true} src="/scripts/feature-runtime-v3.js" />
}
```

JSX 简写 `async` 等价于 `async={true}`。显式写出 `true` 更容易和失去资格的 `async={false}` 对照。

### 2. 资格矩阵

| 条件 | 特殊资源结果 | 不满足时的边界 |
| --- | --- | --- |
| 位于 HTML namespace | 继续判断 | SVG 中的 script 不进入同一资源路径 |
| 没有 `itemProp` | 可以提升 | `itemProp` 表示条目级内容，保留局部语义 |
| `src` 是非空字符串 | 建立资源身份 | 缺失、空字符串或非字符串不建立 Resource |
| `async={true}` | 允许移动到 head | false、缺失或只有 defer 不进入特殊路径 |
| 没有 `onLoad` | React 管理 Resource | 传入回调后按普通 script 处理 |
| 没有 `onError` | React 管理 Resource | 传入回调后按普通 script 处理 |
| 不在 `noscript` 上下文 | 可按脚本处理 | noscript 内容不建立同类 Resource |

`async="false"` 不是关闭异步的正确 HTML。`async` 是布尔属性，只要属性存在就表示启用；TypeScript 也
把 React 的 `async` 限定为 boolean。需要关闭时应使用 `async={false}`，但该写法会退出本节的特殊资源
路径。

### 3. 资格是一个整体

仅有 `src` 不够，仅有 `async` 也不够。以下声明都不是同一种 Script Resource：

```tsx
<script src="/scripts/runtime.js" />
<script defer={true} src="/scripts/runtime.js" />
<script async={false} src="/scripts/runtime.js" />
<script async={true} src="/scripts/runtime.js" onLoad={handleLoad} />
<script async={true} src="/scripts/runtime.js" itemProp="script" />
```

这些元素仍受 React 和 HTML 的普通宿主规则约束，不能套用后文的 head 放置、按 src 去重和卸载保留
结论。

## 五、head 放置与组件位置

### 1. 新 Resource 的放置

组件可以位于页面深层：

```tsx
/** 显示依赖图表脚本的报告。 */
function RevenueReport() {
  return (
    <section>
      <script async={true} src="/scripts/chart-runtime.js" />
      <h2>营收报告</h2>
    </section>
  )
}
```

特殊 script 不留在这个 `section` 中。React 在首次 acquire 时创建脚本节点，把它追加到当前 Root 对应
文档的 `head`。组件树位置表达依赖所有权，DOM head 表达文档级资源位置。

### 2. owner document

放置目标由 React Root 所在的文档决定，不应写死为全局 `window.document`。若 Root 挂在同源 iframe
内部，Resource 进入 iframe 的 head，并在 iframe 的 JavaScript realm 中执行。这个边界可以隔离脚本
实验，也能避免修改宿主应用的全局对象。

### 3. 已有节点的复用

若同一文档已经存在精确匹配的 `script[async][src="..."]`，React 可能采用现有节点，而不是再创建一份。
采用不等于重放：已经执行过的脚本不会因为 React 开始引用它而重新执行，现有节点也不保证由 React
移动到新位置。

## 六、src 是唯一资源身份

### 1. 精确字符串匹配

React 使用传入的 `src` 字符串建立资源 key。它不读取响应内容，也不把语义等价的 URL 自动合并：

| 声明组合 | 是否同一身份 | 原因 |
| --- | --- | --- |
| 两次 `/scripts/runtime-v1.js` | 是 | src 字符串相同 |
| `/scripts/runtime-v1.js` 与 `/scripts/runtime-v2.js` | 否 | 地址不同 |
| `/scripts/runtime.js` 与 `/scripts/runtime.js?build=2` | 否 | query 属于字符串身份 |
| `./runtime.js` 与 `/scripts/runtime.js` | 不应依赖去重 | 输入字符串不同 |
| 同 src、不同 React `key` | 是 | key 只参与 Fiber 对账 |

即使两个 URL 最终返回完全相同的字节，只要 `src` 字符串不同，React 就会把它们视为两个 Resource。

### 2. 不参与身份的属性

`type`、`crossOrigin`、`integrity`、`nonce`、`fetchPriority`、`referrerPolicy`、`noModule`、`data-*` 和
React `key` 都不参与 Resource key。它们可以改变浏览器请求或执行合同，却不能为同 src 建立第二份
Resource。

### 3. 同一 src 必须表示同一合同

一个 src 应始终对应同一种脚本形态、相同安全属性和相同资源内容。不要让相同地址在一处表示 classic
script，在另一处表示 module script；也不要让不同组件为同一地址提供冲突的 nonce、integrity 或 CORS
设置。React 不会替调用方合并这些冲突。

## 七、去重与一次执行

### 1. 多个 owner 共用一个节点

```tsx
/** 声明共享的地图运行时。 */
function SharedMapRuntime() {
  return <script async={true} src="/scripts/map-runtime.js" />
}

/** 显示两个都依赖同一运行时的功能。 */
function Dashboard() {
  return (
    <>
      <section>
        <SharedMapRuntime />
        <h2>门店地图</h2>
      </section>
      <section>
        <SharedMapRuntime />
        <h2>配送地图</h2>
      </section>
    </>
  )
}
```

这里有两个 Fiber owner，但同一 document 中只有一个匹配 src 的 head script。浏览器只为这个节点准备
一次脚本。

### 2. “一次”有明确范围

“执行一次”表示：同一个 document 中，同一精确 src 的特殊 Resource 只插入一个可执行节点。它不表示：

- 脚本内部不会重复调用自己的函数；
- 脚本不会再动态加载其他资源；
- 销毁 document 后在新 document 中仍不执行；
- 不同 src、query 或 iframe 会共享执行状态；
- 浏览器缓存命中会跳过 JavaScript 执行。

缓存可以减少网络传输，但新 document 中的新 script 节点仍会执行已经取得的代码。

### 3. DOM 数和执行数都要验证

一个 DOM 节点不能单独证明脚本成功执行；执行计数为 1 也不能单独证明 React 没有创建重复节点。可靠
验证同时检查：

1. head 中精确 src 的 script 数量为 1；
2. iframe window 中由脚本自己维护的版本计数为 1；
3. 重复 owner 数可以是 2；
4. 组件内容可以先于执行计数变化而提交。

## 八、同 src 的属性是首次声明合同

### 1. 后续 props 不是 State

首次声明创建 Resource 后，同 src 的后续 props 更新不会像普通 DOM 元素那样写回节点：

```tsx
/** 根据输入声明同一个地址，但尝试改变资源属性。 */
function RuntimeScript({ owner }: { owner: string }) {
  return <script async={true} src="/scripts/runtime.js" data-owner={owner} />
}
```

若第一次 `owner` 是 `first`，之后改成 `second`，DOM 仍可能保留 `data-owner="first"`。执行次数也不会
增加。`data-owner` 适合观察这个事实，不应参与业务配置。

### 2. React key 不能绕过去重

```tsx
<script key="first" async={true} src="/scripts/runtime.js" data-owner="first" />
<script key="second" async={true} src="/scripts/runtime.js" data-owner="second" />
```

两个 key 只帮助 React 区分两个 Fiber。文档级 Resource 仍按 src 合并，第二个 Fiber 不会建立第二个
script，也不会覆盖首份属性。

### 3. 安全属性必须在第一次就正确

`integrity`、`crossOrigin`、`nonce` 和 `referrerPolicy` 会影响浏览器是否允许请求或执行脚本。它们一旦
和某个 src 建立首份合同，就不能依赖后续 render 修复。版本发布、SRI 摘要或脚本类型改变时，应使用与
新内容匹配的新 src。

## 九、新 src 建立新资源

### 1. 资源版本进入地址

```tsx
const runtimeSources = {
  stable: '/scripts/runtime-v1.js',
  next: '/scripts/runtime-v2.js',
} as const

/** 声明选中的脚本发布版本。 */
function VersionedRuntime({ channel }: { channel: keyof typeof runtimeSources }) {
  return <script async={true} src={runtimeSources[channel]} />
}
```

从 v1 切到 v2 会建立第二个 Resource。浏览器为 v2 创建新的执行机会；v1 已经产生的副作用不会自动撤销。

### 2. 旧节点可能继续存在

当前组件不再声明 v1，只表示 v1 的 React owner 已经 release。公共合同不保证最后一个 owner 消失时
删除脚本；固定版本会保留旧节点。因此切换后可以同时看到 v1 和 v2 两个 head script。

### 3. 版本切换不是热替换协议

脚本不是 CSS 变量。两个版本可能同时留下全局符号、监听器和注册表，后执行的版本也不一定能安全覆盖
前一个版本。运行时升级是否允许同页完成，必须由脚本自身的兼容合同决定；React 只负责新 src 的资源
身份。

## 十、async 加载与执行

### 1. React 不等待脚本

Script Resource 没有 stylesheet Resource 那样的加载等待状态。React 可以先提交依赖组件，浏览器随后
才完成脚本下载和执行。以下顺序是合法的：

1. 组件内容已经出现在 DOM；
2. head 中已经出现 script；
3. 脚本仍在获取；
4. 稍后脚本执行并建立全局 API。

页面内容出现不等于脚本 API 已就绪。

### 2. 不触发 Suspense 等待

仅渲染 `<script async src>` 不会让当前组件自动 suspend，也不会让最近的 Suspense fallback 等待脚本。
脚本失败也不会自动进入 React Error Boundary。脚本加载状态属于浏览器资源过程，不是组件 render 中
抛出的 Promise 或错误。

### 3. 多个 async 脚本没有声明顺序保证

```tsx
<script async={true} src="/scripts/runtime.js" />
<script async={true} src="/scripts/plugin.js" />
```

这两个脚本可以并行获取，谁先可用谁就可能先执行。组件树顺序、head DOM 顺序和代码书写顺序都不能
表达 `plugin` 依赖 `runtime`。有依赖关系的脚本需要明确的模块或加载协议，不能靠两个 async 声明碰运气。

## 十一、就绪状态与事件退出边界

### 1. onLoad/onError 会改变资格

```tsx
/** 这是带加载回调的普通 script，不再是本节的特殊 Resource。 */
function ScriptWithLoadCallback({ onReady }: { onReady: () => void }) {
  return <script async={true} src="/scripts/runtime.js" onLoad={onReady} />
}
```

传入 React `onLoad` 或 `onError` 后，脚本退出特殊资源路径。此时不能再承诺 React 会把它提升到 head、
按 src 去重或在最后 owner 消失后保留。

### 2. 不要把回调当成无成本观察器

同一页面同时需要“React Resource 去重”和“React onLoad 回调”时，必须先承认两者在当前合同中互斥。
可以选择：

- 保留纯 Resource 声明，由脚本自身公开稳定的就绪状态或注册协议；
- 使用普通 script 回调，并由应用自己承担去重、重试和生命周期；
- 使用拥有明确脚本加载合同的框架或库。

本节只解释第一种 Resource 行为，不实现通用 loader。

### 3. 官方示例的阅读方法

官方 Reference 的属性与特殊行为说明明确把 `onLoad/onError` 列为退出条件；同页 Usage 示例又展示了
带 onLoad 的 async script，并在附近描述同 src 去重。精确判断应以特殊行为合同、当前实现和官方测试
共同支持的窄结论为准：带回调的元素不能套用纯 Resource 去重结论。

## 十二、脚本属性与安全合同

### 1. 常用属性

| 属性 | 浏览器职责 | Resource 身份 |
| --- | --- | --- |
| `src` | 指定外部脚本 URL | 唯一身份键 |
| `async` | 允许独立获取并在可用时执行 | 取得资格所必需 |
| `type` | classic、module 或其他脚本类型 | 不参与 key |
| `crossOrigin` | 控制 CORS 请求模式 | 不参与 key |
| `integrity` | 用摘要校验响应内容 | 不参与 key |
| `nonce` | 配合 CSP 允许当前脚本 | 不参与 key |
| `fetchPriority` | 向浏览器提供请求优先级提示 | 不参与 key |
| `referrerPolicy` | 控制请求携带的 referrer | 不参与 key |
| `noModule` | 为支持 module 的浏览器关闭回退脚本 | 不参与 key |

### 2. type 不参与去重

同一个 src 不能一处声明 `type="module"`，另一处省略 type 并期待两个节点。客户端 Resource key 只看
src；首份脚本种类会占用这个身份。classic 和 module 内容应使用清晰且不同的地址。

### 3. 只执行可信代码

外部脚本在目标 document 的权限范围内运行，可以读取同源 DOM、存储和全局对象。React 的声明式 API
不会验证脚本业务可信度，也不会替代 CSP、SRI、CORS 和供应链审查。安全属性必须和发布系统一起确定，
不能在脚本已经加载后补写。

## 十三、inline 与普通客户端 script

### 1. inline script 不进入资源路径

```tsx
/** 输出一段内联脚本文本。 */
function InlineFlag() {
  return <script>{'window.__inlineFlag = true'}</script>
}
```

inline script 没有外部 src，不提升到 head，也不按代码内容求 hash 去重。children 应是单一字符串。外部
src 和 inline children 表示两种脚本来源，不应混在同一个元素中。

### 2. dangerouslySetInnerHTML

原始脚本文本也可以通过 `dangerouslySetInnerHTML={{ __html: code }}` 提供，但不能同时再传 children。
普通 `innerHTML={code}` 不是 React 支持的脚本文本入口。原始 HTML 会绕过常规转义，需要调用方完全
信任内容。

### 3. 普通客户端 script 不是动态 loader

当前 React DOM 在客户端创建普通 Host script 时使用不会自动执行的惰性创建路径。`async={false}`、
仅 `defer`、带 `onLoad` 的普通节点或 inline 节点，不能拿来替代特殊 Resource 的执行实验。若要构建
通用脚本 loader，需要单独定义加载、错误、去重、取消和清理合同。

## 十四、owner、卸载与副作用

### 1. 删除 owner

删除一个重复声明只减少一个 owner。只要其他 owner 仍引用同 src，Resource 当然继续存在。删除最后一个
owner 后，公共合同仍要求调用方不要依赖节点立即删除。

### 2. Root unmount

`root.unmount()` 会结束当前 React Root，释放它持有的 Resource 引用并清空 Root 容器。固定版本中的
script Resource 节点仍留在 head，执行计数也不会回退。

### 3. 已执行副作用不自动撤销

即使浏览器或应用手动删除 script 元素，已经运行的代码也不会逆向执行。全局变量、事件监听器、计时器
和脚本创建的 DOM 需要脚本自己的 teardown API。React 既不知道这些副作用，也不会猜测清理方式。

### 4. 不要手动删除 React 管理的节点

React 的文档级注册表仍可能保存 Resource 和 DOM instance。手工调用 `script.remove()` 会让内部记录和
真实 DOM 失配，后续同 src owner 也未必重新创建节点。需要确定清空整个实验时，应销毁隔离 iframe
document，而不是逐个移除 Resource 节点。

## 十五、客户端与服务端边界

### 1. 客户端可观察合同

在干净的客户端 document 中可以稳定观察：新 Resource 进入 head、同 src 复用、首次 props 保留、新 src
新建、owner 与 Root 卸载后固定版本保留，以及每个静态 src 在该 document 中执行一次。

### 2. 服务端公共合同

React 19 的服务端渲染也可以从组件树收集合格 async scripts，去重后放入文档 head。客户端和服务端
共享“src 身份、异步无序、一次加载/执行”的公共模型，但输出时机和 hydration 细节由具体渲染环境决定。

### 3. 不能跨环境承诺的结果

无论客户端还是服务端，都不能仅凭 script 声明承诺：

- 组件提交前脚本已可用；
- 多个 async scripts 按声明顺序执行；
- 加载错误进入 Error Boundary；
- 卸载撤销脚本副作用；
- CSP、SRI、CORS 或缓存策略必然允许执行。

## 十六、TypeScript 合同

### 1. 属性类型

`ScriptHTMLAttributes<HTMLScriptElement>` 提供 `async?: boolean`、`src?: string`、`type?: string`、
`crossOrigin`、`integrity`、`nonce`、`fetchPriority`、`referrerPolicy` 和 `noModule` 等属性。类型能防止把
字符串误当作 async 布尔值，但不能证明 src 非空，也不能证明多个 owner 的属性一致。

### 2. 用只读配置固定首次合同

```tsx
const analyticsScript = {
  src: '/scripts/analytics-v4.js',
  integrity: 'sha384-完整摘要',
  crossOrigin: 'anonymous',
} as const

/** 声明固定版本和固定安全属性的分析脚本。 */
function AnalyticsRuntime() {
  return <script async={true} {...analyticsScript} />
}
```

集中定义可以减少不同组件为同一 src 写出冲突属性，但真正的身份仍只有 src。构建流程必须同步更新脚本
文件名和 integrity 摘要。

### 3. 不把 window 扩展当作自动就绪

即使为 `window.MapRuntime` 增加了 TypeScript 声明，也只表示静态类型允许访问。脚本是否已执行仍是运行时
问题。类型声明不能把异步加载变成同步可用。

## 十七、DOM 与执行验证

### 1. 查询 Resource 位置

```ts
/** 读取隔离文档中指定地址的异步脚本节点。 */
function findAsyncScript(fixtureDocument: Document, src: string) {
  return fixtureDocument.head.querySelector(`script[async][src="${src}"]`)
}
```

查询应从目标 document 的 head 开始，并使用与 React 输入一致的 `getAttribute('src')` 字符串。读取
`element.src` 会得到绝对 URL，不应把浏览器绝对化结果误当作 React 原始 key。

### 2. 分别记录三个数字

```ts
type ScriptEvidence = Readonly<{
  ownerCount: number
  domCount: number
  executionCount: number
}>
```

`ownerCount` 来自 Demo 自己的 React 声明状态，`domCount` 来自 head selector，`executionCount` 来自
脚本在 iframe window 中写入的计数。不要通过 DOM 数反推 owner 数，也不要通过网络请求数代替执行数。

### 3. 等待条件而不是固定延迟

async 执行受浏览器调度影响。自动化验收应等待 `executionCount === 1`，而不是等待固定 100ms 后猜测。
多个独立脚本只检查最终各执行一次，不断言 v1 和 v2 谁先完成。

## 十八、可运行示例

下面的示例使用同源 iframe 和三份固定静态脚本。所有 script、head 查询和执行计数都位于隔离 document
中，不影响当前学习站的 head 与 window。

:::demo{id="react.core.learn.advanced.declarative-async-script-resource.isolated-script-demo"}
:::

按顺序操作时应观察：

1. 首次 v1 声明：owner `1`、head DOM `1`、v1 最终执行 `1`。
2. 增加同 src owner：owner `2`，DOM 与执行仍为 `1`。
3. 同 src 改属性：DOM 仍保留首次 `data-owner`。
4. 删除全部 owner：owner `0`，固定版本中的 DOM 与执行计数不变。
5. 重挂 v1：复用旧 Resource，不重新执行。
6. 切换 v2：head 中保留 v1 并新增 v2，两个版本最终各执行一次。
7. 加入 `onLoad` script：普通节点留在 Root 容器，不计入 head Resource。
8. 卸载 Root：容器清空，head Resource 与执行记录保留。
9. 重建 iframe：旧 document 和 JavaScript realm 一起销毁，新 document 从零开始。

## 十九、易错使用提示

:::pitfalls
### 错误：把 async script 当成提交前依赖

**触发条件：** 组件 render 中声明脚本后，立即读取脚本应创建的全局 API。

**原因：** Script Resource 不参与 Suspense 加载等待；React 可以先提交组件。

**后果：** 快速网络下偶尔成功，冷缓存或慢网络下出现 `undefined`、调用失败或竞态。

**错误示例：**

```tsx
/** 错误：render 时假定外部脚本已经执行。 */
function BrokenMap() {
  const map = window.MapRuntime.create()
  return <script async={true} src="/scripts/map-runtime.js" />
}
```

**正确写法：**

```tsx
/** 只声明资源；业务调用另行等待脚本自己的就绪合同。 */
function MapRuntimeResource() {
  return <script async={true} src="/scripts/map-runtime.js" />
}
```

**验证方式：** 在冷加载中分别记录组件 commit 和脚本执行事件，确认 commit 可以先发生。

### 错误：同时依赖 onLoad 和 Resource 去重

**触发条件：** 给 `<script async src>` 增加 React `onLoad`，仍按特殊 Resource 统计。

**原因：** `onLoad/onError` 是当前特殊路径的退出条件。

**后果：** 节点留在普通容器、多个 owner 不再获得相同的 React Resource 合同。

**错误示例：**

```tsx
/** 错误：带回调后仍声称由 React Resource 去重。 */
function ConflictingScript() {
  return <script async={true} src="/scripts/runtime.js" onLoad={() => markReady()} />
}
```

**正确写法：**

```tsx
/** 保留纯 Resource 资格。 */
function DeduplicatedScript() {
  return <script async={true} src="/scripts/runtime.js" />
}
```

**验证方式：** 分别查询 iframe head 与 Root 容器；纯 Resource 在 head，带 onLoad 的普通节点留在容器。

### 错误：用 React key 强制同 src 重新执行

**触发条件：** 改变 `key`，但保持 src 不变。

**原因：** key 只决定 Fiber 身份，文档级 Resource key 仍是 src。

**后果：** DOM 数和执行次数不增加，代码却错误等待初始化再次发生。

**错误示例：**

```tsx
<script key={revision} async={true} src="/scripts/runtime.js" />
```

**正确写法：**

```tsx
// 新内容使用新地址；是否允许两个版本共存由脚本自身合同决定。
const src = revision === 1 ? '/scripts/runtime-v1.js' : '/scripts/runtime-v2.js'
<script async={true} src={src} />
```

**验证方式：** 先只改 key，再改 src，比较 head 节点数和版本执行计数。

### 错误：把同 src props 当作可变状态

**触发条件：** 先渲染 `data-owner="first"`，再把它改为 `second`。

**原因：** 同 src 命中已有 Resource，不进行普通 Host prop update。

**后果：** DOM、安全属性或脚本类型仍保留首份值，界面状态与真实资源合同分离。

**错误示例：**

```tsx
/** 错误：期望同 src 更新 integrity。 */
function MutableIntegrity({ digest }: { digest: string }) {
  return <script async={true} src="/scripts/runtime.js" integrity={digest} />
}
```

**正确写法：**

```tsx
/** 用版本地址绑定对应摘要。 */
function VersionedIntegrity({ version }: { version: 'v1' | 'v2' }) {
  const src = `/scripts/runtime-${version}.js`
  const integrity = version === 'v1' ? 'sha384-v1摘要' : 'sha384-v2摘要'
  return <script async={true} src={src} integrity={integrity} />
}
```

**验证方式：** 更新同 src 后读取 `getAttribute('integrity')`，再用新 src 对照。

### 错误：依赖 async 脚本的声明顺序

**触发条件：** 先写 runtime，再写 plugin，假定 plugin 总在后面执行。

**原因：** async scripts 并行获取，按可用时机执行。

**后果：** 网络条件变化时 plugin 先执行，读取不到依赖。

**错误示例：**

```tsx
<script async={true} src="/scripts/runtime.js" />
<script async={true} src="/scripts/plugin.js" />
```

**正确写法：**

```tsx
/** 只同时声明彼此独立的脚本资源。 */
function IndependentRuntimes() {
  return (
    <>
      <script async={true} src="/scripts/maps.js" />
      <script async={true} src="/scripts/analytics.js" />
    </>
  )
}
```

**验证方式：** 改变两个响应的完成时机，确认实现不依赖事件先后。

### 错误：把语义等价 URL 当成同一身份

**触发条件：** 不同组件分别使用相对地址、绝对路径或不同 query 指向同一文件。

**原因：** React 使用 src 输入字符串，不比较响应内容或规范化结果。

**后果：** 文档建立多个 Resource，脚本可能执行多次。

**错误示例：**

```tsx
<script async={true} src="./runtime.js" />
<script async={true} src="/scripts/runtime.js" />
```

**正确写法：**

```tsx
const runtimeSrc = '/scripts/runtime.js'
<script async={true} src={runtimeSrc} />
```

**验证方式：** 读取两个节点的 `getAttribute('src')`，按精确输入字符串统计。

### 错误：把 owner 卸载当作副作用回滚

**触发条件：** 条件隐藏组件后，假定脚本节点、全局变量和监听器全部消失。

**原因：** owner release、DOM 保留和已执行副作用是不同生命周期。

**后果：** 重复监听、旧全局状态或跨页面行为持续存在。

**错误示例：**

```tsx
{enabled ? <script async={true} src="/scripts/widget.js" /> : null}
```

**正确写法：**

```ts
/** 使用脚本公开的销毁能力清理业务资源。 */
function disposeWidget(): void {
  window.WidgetRuntime.destroy()
}
```

**验证方式：** 删除最后 owner 后同时查询 head script、window 计数和脚本注册的业务状态。

### 错误：认为 inline script 也会提升和去重

**触发条件：** 多处输出相同 children，并期待 React 比较文本内容。

**原因：** inline script 没有 src Resource 身份。

**后果：** 产生多个普通节点，且客户端和服务端执行边界与外部 Resource 不同。

**错误示例：**

```tsx
<script>{'window.setup()'}</script>
<script>{'window.setup()'}</script>
```

**正确写法：**

```tsx
/** 通过稳定 URL 声明一份可共享的外部脚本。 */
function SharedSetupScript() {
  return <script async={true} src="/scripts/shared-setup.js" />
}
```

**验证方式：** 分别查询 inline script 所在容器和 head 中的外部 Resource，不混用统计。

### 错误：同 src 混用 classic 与 module

**触发条件：** 一个 owner 传 `type="module"`，另一个 owner 对同 src 省略 type。

**原因：** type 不参与客户端 Resource key。

**后果：** 首次声明占用身份，后续脚本种类变化被忽略。

**错误示例：**

```tsx
<script async={true} type="module" src="/scripts/runtime.js" />
<script async={true} src="/scripts/runtime.js" />
```

**正确写法：**

```tsx
<script async={true} type="module" src="/scripts/runtime-module.js" />
<script async={true} src="/scripts/runtime-classic.js" />
```

**验证方式：** 查询最终 DOM 的 `type`，确认后一个声明没有建立第二份同 src Resource。

### 错误：用无浏览上下文文档或 Blob URL形成主结论

**触发条件：** 在 `createHTMLDocument()` 中看到 script 节点就宣称已经执行，或每次创建新 Blob URL 后
比较去重。

**原因：** 无 browsing context 的 document 不能形成可靠执行证据；每个 Blob URL 又是新字符串，并受
revoke、storage partition 和 CSP 影响。

**后果：** 测试把“节点已创建”“地址已改变”“脚本已执行”和“策略已允许”混成一个结果。

**错误示例：**

```ts
const fixtureDocument = document.implementation.createHTMLDocument()
const firstUrl = URL.createObjectURL(scriptBlob)
const secondUrl = URL.createObjectURL(scriptBlob)
// 节点存在不证明执行；两个 Blob URL 也不是同一 Resource 身份。
```

**正确写法：**

```ts
const v1Src = '/react-course-fixtures/async-script-resource-v1.js'
const scriptNode = fixtureFrame.contentDocument?.head.querySelector(
  `script[async][src="${v1Src}"]`,
)
const executionCount = fixtureFrame.contentWindow?.__ASYNC_SCRIPT_RESOURCE_EXECUTIONS__?.v1
```

**验证方式：** 重建 iframe 后确认旧 realm 被销毁，新 realm 从 `0/0` 开始，再声明固定 v1 URL。
:::

## 二十、源码推导与适用场景

### 1. 固定实现证明的事实

React DOM 的客户端资格判断要求 HTML namespace、无 itemProp、非空字符串 src、truthy async，并排除
onLoad/onError。脚本 Resource map 使用 src selector 作为 key；首次 acquire 创建 script 并追加到 head，
后续 acquire 复用 instance。release 只减少引用计数。

Reconciler 对相同 Resource 不执行普通 prop update；换 src 时 release 旧 Resource、acquire 新 Resource。
官方测试验证同 src 的 `data-*` 后值不写入 DOM，也验证纯 async script 在 Root 卸载后保留，而带 onLoad、
同步和 defer script 按普通节点处理。

### 2. 公共合同与固定版本事实

公共 Reference 使用“可能保留”描述卸载结果，因此应用不能依赖删除。固定版本确实保留节点，但未来实现
可以改变内部回收策略，只要不破坏公共 caveat。课程使用固定实现解释原因，不把引用计数结构当作应用 API。

### 3. 适用场景

适合声明式 Script Resource 的场景具有共同特征：脚本可独立 async 执行、同一 src 应全局共享、首次属性
可以固定、组件不要求提交前立即调用 API、脚本生命周期长于单个组件也可以接受。

不适合直接使用的场景包括：脚本之间有严格顺序依赖、需要 per-owner onLoad/onError、需要每次挂载重新
执行、必须随组件卸载撤销副作用、地址和安全属性需要原位变化。此时应选择拥有对应合同的加载机制。

## 二十一、练习

:::exercise
### 练习一：判定资源资格

**要求：** 给出十组 script props，逐组判断是否进入特殊资源路径，并说明缺失的是 src、async、事件、itemProp 还是
上下文条件。至少包含 `async={false}`、仅 defer、空 src 和带 onError 四组反例。

**验收：** 每组都要写出 Resource 或普通宿主结果及对应条件，不能只按是否存在 src 判断。
:::

:::exercise
### 练习二：预测 owner、DOM 与执行数

**要求：** 从一个 v1 owner 开始，依次增加第二 owner、删除第一 owner、删除全部 owner、重挂同 src。为每一步写出
三个数字，并解释为什么只有 owner 数发生变化。

**验收：** 同一 document 内的 head DOM 和执行数始终为 1；答案要区分最后 owner 消失与 document 销毁。
:::

:::exercise
### 练习三：修正可变属性设计

**要求：** 现有组件在同 src 上切换 `integrity` 和 `type`。把资源改成版本化地址映射，确保每个 src 只对应一套固定
属性，并说明旧 Resource 为什么仍可能留在 head。

**验收：** 每个版本必须有独立 src、固定 type 与对应摘要；切换不能依赖同 src prop update。
:::

:::exercise
### 练习四：区分提交与就绪

**要求：** 画出“组件 render -> commit -> script 下载完成 -> script 执行 -> API 就绪”的可能时间线。指出
Suspense fallback 为什么不会因为纯 Script Resource 自动出现。

**验收：** 时间线必须允许 commit 早于脚本执行，并把 API 就绪建立在脚本自己的可观察信号上。
:::

:::exercise
### 练习五：识别事件退出边界

**要求：** 比较纯 `<script async src>` 和增加 onLoad 后的声明。分别写出预期 DOM 位置、是否拥有 Resource 去重合同、
应该由谁管理加载状态，并解释为什么不能把两套结论组合使用。

**验收：** 纯声明归入 head Resource；带 onLoad 的声明必须标为普通 script，不能声称继续由 React 去重。
:::

:::exercise
### 练习六：设计隔离验证

**要求：** 使用同源 iframe 和两个固定静态 URL，定义 selector、执行计数、等待条件、Root 卸载断言和 document 重建
断言。禁止用固定 sleep、外网脚本、随机 query 或 Blob URL 作为主要证据。

**验收：** 方案必须分别证明 head DOM 数、v1/v2 执行数、Root 内容终态和新 document 的零起点。
:::

## 二十二、本节小结

- 非空 `src + async={true}` 且无事件回调、无 itemProp，才建立特殊 Script Resource。
- 新 Resource 进入 owner document 的 head；组件位置表达 owner，head 节点表达文档级资源。
- Resource 身份只看精确 src 字符串，同 src 的多个 owner 共用一个 DOM 和一次执行。
- React key、type、安全属性和 data 属性不参与身份，同 src 的后续 props 不会成为 DOM 更新。
- 新 src 建立新 Resource；旧节点和已经执行的副作用不随 owner 消失而保证撤销。
- Script Resource 不参与 Suspense 加载等待，多个 async scripts 也没有声明顺序保证。
- `onLoad/onError` 会退出特殊路径；需要回调时必须自己承担普通脚本的加载与去重合同。
- inline script、普通客户端 script 和服务端解析脚本不能直接套用同一执行结论。
- 验证时分别检查 owner 数、head DOM 数、iframe window 执行数和 Root 生命周期。

## 二十三、参考资料

- [React `<script>` Reference](https://react.dev/reference/react-dom/components/script) - 特殊资源资格、去重、更新、卸载与 inline script。
- [React 19 async scripts](https://react.dev/blog/2024/12/05/react-19#support-for-async-scripts) - 任意组件声明、异步执行与跨渲染环境去重。
- [React DOM 客户端资源实现](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js) - src key、head 插入、资格与释放。
- [React Resource 提交实现](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberCommitWork.js) - acquire、release 与卸载。
- [React DOM Script Resource 官方测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMFloat-test.js) - 属性固定、事件退出与节点保留。
- [WHATWG script element](https://html.spec.whatwg.org/multipage/scripting.html#the-script-element) - 外部脚本、async 与浏览器执行模型。
- [`@types/react` declarations](https://unpkg.com/@types/react@19.2.18/index.d.ts) - ScriptHTMLAttributes 类型合同。
