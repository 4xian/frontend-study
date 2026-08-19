---
id: vue.pinia.learn.advanced.plugins-persistence
type: lesson
title: 插件与持久化边界
summary: 理解 plugin 创建时序，并实现版本化、白名单且可清理的显示偏好持久化
domain: frontend
technology: vue
module: pinia
related:
  - vue.pinia.learn.basics.state-patch-reset
  - vue.pinia.learn.intermediate.subscriptions-actions
  - vue.pinia.reference.plugins.plugin-contracts
tags:
  - Pinia
  - plugin
  - pinia.use
  - localStorage
  - schema
  - storage event
appliesTo: Pinia 4.0.2
verifiedAt: 2026-08-05
sources:
  - title: Pinia：Plugins
    url: https://pinia.vuejs.org/core-concepts/plugins.html
  - title: Pinia：PiniaPluginContext
    url: https://pinia.vuejs.org/api/pinia/interfaces/PiniaPluginContext.html
  - title: Pinia 4.0.2 createPinia.ts
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/createPinia.ts
  - title: Pinia 4.0.2 store.ts
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts
  - title: Pinia 4.0.2 storePlugins.spec.ts
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/storePlugins.spec.ts
  - title: MDN：Window localStorage
    url: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
  - title: MDN：Window storage event
    url: https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event
  - title: OWASP：HTML5 Security Cheat Sheet / Local Storage
    url: https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#local-storage
stage: advanced
level: advanced
estimatedMinutes: 65
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
objectives:
  - 解释 pinia.use、app.use 与首次创建 Store 的准确先后关系
  - 使用 pinia、app、store、options 四个 plugin context 字段
  - 区分 plugin 自定义属性与同时连接 Store/$state 的响应式 state
  - 设计只保存显示偏好的 v1 allowlist envelope
  - 过滤 storage 事件、抑制外部 patch 回写并清理全部资源
recap:
  - Plugin 在已安装 Pinia 的新 Store 创建链中执行，不追补 registry 旧实例。
  - 进入 state 的扩展字段必须连接 Store 与 $state；默认 reset 不认识 plugin state。
  - 持久化是应用协议：版本、allowlist、校验、安全、冲突与清理都由应用负责。
  - 本课只证明 SPA listener seam；真实跨标签和 SSR/hydration 仍不在 P04 证据内。
---

# 插件与持久化边界

:::tip
前置：请先完成 L01-L10，尤其要理解 Pinia 安装、Options/Setup Store、$reset、$subscribe 与组件外显式 Pinia。
:::

## 一、Plugin 只在创建链中执行

`pinia.use(plugin)` 注册扩展，但安装前只进入待安装队列；`app.use(pinia)` 把队列并入实际 plugin 列表；真正执行发生在之后首次创建每个 Store 时。已经进入 registry 的 Store 不会被追补，重复 `useStore()` 只返回同一实例。

| 时点 | plugin runs | 结论 |
| --- | --- | --- |
| createPinia() | 0 | 尚无 app，也没有 Store |
| 安装前 pinia.use(plugin) | 0 | 仅排队 |
| app.use(pinia) | 0 | 安装并转移队列，不主动创建 Store |
| 首次创建两个 Store | 2 | 每个新 Store 执行一次 |
| 重复取得两个 Store | 仍为 2 | registry identity 不变 |

:::warning
不要读取 `_p`、`_s` 或待安装队列来实现业务。它们只帮助解释固定 4.0.2 的时序，不是公开扩展接口。
:::

## 二、Context、属性与 State 分工

公开 context 包含 `pinia/app/store/options`。返回的方法、computed、元数据属于 custom properties；需要进入 Devtools state 与 SSR 序列化资格的字段，则先写入 `store.$state`，再用同一个 ref 接到 `store`。已有预置/水合值必须保留。

~~~~ts
pinia.use(({ store, options }) => {
  if (!Object.hasOwn(store.$state, 'pluginState')) {
    store.$state.pluginState = 0
  }
  store.pluginState = toRef(store.$state, 'pluginState')

  return {
    pluginLabel: computed(() => store.$id),
    persistEnabled: Boolean(options.persist),
  }
})
~~~~

Store 是 reactive 对象，所以返回的 ref/computed 在属性访问时会解包。外部类实例应使用 `markRaw()` 保持 identity。类型分别通过 `PiniaCustomProperties`、`PiniaCustomStateProperties` 和自定义 define options augmentation 声明，不能用 `any` 掩盖契约。

