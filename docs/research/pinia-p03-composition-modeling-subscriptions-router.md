# Pinia 4.0.2 P03：组合、建模、订阅与路由官方调研

> 核验日期：2026-08-05（Asia/Shanghai）
>
> 批次边界：仅 `P03 / L07-L10`
>
> 固定版本：[`pinia@4.0.2`](https://github.com/vuejs/pinia/releases/tag/v4.0.2)
>
> 固定 commit：
> [`ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1`](https://github.com/vuejs/pinia/commit/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1)
>
> P0 计划快照：`docs/research/pinia-course-plan.md`，调研时 SHA-256 为
> `b1e05516c3fcaff5324f076c444380db70781dd15890d1e24dcceccec9f0ad87`
>
> 本地运行基线：`vue@3.5.40`、`vue-router@5.2.0`、lockfile 与 installed package 均解析为
> `pinia@4.0.2`
>
> 资料口径：Pinia、Vue 与 Vue Router 官方文档，以及上述固定 commit 的 Pinia 文档源码、
> runtime 源码与官方测试。外部资料先通过 Tavily 定位，再回到一手来源核验；本文不采用博客、
> 问答、视频、第三方库、浮动 `main` 源码或社区讨论作为事实依据。

## 研究结论

1. Setup Store 可以在 setup 顶层取得另一个 store，甚至两个 store 可以互相 `useStore()`；真正的
   循环限制是双方不能都在 setup 创建期立即读取对方 state，也不能在 getters/actions 中形成无限
   递归。互相读取应延迟到 `computed` 或 action 的实际执行阶段。
2. Store 承载脱离组件树的共享 state 与业务逻辑。官方只明确推荐多处访问或跨页面保留的数据，
   并反对把可留在组件内的局部短命状态放入 Store；按业务职责、所有权和副作用边界拆分多个 Store
   是应用建模建议，不是 Pinia 强制分层规范。
3. `$subscribe()` 回调收到 `(mutation, state)`。`mutation.type` 只有 `direct`、`patch object`、
   `patch function`；三者都有 `storeId`，只有 `patch object` 有传入 `$patch(object)` 的 `payload`。
   `events` 是 DEV-only，不得作为业务审计或持久化协议。
4. `$subscribe()` 使用 Vue `watch()`：默认 flush 沿用 Vue 的 `pre`，也可传 `sync` 或 `post`。
   但 `$patch(object|fn)` 会暂停普通 watcher 通知并手动同步聚合触发一次订阅，因此 `flush` 不改变
   patch 通知的时机。需要观察 patch 后同 tick 的每次 direct mutation 时，应使用 `sync` 或显式
   分隔 tick。
5. `$onAction()` listener 在 action 本体前同步触发，包含 `name`、`store`、实参数组 `args`、
   `after` 和 `onError`。同步 action 的 `after` 在返回前执行；异步 action 的 `after` 等待 Promise
   resolve 并收到 resolved value；`onError` 覆盖同步 throw 和异步 reject，但不会默认吞掉错误。
6. 两类订阅都返回 stop/unsubscribe 函数，默认绑定当前组件/effect scope 并随其销毁；
   `$subscribe()` 用 `{ detached: true }`，`$onAction()` 用第二个布尔参数 `true` 才会脱离 scope。
   detached listener 必须由所有者显式停止，或由 `store.$dispose()` / Demo 总清理结束。
7. `app.use(pinia)` 同时设置 active Pinia 并向 app provide Pinia。`useStore(pinia?)` 在固定 4.0.2
   中先采用显式参数，其次采用当前 injection context，最后回退到 mutable active Pinia；SSR、多个
   app 或请求隔离场景必须显式传入当前实例，不能依赖进程级 active fallback。
8. Pinia 创建 Setup Store 时使用关联 app 的 `app.runWithContext()` 执行 setup，使同步 `inject()`
   能读取 app provide。该上下文只保证同步回调期间可注入，不跨 `await`，也不等同于组件实例。
   Vue Router 守卫同样在 app context 中执行；课程仍应把 `useStore()` 延迟到 guard 回调内，并且
   不修改宿主 Router 架构。

## P03 冻结范围

| 课程 | 冻结值 |
| --- | --- |
| L07 | `vue.pinia.learn.intermediate.store-composition` |
| L07 标题 | `Store 组合` |
| L07 前置 | L01-L06 |
| L07 唯一 Demo | `vue.pinia.learn.intermediate.store-composition.pinia-store-composition-lab-demo` |
| L08 | `vue.pinia.learn.intermediate.store-modeling` |
| L08 标题 | `Store 建模` |
| L08 前置 | L01-L07 |
| L08 唯一 Demo | `vue.pinia.learn.intermediate.store-modeling.pinia-store-responsibility-lab-demo` |
| L09 | `vue.pinia.learn.intermediate.subscriptions-actions` |
| L09 标题 | `状态与 Action 订阅` |
| L09 前置 | L01-L08 |
| L09 唯一 Demo | `vue.pinia.learn.intermediate.subscriptions-actions.pinia-subscription-lifecycle-lab-demo` |
| L10 | `vue.pinia.learn.intermediate.outside-components-router` |
| L10 标题 | `组件外使用与路由集成` |
| L10 前置 | L01-L09 和 Vue Router 基础 |
| L10 唯一 Demo | `vue.pinia.learn.intermediate.outside-components-router.pinia-outside-component-context-lab-demo` |
| 批次发布 | L07-L10 与同一 focused Gate 原子进入 `available` |
| 后续状态 | L11-L14 继续 `planned` |
| 停止边界 | P03 Gate 后停止，不进入 P04、P05 或 PRA |

本文只为后续课程正文、唯一 Demo 和验收提供事实底稿，不修改 manifest、entry、Demo、测试、
Router、计划或 Reference，也不把尚未运行的测试和浏览器验收写成已通过。

## L07：Store 组合

### 目标、前置与排除

- **目标：** 在 Options getter/action 与 Setup Store 中组合其他 store，理解跨 Store 响应性和创建期
  循环边界，并把跨 Store 协调放在有明确所有者的 action 中。
- **前置：** L01-L06，尤其是 getter、action、Setup Store 返回面和显式 Pinia 实例。
- **本课排除：** 不建立强制分层规范，不讲插件、持久化、Router、SSR fixture 或全局事件总线；
  SSR 只解释“首个 `await` 前取得所有 store”的上下文边界。

### 1. 允许组合，不允许创建期即时互读闭环

Pinia 官方的规则不是“Setup Store 顶层禁止 `useStore()`”。官方组合指南明确允许 Setup Store 在
setup 顶层取得另一个 store；固定 `combinedStores.spec.ts` 甚至让 A/B 两个 Setup Store 在顶层互相
取得对方，然后只在 action 中读写，验证实例创建和交互都不抛错。

真正禁止的是两个互相依赖的 Setup Store **都在各自 setup 顶层直接读取对方 state**。此时一方还在
创建中，读取会进入不完整初始化顺序。正确方式是先取得实例，把对方属性的实际读取延迟到
`computed` 或 action：

```ts
const useCartStore = defineStore('p03-cart', () => {
  const session = useSessionStore()
  const items = ref<string[]>([])
  const summary = computed(() => `${session.userName}: ${items.value.length}`)

  return { items, summary }
})
```

固定 `store.ts` 先把 partial store 放入 `pinia._s`，再执行 setup。这个顺序使双方可以先取得实例，
但不代表对方所有返回属性已经初始化；它正好解释了“互相 `useStore()` 可行、创建期双方即时读取
不可行”的差别。

### 2. getter、computed 与 action 的组合边界

- Options getter 可以在 getter 内调用另一个 `useStore()`，返回值仍由 Vue computed 追踪。
- Setup Store 可以在顶层取得另一个 store，再在 `computed()` 中读取其 state/getter；依赖在 computed
  真正求值时建立，不是 setup 创建期快照。
- action 可以取得或调用其他 store，并负责一个明确的跨 Store 业务流程；被调用 store 仍拥有自己
  的 state mutation。
- “延迟到 getter/action”不是允许无限递归。A getter 读取 B getter、B getter 又立即读取 A getter，
  或 A action 与 B action 无终止地互调，仍然是应用逻辑错误。
- SSR 异步 action 中需要的所有 `useStore()` 必须在第一个 `await` 前取得，避免恢复执行时误用另一
  个 active Pinia。

### 3. L07 唯一 Demo 可测试 contract

唯一 Demo 使用自己的 `createPinia()`，定义 `session` 与 `cart` 两个 Setup Store：双方可在顶层取得
对方，但不在创建期读取对方 state；`cart.summary` 通过 computed 读取 session，双方 action 只在
用户操作时读取或调用对方。

必须可观察并可断言：

1. 先后创建任一 store 都不抛错，且双方 action 取得的是同一隔离 Pinia 内的对方实例。
2. 修改 session 用户名后，cart 的跨 Store computed summary 更新；不是 setup 时保存的快照。
3. cart action 修改 cart 自己的 items，session action 在执行时读取 cart 当前数量并返回结果。
4. 时间线明确显示“取得实例发生在 setup，读取对方 state 发生在 computed 求值/action 执行”。
5. 不执行一个真实无限循环；反例只展示为结构化错误路径，不能让页面卡死或污染宿主 Pinia。
6. reset 后回到确定性基线；卸载时 dispose 独立 Pinia，不留下 store、timer 或订阅。

### 4. L07 易错点

1. **误区：** 两个 Store 互相 import 或互相 `useStore()` 本身就一定非法。
   **纠正：** 固定测试证明可以互相取得实例；问题是双方创建期即时互读或运行时无限递归。
2. **误区：** Setup Store 顶层只能声明本地 ref，不能取得其他 store。
   **纠正：** 官方明确允许在 Setup Store 顶层调用另一个 `useStore()`。
3. **误区：** 把 `const name = other.name` 移到 setup 顶层仍能持续响应。
   **纠正：** 这既可能触发循环初始化，也只是当前读取；需要 `computed(() => other.name)`。
4. **误区：** 放进 computed 就自动消除所有循环。
   **纠正：** 两个 computed 互相求值仍可形成递归，必须检查依赖方向是否终止。
5. **误区：** action 相互调用天然安全。
   **纠正：** action 也不能无终止互调，应指定一个协调入口和清晰的被调用边界。
6. **误区：** 跨 Store action 应直接修改另一个 store 的所有内部细节。
   **纠正：** 优先调用对方公开 action，让 state mutation 责任留在拥有该 state 的 store。
7. **误区：** async action 可以在任意 `await` 后再隐式取得其他 store。
   **纠正：** SSR 下必须在首个 `await` 前取得所需 store，或显式传递正确 Pinia。
8. **误区：** 为避免依赖问题，应把全部状态合并成一个总 Store。
   **纠正：** 这会丢失职责边界；应先消除创建期互读和递归，而不是取消所有模块边界。

### 5. L07 编号源码/测试推导与适用场景

1. `store.ts` 在执行 setup 前登记 partial store，所以互相 `useStore()` 可以返回稳定 identity；适用于
   拆分后仍需双向协作的 Store，但不支持读取尚未完成初始化的返回属性。
2. `combinedStores.spec.ts` 的 A/B 只在 action 中访问对方，证明“延迟读取”是可执行模式；适用于
   用户动作触发的跨 Store 协调。
3. 官方 composing guide 把相互读取放入 computed/action，并单独警告 getter/action 无限循环；适用于
   评审依赖图时区分“创建期循环”和“运行期递归”。
4. 固定 getter 测试确认跨 Store getter/computed 依赖可持续更新；适用于派生展示值，不应改写成
   一次性 setup 快照。
5. action wrapper 每次调用会把所属 Pinia 设为 active；适用于同步 action 内组合，但不取消 async
   `await` 后 active context 可能变化的 SSR 风险。
6. 固定组合文档要求所有 `useStore()` 位于首个 `await` 前；适用于 SSR 异步业务流程，普通 SPA
   Demo 只能说明代码顺序，不能冒充真实请求隔离证据。

## L08：Store 建模

### 目标、前置与排除

- **目标：** 使用所有权、生命周期、复用范围和副作用责任判断状态放在组件、Store 还是服务端，
  并把多个 Store 按业务职责而不是页面或 API 文件任意切分。
- **前置：** L01-L07，尤其是 Store 实例所有权、组件生命周期、action 与跨 Store 组合。
- **本课排除：** 不宣布唯一目录结构、DDD 分层或“一个实体一个 Store”；不实现真实网络缓存、
  持久化、Router、插件或服务器同步策略。

### 1. 官方契约与应用建模建议必须分层

官方能够支持的结论是：Store 持有不绑定组件树的 state 与业务逻辑，适合应用多处访问或需要跨页面
保留的数据；可以留在组件内的局部短命状态，例如某一页面元素的可见性，应避免放入 Store。

下面的职责矩阵是基于该边界的 **应用建模建议**，不是 Pinia runtime 规则：

| 判断维度 | 组件本地 | Pinia Store | 服务端/外部系统 |
| --- | --- | --- | --- |
| 所有者 | 单个视图实例 | 一个业务职责 | 后端或外部权威源 |
| 生命周期 | 随组件挂载/卸载 | 随 Pinia/store 实例 | 独立于当前浏览器视图 |
| 复用范围 | 当前组件或紧邻子树 | 跨组件、跨页面或共享流程 | 多客户端/长期权威数据 |
| 典型状态 | hover、临时展开、未提交输入 | session、购物车、跨步流程 | 已持久化订单、权限事实 |
| 副作用入口 | 组件事件和生命周期 | 命名 action/协调 action | API/服务端事务 |

客户端可以在 Store 中保存服务端数据的缓存、请求状态或乐观更新，但这不自动把客户端副本升级为
最终权威源。课程应明确“Store 拥有客户端缓存状态”和“服务端拥有业务事实”是两种所有权。

### 2. 业务职责与副作用所有权

1. 拥有 state 的模块应提供修改该 state 的 action；跨 Store 协调 action 调用公开 action，而不是
   四处写入对方内部字段。
2. 只与一个组件实例的 DOM、focus、hover 或临时展开相关的副作用留在组件；不要为了“统一管理”
   把 DOM 生命周期搬进长期 Store。
3. 多 Store 工作流需要一个明确协调者，可以是发起流程的 Store action 或独立 composable；不要让
   两边通过 `$subscribe()` 互相隐式驱动，形成难以追踪的反馈环。
4. `$subscribe()` / `$onAction()` 更适合作为观察、审计、持久化适配或集成边界，不应替代正常 action
   调用和显式业务流程。
5. Router guard 负责导航允许/重定向，认证 Store 负责认证 state 与认证 action；L08 不把 Router
   实例塞进 Store，也不提前实现 L10。

### 3. L08 唯一 Demo 可测试 contract

唯一 Demo 使用一个独立 Pinia 与可反复挂载/卸载的局部子组件，展示同一确定性任务场景中的三类
状态：组件本地 `panelOpen/draft`、跨组件业务 `selectedProject/tasks`、服务端 fixture 的版本与客户端
缓存状态。没有真实网络、随机值或 `localStorage`。

必须可观察并可断言：

1. 修改本地 panel/draft 后重挂载局部组件，这些状态回到组件基线。
2. 同一次重挂载后，独立 Pinia 中的 selected project/tasks 保留，证明其生命周期不属于消费组件。
3. “刷新缓存”只从确定性 server fixture 复制投影并更新 cache version；界面明确标注服务端 fixture
   仍是权威源，不把缓存状态写成后端已持久化。
4. 业务修改只经过 owning Store action；时间线显示 action 名称和受影响职责，不使用订阅反向驱动。
5. “归属说明”使用建议措辞，不能把本 Demo 的三分法写成 Pinia 强制架构。
6. reset 恢复本地子组件与 Store 基线；卸载时销毁子组件并 dispose 独立 Pinia。

### 4. L08 易错点

1. **误区：** 只要状态是响应式的，就应该放进 Pinia。
   **纠正：** Pinia 面向共享/跨页面状态；局部短命 UI 状态通常留在组件。
2. **误区：** Store 会在最后一个消费组件卸载时自动销毁。
   **纠正：** Store registry 属于 Pinia；组件卸载和 Store/Pinia dispose 是不同生命周期。
3. **误区：** 按页面建一个巨大 Store 最容易维护。
   **纠正：** 页面会组合多个业务职责；应先看 state 和行为的所有者。
4. **误区：** 每个 API endpoint 都必须对应一个 Store。
   **纠正：** transport shape 不等于业务职责，多个 endpoint 可能服务同一职责，反之亦然。
5. **误区：** 把后端响应放进 Store 后，Store 就成为最终真相。
   **纠正：** Store 可以拥有客户端缓存与请求状态，服务端仍可能拥有权威业务事实。
6. **误区：** 副作用全部放进 `$subscribe()` 可以让 action 更纯净。
   **纠正：** 这会隐藏业务控制流；业务副作用应有命名入口，订阅用于观察/集成。
7. **误区：** 跨 Store 流程应让两个 Store 的订阅互相同步。
   **纠正：** 容易形成反馈环；应由一个明确协调 action 调用双方公开能力。
8. **误区：** 本课的职责矩阵是 Pinia 官方强制最佳实践。
   **纠正：** 官方只给出共享/局部边界；矩阵是课程的应用建模建议。

### 5. L08 编号源码/测试推导与适用场景

1. `createPinia.ts` 把 store registry 放在 Pinia 实例上；适用于解释跨组件/跨页面保留，但不能据此
   推导所有长期状态都必须进 Store。
2. `rootState.spec.ts` 证明一个 Pinia 可持有多个 Store、不同 Pinia 彼此隔离；适用于按职责拆分和
   Demo 隔离，而不是强制 Store 数量。
3. 官方 Getting Started 将 Store 定义为脱离组件树的共享 state/业务逻辑；适用于 session、购物车、
   跨步流程等多处消费状态。
4. 同一官方页面明确反对把页面局部可见性放入 Store；适用于 panel/hover/draft 等组件生命周期状态。
5. Actions 指南把 action 作为业务逻辑入口；适用于把有名称的业务修改交给 owner action，但“协调者
   选择”仍是应用设计决定。
6. 服务端权威与客户端缓存的区分没有对应 Pinia runtime API；适用于课程案例时必须标为建模建议，
   普通 SPA Demo 不能声称验证了真实一致性或服务端事务。

## L09：状态与 Action 订阅

### 目标、前置与排除

- **目标：** 分别掌握 `$subscribe()` 与 `$onAction()` 的事件形态、时序、scope/detached 生命周期和
  stop 责任，能选择观察 state mutation 还是 action 意图/结果。
- **前置：** L01-L08，尤其是 direct/patch、同步/异步 action、组件 scope 和副作用所有权。
- **本课排除：** 不实现持久化插件、全局审计系统或真实网络；不依赖 DEV-only `events`；不把订阅
  当作业务消息总线。

### 1. `$subscribe()` 的 mutation 与 payload

| mutation | `type` | `storeId` | `payload` | 通知特点 |
| --- | --- | --- | --- | --- |
| 直接写 store/state | `direct` | 有 | 无 | 按 watch flush 调度 |
| `$patch(object)` | `patch object` | 有 | 有，等于传入 patch object | 同步聚合一次 |
| `$patch(fn)` | `patch function` | 有 | 无 | 同步聚合一次 |

回调第二参数 `state` 是触发时当前 `store.$state`。`events` 来自 Vue reactivity debugging，类型和
官方注释都标记为 DEV-only；生产课程逻辑不得读取它来判断字段、生成业务日志或持久化差异。

### 2. flush、detached 与 stop

`$subscribe()` 使用 deep `watch()`，接受 Vue `WatchOptions` 与额外的 `detached`。没有传 flush 时，
Pinia 没有覆盖 Vue 默认值，因此沿用 Vue `watch()` 的 `pre`；`sync` 在 direct mutation 后同步逐次
回调，`post` 在组件更新后调度。

固定 `subscriptions.spec.ts` 中有一个测试标题写着 `subscribe is post by default`，但断言只验证
“不是 sync，且 `nextTick()` 后已调用”，没有区分 `pre` 与 `post`。公开契约是“使用 `watch()` 并接受
相同 options”，固定 Pinia 源码也未设置默认 flush；因此课程应按 Vue 默认 `pre` 教学，不能根据该
测试标题改写为 `post`。

`$patch()` 是特殊路径：实现先暂停 watcher，再手动同步触发 subscriptions，所以 object/function
patch 均聚合成一次通知，且 `pre/post/sync` 都立即收到该 patch 事件。一个精确时序边界是：同 tick
先 patch、紧接一次 direct mutation，非 sync 订阅未必为后者再单独发事件；逐事件观察应使用
`flush: 'sync'` 或 `await nextTick()` 分隔操作。

默认订阅在组件 setup/effect scope 内注册时随 scope 销毁；`{ detached: true }` 会保留它。无论是否
detached，API 都返回 unsubscribe。固定实现用 Set 删除，重复 stop 不影响其他 listener。

### 3. `$onAction()` 的参数与 async timing

`$onAction()` listener 在 action 本体前执行，context 包含：

- `name`：action 名称。
- `store`：正在执行 action 的同一 Store 实例。
- `args`：这次调用传入的实参数组。
- `after(callback)`：注册成功回调；同步返回立即收到返回值，Promise 则等待 resolve 并收到解包值。
- `onError(callback)`：注册失败回调；覆盖同步 throw 和 Promise reject。

固定 wrapper 在同步 throw 时先触发 `onError` 再 rethrow；Promise reject 时先触发 `onError`，返回给
调用者的 Promise 仍 reject。因此 observer 不能替代调用方的 `try/catch` 或 rejection handling。

固定 `types.ts` 的一处 JSDoc 仍声称 `onError` callback 可“return false 阻止错误传播”，但同版本的
callback 类型是 `(error) => void`，runtime 不读取 listener 返回值，官方测试也断言 throw/reject 继续
传给调用方。这是固定 4.0.2 内部注释漂移，P03 **不得**教授 `return false` 吞错。

`$onAction()` 的 detached 不是 options object，而是第二个布尔参数：`store.$onAction(callback, true)`。
它同样返回 stop；默认组件 scope listener 随卸载取消，detached listener 由创建者显式停止。

### 4. L09 唯一 Demo 可测试 contract

唯一 Demo 创建自己的 Pinia 与 mini-app。mini-app 组件在 setup 内为同一 Store 注册 component-scoped
与 detached 的 state/action subscriptions，外层控制面执行 direct、patch object、patch function、
sync success、sync throw、deferred async resolve/reject，并可以卸载 mini-app、手动 stop detached。

必须可观察并可断言：

1. 三种 mutation type 精确显示；只有 patch object 显示等于输入对象的 payload。
2. direct mutation 下 sync listener 立即增加，pre/post 在对应 tick 后增加；patch 下三者都同步且
   每个 listener 只增加一次。
3. action listener 的 before 事件包含 name/args；同步 success 的 after 收到返回值。
4. deferred async action 在 gate resolve 前没有 after，resolve 后 after 收到 resolved value；reject 和
   sync throw 都先记录 onError，调用方仍记录 catch/rejection。
5. mini-app 卸载后 component-scoped state/action listeners 不再增加，detached listeners 继续增加。
6. 调用两类 detached stop 后再 mutation/action，计数不再增加；重复 stop 不影响其他 listener。
7. 时间线只使用递增序号和手动 deferred gate，不使用墙钟、随机值或真实网络。
8. 总清理保存并调用全部 stop，卸载 mini-app、删除临时节点并 dispose 独立 Pinia。

### 5. L09 易错点

1. **误区：** `$subscribe()` 会提供具体变更字段的稳定生产 payload。
   **纠正：** 稳定字段是 type/storeId，payload 仅 patch object 有；`events` 是 DEV-only。
2. **误区：** direct mutation 非法，所以不会有 `direct` 事件。
   **纠正：** 直接修改 state 是公开用法，对应 `MutationType.direct`。
3. **误区：** patch function 的 callback 参数就是 mutation payload。
   **纠正：** patch function mutation 没有 payload；回调第二参数是完整当前 state。
4. **误区：** `$subscribe()` 默认是 `post`。
   **纠正：** 它沿用 Vue watch 默认 `pre`；固定测试标题不能覆盖源码和 Vue 公开契约。
5. **误区：** `flush: 'post'` 会让 `$patch()` 也延后。
   **纠正：** patch 手动同步聚合通知，API 注释明确 flush 对 patch 无效。
6. **误区：** `{ detached: true }` 代表无需清理。
   **纠正：** 它只脱离当前 scope，所有者仍必须保存并调用 stop。
7. **误区：** `$onAction()` 的 detached 也传 `{ detached: true }`。
   **纠正：** 第二参数直接传 `true`。
8. **误区：** `after` 在异步 action 返回 Promise 时立即执行。
   **纠正：** 它等待 Promise resolve，并收到 resolved value。
9. **误区：** `onError` 记录错误后会自动吞掉 throw/rejection。
   **纠正：** 固定实现与测试确认错误继续传播；调用方仍需处理。
10. **误区：** 用订阅互相驱动 Store 是最清晰的业务流程。
    **纠正：** 订阅适合观察/集成，核心业务流应通过显式 action 调用。

### 6. L09 编号源码/测试推导与适用场景

1. `types.ts` 的 discriminated union 精确限定三种 mutation，且 payload 只在 patch object 分支；适用于
   type narrowing 和结构化 UI，不能读取不存在的统一 payload。
2. `store.ts` 的 `$patch()` 暂停 watcher并手动触发一次 subscription；适用于批量修改、Devtools 分组
   和一次持久化写入，不受 flush 延迟控制。
3. `$subscribe()` 把 options 合并给 deep `watch()`；适用于选择 direct mutation 的 pre/post/sync
   调度，同时必须保留 patch 特例说明。
4. `subscriptions.ts` 通过 current scope 的 `onScopeDispose()` 注册 remove；适用于组件默认清理，
   detached 只跳过这一步，并不会产生新的全局清理所有者。
5. action wrapper 在执行本体前触发 context，Promise 分支在 `.then/.catch` 触发 after/onError；适用于
   确定性 tracing、指标和错误观察，不适合作为 action 拦截器。
6. `onAction.spec.ts` 分别覆盖 args、同步返回、resolved value、throw、reject 和 unsubscribe；适用于
   Demo 的最小行为矩阵，不需要为每种 action 另建一套 Demo。
7. 固定实现对同步错误 rethrow、对异步错误重新 reject；适用于明确调用方责任，并否定陈旧 JSDoc
   中“return false 吞错”的说法。
8. `store.$dispose()` 停止 store scope、清空两类订阅并移除 registry 实例，但不删除 root state；
   适用于 Demo 总清理，不得把 dispose 展示成 reset。

## L10：组件外使用与路由集成

### 目标、前置与排除

- **目标：** 理解显式 Pinia、injection context 与 active fallback 的选择顺序，在组件外和 Router
  guard 中延迟、隔离地取得正确 Store。
- **前置：** L01-L09 和 Vue Router 基础，尤其是 `createPinia()`、`app.use()`、memory history、
  navigation guard 与 cleanup。
- **本课排除：** 不修改宿主 Router、路由表、导航架构或 URL；不实现真实 SSR；不把 Router 注入
  Store，不进入 plugin、persistence 或 hydration。

### 1. active Pinia、injection context 与显式实例

`app.use(pinia)` 的 install 会执行三件与本课直接相关的事：把该实例设为 active Pinia、保存关联 app、
并通过 `app.provide(piniaSymbol, pinia)` 提供 injection。SPA 中，安装完成后的组件外函数可以隐式
`useStore()`；模块评估阶段提前调用则依赖 import/install 顺序，可能没有 active Pinia，或在多 app
页面中误取另一个 active 实例。

固定 `useStore(pinia?)` 的解析顺序是：

1. 有显式 `pinia` 参数时优先采用。
2. 否则如果当前有 injection context，尝试 inject app provide 的 Pinia。
3. 取得实例后设为 active，最终从 active Pinia 的 registry 取/建 Store。

因此单 SPA 的 active fallback 是便利机制，不是多 app/SSR 的隔离协议。组件外代码若已经持有当前
实例，`useStore(pinia)` 最明确；SSR 或并发请求必须显式传入 request/app 对应 Pinia。

### 2. `app.runWithContext()` 的精确边界

Vue 官方 `app.runWithContext(fn)` 让 `fn` 立即执行，并在其 **同步执行期间** 把该 app 作为 active app，
因此 `inject()` 可以读取 `app.provide()`。它不创建组件实例，也不让上下文自动跨过异步 `await`。

固定 Pinia `store.ts` 使用关联 app 的 `runWithContext()` 执行 Setup Store setup，所以 store 内同步
`inject()` 能工作。Vue Router 官方说明 Vue 3.3+ 的全局 guards 可以读取 app provide，包括 Pinia
Store；本地 `vue-router@5.2.0` 也在 app context 中运行 guard queue。课程仍应遵循更稳定、可读的
规则：在 guard callback 内调用 `useStore()`，不要在 router 模块顶层提前保存 Store。

### 3. Router guard 中延迟取得 Store

官方 outside-component 示例把错误与正确顺序并列：模块顶层 `const store = useStore()` 可能在 Pinia
安装前运行；`beforeEach` callback 内再调用则发生在 app/plugin 安装后的导航阶段。SSR 官方示例更
进一步，在 guard 内使用 `useMainStore(pinia)`，确保是当前 app/request 的实例。

P03 的课程选择是：

- 独立 Demo 中注册 guard，但只在 guard 执行时取得 Store。
- 需要展示绝对实例归属的组件外路径使用 `useStore(pinia)`。
- guard 只读取认证/授权 Store 并返回允许或 redirect；Router 决策归 guard，认证 state/action 归 Store。
- 不导入或修改 `src/router/`，不调用宿主 router，不改变课程页 URL。

### 4. L10 唯一 Demo 可测试 contract

唯一 Demo 创建自己的 Pinia、临时 mini-app 与 `createMemoryHistory()` Router。它定义公开/受保护两条
内存路由，guard 在 callback 内取得 access Store；另一个组件外操作显式调用 `useAccessStore(pinia)`。
宿主 Router 和 `window.location` 全程只读。

必须可观察并可断言：

1. “模块顶层过早取得 Store”只展示为禁止的代码顺序，不在宿主进程真实执行隐式调用，避免误捕获
   宿主 active Pinia；不能用捕获宿主 Store 来伪造失败/成功证据。
2. mini-app 安装自有 Pinia 与 Router 后，memory router push 到受保护路径会执行 guard，guard 内
   延迟 `useStore()` 取得该 mini-app 的 Store。
3. 未登录时 guard 返回内存登录路径，登录 action 后同一路径允许；时间线记录目标、决策和 Store ID。
4. 显式 `useAccessStore(pinia)` 在组件外取得与 guard 相同的隔离实例，并能读取同一 state。
5. 每次内存导航前后，宿主课程 URL、宿主 Router 当前 route 和宿主 Pinia 都不变化。
6. invalid import-order 分支的结论由官方文档/源码和非浏览器测试支撑；浏览器只证明安全延迟路径，
   不把“未执行的反例”写成运行时失败证据。
7. 卸载时调用 guard remove、unmount mini-app、删除临时节点并 dispose 独立 Pinia；之后不再响应导航。

### 5. L10 易错点

1. **误区：** `defineStore()` 必须等 `app.use(pinia)` 后才能 import。
   **纠正：** 定义工厂可以提前；有顺序风险的是提前调用返回的 `useStore()`。
2. **误区：** 单 SPA 中任何模块顶层 `useStore()` 都可靠。
   **纠正：** import 可能先于 plugin install；应延迟到安装后执行的函数。
3. **误区：** active Pinia 是不可变的应用级常量。
   **纠正：** 它是 mutable fallback，多 app/SSR 不能以它作为隔离边界。
4. **误区：** 有显式实例时仍应先 `setActivePinia()` 再调用。
   **纠正：** 公开 StoreDefinition 接受 `useStore(pinia)`，固定实现会采用并激活该实例。
5. **误区：** `app.runWithContext()` 会保持到任意异步 callback 完成。
   **纠正：** Vue 只保证同步回调执行期间的 injection context。
6. **误区：** guard 能 inject Store，就应该在 router 文件模块顶层先缓存它。
   **纠正：** 注入上下文存在于 guard 执行期；在 guard 内延迟取得最稳妥。
7. **误区：** Store 应直接持有 Router 并决定所有 redirect。
   **纠正：** 本课让 Store 拥有认证 state/action，guard 拥有导航决策，不改变 Router 架构。
8. **误区：** memory router 的导航能证明真实 SSR 请求隔离。
   **纠正：** 它只证明浏览器内独立 app/router/Pinia seam；真实 SSR 仍属于 P05 且未运行。

### 6. L10 编号源码/测试推导与适用场景

1. `createPinia.ts` 的 install 同时 active/provide/关联 app；适用于解释 SPA 安装后隐式调用，不能推导
   安装前模块顶层调用可靠。
2. `rootStore.ts` 的 `getActivePinia()` 先看 injection context，再回退 active；适用于 app context 内
   Store 获取，也说明 active 是 fallback 而非请求隔离容器。
3. `store.ts` 的 `useStore(pinia?)` 显式参数优先于 inject，并最终使用对应 registry；适用于组件外
   utilities、测试和多 app 明确传实例。
4. `store.ts` 通过关联 app 的 `runWithContext()` 执行 Setup Store setup；适用于同步 app provide，
   不能外推到 `await` 后或组件 lifecycle APIs。
5. 官方 outside-component 文档把 `useStore()` 移入 `beforeEach`；适用于 SPA Router guard 的 import
   顺序控制，且不要求重写 Router 架构。
6. `ssr.spec.ts` 证明两个 SSR app 的 provide/state 不混用，并覆盖 render 前显式 `useStore(pinia)`；
   适用于说明 SSR 必须显式实例，但当前 memory-router Demo 不能替代真实 SSR 证据。
7. Vue Router 官方 guard injection 文档证明 guard 可使用 app provide/Pinia Store；适用于 L10 安全
   路径，前提仍是 Router/Pinia 已安装到同一 mini-app。

## 四课唯一 Demo 与证据边界

| 课程 | 唯一可运行 seam | 非浏览器可证明 | 后续浏览器必须证明 |
| --- | --- | --- | --- |
| L07 | 独立 Pinia 的 session/cart 循环引用但延迟读取 | 固定源码注册顺序、官方组合测试、computed/action 断言 | 创建顺序、跨 Store 更新、action 时间线、宿主隔离 |
| L08 | 独立 Pinia + 可重挂载局部子组件 + server fixture | 所有权矩阵断言、root state 隔离、重挂载模型 | 本地状态重置、Store 状态保留、缓存措辞与无溢出 |
| L09 | 独立 Pinia + mini-app 的 scoped/detached 双订阅 | mutation/payload、flush、async hook、stop 的定向断言 | 卸载前后计数、时间线、手动 stop、console/pageerror |
| L10 | 独立 Pinia + mini-app + memory router | 显式实例 identity、guard 决策、host URL 前后值 | 真实内存导航、延迟取 Store、宿主 URL/Router/Pinia 不变 |

本文只完成文档、源码与上游测试核验，没有启动开发服务器、打开页面或运行浏览器。因此所有后续
Demo 浏览器项目仍为 **Deferred/not-run**，不能把固定官方测试、源码阅读或研究文档写成 P03 Gate
已经通过。实施时四个 Demo 还必须统一满足键盘操作、390px、200% 文本、
`prefers-reduced-motion: reduce`、无水平溢出、无 console error/warning/pageerror，并且不使用 CSS
`grid` 或 `gap`。

## 证据分层与已核对冲突

| 层级 | 可以写成什么 | P03 示例 |
| --- | --- | --- |
| 官方公开契约 | 默认课程正文结论 | 组合 Store、mutation type、订阅清理、guard 内延迟取 Store |
| 固定 4.0.2 源码/测试推导 | 必须显式标版本 | partial store 先注册、patch 手动通知、action Promise hook、实例选择顺序 |
| 应用建模建议 | 只能写成建议 | 业务职责矩阵、副作用 owner、客户端缓存与服务端权威划分 |

本次核验发现两处需要显式处理的证据漂移：

1. `subscriptions.spec.ts` 的 `subscribe is post by default` 测试标题与 Vue watch 默认 `pre` 不一致，
   且断言没有区分 pre/post。以 Vue 公开契约和固定实现未覆盖 flush 为准，课程写默认 `pre`。
2. `types.ts` 关于 `onError` callback “return false 阻止传播”的 JSDoc 与同版本 callback 类型、
   `store.ts` 实现和 `onAction.spec.ts` 冲突。课程不得采用该陈旧注释，错误仍 throw/reject。

除此之外，P03 冻结的 L07-L10 ID、前置、唯一 Demo、L10 独立 memory router、P03 原子发布和停止
边界均与 P0 计划一致，没有发现需要改动 P0 路线的冲突。

## P03 明确排除范围

- 不进入 P04：不讲插件、持久化实现、`@pinia/testing` 或 L11-L12。
- 不进入 P05：不实现真实 SSR、hydration、HMR、Devtools 或 L13-L14。
- 不进入 PRA：不创建或修改 Pinia Reference、Reference index 或搜索收口。
- 不新增 package，不安装依赖，不修改 manifest、课程正文、Demo、测试、计划或 Router。
- 不启动开发服务器，不打开页面，不把未来浏览器 Gate 写成当前已通过。
- 不修改 P01/P02 课程和 Demo；P03 调研阶段 L07-L14 继续保持 `planned`。
- 后续 P03 实施只能让 L07-L10 与同一 focused Gate 原子进入 `available`，L11-L14 保持 `planned`。
- P03 Gate 完成后停止，不自动开始 plugin/testing、SSR/HMR 或 PRA。

## 一手来源

### Pinia 当前官方公开文档

- [Composing Stores](https://pinia.vuejs.org/cookbook/composing-stores.html)
- [What is a Store? / When should I use a Store](https://pinia.vuejs.org/getting-started.html#what-is-a-store)
- [State subscriptions](https://pinia.vuejs.org/core-concepts/state.html#subscribing-to-the-state)
- [Action subscriptions](https://pinia.vuejs.org/core-concepts/actions.html#subscribing-to-actions)
- [Using a store outside of a component](https://pinia.vuejs.org/core-concepts/outside-component-usage.html)
- [Server Side Rendering](https://pinia.vuejs.org/ssr/)
- [`StoreWithState`](https://pinia.vuejs.org/api/pinia/interfaces/StoreWithState.html)
- [`MutationType`](https://pinia.vuejs.org/api/pinia/enumerations/MutationType.html)

### Vue 与 Vue Router 当前官方公开文档

- [Vue `watch()`](https://vuejs.org/api/reactivity-core.html#watch)
- [Vue Callback Flush Timing](https://vuejs.org/guide/essentials/watchers.html#callback-flush-timing)
- [Vue `app.runWithContext()`](https://vuejs.org/api/application.html#app-runwithcontext)
- [Vue Router Global injections within guards](https://router.vuejs.org/guide/advanced/navigation-guards.html#global-injections-within-guards)
- [Vue Router Memory history](https://router.vuejs.org/api/functions/createMemoryHistory.html)

### Pinia 4.0.2 固定文档源码

- [`composing-stores.md`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/docs/cookbook/composing-stores.md)
- [`getting-started.md`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/docs/getting-started.md)
- [`state.md`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/docs/core-concepts/state.md)
- [`actions.md`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/docs/core-concepts/actions.md)
- [`outside-component-usage.md`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/docs/core-concepts/outside-component-usage.md)
- [`ssr/index.md`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/docs/ssr/index.md)

### Pinia 4.0.2 固定源码与官方测试

- [Release `v4.0.2`](https://github.com/vuejs/pinia/releases/tag/v4.0.2)
- [`createPinia.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/createPinia.ts)
- [`rootStore.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/rootStore.ts)
- [`store.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts)
- [`subscriptions.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/subscriptions.ts)
- [`types.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/types.ts)
- [`combinedStores.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/combinedStores.spec.ts)
- [`getters.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/getters.spec.ts)
- [`rootState.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/rootState.spec.ts)
- [`subscriptions.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/subscriptions.spec.ts)
- [`onAction.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/onAction.spec.ts)
- [`ssr.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/ssr.spec.ts)
