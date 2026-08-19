# 声明式异步脚本资源研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.advanced.declarative-async-script-resource`
- 标题：声明式异步脚本资源
- 教学层级：高级
- 前置课程：`react.core.learn.advanced.declarative-stylesheet-resources`
- 核验日期：`2026-08-18`
- 文档基线：React 官方文档 `19.2`
- 运行时基线：React / React DOM `19.2.8`
- 类型基线：`@types/react` `19.2.18`、`@types/react-dom` `19.2.4`
- 固定文档提交：`reactjs/react.dev@c7d6b700038c63d1aaf2c649af1aefe01ebbacac`
- 固定运行时提交：`facebook/react@1dd4ecbdabf826f527fc9a58c05ea70375b7d170`
- 范围边界：前置知识只采用 A21 已建立的“文档级 Resource、稳定身份、首次声明合同”心智模型；
  本课不回讲 stylesheet

本课只回答一条主线：组件可以在依赖脚本的位置声明非空 `src` 且 `async={true}` 的外部
`<script>`；满足资格时，React DOM 将其作为文档级脚本 Resource 放入 `<head>`、按 `src` 复用，浏览器
在资源可用时执行脚本，而 React 不等待脚本加载完成才提交组件（S1、S2、S3、S4、S12）。

必须覆盖：

1. 外部 `<script>` 获得 React 特殊资源语义的完整资格条件，以及缺少任一条件时退回普通宿主节点的
   边界。
2. 新建 Resource 的物理 DOM 放置、已有同 `src` async script 的复用，以及组件树位置与 document
   位置的区别。
3. `src` 字符串是资源身份；相同 `src` 的多个声明共用一个 DOM 元素，不按组件、`key`、`type`、
   `data-*` 或加载属性另建资源。
4. 同 `src` 的后续 props 变化被忽略；不同 `src` 建立新 Resource，旧 Resource 不因替换而保证删除。
5. React 去重带来的“一份 DOM、一份加载与一次执行”，以及 HTML async 脚本本身不保证相互执行顺序。
6. `onLoad`、`onError` 会让脚本退出特殊路径；不得同时承诺 React Resource 去重和 React 合成加载回调。
7. `children`、`dangerouslySetInnerHTML`、普通 `innerHTML` 与 `src` 的互斥边界；inline script 不提升、
   不去重。
8. `async={true}` 的必要性；`async={false}`、仅 `defer`、同步脚本和 `<noscript>` / SVG / `itemProp`
   上下文的边界。
9. React Resource 没有 stylesheet 那样的 loading state，不触发 Suspense 提交等待；组件可能先于脚本
   加载完成提交。
10. Resource 的 Fiber 引用计数、DOM 保留、Root 卸载与脚本“已经执行”状态不是同一生命周期。
11. 客户端新建 Resource 的执行路径、客户端普通 script 的惰性边界，以及服务端输出只保留公共级别
    说明。
12. Demo 使用真实浏览上下文和同源静态脚本，以 DOM 数量和脚本自身执行计数分别证明“去重”与
    “执行一次”。
13. Blob URL 的来源、生命周期、分区和 CSP 依赖；它可以成为 URL，但不作为本课主验收资源。
14. 所有观察必须在隔离 iframe document 内完成，不向课程站点自身的 `<head>` 注入或执行脚本。

明确排除：A23 `prefetchDNS`、`preconnect`、`preload`、`preinit` 及 module 变体的选择；A24
`useInsertionEffect`；框架 Script/Metadata API；第三方 loader；动态 import 教程；打包器 chunk 管理；
依赖图、AMD/CommonJS、微前端脚本编排；Service Worker；CSP 部署教程；SRI/CORS 完整安全教程；
服务器延迟与缓存性能基准；RSC、Server Functions、Fizz 指令与 SSR streaming 深入；多 Root、Portal、
ShadowRoot、跨域 iframe 产品支持；以及任何“组件渲染后脚本一定已经可用”或“卸载会撤销脚本副作用”
的承诺。

## 调研方法与版本

1. 按仓库顺位先使用 Tavily 定位 React `<script>` Reference、React 19 async script 发布说明、固定
   React 源码与测试、WHATWG `script`、File API 和 CSP。Tavily 正常返回官方入口，因此未切换 Exa、
   Parallel、Perplexity 或原生 Web 搜索。
2. 公共合同逐项回到 React `19.2` live Reference 与固定 `react.dev` Markdown；运行时细节只采用
   `react-dom@19.2.8` 对应提交的源码和官方测试（S1-S9）。
3. `package.json`、`package-lock.json` 与已安装包一致：React / React DOM 为 `19.2.8`，
   `@types/react` 为 `19.2.18`，`@types/react-dom` 为 `19.2.4`（S10、S11）。
