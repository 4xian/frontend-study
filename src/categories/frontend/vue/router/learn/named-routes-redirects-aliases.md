---
id: vue.router.learn.intermediate.named-routes-redirects-aliases
type: lesson
title: 命名路由、重定向与别名
summary: 用稳定名称生成地址，并区分重定向替换 URL 与别名保留 URL 的匹配语义
domain: frontend
technology: vue
module: router
related:
  - vue.router.learn.basics.route-params-query-matching
  - vue.router.learn.basics.nested-routes
  - vue.router.learn.basics.composition-programmatic-navigation
tags:
  - Vue Router
  - named routes
  - redirect
  - alias
  - route matching
appliesTo: Vue Router 5.2.0
verifiedAt: 2026-08-04
sources:
  - title: Vue Router：Named Routes
    url: https://router.vuejs.org/guide/essentials/named-routes
  - title: Vue Router：Redirect and Alias
    url: https://router.vuejs.org/guide/essentials/redirect-and-alias
  - title: Vue Router API：RouteRecordRaw
    url: https://router.vuejs.org/api/type-aliases/routerecordraw
  - title: Vue Router 5.2.0 matcher/index.ts
    url: https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/matcher/index.ts
  - title: Vue Router 5.2.0 router.ts
    url: https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/router.ts
stage: intermediate
level: intermediate
estimatedMinutes: 60
prerequisites:
  - vue.router.learn.basics.route-params-query-matching
  - vue.router.learn.basics.nested-routes
  - vue.router.learn.basics.composition-programmatic-navigation
objectives:
  - 用唯一 route name 和 params 生成经过编码的目标地址
  - 理解按 name 解析会直接选择记录，而按 path 解析仍需路径排序
  - 区分 redirect 替换输入 URL 与 alias 保留输入 URL
  - 判断 redirect record 与最终匹配 record 各自会运行哪些守卫
  - 正确配置嵌套路由的相对、绝对和带参数 alias
recap:
  - name 是全局唯一的记录身份，按 name 导航会编码 params 并绕过 path ranking。
  - redirect 重新解析目标并替换 URL，redirect record 自身守卫不运行。
  - alias 保留输入 URL，同时沿用原记录的组件、name 与守卫。
  - 嵌套 alias 是否以 / 开头决定相对或绝对展开。
  - 带参数的原记录要求绝对 alias 也保留相同参数。
---

# 命名路由、重定向与别名

## 一、name 是记录身份，不是路径的第二份文案

给 route record 配置唯一 name 后，RouterLink、push()、replace() 和 resolve() 都可以用 name 加 params 表达目标。路由器会负责 params 编码，并直接选择这个具名记录；如果传 path，则仍由 path matcher 的排序结果决定命中哪条记录。

~~~~ts
const routes = [
  { path: '/profiles/new', name: 'profile-create', component: ProfileCreate },
  { path: '/profiles/:username', name: 'profile-main', component: ProfilePage },
]

// 即使生成的路径也能被静态记录匹配，name 仍明确指向 profile-main。
await router.push({ name: 'profile-main', params: { username: 'new' } })

// 参数中的空格、斜杠和非 ASCII 字符由路由器编码。
router.resolve({ name: 'profile-main', params: { username: 'Jian Li/演示' } }).href
~~~~

| location 写法 | 记录选择 | params 处理 |
| --- | --- | --- |
| { name, params } | 由唯一 name 直接选择记录 | 按记录参数规则编码并生成 path |
| { path } 或字符串 | 由 path matcher 排序后选择记录 | path 已经成形，不再读取 params |

## 二、redirect 换地址，alias 留地址

:::compare
### 错误写法

~~~~text
访问 /legacy/alice，redirect 重新解析到 /directory/profiles/alice；最终 URL 是目标地址，redirectedFrom 保留来源。
~~~~

### 正确写法

~~~~text
访问 /members/alice，URL 仍是 /members/alice；matched 使用原记录的组件与配置，aliasOf 指向原记录。
~~~~
:::

redirect record 只描述转向目标，不需要 component。导航在提取该记录的 beforeEnter 之前就会重新解析目标，所以 redirect record 自己的守卫不会运行；目标记录的守卫照常运行。若 redirect record 同时声明 children，它仍需要 component 提供 RouterView 承载子记录。

