# Vue Router R1-B14：动态路由与 RouterLink 扩展调研

> 核验日期：2026-08-04
>
> 适用版本：Vue Router 5.2.0。
>
> 范围：B14 单课；不进入 B15 类型化与文件路由。资料来自 Vue Router 官方 Guide/API 与
> `vuejs/router@v5.2.0` 固定标签源码。

## 结论

B14 应把 matcher 变更、当前 route 刷新与链接渲染分开。`addRoute()` / `removeRoute()` 只改变后续
解析使用的 matcher；当前 route 是已经归一化的快照，不会因 matcher 变化自动重算。组件挂载期间
注册后，应显式 `await router.replace(router.currentRoute.value.fullPath)`；守卫内注册则应 `return`
目标位置，并确保下一轮不再重复注册。

扩展链接时，`useLink()` 或 RouterLink custom slot 复用 Router 的 resolve、href、active 和 navigate
语义。内部链接应保留真实 `href`、`aria-current` 与 `navigate` 的事件过滤；外部 URL 应直接渲染
原生 `<a>`，不能交给 client router 解释。

## 官方契约

### 动态 matcher

- `router.addRoute(record)` 注册顶层记录并返回清理函数；`addRoute(parentName, record)` 注册具名父
  记录的 child。
- 注册不会主动导航。新增记录能更精确匹配当前 URL 时，必须再 push/replace 才会更新 RouterView。
- 守卫内注册后应 `return to.fullPath` 触发重定向，不在同一 guard 内调用 `replace()`；注册条件必须
  在下一轮变为 false，避免无限重定向。
- 同名 route 是替换语义：添加新记录前会移除旧记录。route name 在整个 router 中唯一，可用
  `Symbol` 降低插件冲突。
- `removeRoute(name)`、addRoute 返回的 disposer 或同名替换都可移除记录；移除 parent 时，其
  children 与 aliases 一并移除。
- `hasRoute(name)` 检查具名记录，`getRoutes()` 返回当前公开 RouteRecord 列表。应用不应依赖 matcher
  的 score、regex 等内部字段。