## 三、Reset 是插件自己的责任

Options Store 的默认 `$reset()` 只把 state factory 字段 assign 回当前 state，不会重置 plugin 后加的字段。插件若承诺统一 reset，必须先绑定原方法再包装；Setup Store 没有内建 `$reset()`，应由 Store 自己定义。

## 四、冻结一个最小 v1 持久化协议

~~~~ts
type PersistedPreferencesV1 = {
  version: 1
  data: {
    colorMode: 'light' | 'dark'
    compact: boolean
  }
}
~~~~

| 协议项 | 本课选择 | 明确排除 |
| --- | --- | --- |
| key | vue3-study\:vue.pinia.learn.advanced.plugins-persistence\:v1 | 不读写宿主 theme/progress，不调用 clear() |
| 字段 | 只投影 colorMode/compact | 不序列化完整 $state |
| 解码 | JSON.parse 后按 unknown 校验 | 不直接 assign 不可信对象 |
| 版本 | 只接受 version=1 | 不伪造迁移框架 |
| 失败 | 保留内存操作并显示状态 | 不因存储失败阻断 UI |
| 安全 | 只保存非敏感显示偏好 | 不保存 token/session/凭据 |

初始化时先读取、解码并恢复，再注册 `$subscribe()`。固定 4.0.2 在 plugin loop 之后才激活普通 Store subscriptions，因此初始化 patch 不应被当作一次用户 mutation。

## 五、Storage 事件与清理

:::steps
### 1. 过滤事件

同时核对 storageArea、唯一 key、newValue、version 和 schema。

### 2. 应用外部值

有效 v1 采用最后收到者覆盖；newValue=null 恢复默认偏好。

### 3. 抑制回写

外部 patch 期间设置 applyingExternal，订阅看到标记便不写回。

### 4. 清理所有权

停止订阅、移除 listener、卸载 mini-app、删除节点并 dispose Pinia。
:::

:::warning
`storage` 不回发给执行 `setItem()` 的当前文档。synthetic StorageEvent 只能验证 listener seam，不能冒充两个同源标签页的真实浏览器证据。
:::

## 六、插件与持久化实验

:::demo{id="vue.pinia.learn.advanced.plugins-persistence.pinia-plugin-persistence-boundary-lab-demo" playground="true"}
观察两个 Store 的 plugin 时序、context、state alias、v1 解码、reset 与 storage listener
:::

## 七、练习与观察

:::steps
### 1. 核对四个检查点

确认 use/install 都为 0，两个 Store 首次创建后为 2，重复取得仍为 2。

### 2. 检查 envelope

修改偏好后确认只出现 version、colorMode 和 compact。

### 3. 比较 reset

先增加 plugin state，再比较默认 reset 与包装 reset。

### 4. 输入不可信数据

分别重建损坏 JSON、未知版本和错误 schema，确认都回到默认值。
:::

## 八、源码与测试推导

:::steps
### 1. 注册队列与实际列表分离

createPinia.ts 的 toBeInstalled/_p 解释安装前 use 为什么不会立即执行。

### 2. Plugin context 来自 Store 创建末段

store.ts 遍历 plugin list，并精确传入 store/app/pinia/options。

### 3. 初始化早于 subscriptions 激活

plugin loop 后才开启 listening，适合先恢复存储再订阅。

### 4. 返回值成为 custom properties

固定 DEV 路径记录返回属性，再 assign 到响应式 Store。

### 5. Plugin 每 Store 只创建一次

storePlugins.spec.ts 覆盖两个 Store、重复 useStore 与安装前后注册。

### 6. State alias 保留预置值

官方示例先 Object.hasOwn，再用 toRef 连接 $state 与 Store。

### 7. Reset 包装只适用于明确契约

官方文档与测试均先 bind 原 $reset；Setup Store 不能套用内建 reset 假设。

### 8. localStorage 是不可信应用边界

MDN/OWASP 要求处理访问失败、按不可信输入校验且不存敏感标识。
:::

## 九、易错使用提示

:::pitfalls
### 把 pinia.use 当成立即执行

**触发条件：** 把 pinia.use 当成立即执行

**原因：** 安装前调用只把 plugin 放进队列。

**后果：** 测试断言了从未发生的扩展。

**错误示例：**

