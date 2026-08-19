---
id: vue.pinia.learn.advanced.ssr-hydration
type: lesson
title: SSR 与 Hydration
summary: 按请求隔离 Pinia，在首个 useStore 前恢复状态，并划清真实 Hydration 证据边界
domain: frontend
technology: vue
module: pinia
related:
  - vue.pinia.learn.intermediate.outside-components-router
  - vue.pinia.learn.advanced.plugins-persistence
  - vue.pinia.reference.runtime.hydration
tags:
  - Pinia
  - SSR
  - Hydration
  - pinia.state.value
  - skipHydrate
  - shouldHydrate
  - XSS
appliesTo: Pinia 4.0.2；当前项目为 SPA 内存实验
verifiedAt: 2026-08-05
sources:
  - title: Pinia：SSR
    url: https://pinia.vuejs.org/ssr/
  - title: Pinia：Composables / SSR
    url: https://pinia.vuejs.org/cookbook/composables.html#ssr
  - title: Pinia：Pinia.state
    url: https://pinia.vuejs.org/api/pinia/interfaces/Pinia.html#state
  - title: Pinia：skipHydrate()
    url: https://pinia.vuejs.org/api/pinia/functions/skipHydrate.html
  - title: Pinia：shouldHydrate()
    url: https://pinia.vuejs.org/api/pinia/functions/shouldHydrate.html
  - title: Pinia 4.0.2 SSR guide
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/docs/ssr/index.md
  - title: Pinia 4.0.2 rootStore.ts
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/rootStore.ts
  - title: Pinia 4.0.2 store.ts
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts
  - title: Pinia 4.0.2 ssr.spec.ts
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/ssr.spec.ts
  - title: Pinia 4.0.2 state.spec.ts
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/state.spec.ts
  - title: Vue SSR：Cross-Request State Pollution
    url: https://vuejs.org/guide/scaling-up/ssr.html#cross-request-state-pollution
  - title: Vue SSR：Hydration Mismatch
    url: https://vuejs.org/guide/scaling-up/ssr.html#hydration-mismatch
  - title: Vue：Security
    url: https://vuejs.org/guide/best-practices/security.html
stage: advanced
level: advanced
estimatedMinutes: 70
prerequisites:
  - vue.pinia.learn.basics.setup-first-store
  - vue.pinia.learn.basics.state-patch-reset
  - vue.pinia.learn.basics.getters
  - vue.pinia.learn.basics.actions-async
  - vue.pinia.learn.basics.component-store-to-refs
  - vue.pinia.learn.intermediate.setup-stores
  - vue.pinia.learn.intermediate.store-composition
  - vue.pinia.learn.intermediate.store-modeling
  - vue.pinia.learn.intermediate.subscriptions-actions
  - vue.pinia.learn.intermediate.outside-components-router
  - vue.pinia.learn.advanced.plugins-persistence
  - vue.pinia.learn.advanced.store-testing
  - vue.core.learn.advanced.ssr-hydration
objectives:
  - 解释为什么 SSR 必须为每个 request 创建独立 app、router 与 Pinia
  - 在服务端渲染完成后读取 root state，并把传输与安全责任留给宿主
  - 在客户端首个 useStore 前恢复 pinia.state.value
  - 观察 Options Store 在正确与错误恢复顺序下的 direct/$state/root 差别
  - 区分 Setup Store 普通 ref 与顶层 skipHydrate ref 的水合行为
  - 区分 Pinia 内存恢复与真实 Vue DOM hydration 证据
recap:
  - SSR 中每个 request 都拥有独立 Pinia；组件外 useStore 显式接收该实例。
  - 服务端渲染完成后读取 root，客户端在首个 useStore 前恢复 root。
  - Options Store 的创建顺序决定 direct refs；Setup Store 对普通 ref 与 skipHydrate 分别处理。
  - Pinia 内存恢复不等于安全 HTML 注入或 Vue DOM hydration，这些证据仍保持 Deferred。
---

# SSR 与 Hydration

:::tip
前置：请先完成 L01-L12 和 Vue Core 的 SSR 与 Hydration。本课只运行 Pinia 4.0.2 的 SPA 内存 seam，不创建 SSR server/client 双入口。
:::

## 一、请求级 Pinia 是隔离边界

SSR 服务进程会复用模块。模块级 Pinia singleton 会让一个请求写入的用户状态有机会被下一个请求读到，因此宿主必须为每次 request 调用 app factory。组件外的 router、service 或 serverPrefetch 路径还应把本请求 Pinia 显式传给 useStore(pinia)，不能依赖进程级 active fallback。

~~~~ts
/** 为单个请求创建彼此隔离的 Vue 与 Pinia 实例。 */
export function createRequestApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  app.use(pinia)
  return { app, pinia }
}

/** 渲染一次请求，并在渲染完成后取得最终 root state。 */
export async function renderRequest() {
  const { app, pinia } = createRequestApp()
  const html = await renderToString(app)
  return { html, rootState: pinia.state.value }
}
~~~~

