---
id: react.router.learn.basics.nav-link-state
type: lesson
title: NavLink 状态
summary: 用路由匹配结果标识当前导航项，并区分 active、pending 与过渡状态。
domain: frontend
technology: react
module: router
stage: basics
level: beginner
estimatedMinutes: 80
prerequisites:
  - react.router.learn.basics.link-navigation
related:
  - react.router.learn.basics.route-matching
  - react.router.learn.basics.data-router-introduction
tags:
  - React Router
  - NavLink
  - active
  - pending
  - aria-current
  - 导航状态
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-19
objectives:
  - 能根据是否需要导航状态，在 Link 与 NavLink 之间作出选择。
  - 能读取 isActive、isPending 和 isTransitioning 的准确含义。
  - 能通过默认类名或 className、style、children 回调呈现导航状态。
  - 能用 end 和 caseSensitive 控制 active 与 pending 的 pathname 匹配边界。
  - 能解释 active 链接的 aria-current 行为，并设计不只依赖颜色的状态反馈。
recap:
  - NavLink 在 Link 的导航能力上增加了面向目标 URL 的状态计算。
  - isActive 匹配当前 Location，isPending 匹配 Data Router 正在前往的 Location。
  - 字符串 className 保留自动状态类，函数式 className 则完全接管最终类名。
  - end 收紧 pathname 末尾匹配，caseSensitive 控制大小写，两者同时影响 active 和 pending。
  - active 链接默认获得 aria-current="page"，pending 链接不能冒充当前页面。
  - isTransitioning 只表示显式 View Transition，不等同于普通 pending 导航。
sources:
  - title: React Router 8.3.0 Release
    url: https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0
    sourceType: release-note
    appliesTo: React Router 8.3.0
    claims:
      - 8.3.0 是核验时的稳定发布版本。
  - title: npm react-router Latest Metadata
    url: https://registry.npmjs.org/react-router/latest
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - npm latest 端点在核验时返回 8.3.0。
  - title: React Router 8.3.0 NavLink
    url: https://reactrouter.com/8.3.0/api/components/NavLink
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - NavLink 提供 active、pending 与 transitioning 状态及对应属性。
      - end、caseSensitive 与 aria-current 的公开合同。
  - title: React Router 8.3.0 Data Mode Navigating
    url: https://reactrouter.com/8.3.0/start/data/navigating
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - Data Mode 与 Framework Mode 共享 NavLink 导航状态能力。
  - title: React Router 8.3.0 Navigating
    url: https://reactrouter.com/8.3.0/start/framework/navigating
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - NavLink 的默认状态类及 className、style、children 回调用法。
  - title: React Router v8 NavLinkRenderProps
    url: https://api.reactrouter.com/v8/types/react-router.NavLinkRenderProps.html
    sourceType: api-doc
    appliesTo: React Router 8.3.0
    claims:
      - NavLinkRenderProps 包含 isActive、isPending 与 isTransitioning。
  - title: React Router v8 NavLinkProps
    url: https://api.reactrouter.com/v8/interfaces/react-router.NavLinkProps.html
    sourceType: api-doc
    appliesTo: React Router 8.3.0
    claims:
      - className、style、children、end 和 caseSensitive 的公开类型。
  - title: React Router 8.3.0 NavLink Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/dom/lib.tsx#L1468-L1740
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 固定版本分别从当前 location 与 pending location 计算状态。
      - 固定版本处理路径段边界、自动类名、回调和 aria-current 的方式。
  - title: React Router 8.3.0 NavLink Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/dom/nav-link-active-test.tsx
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - 官方测试覆盖 active、pending、end、大小写、路径段边界和三类回调。
  - title: WAI-ARIA aria-current
    url: https://www.w3.org/TR/wai-aria-1.2/#aria-current
    sourceType: specification
    appliesTo: WAI-ARIA 1.2
    claims:
      - aria-current 用于指出一组相关元素中的当前项目。
  - title: React Router 8.3.0 createMemoryRouter
    url: https://reactrouter.com/8.3.0/api/data-routers/createMemoryRouter
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - createMemoryRouter 在内存中管理 location stack 并支持 Data Router 导航状态。
---