~~~~ts
pinia.use(plugin)
expect(runs).toBe(1)
~~~~

**正确写法：**

~~~~ts
pinia.use(plugin)
app.use(pinia)
useStore()
expect(runs).toBe(1)
~~~~

**验证方式：** 对照正确写法验证结果。

### 期待 app.use 主动创建 Store

**触发条件：** 期待 app.use 主动创建 Store

**原因：** 安装只关联 app 并转移队列。

**后果：** plugin run 计数与真实时序不符。

**错误示例：**

~~~~ts
app.use(pinia)
expect(runs).toBe(1)
~~~~

**正确写法：**

~~~~ts
app.use(pinia)
expect(runs).toBe(0)
useStore()
~~~~

**验证方式：** 对照正确写法验证结果。

### 追补已经创建的 Store

**触发条件：** 追补已经创建的 Store

**原因：** plugin 只进入后续 Store 创建链。

**后果：** 旧 Store 缺少预期字段。

**错误示例：**

~~~~ts
const store = useStore(pinia)
pinia.use(plugin)
~~~~

**正确写法：**

~~~~ts
pinia.use(plugin)
app.use(pinia)
const store = useStore(pinia)
~~~~

**验证方式：** 对照正确写法验证结果。

### 只给 Store 赋 ref

**触发条件：** 只给 Store 赋 ref

**原因：** custom property 不自动成为可序列化 state。

**后果：** Devtools state 与 SSR state 缺字段。

**错误示例：**

~~~~ts
store.pluginState = ref(0)
~~~~

**正确写法：**

~~~~ts
store.$state.pluginState = 0
store.pluginState = toRef(store.$state, 'pluginState')
~~~~

**验证方式：** 对照正确写法验证结果。

### 默认 reset 会重置 plugin state

**触发条件：** 默认 reset 会重置 plugin state

**原因：** 默认 factory 不知道新增字段。

**后果：** 界面看似重置，扩展状态仍残留。

**错误示例：**

~~~~ts
store.$reset()
~~~~

**正确写法：**

~~~~ts
const reset = store.$reset.bind(store)
return { $reset: () => { reset(); store.pluginState = 0 } }
~~~~

**验证方式：** 对照正确写法验证结果。

### 序列化完整 $state

**触发条件：** 序列化完整 $state

**原因：** 未来字段与 plugin state 会被意外纳入。

**后果：** schema 漂移且扩大数据暴露。

**错误示例：**

~~~~ts
JSON.stringify(store.$state)
~~~~

**正确写法：**

~~~~ts
JSON.stringify({
  version: 1,
  data: { colorMode: store.colorMode, compact: store.compact },
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 直接信任 JSON.parse 结果

**触发条件：** 直接信任 JSON.parse 结果

**原因：** localStorage 可被同源脚本修改。

**后果：** 无效枚举或类型进入 Store。

**错误示例：**

~~~~ts
store.$patch(JSON.parse(raw).data)
~~~~

**正确写法：**

~~~~ts
const value: unknown = JSON.parse(raw)
if (isPreferencesV1(value)) store.$patch(value.data)
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 localStorage 当安全仓库

**触发条件：** 把 localStorage 当安全仓库

**原因：** 同源脚本和 XSS 都可读取。

**后果：** token、session 或凭据泄漏。

**错误示例：**

~~~~ts
localStorage.setItem('token', token)
~~~~

**正确写法：**

~~~~ts
localStorage.setItem(preferenceKey, safePreferences)
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为当前窗口会收到 storage

**触发条件：** 认为当前窗口会收到 storage

**原因：** 写入窗口不会收到自己的 storage event。

**后果：** 本地 UI 等待一个不会到来的事件。

**错误示例：**

~~~~ts
setItem(key, value)
// 等待 storage 更新当前 UI
~~~~

**正确写法：**

~~~~ts
store.$patch(next)
setItem(key, encode(next))
~~~~

**验证方式：** 对照正确写法验证结果。

### 外部 patch 立即回写

**触发条件：** 外部 patch 立即回写

**原因：** 订阅不区分外部应用与本地操作。

**后果：** 跨标签产生无意义写回或反馈环。

**错误示例：**

~~~~ts
store.$patch(external.data)
~~~~

**正确写法：**

~~~~ts
applyingExternal = true
store.$patch(external.data)
applyingExternal = false
~~~~

**验证方式：** 对照正确写法验证结果。
:::
