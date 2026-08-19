---
id: vue.router.learn.advanced.scroll-history-deployment
type: lesson
title: 滚动、历史模式与部署
summary: 分清滚动回调、URL 承载方式与服务器部署的责任边界
domain: frontend
technology: vue
module: router
related:
  - vue.router.learn.basics.setup-first-router
  - vue.router.learn.basics.composition-programmatic-navigation
  - vue.router.learn.advanced.navigation-failures
tags:
  - Vue Router
  - scrollBehavior
  - history mode
  - SPA fallback
  - "404"
appliesTo: Vue 3.5.40、Vue Router 5.2.0
verifiedAt: 2026-08-04
sources:
  - title: Vue Router：Scroll Behavior
    url: https://router.vuejs.org/guide/advanced/scroll-behavior
  - title: Vue Router：Different History modes
    url: https://router.vuejs.org/guide/essentials/history-mode
  - title: Vue Router API：RouterScrollBehavior
    url: https://router.vuejs.org/api/interfaces/routerscrollbehavior
  - title: Vue Router API：createWebHistory()
    url: https://router.vuejs.org/api/functions/createwebhistory
  - title: Vue Router API：createWebHashHistory()
    url: https://router.vuejs.org/api/functions/createwebhashhistory
  - title: Vue Router API：createMemoryHistory()
    url: https://router.vuejs.org/api/functions/creatememoryhistory
  - title: Vue Router API：RouterHistory
    url: https://router.vuejs.org/api/interfaces/routerhistory
  - title: Vue Router 5.2.0 router.ts
    url: https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/router.ts
  - title: Vue Router 5.2.0 scrollBehavior.ts
    url: https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/scrollBehavior.ts
  - title: Vue Router 5.2.0 history adapters
    url: https://github.com/vuejs/router/tree/v5.2.0/packages/router/src/history
  - title: Vue Router 5.2.0 release
    url: https://github.com/vuejs/router/releases/tag/v5.2.0
stage: advanced
level: advanced
estimatedMinutes: 80
prerequisites:
  - vue.router.learn.basics.setup-first-router
  - vue.router.learn.basics.composition-programmatic-navigation
  - vue.router.learn.advanced.navigation-failures
objectives:
  - 读取 scrollBehavior 的 to、from 与 savedPosition
  - 区分导航 Promise 与异步滚动结果的结算点
  - 比较 web、hash 与 memory history 的 URL、base 和初始位置
  - 分开处理服务器 fallback、应用内 404 与真实 HTTP 404
  - 在独立 Demo 中避免改写宿主 URL、滚动位置和恢复策略
recap:
  - scrollBehavior 接收 to、from 与 savedPosition，并与导航 Promise 分开结算。
  - web、hash 与 memory history 共享接口，但 URL、base、初始位置和部署条件不同。
  - HTML5 fallback、应用内 NotFound 与真实 HTTP 404 分属不同责任层。
  - 子目录部署必须同时对齐资源、Router 和服务器三个根路径。
  - 隔离 Demo 除了返回 false，还要在销毁时恢复宿主 scrollRestoration。
---

# 滚动、历史模式与部署

## 一、一次导航涉及三层不同责任

Router 负责匹配、提交 route 并调用滚动策略；history adapter 负责 URL 或内部位置队列；服务器负责首次深链接能否返回 SPA 入口。客户端 matcher 看不到尚未进入应用的 HTTP 请求，服务器 fallback 也不知道该显示哪个应用页面。

| 层次 | 负责什么 | 不负责什么 |
| --- | --- | --- |
| Router | 匹配、导航、scrollBehavior | 首次 HTTP 请求与响应状态 |
| History adapter | location、state、href、push/replace/go | 静态资源和服务器 rewrite |
| 部署服务器 | 入口、资源、fallback、HTTP status | 客户端组件与页面滚动 |

## 二、scrollBehavior 是导航后的独立回调

~~~~ts
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash }
    return { top: 0 }
  },
})
~~~~

`savedPosition` 主要来自浏览器 back/forward 对 history entry 的恢复；普通 push 得到 `null`。返回 falsy 或空对象不会滚动，返回 Promise 可以等待真实过渡事件。`router.push()` 并不等待该 Promise，因此业务验收应观察滚动或过渡的完成信号。

## 三、元素、偏移和 hash 都需要显式策略

`{ top, left }` 表示窗口坐标；带 `el` 时二者是相对元素的偏移。`to.hash` 本身不会替应用返回滚动位置，固定头部宜使用目标元素的 `scroll-margin-top`。相同锚点的 duplicated 导航仍可能再次执行滚动，以便重新定位。

## 四、选择 history 前先确认 URL 与部署条件

