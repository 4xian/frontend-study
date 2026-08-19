---
id: vue.router.reference.navigation.failures
type: reference
title: 导航失败与结果判定
summary: 区分 aborted、cancelled、duplicated、redirect 与意外 Error，并正确处理导航 Promise、afterEach 和 onError
domain: frontend
technology: vue
module: router
related:
  - vue.router.reference.navigation.guards
  - vue.router.reference.configuration.router-instance
  - vue.router.reference.matching.route-locations
  - vue.router.reference.composables.navigation
  - vue.router.learn.advanced.navigation-failures
tags:
  - Vue Router
  - NavigationFailure
  - NavigationFailureType
  - isNavigationFailure
  - router.push
  - afterEach
  - redirectedFrom
  - onError
appliesTo: Vue Router 5.2.0
verifiedAt: 2026-08-04
sources:
  - title: Vue Router API：ErrorTypes
    url: https://router.vuejs.org/api/enumerations/errortypes
  - title: Vue Router API：NavigationFailureType
    url: https://router.vuejs.org/api/enumerations/navigationfailuretype
  - title: Vue Router API：NavigationFailure
    url: https://router.vuejs.org/api/interfaces/navigationfailure
  - title: Vue Router API：NavigationRedirectError
    url: https://router.vuejs.org/api/interfaces/navigationredirecterror
  - title: Vue Router API：isNavigationFailure()
    url: https://router.vuejs.org/api/functions/isnavigationfailure
  - title: Vue Router Guide：Navigation Failures
    url: https://router.vuejs.org/guide/advanced/navigation-failures.html
  - title: Vue Router Guide：Navigation Guards
    url: https://router.vuejs.org/guide/advanced/navigation-guards.html
  - title: "Vue Router issue #1328：afterEach 在失败导航后仍会执行"
    url: https://github.com/vuejs/router/issues/1328
  - title: "Vue Router discussion #2101：router.push() 与 RouterLink 的错误处理差异"
    url: https://github.com/vuejs/router/discussions/2101
  - title: Vue Router 5.2.0：errors.ts 固定源码
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/errors.ts
  - title: Vue Router 5.2.0：navigationGuards.ts 固定源码
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/navigationGuards.ts
  - title: Vue Router 5.2.0：router.ts 固定源码
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/router.ts
  - title: Vue Router 5.2.0：根入口固定源码
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/index.ts
group: navigation
signature: |-
  /** @internal */
  declare const enum ErrorTypes {
    MATCHER_NOT_FOUND = 1,
    NAVIGATION_GUARD_REDIRECT = 2,
    NAVIGATION_ABORTED = 4,
    NAVIGATION_CANCELLED = 8,
    NAVIGATION_DUPLICATED = 16,
  }

  declare enum NavigationFailureType {
    aborted = 4,
    cancelled = 8,
    duplicated = 16,
  }

  interface NavigationFailure extends Error {
    type:
      | ErrorTypes.NAVIGATION_CANCELLED
      | ErrorTypes.NAVIGATION_ABORTED
      | ErrorTypes.NAVIGATION_DUPLICATED
    from: RouteLocationNormalized
    to: RouteLocationNormalized
  }

  /** @internal */
  interface NavigationRedirectError
    extends Omit<NavigationFailure, 'to' | 'type'> {
    type: ErrorTypes.NAVIGATION_GUARD_REDIRECT
    to: RouteLocationRaw
  }

  declare function isNavigationFailure(
    error: any,
    type?: ErrorTypes.NAVIGATION_GUARD_REDIRECT,
  ): error is NavigationRedirectError

  declare function isNavigationFailure(
    error: any,
    type?: ErrorTypes | NavigationFailureType,
  ): error is NavigationFailure
anchors:
  - 概述
  - 结果通道总览
  - Error Types
  - Navigation Failure Type
  - Navigation Failure
  - Navigation Redirect Error
  - Is Navigation Failure
  - Promise 与 After Each
  - 易错使用提示
  - 源码推导与适用场景
---

# 导航失败与结果判定

## 一、概述

