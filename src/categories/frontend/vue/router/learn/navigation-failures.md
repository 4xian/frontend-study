---
id: vue.router.learn.advanced.navigation-failures
type: lesson
title: 导航失败
summary: 等待导航 Promise，区分成功、阻止、取消与重复导航
domain: frontend
technology: vue
module: router
related:
  - vue.router.learn.basics.composition-programmatic-navigation
  - vue.router.learn.intermediate.meta-navigation-guards
tags:
  - Vue Router
  - NavigationFailure
  - isNavigationFailure
  - afterEach
appliesTo: Vue 3.5.40、Vue Router 5.2.0
verifiedAt: 2026-08-04
sources:
  - title: Vue Router：Navigation Failures
    url: https://router.vuejs.org/guide/advanced/navigation-failures
  - title: Vue Router API：isNavigationFailure
    url: https://router.vuejs.org/api/functions/isnavigationfailure
  - title: Vue Router API：NavigationFailureType
    url: https://router.vuejs.org/api/enumerations/navigationfailuretype
  - title: Vue Router 5.2.0 errors.ts
    url: https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/errors.ts
  - title: Vue Router 5.2.0 router.ts
    url: https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/router.ts
stage: advanced
level: advanced
estimatedMinutes: 70
prerequisites:
  - vue.router.learn.basics.composition-programmatic-navigation
  - vue.router.learn.intermediate.meta-navigation-guards
objectives:
  - 等待 router.push 或 router.replace 的 Promise 再更新业务界面
  - 区分 undefined、NavigationFailure 与 rejected Error
  - 识别 aborted、cancelled 和 duplicated 三种公开失败
  - 读取 failure 的 to、from 并使用类型位组合
  - 划分局部导航决策与 afterEach 全局观察的责任
recap:
  - 导航成功 resolve undefined，三种预期失败 resolve NavigationFailure。
  - aborted、cancelled、duplicated 分别对应守卫阻止、更新导航替换和重复位置。
  - isNavigationFailure 会检查真实身份与类型位，可接收组合类型。
  - redirect 以最终导航结果为准，意外 Error 进入 reject/onError。
  - 局部 Promise 与全局 afterEach 分别承担交互决策和统一观察。
---

# 导航失败

## 一、Promise resolve 不等于导航成功

`router.push()` 成功时 resolve `undefined`；被守卫阻止、被新导航取消或与当前位置重复时，Promise 仍然 resolve，但值是 `NavigationFailure`。guard 抛错和懒组件加载失败等意外 Error 才进入 reject 通道。

~~~~ts
const failure = await router.push('/dashboard')

if (!failure) {
  closeNavigationMenu()
} else if (isNavigationFailure(failure, NavigationFailureType.aborted)) {
  showUnsavedChangesNotice()
}
~~~~

| 结果 | Promise | currentRoute |
| --- | --- | --- |
| success | resolve undefined | 提交目标位置 |
| aborted | resolve NavigationFailure | 保持 from |
| cancelled | 旧导航 resolve NavigationFailure | 由更新导航决定 |
| duplicated | resolve NavigationFailure | 保持当前位置 |
| unexpected Error | reject Error | 不按预期失败处理 |

## 二、用公开分类函数读取失败

`isNavigationFailure()` 同时确认 Router 的内部身份标记和类型位。不要比较 message、硬编码 4/8/16，也不要手造只有 type 的对象。failure 自带归一化的 `to` 与 `from`，足以生成定向提示和普通埋点记录。

~~~~ts
const interrupted =
  NavigationFailureType.aborted | NavigationFailureType.cancelled

if (isNavigationFailure(failure, interrupted)) {
  console.log(failure.from.fullPath, '->', failure.to.fullPath)
}
~~~~

## 三、让 Router 真实产生四种结算结果