| 模式 | 公开 URL / 初始位置 | base 与服务器责任 |
| --- | --- | --- |
| createWebHistory | 正常 pathname；读取浏览器当前 URL | base、构建资源路径与 fallback 前缀必须对齐 |
| createWebHashHistory | route 位于 # 后；读取当前 hash | fragment 不发给服务器，通常不需 route fallback，但有 SEO 与 URL 取舍 |
| createMemoryHistory | 从 nowhere 开始；不改地址栏 | 必须主动 push/replace；base 仍参与 createHref() |

部署在 `/academy/` 时，构建工具的资源 base、history base、服务器 rewrite 前缀和入口目标必须表达同一个根。memory history 维护内部队列，但不等于浏览器地址栏与 back/forward；它适合 SSR、测试和受控宿主，不是免部署配置的捷径。

## 五、fallback、应用 404 与 HTTP 404 不是一件事

HTML5 history 的深链接先到服务器。服务器应保留真实文件和目录，再把 client paths rewrite 到 `index.html`。未知地址因此通常先得到 HTTP 200，应用仍需 catch-all route 显示 NotFound；如果 SEO 或协议要求真实 HTTP 404，应由 SSR 或服务器 matcher 决定响应状态。

## 六、用独立 memory router 观察真实滚动回调

下面的实验使用 `/academy` base，只创建 `/guide/\:chapter` 与 `/search` 两条记录。每次导航都由真实 `scrollBehavior` 写入 to、from、savedPosition 与返回值；固定返回 `false`，并在销毁时恢复宿主 `history.scrollRestoration`。静态责任表只解释部署，不冒充真实服务器验证。

:::demo{id="vue.router.learn.advanced.scroll-history-deployment.scroll-history-deployment-lab-demo" playground="true"}
观察真实 scrollBehavior 回调，同时比较三种 history 与部署责任
:::

## 七、易错使用提示

:::pitfalls
### HTML5 history 未配置服务器 fallback

**触发条件：** HTML5 history 未配置服务器 fallback

**原因：** 首次深链接请求先由服务器处理，客户端 Router 尚未启动。

**后果：** 站内点击正常，但刷新或直接访问子页面得到服务器 404。

**错误示例：**

~~~~nginx
location / { try_files $uri $uri/ =404; }
~~~~

**正确写法：**

~~~~nginx
location / { try_files $uri $uri/ /index.html; }
~~~~

**验证方式：** 对照正确写法验证结果。

### fallback 后没有应用内 catch-all 404

**触发条件：** fallback 后没有应用内 catch-all 404

**原因：** rewrite 会让未知 URL 也返回同一个 SPA 入口。

**后果：** 页面空白或落到意外视图，且用户不知道地址无效。

**错误示例：**

~~~~ts
const routes = [{ path: '/', component: Home }]
~~~~

**正确写法：**

~~~~ts
const routes = [
  { path: '/', component: Home },
  { path: '/:pathMatch(.*)*', component: NotFound },
]
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 hash history 描述成零代价方案

**触发条件：** 把 hash history 描述成零代价方案

**原因：** route fragment 不发送给服务器，也占用了传统 fragment 语义。

**后果：** 分享 URL、SEO 和页面内锚点行为与产品预期不符。

**错误示例：**

~~~~ts
// hash mode 与 web mode 完全等价
~~~~

**正确写法：**

~~~~ts
// 仅在接受 URL/SEO 取舍时使用 createWebHashHistory()
~~~~

**验证方式：** 对照正确写法验证结果。

### memory history 等待浏览器自动首导航

**触发条件：** memory history 等待浏览器自动首导航

**原因：** 它从特殊 nowhere 位置开始，不读取地址栏。

**后果：** RouterView 没有可渲染的初始匹配。

**错误示例：**

~~~~ts
app.use(router).mount('#app')
~~~~

**正确写法：**

~~~~ts
await router.replace('/guide/start')
await router.isReady()
app.use(router).mount('#app')
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为 savedPosition 每次导航都有

**触发条件：** 认为 savedPosition 每次导航都有

**原因：** 普通 programmatic push 没有要恢复的浏览器 entry 坐标。

**后果：** 读取 null 属性或错误地跳过新页面滚动策略。

**错误示例：**

~~~~ts
return { top: savedPosition.top }
~~~~

**正确写法：**

~~~~ts
return savedPosition ?? { top: 0 }
~~~~

**验证方式：** 对照正确写法验证结果。

### 看到 to.hash 就期待浏览器自动滚动

**触发条件：** 看到 to.hash 就期待浏览器自动滚动

**原因：** Vue Router 由 scrollBehavior 的返回值决定滚动目标。

**后果：** URL 含锚点但目标仍停留在旧位置。

**错误示例：**

~~~~ts
scrollBehavior() { return undefined }
~~~~

