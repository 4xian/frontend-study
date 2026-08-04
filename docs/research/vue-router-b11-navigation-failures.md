# Vue Router R1-B11：导航失败调研

> 核验日期：2026-08-04
>
> 适用版本：Vue 3.5.40、Vue Router 5.2.0。
>
> 资料范围：Vue Router 官方 Guide/API、`vuejs/router@v5.2.0` 固定标签的
> `errors.ts`、`router.ts` 与官方测试。外部资料通过 Tavily Extract / Map
> 定位并回到一手来源核验。

## 课程定位与冻结边界

本课 Manifest 为 `vue.router.learn.advanced.navigation-failures`，直接前置是 L05
`vue.router.learn.basics.composition-programmatic-navigation` 与 L08
`vue.router.learn.intermediate.meta-navigation-guards`。L05 已要求等待导航 Promise，L08
已建立守卫 allow/cancel/redirect 职责；B11 只聚焦如何读取已结算的导航结果。

稳定主线冻结为：

- `await router.push()` 成功或最终 redirect 成功时得到 `undefined`。
- 预期内的 prevented navigation 不 reject，而是 resolve 为 `NavigationFailure`。
- 课程只公开 `aborted`、`cancelled`、`duplicated` 三种 `NavigationFailureType`。
- 用 `isNavigationFailure()` 判断，不依赖 `message`、数字常量或 `instanceof`。
- `afterEach(to, from, failure)` 只观察已结算结果，不能改变导航。
- guard 抛出的意外 `Error` 属于 reject / `router.onError()` 边界，不是第四种
  public navigation failure。
- B10 单独验收后才实施 B11；调研阶段不修改 catalog、课程、Demo 或 E2E。