# NavLink 状态

## 一、学习目标

- 能解释 `NavLink` 比 `Link` 多解决了什么问题。
- 能区分 `isActive`、`isPending` 和 `isTransitioning`。
- 能使用自动状态类，以及 `className`、`style`、`children` 三种回调入口。
- 能用 `end` 和 `caseSensitive` 收紧匹配边界。
- 能检查 active 链接的 `aria-current`，并提供文字、形状或位置等非颜色反馈。

本课只讨论单个导航链接相对于当前地址和待进入地址的状态。应用级加载面板、全局导航进度、View
Transition 动画与滚动恢复不在这里展开。

## 二、为什么导航项需要路由状态

`Link` 已经可以生成真实 `href` 并发起客户端导航，但它不会直接告诉样式代码“这个目标是不是当前
页面”。导航栏通常还需要回答两个问题：

1. 哪个入口对应当前页面？
2. 用户点击后，哪个入口正在等待目标页面准备完成？

手工保存一个 `selectedKey` 很容易与 URL 分离：浏览器后退、直接输入地址或代码重定向都可能改变
location，却没有同步这份组件 State。`NavLink` 直接根据 Router 的 location 计算状态，因此 URL 仍是
事实来源：

```tsx
import { NavLink } from 'react-router'

<nav aria-label="课程导航">
  <NavLink to="/courses">课程</NavLink>
  <NavLink to="/progress">学习进度</NavLink>
</nav>
```

如果入口只需要导航、不需要当前或等待状态，继续使用 `Link` 即可。`NavLink` 不是所有链接的替代品。

## 三、核心概念

### 1. NavLink 是带状态的 Link

`NavLink` 最终仍渲染 anchor，保留链接的键盘操作、目标地址和新标签页能力。它额外解析 `to`，再把
链接目标与 Router 的 location 对照。

公开的状态对象为：

```ts
type NavLinkRenderProps = {
  isActive: boolean
  isPending: boolean
  isTransitioning: boolean
}
```

这三个布尔值描述不同问题，不是按顺序推进的单一状态机。

### 2. isActive 匹配当前 Location

当链接目标的 pathname 与当前 location 符合 NavLink 匹配规则时，`isActive` 为 `true`。例如当前地址
为 `/tasks` 时：

```tsx
<NavLink to="/tasks">任务</NavLink>
```

该链接处于 active。它表示“当前在哪里”，不是“刚刚点击了什么”。浏览器后退或代码导航到
`/tasks`，都会得到相同结果。

### 3. isPending 匹配待进入的 Location

Data Router 开始一次尚未完成的导航后，会有一个 pending location。如果某个 NavLink 的目标匹配这个
待进入地址，它的 `isPending` 为 `true`：

```text
当前 location: /tasks
待进入 location: /tasks/42

/tasks       -> isActive: true
/tasks/42    -> isPending: true
```

目标所需的 loader 完成后，current location 才变为 `/tasks/42`；此时详情链接不再 pending，而是
active。同步导航可能快到看不清 pending，因此观察该状态需要真实的异步导航工作，而不是在点击事件中
手工切换一个布尔值。

`isActive` 和 `isPending` 分别从两个 location 计算，不能假定全局只会有其中一个为 `true`。导航期间，
旧页面链接可以继续 active，目标链接同时 pending。

### 4. isTransitioning 只对应 View Transition

`isTransitioning` 表示一次前往该链接目标的 View Transition 正在执行。固定版本实现还要求当前使用
Data Router，并且该 NavLink 显式启用了 `viewTransition`：

```tsx
<NavLink to="/gallery" viewTransition>
  图库
</NavLink>
```

普通 Data Router 导航不会因为存在 `isPending` 就自动得到 `isTransitioning`。本课只识别这个边界，不
设计 View Transition 名称、伪元素或动画时序。