依据：[Dynamic Routing](https://router.vuejs.org/guide/advanced/dynamic-routing)、
[Router API](https://router.vuejs.org/api/interfaces/router)。

### RouterLink custom slot 与 useLink

- RouterLink custom slot 暴露 `route`、`href`、`isActive`、`isExactActive` 和 `navigate`；
  `useLink({ to, replace? })` 返回同一组核心行为但不负责渲染。
- `href` 来自 `router.resolve()` 与 history base，不能用原始 `to` 手工拼接。
- active 比较 route record 与 params；exact active 还要求 matched 长度一致。query 不参与 active
  判断，这一基础语义沿用 L02。
- `navigate(event)` 会忽略 Meta/Alt/Ctrl/Shift、非左键、已 preventDefault 的事件和
  `target="_blank"`，其余点击 preventDefault 后调用 push/replace。
- 自定义链接仍应渲染 `<a href>`，exact active 时提供 `aria-current="page"`；只用 click handler 会
  丢失复制地址、状态栏预览、新标签页和键盘语义。
- 外部 URL 由原生 `<a>` 处理；`target="_blank"` 同时使用 `rel="noopener noreferrer"`。

依据：[Extending RouterLink](https://router.vuejs.org/guide/advanced/extending-router-link)、
[`useLink()`](https://router.vuejs.org/api/functions/uselink)、
[`RouterLink.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/RouterLink.ts)。

## Vue Router 5.2.0 源码推导

1. `createRouter()` 的公开 add/remove/has/get 直接委托 matcher；改变 matcher 不会写 currentRoute。
2. matcher 按 score 插入记录，具名原始记录进入 name map；alias 不重复占用 name map。
3. addRoute 遇到同名记录先 remove，再插入新 matcher，因此同名不是两条并存。
4. disposer 捕获本次创建的 matcher 身份；该 matcher 已被替换或移除时，再调用 disposer 是 no-op，
   不会按名称误删后来注册的新记录。
5. remove matcher 会递归移除 children 和 aliases，并同步 name map 与排序数组。
6. `useLink()` 通过 computed resolve `to`，并从 current route 派生 active/exact；适合渲染层组合，不
   适合替代权限判断。
7. `navigate()` 使用统一 `guardEvent()` 保留浏览器原生旁路，再调用 router.push/replace；包装组件应
   复用它，而不是复制事件判断。
8. RouterLink 本身也使用 `useLink()`；custom slot 和组合函数属于同一行为 seam，测试不应把两者
   描述成两套 active 算法。

matcher 数组本身不是 `useLink()` 的响应式依赖。只调用 add/remove 时，`to` 与 current route 都未
变化，已缓存的 resolved route/active 可以暂时保持旧值；显式导航提交新的 current route，或改变
`to`，才会触发 computed 重新求值。因此 active 不能充当即时 matcher inventory，注册状态应读取
`hasRoute()` / `getRoutes()`。

固定源码：

- [`router.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/router.ts)
- [`matcher/index.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/matcher/index.ts)
- [`RouterLink.ts@v5.2.0`](https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/RouterLink.ts)

## 课程冻结

- ID：`vue.router.learn.advanced.dynamic-routing-router-link`
- 标题：动态路由与 RouterLink 扩展
- collection / level：`advanced`
- 硬前置：L06 命名路由、重定向与别名；L11 导航失败
- previous：B13；B15 必须继续为 `planned`
- 唯一 Demo：`dynamic-routing-router-link-lab-demo`

## 唯一 Demo contract

Demo 创建独立 memory router，初始记录：

- `/home`：稳定首页；
- `/:pathMatch(.*)*`：fallback；
- 初始位置 `/feature/tool?mode=inspect`，因此尚未注册时由 fallback 匹配。

动态记录固定为具名 `/feature/tool`。必须可见证明：

1. 注册前 `hasRoute=false`，当前 matched 为 fallback。
2. `addRoute()` 后 `hasRoute=true`、getRoutes 增加，但当前 route/RouterView 仍是旧 fallback。
3. 显式 replace 当前 fullPath 后 matched/RouterView 才切到 feature。
4. `removeRoute(name)` 或当前 disposer 移除 matcher 后，当前快照仍保持 feature；再次 replace 才回到
   fallback。
5. useLink 内部链接展示 href、active、exact 与标准 navigate；Ctrl/Meta click 不导航，键盘 Enter
   可以导航。
6. 外部链接使用原生 `<a target="_blank" rel="noopener noreferrer">`，不调用 useLink/navigate。
7. 屏幕展示 generation、宿主路径、fullPath、matched、params/query、navigation outcome、hasRoute、
   route count/names、disposer 状态、matcher/navigation 时间线。

重置与卸载必须调用当前 disposer、卸载 mini-app 并 destroy memory history；不得注册到宿主 Router。

## 结构化易错项

1. 认为 addRoute 会立即刷新当前 RouterView。
2. 守卫内 addRoute 后再调用 replace，而不是 return location。
3. 守卫注册条件不收敛，造成无限重定向。
4. 忽略 route name 全局唯一，同名注册意外替换旧记录。
5. 移除 parent 时误以为 children/aliases 会保留。
6. 把 getRoutes 的非公开 matcher 字段当应用协议。
7. 自定义链接只监听 click，不输出真实 href。
8. 手写 router.push，丢失修饰键、右键、preventDefault 与 `_blank` 旁路。
9. active 时只换颜色，不提供 `aria-current`。
10. 把外部 URL 交给 RouterLink/useLink，或 `_blank` 遗漏安全 rel。

每项进入正文时说明原因、可观察后果、错误示范和正确示范；源码推导保持独立编号区。

## 最小 E2E

1. B14 页面与唯一 Demo 存在，宿主 URL 不变。
2. 初始 fallback -> register 后仍 fallback -> replace 后 feature 的严格状态序列。
3. `hasRoute`、getRoutes count/names、disposer 与完整日志同步变化。
4. add/remove 单独发生时 active/exact 保留当前 computed 快照；显式导航后重新求值。Ctrl/Meta
   click 内部链接不导航；键盘 Enter 通过 useLink.navigate 导航并更新当前 route。
5. 原生外链 href/target/rel 正确，不打开新页面。
6. removeRoute(name)、再次 replace 和 disposer no-op/重注册路径可观察。
7. 390px、200% 文字、reduced-motion、横向溢出、console/pageerror。

## 明确排除

- 不修改宿主 router，不接入权限系统、后端菜单或微前端注册中心。
- 不实现通用 SmartLink 组件库，不测试真实外站。
- 不进入 B15 的 RouteRecordInfo、TypesConfig、`vue-router/vite` 或 pages fixture。
- 不启动服务、不运行构建、不提交代码。

## B14 Stop Boundary

B14 完成条件是研究、catalog 红绿、正文、唯一 Demo、专项 E2E、静态 Gate、全量 Vitest、
Standards/Spec 双轴复核和计划落账全部通过。完成前不得把 B15 改为 `available`。