~~~~ts
const routes = [
  {
    path: '/legacy/:username',
    redirect: (to) => ({
      name: 'profile-main',
      params: { username: to.params.username },
      query: to.query,
    }),
  },
  {
    path: '/directory/profiles/:username',
    name: 'profile-main',
    component: ProfilePage,
    alias: '/members/:username',
  },
]
~~~~

## 三、嵌套 alias 先判断相对还是绝对

嵌套记录中的 alias 不以 / 开头时，会相对父路径展开；以 / 开头时是绝对地址。绝对 alias 虽然不包含父路径片段，仍按原记录的父子链渲染。原路径含参数时，绝对 alias 也必须包含对应参数，否则无法生成相同的匹配数据。

~~~~ts
{
  path: '/directory',
  component: DirectoryLayout,
  children: [
    {
      path: 'profiles/:username',
      component: ProfilePage,
      // 相对 alias 与绝对 alias 都保留 :username。
      alias: ['alternative/:username', '/members/:username'],
    },
  ],
}
~~~~

## 四、在隔离 Demo 中比较三条入口

下面的 mini-app 每次都先回到 /start 中立页，再分别按 name、redirect 和绝对 alias 进入同一个目标组件。可见状态同时展示输入 location、最终 pathname、matched names、aliasOf、params/query、record guard 轨迹、导航结果和宿主 URL。

:::demo{id="vue.router.learn.intermediate.named-routes-redirects-aliases.named-routes-redirects-aliases-lab-demo" playground="true"}
从中立页比较 name、redirect 与 alias 的地址和守卫语义
:::

## 五、易错使用提示

:::pitfalls
### 在不同记录上复用同一个 name

**触发条件：** 在不同记录上复用同一个 name

**原因：** route name 在整个 router 内必须唯一，后加入的同名记录会替换 name map 中的旧记录。

**后果：** 按 name 导航不再进入原记录，依赖旧记录的链接和跳转悄然改向。

**错误示例：**

~~~~ts
[{ path: '/users/:id', name: 'detail' }, { path: '/posts/:id', name: 'detail' }]
~~~~

**正确写法：**

~~~~ts
[{ path: '/users/:id', name: 'user-detail' }, { path: '/posts/:id', name: 'post-detail' }]
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 params 和 path location 混在一起

**触发条件：** 把 params 和 path location 混在一起

**原因：** 传入 path 时地址已经确定，额外 params 不负责补段，也不会获得具名导航的编码与记录选择语义。

**后果：** 参数被忽略或手工拼接出未编码地址，最终匹配记录也可能受 path ranking 影响。

**错误示例：**

~~~~ts
router.push({ path: '/profiles', params: { username: 'Jian Li/演示' } })
~~~~

**正确写法：**

~~~~ts
router.push({ name: 'profile-main', params: { username: 'Jian Li/演示' } })
~~~~

**验证方式：** 对照正确写法验证结果。

### 把权限守卫放在 redirect record 上

**触发条件：** 把权限守卫放在 redirect record 上

**原因：** redirect 会在该记录的导航守卫被提取前重新解析目标，redirect record 的 beforeEnter 不运行。

**后果：** 看似存在权限检查，实际导航直接进入目标记录。

**错误示例：**

~~~~ts
{ path: '/admin', redirect: '/login', beforeEnter: requireAdmin }
~~~~

**正确写法：**

~~~~ts
{ path: '/login', component: LoginPage, beforeEnter: validateLoginEntry }
~~~~

**验证方式：** 对照正确写法验证结果。

### 给纯 redirect record 添加无用 component

**触发条件：** 给纯 redirect record 添加无用 component

**原因：** 没有 children 的 redirect record 不会渲染自身 component，只负责生成新目标。

**后果：** 读代码的人误以为重定向前会短暂渲染该组件。

**错误示例：**

~~~~ts
{ path: '/home', component: EmptyPage, redirect: '/' }
~~~~

**正确写法：**

~~~~ts
{ path: '/home', redirect: '/' }
~~~~

**验证方式：** 对照正确写法验证结果。

