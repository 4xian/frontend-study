---
id: vue.pinia.learn.basics.actions-async
type: lesson
title: Actions 与异步流程
summary: 用 action 封装同步和异步业务命令，并明确返回、失败与订阅回调的结算顺序
domain: frontend
technology: vue
module: pinia
related:
  - vue.pinia.learn.basics.getters
  - vue.pinia.reference.stores.store-shape
tags:
  - Pinia
  - actions
  - async
  - $onAction
  - after
  - onError
appliesTo: Pinia 4.0.2
verifiedAt: 2026-08-04
sources:
  - title: Pinia：Actions
    url: https://pinia.vuejs.org/core-concepts/actions.html
  - title: Pinia 4.0.2 actions.spec.ts
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/actions.spec.ts
  - title: Pinia 4.0.2 onAction.spec.ts
    url: https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/onAction.spec.ts
stage: basics
level: beginner
estimatedMinutes: 45
prerequisites:
  - vue.pinia.learn.basics.setup-first-store
  - vue.pinia.learn.basics.state-patch-reset
  - vue.pinia.learn.basics.getters
objectives:
  - 用方法语法定义能正确访问 this 的 Options action
  - 让 action 返回业务结果并把失败继续交给调用方
  - 区分同步抛错与 Promise rejection
  - 理解 $onAction 的 after 与 onError 结算时机
recap:
  - Action 适合有名称的业务命令，Options action 用方法语法保留 Store this。
  - after 等待 Promise resolve，onError 覆盖同步 throw 与异步 reject。
  - 监听不会吞掉错误；调用方仍负责 await、catch 与陈旧请求策略。
---

# Actions 与异步流程

## 一、Action 是有名称的业务命令

Action 可以读取和修改当前 Store，也可以调用其他 action、另一个 Store 或异步服务。与 getter 不同，它适合表达有副作用的业务流程。Action 的参数和返回值保持普通函数语义，调用方应 `await` 并处理失败。

~~~~ts
export const useSessionStore = defineStore('session', {
  state: () => ({ user: null as User | null }),
  actions: {
    /** 登录并返回已确认的用户。 */
    async login(credentials: Credentials): Promise<User> {
      const user = await api.login(credentials)
      this.user = user
      return user
    },
  },
})
~~~~

:::warning
Options Store action 使用方法语法，不要写箭头函数。箭头函数没有由 Pinia 绑定的 `this`，无法安全访问当前 Store。
:::

## 二、订阅一次 action 的完整结算

`$onAction()` 在 action 开始时收到名称与参数。`after()` 对同步返回值立即运行，对 Promise 则等待 resolve；`onError()` 同时覆盖同步 throw 和 Promise reject。监听不会吞掉错误，调用方仍要 catch 或让错误继续传播。

~~~~ts
const unsubscribe = store.$onAction(({ name, args, after, onError }) => {
  console.log('start', name, args)
  after((result) => console.log('resolved', result))
  onError((error) => console.error('failed', error))
})
~~~~

## 三、用手动 Gate 消除网络随机性

下面的 Demo 不请求真实网络。异步 action 先停在手动 deferred gate，界面再明确选择 resolve 或 reject；另一按钮触发同步 throw。时间线展示 start、action 内部步骤、after/onError 与调用方结算的确定顺序。

:::demo{id="vue.pinia.learn.basics.actions-async.pinia-action-lifecycle-lab-demo" playground="true"}
手动完成或拒绝异步 action，并对比同步抛错的订阅结算顺序
:::

## 四、源码与测试推导

:::steps
### 1. Promise 延迟 after

Pinia 的 action wrapper 检测返回值是否为 Promise；是 Promise 时在 `then` 中调用 after callbacks 并传入 resolve 值，所以 after 不会在请求仍 pending 时提前运行。

### 2. 两类失败都继续传播

同步 throw 会先调用 error callbacks 再重新抛出；Promise reject 会在 rejection 分支调用 callbacks 后继续 reject。固定 `onAction.spec.ts` 分别覆盖这两条路径。
:::

## 五、易错使用提示

:::pitfalls
### 用箭头函数定义 Options action

**触发条件：** 用箭头函数定义 Options action

**原因：** 箭头函数捕获词法 this，Pinia 无法把当前 Store 绑定进去。

**后果：** this 不是 Store，state 写入失败或落到错误对象。

**错误示例：**

~~~~ts
increment: () => {
  this.count++
}
~~~~

**正确写法：**

~~~~ts
increment(): void {
  this.count++
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 调用异步 action 却不处理 rejection

**触发条件：** 调用异步 action 却不处理 rejection

**原因：** onError 只观察失败，不会替调用方消费 rejected Promise。

**后果：** 页面出现未处理 Promise rejection，加载状态也可能无法复位。

**错误示例：**

~~~~ts
store.login(credentials)
~~~~

**正确写法：**

~~~~ts
try {
  await store.login(credentials)
} catch (error) {
  showError(error)
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为 after 在 Promise 创建后立即运行

**触发条件：** 认为 after 在 Promise 创建后立即运行

**原因：** after 对异步 action 等待 Promise resolve，并接收最终值。

**后果：** 过早停止 loading 或记录成功，实际请求随后仍可能失败。

**错误示例：**

~~~~ts
store.$onAction(({ after }) => {
  after(() => loading = false) // 误解为立即执行
})
~~~~

**正确写法：**

~~~~ts
after((result) => {
  loading = false
  recordSuccess(result)
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 action 内吞掉所有失败

**触发条件：** 在 action 内吞掉所有失败

**原因：** 没有恢复策略时 catch 后返回 undefined 会把失败伪装成成功结算。

**后果：** after 收到 undefined，调用方无法区分真实成功与被隐藏的错误。

**错误示例：**

~~~~ts
try {
  return await save()
} catch {
  return undefined
}
~~~~

**正确写法：**

~~~~ts
try {
  return await save()
} catch (error) {
  this.lastError = toMessage(error)
  throw error
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 忽略并发请求的陈旧结果

**触发条件：** 忽略并发请求的陈旧结果

**原因：** 后发请求可能先完成，action 不会自动取消或标记旧 Promise。

**后果：** 较早请求最后写回，覆盖用户刚取得的新数据。

**错误示例：**

~~~~ts
this.result = await search(query)
~~~~

**正确写法：**

~~~~ts
const requestId = ++this.requestId
const result = await search(query)
if (requestId === this.requestId) this.result = result
~~~~

**验证方式：** 对照正确写法验证结果。
:::