Vue Router 把“导航按预期被阻止”与“导航过程中发生意外异常”放在不同通道。守卫返回 `false`、旧导航被新导航取代、重复前往当前位置，会让 `router.push()` 成功 resolve 一个 `NavigationFailure`；正常完成或成功重定向会 resolve `undefined`；守卫抛出或返回普通 `Error`、异步组件加载失败等意外错误，则调用 `router.onError()` 并让该导航 Promise reject。

:::tip
本页以本地安装的 `vue-router@5.2.0` 声明、发布运行时代码和固定 commit `6e5f8d253b9444a76eb58f176ebe08d686c937cb` 为最终事实。官网 API 可能继续随主线版本更新。
:::

:::warning
`ErrorTypes` 与 `NavigationRedirectError` 都是 internal。它们出现在根声明和 API 页面，不代表应用应依赖；业务代码使用公开的 `NavigationFailureType`、`isNavigationFailure()`、`currentRoute.redirectedFrom` 与 `router.onError()`。
:::

## 二、结果通道总览

| 情况 | router.push() 结果 | afterEach 第三参数 | 公开判定 |
| --- | --- | --- | --- |
| 正常完成 | resolve undefined | undefined | 结果为 falsy |
| 守卫成功 redirect | 最终导航成功时 resolve undefined | 最终导航的 failure 为 undefined | currentRoute.value.redirectedFrom |
| 守卫返回 false | resolve aborted failure | 同一个 aborted failure | NavigationFailureType.aborted |
| 旧导航被新导航取代 | 旧 Promise resolve cancelled failure | 旧导航的 cancelled failure | NavigationFailureType.cancelled |
| 重复前往完全相同的位置 | resolve duplicated failure | 同一个 duplicated failure | NavigationFailureType.duplicated |
| 守卫或组件加载抛出 Error | reject 原 Error | 该导航不调用 afterEach | try/catch + router.onError() |

`afterEach(to, from, failure)` 的 `to` 在失败时仍是“尝试前往”的目标，不等于当前页面已经切换。issue #1328 正是因忽略第三参数而把 aborted 导航的 `to` 当成已完成页面；做标题、分析统计或页面状态副作用前应先检查 `failure`。

## 三、Error Types

`ErrorTypes` 是 Router 内部的 const enum 和位标志集合，服务于 matcher、守卫适配、redirect 控制流与 history 恢复。固定根入口只把它作为 type 导出，运行时没有可供应用导入的 `ErrorTypes` 对象；固定源码也直接标记 internal。

| 内部成员 | 值 | 内部用途 | 应用层公开替代 |
| --- | --- | --- | --- |
| MATCHER_NOT_FOUND | 1 | 按不存在的 name 解析 route 时创建 matcher error | 动态路由先用 router.hasRoute(name)，异常走常规错误处理 |
| NAVIGATION_GUARD_REDIRECT | 2 | 把守卫返回的 RouteLocation 送回 redirect 管线 | 成功后读取 currentRoute.value.redirectedFrom |
| NAVIGATION_ABORTED | 4 | 守卫返回 false | NavigationFailureType.aborted |
| NAVIGATION_CANCELLED | 8 | pendingLocation 已被较新导航替换 | NavigationFailureType.cancelled |
| NAVIGATION_DUPLICATED | 16 | 目标与当前位置完全相同且未 force | NavigationFailureType.duplicated |

:::warning
不要用数字 `1`、`2` 或伪造的 ErrorTypes 值调用 `isNavigationFailure()`。内部成员、位分配和 redirect error 形状都不是稳定业务协议；公开枚举只承诺 4、8、16 三类可观察 failure。
:::

## 四、Navigation Failure Type

`NavigationFailureType` 是稳定的运行时 enum，也是 `isNavigationFailure()` 第二参数的公开来源。三个值都是独立 bit flag，因此既能检查单类，也能用按位或组合；redirect 不在这个枚举中，因为返回新位置会创建一轮新导航，而不是公开的“导航被阻止”结果。

| 成员 | 值 | 精确触发条件 | 当前地址结果 |
| --- | --- | --- | --- |
| aborted | 4 | 本轮导航守卫返回 false，或 deprecated next(false) | 本轮目标不提交 |
| cancelled | 8 | 本轮尚未完成时，另一轮导航已经开始；新导航无需先完成 | 旧目标不提交；由新导航决定最终地址 |
| duplicated | 16 | 目标与当前位置的 matched records、params、query、hash 相同且未 force | 保持当前位置；同锚点滚动仍可能执行 |

