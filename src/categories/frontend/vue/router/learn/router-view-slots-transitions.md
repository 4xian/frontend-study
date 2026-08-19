---
id: vue.router.learn.advanced.router-view-slots-transitions
type: lesson
title: RouterView 插槽与过渡
summary: 在 RouterView 插槽内组合路由组件的实例身份、缓存与页面过渡
domain: frontend
technology: vue
module: router
related:
  - vue.router.learn.basics.router-link-view-active
  - vue.router.learn.intermediate.lazy-loading
  - vue.router.learn.advanced.navigation-failures
tags:
  - Vue Router
  - RouterView slot
  - Transition
  - KeepAlive
  - key
appliesTo: Vue 3.5.40、Vue Router 5.2.0
verifiedAt: 2026-08-04
sources:
  - title: Vue Router：RouterView slot
    url: https://router.vuejs.org/guide/advanced/router-view-slot
  - title: Vue Router：Transitions
    url: https://router.vuejs.org/guide/advanced/transitions
  - title: Vue Router API：RouterView
    url: https://router.vuejs.org/api/variables/routerview
  - title: Vue Router API：Router.isReady()
    url: https://router.vuejs.org/api/interfaces/router#isready
  - title: Vue：Transition
    url: https://vuejs.org/guide/built-ins/transition
  - title: Vue：KeepAlive
    url: https://vuejs.org/guide/built-ins/keep-alive
  - title: Vue 3.5.40 BaseTransition.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/BaseTransition.ts
  - title: Vue Router 5.2.0 RouterView.ts
    url: https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/RouterView.ts
  - title: Vue Router 5.2.0 router.ts
    url: https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/router.ts
stage: advanced
level: advanced
estimatedMinutes: 70
prerequisites:
  - vue.router.learn.basics.router-link-view-active
  - vue.router.learn.intermediate.lazy-loading
  - vue.router.learn.advanced.navigation-failures
objectives:
  - 读取 RouterView slot 提供的 Component 与 route
  - 按 Transition、KeepAlive、route component 的顺序组合视图
  - 区分默认复用、key 强制替换与 KeepAlive 缓存
  - 分别观察导航结算、组件生命周期与 transition hooks
  - 在独立 memory router 挂载前等待初始导航 ready
recap:
  - RouterView slot 交付已创建的 Component VNode 与该视图实际使用的 route。
  - Transition 与 KeepAlive 应放在 slot 内，直接作用于 route component。
  - 默认复用、route.path key 和 KeepAlive 分别控制原位更新、实例身份与缓存。
  - memory router 应先完成初始导航并等待 isReady，再挂载 mini-app。
  - 导航结算、组件生命周期与 transition hooks 是三条需要分开观察的时间线。
---

# RouterView 插槽与过渡

## 一、插槽交付的是当前视图的 VNode 与 route

`RouterView` 先解析当前 depth、命名视图、route props 与 attrs，再把已经创建的组件 VNode 作为 `Component` 交给插槽。插槽中的 `route` 则是该视图实际用于匹配的位置；key、诊断与过渡方向都应读取这份 route。

~~~~vue
<RouterView v-slot="{ Component, route }">
  <component :is="Component" :key="route.path" />
</RouterView>
~~~~

## 二、让过渡与缓存作用于 route component

`Transition` 与 `KeepAlive` 都放在 `RouterView` 插槽内。外层 Transition 协调新旧视图，内层 KeepAlive 保存失活实例，最内层才渲染 slot 给出的 route component；不要缓存长期存在的 RouterView 本身。

~~~~vue
<RouterView v-slot="{ Component, route }">
  <Transition name="route-fade" mode="out-in">
    <KeepAlive>
      <component :is="Component" :key="route.path" />
    </KeepAlive>
  </Transition>
</RouterView>
~~~~

| 组合 | alpha -&gt; beta | workspace -&gt; review -&gt; workspace |
| --- | --- | --- |
| 无 KeepAlive、无 key | 同一 workspace 实例原位复用 | 返回时创建新实例 |
| 无 KeepAlive、path key | 替换并销毁旧实例 | 返回时创建新实例 |
| KeepAlive、无 key | 同一 workspace 实例原位复用 | 失活后恢复原实例 |
| KeepAlive、path key | alpha 与 beta 分别缓存 | 按 pathname 恢复实例 |

## 三、key 是产品身份选择，不是固定样板