:::warning
以上代码只说明官方顺序，省略了 URL、router ready、数据权限、错误边界和安全序列化。本课 Demo 不执行 createSSRApp() 或 renderToString()，因此不能把两个内存 Pinia 称为真实 HTTP request。
:::

## 二、Root State 不是传输与安全 API

pinia.state.value 是服务端渲染后取得状态的公开入口，也是客户端恢复入口。Pinia 不负责选择可公开字段、序列化、HTML context escaping、CSP、payload 校验或 parser 配对，这些都属于 SSR 宿主。

| 阶段 | Pinia 提供 | 宿主负责 |
| --- | --- | --- |
| 请求渲染 | 独立 root state | request factory、数据与权限边界 |
| 生成快照 | pinia.state.value | 字段白名单，排除 secret |
| 序列化 | 无内置 serializer | 选择 serializer 与对应 parser |
| 嵌入 HTML | 无内置注入或转义 | 按具体 HTML context 防 XSS 并配置 CSP |
| 客户端恢复 | 可整体赋 root state | 验证 payload，并在首个 useStore 前赋值 |
| DOM hydration | 一致的内存 state | 真实 server HTML、client hydrate 与 mismatch 采集 |

:::warning
Pinia 官方推荐 SSR 环境考虑 devalue，但本仓库没有安装它。JSON-compatible fixture 的 stringify/parse 只能证明内存 round-trip，不能证明把结果原样放进 script 是安全的。
:::

## 三、首个 useStore 是恢复顺序检查点

:::steps
### 1. 创建客户端 App 与 Pinia

此时不要先创建任何 Store。

### 2. 读取并验证宿主 Payload

serializer 与 parser 必须属于同一传输协议。

### 3. 恢复 Root State

把已解析状态赋给 pinia.state.value。

### 4. 首次取得 Store

此后才调用 useStore(pinia)，再 mount/hydrate。
:::

:::compare
### 错误写法

~~~~text
const pinia = createPinia()
const store = useRequestStore(pinia)
pinia.state.value = initialState

// Pinia 4.0.2：direct 仍可能连接旧对象
store.count !== store.$state.count
~~~~

### 正确写法

~~~~text
const pinia = createPinia()
pinia.state.value = initialState
const store = useRequestStore(pinia)

// direct、$state 与 root 指向同一份状态
store.count === store.$state.count
~~~~
:::

固定 4.0.2 的 Options Store 会在创建时对当时存在的 root state 建立 refs。若先创建 Store，再整体替换 root，direct property 仍连接旧对象，而 $state getter 和 pinia.state.value 已读取新 root；数值分叉正是错误顺序的可运行反例。

## 四、Setup Store 先创建，再逐项决定是否水合

Setup Store 必须执行 setup。固定 4.0.2 会把 initial state 写入普通顶层 ref，对顶层 reactive object 递归合并；若 shouldHydrate(property) 为 false，则保留客户端 setup 创建的值。最后这些属性仍会连接回 root state。

~~~~ts
/** 创建同时包含普通状态和客户端专属状态的 Setup Store。 */
const useSessionStore = defineStore('session', () => {
  const userLabel = ref('client-default')
  const connection = skipHydrate(ref('client-connection'))
  return { userLabel, connection }
})

const pinia = createPinia()
pinia.state.value = {
  session: {
    userLabel: 'server-user',
    connection: 'server-placeholder',
  },
}
const store = useSessionStore(pinia)

// userLabel 使用 server-user；connection 保留 client-connection
~~~~

| 能力 | 准确边界 |
| --- | --- |
| 普通顶层 ref | 接收对应 initial state |
| skipHydrate(ref) | 被标记顶层对象保留 client setup 值 |
| shouldHydrate() | 普通对象为 true，标记对象为 false |
| Options Store hydrate() | 只处理简单复制不够的特殊 composable |
| 序列化排除 | skipHydrate 不会自动排除字段 |
| 嵌套标记 | 固定官方测试仍为 skipped，不承诺递归支持 |

## 五、Pinia SSR 与 Hydration 顺序实验

:::demo{id="vue.pinia.learn.advanced.ssr-hydration.pinia-ssr-hydration-model-lab-demo" playground="true"}
对照 request A/B、客户端恢复前后顺序，以及 Setup Store 普通 ref/skipHydrate
:::

## 六、练习与观察

:::steps
### 1. 修改 Request A

确认 A 的 root state 改变，而使用相同 Store ID 的 B 保持原值。

### 2. 重新克隆内存快照

确认只处理 JSON-compatible state，安全 serializer 仍为 Deferred。

### 3. 比较两个客户端顺序

正确路径三处一致；错误路径 direct 与 $state/root 分叉。

### 4. 运行 Setup Store 水合

普通 ref 采用 server fixture，skipHydrate ref 保留 client fixture。
:::

## 七、证据边界

