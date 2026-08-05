# Pinia 4.0.2 P05：SSR、Hydration、HMR 与维护官方调研

> 核验日期：2026-08-05（Asia/Shanghai）
>
> 批次边界：仅 `P05 / L13-L14`
>
> 固定版本：[`pinia@4.0.2`](https://github.com/vuejs/pinia/releases/tag/v4.0.2)
>
> 固定 tag object：`258437e2ef788655cc7d614dc7cfbaaaea4c4e94`
>
> 固定 commit：
> [`ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1`](https://github.com/vuejs/pinia/commit/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1)
>
> P0 计划快照：`docs/research/pinia-course-plan.md`，调研时 SHA-256 为
> `b1e05516c3fcaff5324f076c444380db70781dd15890d1e24dcceccec9f0ad87`
>
> P04 调研快照：`docs/research/pinia-p04-plugins-persistence-testing.md`，调研时 SHA-256 为
> `23dc7b684b19b25ceb98e59a5afe572ed6ce1f8068b4b116c348b8005f1f400c`
>
> Manifest 快照：`src/content/catalog/manifests/vue-pinia-track.ts`，调研时 SHA-256 为
> `42598723f4eeabf933947e6d8285786dc4bc47232843dfd83e22062d44e53f1d`

## 资料检索、本地版本与证据口径

本次先按仓库规则调用 Tavily，对 Pinia SSR、hydration、HMR、Devtools、固定 commit 源码与 Vue
SSR 安全边界做限定官方域名检索。Tavily 返回 `plan usage limit`，没有产生可引用的检索结果；随后
按仓库 fallback 规则，直接读取 Pinia/Vue/Vite 官方站点、Pinia 固定 commit 的文档源码、runtime
源码、官方测试、issue 与 release。

本地基线经 `package-lock.json` 与已安装文件双重机械核对：

| 项目 | 核对结果 |
| --- | --- |
| 根依赖声明 | `pinia: ^4.0.2`，不是严格 pin |
| lockfile 解析 | `pinia@4.0.2`，tarball integrity 为 `sha512-yKVV...M0Ks1g==` |
| installed package | `node_modules/pinia/package.json` 为 `4.0.2` |
| 本地 runtime | `dist/pinia.js` SHA-256 `eb83983d...61ea92` |
| 本地声明 | `dist/pinia.d.ts` SHA-256 `e13460b9...e0674` |
| package manifest | `node_modules/pinia/package.json` SHA-256 `3f582bbd...e97ace9` |
| lockfile | SHA-256 `6a68e9e9...b1e1c98` |
| 本地 Vue SSR runtime | `@vue/server-renderer@3.5.40` 随 `vue@3.5.40` 安装 |
| 未安装的 P05 package | 根依赖、lockfile 与顶层安装中均无 `devalue`、`@pinia/nuxt` |

发布 tarball 不包含 TypeScript `src/`，只包含构建产物与声明；因此本文以本地
`dist/pinia.js`/`dist/pinia.d.ts` 核对实际安装面，再用固定 commit 源码和测试解释实现。不能把
浮动 `main` 源码当作 4.0.2 证据，也不能因为传递依赖已有 server renderer 就自行扩成 Node SSR
fixture。

本文严格区分三层结论：

| 层级 | 可以写成什么 | P05 示例 |
| --- | --- | --- |
| 官方公开契约 | 课程正文默认结论 | 每请求新建 app/store、恢复 root state 顺序、`$dispose()`、HMR snippet |
| 固定 4.0.2 源码/测试推导 | 必须显式标版本 | Setup/Options 水合分支、shape reconciliation、HMR todo |
| P05 应用策略 | 只能写成课程选定方案 | SPA 内存模型、按钮流程、资源清理、Deferred evidence matrix |

## 研究结论

1. SSR 服务进程会跨请求复用模块；若把 Pinia 作为模块级 singleton，用户特定 state 可能泄漏到
   其他请求。Vue 官方解法是每个请求创建完整 app、router 和 global store 实例；对 Pinia 即每个
   request 独立调用 `createPinia()`。
2. Pinia 组件 `setup()` 内可以由注入上下文取得当前实例；SSR 中在组件外、路由逻辑或其他上下文
   使用 Store 时，应把该请求的 Pinia 显式传给 `useStore(pinia)`，不能依赖进程级 active fallback。
3. 服务端应在渲染完成后读取 `pinia.state.value`。Pinia 只暴露 root state，不负责把它安全嵌入
   HTML；serializer、HTML context escaping、CSP、传输和客户端 parser 配对都属于宿主 SSR 层。
4. Pinia 官方推荐按 SSR 环境使用 `devalue` 防 XSS，但本仓库没有安装它。课程不得伪造 import、
   固定一个未核实的 API 签名，或把 `JSON.stringify()` 的数据 round-trip 当作安全 HTML 注入。
5. 客户端必须在第一次调用任何 `useStore()` 前恢复 `pinia.state.value`。本地 4.0.2 机械实验确认：
   Options Store 在恢复前创建时，随后整体替换 root state 会让 `store.count` 仍连着旧对象，而
   `store.$state.count` 读取新 root，形成 `0 / 7` 分叉；这正是 P05 可验证的错误顺序 seam。
6. Options Store 有 initial state 时不会用 state factory 建立普通 local state，而会把 root state
   转成 refs；复杂或 client-only composable 需要公开 `hydrate(storeState, initialState)` hook。
7. Setup Store 总会执行 setup。固定 4.0.2 会把 initial state 写入顶层 ref，或递归 merge 顶层
   reactive object；`skipHydrate()` 标记使 `shouldHydrate()` 在该顶层对象返回 false。
8. `skipHydrate()` 只解决 Setup Store 某个顶层 state property 的“不要接收 initial value”，不负责
   序列化、转义、删除 root state 或消除 Vue DOM hydration mismatch。固定测试把 nested
   `skipHydrate()` case 标为 `it.skip`，课程不得宣称嵌套标记已受支持。
9. Vue hydration 是客户端复用 server-rendered DOM 的过程。内存里恢复 Pinia state 只能证明
   Pinia 数据顺序；没有 server HTML、client hydrate、console mismatch 检查，就不能声称真实
   hydration 已通过。
10. Pinia 官方 HMR 用法要求在 Store definition 旁通过
    `import.meta.hot.accept(acceptHMRUpdate(useStore, import.meta.hot))` 建立边界。固定 4.0.2 的
    `acceptHMRUpdate()` 在 production 返回 no-op；当前官方明确支持 Vite。
11. HMR 的“保留 state 并增删 shape”不是简单保留完整旧对象。Options Store 对嵌套 plain object
    以新 definition shape 为准保留同名旧值；Setup Store 的 ref object 会整体转移旧值，以保住
    runtime-added 属性。固定 issue #2611 与对应测试记录了这一差别。
12. Store ID 不能写成“任意变更都会 invalidate”的无条件规则。固定 helper 先要求新导出 Store ID
    已存在于当前 Pinia registry，随后才比较 initial ID 并调用 `hot.invalidate()`；单 Store 改成从未
    注册的新 ID 时，该 export 通常被跳过。可靠课程结论只能是“ID 是 HMR identity，必须稳定；不匹配
    可能跳过更新或触发 invalidation，不能承诺 state preservation”。
13. 固定 `hmr.spec.ts` 覆盖 state/action/getter 的增删与响应性，但 `$subscribe()` 和
    `$onAction()` 跨 HMR 保持仍是两个 `it.todo`。P05 不得把订阅保持写成已保证行为。
14. `store.$dispose()` 停止该 Store scope、清除 Store subscriptions/action subscriptions 并从
    registry 移除，但公开声明明确说明不会删除 root state；再次 `useStore()` 会创建新实例并复用
    旧 state。
15. `disposePinia()` 停止整个 Pinia effect scope，清空 registry、plugins 与 root state，并解除 app；
    公开 API 明确说明实例之后不可再使用。它不是单 Store reset，也不是可逆的“退出登录”。
16. Pinia 官方介绍列出的 Devtools 能力包括 action/mutation timeline、组件使用的 Store、time
    travel 和调试。固定 runtime 还实现 inspector、state 编辑、copy/paste、save/open 与 reset；这些
    是开发客户端集成能力，普通页面 DOM 或一段说明文字不能证明它们工作。
17. 固定 `devtools.spec.ts` 只有“testing Pinia mocked action 不被 Devtools wrapper 破坏”用例，不是
    inspector/timeline/time-travel UI 覆盖。没有真实 Vue Devtools client 时必须保持
    `Deferred/not-run`。
18. P05 的两个 Demo 只能真实证明 SPA 进程内的 Pinia 隔离、恢复顺序、`skipHydrate()` 顶层语义和
    dispose lifecycle。Node SSR、HTML escape/CSP、浏览器 hydration、Vite hot update 与 Devtools
    client 均不在当前运行 seam 内，不能用固定文案、模拟 callback 或截图冒充。

## P05 冻结范围

| 课程 | 冻结值 |
| --- | --- |
| L13 | `vue.pinia.learn.advanced.ssr-hydration` |
| L13 标题 | `SSR 与 Hydration` |
| L13 前置 | L01-L12 和 Vue SSR/Hydration 基础 |
| L13 related | `outside-components-router`、`plugins-persistence` |
| L13 唯一 Demo | `vue.pinia.learn.advanced.ssr-hydration.pinia-ssr-hydration-model-lab-demo` |
| L14 | `vue.pinia.learn.advanced.hmr-devtools-maintenance` |
| L14 标题 | `HMR、Devtools 与维护` |
| L14 前置 | L01-L13 |
| L14 related | `subscriptions-actions`、`store-testing` |
| L14 唯一 Demo | `vue.pinia.learn.advanced.hmr-devtools-maintenance.pinia-store-lifecycle-maintenance-lab-demo` |
| 批次发布 | L13-L14 与同一 focused Gate 原子进入 `available` |
| 完成状态 | 14 课全部 `available`，公开 track 下一课为空 |
| 依赖边界 | 不安装 `devalue`、`@pinia/nuxt`、Devtools package 或其他依赖 |
| 停止边界 | P05 Gate 后只关闭 14 课主线，不进入 PRA1、PRA2-PRA4 或搜索收口 |

本文只为后续两篇课程正文、两个唯一 Demo 和 P05 验收提供事实底稿。本次不修改 manifest、entry、
Demo、spec、实施计划或依赖，也不把官方测试、固定源码阅读和本地 Node 内存实验写成项目 Gate
已经通过。

实施期 metadata 的 related 数组冻结为：

```ts
const l13Related = [
  'vue.pinia.learn.intermediate.outside-components-router',
  'vue.pinia.learn.advanced.plugins-persistence',
]

const l14Related = [
  'vue.pinia.learn.intermediate.subscriptions-actions',
  'vue.pinia.learn.advanced.store-testing',
]
```

## L13：SSR 与 Hydration

### 1. 目标、前置与排除

- **目标：** 建立“每请求独立 Pinia -> 服务端渲染后读取 root state -> 宿主安全序列化/转义 ->
  客户端任何 `useStore()` 前恢复 -> Options/Setup Store 按各自规则水合”的完整顺序模型。
- **前置：** L01-L12；理解 `createSSRApp()`/`renderToString()`/客户端 hydrate 的基本职责，能区分
  Pinia root state hydration 与 Vue DOM hydration。
- **本课排除：** 不创建 Node server/client 双入口，不安装 `devalue` 或 `@pinia/nuxt`，不设计 CSP、
  nonce、streaming SSR、islands、缓存或认证协议，不把当前 SPA 改造成 SSR 应用，也不进入 HMR。

### 2. 每请求实例与正确时序

正确架构由宿主每次 request 调用 app factory：创建新的 SSR app、router 和 Pinia，再安装到同一
app。Server render 期间 Store 读取和写入只进入该请求的 Pinia；渲染完成后再读取
`pinia.state.value`，因为组件 setup/server prefetch 可能在渲染过程中才填充 state。

Pinia 公开 SSR guide 允许 setup 顶层直接调用 `useStore()`，因为 app injection context 能定位当前
Pinia。以下情况必须把请求实例显式传给 `useStore(pinia)`：

- app setup 外的服务端函数；
- 使用 `this.$pinia` 的 `serverPrefetch()`；
- 不能确定 injection context 的 router/service callback；
- 同一进程同时存在多个 app/Pinia 的教学和测试场景。

课程不得使用模块级 `const pinia = createPinia()` 服务所有 request，也不得把
`setActivePinia()` 的 mutable fallback 当作请求隔离机制。Vue 官方明确指出，服务端模块通常只在
启动时初始化一次；共享 singleton 会造成 cross-request state pollution。

客户端顺序冻结为：

1. 创建 client app 与新的 client Pinia。
2. 从宿主定义的传输位置取得并按配套协议解析 initial state。
3. 把解析结果赋给 `pinia.state.value`。
4. 此后才允许任何 `useStore()`，再执行 mount/hydrate。

`app.use(pinia)` 与第 3 步的相对位置可由框架集成决定；真正不可破坏的是“initial root state 先于
第一次 `useStore()`”。课程示例必须把这个约束写成显式 checkpoint，而不是依赖当前组件碰巧稍后
创建 Store。

### 3. `pinia.state.value`、序列化与转义责任

`Pinia.state` 的本地 4.0.2 公开声明是 `Ref<Record<string, StateTree>>`。它是服务端完成渲染后的
state 数据源，也是客户端恢复入口，但不是 transport/security API。

责任边界必须拆开：

| 阶段 | Pinia 提供 | 宿主必须负责 |
| --- | --- | --- |
| server render | 独立 root state | request factory、数据获取、错误/权限边界 |
| snapshot | `pinia.state.value` | 选取允许传给客户端的字段，避免 secret 泄漏 |
| serialize | 无内置 serializer | 选择 `devalue` 或配对 JSON 等协议，处理支持的数据类型 |
| embed HTML | 无内置注入/escape | 按 script/attribute/JSON 等具体 HTML context 防 XSS，配置 CSP |
| client restore | 可整体赋 root state | 找到 payload、验证/解析、在首个 `useStore()` 前赋值 |
| DOM hydrate | Pinia 只提供一致 state | Vue SSR/client bundle、真实 DOM hydration 与 mismatch 处理 |

Pinia guide 推荐 `devalue`，也说明在 state 可由 JSON 表达时，`JSON.stringify()`/`JSON.parse()` 可能
更快。但这两点不能被拼成一个不配对的代码路径：serializer 输出必须由对应 parser 消费，且“能
JSON round-trip”不等于“原样放进 `<script>` 就安全”。尤其用户可控字符串可能包含 script closing
sequence；HTML context escape 是宿主职责。

本仓库没有 `devalue`，所以 P05 只能引用官方推荐并把真实实现标为未安装/未运行。Demo 可使用
JSON-compatible fixture 做内存 clone，必须明确标注“只证明数据 round-trip，不证明 HTML escape、
CSP 或 XSS 防护”，也不得提供会让读者误以为已经安全的 inline script 模板。

### 4. Options Store 与 Setup Store 的水合差别

#### Options Store

固定 4.0.2 在 Store 创建前读取 `pinia.state.value[id]`。若 initial state 已存在，普通路径不会重新用
`state()` 覆盖它，而是对已有 root state 建立 refs。因此先恢复 root state，随后第一次
`useStore()` 才能让 direct property 与 `$state` 指向同一数据。

Options Store 的公开 `hydrate(storeState, initialState)` 只在 initial state 存在时调用，用于
custom ref、local storage ref 或 server/client 初值不同等“简单复制 root state 不够”的情况。这个
hook 是特殊 composable 的恢复入口，不是每个普通 Options Store 都必须实现，也不等于全局
serializer。

#### Setup Store

Setup Store 必须执行 setup 以创建 refs/reactive/actions/getters。固定 4.0.2 对顶层可序列化 state
property 执行：

- 普通 ref：把 `initialState[key]` 写入 `ref.value`；
- reactive object：用固定 merge 逻辑递归写入；
- `shouldHydrate(prop) === false`：保留 client setup 创建的值；
- 最后把该 ref/reactive property 接回 `pinia.state.value[id][key]`，保持 Store/root 同步。

`skipHydrate(obj)` 通过不可枚举 Symbol 标记传入对象，返回同一对象；`shouldHydrate()` 对有该
own-property 标记的对象返回 false，对未标记对象、nullish 和 primitive 返回 true。由此得到四条
课程限制：

1. 它是 Setup Store 顶层 state property helper；Options Store 使用 `hydrate()`。
2. 它不会把字段排除出 root state 或自动排除序列化。
3. 它不提供 HTML/XSS sanitization。
4. 固定测试明确没有通过 nested marker case，不能把 `ref({ child: skipHydrate(...) })` 写成支持。

### 5. L13 唯一 Demo 可测试 contract

唯一 Demo 是“Pinia SSR/hydration 顺序内存实验台”，不是 SSR renderer。所有 Store 调用显式传入
Demo Pinia，并通过现有 `preserveActivePinia()` 恢复宿主 active Pinia。

必须有以下真实可观察 seam：

1. “模拟请求 A/B”各自调用 `createPinia()`，使用相同 Store definition/ID，分别写入明确不同的
   `requestLabel/count`，再显示两份 `pinia.state.value`；修改 A 后 B 不变。
2. “服务端快照”只把两份 JSON-compatible root state 做确定性内存 clone，显示 serializer/XSS
   状态为 `Deferred/not-installed`；不生成或执行 inline HTML。
3. “先恢复后创建”创建 client Pinia A，先整体赋 snapshot，再首次 `useStore(piniaA)`；Store direct
   property、`$state` 与 root state 三者一致。
4. “先创建后恢复”创建 client Pinia B，先 `useStore(piniaB)` 得到默认 refs，再整体替换 root；固定
   4.0.2 下显示 direct property 仍是默认值，而 `$state`/root 已是 snapshot，明确标成错误顺序。
5. Setup Store 使用一个普通 `ref` 与一个 `skipHydrate(ref(...))` 顶层字段。恢复前置 initial state
   后，普通值采用 server fixture，标记值保留 client fixture；同时用公开 `shouldHydrate()` 显示
   `true/false`。
6. Demo 不读取 `_s/_p/_e/_hmrPayload` 等 internal，不用 `setActivePinia()` 模拟 request ownership，
   不把对象 identity 或固定显示文字当作真实 Node SSR。
7. 重置会 dispose 当前全部 Demo Pinia 并重新建立确定性基线；重复操作不累计 subscriptions、Store
   或时间线。总卸载调用 `disposePinia()`，恢复宿主 active Pinia。
8. 操作前后宿主 Pinia、Router/URL、`localStorage/sessionStorage` 不变；本课不创建 timer、network、
   global listener 或临时持久化 key。

### 6. L13 易错点

1. **误区：** 在模块顶层创建一个 Pinia 可供所有 SSR request 共用。
   **纠正：** 服务端模块跨请求复用；每个 request 必须创建新 app/router/Pinia，防止用户 state
   泄漏。
2. **误区：** 组件外 `useStore()` 总能从 active Pinia 找到正确请求。
   **纠正：** SSR 多实例环境应显式传当前 request 的 Pinia；mutable fallback 不是隔离边界。
3. **误区：** server setup 前就能导出最终 `pinia.state.value`。
   **纠正：** 组件 setup/server prefetch 可在 render 中填 state；官方顺序是 render 后读取 root。
4. **误区：** `JSON.stringify(rootState)` 原样放进 `<script>` 已自动防 XSS。
   **纠正：** JSON round-trip 与 HTML context escaping 是两件事；宿主必须选安全的配对协议。
5. **误区：** Pinia 内置 `devalue` 并替应用完成序列化。
   **纠正：** Pinia 只推荐它；本仓库未安装，package/API/escape policy 都属于宿主依赖决策。
6. **误区：** 客户端先创建 Store，再恢复 root state，结果仍完全等价。
   **纠正：** 固定 4.0.2 可让 Options Store direct refs 与整体替换后的 root 分叉；必须先恢复。
7. **误区：** Options Store 和 Setup Store 使用同一个特殊水合 hook。
   **纠正：** Options Store 对复杂 state 使用 `hydrate()`；Setup Store 对顶层对象使用
   `skipHydrate()`。
8. **误区：** `skipHydrate()` 会排除字段序列化并递归处理所有后代。
   **纠正：** 它只阻止被标记顶层对象接收 initial value；nested case 在固定测试中仍为 skipped。
9. **误区：** Pinia state 数值一致就代表 Vue hydration 没有 mismatch。
   **纠正：** DOM structure、随机值、时区和 client-only API 都会造成真实 mismatch，必须用真实
   server HTML/client hydration 验证。
10. **误区：** 当前 SPA 的两个内存对象等于两个真实 HTTP requests。
    **纠正：** 它只证明 Pinia instance/root state 隔离；进程并发、HTML、CSP 与网络均未运行。

### 7. L13 编号源码/测试推导与适用场景

1. 固定 `createPinia.ts` 每次创建独立 effect scope、root `ref({})` 和 Store registry；适用于解释
   per-request factory 的必要基础，但“每 request 调用”仍由宿主负责。
2. 固定 `rootStore.ts` 把 `state` 声明为公开 `Ref<Record<string, StateTree>>`，并警告 server active
   fallback 可能 cross-request pollution；适用于 root snapshot 和组件外显式实例。
3. 固定 SSR guide 规定 render 后读取 `pinia.state.value`，并要求安全转义和客户端首个
   `useStore()` 前恢复；适用于冻结完整时序与 security ownership。
4. 固定 `store.ts` 的 Options Store 分支在 initial state 存在时对 root state 建 refs；适用于解释
   为什么“先 Store、后整体替换 root”会产生旧 ref/new root 分叉。
5. 同一 `store.ts` 对 Setup Store 的顶层 ref 赋 initial value、对 reactive object merge，再接回 root；
   适用于普通 Setup state 的自动 hydration，不代表任意 class/DOM object 都可传输。
6. `skipHydrate()`/`shouldHydrate()` 固定实现只检查传入对象自身 Symbol；适用于 client-only 顶层
   state property。`state.spec.ts` 的 nested case 为 `it.skip`，因此不扩大成递归保证。
7. 固定 `types.ts` 与 composables guide 的 Options `hydrate()` 说明只在 initial state 存在且普通复制
   不够时使用；适用于 custom ref/browser composable，不应代替全局恢复顺序。
8. 固定 `ssr.spec.ts` 用两个 `createSSRApp()`/Pinia 验证 app 隔离，并覆盖 Options/Setup initial
   state；适用于上游行为依据，但它没有覆盖本项目 HTML 注入、CSP 或浏览器 hydration。

### 8. L13 证据边界

| 能力 | P05 SPA Demo/Focused Vitest 可证明 | 状态 |
| --- | --- | --- |
| 两个 Pinia root state 隔离 | 同进程、确定性 fixture | 可运行 |
| 首个 `useStore()` 前/后恢复差别 | Pinia 4.0.2 内存行为 | 可运行 |
| `skipHydrate()`/`shouldHydrate()` 顶层行为 | 普通/标记 ref 对照 | 可运行 |
| Node SSR request factory | 无 HTTP/Node server fixture | `Deferred/not-run` |
| `renderToString()` 后 snapshot | 当前 Demo 不执行 SSR renderer | `Deferred/not-run` |
| 安全 HTML 注入、XSS、CSP | 无 serializer package/HTML response | `Deferred/not-installed` |
| 浏览器 Vue hydration/mismatch | 无 server HTML + client hydrate 双入口 | `Deferred/not-run` |

## L14：HMR、Devtools 与维护

### 1. 目标、前置与排除

- **目标：** 区分组件消费寿命、`store.$dispose()`、Store 重建、`disposePinia()`、HMR shape/identity
  和 Devtools 开发客户端能力，并知道每一种结论需要什么证据。
- **前置：** L01-L13，尤其是 Setup Store scope、subscriptions、显式 Pinia、plugin cleanup、Store
  testing 与 SSR/hydration evidence boundary。
- **本课排除：** 不编写 Vite plugin/HMR protocol，不修改 dev server 配置，不安装或自动操作浏览器
  Devtools extension，不依赖 Pinia internal，不承诺生产 Devtools，不把 HMR 设计成数据迁移方案。

### 2. 组件、Store 与 Pinia 三层寿命

| 操作 | 公开可观察结果 | 不应声称 |
| --- | --- | --- |
| 卸载消费组件 | 组件 scope 内订阅/observer 清理；Store 可继续存在 | 等同 `store.$dispose()` |
| `store.$dispose()` | 停 Store scope/订阅并移出 registry；root state 保留 | 自动删除 state 或可继续依赖旧实例 |
| 再次 `useStore(pinia)` | 创建新 Store 实例，复用相同 ID 的旧 root state | 旧 Store identity/订阅被恢复 |
| `disposePinia(pinia)` | 停整个 Pinia，清 stores/plugins/root state，实例不可复用 | 单 Store reset、可逆 pause 或 logout API |

课程只通过公开属性验证：Store identity、state value、subscription counter、
`pinia.state.value` 和重新 `useStore(pinia)` 的结果。`pinia._s` 虽能在源码中解释 registry，但 Demo
和项目测试都不得把 internal Map 当业务 seam。

`$dispose()` 后仍持有旧 Store 引用不代表它是受支持的活跃实例。课程可做一次受控 mutation 来证明
旧 subscription 已停止，但随后应放弃旧引用；真实应用的可靠路径是重新调用 `useStore()` 或销毁
整个 Pinia。

### 3. HMR 接入、Store ID 与 shape

Pinia 官方 HMR contract 是开发期、Store module 自接受边界：

```ts
export const useAuthStore = defineStore('auth', {
  // state, getters, actions
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
```

这段代码必须位于真实 Vite module 中，由 Vite 检测 `import.meta.hot.accept(` 并在文件更新时传入新
module。直接调用 `acceptHMRUpdate()` 返回的 callback 只能做 unit model，不能证明 Vite watcher、
WebSocket、module graph、accept boundary 或浏览器 state preservation。

固定 4.0.2 helper 的精确 ID 路径是：

1. production 立即返回 no-op；
2. 从 `hot.data.pinia` 或 initial Store definition 的 dev-only `_pinia` 找当前实例；
3. 遍历新 module exports，只处理有字符串 `$id` 且该 `$id` 已在当前 registry 的 Store definition；
4. 处理中的 `$id` 若与 initial `$id` 不同，报告 `PINIA_R1005` 并 `hot.invalidate()`；
5. ID 相同则用现有 Store 执行 fixed internal hot update。

因此 L14 正文必须要求 ID 稳定，但不能沿用“单 Store 改任何 ID 必然 invalidate”的过强表述。固定
本地机械实验得到：只导出一个未注册新 ID 时 invalidation 次数为 0；新 module 出现另一个已注册
Store ID 时才进入 mismatch 分支并 invalidate。这是固定实现推导，不是鼓励业务依赖 registry。

shape reconciliation 也要区分 Store 风格：

- 新 definition 增加顶层 state/action/getter 时，现有 Store 获得新成员；删除的旧成员被移除。
- 同名 state 保留当前 runtime value，不回到新 factory 默认值。
- Options Store 的嵌套 plain object 以新 shape 为骨架，只把仍存在的旧 key/value 合入；新 definition
  删除的 nested key 会消失。
- Setup Store 对 ref/reactive 顶层 state 的处理不同。对 ref object，固定 #2611 修复会整体转移旧
  runtime object，以保留运行时新增的 optional property。
- Array、Map、Set、ref、reactive 与 plain object 不应被归纳成一个通用 deep merge 规则。
- `$subscribe()`/`$onAction()` 跨 update 是否保持在固定测试中仍为 todo，课程必须写成未保证。

### 4. Devtools 能力与真实证据

Pinia 官方介绍公开描述的 Devtools 能力是：

- timeline 跟踪 actions 和 mutations；
- 在组件上显示其使用的 stores；
- time travel 与更方便的 debugging。

固定 4.0.2 runtime 的 Devtools plugin 还实现 root/store inspector、state edit、root state
copy/paste/save/open、Options Store reset、action start/end/error 和 mutation timeline、HMR event，
并在 Store dispose 后刷新 inspector。它们是固定版本实现说明，不应转成应用调用 internal
Devtools API 的教程。

Devtools 注册受 client/dev build 条件和真实 `@vue/devtools-api` client 连接影响。项目页面能显示
Store state 或一张“Devtools 支持”卡片，不等于 inspector/timeline 收到事件；固定
`devtools.spec.ts` 也只验证 mocked action wrapper compatibility，不含真实 UI。

若未来单独批准真实 Devtools Gate，最低证据应包括：真实 Vue Devtools client 已连接；Pinia
inspector 能看到目标 Store；一次真实 action/mutation 出现在 timeline；state edit 反映到页面；
dispose 后 inspector 更新；记录使用版本、浏览器和实际操作。当前 P05 不执行，统一
`Deferred/not-run`。

### 5. L14 唯一 Demo 可测试 contract

唯一 Demo 是“Store lifecycle 维护实验台”。它创建独立 Pinia 和可卸载的 mini-app/consumer，HMR
与 Devtools 只展示 evidence status，不制造事件或伪 PASS。

必须有以下真实可观察 seam：

1. 第一次 `useStore(pinia)` 后重复调用返回同一实例；只用 identity 证明 registry reuse，不读 `_s`。
2. consumer 组件有一个 scope-owned subscription/observer。卸载 consumer 后该 observer 不再运行，
   但同一 Store action 仍能修改 state，证明组件寿命不等于 Store 寿命。
3. Demo 另建一个 detached subscription 并保存 stop。调用 `store.$dispose()` 后再做一次受控 state
   mutation，旧 Store 的 Store scope watcher、state subscription 与 action subscription 都不再增加。
4. 再次 `useStore(pinia)` 得到不同实例，且从保留的 root state 起步；给新实例重新注册最少
   subscription 后 mutation 正常触发。不得暗示旧 subscription 被继承。
5. 调用 `disposePinia(pinia)` 后，公开 `pinia.state.value` 为空，所有后续操作按钮禁用并标记实例
   不可复用；不通过尝试调用已销毁实例建立生产契约。
6. HMR 状态固定显示“需要真实 Vite file update：Deferred/not-run”，Devtools 状态固定显示“需要
   真实 client：Deferred/not-run”；按钮不得直接调用 internal `_hotUpdate` 或 Devtools plugin。
7. “重置实验”若需要继续操作，必须先完整 dispose 旧 mini-app/Pinia，再创建全新资源；不能复用
   已 `disposePinia()` 的实例。
8. 总卸载停止显式订阅、卸载 mini-app、删除临时 node、dispose 当前 Pinia、恢复宿主 active Pinia；
   宿主 Router/URL、Store、storage、Devtools global 均不读写。

### 6. L14 易错点

1. **误区：** 消费组件卸载会自动销毁 Store。
   **纠正：** Store scope 可超出组件；组件 observer 清理与 Store/Pinia disposal 是三层寿命。
2. **误区：** `store.$dispose()` 会删除 `pinia.state.value[id]`。
   **纠正：** 公开声明明确不删除；需要时由应用显式删除，再次使用默认会复用旧 state。
3. **误区：** `$dispose()` 后继续持有旧 Store 是正常长期用法。
   **纠正：** 它已退出 registry 且 scope/subscriptions 停止；应放弃旧引用并按需要重建。
4. **误区：** `disposePinia()` 是全局 `$reset()`，之后还能继续 `useStore(pinia)`。
   **纠正：** 它清理整个实例并使其不可复用；重启实验必须 `createPinia()`。
5. **误区：** 定义 Store 后 Vite 会自动替它接入 Pinia HMR。
   **纠正：** Store module 需要 guarded `import.meta.hot.accept(acceptHMRUpdate(...))`。
6. **误区：** `acceptHMRUpdate()` 在 production 会执行迁移。
   **纠正：** 固定实现返回 no-op；HMR 不能代替 production schema migration 或 persistence。
7. **误区：** Store ID 改名总能保留 state，或总会无条件强制 reload。
   **纠正：** fixed helper 先按新 `$id` 查已注册 Store；不匹配可能跳过或 invalidate，ID 必须稳定。
8. **误区：** Options/Setup Store 的 nested state 都做同一种 deep merge。
   **纠正：** Options plain object 与 Setup ref object 路径不同；#2611 专门保留 runtime-added ref
   属性。
9. **误区：** `$subscribe()`/`$onAction()` 一定跨 HMR 保持。
   **纠正：** 固定 4.0.2 官方测试仍是两个 todo；必须按未保证处理。
10. **误区：** 页面显示 Store、HMR 状态或截图就证明真实 Devtools/HMR。
    **纠正：** HMR 需真实 Vite update；Devtools 需真实 client inspector/timeline 事件。

### 7. L14 编号源码/测试推导与适用场景

1. 固定 `store.ts` 的 `$dispose()` 停 scope、清两类 subscription 并删除 registry entry；公开 d.ts
   另外明确 root state 保留。适用于临时 Store/测试 cleanup，不是 state deletion。
2. 固定 `store.spec.ts` 断言 dispose 后旧 subscription 不再运行、再次 `useStore()` 返回不同实例；
   适用于 L14 public identity/subscription seam。
3. 固定 `createPinia.ts` 的 `disposePinia()` 停整个 effect scope并清 stores/plugins/root/app；
   `lifespan.spec.ts` 证明 Store setup watcher 停止。适用于测试、多 Pinia app 的总清理。
4. 固定 `hmr.ts` 在 dev 中保存 Pinia 到 `hot.data`、筛选 Store exports、按 ID 决定 update/invalidate；
   适用于解释 identity，课程不访问 `_pinia/_s`。
5. 固定 `store.ts` `_hotUpdate` 会增删 state/actions/getters，并对 Options plain object 与 Setup ref
   使用不同迁移路径；适用于 shape 教学，不应复制 internal 实现到应用。
6. 固定 `hmr.spec.ts` 覆盖新增/删除成员、响应性、Options nested shape 与 Setup runtime-added
   property；issue #2611 说明后者曾丢失。适用于解释为何不能自创通用 deep merge。
7. 同一 `hmr.spec.ts` 对 `$subscribe()`/`$onAction()` 保持仍为 `it.todo`；适用于冻结
   “不保证跨 HMR 保持”的维护策略。
8. 固定 Devtools runtime 实现 inspector/timeline/edit/import/export/dispose refresh，但
   `devtools.spec.ts` 只覆盖 mocked action preservation；适用于列能力与证据缺口，不能声称 UI green。

### 8. L14 证据边界

| 能力 | P05 SPA Demo/Focused Vitest 可证明 | 状态 |
| --- | --- | --- |
| consumer unmount 与 Store 存续 | 独立 mini-app、真实组件卸载 | 可运行 |
| `$dispose()` 停订阅且 root state 保留 | 公开 Store/root/identity seam | 可运行 |
| 再次 `useStore()` 新实例复用 state | public identity + state | 可运行 |
| `disposePinia()` 清 root 并结束资源 | public root state + cleanup | 可运行 |
| `acceptHMRUpdate()` fixed callback model | 只可做 unit-level 源码/上游依据 | 不作为真实 HMR Gate |
| Vite file hot update/state preservation | 无真实文件更新与 HMR event 采集 | `Deferred/not-run` |
| Devtools inspector/timeline/edit/time travel | 无真实 Vue Devtools client | `Deferred/not-run` |

## 两课资源与宿主隔离

1. 两个 Demo 都只创建自己的 Pinia；所有组件外 `useStore()` 显式传实例，并用已有
   `preserveActivePinia()` 包裹会改变 active Pinia 的同步操作。
2. Store ID 使用 `pinia-p05-...` 前缀并在两个 Demo 间互不重复；不得使用宿主 theme/progress Store
   ID，也不得访问宿主 Pinia internal registry。
3. L13 不需要 mini-app、router、storage、listener、timer 或 network；重置/卸载 dispose 所有模拟
   request/client Pinia。
4. L14 的 mini-app 只为真实 consumer mount/unmount；node 只挂在 Demo 自己的 host 下，卸载时
   `app.unmount()` 后删除，不向 `document.body` 留 orphan。
5. L14 保存每个 `$subscribe()`/`$onAction()` 返回的 stop；即使 `$dispose()` 会清 Store-owned
   subscriptions，Demo 总清理仍显式停止仍存活的外部资源，且不得把 stop 重复执行结果当课程重点。
6. 两课均保存宿主 `getActivePinia()`、`window.location.href`、Router route 与 storage baseline；测试
   结束只比较，不改写宿主。不得创建 global `window.__pinia` 或 `$store/$pinia` 调试变量。
7. 时间线只使用有界数组和确定性步骤编号，不使用随机数、墙钟、真实网络或跨 Demo共享 counter。
8. 所有 async callback 在 teardown 后必须由 active flag 阻止回写；P05 设计本身不需要 pending
   Promise，保持最小实现。

## P05 原子发布、文件范围与 Gate

### 1. 实施期允许文件

P05 实施只能触及以下文件：

1. `src/content/entries/learn/vue/pinia/advanced/ssr-hydration.ts`
2. `src/content/entries/learn/vue/pinia/advanced/hmr-devtools-maintenance.ts`
3. `src/content/demos/vue/pinia/learn/advanced/ssr-hydration/pinia-ssr-hydration-model-lab-demo.vue`
4. `src/content/demos/vue/pinia/learn/advanced/hmr-devtools-maintenance/pinia-store-lifecycle-maintenance-lab-demo.vue`
5. `src/content/catalog/manifests/vue-pinia-track.ts`
6. `src/content/catalog/vue-pinia-p05.spec.ts`
7. `src/content/catalog/vue-pinia-p04.spec.ts`，只允许把 P04 历史阶段断言收窄为前十二课前缀；不得
   修改 L11/L12 行为 cases。
8. `docs/重构实施计划.md`，只允许在 P05 全部 Gate 与双轴复审通过后登记最终 closure、实际命令、
   evidence boundary 和 SHA；Gate 完成前不得预写 PASS。

第 7 项是当前快照确认的必要兼容修改：P04 首个 case 精确断言 L13-L14 为 `planned`，并要求
`track.entries` 精确只有前十二课。P05 原子开放会使它必然失败。只需删除“P05 永久 planned”断言，
把 `track.entries` 精确相等改成前十二课 prefix；P01-P03 已只检查各自 prefix，不需要修改。

除以上 allowlist 外，不修改 P01-P04 entry/Demo/行为测试、共享 registry/schema、Router、宿主
Store、P0-P05 research、其他计划内容、Reference/PRA、搜索、E2E 配置、package/lockfile、
`.playwright-cli/`、`docs/backend/` 或 `output/`。若发现必须扩大文件范围，先停止并重新批准。

### 2. Focused Vitest red/green

1. 开始前复算本文头部的 P0/P04/manifest/package/lock SHA，并记录 `git status --short`；冻结输入
   改变时先做差异审计，不能复用本次结论冒充当前证据。
2. 先新建唯一 `vue-pinia-p05.spec.ts`，通过公开 `learningCatalog` 与 `resolveDemo()` 期待 14 课
   全部按冻结顺序 `available`、`track.entries` 零差异、下一课为空、L13/L14 各一个唯一 Demo；
   entry/Demo/manifest 修改前运行，必须因 P05 仍 planned 而 red。
3. 同一个 spec 只增加两条最小 runtime cases：L13 覆盖 request A/B 隔离、恢复前后 direct/root
   差别和顶层 skip；L14 覆盖 consumer unmount、`$dispose()`、重建 identity/state、
   `disposePinia()` 清理。不得为每个易错点复制测试。
4. 同批新增两篇 entry 与两个 Demo，最小收窄 P04 阶段断言，并一次性把 manifest 的 L13/L14 改为
   `available`；不得出现只开放一课的中间交付。
5. 复跑同一 P05 spec 转绿，再运行 P01-P05 Pinia specs与 entry template/registry 相关定向 Vitest。
6. P05 最终批再运行全量 `npm test`；任何失败按本批回归与已有 dirty 范围精确归因，不能把 focused
   green 写成全量 green。

Focused tests 只能断言 SPA 内公开 seam。禁止在 test 中直接调用 `_hotUpdate`、读取 `_s`、mock
Devtools client、构造伪 `import.meta.hot` 后把结果标成真实 HMR，或用 `innerHTML` 字符串冒充 SSR
security test。

### 3. 静态与 build Gate

P05 完成前至少执行：

1. `npm run type-check`
2. 触及文件定向 Oxlint。
3. 触及文件定向 `prettier --check`。
4. 两个新 Demo 定向检查禁止 CSS `grid` 和 `gap`。
5. `git diff --check -- <P05 allowlist tracked files>`，并对新建 untracked 文件单独检查 trailing
   whitespace。
6. `npm run build`；这是 P05 最终批 Gate，但 production build 成功不等于 production HMR 或
   Devtools 已验证。

不要运行 repository-wide formatter，不清理 dirty workspace，不安装依赖，不提交、不推送、不建
PR。命令输出必须记录实际 exit code；未运行项不得写 PASS。

### 4. 浏览器 Gate

未来实施只复用已有 `localhost:5173`，不得启动第二个 dev server。用一条可复跑 Playwright 路径
依次验证：

1. L13 两个模拟 request 初始隔离，修改 A 不改变 B。
2. L13 正确恢复路径 direct/`$state`/root 一致，错误顺序路径显示 direct/root 分叉。
3. L13 普通 ref 接收 server fixture，`skipHydrate` ref 保留 client fixture；证据状态清楚标明真实
   SSR/hydration/security 未运行。
4. L14 consumer 卸载后 Store 继续更新，component observer 已停止。
5. L14 `$dispose()` 后旧 subscription 停止，重新 `useStore()` identity 变化且 state 保留，
   `disposePinia()` 后 root 清空与控件禁用。
6. 两课 reset 后结果确定，切课/卸载后无 listener、node、subscription、Pinia 或 async 回写残留。
7. 宿主 active Pinia、URL/Router、storage 均不变；无 console warning/error/pageerror。
8. 键盘操作、390px、200% 文本、`prefers-reduced-motion: reduce`、无水平溢出均通过；CSS 不使用
   `grid` 或 `gap`。

该浏览器 Gate 仍是 SPA Gate。它不得把以下能力改写为 green：

| 外部宿主能力 | 当前 P05 状态 | 未来真实证据最小要求 |
| --- | --- | --- |
| Node SSR | `Deferred/not-run` | per-request app factory + real `renderToString()` |
| HTML state security | `Deferred/not-installed` | 已批准 serializer + 配套 parser + HTML context/CSP review |
| Vue hydration | `Deferred/not-run` | server HTML + client hydrate + mismatch/console 采集 |
| Vite HMR | `Deferred/not-run` | 实际编辑 Store 文件 + hot event + state/shape 观察 |
| Vue Devtools | `Deferred/not-run` | 真实 client connection + inspector/timeline/edit/dispose 观察 |

### 5. 双轴复审与停止边界

全部 focused/full tests、type-check、lint/format/whitespace、build 与 SPA browser Gate 完成后，做独立
Standards/Spec 双轴复审。只有 `PASS / 0 finding`，且上述五类真实宿主能力仍被诚实标记为
Deferred，才能关闭 P05。

P05 关闭只表示 Pinia 14 课课程主线按已批准 SPA evidence contract 完成，不表示 Reference、PRA、
搜索或真实 SSR/HMR/Devtools fixture 已完成。到此必须停止：不自动开始 PRA1，不修改 PRA2-PRA4，
不做搜索收口，不顺手安装 SSR/HMR/Devtools 依赖，不提交代码。

## P05 明确排除范围

- 本调研阶段只新增本文，不修改 manifest、entry、Demo、spec、实施计划或依赖。
- 不创建 Node server/client entry、Nuxt app、SSR router、HTML template、CSP 或 deployment config。
- 不安装 `devalue`、`@pinia/nuxt`、Devtools package 或任何新依赖。
- 不把 `JSON.stringify()` 说成 HTML-safe serializer，不提供未获批的生产 escape policy。
- 不访问或教授 `_s/_p/_e/_pinia/_hotUpdate/_hmrPayload` 等 internal 作为应用 API。
- 不通过伪 hot object、直接 internal callback、DOM 文案或截图生成 HMR/Devtools PASS。
- 不承诺 Store ID 改名保持 state，也不把 fixed conditional invalidate 写成无条件契约。
- 不承诺 `$subscribe()`/`$onAction()` 跨 HMR 保持。
- 不创建/修改 Pinia Reference、PRA、索引或搜索，不进入后端课程。
- 不启动 dev server、不打开页面；本文阶段所有浏览器 evidence 为 `Deferred/not-run`。
- 不提交、不推送、不创建 PR。

## 未决事实与后续批准点

1. **安全 serializer 未选型。** 官方推荐 `devalue`，但本仓库未安装；若未来需要真实 SSR fixture，
   必须单独批准 package、版本、serialize/parse API、HTML context 与 CSP 策略。
2. **真实 SSR 宿主未定义。** 当前 Vite SPA 没有 server/client 双入口、request factory 或 HTML
   injection seam；P05 课程发布按 P0 允许保持 Deferred。
3. **Store ID rename 行为不是稳定迁移协议。** 固定 4.0.2 的 registry-first 条件已核实；未来版本或
   Vite module shape 可能改变，课程只要求 ID 稳定。
4. **HMR subscription continuity 未闭合。** 固定上游有两个 todo；在官方给出通过测试/公开契约前，
   应按更新后重新建立外部订阅的保守策略设计。
5. **Devtools UI 未有真实客户端。** 当前只能引用官方能力与固定 runtime；若要求 UI Gate，需单独
   确认浏览器、Vue Devtools/Pinia 版本和连接方式。
6. **Vue/Vite 官方文档会漂移。** 本次另记录 Vue docs commit
   `b75d188ab16bf83bd1f364a77dfd2315be8f3fa4` 与 Vite docs repository commit
   `23b8a088dec9dcc3f1c1353f2074f8644b3cc21f`；P05 实施时若规则或版本变化，应重新核对。

## 一手来源

### Pinia 当前官方 Guide 与 API

- [SSR](https://pinia.vuejs.org/ssr/)
- [Composables / SSR](https://pinia.vuejs.org/cookbook/composables.html#ssr)
- [HMR](https://pinia.vuejs.org/cookbook/hot-module-replacement.html)
- [`skipHydrate()`](https://pinia.vuejs.org/api/pinia/functions/skipHydrate.html)
- [`shouldHydrate()`](https://pinia.vuejs.org/api/pinia/functions/shouldHydrate.html)
- [`acceptHMRUpdate()`](https://pinia.vuejs.org/api/pinia/functions/acceptHMRUpdate.html)
- [`$dispose()`](https://pinia.vuejs.org/api/pinia/interfaces/StoreWithState.html#dispose)
- [`disposePinia()`](https://pinia.vuejs.org/api/pinia/functions/disposePinia.html)
- [`Pinia.state`](https://pinia.vuejs.org/api/pinia/interfaces/Pinia.html#state)
- [Introduction / Devtools and HMR capabilities](https://pinia.vuejs.org/introduction.html)

### Pinia 4.0.2 固定文档、release 与 issue

- [Release `v4.0.2`](https://github.com/vuejs/pinia/releases/tag/v4.0.2)：发布说明为
  `No significant changes`
- [`ssr/index.md`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/docs/ssr/index.md)
- [`composables.md`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/docs/cookbook/composables.md)
- [`hot-module-replacement.md`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/docs/cookbook/hot-module-replacement.md)
- [`introduction.md`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/docs/introduction.md)
- [Issue #2611：Setup Store HMR runtime-added optional property](https://github.com/vuejs/pinia/issues/2611)

### Pinia 4.0.2 固定源码与官方测试

- [`createPinia.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/createPinia.ts)
- [`rootStore.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/rootStore.ts)
- [`store.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts)
- [`hmr.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/hmr.ts)
- [`types.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/types.ts)
- [`diagnostics.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/diagnostics.ts)
- [`ssr.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/ssr.spec.ts)
- [`state.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/state.spec.ts)
- [`hmr.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/hmr.spec.ts)
- [`store.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/store.spec.ts)
- [`lifespan.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/lifespan.spec.ts)
- [`devtools/plugin.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/devtools/plugin.ts)
- [`devtools.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/devtools.spec.ts)

### Vue 与 Vite 官方资料

- [Vue SSR / Cross-Request State Pollution](https://vuejs.org/guide/scaling-up/ssr.html#cross-request-state-pollution)
- [Vue SSR / Hydration Mismatch](https://vuejs.org/guide/scaling-up/ssr.html#hydration-mismatch)
- [Vue Security](https://vuejs.org/guide/best-practices/security.html)
- [Vue docs 固定核对文件](https://github.com/vuejs/docs/blob/b75d188ab16bf83bd1f364a77dfd2315be8f3fa4/src/guide/scaling-up/ssr.md)
- [Vite HMR API](https://vite.dev/guide/api-hmr)
