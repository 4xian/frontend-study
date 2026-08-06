---
id: vue.pinia.learn.advanced.store-testing
type: lesson
title: Store 测试
summary: 用 fresh Pinia 测试真实业务行为，并准确划分 testing package 的隔离能力
domain: frontend
technology: vue
module: pinia
related:
  - vue.pinia.learn.basics.actions-async
  - vue.pinia.learn.advanced.plugins-persistence
  - vue.pinia.reference.plugins.plugin-contracts
tags:
  - Pinia
  - testing
  - Vitest
  - createPinia
  - fake app
  - "@pinia/testing"
appliesTo: Pinia 4.0.2；@pinia/testing 2.0.1 Deferred/not-installed
verifiedAt: 2026-08-05
sources:
  - title: Pinia：Testing stores
    url: https://pinia.vuejs.org/cookbook/testing.html
  - title: Pinia：createTestingPinia()
    url: https://pinia.vuejs.org/api/@pinia/testing/functions/createTestingPinia.html
  - title: Pinia：TestingOptions
    url: https://pinia.vuejs.org/api/@pinia/testing/interfaces/TestingOptions.html
  - title: Pinia 4.0.2 testing.md
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/docs/cookbook/testing.md
  - title: "@pinia/testing 2.0.1 testing.ts"
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/testing/src/testing.ts
  - title: "@pinia/testing 2.0.1 testing.spec.ts"
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/testing/src/testing.spec.ts
  - title: Pinia 4.0.2 lifespan.spec.ts
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/lifespan.spec.ts
  - title: Vitest：Mocking Functions and Objects
    url: https://vitest.dev/guide/mocking/functions
stage: advanced
level: advanced
estimatedMinutes: 60
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
objectives:
  - 为每个业务 case 创建 fresh Pinia 并执行真实 action
  - 通过相同 Store ID 的两个 Pinia 证明 registry 与 state 隔离
  - 用 fake Vue app 提供普通 Pinia plugin 的安装上下文
  - 区分真实 action 行为测试与 testing action stub
  - 准确标记当前未安装 @pinia/testing 的能力与证据边界
recap:
  - 真实业务测试使用 fresh 普通 Pinia，从默认 state 执行公开 action。
  - 普通 plugin 测试必须先 app.use(pinia)，只设 active Pinia 是有价值的反例。
  - Testing Pinia 默认 stub actions；stubActions:false 执行实现但仍保留 spy。
  - "@pinia/testing 当前保持 Deferred/not-installed，Demo 与本地测试都不导入它。"
---

# Store 测试

:::tip
前置：请先完成 L01-L11，并具备 Vitest 基础。本课不会安装 @pinia/testing，也不会在 production Demo 中伪造它。
:::

## 业务测试从 Fresh Pinia 开始

`defineStore()` 只是 useStore factory；真正 Store 需要 Pinia。业务逻辑 case 应先 `setActivePinia(createPinia())`，再从默认 state 出发调用公开 action，最后观察 state、getter 和返回值。普通 Pinia 不会 stub actions。

~~~~ts
beforeEach(() => {
  setActivePinia(createPinia())
})

it('执行真实 action', () => {
  const store = useCounterStore()

  expect(store.count).toBe(0)
  expect(store.add(2)).toBe(2)
  expect(store.double).toBe(4)
})
~~~~

第二个 case 必须创建 Pinia B。即使 Store ID 相同，B 也应从 factory 默认值开始；否则测试共享了 root state、registry 或 effect scope。结束时 dispose 测试拥有的 Pinia，并恢复原 active Pinia。

## 外部协作者只在真实边界替换

若 action 依赖 API client，可用 `vi.fn(implementation)` 或 `vi.spyOn()` 替换这个外部边界。带实现的 spy 会记录调用并执行实现；空 `vi.fn()` 返回 `undefined`。这不等于 Testing Pinia 自动包装全部 Store actions。

## Plugin Case 需要 Fake App

普通 Pinia 在安装前把 plugin 留在队列。只做 `setActivePinia(createPinia().use(plugin))` 不会进入正常 plugin 创建链；测试应先 `pinia.use(plugin)`，再 `app.use(pinia)`，最后创建 Store。空 app 不需要挂 DOM，它只提供安装上下文。

~~~~ts
const app = createApp({})
const pinia = createPinia().use(plugin)