依据：[Navigation Failures](https://router.vuejs.org/guide/advanced/navigation-failures)、
[`isNavigationFailure()`](https://router.vuejs.org/api/functions/isnavigationfailure)、
[`NavigationFailureType`](https://router.vuejs.org/api/enumerations/navigationfailuretype)。

## 教学目标

完成本课后，学习者应能：

1. 等待 `router.push()` / `router.replace()` 并区分 `undefined`、failure object 与 rejected
   Error。
2. 用 `isNavigationFailure()` 区分 aborted、cancelled 和 duplicated。
3. 通过 failure 的 `to` / `from` 解释哪次导航没有提交。
4. 在 `afterEach` 中统一记录全局失败，同时保留发起方的局部决策。
5. 说明 redirect 为什么不应归入三种 public failure。
6. 使用类型位掩码组合检查，但不在应用中硬编码 4/8/16。

## 三种公开失败

| 类型 | 发生条件 | Promise 结果 | currentRoute |
| --- | --- | --- | --- |
| `aborted` | guard 返回 `false` / `next(false)` | resolve failure | 保持 `from` |
| `cancelled` | 旧导航未完成时更新导航开始 | 旧 Promise resolve failure | 由更新导航决定 |
| `duplicated` | 已在完全相同的目标位置 | resolve failure | 不变 |

`cancelled` 的官方定义只要求更新导航已开始，不要求新导航已完成。自动化为了
稳定获得旧 failure，可以让旧 guard 等待手动 deferred，启动并完成新导航后再
放行旧 guard，最终等待旧 push Promise。

三种类型值在 5.2.0 分别是 4、8、16，它们是可组合的位标志：

```ts
if (
  isNavigationFailure(
    failure,
    NavigationFailureType.aborted | NavigationFailureType.cancelled,
  )
) {
  // 这次离开没有按原计划提交
}
```

业务代码应使用 enum 成员，数字只用于源码推导与课程展示；版本升级时不把数字当稳定
业务协议。

依据：[`NavigationFailureType`](https://router.vuejs.org/api/enumerations/navigationfailuretype)、
[`errors.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/errors.ts)。

## Promise 的三条结算路径

### 成功或最终重定向成功

```ts
const failure = await router.push('/dashboard')
if (!failure) {
  // 导航已按最终目标成功提交
}
```

guard 返回 location 时，Router 内部会带着 `redirectedFrom` 开始新的
`pushWithRedirect()`。如果最终目标成功，调用方看到的仍是成功结果，而不是需要当作
aborted/cancelled/duplicated 处理的 failure。需要观察重定向时，读最终 route 的
`redirectedFrom`，不要枚举内部 `NAVIGATION_GUARD_REDIRECT`。

### 预期阻止的导航

```ts
const failure = await router.push('/editor/leave')

if (isNavigationFailure(failure, NavigationFailureType.aborted)) {
  showUnsavedChangesNotice()
}
```

failure 是 `Error` 的扩展对象，同时携带当次目标 `to` 和起点 `from`；两者都是归一化
route location。业务 UI 可以根据类型定向提示，埋点则可记录 `to.fullPath` /
`from.fullPath`。

### 意外错误

```ts
try {
  await router.push('/report')
} catch (error) {
  // guard 抛错、懒组件 reject 等异常路径
}

router.onError((error, to, from) => {
  reportRouterError(error, to, from)
})
```

这类 Error 不是 `isNavigationFailure(error)` 要匹配的预期导航决策。课程 Demo 只生成真实的
三种 public failure 和成功结果，不加入抛错分支，避免把两个处理通道混成一个表格。

依据：[Navigation Failures](https://router.vuejs.org/guide/advanced/navigation-failures)、
[`router.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/router.ts)、
[`errors.spec.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/errors.spec.ts)。

## `afterEach` 的全局观察责任

```ts
router.afterEach((to, from, failure) => {
  if (!failure) return
  sendNavigationFailure({
    type: failure.type,
    to: to.fullPath,
    from: from.fullPath,
  })
})
```

`afterEach` 在成功时第三参数为 `undefined`，在三种预期失败时获得 failure。它适合统一
埋点、日志和清理 pending indicator，但返回值不参与导航决策。局部命令仍应等待自己的
push Promise，才能决定是否关闭菜单、显示未保存提示或保留表单。

官方固定测试确认：

- duplicated push 的 Promise resolve failure，`afterEach` 也获得同类型 failure。
- guard 返回 false 时，`afterEach` 获得 aborted failure。
- 旧导航被更新导航取消时，两次 afterEach 分别记录旧 cancelled 与新 success。
- 普通 push 成功时，`afterEach(to, from, undefined)` 只调用一次。

依据：[`afterEach.spec.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/guards/afterEach.spec.ts)、
[`errors.spec.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/errors.spec.ts)。

## 唯一独立 memory-router Demo seam

Demo 冻结为“导航结果分类器”，使用独立 mini-app 和 `createMemoryHistory()`。屏幕上提供
四个命令，每个结果都由真实 router 产生：

1. **success**：在 `/home` 和 `/open` 之间切换，push Promise resolve `undefined`。
2. **aborted**：导航到 `/blocked`，`beforeEach` 返回 false。
3. **duplicated**：对当前 `fullPath` 再次 push。
4. **cancelled**：启动 `/slow` 并在 guard deferred 中等待，随后完成 `/fast`，再放行旧
   guard 并等待旧 push Promise。

为了避免让学习者手动拼出竞态，cancelled 命令内部一次完成上述顺序，但时间线必须分别
显示 `slow start -> guard waiting -> fast commit -> old guard release -> cancelled result`。不使用定时器，
只使用手动 Promise controller。

### 必须可观察状态

| 状态 | 页面必须能回答的问题 |
| --- | --- |
| `currentRoute.fullPath` | 当前哪个位置已提交？ |
| command | 刚刚执行的 success/aborted/cancelled/duplicated 是哪个？ |
| Promise outcome | 是 `undefined`、failure 还是 reject？ |
| `isNavigationFailure` | 当前结果是否任意导航失败？ |
| failure type / label | enum 值与可读类型是什么？ |
| `failure.to/from` | 哪次导航从哪里去哪里？ |
| combined check | aborted \| cancelled 组合是否命中？ |
| afterEach log | 全局 hook 观察到了 success 还是什么 failure？ |
| host path | mini router 是否保持宿主课程 URL 不变？ |

不显示 Error `message` 作为类型依据；可以把 message 作调试文字放在时间线，但自动化只断言
`isNavigationFailure`、enum type、to/from 和 currentRoute。

## 最少验收断言

1. success 命令 resolve `undefined`，currentRoute 提交为目标，afterEach failure 为 none。
2. aborted 由 guard false 真实产生，`isNavigationFailure(..., aborted)` 为 true，currentRoute
   保持 from。
3. duplicated 由 push 当前位置产生，type 为 duplicated，to/from 的 fullPath 相同。
4. cancelled 的旧 push 在新导航提交后 resolve cancelled，currentRoute 是新位置，且
   aborted \| cancelled 组合检查为 true。
5. afterEach 对四条路径的记录与各自 Promise outcome 一致。
6. 键盘、390px、200% 文字、reduced-motion、横向溢出、console/pageerror 和宿主
   URL 隔离保持既有课程 Gate。

## Vue Router 5.2.0 源码推导

### 1. 预期导航失败被当作 Promise 值

`pushWithRedirect()` 的 catch 先用 `isNavigationFailure(error)` 识别 Router 内部创建的预期导航
failure，随后 then 路径返回 failure；未识别的 Error 转入 `triggerError()` 并 reject。

**课程推导：** 调用方应当“先 await，再分类返回值”，而不是把所有阻止导航都放进
catch。

### 2. `isNavigationFailure` 同时检查身份标记和位掩码

`errors.ts` 为 Router failure 添加专用 symbol；传入 type 时使用 `error.type & type`
命中位组合。普通 `{ type: 4 }` 对象不应被当作真实 failure。

**课程推导：** Demo 必须由 router 产生四种结果，不能手造对象；组合策略可直接传
`aborted | cancelled`。

### 3. duplicated 在真正 navigate 之前生成

Router 用 `isSameRouteLocation()` 比较 from 与 target；完全相同且没有 force 时创建
`NAVIGATION_DUPLICATED`，但仍触发同锚点的 scroll 处理并继续到 afterEach。

**课程推导：** 重复导航不是 throw，也不是“什么都没发生”；它是可观察的结算
failure。

### 4. cancelled 来自 pending navigation 身份更替

Router 保存当前 `pendingLocation`，并在各段 guard queue 后检查本次 to 是否仍是最新目标。
不相等时创建 `NAVIGATION_CANCELLED`。

**课程推导：** 稳定 Demo 不依赖时间差，而是用 deferred guard 冻结旧导航，确保新导航
改写 pending identity 后才放行旧队列。

### 5. redirect 递归到最终导航结果

Router 识别 guard redirect failure 后再次调用 `pushWithRedirect()`，传递原始
`redirectedFrom`。最终导航成功时才 finalize 并触发 afterEach。

**课程推导：** 业务要回答的是“是否成功到达最终位置”；内部 redirect error 不进入
`NavigationFailureType` 的三类用户处理。

### 6. afterEach 获得与 Promise 一致的预期 failure

`triggerAfterEach(to, from, failure)` 在 push 已完成分类后调用；官方 `errors.spec.ts` 对
aborted、cancelled 和 duplicated 都反向验证了 Promise 返回值与 afterEach 第三参数。

**课程推导：** 局部命令与全局观察可以共用同一分类函数，但不必把两个通道抽象成
新事件总线。

源码依据：[`errors.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/errors.ts)、
[`router.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/router.ts)、
[`errors.spec.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/errors.spec.ts)、
[`router.spec.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/router.spec.ts)。

## 真实常见易错项

| # | 错误方向 | 原因 | 可观察后果 | 正确方向 |
| --- | --- | --- | --- | --- |
| 1 | 只要 Promise resolve 就当成导航成功 | 三种预期 failure 也是 resolve | 被阻止时仍关闭菜单或清空表单 | 等待后检查 failure 是否为 falsy |
| 2 | 把所有 failure 放进 catch | NavigationFailure 是预期返回值 | catch 捕不到 aborted/duplicated/cancelled | resolve 分类，catch 专属意外 Error |
| 3 | 把 redirect 当作 aborted | redirect 会继续到新目标 | 成功登录跳转被误报为失败 | 以最终 push 结果和 `redirectedFrom` 观察 |
| 4 | 比较 Error message 文字 | message 是调试描述，非类型契约 | 版本或文案变化使分类失效 | 用 `isNavigationFailure()` 和 enum |
| 5 | 硬编码 4/8/16 | 数字不表达语义 | 代码难读，升级边界不清 | 使用 `NavigationFailureType` 成员 |
| 6 | 混淆 aborted 与 cancelled | 前者是 guard false，后者是新导航更新 identity | 未保存提示与竞态埋点混在一起 | 分别产生真实结果并显示 to/from |
| 7 | 手造 `{ type, to, from }` 运行测试 | 真实 failure 还有 Router identity symbol | 伪对象无法通过 `isNavigationFailure` | 用真实 router 触发 guard/duplicate/race |
| 8 | 在 afterEach 返回 false 阻止导航 | afterEach 是已结算观察 hook | 代码看似有保护，导航却已提交 | 阻止放 beforeEach/beforeResolve，afterEach 只记录 |
| 9 | 不等 push Promise 就清理 UI | failure 在异步导航结束时才可用 | 被取消后无法恢复原状态 | 在发起方 await 并按类型决策 |
| 10 | 只有局部处理，全局不观察 | 跨页埋点会分散且遗漏 | 无法统计竞态、重复导航与守卫阻止 | 局部 await 决策 + afterEach 统一观察 |

## 高级使用与贡献场景

1. **组合恢复策略。** 未保存表单可只关心 aborted/cancelled，重复点击可安静忽略
   duplicated；用位组合表达策略，不写重复 if 链。
2. **局部与全局各管一层。** 发起组件决定是否关闭 UI；afterEach 只发送标准化埋点。
   两者共用分类函数即可，不引入新事件总线。
3. **保留 to/from 而不保留整个响应式 route。** 埋点将 fullPath/name/type 转为普通记录，
   避免长期持有 route 对象。
4. **区分 expected failure 与 operational error。** 前者用于产品交互和埋点，后者进
   `onError` / 错误监控，不用一个“导航失败”提示淹没。
5. **用受控 guard 复现竞态。** 测试 cancelled 时使用 deferred，不使用任意
   `setTimeout`；这使事件顺序可读、可复现、不依赖机器速度。

## 来源

### Vue Router 官方 Guide/API

- [Navigation Failures](https://router.vuejs.org/guide/advanced/navigation-failures)
- [`isNavigationFailure()`](https://router.vuejs.org/api/functions/isnavigationfailure)
- [`NavigationFailureType`](https://router.vuejs.org/api/enumerations/navigationfailuretype)
- [`NavigationFailure`](https://router.vuejs.org/api/interfaces/navigationfailure)
- [Navigation Guards](https://router.vuejs.org/guide/advanced/navigation-guards)

### `vuejs/router@v5.2.0` 固定标签

- [`packages/router/src/errors.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/errors.ts)
- [`packages/router/src/router.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/router.ts)
- [`packages/router/__tests__/errors.spec.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/errors.spec.ts)
- [`packages/router/__tests__/router.spec.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/router.spec.ts)
- [`packages/router/__tests__/guards/afterEach.spec.ts`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/__tests__/guards/afterEach.spec.ts)

## 结论

B11 的最小教学闭环是让同一个独立 router 真实产生 success、aborted、cancelled 和
duplicated，再同时比较 push Promise、`isNavigationFailure()`、failure to/from、
currentRoute 与 afterEach 时间线。这比手造 failure 对象更能证明真实契约。

redirect 成功属于最终导航成功，意外 Error 属于 reject / `onError`；两者都应在正文明确
边界，但不扩张为主 Demo 的额外分支。B11 实施完成即停，B12 保持 `planned`。