### 5. active 链接带有 aria-current

active NavLink 默认渲染 `aria-current="page"`；非 active 链接不渲染该属性：

```html
<a href="/tasks" class="active" aria-current="page">任务</a>
```

这让辅助技术能够识别一组导航入口中的当前页面。`aria-current` 不负责视觉样式，CSS 与可见状态文案
仍需由应用设计；pending 链接还不是当前页面，不应提前标成 current。

## 四、用法与示例

### 1. 使用默认状态类

当 `className` 是普通字符串或没有提供时，NavLink 会在这个字符串后自动追加适用的状态类：

```tsx
<NavLink className="app-nav-item" to="/tasks">
  任务
</NavLink>
```

可能得到：

```html
<a class="app-nav-item active" href="/tasks" aria-current="page">任务</a>
```

官方状态类是 `active`、`pending` 和 `transitioning`，可以直接用 CSS 选择：

```css
.app-nav-item.active {
  border-bottom-color: currentColor;
  font-weight: 700;
}

.app-nav-item.pending {
  opacity: 0.7;
}
```

默认类名适合所有导航项共享同一套状态表现的场景。

### 2. 用 className 回调组合业务类名

需要根据状态组合不同类名时，可以传函数：

```tsx
<NavLink
  to="/tasks/42"
  className={({ isActive, isPending }) =>
    [
      'task-link',
      isActive ? 'task-link-current' : '',
      isPending ? 'task-link-loading' : '',
    ]
      .filter(Boolean)
      .join(' ')
  }
>
  任务详情
</NavLink>
```

函数式 `className` 会完全接管最终类名。上例不会再由 NavLink 自动补上 `active` 或 `pending`；需要的
状态类必须由回调显式返回。

### 3. 用 style 回调处理少量动态值

`style` 也可以接收相同的状态对象：

```tsx
<NavLink
  to="/reports"
  style={({ isActive, isPending }) => ({
    fontWeight: isActive ? 700 : 500,
    opacity: isPending ? 0.65 : 1,
  })}
>
  报告
</NavLink>
```

少量、只属于当前元素的动态值可以这样写。需要 hover、focus、媒体查询或多条共享规则时，类名更容易
维护。

### 4. 用 children 回调改变可见内容

`children` 函数适合让状态文字与链接目标一起更新：

```tsx
<NavLink to="/tasks/42">
  {({ isActive, isPending }) => (
    <>
      <span>任务详情</span>
      <small>{isPending ? '正在加载' : isActive ? '当前页面' : '可前往'}</small>
    </>
  )}
</NavLink>
```

链接的可访问名称应保持稳定、可理解。不要让 pending 时只剩下没有文字替代的加载图标。

### 5. 用 end 限制到目标末尾

默认 `end={false}` 时，目标还可以作为完整路径段前缀匹配：

| NavLink                  | 当前 URL     | isActive |
| ------------------------ | ------------ | -------- |
| `to="/tasks"`           | `/tasks`     | `true`   |
| `to="/tasks"`           | `/tasks/42`  | `true`   |
| `to="/tasks" end`       | `/tasks`     | `true`   |
| `to="/tasks" end`       | `/tasks/42`  | `false`  |

```tsx
<NavLink to="/tasks" end>
  任务列表
</NavLink>
```

`end` 同时收紧 active 和 pending 的匹配。根目标 `/` 是特例：为了避免所有 pathname 都以 `/` 开头，
它默认只在根地址匹配。

### 6. 路径前缀必须落在路径段边界

不使用 `end` 也不等于任意字符串前缀匹配：

```text
目标 /user + 当前 /user/profile      -> active
目标 /user + 当前 /user-preferences  -> inactive
```

`/user/profile` 在 `/user` 后是 `/`，属于后续路径段；`/user-preferences` 在同一段里继续拼接，因此
不会误命中。

### 7. 用 caseSensitive 控制大小写

默认匹配不区分 pathname 大小写。只有业务地址确实区分大小写时才启用：