同一 route record 只改变 params 时，Vue Router 默认复用组件实例。`route.path` key 会让不同 pathname 拥有不同 VNode 身份，但不会把 query 与 hash 纳入身份；只有确实需要独立状态或过渡时才应添加。KeepAlive 保存的是实例，不会把状态序列化到 store。

## 四、先完成初始导航，再挂载 memory router

~~~~ts
const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

await router.push('/workspace/alpha')
await router.isReady()

app.use(router)
app.mount('#app')
~~~~

`isReady()` 等待初始导航结算，不是延时工具。先导航并等待 ready，再 mount，能避免空 RouterView 后插入首个页面时产生非预期 initial enter；导航失败时它也可能 reject。

## 五、用一个受控实验分开观察三条时间线

下面的独立 memory router 固定使用 `/workspace/\:id` 与 `/review`。切换 KeepAlive、path key 或 transition 都会卸载旧 mini-app 并创建新 generation，避免旧 cache 污染结论。导航结果、组件生命周期与 transition hooks 分区记录。

:::demo{id="vue.router.learn.advanced.router-view-slots-transitions.router-view-transitions-lab-demo" playground="true"}
比较 RouterView 插槽内的实例复用、缓存生命周期与 out-in 过渡事件
:::

## 六、导航提交与视觉离入场不是同一时刻

`await router.push()` 只说明导航已经结算。`mode="out-in"` 另行协调旧视图完成离场后再插入新视图。Vue 3.5.40 的公开回调日志是 `before-leave -&gt; before-enter -&gt; after-leave -&gt; after-enter`：内部 afterLeave 会先触发新视图更新，再调用公开 `onAfterLeave`。应等待可见 hook 事件，而不是用固定毫秒数猜测完成时间。

## 七、易错使用提示

:::pitfalls
### 把 Transition 或 KeepAlive 包在 RouterView 外

**触发条件：** 把 Transition 或 KeepAlive 包在 RouterView 外

**原因：** 包装目标变成长期存在的 RouterView，而不是实际 route component。

**后果：** 缓存与过渡的实例边界错误，并触发 Router 的弃用诊断。

**错误示例：**

~~~~vue
<KeepAlive>
  <RouterView />
</KeepAlive>
~~~~

**正确写法：**

~~~~vue
<RouterView v-slot="{ Component }">
  <KeepAlive><component :is="Component" /></KeepAlive>
</RouterView>
~~~~

**验证方式：** 对照正确写法验证结果。

### 给所有视图无条件添加 route key

**触发条件：** 给所有视图无条件添加 route key

**原因：** key 改变 VNode 身份，也会改变实例与生命周期行为。

**后果：** 原本应复用的表单、请求与局部状态被重建。

**错误示例：**

~~~~vue
<component :is="Component" :key="route.fullPath" />
~~~~

**正确写法：**

~~~~vue
<component :is="Component" /> <!-- 默认复用符合需求时 -->
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 slot Component 当成组件定义或懒加载函数

**触发条件：** 把 slot Component 当成组件定义或懒加载函数

**原因：** Vue Router 5.2.0 交给 slot 的 Component 已经是创建完成的 VNode。

**后果：** 重复解析 route record，并可能丢失 RouterView 已合并的 props、attrs 与 ref。

**错误示例：**

~~~~ts
const resolved = await Component()
~~~~

**正确写法：**

~~~~vue
<RouterView v-slot="{ Component }">
  <component :is="Component" />
</RouterView>
~~~~

**验证方式：** 对照正确写法验证结果。

### 不加 key，却期待同记录参数变化触发过渡

**触发条件：** 不加 key，却期待同记录参数变化触发过渡

**原因：** 同一路由记录通常复用同一个组件实例，参数变化只会更新现有 VNode。

**后果：** route 已切换到新参数，但不会出现预期的 leave 和 enter。

**错误示例：**

~~~~vue
<component :is="Component" />
~~~~

**正确写法：**

~~~~vue
<component :is="Component" :key="route.path" />
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 KeepAlive 当成状态序列化工具

**触发条件：** 把 KeepAlive 当成状态序列化工具

**原因：** KeepAlive 只保留当前缓存边界里的组件实例，不会把状态写入持久化存储。

**后果：** 重建应用、缓存边界或刷新页面后，仍错误期待旧状态存在。

**错误示例：**

~~~~ts
// 使用 KeepAlive 后刷新页面也能恢复表单
~~~~

**正确写法：**

~~~~ts
// 跨刷新状态交给 store 或持久化层；KeepAlive 只负责实例缓存
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 deactivated 当成 unmounted

