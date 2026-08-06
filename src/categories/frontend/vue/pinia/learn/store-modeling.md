---
id: vue.pinia.learn.intermediate.store-modeling
type: lesson
title: Store 建模
summary: 按所有权、生命周期和复用范围区分局部 UI、业务状态与服务端权威数据
domain: frontend
technology: vue
module: pinia
related:
  - vue.pinia.learn.intermediate.store-composition
  - vue.pinia.learn.intermediate.setup-stores
  - vue.pinia.reference.stores.define-store
tags:
  - Pinia
  - 状态建模
  - 职责
  - 生命周期
  - 客户端缓存
appliesTo: Pinia 4.0.2
verifiedAt: 2026-08-05
sources:
  - title: Pinia：What is a Store?
    url: https://pinia.vuejs.org/getting-started.html#what-is-a-store
  - title: Pinia：Actions
    url: https://pinia.vuejs.org/core-concepts/actions.html
  - title: Pinia 4.0.2 createPinia.ts
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/createPinia.ts
  - title: Pinia 4.0.2 rootState.spec.ts
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/rootState.spec.ts
stage: intermediate
level: intermediate
estimatedMinutes: 40
prerequisites:
  - vue.pinia.learn.basics.setup-first-store
  - vue.pinia.learn.basics.state-patch-reset
  - vue.pinia.learn.basics.getters
  - vue.pinia.learn.basics.actions-async
  - vue.pinia.learn.basics.component-store-to-refs
  - vue.pinia.learn.intermediate.setup-stores
  - vue.pinia.learn.intermediate.store-composition
objectives:
  - 用所有者、生命周期和复用范围判断状态放置位置
  - 区分 Store 的客户端缓存与服务端权威事实
  - 让拥有 state 的 Store action 负责修改
  - 把职责划分标为应用建议而不是 Pinia 强制规则
recap:
  - 局部短命 UI 通常留在组件，共享业务状态由 Store 拥有。
  - 客户端缓存和服务端权威事实必须分开命名与建模。
  - 职责矩阵是应用建议，不是 Pinia 强制分层规范。
---

# Store 建模

:::tip
前置：请先完成 L01-L07，并能区分组件实例、Store registry 与独立 Pinia。
:::

## 先问所有者，再选容器

Pinia 官方把 Store 定义为脱离组件树的共享 state 与业务逻辑，适合应用多处访问或跨页面保留的数据；可以留在组件内的短命局部状态不应为了“统一”而进入 Store。下面的三分法是应用建模建议，不是 runtime 强制规则。

| 判断 | 组件本地 | Pinia Store | 服务端/外部系统 |
| --- | --- | --- | --- |
| 所有者 | 当前视图实例 | 一个业务职责 | 外部权威源 |
| 生命周期 | 随组件重建 | 随 Pinia/Store 实例 | 独立于浏览器视图 |
| 典型状态 | panel、draft、hover | session、任务、跨步流程 | 已持久化订单、权限事实 |
| 副作用入口 | 组件事件 | 命名 action | API 或事务 |

## 客户端缓存不是服务端真相

Store 可以拥有响应数据的浏览器缓存、请求状态和乐观更新，但后端仍可能拥有最终业务事实。建模时分别写清“谁能修改客户端副本”和“谁能确认最终结果”，避免把一次 API 响应复制成第二份权威源。

~~~~ts
export const useTaskStore = defineStore('task', {
  state: () => ({ tasks: [], cacheVersion: 0 }),
  actions: {
    /** 从服务端结果刷新客户端缓存。 */
    applyServerSnapshot(snapshot: TaskSnapshot): void {
      this.tasks = snapshot.tasks
      this.cacheVersion = snapshot.version
    },
  },
})
~~~~

## 生命周期与权威边界实验

:::demo{id="vue.pinia.learn.intermediate.store-modeling.pinia-store-responsibility-lab-demo" playground="true"}
重挂载局部组件，比较局部 UI、业务 Store 与客户端缓存的存续差异
:::

## 练习与观察

:::steps
### 1. 修改三类状态

打开面板、填写草稿、完成任务并刷新缓存。

### 2. 重挂载组件

观察 panel/draft 复位，而任务与缓存仍保留。

### 3. 标注所有者

为每项状态写出唯一修改入口和生命周期。

### 4. 检查措辞

确认服务端 fixture 仍被标为权威源。
:::

## 源码与测试推导

:::steps
### 1. registry 属于 Pinia 实例