```tsx
<NavLink to="/Reports">默认不区分大小写</NavLink>
<NavLink to="/Reports" caseSensitive>
  严格匹配大小写
</NavLink>
```

当前地址为 `/reports` 时，第一个链接 active，第二个链接 inactive。`caseSensitive` 也会应用到 pending
目标的判断。

### 8. 匹配关注 pathname

固定版本的 NavLink 状态实现比较解析后的 pathname。目标中的 search 与 hash 仍会构成导航地址，但不
会让同一 pathname 下的导航项自动变成不同的 active 分组：

```tsx
<NavLink to="/reports?range=week">周报</NavLink>
<NavLink to="/reports?range=month">月报</NavLink>
```

在 `/reports?range=week` 中，两者的 pathname 都是 `/reports`。如果导航需要按查询条件区分选中项，必须
把查询状态作为单独的 URL 状态读取和比较，不能只依赖 NavLink 的 `isActive`。

## 五、观察 active 与 pending

下面的 Demo 使用 `createMemoryRouter` 和真实 `NavLink`。它把路由限制在 Demo 内，外层学习站仍由 Vue
Router 管理。

初始页面是 `/tasks`。点击“任务详情”后，目标 route 的短 loader 会让详情链接先显示 pending；loader
完成后，详情链接变为 active 并自动得到 `aria-current="page"`。任务列表链接使用 `end`，因此详情页
不会继续把它标为 active。

:::demo{id="react.router.learn.basics.nav-link-state.state-observer-demo"}
:::

观察时可以检查：

1. 初始“任务列表”带有 `active` 类和 `aria-current="page"`。
2. 点击详情后，当前任务列表仍 active，详情链接暂时带有 `pending` 类并显示“正在加载”。
3. 加载完成后，详情链接变为 active；任务列表因 `end` 变为 inactive。
4. 内存地址改变，但“宿主初始地址”和“宿主当前地址”始终相同。

## 六、易错使用提示

:::pitfalls
### 错误：另外保存 selectedKey 模拟当前导航项

**触发条件：** 点击导航时调用 `setSelectedKey()`，再用组件 State 决定哪个入口高亮。

**原因：** 这份 State 与 Router location 是两个事实来源。

**后果：** 后退、刷新、深链或代码导航后，视觉选中项可能与 URL 不一致。

**错误示例：**

```tsx
const [selectedKey, setSelectedKey] = useState('tasks')

<Link to="/reports" onClick={() => setSelectedKey('reports')}>
  报告
</Link>
```

**正确写法：**

```tsx
<NavLink to="/reports">报告</NavLink>
```

**验证方式：** 直接打开 `/reports`，再执行后退；当前项应始终跟随 URL。

### 错误：把默认前缀匹配当成精确匹配

**触发条件：** 希望 `/tasks` 只在任务列表 active，却没有传 `end`。

**原因：** 默认匹配允许后续完整路径段。

**后果：** 进入 `/tasks/42` 后，任务列表入口仍显示为当前页。

**错误示例：**

```tsx
<NavLink to="/tasks">任务列表</NavLink>
```

**正确写法：**

```tsx
<NavLink to="/tasks" end>
  任务列表
</NavLink>
```

**验证方式：** 分别打开 `/tasks` 与 `/tasks/42`，检查两个地址下的 `active` 类和
`aria-current`。

### 错误：函数式 className 仍期待自动状态类

**触发条件：** `className` 改为回调，但回调只返回基础类名。

**原因：** 函数式 `className` 会接管最终结果，固定版本不会再追加默认状态类。

**后果：** `.active` 和 `.pending` 规则永远无法命中。

**错误示例：**

```tsx
<NavLink to="/tasks" className={() => 'nav-item'}>
  任务
</NavLink>
```

**正确写法：**

```tsx
<NavLink
  to="/tasks"
  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
>
  任务
</NavLink>
```

**验证方式：** 打开目标地址并检查 anchor 的最终 `class` 属性。

### 错误：把 pending 当成当前页面