4. npm registry 中 `react@19.2.8` 与 `react-dom@19.2.8` 的 `gitHead` 都是
   `1dd4ecbdabf826f527fc9a58c05ea70375b7d170`，与固定运行时源码一致（S11）。
5. WHATWG HTML 只承担原生 `script/src/async`、执行时机和 already-started 规则；“提升、按 src
   去重、props 冻结和卸载保留”是 React DOM 协议（S12）。
6. Blob URL 结论额外回到 W3C File API 与 CSP；它不是 React 官方 `<script>` 文档推荐的验收机制
   （S14、S15）。

## 关键精度结论

1. **公共写法必须是非空 src 加真正的 async。** 支持范围统一写成
   `<script async={true} src="/feature-v1.js" />`；`src` 缺失/为空、`async={false}`、仅 `defer`、
   `onLoad/onError`、`itemProp`、SVG 或 noscript 上下文都不进入同一资源路径（S1、S5、S8、S9）。
2. **新建 Resource 进入 owner document 的 head。** 客户端固定实现通过
   `ownerDocument.createElement('script')` 创建并追加到 `ownerDocument.head`；组件原容器没有副本
   （S4）。
3. **已有匹配节点可能原位复用。** 获取 Resource 时会先查询同一 hoistable root 中
   `script[async][src="..."]`；若已经存在，React 采用该节点而不创建、移动或重新执行它。干净 Demo
   不预置相同 src（S4）。
4. **身份是精确 src 字符串。** 当前客户端 key 仅由传入的 `src` 字符串构造；`type`、`nonce`、
   `integrity`、`crossOrigin`、`fetchPriority`、`referrerPolicy`、`data-*` 和 React `key` 都不参与
   Resource key（S4）。
5. **同 src props 是首次声明合同。** 同一 Resource 在更新时不走普通 Host prop update；公共
   Reference 明确说后续 prop 变化会忽略。因此相同 src 的 `data-owner="second"` 不能覆盖先前
   `data-owner="first"`（S1、S7、S8）。
6. **新 src 是新身份而不是原位换地址。** 新 Resource 创建另一 `<script>`；旧 Resource 只 release
   引用，当前版本仍留在 DOM。两个脚本分别按浏览器规则加载、各执行一次（S1、S3、S4、S7、S8）。
7. **去重不等于加载协调。** Script Resource 的 state 为 `null`；固定实现明确把 script 归为“不
   suspensey”的资源。React 可以先提交组件，脚本随后才加载/执行（S1、S4）。
8. **async 脚本没有声明顺序保证。** HTML 对外部 classic async script 的合同是并行获取、可用即
   执行；多个脚本不能依靠组件树或 head 顺序表达依赖（S3、S12）。
9. **加载事件存在文档张力。** 同一 React Reference 的 Props/Special behavior 段说 `onLoad/onError`
   取消特殊处理，Usage 示例却把 `onLoad` 放在 async script 上并紧接着描述去重。`19.2.8` 资格源码和
   官方测试支持前者；课程必须显式说明张力，不把示例扩写成“带 onLoad 仍去重”（S1、S2、S5、S8）。
10. **inline script 是另一种宿主内容。** children 应是单一字符串；也可用
    `dangerouslySetInnerHTML`，二者不能同时使用。没有外部 src 的 inline script 不移动、不去重；
    普通 `innerHTML` prop 不是 React 设置脚本文本的 API（S1、S9、S13、S16）。
11. **客户端普通 script 与 Resource script 的执行路径不同。** React 创建普通 Host script 时先经
    `innerHTML` 制造 parser-inserted 节点，使其在客户端插入时不执行；Resource script 则直接
    `createElement` 后插入 head，由浏览器准备和执行。服务端输出经 HTML 解析时遵循浏览器解析器规则
    （S4、S6、S9、S12）。
12. **卸载 owner 不会撤销已经执行的代码。** 当前 `releaseResource()` 只递减引用计数；Root unmount
    后脚本节点保留，脚本创建的全局变量、监听器或其他副作用也不会由 React 自动回滚（S1、S4、S7、
    S8）。
13. **不得手动删除 React 管理的 Resource 节点。** 固定 registry 仍保存该 Resource/instance；手工
    `remove()` 会让 DOM 与 React 的资源记录失配。需要业务级 teardown 时应调用脚本自身公开的清理
    能力，而不是把 DOM 删除当卸载协议（S4、S7）。
14. **Blob URL 能运行不等于适合作主验收。** Blob URL 具有创建环境来源、storage-key 访问限制、显式
    revoke 生命周期，并可能需要 CSP 单独允许 `blob:`。这些变量会把 React 去重验收与 URL/CSP 清理
    混在一起；主 Demo 采用同源静态 URL（S14、S15）。