~~~~ts
import {
  isNavigationFailure,
  NavigationFailureType,
} from 'vue-router'

const failure = await router.push('/reports')

if (
  isNavigationFailure(
    failure,
    NavigationFailureType.aborted | NavigationFailureType.cancelled,
  )
) {
  keepPendingUiOpen()
}
~~~~

## 五、Navigation Failure

`NavigationFailure` 扩展原生 `Error`，并增加 `type`、`from` 和 `to`。`from` 是失败导航开始时的当前位置，`to` 是本轮未能提交的目标；两者都是 normalized route location，所以可读取 `name`、`path`、`params`、`query`、`hash`、`matched` 与 `meta`，不应再当作 raw 导航输入。

| 字段 | 5.2.0 类型 | 用途 |
| --- | --- | --- |
| type | 4 \| 8 \| 16 | 用公开 helper 与 enum 判定失败分类 |
| from | RouteLocationNormalized | 失败导航开始位置 |
| to | RouteLocationNormalized | 本轮尝试但未提交的目标位置 |
| message/name/stack/cause | 继承 Error | 诊断信息；不作为稳定分类协议 |

~~~~ts
import {
  isNavigationFailure,
  NavigationFailureType,
} from 'vue-router'

/** 只有离开编辑页被守卫拒绝时，提示保存草稿。 */
async function leaveEditor() {
  const failure = await router.push({ name: 'articles' })

  if (isNavigationFailure(failure, NavigationFailureType.aborted)) {
    showUnsavedDraftNotice({
      from: failure.from.fullPath,
      target: failure.to.fullPath,
    })
  }
}
~~~~

:::tip
`NavigationFailure` 是“已结算的预期失败值”，不是所有导航异常的基类。普通 `Error` 即使来自 guard，也没有 Router 的内部 brand、type、from、to；它通过 rejected Promise 与 `onError` 传播。
:::

## 六、Navigation Redirect Error

`NavigationRedirectError` 是 Router 为守卫 redirect 创建的内部 Error。它继承 `from` 与 Error 字段，把 `type` 固定为内部值 2，并把 `to` 改为 `RouteLocationRaw`，因为守卫返回的新位置尚需重新解析。`pushWithRedirect()` 会消费该对象并递归启动新导航，正常情况下不会把它作为 `router.push()` 的公开成功值交给调用方。

| 内部字段 | 形状 | 为什么不适合业务依赖 |
| --- | --- | --- |
| type | ErrorTypes.NAVIGATION_GUARD_REDIRECT | 值 2 不在公开 NavigationFailureType |
| to | RouteLocationRaw | 仍需 resolve，和公开 NavigationFailure.to 的 normalized 形状不同 |
| from | 继承 RouteLocationNormalized | 描述内部 guard 转换阶段，不是最终 redirect 结果协议 |

~~~~ts
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !session.user) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
})

await router.push('/account')

const redirectedFrom = router.currentRoute.value.redirectedFrom
if (redirectedFrom) {
  recordRedirect(redirectedFrom.fullPath, router.currentRoute.value.fullPath)
}
~~~~

:::warning
成功 redirect 也会让 `router.push()` resolve `undefined`。若 redirect 后的新导航又被 abort、cancel 或判为 duplicate，调用方观察到的是最终公开失败；不要尝试截获中间 `NavigationRedirectError`。
:::

## 七、Is Navigation Failure

`isNavigationFailure(error, type?)` 同时是运行时判定和 TypeScript type guard。固定实现要求值是 `Error`、携带 Router 私有 Symbol brand，并在提供 type 时通过位运算匹配；仅有相同 `name`、`message`、`type` 字段的普通对象不会通过。

| 调用 | 公开语义 | 收窄结果 |
| --- | --- | --- |
| isNavigationFailure(value) | 判断 Router 标记的失败 | 公开意图为 NavigationFailure；见下方 5.2.0 overload 提示 |
| isNavigationFailure(value, NavigationFailureType.aborted) | 只匹配 aborted | NavigationFailure |
| isNavigationFailure(value, aborted \| cancelled) | 匹配两类中的任一类 | NavigationFailure |