**触发条件：** 目标 loader 尚未完成时，手工给 pending 链接设置 `aria-current="page"`。

**原因：** pending 描述待进入 location，当前 location 尚未提交。

**后果：** 辅助技术会把尚未到达的目标宣告为当前页面。

**错误示例：**

```tsx
<NavLink to="/tasks/42">
  {({ isPending }) => <span aria-current={isPending ? 'page' : undefined}>详情</span>}
</NavLink>
```

**正确写法：**

```tsx
<NavLink to="/tasks/42">
  {({ isPending }) => <span>{isPending ? '详情正在加载' : '任务详情'}</span>}
</NavLink>
```

**验证方式：** 导航未完成时检查 pending anchor；它不应具有 `aria-current`，完成后才由 NavLink
自动添加。

### 错误：假设 active 与 pending 必然互斥

**触发条件：** 用 `isActive ? ... : isPending ? ...` 表达整个导航栏的唯一全局状态。

**原因：** 两个值分别匹配 current location 和 pending location。

**后果：** 从当前页进入另一个页面时，旧入口和目标入口的反馈无法同时正确呈现。

**错误示例：**

```tsx
const label = isActive ? '当前' : isPending ? '加载中' : '可前往'
```

**正确写法：**

```tsx
const classes = [
  isActive ? 'is-active' : '',
  isPending ? 'is-pending' : '',
]
  .filter(Boolean)
  .join(' ')
```

**验证方式：** 导航到一个带短 loader 的目标页面，并在目标 loader 完成前分别检查旧链接和目标链接的状态。

### 错误：只用颜色表达当前与等待状态

**触发条件：** active 只变色，pending 只降低透明度，没有其他可见提示。

**原因：** 颜色差异可能不足以被低视力或色觉差异用户识别。

**后果：** 用户难以确认当前位置或导航是否仍在处理。

**错误示例：**

```css
.active {
  color: green;
}
```

**正确写法：**

```tsx
<NavLink to="/tasks">
  {({ isActive, isPending }) => (
    <span>{isPending ? '任务（正在加载）' : isActive ? '任务（当前）' : '任务'}</span>
  )}
</NavLink>
```

**验证方式：** 在灰度模式和键盘操作下确认状态仍可辨认，并检查 active anchor 的
`aria-current="page"`。
:::

## 七、源码推导与适用场景

### 1. 状态来自两个 location

**官方事实：** 固定版本实现通过 `useLocation()` 读取当前 pathname，并从 Data Router state 读取导航
中的下一个 pathname；随后分别计算 `isActive` 和 `isPending`。

**课程推导：** 导航项应该消费 Router 已有状态，不需要再创建一份“当前菜单” State。带真实 loader
的 Data Router 才能提供有意义的 pending 观察窗口。

**边界：** 这是对 React Router 8.3.0 固定源码的解释。应用只依赖公开的三个布尔值，不依赖内部
Context 名称或比较函数位置。

### 2. 匹配遵守路径段边界

**官方事实：** 固定版本先处理大小写，再比较完整 pathname；未启用 `end` 时，前缀之后还必须是 `/`
边界。官方测试覆盖 `/user` 不匹配 `/user-preferences`。

**课程推导：** Section 入口可以保留默认前缀匹配；只代表单个叶子页面的入口使用 `end` 更准确。

**边界：** NavLink 的目标匹配不代替 Route Object 的完整路由匹配设计，也不负责查询参数选项卡。

### 3. 默认类名和回调是两种所有权

**官方事实：** `className` 不是函数时，固定版本会组合原始类名与 `active`、`pending`、
`transitioning`；它是函数时，最终类名只取回调结果。`style` 与函数式 `children` 也接收同一份
`NavLinkRenderProps`。

**课程推导：** 统一导航系统优先使用默认类名；只有业务命名或组合条件确实需要时才接管回调，避免
两套状态命名并存。

**边界：** 自动类名是公开文档行为，但具体 DOM 拼装过程仍可能调整；不要读取 React Router 内部
Context 来复制实现。