15. **模块类型不能当身份修复工具。** 客户端固定 key 不含 `type`，同 src 的 classic/module props
    会争用同一资源；服务端固定实现又分开记录 classic 与 module resource。课程只使用 classic async
    script，并要求同一 src 永远对应同一脚本种类与属性合同（S4、S9）。

## 固定来源表

| 编号 | 一手来源 | 版本固定 | 本课采用的事实 |
| --- | --- | --- | --- |
| S1 | [React `<script>`](https://react.dev/reference/react-dom/components/script) | React DOM 文档 `19.2` | src/async opt-in、src 去重、props 忽略、卸载 caveat、组件可先提交、inline script 边界。 |
| S2 | [固定 `<script>` Reference](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/components/script.md#L21-L142) | `react.dev@c7d6b700...` | 固定 props、事件 opt-out、Special behavior 与 Usage onLoad 示例的措辞张力。 |
| S3 | [固定 React 19 async scripts 发布说明](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/blog/2024/12/05/react-19.md#L649-L680) | React `19` stable 固定提交 | 任意组件声明、异步无序、全渲染环境去重为一次加载/执行、SSR head 公共边界。 |
| S4 | [`getResource()`、script key、acquire/release](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js#L5167-L5196) / [获取与插入](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js#L5329-L5486) | React DOM `19.2.8` | src-only key、匹配既有 async script、head 插入、state null、count 只递减。 |
| S5 | [客户端 hoistable 资格判定](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js#L5734-L5894) | React DOM `19.2.8` | HTML namespace、itemProp、非空 src、async truthiness、onLoad/onError 的精确边界。 |
| S6 | [普通客户端 script 的创建](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js#L490-L538) | React DOM `19.2.8` | 普通 Host script 通过 parser-inserted 节点创建，客户端组件 script 不执行。 |
| S7 | [Resource 更新提交](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberCompleteWork.js#L1167-L1263) / [挂载、替换与卸载](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberCommitWork.js#L1427-L1458) | React `19.2.8` | 同 Resource 不更新 props；换 Resource release/acquire；删除 owner 只 release Resource。 |
| S8 | [同 src 属性冻结官方测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMFloat-test.js#L647-L684) / [Script Resources 官方测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMFloat-test.js#L8680-L8859) | React DOM `19.2.8` | 同 src data prop 不重建、onLoad/同步/defer 区分、head 放置、卸载保留、SVG/noscript 边界。 |
| S9 | [服务端 `pushScript`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/server/ReactFizzConfigDOM.js#L3761-L3892) | React DOM `19.2.8` | 服务端资源资格、classic/module map、src key、children/innerHTML 输出与单字符串警告。 |
| S10 | [`@types/react@19.2.18`](https://unpkg.com/@types/react@19.2.18/index.d.ts) | npm `19.2.18` | `ScriptHTMLAttributes` 的 async/src/type 等属性；children 与 dangerouslySetInnerHTML 来自公共 DOMAttributes。 |
| S11 | [React npm 元数据](https://registry.npmjs.org/react/19.2.8) / [React DOM npm 元数据](https://registry.npmjs.org/react-dom/19.2.8) | npm `19.2.8` | 两个发布包的 `gitHead` 对齐固定运行时提交。 |
| S12 | [WHATWG `script`](https://html.spec.whatwg.org/multipage/scripting.html#the-script-element) / [`async`](https://html.spec.whatwg.org/multipage/scripting.html#attr-script-async) / [prepare algorithm](https://html.spec.whatwg.org/multipage/scripting.html#prepare-the-script-element) | HTML Living Standard，核验于 `2026-08-18` | 非空 src、boolean async、并行获取/可用即执行、already-started、外部与内联内容边界。 |
| S13 | [服务端 script 文本序列化](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/server/ReactFizzConfigDOM.js#L3841-L3892) | React DOM `19.2.8` | 单字符串 children、dangerouslySetInnerHTML 分支、inline script 内容转义。 |
| S14 | [W3C File API：Blob URL](https://www.w3.org/TR/FileAPI/#url) | File API，核验于 `2026-08-18` | 创建环境来源、storage key 限制、URL store、revoke 后网络错误与全局生命周期。 |
| S15 | [W3C CSP：special URL schemes](https://www.w3.org/TR/CSP2/#source-list-guid-matching) / [`script-src`](https://www.w3.org/TR/CSP3/#directive-script-src) | CSP Level 2/3 | blob scheme 不自动等价于 self/通配匹配，脚本执行仍受 script-src 管控。 |
| S16 | [`dangerouslySetInnerHTML` 客户端处理](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/client/ReactDOMComponent.js#L594-L613) | React DOM `19.2.8` | children 与 dangerouslySetInnerHTML 互斥；普通 innerHTML prop 被保留为 no-op。 |

## JSX 与资源资格

### 推荐的唯一主线写法

```tsx
function MapRuntime() {
  return <script async={true} src="/react-course-fixtures/async-script-map-v1.js" />
}
```

`src` 必须是非空字符串，`async` 必须使用布尔值 `true`。JSX 简写 `async` 等价于
`async={true}`，但课程统一显式写出 true，便于和 `async={false}` 对照（S1、S5、S10）。

### 精确资格矩阵

| 条件 | Resource 结果 | 教学边界 |
| --- | --- | --- |
| HTML namespace | 可以继续判断 | SVG 内 script 维持 SVG/普通宿主语义 |
| 无 `itemProp` | 可以提升 | `itemProp` 表示条目级内容，取消文档资源提升 |
| `src` 为非空字符串 | 建立 src 身份 | 缺失、空字符串或非字符串不建立脚本 Resource |
| `async={true}` | 允许安全移动 | false/缺失/仅 defer 不进入特殊路径 |
| 无 truthy `onLoad` | React 管理 Resource | 加 React onLoad 后作为普通 script 处理 |
| 无 truthy `onError` | React 管理 Resource | 加 React onError 后作为普通 script 处理 |
| 不在 `<noscript>` | 服务端可建立 Resource | noscript 内容按文本/禁脚本上下文处理 |

固定运行时对 async 的底层判断是“truthy 且不是 function/symbol”，但公共类型只允许 boolean，公共文档
要求 `async={true}`。因此 `async="false"` 虽可能在 JavaScript 层成为 truthy，HTML boolean attribute 的
存在也表示启用；它既违反类型意图又容易误读，课程禁止使用（S1、S5、S10、S12）。

### onLoad/onError 的文档张力

固定 Reference 的资格说明很清楚：`onLoad` 和 `onError` 取消 React 的特殊 script 处理；固定源码也在
hoistable 判断中直接排除二者，官方测试把带 onLoad 的 async script 与纯 Resource 分开（S1、S2、S5、
S8）。

同页 Usage 示例却写了：

```tsx
<script async src="map-api.js" onLoad={handleLoad} />
```

并在后文描述同 src 去重。不能用后一句覆盖前面的资格合同。课程采用固定实现与 Special rendering
behavior 一致的窄结论：需要提升/去重时不传 React `onLoad/onError`；需要加载回调时，它就是普通 script，
不能再声称拥有本课 Resource 行为。Demo 用脚本自身写入隔离 window 的执行计数来观察 readiness，不给
Resource 添加 React 加载回调（S1、S2、S5、S8）。

## 属性、身份与更新

### src 是精确字符串身份

固定客户端实现把 src 转义后构造 `[src="..."]` key，并在同一 document 的脚本 Resource map 中查找。
它没有先做 URL 绝对化或语义等价归一化（S4）。因此：

- 两次 `/feature-v1.js` 是同一身份；
- `/feature-v1.js` 与 `/feature-v1.js?build=2` 是两个身份；
- `./feature-v1.js` 与 `/feature-v1.js` 即使最终可能请求同一文件，也不能依赖 React 去重；
- 同一 src 必须始终对应同一种 classic/module 形态和同一组安全属性。

### 哪些属性不参与身份

| 属性 | 影响 | 是否参与 Resource key |
| --- | --- | --- |
| `src` | 地址与 React 身份 | 是，唯一 key |
| `async` | 是否取得 Resource 资格 | 否；取得资格后应恒为 true |
| `type` | 浏览器脚本类型 | 否 |
| `crossOrigin` | CORS 请求模式 | 否 |
| `integrity` | SRI 校验 | 否 |
| `nonce` | CSP nonce | 否 |
| `fetchPriority` | 浏览器 fetch priority 提示 | 否 |
| `referrerPolicy` | 请求 referrer policy | 否 |
| `noModule` | 模块回退条件 | 否 |
| `data-*` | Demo 可观察标记 | 否 |
| React `key` | Fiber reconciliation | 否，不改变文档级 src map |

这些属性有效不表示可以在同 src 上响应式更新。第一份声明建立 DOM 后，后续声明或同一 Fiber 更新到
不同 `data-*`、nonce、integrity 等值仍命中旧 Resource，普通 prop update 被跳过（S1、S4、S7、S8）。

### 更新矩阵

| 操作 | `19.2.8` 结果 | DOM 数量 | 执行次数结论 |
| --- | --- | --- | --- |
| 两个组件声明同 src/同 props | 共用同一 Resource | 1 | 该 document 中 1 次 |
| 同 src 改 `data-owner` | 复用旧 Resource，原属性保留 | 1 | 不增加 |
| 同 src 改安全/请求属性 | 复用旧 Resource，后值不成为更新 | 1 | 不增加 |
| 保留 src、只改 React `key` | 新 Fiber 仍 acquire 同一文档 Resource | 1 | 不增加 |
| 改为新 src | acquire 新 Resource，release 旧引用 | 2（当前旧节点保留） | 新地址再执行 1 次 |
| 删除一个重复声明 | Resource count 递减 | 1 | 不增加 |
| 删除最后一个声明 | count 降至 0，当前不删除节点 | 1 | 不增加 |
| Root unmount | 所有 owner release，Resource 当前保留 | 1 | 不增加 |
| 销毁整个 iframe document | 旧 DOM 与 JS realm 一起销毁 | 新 document 从 0 开始 | 新 document 首次声明再执行 1 次 |

“执行一次”限定在同一个隔离 document、同一精确 src 的本课 Resource 路径。脚本内部再加载代码、注册
异步任务或自行重复副作用不属于 React 去重能约束的范围（S3、S4、S7、S12）。

## 放置、加载与执行

### 客户端新建 Resource

在没有预置同 src 节点的 document 中，客户端路径是：

1. render 发现合格 `<script>`，按 src 获取或建立 Resource；
2. commit 首次 acquire 时创建真正的 `HTMLScriptElement`；
3. 设置首次声明 props；
4. 追加到 `ownerDocument.head`；
5. 浏览器获取外部脚本，并按 async 规则在可用时执行（S4、S12）。

脚本节点进入 head 不表示 React 等待它。Resource state 为 null，没有 A21 stylesheet 的
load/error waiting path。React Reference 直接警告组件可能在脚本加载前提交；不能用 Suspense fallback、
页面内容出现或 commit 完成推断全局 API 已存在（S1、S4）。

### 已有同 src 节点

若目标 document 已有 `script[async][src="相同字符串"]`，fixed client 会复用它并标记为 hoistable；不会
再创建一份，也不会为了“提升”强制搬到 head（S4）。因此主 Demo 必须用干净 fixture，静态 marker 不得
占用 v1/v2 src。产品中若第三方先插入同 src，React 只看到匹配节点，不能据此推导它的原始 owner、属性
或初始化过程与课程 Demo 相同。

### async 的执行顺序

WHATWG 对外部 classic async script 的规则是并行获取、结果可用即执行，可能发生在文档解析完成前。
React 19 允许深层组件声明，正是因为 async script 不需要维护传统同步/defer script 的文档顺序
（S3、S12）。

因此下列写法不能表达 `analytics` 依赖 `runtime`：

```tsx
<script async={true} src="/runtime.js" />
<script async={true} src="/analytics.js" />
```

head 中的 DOM 顺序、组件树顺序、发现顺序和网络完成顺序都不能升级为依赖保证。课程只讲彼此独立的
classic async fixture；模块依赖、loader 和框架脚本编排明确留在范围外（S3、S12）。

## children、innerHTML 与普通 script

### inline script

React Reference 要求 script 要么有 `children`，要么有 `src`。inline 写法的 children 应是单一字符串；
固定服务端实现会对数字、数组或其他非字符串 children 发出开发警告，并对脚本文本做专用转义（S1、
S9、S13）。

```tsx
<script>{"window.__inlineFlag = true"}</script>
```

inline script 不提升到 head、不按内容去重。它不是本课 Demo 的执行资源（S1）。

### dangerouslySetInnerHTML 与 innerHTML

`dangerouslySetInnerHTML={{ __html: code }}` 是 React 的原始脚本文本入口，不能同时再传 children；普通
`innerHTML` prop 在当前 React DOM 属性处理中是 no-op，不是替代写法（S10、S13、S16）。

外部 `src` 表示脚本从 URL 获取，WHATWG 要求 src 是有效非空 URL；外部脚本不能再把 child text 当作
第二份程序来源（S12）。虽然固定 React 资格判断没有额外检查 children/`dangerouslySetInnerHTML`，
课程仍禁止将它们与资源化 `src + async` 混用：这是无效的内容模型，也会把“首次 props 被忽略”与浏览器
脚本来源规则混在一起。

### 客户端普通 script 不等于动态 loader

React DOM 创建普通 Host script 时故意通过临时 div 的 `innerHTML` 得到 parser-inserted script，并在
源码注释中说明客户端组件内的这类 script 不执行（S6）。合格 Resource script 则使用不同创建路径，
直接创建后追加到 head。课程不能拿 `async={false}`、`defer`、inline 或带 React `onLoad` 的普通节点来
替代 Resource 执行实验。

服务端输出是另一边界：HTML 响应中的 script 由浏览器解析器处理，是否执行还受 script 类型、CSP、
地址和错误状态影响。A22 只保留“合格 async script 可在服务端去重并进入 head”的 React 19 公共结论，
不教授 streaming flush、hydration 抢占或框架 Script API（S3、S9、S12）。

## 所有权、卸载与副作用

Fiber owner 数量与 DOM script 数量必须分别观察：多个 Fiber 可以 acquire 同一 Resource，每次 acquire
增加 count；删除 Fiber 只 release 并减少 count。`19.2.8` 在 count 为零时没有删除脚本节点的逻辑
（S4、S7）。

公共 Reference 的措辞是 React “may leave” script in DOM，因此课程表述分两层：

- 公共合同：卸载后不要依赖脚本一定被删除；
- 固定版本事实：`19.2.8` 的 DOM 节点在最后 owner 和 Root 卸载后仍保留（S1、S8）。

脚本一经浏览器执行，删除 DOM 元素本来也不会自动撤销它已经产生的副作用。React 不知道脚本注册了
哪些全局对象、监听器、计时器或 DOM 修改。需要 teardown 的库必须提供自己的清理 API；该 API 的设计
不属于本课（S1、S12）。

不要手动对 Resource 节点调用 `remove()`。React 的 Resource map 和 `resource.instance` 仍可能指向被
移除的元素，后续相同 src 声明会复用内部记录而不是把手工删除当成受支持的生命周期信号（S4）。Demo
唯一确定的清理边界是销毁整个 iframe document。

## Blob URL 资源选择结论

### 是否可作为 async script src

Blob URL 是合法 URL 字符串，未撤销且允许访问时可以被 fetch；其 origin 通常继承创建环境。React 的
src-only key 也能把同一个 Blob URL 字符串作为身份（S4、S14）。所以“浏览器可能执行 Blob URL 外链
script”本身没有问题。

### 为什么不适合作为主验收资源

它同时引入四个与 React 合同无关的变量：

1. 每次 `URL.createObjectURL()` 生成新字符串，同内容也会成为新 React Resource；
2. object URL 绑定创建环境和 blob URL store，跨 storage key 使用会失败；
3. `URL.revokeObjectURL()` 的时机决定后续 dereference 成功还是网络错误；React 保留节点又让“何时可
   revoke”与 owner 生命周期产生额外耦合；
4. CSP 对 `script-src` 管控脚本，blob scheme 可能需要显式允许，不能假设 `'self'` 或通配策略必然覆盖
   （S14、S15）。

这些变量会让失败结果无法直接归因于 React 资格、去重或卸载。主 Demo 因此使用版本化同源静态 URL：

- `/react-course-fixtures/async-script-resource-v1.js`
- `/react-course-fixtures/async-script-resource-v2.js`
- `/react-course-fixtures/async-script-event-opt-out.js`

静态资源必须返回 JavaScript MIME、内容固定、无需远程服务，并在自己的 iframe window 上增加显式
执行计数。Blob URL 最多作为非验收扩展说明，不进入 PASS 判定（S12、S14、S15）。

## 高价值易错候选

### 1. 把 async 当成“提交前等待”

错误：脚本加载后 React 才显示依赖组件。

修正：Script Resource 不 suspense；组件可能先提交，脚本随后执行。

### 2. 一边传 onLoad 一边要求 Resource 去重

错误：`onLoad` 只是观察器，不改变资格。

修正：当前 `onLoad/onError` 直接退出特殊路径；官方 Usage 示例存在措辞张力。

### 3. 认为同 src 的后一个 data 属性会更新 DOM

错误：Resource 也像普通 HostComponent 一样响应 props。

修正：同 src 命中同一 Resource，首次 props 保留。

### 4. 用 key 强制重新执行同 src

错误：更换 React key 会绕过文档级去重。

修正：key 只影响 Fiber；Resource registry 仍按 src 复用。

### 5. 条件隐藏后期待脚本和副作用撤销

错误：最后 owner 卸载会删除 script 并回滚全局状态。

修正：当前节点保留；已执行副作用不由 DOM 删除自动撤销。

### 6. 把 head 顺序当 async 执行顺序

错误：先声明的 async script 必定先执行。

修正：浏览器按资源可用时机执行，依赖不能靠声明顺序表达。

### 7. 把语义等价 URL 或不同 type 当成同一资源

错误：React 会比较响应内容、规范化 URL，或允许同 src 在 classic/module 之间切换。

修正：身份是 src 字符串；query、相对写法变化都会建立新 key。客户端 key 不含 type，同 src 应固定脚本种类。

### 8. inline children 也能提升和去重

错误：React 会对脚本文本求 hash。

修正：inline script 原位放置，不去重；children 使用单一字符串。

### 9. 普通 innerHTML 就能写脚本代码

错误：`innerHTML={code}` 是 React 支持的 DOM prop。

修正：普通 innerHTML no-op；原始文本入口是 dangerouslySetInnerHTML，但不属于资源主线。

### 10. 用无真实浏览上下文或 Blob URL 形成主结论

错误：只要能看到 head script，或因为 Blob URL 没有网络，就能证明脚本加载和执行没有其他变量。

修正：没有真实 browsing context 的 document 适合 DOM 放置观察，不足以形成脚本执行证据；Blob URL 还带
object URL 生命周期、分区和 CSP 变量。主验收使用同源 iframe 与静态 URL。

## 隔离 Demo 可观察合同

### 隔离原则

- 创建同源 iframe，为脚本提供真实 browsing context；React root 挂在
  `fixtureFrame.contentDocument.body` 内的专属容器。
- 不使用 `document.implementation.createHTMLDocument()` 证明执行；它只能作为 DOM 结构探针。
- 所有 selector 从 `fixtureDocument.head/body` 开始，所有执行计数从 `fixtureFrame.contentWindow` 读取。
- 课程站点自身的 `document.head`、`window`、console 全局和网络请求数不作为脚本身份断言。
- iframe 必须允许脚本执行并保持同源访问；销毁 iframe 是 DOM、Resource registry 可见宿主和 JS realm
  的确定清理边界。
- v1/v2 使用固定同源静态 URL；不使用 CDN、Blob URL、data URL、随机 query 或第三方 loader。

### 静态脚本可观察协议

每个 fixture script 只做三件事：读取 iframe 自己的
`window.__ASYNC_SCRIPT_RESOURCE_EXECUTIONS__`、增加对应版本计数、派发带版本字符串的自定义事件。它不得访问父
页面业务状态、注册长期计时器或加载其他资源。DOM 数量证明 React 去重，window 计数证明浏览器执行；
二者不能互相代替（S3、S4、S12）。

浏览器验收应等待计数达到目标值，而不是固定 sleep。异步脚本无执行顺序保证，所以只检查 v1/v2 最终
各为 1，不断言谁先完成（S12）。

### 状态与精确期望

| 状态 | React 声明 | head Resource 数 | v1/v2 执行计数 | 必须观察 |
| --- | --- | --- | --- | --- |
| 初始 fixture | 无 | `0` | `0 / 0` | head 只有静态 fixture marker |
| 首次声明 v1 | 一个 v1，`data-owner="first"` | `1` | 最终 `1 / 0` | script 在 head；业务内容不等待计数才 commit |
| 加入重复 owner | 两个同 src v1，第二个 owner 不同 | `1` | `1 / 0` | 声明数 2、DOM 数 1 |
| 同 src 改 props | 第二份和更新路径改 `data-owner` | `1` | `1 / 0` | DOM 仍保留首次属性 |
| 删除一个 owner | 只剩第一份 v1 | `1` | `1 / 0` | count 减少不导致 DOM/执行变化 |
| 删除全部 owner | 无 v1 声明 | `1`（固定版本） | `1 / 0` | 当前节点保留，不能标成仍有 owner |
| 同 document 重挂 v1 | 再声明同一 v1 src | `1` | `1 / 0` | 复用已存在 Resource，不重新执行 |
| 切到新 src v2 | 声明 v2，不再声明 v1 | `2`（固定版本） | 最终 `1 / 1` | 新节点新增，旧 v1 保留 |
| Root unmount | 无 React owner | `2`（固定版本） | `1 / 1` | body root 清空；head 与计数不变 |
| 重建 iframe | 销毁旧 frame，创建新 frame | 先 `0` | 新 realm `0 / 0` | 新声明 v1 后重新达到 `1 / 0` |

### 事件 opt-out 观察

单独使用 `/react-course-fixtures/async-script-event-opt-out.js`，渲染
`<script async={true} src={url} onLoad={noop} />`：

- `fixtureDocument.head.querySelectorAll('script[src="..."]').length === 0`；
- 专属 React container 中存在一个普通 script；
- 该节点不计入 Resource 计数；
- 不把是否触发回调或是否执行作为 PASS 条件，因为客户端普通 script 采用与 Resource 不同的惰性创建
  路径（S5、S6、S8）。

`onError` 使用同一资格分支，正文表格讲清即可，不需要再复制一个失败网络 Demo。这样既覆盖事件边界，
又避免用 404、缓存或 CSP 错误制造不稳定验收。

### DOM 与执行观察矩阵

| 观察项 | selector/值 | 不应混淆 |
| --- | --- | --- |
| Resource script | `head script[async][src="精确静态 URL"]` | body 普通 script 不算 Resource |
| src 身份 | `getAttribute('src')` 的固定字符串 | 不用 `element.src` 绝对化结果代替 React 输入 key |
| 首次 props | `getAttribute('data-owner')` | 后一个 JSX 声明不是 DOM update |
| owner 数 | Demo 自己的声明状态 | DOM 节点数不能反推 Fiber count |
| 执行数 | iframe window 的版本计数 | load 请求数、节点数不能单独证明执行 |
| 放置 | iframe head/body 两处分别查询 | 课程站点 head 不属于 fixture |
| 卸载保留 | Root unmount 后 iframe head | 销毁 iframe 是不同清理边界 |
| 新身份 | v1/v2 两个固定 src 各一节点 | async 完成顺序不作断言 |

## 客户端与服务端边界

客户端课程可稳定实证：干净 document 中的新 Resource 进入 head；同 src 复用；同 src props 冻结；新
src 新建；owner/Root 卸载后固定版本保留；真实浏览器中每个固定 src 执行一次（S4、S7、S8、S12）。

服务端只教授 React 19 发布说明的公共层：合格 async scripts 可以从组件树收集、去重并放入 head，且
相对阻塞绘制的 stylesheet/font/image preload 排在较低优先级（S3）。固定 Fizz 源码用于核验资格和
children 边界，不把内部 queue、flush 时点、preload state、bootstrap script 或 classic/module map
写入学习者主线（S9）。

客户端与服务端都不能承诺：脚本在组件提交前可用、多个 async script 按声明顺序执行、脚本错误进入
React Error Boundary、卸载撤销脚本副作用，或 Blob URL 在任意 CSP 下可运行（S1、S12、S14、S15）。

## 未决与不承诺边界

1. 固定 Reference 的 onLoad Usage 示例与 Special rendering behavior/源码资格存在张力。本文采用后两者
   与官方测试一致的结论，并明确记录上游张力，不替 React 推导未来版本。
2. 公共 Reference 说资源 props 变化会忽略并在开发环境警告；课程依赖“忽略”合同，不把某条 warning
   文本或触发时机当生产 API。
3. 公共合同只说 React may leave script；固定 `19.2.8` 确实只递减 count。课程不能把当前实现写成
   “React 永远保留”。
4. 已有同 src async script 可能被复用且保持原位。主 Demo 使用干净 document，不把第三方脚本收养扩成
   产品能力。
5. 客户端 map 不区分 classic/module，而服务端固定实现分开记录。课程避免同 src 跨 type，不教授这一
   实现差异的兼容策略。
6. iframe 中 static script 的执行计数只证明该浏览器快照；不证明所有浏览器缓存、CSP、SRI、CORS 或
   网络优先级行为。
7. 执行计数脚本的自定义事件是 Demo 探针，不是 React readiness API，也不演变成第三方 loader 教程。
8. Blob URL 不是绝对不可用；它只是不能在不额外验证 CSP、storage partition 与 revoke 时序的情况下
   作为本课主验收证据。

## 课程写作边界

- 左侧标题与正文 H1 都用简短的“声明式异步脚本资源”。
- 学习者正文只讲本课知识，不出现课号、路线、计划、任务、批次、Gate、复审、完成度、篇幅或行数
  叙事。
- 内容按“资格 -> 放置 -> src 身份 -> props 冻结 -> 加载/执行 -> 所有权/卸载 -> Demo”展开；每段直接
  描述事实、原因和可观察结果，不堆修饰语。
- 必须详细覆盖资格矩阵、属性矩阵、更新矩阵、执行顺序、事件 opt-out、inline/innerHTML 边界、客户端
  普通 script、服务端公共边界和 10 个完整易错项。
- 本科范围强调可验证 DOM、HTML async 模型、React Resource 身份和生命周期，不展开 React Fiber/Fizz
  内部算法教学；源码只用于保证结论精确。
- 练习应覆盖：判定资格、预测同 src DOM/执行次数、修正同 src props 更新、区分 owner 卸载与
  document 销毁、识别 onLoad 张力、设计无顺序依赖的 async scripts。
- A23 resource hints、A24 insertion effect、框架/loader、RSC/SSR streaming 深入和 Blob/CSP 部署均不
  写入正文主线。

## 课程实施结论

A22 应建立五个不可混淆的心智模型：

1. 非空 `src + async={true}` 且无事件 opt-out 才建立 React Script Resource；
2. 新 Resource 进入 document head，身份只看精确 src 字符串；
3. 同 src 共享一份 DOM 和一次执行，后续 props 不是 State；
4. script 不参与 Suspense 加载等待，async scripts 之间也没有声明顺序保证；
5. Fiber owner、DOM Resource、浏览器 already-started 和脚本副作用是四种不同生命周期。

课程若能在同源 iframe 中同时证明首次 head 放置、同 src 去重、首次 data prop 保留、删除 owner 后节点
与执行数不变、新 src 新增并执行一次、Root unmount 后固定版本保留，以及 onLoad 退出 Resource 路径，
就覆盖了本课完整本科范围。Blob URL、resource-hint API、框架脚本 API、第三方 loader、插入 Effect 和
服务端 streaming 细节均不应进入本课。
