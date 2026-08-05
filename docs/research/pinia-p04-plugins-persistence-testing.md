# Pinia 4.0.2 P04：插件、持久化与 Store 测试官方调研

> 核验日期：2026-08-05（Asia/Shanghai）
>
> 批次边界：仅 `P04 / L11-L12`
>
> 固定版本：[`pinia@4.0.2`](https://github.com/vuejs/pinia/releases/tag/v4.0.2)
>
> 固定 commit：
> [`ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1`](https://github.com/vuejs/pinia/commit/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1)
>
> P0 计划快照：`docs/research/pinia-course-plan.md`，调研时 SHA-256 为
> `b1e05516c3fcaff5324f076c444380db70781dd15890d1e24dcceccec9f0ad87`
>
> P03 调研快照：`docs/research/pinia-p03-composition-modeling-subscriptions-router.md`，
> 调研时 SHA-256 为
> `612fa806e05dde02bad46f5570ffa183a1ea061092d10c18870d9d16b2242741`
>
> Manifest 快照：`src/content/catalog/manifests/vue-pinia-track.ts`，调研时 SHA-256 为
> `040717eb2307d0a0f2e182768c0ce8e6f9097c53b82c78f43ca26f1594b55951`
>
> 本地运行基线：`vue@3.5.40`、`vitest@4.1.10`，lockfile 与 installed package 均解析为
> `pinia@4.0.2`；`@pinia/testing` 未在 `package.json`、lockfile 或 `node_modules` 中安装。

## 资料检索与证据口径

本次先按仓库要求调用 Tavily，对 Pinia 插件、持久化、Store 测试、固定 commit 源码和 Vitest
mock API 做限定官方域名检索，并尝试直接抽取官方页面。Tavily 的 `search` 与 `extract` 均返回
同一 `plan usage limit` 错误，未产生可引用的搜索结果。随后按仓库 fallback 规则，仅使用以下
一手入口完成核验：

1. P0/P03 已冻结的 Pinia 官方 Guide/API URL。
2. 固定 commit 的 Pinia 文档源码、runtime 源码和官方测试。
3. 本地已安装 `pinia@4.0.2` 的 `dist/pinia.js` 与 `dist/pinia.d.ts` 交叉证据。
4. Vue、Vitest、MDN 与 OWASP 的官方文档；不使用博客、问答、视频或第三方持久化库支撑结论。

本文严格区分三层证据：

| 层级 | 可以写成什么 | P04 示例 |
| --- | --- | --- |
| 官方公开契约 | 课程正文默认结论 | plugin context、state 扩展位置、真实 Store 测试、Testing Pinia 默认行为 |
| 固定 4.0.2 源码/测试推导 | 必须显式标版本 | 安装前 plugin queue、插件执行时点、Testing Pinia 插件顺序 |
| 应用策略 | 只能写成课程选定策略 | 存储 key/envelope/schema、敏感字段 allowlist、跨标签冲突处理 |

## 研究结论

1. 正常 Pinia 的 `pinia.use(plugin)` 在 `app.use(pinia)` 前只把插件放入待安装队列；安装 Pinia
   时队列才转入实际插件列表。安装本身不执行 Store plugin，首次创建每个 Store 时才执行。
2. 插件只扩展“Pinia 已安装、插件已注册之后新创建”的 Store，不会追溯扩展此前已进入 registry
   的 Store。重复 `useStore()` 返回同一实例，也不会再次执行插件。
3. `PiniaPluginContext` 的公开字段是 `pinia`、`app`、`store`、`options`。Options Store 得到原始
   define options；Setup Store 的 options 包含其第三参数自定义选项和由 runtime 收集的 actions。
4. Store 本身被 `reactive()` 包装，plugin 返回的 ref/computed 会被自动解包并保持响应性；外部类
   实例等非响应对象应 `markRaw()`。返回的扩展属性自动进入 Devtools custom properties。
5. 需要作为 state、参与 Devtools state 展示或 SSR 序列化/水合的 plugin 字段，必须同时连接
   `store.$state` 与 `store`，并在已有水合值时保留它。类型分别扩展
   `PiniaCustomStateProperties` 与 `PiniaCustomProperties`。
6. plugin 初始化期间的 state 写入发生在 Store subscriptions 激活前，不会作为普通后续 mutation
   通知。默认 `$reset()` 也不会重置 plugin 新增 state，插件需要明确包装 reset 或提供独立 reset。
7. Pinia core 不定义完整持久化协议。L11 只能把 `localStorage` 读写作为 Demo 专用应用策略，必须
   自行负责字段 allowlist、JSON envelope、schema 校验、版本拒绝/迁移、安全和清理。
8. `localStorage` 是同源、跨浏览器会话保留的字符串存储，访问也可能因策略抛 `SecurityError`。
   OWASP 明确不应把 token、session identifier、凭据或其他敏感信息放入 local storage，并要求把
   读出的内容视为不可信输入。
9. `storage` 事件只发给共享同一存储区的其他文档，不回发给执行写入的窗口。跨标签同步必须过滤
   `storageArea/key/version/schema`、抑制回写，并明确冲突策略；它不是跨设备同步或事务协议。
10. 当前仓库无需 `@pinia/testing` 即可真实测试 Store：每个测试使用新的 `createPinia()`，通过
    `setActivePinia()` 供隐式 `useStore()` 使用，并直接执行真实 actions。
11. 正常 Pinia plugin 在测试中也要等 `app.use(pinia)`。依赖插件的测试应创建最小 fake app，按
    `createPinia().use(plugin) -> app.use(pinia) -> useStore()` 顺序执行，再清理插件资源与 Pinia。
12. `createTestingPinia()` 属于独立 `@pinia/testing` package。固定源码对应 `2.0.1`：默认 stub
    actions，`stubActions:false` 执行真实实现但保留 spy，`initialState` 按 Store ID patch，
    `$patch/$reset` 默认只 spy、可分别 stub，`fakeApp` 会创建 app 并安装 Pinia。当前项目全部保持
    **Deferred/not-installed**，不得伪造 import 或本地 green。

## P04 冻结范围

| 课程 | 冻结值 |
| --- | --- |
| L11 | `vue.pinia.learn.advanced.plugins-persistence` |
| L11 标题 | `插件与持久化边界` |
| L11 前置 | L01-L10 |
| L11 唯一 Demo | `vue.pinia.learn.advanced.plugins-persistence.pinia-plugin-persistence-boundary-lab-demo` |
| L12 | `vue.pinia.learn.advanced.store-testing` |
| L12 标题 | `Store 测试` |
| L12 前置 | L01-L11 和 Vitest 基础 |
| L12 唯一 Demo | `vue.pinia.learn.advanced.store-testing.pinia-testing-semantics-lab-demo` |
| 批次发布 | L11-L12 与同一 focused Gate 原子进入 `available` |
| 后续状态 | L13-L14 继续 `planned` |
| 依赖状态 | 不安装 `@pinia/testing` 或任何持久化 package |
| 停止边界 | P04 Gate 后停止，不进入 P05、PRA 或搜索收口 |

本文只为后续两篇课程正文、两个唯一 Demo 和 P04 验收提供事实底稿。本次不修改 manifest、entry、
Demo、spec、实施计划或任何依赖，也不把固定上游测试和源码阅读写成项目内运行证据。

## L11：插件与持久化边界

### 1. 目标、前置与排除

- **目标：** 掌握 `pinia.use()` 的注册/安装/Store 创建时序、plugin context、自定义属性与 state 的
  响应性/类型/Devtools/SSR 边界，并实现一个最小、版本化、可清理的 Demo 持久化策略。
- **前置：** L01-L10，尤其是 Pinia 安装、Options/Setup Store、state patch/reset、subscriptions、
  Store 生命周期、独立 mini-app 和显式 Pinia 实例。
- **本课排除：** 不安装或讲授第三方持久化 package；不持久化宿主主题/课程进度；不实现真实登录
  session、服务端同步、跨设备同步、加密仓库、迁移框架或真实 SSR/hydration fixture；不进入 HMR。

### 2. `pinia.use()` 的准确时序

固定 `createPinia.ts` 的正常 runtime 路径可以拆成五步：

| 时点 | runtime 状态 | 可观察结果 |
| --- | --- | --- |
| `createPinia()` | `_a` 尚无 app，实际 plugin list 为空 | 还没有 Store plugin 执行 |
| 安装前 `pinia.use(plugin)` | plugin 进入待安装队列 | plugin 仍未执行 |
| `app.use(pinia)` | 关联 app/provide Pinia，并把队列移入实际列表 | 仍不会主动创建或追补 Store |
| 安装后首次 `useStore()` | 创建 Store，依序调用实际列表中的 plugins | 每个 plugin 对该 Store 执行一次 |
| 安装后再 `pinia.use(otherPlugin)` | 直接进入实际列表 | 只作用于之后创建的新 Store |

因此“先调用 `pinia.use()`”还不等于插件已生效；同时满足“插件已注册、Pinia 已安装、Store 尚未
创建”才是正常路径。若显式 `useStore(pinia)` 在安装前创建了 Store，随后安装 app 或注册 plugin 都
不会重新执行该 Store 的创建链。课程不得通过内部 `_p` 或待安装队列实现功能，源码只用于解释。

### 3. plugin context 与扩展形态

插件在 Store 自己的 effect scope 中执行，context 包含：

- `pinia`：当前 Store 所属的同一 Pinia 实例。
- `app`：安装该 Pinia 的 Vue app；正常 runtime 已安装路径可用其 provide/global context。
- `store`：当前正被扩展、已经建立 state/getters/actions 的响应式 Store。
- `options`：传给 plugin 的 Store options。Options Store 保留定义选项；Setup Store 的自定义选项
  必须放在 `defineStore()` 第三个参数，runtime 还会把已识别 actions 提供给 plugin。

扩展方式必须按用途区分：

| 需求 | 正确位置 | 类型入口 | Devtools/序列化边界 |
| --- | --- | --- | --- |
| 方法、外部服务、普通扩展值 | plugin 返回对象 | `PiniaCustomProperties` | 返回属性自动进入 custom properties |
| 非响应外部实例 | 返回 `markRaw(instance)` | `PiniaCustomProperties` | 不让 reactive 代理破坏实例 identity |
| 每 Store 响应式 state | `store.$state` 加值，再以 `toRef()` 接到 `store` | `PiniaCustomStateProperties` | 进入 state、Devtools 与 SSR 序列化 |
| 已有水合 state | 先 `Object.hasOwn(store.$state, key)` | 同上 | 不覆盖服务端/预置值 |

Store 被 `reactive()` 包装，所以 plugin 返回的 ref/computed 在 `store.foo` 上会自动解包。若直接写
`store.foo = value` 而不返回它，官方文档要求在 DEV 中手工加入 `_customProperties` 才能进入
Devtools；L11 选择返回扩展属性，避免课程业务依赖内部集合。

新增 state 必须同时有 `store.$state.foo` 与 `store.foo`，但不应再从 plugin 返回同一个 state ref，
否则 Devtools 可能把它同时展示为 state 与 custom property。plugin 初始化 state 或在此时调用
`$patch()` 都发生在 `isListening` 激活之前，不会触发后来注册的普通 `$subscribe()`。

Options Store 默认 `$reset()` 只把 state factory 的字段 assign 回当前 state，不会删除/重置 plugin
新增字段。需要统一 reset 时，保存 `store.$reset.bind(store)`，再由 plugin 返回包装后的 `$reset()`；
Setup Store 没有自动 `$reset()`，课程不得假定其存在。L11 Demo 使用 Options Store，把这一差别收敛
在一个可验证路径内。

### 4. 持久化是应用协议，不是 Pinia core 契约

L11 冻结一个最小 v1 envelope，只持久化无敏感的显示偏好：

```ts
type PersistedPreferencesV1 = {
  version: 1
  data: {
    colorMode: 'light' | 'dark'
    compact: boolean
  }
}
```

这是课程应用策略，不是 Pinia 官方 schema。实现必须遵守以下协议：

1. **唯一 key：** 只使用
   `vue3-study:vue.pinia.learn.advanced.plugins-persistence:v1`，不得读写宿主 theme、progress 或其他
   Demo key，也不得调用 `localStorage.clear()`。
2. **字段 allowlist：** 只从 Store 投影 `colorMode/compact`，不直接序列化完整 `$state`；actions、
   plugin 仪表 state、缓存、错误对象和未来新增字段都不会被意外纳入。
3. **字符串 envelope：** 使用 `JSON.stringify()` 写入明确的 `{ version, data }`；不宣称 JSON 能保留
   class identity、Map/Set、函数、undefined、循环引用或精确日期类型。
4. **不可信读入：** `JSON.parse()` 结果先视为 `unknown`，再验证 object、`version === 1`、枚举和
   boolean 字段；只有完整通过才 `$patch()`，不能把任意存储对象直接 assign 给 Store。
5. **版本策略：** v1 只接受 v1。未知版本、损坏 JSON 或 schema 不匹配时保留默认 state，移除或
   忽略这个 Demo key 并显示确定性状态；本课不伪造尚不存在的 migration framework。
6. **安全策略：** 永不写入 token、session ID、密码、凭据、密钥、权限事实或敏感个人信息。
   localStorage 对同源脚本可读，XSS 可读取或篡改内容，不能把它当作保密或可信边界。
7. **失败策略：** 读取、写入和删除只围绕 Demo key 做最小 `try/catch`，把 `SecurityError`/写入失败
   转成可观察状态；失败不应破坏内存中的 Store 操作。
8. **初始化顺序：** Store 创建时先验证并恢复存储，再注册 `$subscribe()`；plugin 初始化 patch
   不触发订阅，因此不会把未经用户操作的恢复过程误记为一次普通 mutation。

### 5. 跨标签、reset 与清理策略

`storage` 事件不是本窗口的写入回调。L11 的跨标签策略固定为：

1. 只监听 `window` 的 `storage`，并过滤 `event.storageArea === localStorage` 与唯一 Demo key。
2. `newValue === null` 表示另一上下文删除 key；恢复 Store 默认偏好，但不删除其他数据。
3. 非空 `newValue` 走同一个 JSON/schema/version decoder；无效数据不 patch。
4. 应用外部 patch 时使用明确的 `applyingExternal` 抑制标记，避免订阅把同一 envelope 立即写回。
5. 接受“最后收到的有效 storage event 覆盖本地偏好”，不做字段 merge、锁、事务或冲突解决；高并发
   协作数据应使用服务端协议，不应扩大这个 Demo。
6. 当前窗口自己的 `setItem/removeItem` 不期待触发 `storage`；本地 UI 直接由 Store 响应性更新。
7. “清空持久化并重置”只移除 Demo key，并在抑制写入期间执行 Store/plugin state reset。
8. 卸载时调用 `$subscribe()` stop、移除 `storage` listener、卸载 mini-app、删除临时节点、移除
   Demo key，并 `disposePinia()`；本设计不使用 timer。

本课只解释 plugin state 进入 `$state` 后具备 SSR 序列化资格，以及恢复时不应覆盖已有水合值。
`window/localStorage` 是 client-only 边界，真实 SSR 序列化、防 XSS 与 hydration 顺序属于 P05；当前
SPA Demo 和 storage listener 不能冒充 SSR/hydration evidence。

### 6. L11 唯一 Demo 可测试 contract

唯一 Demo 创建独立临时 mini-app、独立 Pinia 和两个 Demo Store。它先保存宿主 active Pinia，再按
`createPinia() -> pinia.use(plugin) -> app.use(pinia) -> create stores` 执行，所有组件外 Store 获取都
显式传入 Demo Pinia，操作结束恢复宿主 active Pinia。

必须可观察并可断言：

1. `pinia.use()` 后、`app.use(pinia)` 后 plugin 执行次数均为 0；首次创建两个 Store 后分别执行一次，
   重复 `useStore()` 不增加次数。
2. context 面板显示 `pinia/app/store/options` 都属于 mini-app，并显示 plugin 用自定义 `persist`
   option 只选择偏好 Store；不得显示或读取内部 `_p/_s`。
3. plugin 返回的命令/元数据可响应访问；plugin state 在 `store` 与 `$state` 两处保持同一值，
   TypeScript 不使用 `any` 或 `@ts-ignore` 绕过 module augmentation。
4. 修改 `colorMode/compact` 后，唯一 key 保存 v1 allowlist envelope；页面不得显示或写入模拟 token。
5. 重建独立 Store 时合法 v1 恢复；损坏 JSON、错误 version、错误 schema 都保留默认 state，并给出
   确定性结果，不抛出未处理错误。
6. 默认 `$reset()` 与 plugin 包装 reset 的差别可观察；最终“清空并重置”恢复内存与存储基线。
7. synthetic `StorageEvent` 只用于 Vitest 定向验证过滤/外部 patch；课程正文必须说明真实跨标签
   event 仍需两个同源浏览上下文，不能把 synthetic event 称为真实跨标签浏览器证据。
8. 操作前后宿主 Pinia、宿主 Router/URL 与宿主 localStorage keys 不变；时间线有界且不用墙钟/随机值。
9. 卸载后再派发同 key event 不改变计数；subscription、listener、mini-app、节点、Demo key 和 Pinia
   全部清理。

### 7. L11 易错点

1. **误区：** 调用 `pinia.use()` 会立刻遍历并扩展所有 Store。
   **纠正：** 安装前只排队，插件在之后创建每个 Store 时执行，不追溯已有实例。
2. **误区：** `app.use(pinia)` 会立即执行 Store plugin。
   **纠正：** 它安装 Pinia 并转移队列；仍需首次创建 Store 才执行 plugin。
3. **误区：** plugin context 只有 `store`。
   **纠正：** 公开 context 还有 `pinia/app/options`，但都必须属于当前隔离 mini-app。
4. **误区：** 给 `store.foo` 赋一个 ref 就自动成为可序列化 state。
   **纠正：** Store 会解包 ref，但 SSR/Devtools state 还要求值进入 `$state` 并共享同一个 ref。
5. **误区：** plugin 返回 state ref 并同时放入 `$state` 是最佳展示方式。
   **纠正：** state 已在 Devtools state 区；重复返回可能造成双重展示。
6. **误区：** Store 的默认 `$reset()` 一定会重置 plugin state。
   **纠正：** plugin 字段不在 state factory 返回值中，需包装 reset；Setup Store 更没有自动 reset。
7. **误区：** 直接 `JSON.stringify(store.$state)` 最省事且可长期兼容。
   **纠正：** 它会无意纳入未来字段和 plugin state，且没有 schema/version；应先做 allowlist 投影。
8. **误区：** localStorage 是本地的，所以适合存 token，读出内容也可信。
   **纠正：** 同源脚本/XSS 可读写；敏感数据禁止存储，读入必须按不可信数据验证。
9. **误区：** `storage` 会在执行 `setItem()` 的当前窗口立即触发。
   **纠正：** 它只通知共享存储区的其他文档；当前 UI 依赖 Store 自身更新。
10. **误区：** 监听 storage 就得到可靠跨标签事务同步。
    **纠正：** 本课只选最后有效事件覆盖，不解决并发冲突、跨设备或服务端一致性。

### 8. L11 编号源码/测试推导与适用场景

1. `createPinia.ts` 的 `toBeInstalled` 与 `_p` 分离，install 时只转移队列；适用于解释为什么测试和
   Demo 必须先安装 app，不能把 `pinia.use()` 当作立即执行。
2. `store.ts` 在 Store 构造末段遍历 `pinia._p`，context 精确传入 `store/app/pinia/options`；适用于
   每 Store 条件扩展和自定义 define option。
3. `store.ts` 在 plugin loop 后才把 `isListening/isSyncListening` 设为 true；与官方 plugins guide
   一致，适用于初始化恢复，不应期待初始化 patch 触发普通订阅。
4. plugin 返回值在 DEV 客户端被加入 `_customProperties` 后 assign 到响应式 Store；适用于可观察
   方法/computed/元数据，课程实现不直接操作内部集合。
5. `storePlugins.spec.ts` 覆盖安装前注册、安装后注册、两个 Store、重复 `useStore()` 和多次 app
   install；适用于证明插件按 Store 创建一次且不追溯已有 registry identity。
6. 官方新增 state 示例以 `Object.hasOwn()` 保留水合值，再用 `toRef(store.$state, key)` 连接两种
   访问；适用于每 Store plugin state，不能据此声称当前 SPA 已验证 SSR。
7. 官方文档与 `storePlugins.spec.ts` 都通过绑定原 `$reset` 包装 plugin reset；适用于 Options Store，
   Setup Store 必须自行定义 reset contract。
8. 本地 `dist/pinia.js` 与固定源码在 queue、plugin loop、context、custom properties 和 reset 实现上
   一致；适用于确认当前 installed 4.0.2 没有打包漂移，但不能替代未来依赖升级重审。

## L12：Store 测试

### 1. 目标、前置与排除

- **目标：** 用当前已安装依赖真实测试 Store state/getters/actions 与 plugin，区分业务逻辑测试和
  组件隔离测试，并准确理解 `createTestingPinia()` 的官方能力及证据边界。
- **前置：** L01-L11 和 Vitest 基础，尤其是 active/显式 Pinia、真实 actions、plugin 安装时序、
  mini-app 与资源清理。
- **本课排除：** 不安装 `@pinia/testing`，不伪造其 runtime import；不建立大型测试工具层，不做
  snapshot 驱动测试，不复制上游 testing 实现，不进入 SSR/HMR/Devtools 或真实网络 E2E。

### 2. 当前仓库可运行的真实 Store 测试

当前项目已安装 `pinia@4.0.2`、`vitest@4.1.10` 和 `jsdom`，因此 L12 的项目内真实证据使用官方
cookbook 的最小模式：

```ts
beforeEach(() => {
  setActivePinia(createPinia())
})

it('执行真实 action', () => {
  const store = useCounterStore()

  store.increment(2)

  expect(store.count).toBe(2)
})
```

这条路径没有 action stub：Store getter 和 action 按生产逻辑执行。每个测试必须创建新 Pinia，避免
registry/root state/effect scope 跨 case 泄漏。课程的最小断言顺序是：默认 state -> 调用公开 action
-> 观察 state/getter/返回值；不通过测试内部实现步骤或 action 私有局部变量。

若被测 action 依赖外部协作者，只在该边界使用 Vitest 的 `vi.fn()` 或 `vi.spyOn()`；Vitest 官方说明
`vi.fn(implementation)` 会记录调用且执行传入实现，空 `vi.fn()` 返回 `undefined`。它与
`createTestingPinia()` 的自动 Store action wrapping 不是同一能力，课程不得混称。

测试结束应恢复测试拥有的全局状态：保存/恢复原 active Pinia，或在独立 spec 的 `afterEach` 中
`setActivePinia(undefined)`；对创建的 Pinia 调用 `disposePinia()`，并由 plugin 自己清理 window
listener/subscription。最小 case 不需要 mount Vue 组件。

### 3. plugin 测试必须提供安装上下文

仅执行 `setActivePinia(createPinia().use(plugin))` 不足以测试正常 plugin 路径：普通 Pinia 会把
plugin 留在待安装队列。官方 cookbook 的 fake app 策略是：

```ts
const app = createApp({})
const pinia = createPinia().use(persistencePlugin)

app.use(pinia)
setActivePinia(pinia)

const store = usePreferencesStore()
```

不需要把空 app 挂到 DOM；`app.use(pinia)` 才是关键。Store 必须在安装后创建，并断言 plugin context
中的 app/pinia/store/options identity 与扩展结果。若 plugin 需要 window listener 或 subscription，
测试还要触发清理并证明清理后不再响应；fake app 本身不是资源清理机制。

L12 不重复全面测试 L11 persistence decoder，只选一个 plugin 安装时序/扩展 smoke，证明测试夹具
确实走正常 app install。schema/version/cross-tab 的详细行为属于 L11 focused assertions。

### 4. `createTestingPinia()` 官方能力与当前证据边界

固定 commit 的 `packages/testing/package.json` 对应 `@pinia/testing@2.0.1`，peer dependency 为
`pinia >=4.0.2`。它是独立 package；当前仓库没有安装，因此下表只能作为官方契约与固定源码说明：

| 选项/能力 | 固定 2.0.1 行为 | 当前项目状态 |
| --- | --- | --- |
| `createTestingPinia()` | 创建 testing Pinia、设为 active | `Deferred/not-installed` |
| `stubActions` 默认值 | `true`，action 变成不执行实现的 spy | `Deferred/not-installed` |
| `stubActions: false` | action 执行真实实现，仍由 spy 包装 | `Deferred/not-installed` |
| `stubActions: string[]/predicate` | 选择性 stub；空数组等同不 stub | `Deferred/not-installed` |
| `initialState` | Store 创建时按 `$id` patch 对应 partial state | `Deferred/not-installed` |
| `stubPatch` 默认值 | `false`，`$patch` 执行且被 spy；`true` 时只记录 | `Deferred/not-installed` |
| `stubReset` 默认值 | `false`，`$reset` 执行且被 spy；`true` 时只记录 | `Deferred/not-installed` |
| `plugins` | 在 testing action wrapper 前运行传入 plugins | `Deferred/not-installed` |
| `fakeApp` | 创建空 app 并调用 `app.use(pinia)` | `Deferred/not-installed` |
| `createSpy` | 无全局 Jest/Vitest spy 时必须显式提供 | `Deferred/not-installed` |
| getter override | getter 可临时写值，赋 `undefined` 恢复计算 | `Deferred/not-installed` |

当前 `vitest.config.ts` 没有 `globals: true`，所以即使未来获批安装，也应显式导入 `vi` 并传
`createSpy: vi.fn`，不能依赖不存在的 global `vi`。官方 testing guide 还规定真实 app plugins 应通过
`createTestingPinia({ plugins: [...] })` 传入，而不是随后调用 `testingPinia.use(plugin)`。

固定 `testing.ts` 的执行顺序是：先注册 `initialState` patch plugin，再注册用户 plugins，随后注册
可写 computed 和 action/patch/reset wrapper；`fakeApp` 最后安装这份 Pinia。因此用户 plugin 在该
固定版本中会看到已 patch 的 initial state，action stubbing 发生在用户 plugin 之后。这个顺序是
固定源码推导，不应提升为跨版本的 Pinia core 契约。

Setup Store 还有一个重要限制：testing plugin 替换的是 Store 实例上的 action。Setup action 若通过
闭包直接调用另一个局部 action，会绕过实例上的 stub；Options Store 通过 `this.otherAction()` 调用则
经过实例。官方建议不要只为满足 stub 而把 Setup Store 结构改复杂，优先测试真实实现或重新判断是否
真的需要 stub。

### 5. L12 唯一 Demo 可测试 contract

唯一 Demo 是“测试语义实验台”，不是浏览器内 Vitest runner。它创建自己的 Pinia/Store，执行真实
runtime 操作，并把 `@pinia/testing` 能力单独标为未安装：

1. “运行真实 Store case”创建 Pinia A，`setActivePinia(A)` 后取得 Store，显示默认 state、真实
   action 返回值和变化后的 getter。
2. “再次运行隔离 case”创建 Pinia B，证明同一 Store ID 从默认 state 开始，A/B registry 与 state
   不共享；结束 dispose A/B 并恢复宿主 active Pinia。
3. “运行 plugin case”创建最小 fake app，按 `use(plugin) -> app.use(pinia) -> useStore()` 执行，
   显示 plugin context identity、执行次数和真实扩展字段。
4. 一条反例用真实计数证明只 `setActivePinia(createPinia().use(plugin))`、未安装 app 时 Store 不会
   得到 plugin；反例使用独立 Pinia/Store ID，不能污染正确路径 registry。
5. 页面把 `createTestingPinia`、默认 stub、`stubActions:false`、`initialState`、`stubPatch`、
   `stubReset`、`plugins/fakeApp` 统一放在“官方能力，Deferred/not-installed”区；不显示伪造 PASS。
6. 不在 production Demo import `vitest`、`@pinia/testing`、`@vue/test-utils`，也不手写 testing
   package 的替代实现；项目内真实证明由 focused Vitest spec 承担。
7. 操作时间线只显示 case 编号、准备/执行/断言结果，不使用随机值、墙钟或真实网络。
8. 重置/卸载清除全部 Pinia effect scope、plugin listener、临时 app/node，并恢复宿主 Pinia、URL 和
   存储；重复运行结果一致。

### 6. L12 易错点

1. **误区：** `defineStore()` 可以脱离 Pinia 独立单测。
   **纠正：** Store 需要 Pinia；每个测试先建新实例并 active，或显式传给 `useStore(pinia)`。
2. **误区：** 所有测试共享一个 Pinia 更接近生产。
   **纠正：** registry/root state 会跨 case 污染；业务单测应每 case 新建 Pinia。
3. **误区：** `createPinia()` 会默认 stub actions。
   **纠正：** 普通 Pinia 执行真实逻辑；stubbing 是独立 testing package 的能力。
4. **误区：** `pinia.use(plugin)` 后用 `setActivePinia()` 就能测试 plugin。
   **纠正：** 普通 plugin 等待 `app.use(pinia)`，需要 fake app 安装后再创建 Store。
5. **误区：** 当前可直接从 `pinia` 根入口 import `createTestingPinia`。
   **纠正：** 它来自未安装的 `@pinia/testing`，不得伪造 runtime import。
6. **误区：** `createTestingPinia()` 默认仍执行 actions。
   **纠正：** 默认 `stubActions:true`；这只能证明调用，不证明业务 state mutation。
7. **误区：** `stubActions:false` 就不再是 spy。
   **纠正：** 它执行真实 action，但仍包装 spy，可同时断言行为和调用。
8. **误区：** `stubPatch/stubReset` 默认会阻止 state 变化。
   **纠正：** 两者默认 false，只 spy 并执行；显式 true 才阻止实现。
9. **误区：** Setup Store 内部 action 互调一定经过实例 stub。
   **纠正：** 闭包直接调用绕过实例替换；不要为测试便利扭曲生产结构。
10. **误区：** 浏览器面板列出 testing matrix 就等于已验证 `@pinia/testing`。
    **纠正：** 未安装能力必须标 `Deferred/not-installed`，只有获批安装后的真实 import/test 才能 green。

### 7. L12 编号源码/测试推导与适用场景

1. 官方 testing cookbook 的 Store unit test 在 `beforeEach` 使用
   `setActivePinia(createPinia())`，并直接断言 action 后 state；适用于当前仓库真实业务测试。
2. 同一 cookbook 明确 plugin 要等 Pinia 安装到 app；适用于持久化/扩展 Store 测试，fake app
   只是提供安装上下文，不代表组件测试。
3. 固定 `testing.ts` 默认 `stubActions=true`，空 spy 不执行实现；适用于组件隔离和交互断言，不足以
   证明 action 业务逻辑。
4. 固定 `testing.spec.ts` 同时断言默认 stub 后 state 不变、`stubActions:false` 后 state 改变且 spy
   被调用；适用于精确区分“调用证据”和“行为证据”。
5. `initialState` plugin 按 `$id` 在 Store 创建时 merge，`$patch/$reset` wrapper 默认调用原方法；
   适用于初始化组件场景，不能把 initial state 当作 action 已执行。
6. `plugins` 被直接加入内部 plugin list，而 `fakeApp` 再调用 `app.use(pinia)`；适用于需要 app context
   的 testing plugin。课程只描述结果，不复制或依赖内部 `_p`。
7. 固定 guide/source 要求在 Vitest globals 不可用时显式 `createSpy: vi.fn`；当前配置没有
   `globals:true`，适用于未来获批安装后的明确配置，当前仍是 Deferred。
8. 固定 guide 说明 Setup Store 闭包 action 调用绕过实例 stub，官方测试覆盖 Options/Setup Store
   wrapper；适用于选择真实 action 测试，避免为 mockability 反向污染 Store 设计。

## 两课唯一 Demo 与证据边界

| 课程 | 唯一真实 seam | 非浏览器可证明 | 后续浏览器必须证明 |
| --- | --- | --- | --- |
| L11 | 独立 mini-app + Pinia plugin + 唯一 v1 localStorage key | 安装时序、context、state alias、decoder、listener cleanup | 真实交互、存储重建、宿主隔离、无 console/pageerror |
| L12 | 独立普通 Pinia 的真实 actions + plugin fake app | 新 Pinia 隔离、真实 action、plugin 安装；testing package 仅固定上游证据 | 重复 case、状态矩阵、宿主隔离、Deferred 标签清晰 |

本文没有启动开发服务器、打开页面或运行浏览器，因此两课所有浏览器 evidence 均为
**Deferred/not-run**。固定官方测试、本地源码阅读、synthetic `StorageEvent` 设计和研究文档都不能
写成 P04 浏览器 Gate 已通过。

后续实现时，两个 Demo 还必须统一满足键盘操作、390px、200% 文本、
`prefers-reduced-motion: reduce`、无水平溢出、无 console warning/error/pageerror，并且不得使用
CSS `grid` 或 `gap`。真实跨标签 storage 行为若没有两个同源 browsing contexts，必须继续标
`Deferred/not-run`；不得以同页按钮或 synthetic event 冒充。

## P04 原子发布、文件范围与 Gate

### 1. 实施期允许文件

P04 实施只能触及下列与两课直接相关的文件：

1. `src/content/entries/learn/vue/pinia/advanced/plugins-persistence.ts`
2. `src/content/entries/learn/vue/pinia/advanced/store-testing.ts`
3. `src/content/demos/vue/pinia/learn/advanced/plugins-persistence/pinia-plugin-persistence-boundary-lab-demo.vue`
4. `src/content/demos/vue/pinia/learn/advanced/store-testing/pinia-testing-semantics-lab-demo.vue`
5. `src/content/catalog/manifests/vue-pinia-track.ts`
6. `src/content/catalog/vue-pinia-p04.spec.ts`
7. `src/content/catalog/vue-pinia-p03.spec.ts`，只允许删除/收窄“L11-L14 永久为 planned”和
   `track.entries` 永久只有前十课的阶段性断言；不得改写 P03 行为测试。

第 7 项是当前快照已确认的必要兼容改动：P03 focused spec 现有原子测试精确要求 L11-L14 全部
`planned`，且要求 available entries 精确等于前十课。若 P04 原子开放 L11-L12 而不最小修订，该
历史阶段断言会让回归 Gate 必然失败。P01/P02 spec 已只断言各自前缀，不需要修改。

除以上 allowlist 外，不修改 registry glob、共享 schema、Router、宿主 Store、P01-P03 entry/Demo、
P0/P03/P04 research、实施计划、Reference、搜索、E2E 配置、package 或 lockfile。若实现发现必须
扩大文件范围，应先停下重新批准，不能静默扩 scope。

### 2. focused red/green 与静态 Gate

1. 开始前重算本文件头列出的计划/P03/manifest SHA，并记录 `git status --short`；冻结输入变化先做
   差异审计，保护现有 dirty workspace。
2. 新建唯一 `vue-pinia-p04.spec.ts`，通过公开 `learningCatalog` 与 `resolveDemo()` 期待前十二课
   `available`、L13-L14 `planned`、L11/L12 各一个唯一 Demo；在 entry/Demo/manifest 修改前运行，
   必须因当前 P04 未发布而 red。
3. 同一 focused spec 只增加最少行为 cases：L11 一例覆盖 plugin 安装/扩展/版本/schema/清理关键
   路径，L12 一例覆盖新 Pinia 真实 action 隔离与 fake-app plugin；不为每个表格单元复制测试。
4. 同批新增两篇 entry 和两个 Demo、最小修订 P03 阶段断言，并一次性把 manifest 的 L11/L12 改为
   `available`；L13/L14 保持 `planned`。不得出现一课 available、另一课 planned 的中间发布结果。
5. 复跑同一 P04 spec 转绿，再运行 P01-P04 Pinia specs、entry template/registry 相关定向 Vitest、
   `npm run type-check`、触及文件 Oxlint/Prettier、禁止 CSS 属性检查和 tracked/untracked whitespace。
6. P04 不安装 `@pinia/testing`，所以任何本地命令都不得包含该 runtime import。文档对该 package 的
   上游固定测试不是项目内 pass；报告继续写 `Deferred/not-installed`。

### 3. 浏览器 Gate 与停止边界

未来实施复用已有 `localhost:5173`，不得启动第二个 dev server。用一条可复跑 Playwright 路径依次
验证 L11/L12：plugin 执行时序、v1 保存/恢复/损坏数据/reset/卸载清理、真实 action 与 fresh Pinia、
fake-app plugin、宿主 active Pinia/URL/storage 隔离，以及键盘、390px、200% 文本、reduced motion、
水平溢出和 console/pageerror。

未实际运行的真实跨标签、SSR/hydration、`@pinia/testing` 均保留 Deferred，不得由普通 SPA 面板
文本替代。全部静态与浏览器证据完成后做独立 Standards/Spec 双轴复审，只有
`PASS / 0 finding` 才能把 P04 写为关闭。

P04 关闭即停止：不创建或修改 L13/L14，不进入 SSR、hydration、HMR、Devtools，不安装
`@pinia/nuxt`，不开始 P05、PRA1-PRA4 或搜索收口，不提交、不推送、不创建 PR。

## P04 明确排除范围

- 不修改当前 manifest、entry、Demo、spec 或实施计划；本文阶段只新增这一份调研文档。
- 不安装 `@pinia/testing`、第三方 persistence package 或任何其他依赖。
- 不从 `pinia` 根入口伪造 `createTestingPinia`，不在 production Demo import Vitest/Test Utils。
- 不把 localStorage 设计成认证、安全存储、服务端真相、跨设备同步或事务数据库。
- 不读写宿主 theme/progress/其他 Demo storage，不调用 `localStorage.clear()`。
- 不实现真实 SSR/hydration、HMR、Devtools 或 P05 课程；相关边界只做事实说明。
- 不创建/修改 Pinia Reference、索引、搜索或 PRA 文档。
- 不启动 dev server、不打开页面；浏览器证据保持 `Deferred/not-run`。
- P04 实施完成后只报告 Gate，不自动进入 P05/PRA，不提交代码。

## 一手来源

### Pinia 当前官方 Guide 与 API

- [Plugins](https://pinia.vuejs.org/core-concepts/plugins.html)
- [Testing stores](https://pinia.vuejs.org/cookbook/testing.html)
- [`PiniaPluginContext`](https://pinia.vuejs.org/api/pinia/interfaces/PiniaPluginContext.html)
- [`PiniaCustomProperties`](https://pinia.vuejs.org/api/pinia/interfaces/PiniaCustomProperties.html)
- [`PiniaCustomStateProperties`](https://pinia.vuejs.org/api/pinia/interfaces/PiniaCustomStateProperties.html)
- [`createTestingPinia()`](https://pinia.vuejs.org/api/@pinia/testing/functions/createTestingPinia.html)
- [`TestingOptions`](https://pinia.vuejs.org/api/@pinia/testing/interfaces/TestingOptions.html)
- [`setActivePinia()`](https://pinia.vuejs.org/api/pinia/functions/setActivePinia.html)
- [`disposePinia()`](https://pinia.vuejs.org/api/pinia/functions/disposePinia.html)

### Pinia 4.0.2 固定文档与 package 边界

- [Release `v4.0.2`](https://github.com/vuejs/pinia/releases/tag/v4.0.2)
- [`plugins.md`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/docs/core-concepts/plugins.md)
- [`testing.md`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/docs/cookbook/testing.md)
- [`packages/testing/package.json`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/testing/package.json)

### Pinia 4.0.2 固定源码与官方测试

- [`createPinia.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/createPinia.ts)
- [`store.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts)
- [`types.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/types.ts)
- [`storePlugins.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/storePlugins.spec.ts)
- [`testing.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/testing/src/testing.ts)
- [`testing.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/testing/src/testing.spec.ts)
- [`lifespan.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/lifespan.spec.ts)

### Vue、Vitest 与 Web Platform

- [Vue `app.use()`](https://vuejs.org/api/application.html#app-use)
- [Vue `reactive()`](https://vuejs.org/api/reactivity-core.html#reactive)
- [Vue `toRef()`](https://vuejs.org/api/reactivity-utilities.html#toref)
- [Vue `markRaw()`](https://vuejs.org/api/reactivity-advanced.html#markraw)
- [Vitest `vi.fn()` / `vi.spyOn()`](https://vitest.dev/api/vi.html#vi-fn)
- [MDN `localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [MDN `storage` event](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event)
- [MDN `JSON.stringify()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
- [MDN `JSON.parse()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)
- [OWASP HTML5 Security Cheat Sheet / Local Storage](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#local-storage)