| 能力 | 本课证据 | 状态 |
| --- | --- | --- |
| 两个 Pinia root state 隔离 | 同进程、确定性 fixture | 可运行 |
| 首个 useStore 前/后恢复差别 | Pinia 4.0.2 内存行为 | 可运行 |
| skipHydrate/shouldHydrate 顶层行为 | 普通/标记 ref 对照 | 可运行 |
| Node SSR request factory | 无 HTTP/Node server fixture | Deferred/not-run |
| renderToString 后 snapshot | 当前 Demo 不执行 SSR renderer | Deferred/not-run |
| 安全 HTML 注入、XSS、CSP | 无 serializer package/HTML response | Deferred/not-installed |
| 浏览器 Vue hydration/mismatch | 无 server HTML + client hydrate 双入口 | Deferred/not-run |

## 八、源码与测试推导

:::steps
### 1. createPinia 创建独立容器

每次调用都有独立 effect scope、root state 与 Store registry。

### 2. Root Store 警告 Active Fallback

SSR 组件外应显式传 Pinia，避免 cross-request pollution。

### 3. SSR Guide 冻结恢复顺序

渲染后读取 root，客户端首个 useStore 前恢复并安全转义。

### 4. Options Store 在创建时连接 Root

固定 store.ts 解释错误整体替换为何产生旧 direct ref 与新 root。

### 5. Setup Store 逐项处理 Initial State

普通 ref 接收值，顶层 shouldHydrate=false 的对象保留客户端值。

### 6. skipHydrate 只检查对象自身标记

nested case 在固定 state.spec.ts 仍为 skipped，不能扩成递归保证。

### 7. SSR 官方测试覆盖实例隔离

上游测试不等于本项目已验证 HTML 注入、CSP 或浏览器 hydration。
:::

## 九、易错使用提示

:::pitfalls
### 服务端共享模块级 Pinia

**触发条件：** 服务端共享模块级 Pinia

**原因：** 服务模块通常跨请求复用。

**后果：** 用户状态可能在请求之间污染。

**错误示例：**

~~~~ts
export const pinia = createPinia()
~~~~

**正确写法：**

~~~~ts
/** 为当前请求创建独立 Pinia。 */
export function createRequestPinia() {
  return createPinia()
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 组件外依赖 Active Pinia

**触发条件：** 组件外依赖 Active Pinia

**原因：** 多实例环境中的 mutable fallback 不是 ownership 边界。

**后果：** 代码可能取得另一个请求的 Store。

**错误示例：**

~~~~ts
const store = useRequestStore()
~~~~

**正确写法：**

~~~~ts
const store = useRequestStore(requestPinia)
~~~~

**验证方式：** 对照正确写法验证结果。

### 渲染前导出最终快照

**触发条件：** 渲染前导出最终快照

**原因：** setup/serverPrefetch 可能在 render 中继续写 state。

**后果：** 客户端拿到缺字段或旧数据。

**错误示例：**

~~~~ts
const snapshot = pinia.state.value
await renderToString(app)
~~~~

**正确写法：**

~~~~ts
await renderToString(app)
const snapshot = pinia.state.value
~~~~

**验证方式：** 对照正确写法验证结果。

### 先创建 Store 再恢复 Root

**触发条件：** 先创建 Store 再恢复 Root

**原因：** Options Store direct refs 已连接旧 root。

**后果：** direct 与 $state/root 读取不同对象。

**错误示例：**

~~~~ts
const store = useStore(pinia)
pinia.state.value = initialState
~~~~

**正确写法：**

~~~~ts
pinia.state.value = initialState
const store = useStore(pinia)
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 JSON.stringify 当作 HTML Safe

**触发条件：** 把 JSON.stringify 当作 HTML Safe

**原因：** JSON round-trip 不处理具体 HTML context。

**后果：** 用户字符串可能形成 script 注入。

**错误示例：**

~~~~ts
html += '<script>' + JSON.stringify(state) + '</script>'
~~~~

**正确写法：**

~~~~ts
// 由宿主选择获批 serializer、配对 parser 与 HTML/CSP 策略
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 skipHydrate 当成序列化过滤器

**触发条件：** 把 skipHydrate 当成序列化过滤器

**原因：** 它只改变 Setup Store 顶层属性接收 initial value 的决定。

**后果：** 不应传输的字段仍可能进入 root snapshot。

**错误示例：**

~~~~ts
// 假定标记字段不会进入 root state
~~~~

**正确写法：**

~~~~ts
// snapshot 阶段另做明确字段白名单
~~~~

**验证方式：** 对照正确写法验证结果。

### 把内存 State 一致当成 DOM Hydration 通过

**触发条件：** 把内存 State 一致当成 DOM Hydration 通过

**原因：** 当前没有 server HTML、client hydrate 或 mismatch 采集。

**后果：** 报告夸大为真实 SSR/hydration Green。

**错误示例：**

~~~~ts
status = 'Hydration PASS'
~~~~

**正确写法：**

~~~~ts
status = 'Deferred/not-run'
~~~~

**验证方式：** 对照正确写法验证结果。
:::