**触发条件：** 把 deactivated 当成 unmounted

**原因：** 缓存组件离场时仍保留实例，之后会再次 activated。

**后果：** 资源被过早永久释放，或错误断言 setup 返回时会重新执行。

**错误示例：**

~~~~ts
onDeactivated(disposePermanently)
~~~~

**正确写法：**

~~~~ts
onDeactivated(pauseWork)
onUnmounted(disposePermanently)
~~~~

**验证方式：** 对照正确写法验证结果。

### memory router 未发起初始导航就等待 isReady

**触发条件：** memory router 未发起初始导航就等待 isReady

**原因：** memory history 不会替独立应用自动选择初始 URL。

**后果：** ready Promise 没有真实的初始导航可以结算。

**错误示例：**

~~~~ts
await router.isReady()
~~~~

**正确写法：**

~~~~ts
await router.push('/workspace/alpha')
await router.isReady()
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 mode="out-in" 当成导航等待策略

**触发条件：** 把 mode="out-in" 当成导航等待策略

**原因：** out-in 只协调旧 VNode 离场和新 VNode 入场，不改变 Router Promise 的结算点。

**后果：** router.push 已成功返回时，界面仍可能处在 leave 或 enter 阶段。

**错误示例：**

~~~~ts
await router.push('/review')
// 错误假设：after-enter 此时一定已经完成
~~~~

**正确写法：**

~~~~ts
await router.push('/review')
await waitForVisibleTransitionState()
~~~~

**验证方式：** 对照正确写法验证结果。

### 用 sleep 等待页面过渡

**触发条件：** 用 sleep 等待页面过渡

**原因：** CSS 时长会受样式、设备与 reduced motion 影响。

**后果：** 自动化断言在不同环境中随机提前或超时。

**错误示例：**

~~~~ts
await new Promise((resolve) => setTimeout(resolve, 300))
~~~~

**正确写法：**

~~~~ts
await expect(log).toContainText('after-enter')
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 八、从源码推导适用场景

:::steps
### 1. slot 是装饰现有视图 VNode 的边界

`RouterView.ts` 在调用默认 slot 前已经创建 route component VNode，并合并 route props、attrs、ref 与卸载回调。适合在 slot 内增加 Transition、KeepAlive、统一 ref 或页面级观测，不适合重新执行 loader。

### 2. key 应跟随当前 outlet 实际使用的 route

`routeToDisplay` 同时驱动 depth、matched record 与 slot route。嵌套或显式传入 route 时，应读取 slot 的 route 决定 key 和过渡方向，避免从外层全局 route 猜测当前 outlet 身份。

### 3. RouterView depth 会跳过无组件记录

`RouterView.ts` 会越过没有 `components` 的 matched record，再为下一层 outlet 提供新的 depth。多层布局不能自行用固定 `matched[index]` 猜当前组件，应让每层 RouterView 完成自己的匹配解析。

### 4. 默认复用是 Router 支持的正常路径

RouterView 在组件实例复用到新记录时会更新 record instance，并按条件迁移 leave/update guards。详情筛选、分页参数等需要保留局部状态的场景，应先利用默认复用，再按产品身份决定是否加 key。

### 5. KeepAlive 离场不等于真正卸载

RouterView 只在 route component VNode 真正 unmount 后清除 record instance；deactivation 仍保留组件。需要暂停订阅时使用 activated/deactivated，需要永久释放资源时使用 unmounted。

### 6. isReady 等待导航结算，不等待视觉动画

Router 在初始导航 finalize 后标记 ready，失败则拒绝同一等待队列。独立 memory router 应先 push 初始位置再等待 ready；Transition hooks 则另行观察视觉离入场，二者不能互相替代。

### 7. 测试应分开锁定导航、实例与过渡

Vue Router 固定测试分别覆盖 RouterView slot、KeepAlive 与 isReady 失败路径。业务回归也应分别断言 current route、instance ID/count 和 transition hook，避免一个日志字符串同时冒充三种证据。
:::

- [ ] 在 RouterView slot 内组合 route component、Transition 与 KeepAlive
- [ ] 先确认产品身份边界，再选择无 key、route.path 或其他稳定 key
- [ ] 分别处理 activated/deactivated 与 mounted/unmounted
- [ ] memory router 先 push 初始位置，再等待 isReady
- [ ] 分开观察导航结果、组件实例和 transition hooks
- [ ] reduced motion 下仍验证最终状态，不依赖固定等待时间