### 4. aria-current 属于当前项语义

**官方事实：** 固定版本只在 `isActive` 为 `true` 时把 `aria-current` 写给底层 Link，默认 token 为
`page`。WAI-ARIA 用该属性指出一组相关元素中的当前项目。

**课程推导：** 保留 NavLink 的 anchor 与自动 current 语义，再增加清晰的可见状态，通常比把导航项
改成按钮或点击容器更稳妥。

**边界：** `aria-current` 不会自动管理页面标题、主内容焦点或导航公告，这些是完整单页应用可访问性
设计的一部分。

### 5. 何时使用 NavLink

适合使用 NavLink：

- 主导航、侧边栏和分区入口需要标识当前目标。
- Data Router 导航需要在目标链接附近显示等待反馈。
- 导航状态必须随深链、后退和代码导航保持一致。

继续使用 Link：

- 正文中的普通站内链接不需要 active 或 pending 样式。
- 操作只负责前往一个目标，不属于持续展示的导航集合。

使用普通 anchor：

- 目标不属于当前 Router，或明确要求完整文档导航。

## 八、练习

:::exercise
### 练习目标

**要求：** 为课程后台编写包含“概览”“学生”“设置”三个真实 `NavLink` 的导航栏，基础类名为
`course-nav-item`；让“概览”只在 `/course` active，“学生”在目标 loader 执行期间显示
“学生（正在加载）”，并让 active 项显示“当前”文字。最后把一个 `className` 改成函数，解释默认
`active` 类是否还会自动出现。

**验收：** `/course` 与 `/course/students` 只各有一个 active 项；active anchor 自动具有
`aria-current="page"`，pending-only anchor 没有该属性；状态不只依赖颜色；函数式 `className` 显式
返回所需状态类。
:::

## 九、本节小结

- `NavLink` 保留 Link 的 anchor 与导航能力，并增加目标匹配状态。
- `isActive` 对应当前 location；`isPending` 对应 Data Router 的待进入 location。
- `isTransitioning` 只描述显式 View Transition，不是 pending 的别名。
- 默认类名适合统一样式，函数式 `className`、`style`、`children` 适合定制状态表现。
- `end` 控制末尾边界，`caseSensitive` 控制大小写，两者同时影响 active 与 pending。
- active 链接默认具有 `aria-current="page"`；可见状态还应提供非颜色线索。

## 十、参考资料

- [React Router 8.3.0 Release](https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0) - 稳定发布事实。
- [npm react-router Latest Metadata](https://registry.npmjs.org/react-router/latest) - npm latest 版本元数据。
- [React Router 8.3.0 NavLink](https://reactrouter.com/8.3.0/api/components/NavLink) - 状态、属性与 aria-current 合同。
- [React Router 8.3.0 Data Mode Navigating](https://reactrouter.com/8.3.0/start/data/navigating) - Data Mode 导航入口。
- [React Router 8.3.0 Navigating](https://reactrouter.com/8.3.0/start/framework/navigating) - 默认状态类与三类回调。
- [React Router v8 NavLinkRenderProps](https://api.reactrouter.com/v8/types/react-router.NavLinkRenderProps.html) - 三个状态字段的公开类型。
- [React Router v8 NavLinkProps](https://api.reactrouter.com/v8/interfaces/react-router.NavLinkProps.html) - 回调、end 与 caseSensitive 类型。
- [React Router 8.3.0 NavLink Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/dom/lib.tsx#L1468-L1740) - 固定版本的状态计算和输出路径。
- [React Router 8.3.0 NavLink Tests](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/dom/nav-link-active-test.tsx) - 匹配边界与状态回调测试。
- [WAI-ARIA aria-current](https://www.w3.org/TR/wai-aria-1.2/#aria-current) - 当前项目语义。
- [React Router 8.3.0 createMemoryRouter](https://reactrouter.com/8.3.0/api/data-routers/createMemoryRouter) - 内存 Data Router 合同。