**正确写法：**

~~~~ts
scrollBehavior(to) { return to.hash ? { el: to.hash } : { top: 0 } }
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 await router.push() 当成滚动完成

**触发条件：** 把 await router.push() 当成滚动完成

**原因：** 导航提交不会 await handleScroll 返回的 Promise。

**后果：** 紧接着读取滚动位置的断言会提前执行。

**错误示例：**

~~~~ts
await router.push('/guide')
expect(window.scrollY).toBe(0)
~~~~

**正确写法：**

~~~~ts
await router.push('/guide')
await waitForVisibleScrollCompletion()
~~~~

**验证方式：** 对照正确写法验证结果。

### 用固定 timer 协调页面过渡

**触发条件：** 用固定 timer 协调页面过渡

**原因：** 动画时长会受设备、样式和 reduced motion 影响。

**后果：** 快速连续导航时，旧异步结果晚到并造成不稳定测试。

**错误示例：**

~~~~ts
return new Promise((resolve) => setTimeout(() => resolve({ top: 0 }), 300))
~~~~

**正确写法：**

~~~~ts
return transitionFinished.then(() => ({ top: 0 }))
~~~~

**验证方式：** 对照正确写法验证结果。

### 子目录部署只修改 Router base

**触发条件：** 子目录部署只修改 Router base

**原因：** route href、静态资源与服务器入口分别由不同层生成。

**后果：** 链接看似正确，刷新或加载 JS/CSS 时仍返回 404。

**错误示例：**

~~~~ts
createWebHistory('/academy/') // 只改这一处
~~~~

**正确写法：**

~~~~text
构建资源 base = history base = rewrite 前缀 = /academy/
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为 return false 已完全隔离宿主

**触发条件：** 认为 return false 已完全隔离宿主

**原因：** 存在 scrollBehavior 时，Router 会把浏览器 scrollRestoration 设为 manual。

**后果：** Demo 卸载后宿主页面仍失去原生滚动恢复策略。

**错误示例：**

~~~~ts
scrollBehavior: () => false
// 卸载时不做清理
~~~~

**正确写法：**

~~~~ts
const original = history.scrollRestoration
// teardown
history.scrollRestoration = original
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 八、从源码推导适用场景

:::steps
### 1. 导航结算与滚动 Promise 应分别观测

`finalizeNavigation()` 写入 currentRoute 后调用 `handleScroll()`，但不 await 它。菜单关闭可跟随导航成功，滚动验收与页面过渡则应等待自己的可见完成信号。

### 2. nextTick 只保证新 route 的 Vue 更新机会

`handleScroll()` 在 `nextTick()` 后调用用户回调，使目标 DOM 更可能存在；更长的 route transition 仍应通过真实事件协调，不能把 nextTick 当动画结束。

### 3. savedPosition 绑定 history entry 身份

5.2.0 按 fullPath 与 history position 保存、读取并删除坐标；它不是笼统的“上一页位置”。适合恢复 back/forward entry，不适合作为所有新导航的默认值。

### 4. 过期异步结果只在目标仍为 current 时应用

5.2.0 在应用滚动结果和上报错误前比较 normalized route 对象身份。快速导航不会让旧结果改动新页面，但这只是 Router 的窄保护，不是通用任务取消协议。

### 5. 三个 adapter 共享接口，不共享环境语义

web、hash 与 memory 都提供 base、location、state、push、replace、go、listen、createHref 和 destroy。上层 Router 可复用流程，部署层仍必须按 URL 的真实承载方式配置。

### 6. base 同时影响 href 与部署边界

web/hash 的 base 关联公开 URL，memory 的 base 也参与 `createHref()`。组件不应手工拼接根路径；构建配置和服务器 rewrite 则必须在各自层显式对齐。

### 7. duplicated 锚点导航仍可能需要滚动

Router 识别重复位置后仍会调用滚动处理，使同一 hash 可重新定位。埋点可把它归类为 duplicated，但不能据此断言所有滚动后续都被跳过。

### 8. scrollRestoration 是独立组件必须归还的宿主状态

createRouter 配置 scrollBehavior 时会把全局策略设为 manual，而 app/router 卸载不会自动恢复。嵌入式实验、微前端和临时工具都应保存并在 teardown 归还原值。
:::

- [ ] 为普通 push、popstate 恢复与 hash 分别定义滚动策略
- [ ] 等待真实滚动或过渡完成信号，不依赖固定 timer
- [ ] 根据部署能力选择 web、hash 或 memory history
- [ ] 同步构建资源 base、history base 与服务器 rewrite 前缀
- [ ] 同时提供服务器 fallback 和应用内 NotFound 页面
- [ ] 独立 Router 卸载时归还宿主 scrollRestoration