运行时 brand 也用于 Router 自己的 matcher 与 redirect errors，因此无第二参数的底层判定范围比公开 `NavigationFailure` 接口更宽。应用应只把 `router.push()` 的 resolved failure 或 `afterEach` 第三参数交给公开判定，不据此探测 internal error 类型。普通守卫 `Error` 不带该 brand，判定结果为 false。

:::tip
5.2.0 的声明把 internal redirect overload 放在无第二参数 overload 之前，且该参数也是可选的；对 `unknown` 直接调用 `isNavigationFailure(value)` 时，TypeScript 可能把结果收窄为 `NavigationRedirectError`。这是声明重载顺序的类型推断细节，不是应用层获得 redirect error 的承诺；业务代码应使用 push/afterEach 的已知结果类型，并以公开 enum 做分类。
:::

~~~~ts
/** 统一处理编程式导航的公开结果与意外异常。 */
async function navigateSafely(to: RouteLocationRaw) {
  try {
    const failure = await router.push(to)

    if (!failure) return { status: 'completed' as const }
    if (isNavigationFailure(failure, NavigationFailureType.duplicated)) {
      return { status: 'unchanged' as const }
    }
    if (isNavigationFailure(failure)) {
      return { status: 'prevented' as const, failure }
    }

    return { status: 'completed' as const }
  } catch (error) {
    reportNavigationError(error)
    throw error
  }
}
~~~~

## 八、Promise 与 After Each

5.2.0 的 `router.push()` 与 `router.replace()` 返回 `Promise&lt;NavigationFailure | void | undefined&gt;`。这不是“成功 resolve、失败 reject”的普通二分：三类预期 failure 也会 resolve。只有结果为 falsy 才表示本轮最终完成，其中包含成功 redirect；若业务还要区分 redirect，再检查提交后的 `currentRoute.value.redirectedFrom`。

~~~~ts
/** 仅在导航最终完成后关闭移动菜单。 */
async function openProfile() {
  const failure = await router.push('/my-profile')
  if (!failure) isMenuOpen.value = false
}

router.afterEach((to, from, failure) => {
  if (failure) {
    sendNavigationFailure(to, from, failure)
    return
  }

  sendPageView(to.fullPath)
})

router.onError((error, to, from) => {
  sendNavigationError(error, to, from)
})
~~~~

`afterEach` 在正常完成和三类公开 failure 结算后都会运行；第三参数类型仅为 `NavigationFailure | void`。它不能改变导航，也不替代 `onError`。discussion #2101 进一步确认：`onError` 被调用并不吞掉 `router.push()` 的 rejected Promise；`RouterLink` 因调用方无法 catch 而在组件内部附加 catch，手写编程式导航仍应处理意外 reject。

## 九、易错使用提示

:::pitfalls
### 把 truthy 的 push 结果当成导航成功

**触发条件：** 把 truthy 的 push 结果当成导航成功

**原因：** `router.push()` 正常完成时通常 resolve undefined；truthy 结果恰好是 aborted、cancelled 或 duplicated failure。

**后果：** 菜单、弹层或保存状态会在导航被阻止时关闭，成功导航反而不执行后续逻辑。

**错误示例：**

~~~~ts
const result = await router.push('/account')
if (result) closeMenu()
~~~~

**正确写法：**

~~~~ts
const failure = await router.push('/account')
if (!failure) closeMenu()
~~~~

**验证方式：** 对照正确写法验证结果。

### 只在 catch 中寻找预期 NavigationFailure

**触发条件：** 只在 catch 中寻找预期 NavigationFailure

**原因：** 5.2.0 会 resolve 三类预期 failure；catch 主要接收守卫 Error、异步组件加载异常等意外错误。

**后果：** aborted、cancelled、duplicated 分支永远不会执行，真实异常却可能被误标为用户取消。

**错误示例：**

~~~~ts
router.push('/checkout').catch((failure) => {
  if (isNavigationFailure(failure)) showBlockedNotice()
})
~~~~

**正确写法：**