下面的独立 memory router 不手造 failure。aborted 来自 guard 返回 false，duplicated 来自 push 当前地址，cancelled 由 deferred guard 冻结旧导航后再提交更新导航；页面同时展示 Promise 结果、类型检查、to/from、currentRoute 与 afterEach 时间线。

:::demo{id="vue.router.learn.advanced.navigation-failures.navigation-failures-lab-demo" playground="true"}
用真实导航结算结果比较局部 Promise 与全局 afterEach
:::

## 四、重定向与意外错误是另外两条边界

guard 返回 location 时，Router 会继续发起重定向；最终到达目标后，原调用仍得到成功结果，可通过最终 route 的 `redirectedFrom` 观察来源。guard 抛错、懒组件 reject 等意外错误会 reject 并触发 `router.onError()`，不应包装成第四种 NavigationFailure。

## 五、易错使用提示

:::pitfalls
### 只要 Promise resolve 就关闭界面

**触发条件：** 只要 Promise resolve 就关闭界面

**原因：** 三种预期失败也通过 resolve 返回。

**后果：** 导航没有提交，菜单或表单却已被清理。

**错误示例：**

~~~~ts
await router.push('/editor')
closeMenu()
~~~~

**正确写法：**

~~~~ts
const failure = await router.push('/editor')
if (!failure) closeMenu()
~~~~

**验证方式：** 对照正确写法验证结果。

### 用 catch 捕获所有导航失败

**触发条件：** 用 catch 捕获所有导航失败

**原因：** aborted、cancelled、duplicated 是预期返回值。

**后果：** catch 根本收不到被守卫阻止的结果。

**错误示例：**

~~~~ts
router.push('/editor').catch(showBlocked)
~~~~

**正确写法：**

~~~~ts
const failure = await router.push('/editor')
if (isNavigationFailure(failure)) showBlocked()
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 redirect 当作 aborted

**触发条件：** 把 redirect 当作 aborted

**原因：** 重定向会继续执行到最终目标。

**后果：** 正常登录跳转被误报为导航失败。

**错误示例：**

~~~~ts
// guard 返回 /login 就是 aborted
~~~~

**正确写法：**

~~~~ts
const result = await router.push('/admin')
// 以最终 result 与 redirectedFrom 判断
~~~~

**验证方式：** 对照正确写法验证结果。

### 比较 Error message 文案

**触发条件：** 比较 Error message 文案

**原因：** message 是调试描述，不是分类契约。

**后果：** 版本或语言变化后判断失效。

**错误示例：**

~~~~ts
failure.message.includes('aborted')
~~~~

**正确写法：**

~~~~ts
isNavigationFailure(failure, NavigationFailureType.aborted)
~~~~

**验证方式：** 对照正确写法验证结果。

### 硬编码 4、8、16

**触发条件：** 硬编码 4、8、16

**原因：** 数字不能表达业务语义，也不应成为应用协议。

**后果：** 代码难读，升级边界不清晰。

**错误示例：**

~~~~ts
if (failure.type === 4) {}
~~~~

**正确写法：**

~~~~ts
if (failure.type === NavigationFailureType.aborted) {}
~~~~

**验证方式：** 对照正确写法验证结果。

### 混淆 aborted 与 cancelled

**触发条件：** 混淆 aborted 与 cancelled

**原因：** 前者由当前导航决策阻止，后者由更新导航替换旧身份。

**后果：** 未保存提示与竞态埋点使用同一错误文案。

**错误示例：**

~~~~ts
if (isNavigationFailure(failure)) showUnsaved()
~~~~

**正确写法：**

~~~~ts
isNavigationFailure(failure, NavigationFailureType.aborted)
~~~~

**验证方式：** 对照正确写法验证结果。

### 手造 failure 对象测试

**触发条件：** 手造 failure 对象测试

**原因：** 真实 failure 还有 Router 专用身份标记。

**后果：** 伪对象无法证明 isNavigationFailure 的真实行为。

**错误示例：**