app.use(pinia)
setActivePinia(pinia)

const store = usePreferencesStore()
expect(store.pluginField).toBe('ready')
~~~~

:::warning
fake app 只解决安装 context，不会自动清理 plugin 创建的 subscriptions、window listeners 或 Pinia effect scope；所有者仍要显式释放。
:::

## @pinia/testing 的固定能力边界

`createTestingPinia()` 来自独立 `@pinia/testing` package，不是 `pinia` 根入口。固定 commit 对应 2.0.1，但当前项目没有安装，因此下表全部是 Deferred/not-installed，不能写成本地测试通过。

| 选项/能力 | 固定 2.0.1 行为 | 当前状态 |
| --- | --- | --- |
| 默认 stubActions | true；action spy 不执行实现 | Deferred/not-installed |
| stubActions\:false | 执行真实实现且仍保留 spy | Deferred/not-installed |
| initialState | 按 Store ID 在创建时 patch | Deferred/not-installed |
| stubPatch | 默认 false；true 才阻止实现 | Deferred/not-installed |
| stubReset | 默认 false；true 才阻止实现 | Deferred/not-installed |
| plugins/fakeApp | 运行用户 plugins，并可安装 fake app | Deferred/not-installed |
| createSpy | 无全局 spy 时必须显式提供 | Deferred/not-installed |
| getter override | 可临时写值，undefined 恢复计算 | Deferred/not-installed |

本站不保留 Vitest 配置或测试 runner。若在独立的临时验证中使用 Vitest，应显式导入 `vi` 并传 `createSpy: vi.fn`，不要依赖 globals。真实 app plugins 应放进 `createTestingPinia({ plugins })`，不能在 testing Pinia 建好后再期待普通 `.use()` 追补 Store。

## 不要让 Stub 反向塑造 Store

Testing Pinia 替换的是 Store 实例上的 action。Setup Store 的局部 action 若通过闭包直接调用另一个局部 action，会绕过实例替换；Options Store 的 `this.otherAction()` 则经过实例。不要只为 stub 方便而扭曲生产结构，优先确认是否真的需要隔离，或直接测试真实 action。

## Store 测试语义实验

:::demo{id="vue.pinia.learn.advanced.store-testing.pinia-testing-semantics-lab-demo" playground="true"}
运行 fresh Pinia 真实 action、第二实例隔离、fake-app plugin 与未安装 app 反例
:::

## 练习与观察

:::steps
### 1. 运行真实 Case A

确认默认 count=0，action 返回 2，getter 为 4。

### 2. 新建 Case B

确认相同 Store ID 仍从 0 开始，且 A/B 实例不相同。

### 3. 安装 Fake App

核对 plugin context 的 pinia/app/store/options identity 与 runs=1。

### 4. 运行反例

只设 active Pinia 时确认 runs=0，Store 没有扩展字段。
:::

## 源码与测试推导

:::steps
### 1. 官方业务单测使用普通 Pinia

testing cookbook 在 beforeEach 创建并 active 新 Pinia，再直接断言 action state。

### 2. Plugin 测试显式安装 App

同一 cookbook 要求 app.use(pinia)，fake app 不是组件测试。

### 3. 默认 Stub 不执行 Action

固定 testing.ts 的 stubActions 默认 true，只用空 spy 替换实现。

### 4. 真实实现仍可被 Spy

固定测试同时证明 stubActions\:false 会修改 state 且记录调用。

### 5. Initial State 是创建期 Patch

按 $id merge partial state，不代表任何 action 已执行。

### 6. User Plugin 先于 Action Wrapper

固定 testing.ts 先注册 initialState/user plugins，再注册 wrapper。

### 7. createSpy 取决于 Runner 配置

无 Jest/Vitest global 时必须显式提供；临时 runner 不能依赖 global vi。

### 8. Setup 闭包可能绕过实例 Stub

固定 guide 与测试说明替换实例 action 不会改写闭包局部调用。
:::

## 易错使用提示

:::pitfalls
### 脱离 Pinia 调用 useStore

**触发条件：** 脱离 Pinia 调用 useStore

**原因：** Store 需要 active 或显式 Pinia。

**后果：** 测试抛出上下文错误或使用错误实例。

**错误示例：**

~~~~ts
const store = useCounterStore()
~~~~

**正确写法：**

~~~~ts
setActivePinia(createPinia())
const store = useCounterStore()
~~~~