### 把带 children 的 redirect record 也当作无组件记录

**触发条件：** 把带 children 的 redirect record 也当作无组件记录

**原因：** 当 redirect record 还负责嵌套 children 时，component 需要提供 RouterView 承载子记录。

**后果：** 子记录虽然匹配，却没有对应的视图出口。

**错误示例：**

~~~~ts
{ path: '/settings', redirect: '/settings/profile', children: [profileRoute] }
~~~~

**正确写法：**

~~~~ts
{ path: '/settings', component: SettingsLayout, redirect: '/settings/profile', children: [profileRoute] }
~~~~

**验证方式：** 对照正确写法验证结果。

### 用 redirect 实现需要保留的旧地址

**触发条件：** 用 redirect 实现需要保留的旧地址

**原因：** redirect 会把浏览器中的输入地址替换为目标地址；alias 才保留当前 URL 并按原记录匹配。

**后果：** 分享、统计或兼容层需要保留的地址在导航后消失。

**错误示例：**

~~~~ts
{ path: '/members/:username', redirect: '/directory/profiles/:username' }
~~~~

**正确写法：**

~~~~ts
{ path: '/directory/profiles/:username', component: ProfilePage, alias: '/members/:username' }
~~~~

**验证方式：** 对照正确写法验证结果。

### 嵌套绝对 alias 丢失参数

**触发条件：** 嵌套绝对 alias 丢失参数

**原因：** 以 / 开头的 nested alias 是绝对地址；原记录的动态参数也必须在 alias 中出现。

**后果：** alias 无法提供原组件依赖的 params，或在开发期直接收到配置警告。

**错误示例：**

~~~~ts
{ path: 'profiles/:username', alias: '/members' }
~~~~

**正确写法：**

~~~~ts
{ path: 'profiles/:username', alias: '/members/:username' }
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 六、从源码推导适用场景

:::steps
### 1. name map 把记录身份与 path ranking 分开

matcher 注册具名记录时维护唯一 name map；按 name resolve 会先取出指定 matcher，再用其参数 stringify 生成编码 path。需要稳定指向某条记录时使用 name；需要让地址按静态、动态等路径得分竞争时才传 path。

### 2. redirect 在守卫管线前产生新目标

router 先解析输入 location，再检查最终匹配记录的 redirect；存在 redirect 时会构造新 location 并重新进入导航入口。因此 redirect record 的 beforeEnter 不会执行，而目标记录守卫仍参与新的完整导航。

### 3. alias matcher 保留原记录关联

matcher 为 alias 建立可匹配的记录，并通过 aliasOf 关联原记录。地址解析仍保留 alias pathname，但组件、name 和记录行为来自原配置；这适合多个公开 URL 共享同一界面，而不是做地址规范化。

### 4. 嵌套 alias 沿用父子记录关系

matcher 归一化 children 时分别展开相对与绝对 alias；绝对 alias 可以脱离父 path 文本，但仍保留原记录的 parent 关系。若原 path 有参数，alias 必须携带同名参数，才能提供等价的解析输入。
:::

:::exercise
### 为旧用户地址选择 redirect 或 alias

**要求：** 产品要求 /u/\:username 继续出现在地址栏，但渲染 /directory/profiles/\:username 的同一界面；另一个 /old-users/\:username 必须规范化为新地址。分别写出配置并说明最终 URL。

**验收：** 完成题目要求。

**参考答案：** const routes = [
  {
    path: '/directory/profiles/\:username',
    name: 'profile-main',
    component: ProfilePage,
    alias: '/u/\:username',
  },
  {
    path: '/old-users/\:username',
    redirect: (to) =&gt; ({
      name: 'profile-main',
      params: { username: to.params.username },
    }),
  },
]
// /u/alice 最终仍显示 /u/alice。
// /old-users/alice 最终显示 /directory/profiles/alice。
:::

- [ ] 每个 route name 在整个 router 中唯一
- [ ] 需要 params 编码和稳定记录身份时使用 { name, params }
- [ ] redirect 负责 URL 替换，alias 负责 URL 保留
- [ ] 权限等守卫放在最终目标记录，而不是 redirect record
- [ ] nested absolute alias 保留原 path 的全部动态参数