~~~~ts
try {
  const failure = await router.push('/checkout')
  if (isNavigationFailure(failure)) showBlockedNotice()
} catch (error) {
  reportNavigationError(error)
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 redirect 当成第四种公开 failure

**触发条件：** 把 redirect 当成第四种公开 failure

**原因：** `NavigationFailureType` 只有三项；守卫返回位置会启动新导航，内部 redirect error 会被 Router 消费。

**后果：** 代码依赖不存在的 `NavigationFailureType.redirected` 或内部数字 2，升级时没有稳定契约。

**错误示例：**

~~~~ts
if (isNavigationFailure(result, 2)) {
  trackRedirect()
}
~~~~

**正确写法：**

~~~~ts
await router.push('/account')

if (router.currentRoute.value.redirectedFrom) {
  trackRedirect()
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 cancelled 解释成守卫拒绝

**触发条件：** 把 cancelled 解释成守卫拒绝

**原因：** `cancelled` 表示旧导航尚未完成时有较新导航开始；守卫明确返回 false 对应 `aborted`。

**后果：** 竞态与用户拒绝共用错误提示，快速点击或搜索联想导航会错误显示“没有权限”。

**错误示例：**

~~~~ts
if (isNavigationFailure(failure)) {
  showPermissionDenied()
}
~~~~

**正确写法：**

~~~~ts
if (isNavigationFailure(failure, NavigationFailureType.aborted)) {
  showNavigationBlocked()
} else if (isNavigationFailure(failure, NavigationFailureType.cancelled)) {
  discardStaleNavigationUi()
}
~~~~

**验证方式：** 对照正确写法验证结果。

### afterEach 不检查 failure 就使用 to 做已完成副作用

**触发条件：** afterEach 不检查 failure 就使用 to 做已完成副作用

**原因：** `afterEach` 也会在 aborted、cancelled、duplicated 后执行；此时 `to` 是未提交的目标。

**后果：** 页面标题、分析统计或全局样式会描述一个用户实际没有进入的页面。

**错误示例：**

~~~~ts
router.afterEach((to) => {
  sendPageView(to.fullPath)
})
~~~~

**正确写法：**

~~~~ts
router.afterEach((to, _from, failure) => {
  if (!failure) sendPageView(to.fullPath)
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 用 message、name 或 type 字段伪判 failure

**触发条件：** 用 message、name 或 type 字段伪判 failure

**原因：** 固定实现还检查 Error 实例与 Router 私有 Symbol brand；消息文本是诊断信息，不是分类协议。

**后果：** 生产构建的消息可能为空，普通对象可能碰巧含 type，跨 realm 或手工拼装也无法复制 Router brand。

**错误示例：**

~~~~ts
if (error.type === 16 || error.message.includes('redundant')) {
  ignoreDuplicate()
}
~~~~

**正确写法：**

~~~~ts
if (
  isNavigationFailure(error, NavigationFailureType.duplicated)
) {
  ignoreDuplicate()
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 从根入口把 ErrorTypes 当运行时值导入

**触发条件：** 从根入口把 ErrorTypes 当运行时值导入

**原因：** 发布声明只 `export type { ErrorTypes }`，固定源码也标记 internal；它不是可导入的运行时 enum。

**后果：** TypeScript 拒绝把 type-only 导出当作值，或构建产物找不到该具名导出。

**错误示例：**

~~~~ts
import { ErrorTypes } from 'vue-router'

isNavigationFailure(failure, ErrorTypes.NAVIGATION_GUARD_REDIRECT)
~~~~

**正确写法：**

~~~~ts
import { NavigationFailureType } from 'vue-router'

isNavigationFailure(failure, NavigationFailureType.aborted)
~~~~

**验证方式：** 对照正确写法验证结果。

### 让 onError 代替调用处处理 rejected Promise

**触发条件：** 让 onError 代替调用处处理 rejected Promise

**原因：** `router.onError()` 会收到意外错误，但不会把 `router.push()` 的 rejection 转成 resolved 结果。

**后果：** 控制台或监控仍记录 unhandled rejection，调用流程也没有明确失败分支。

**错误示例：**

~~~~ts
router.onError(reportNavigationError)
router.push('/reports')
~~~~

**正确写法：**

~~~~ts
router.onError(reportNavigationError)

try {
  await router.push('/reports')
} catch (error) {
  recoverFromNavigationError(error)
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 为检测 duplicate 预先比较 fullPath

**触发条件：** 为检测 duplicate 预先比较 fullPath

**原因：** Router 的相同位置判定还按 matched record、params 与配置的 stringifyQuery 比较，并有 force 选项。

**后果：** 自定义 query 序列化、alias 或参数规范化时，手工比较和 Router 的结论不一致。

**错误示例：**

~~~~ts
if (router.currentRoute.value.fullPath !== target) {
  await router.push(target)
}
~~~~

**正确写法：**

~~~~ts
const failure = await router.push(target)

if (isNavigationFailure(failure, NavigationFailureType.duplicated)) {
  keepCurrentView()
}
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 十、源码推导与适用场景

:::steps
### 1. 从发布声明冻结五项签名与导出形态

本地 `vue-router@5.2.0` 的 `index-BN0B0y8a.d.ts` 固定 ErrorTypes 五个位、NavigationFailureType 三个位、两个 failure interface 及 isNavigationFailure 两个 overload；根 `vue-router.d.ts` 只运行时导出公开 enum/helper，把 ErrorTypes 与 NavigationRedirectError 作为 type 导出。正文不把 API 页面存在误写成稳定运行时入口。

### 2. 沿 errors.ts 确认 brand 与位掩码

固定 `errors.ts` 为 Router error 写入私有 `NavigationFailureSymbol`；`isNavigationFailure` 同时检查 `instanceof Error`、Symbol 存在和可选的 `error.type & type`。这证明公开分类应使用 helper 与 enum，可用按位或组合，不能靠 message、name 或手工对象。

### 3. 沿 guardToPromiseFn 区分 false、Error 与 location

固定 `navigationGuards.ts` 把 `false` 转成 type 4 的 aborted error，把 `Error` 原样 reject，把 RouteLocation 转成 type 2 的 NavigationRedirectError；其他返回值继续 guard queue。三条分支直接建立了“预期阻止、意外异常、内部 redirect 控制流”的边界。

### 4. 沿 pendingLocation 与相同位置判定区分 8 和 16

固定 `router.ts` 在 pendingLocation 身份改变时创建 type 8，说明 cancelled 只要求新导航开始；在目标与当前位置相同且未 force 时创建 type 16。两者都成为 resolved failure，而不是 guard 返回 false 的同义词。

### 5. 沿 pushWithRedirect 冻结 Promise、redirect 与错误通道

固定实现消费 type 2 后递归导航；无 failure 才 finalize 并返回 undefined，三类公开 failure 作为 fulfilled value 返回。非 Router failure 进入 `triggerError()`：先调用 onError listeners，再返回 rejected Promise。成功 redirect 因此用 `redirectedFrom` 检测，意外 Error 则必须 catch。

### 6. 沿 triggerAfterEach 与官方案例核对全局观察点

固定 `triggerAfterEach` 的第三参数仅是 `NavigationFailure | void`。官方 Guide、issue #1328 与本地运行态都确认 afterEach 会观察三类失败；discussion #2101 确认 onError 不吞 push rejection，RouterLink 只是内部 catch。全局成功副作用检查 failure，全局异常记录使用 onError，两者职责不能互换。
:::

~~~~ts
// 精简自 vuejs/router 5.2.0 固定源码。
const NavigationFailureSymbol = Symbol('navigation failure')

/** 创建带 Router 私有 brand 的内部错误。 */
function createRouterError(type: number, params: object) {
  return Object.assign(new Error(), {
    type,
    [NavigationFailureSymbol]: true,
    ...params,
  })
}

/** 判定 Router error，并可用 bit mask 筛选。 */
export function isNavigationFailure(error: any, type?: number) {
  return (
    error instanceof Error &&
    NavigationFailureSymbol in error &&
    (type == null || !!(error.type & type))
  )
}

// guardToPromiseFn 中的三条关键分支。
if (valid === false) reject(createRouterError(4, { from, to }))
else if (valid instanceof Error) reject(valid)
else if (isRouteLocation(valid)) {
  reject(createRouterError(2, { from: to, to: valid }))
}

// pushWithRedirect 只把公开 failure 传给 afterEach 并返回调用方。
failure = failure || finalizeNavigation(toLocation, from, true, replace, data)
triggerAfterEach(toLocation, from, failure)
return failure
~~~~