**验证方式：** 对照正确写法验证结果。

### 所有 Case 共享一个 Pinia

**触发条件：** 所有 Case 共享一个 Pinia

**原因：** registry、root state 与 effect scope 会保留。

**后果：** 后一个 case 从前一个 case 的结果开始。

**错误示例：**

~~~~ts
const pinia = createPinia()
// 全文件共享
~~~~

**正确写法：**

~~~~ts
beforeEach(() => setActivePinia(createPinia()))
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为普通 Pinia 会 Stub Actions

**触发条件：** 认为普通 Pinia 会 Stub Actions

**原因：** `createPinia()` 使用生产行为。

**后果：** action 真实副作用在测试中执行。

**错误示例：**

~~~~ts
createPinia()
// 假定 action 已 stub
~~~~

**正确写法：**

~~~~ts
const result = store.add(2)
expect(result).toBe(2)
~~~~

**验证方式：** 对照正确写法验证结果。

### 只 setActivePinia 测 Plugin

**触发条件：** 只 setActivePinia 测 Plugin

**原因：** 普通 plugin 仍停在安装队列。

**后果：** runs=0 且扩展字段缺失。

**错误示例：**

~~~~ts
setActivePinia(createPinia().use(plugin))
useStore()
~~~~

**正确写法：**

~~~~ts
const pinia = createPinia().use(plugin)
app.use(pinia)
useStore(pinia)
~~~~

**验证方式：** 对照正确写法验证结果。

### 从 Pinia 根入口导入 Testing Helper

**触发条件：** 从 Pinia 根入口导入 Testing Helper

**原因：** createTestingPinia 属于独立 package。

**后果：** 构建无法解析不存在的导出。

**错误示例：**

~~~~ts
import { createTestingPinia } from 'pinia'
~~~~

**正确写法：**

~~~~ts
import { createTestingPinia } from '@pinia/testing'
~~~~

**验证方式：** 对照正确写法验证结果。

### 默认 Stub 证明业务逻辑正确

**触发条件：** 默认 Stub 证明业务逻辑正确

**原因：** 默认 spy 不执行 action body。

**后果：** 只证明调用发生，没有证明 state 变化。

**错误示例：**

~~~~ts
store.save()
expect(store.save).toHaveBeenCalled()
~~~~

**正确写法：**

~~~~ts
// 另用普通 Pinia 测真实 action 后果
expect(store.saved).toBe(true)
~~~~

**验证方式：** 对照正确写法验证结果。

### stubActions\:false 取消 Spy

**触发条件：** stubActions\:false 取消 Spy

**原因：** 固定 2.0.1 仍包装调用。

**后果：** 遗漏可用的调用断言。

**错误示例：**

~~~~ts
// false 后不能检查调用
~~~~

**正确写法：**

~~~~ts
store.save()
expect(store.save).toHaveBeenCalled()
~~~~

**验证方式：** 对照正确写法验证结果。

### 误解 stubPatch/stubReset 默认值

**触发条件：** 误解 stubPatch/stubReset 默认值

**原因：** 两项默认 false，会执行原方法。

**后果：** 测试期望 state 不变却实际改变。

**错误示例：**

~~~~ts
createTestingPinia()
// 假定 $patch 不执行
~~~~

**正确写法：**

~~~~ts
createTestingPinia({ stubPatch: true, stubReset: true })
~~~~

**验证方式：** 对照正确写法验证结果。

### Setup 内部互调一定经过 Stub

**触发条件：** Setup 内部互调一定经过 Stub

**原因：** 闭包局部调用绕过 Store 实例属性。

**后果：** 被认为隔离的 action 仍执行。

**错误示例：**

~~~~ts
function saveAll() { saveOne() }
~~~~

**正确写法：**

~~~~ts
// 优先测试真实组合，或重新评估是否需要 stub
~~~~

**验证方式：** 对照正确写法验证结果。

### 把能力矩阵当成本地 Green

**触发条件：** 把能力矩阵当成本地 Green

**原因：** 当前没有安装 @pinia/testing。

**后果：** 报告夸大了可运行证据。

**错误示例：**

~~~~ts
status = 'PASS'
~~~~

**正确写法：**

~~~~ts
status = 'Deferred/not-installed'
~~~~

**验证方式：** 对照正确写法验证结果。
:::