createPinia.ts 把 Store registry 放在 Pinia 上，因此组件卸载不会自动删除 Store。

### 2. 多 Store 与多 Pinia 可以隔离

rootState.spec.ts 证明同一 Pinia 可持有多个职责 Store，不同 Pinia 的 root state 互不共享。

### 3. 官方边界是共享范围

Getting Started 推荐共享/跨页面状态进入 Store，并明确反对滥用局部可见性状态。

### 4. action 是业务逻辑入口

Actions 指南支持用命名 action 修改业务 state，但协调者选择仍是应用设计。

### 5. 缓存权威不是 Pinia API

服务端与客户端责任需要业务定义，本课不会把建模建议写成 runtime 契约。

### 6. 当前 Demo 的证据边界

确定性 fixture 只展示所有权，不证明真实网络一致性或服务端事务。
:::

## 易错使用提示

:::pitfalls
### 把所有响应式值都放进 Pinia

**触发条件：** 把所有响应式值都放进 Pinia

**原因：** 响应式能力不等于共享生命周期。

**后果：** 短命 UI 状态跨页面残留。

**错误示例：**

~~~~ts
store.hovered = true
~~~~

**正确写法：**

~~~~ts
const hovered = ref(false)
~~~~

**验证方式：** 对照正确写法验证结果。

### 把组件卸载当成 Store 销毁

**触发条件：** 把组件卸载当成 Store 销毁

**原因：** Store registry 属于 Pinia，不属于最后一个消费者。

**后果：** 重挂载后的保留状态与预期不符。

**错误示例：**

~~~~ts
onUnmounted(() => assumeStoreGone())
~~~~

**正确写法：**

~~~~ts
disposePinia(testPinia) // 明确实例所有者
~~~~

**验证方式：** 对照正确写法验证结果。

### 按页面建立一个巨大 Store

**触发条件：** 按页面建立一个巨大 Store

**原因：** 页面往往组合多个业务职责。

**后果：** 修改规则和副作用失去明确所有者。

**错误示例：**

~~~~ts
useDashboardEverythingStore()
~~~~

**正确写法：**

~~~~ts
useSessionStore(); useTaskStore()
~~~~

**验证方式：** 对照正确写法验证结果。

### 让每个 endpoint 对应一个 Store

**触发条件：** 让每个 endpoint 对应一个 Store

**原因：** 传输结构不是业务职责。

**后果：** 同一业务状态被拆成互相覆盖的副本。

**错误示例：**

~~~~ts
useGetTasksApiStore()
~~~~

**正确写法：**

~~~~ts
useTaskStore()
~~~~

**验证方式：** 对照正确写法验证结果。

### 把客户端缓存当成最终真相

**触发条件：** 把客户端缓存当成最终真相

**原因：** Store 只拥有浏览器内的副本和请求状态。

**后果：** 界面把未确认修改显示成已持久化事实。

**错误示例：**

~~~~ts
store.saved = true // 未经服务端确认
~~~~

**正确写法：**

~~~~ts
store.cacheStatus = 'pending'
~~~~

**验证方式：** 对照正确写法验证结果。

### 用订阅隐藏业务流程

**触发条件：** 用订阅隐藏业务流程

**原因：** 订阅更适合观察和集成。

**后果：** 修改来源形成难追踪的反馈环。

**错误示例：**

~~~~ts
a.$subscribe(() => b.save())
~~~~

**正确写法：**

~~~~ts
await workflow.saveTask()
~~~~

**验证方式：** 对照正确写法验证结果。

### 让 Store 持有 DOM 生命周期

**触发条件：** 让 Store 持有 DOM 生命周期

**原因：** focus、hover 和节点引用属于组件。

**后果：** 长期 Store 持有已卸载节点。

**错误示例：**

~~~~ts
store.inputElement = input.value
~~~~

**正确写法：**

~~~~ts
const inputElement = useTemplateRef('input')
~~~~

**验证方式：** 对照正确写法验证结果。

### 把职责矩阵写成强制架构

**触发条件：** 把职责矩阵写成强制架构

**原因：** Pinia 没有规定唯一的分层或 Store 数量。

**后果：** 团队把案例偏好误当成框架限制。

**错误示例：**

~~~~ts
// Pinia 强制每个实体一个 Store
~~~~

**正确写法：**

~~~~ts
// 按当前应用的所有权与生命周期选择
~~~~

**验证方式：** 对照正确写法验证结果。
:::