~~~~ts
const failure = { type: 4, to, from }
~~~~

**正确写法：**

~~~~ts
router.beforeEach(() => false)
const failure = await router.push('/blocked')
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 afterEach 返回 false 阻止导航

**触发条件：** 在 afterEach 返回 false 阻止导航

**原因：** afterEach 只观察已经结算的结果。

**后果：** 保护逻辑看似存在，目标位置却已经提交。

**错误示例：**

~~~~ts
router.afterEach(() => false)
~~~~

**正确写法：**

~~~~ts
router.beforeEach(() => canLeave.value)
~~~~

**验证方式：** 对照正确写法验证结果。

### 不等待 push 就恢复 loading

**触发条件：** 不等待 push 就恢复 loading

**原因：** 导航结果只有结算后才能分类。

**后果：** 更新导航取消旧请求时，界面状态提前复位。

**错误示例：**

~~~~ts
router.push(to)
pending.value = false
~~~~

**正确写法：**

~~~~ts
try {
  await router.push(to)
} finally {
  pending.value = false
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 只做局部处理，不记录全局失败

**触发条件：** 只做局部处理，不记录全局失败

**原因：** 分散的调用方难以形成一致导航质量数据。

**后果：** 重复点击和竞态取消无法统一统计。

**错误示例：**

~~~~ts
// 每个按钮各写一套埋点
~~~~

**正确写法：**

~~~~ts
router.afterEach((to, from, failure) => {
  if (failure) recordFailure(to, from, failure)
})
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 六、从源码推导适用场景

:::steps
### 1. 预期失败作为 Promise 值返回

`pushWithRedirect()` 先识别 Router 内部的 NavigationFailure，再让它进入 resolve 路径；未识别的 Error 才交给全局错误处理并 reject。因此调用方应先 await 返回值，再做类型分类。

### 2. 类型组合来自位掩码检查

`isNavigationFailure()` 先确认专用 symbol，再用 `error.type & type` 判断。适合把 aborted 与 cancelled 合并为“原计划未提交”的恢复策略，同时保留 duplicated 的安静处理。

### 3. duplicated 在 guard 队列前生成

Router 比较当前位置和目标位置；完全相同且未 force 时直接创建 duplicated failure，但仍让 afterEach 观察结果。重复导航不是 throw，也不是不可观察的空操作。

### 4. cancelled 来自 pending navigation 身份更替

各段 guard queue 后都会检查当前目标是否仍是最新 pending location。测试竞态时可用 deferred guard 确定性冻结旧导航，不需要依赖 setTimeout。

### 5. redirect 递归到最终结果

guard redirect 会携带最初的 redirectedFrom 重新进入 pushWithRedirect。产品代码应判断是否最终到达目标，不把内部 redirect 信号当作公开失败类型。

### 6. afterEach 观察与局部 Promise 同一结果

Router 在结果完成分类后调用 afterEach。发起组件负责关闭菜单或保留表单，全局 hook 负责标准化埋点；两者可以共用分类函数，不必新增事件总线。
:::

:::exercise
### 区分编辑器离开失败

**要求：** 编辑器离开可能被未保存守卫阻止，也可能被用户快速点击另一条导航取消。分别给出应该显示的界面反馈。

**验收：** 完成题目要求。

**参考答案：** aborted 表示当前守卫明确阻止离开，应保留编辑器并显示未保存提示；cancelled 表示旧导航被新导航替换，应以更新导航的最终结果为准，通常只记录竞态而不显示未保存提示。
:::

- [ ] 等待 push/replace Promise 后再更新业务 UI
- [ ] 用 isNavigationFailure 与 enum 分类，不比较 message
- [ ] 区分 aborted、cancelled 与 duplicated 的来源
- [ ] 按需要读取 failure.to/from 的普通字段
- [ ] 局部调用方做交互决策，afterEach 做全局观察
- [ ] 意外 Error 交给 catch 与 router.onError
