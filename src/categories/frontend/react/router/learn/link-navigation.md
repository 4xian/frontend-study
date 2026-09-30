---
id: react.router.learn.basics.link-navigation
type: lesson
title: Link 导航
summary: 使用真实链接完成客户端路由导航，并正确选择目标、历史记录与文档导航行为。
domain: frontend
technology: react
module: router
stage: basics
level: beginner
estimatedMinutes: 75
prerequisites:
  - react.router.learn.basics.route-matching
related:
  - react.router.learn.basics.data-router-introduction
  - react.router.learn.basics.route-objects
tags:
  - React Router
  - Link
  - 客户端导航
  - History
  - 可访问性
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-19
objectives:
  - 能说明 Link 为什么既是标准链接，又能在路由内完成客户端导航。
  - 能用字符串或 Partial<Path> 对象声明 to，并区分根路径目标与相对目标。
  - 能预测普通导航、replace 导航和后退操作对当前 history entry 的影响。
  - 能判断 state、reloadDocument 与 preventScrollReset 的适用边界。
  - 能为站内页面、外部资源和非导航操作选择正确的 HTML 或 React Router 控件。
recap:
  - Link 渲染真实 anchor，并只在合适的普通点击中把文档导航交给当前 Router。
  - to 接收字符串或 Partial<Path>，相对目标由 route 上下文解析，不是 pathname 字符串拼接。
  - 不同目标默认新增 history entry；replace 只替换当前 entry，同目标还有固定版本自动 replace 例外。
  - state 不进入 URL且服务端不可访问，必须可分享或恢复的信息应放在 path 或 search 中。
  - reloadDocument 恢复浏览器文档导航，preventScrollReset 则依赖 ScrollRestoration。
sources:
  - title: React Router 8.3.0 Release
    url: https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0
    sourceType: release-note
    appliesTo: React Router 8.3.0
    claims:
      - 8.3.0 是核验时的稳定发布版本。
  - title: React Router 8.3.0 Link
    url: https://reactrouter.com/8.3.0/api/components/Link
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - Link 是渐进增强的 anchor 包装器。
      - relative、replace、state、reloadDocument、preventScrollReset 与 viewTransition 的公开合同。
  - title: React Router v8 LinkProps
    url: https://api.reactrouter.com/v8/interfaces/react-router.LinkProps.html
    sourceType: api-doc
    appliesTo: React Router 8.3.0
    claims:
      - LinkProps 继承 anchor 属性但用 to 代替 href。
      - Link 各导航属性的公开类型和默认边界。
  - title: React Router v8 To
    url: https://api.reactrouter.com/v8/types/react-router.To.html
    sourceType: api-doc
    appliesTo: React Router 8.3.0
    claims:
      - To 的公开类型是 string 或 Partial<Path>。
  - title: React Router v8 Path
    url: https://api.reactrouter.com/v8/interfaces/react-router.Path.html
    sourceType: api-doc
    appliesTo: React Router 8.3.0
    claims:
      - Path 由 pathname、search 和 hash 组成。
  - title: React Router 8.3.0 Accessibility
    url: https://reactrouter.com/8.3.0/how-to/accessibility
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - Link 渲染标准 anchor 并保留原生链接语义。
      - 客户端路由仍需在应用层另行设计焦点和导航公告。
  - title: React Router 8.3.0 createMemoryRouter
    url: https://reactrouter.com/8.3.0/api/data-routers/createMemoryRouter
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - createMemoryRouter 在内存中管理 location stack 并支持 initialEntries。
  - title: React Router 8.3.0 Link Source
    url: https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/lib/dom/lib.tsx
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - Link 渲染 anchor，并在适用时使用路由点击处理器。
      - 同目标导航在未显式指定 replace 时会自动替换当前 entry。
  - title: React Router 8.3.0 DOM Click Source
    url: https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/lib/dom/dom.ts
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 路由点击处理只接管未修饰的主按钮当前窗口点击。
  - title: React Router 8.3.0 Link Href Tests
    url: https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/__tests__/dom/link-href-test.tsx
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 字符串、对象、相对目标与外部 URL 会生成对应 href。
  - title: React Router 8.3.0 Link Push Tests
    url: https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/__tests__/dom/link-push-test.tsx
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 不同目标默认 push，同目标默认 replace，显式 replace 会改变 history 写入方式。
  - title: React Router 8.3.0 Link Click Tests
    url: https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/__tests__/dom/link-click-test.tsx
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 修饰键、非主按钮、新窗口、外部 URL 和 reloadDocument 不按普通站内点击接管。
  - title: React Router 8.3.0 ScrollRestoration
    url: https://reactrouter.com/8.3.0/api/components/ScrollRestoration
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - preventScrollReset 的效果以应用使用 ScrollRestoration 为前提。
---

# Link 导航

## 一、学习目标

- 能解释 `Link` 与普通 `<a href>` 的共同点，以及 React Router 在什么点击条件下接管导航。
- 能使用字符串和对象两种 `to`，并从渲染结果中检查真实 `href`。
- 能区分 Router 根路径目标、简单相对目标和外部绝对 URL。
- 能预测 push、`replace` 与后退一次形成的 history 结果。
- 能为 `state`、`reloadDocument` 和 `preventScrollReset` 选择合适场景。

本课只学习用户通过链接发起的导航。当前页状态、编程式导航、Location 读取、查询参数管理与滚动恢复
都有独立知识点，这里只划清接口边界。

## 二、为什么路由导航仍然需要真实链接

网页中的链接不只是“点击后执行一段代码”。浏览器和辅助技术认识 `<a href>`，因此用户可以用键盘
激活、查看目标地址、在新标签页打开，或者把地址复制给别人。

如果把站内页面入口写成点击容器：

```tsx
<div onClick={() => openCourse()}>React Router 课程</div>
```

这个元素没有链接角色，也没有浏览器可检查的目标地址。`Link` 同时保留链接语义和客户端路由体验：

```tsx
import { Link } from 'react-router'

<Link to="/courses/react-router">React Router 课程</Link>
```

浏览器最终仍会看到一个带 `href` 的 anchor。普通站内点击由 Router 接管，不需要重新下载整份 HTML
文档；不适合接管的点击仍按浏览器原生规则处理。

## 三、Link 的核心模型

### 1. Link 渲染真实 anchor

`LinkProps` 继承大部分 anchor 属性，但用必填的 `to` 描述目标，不让调用方直接填写 `href`：

```tsx
<Link to="/courses" title="查看全部课程">
  全部课程
</Link>
```

渲染后，关键结构仍是：

```html
<a href="/courses" title="查看全部课程">全部课程</a>
```

因此链接文字应直接说明目的地。只写“点击这里”会让脱离上下文阅读链接的人难以判断将去往哪里。

### 2. Router 只接管合适的点击

React Router 8.3.0 的固定源码只在下列条件成立时执行客户端导航：

- 鼠标主按钮点击。
- 没有按下 Ctrl、Command、Alt 或 Shift 等修饰键。
- 链接目标是当前窗口。
- 目标属于可由当前 Router 处理的站内地址。
- 事件没有先被调用方阻止。

因此，Command/Control + 点击、新窗口链接、跨域地址和右键菜单仍可使用浏览器能力。`Link` 不是
对 anchor 的替代，而是在保留 anchor 的基础上渐进增强站内导航。

### 3. Link、普通 anchor 与按钮的选择

| 用户意图                         | 应使用的控件                 |
| -------------------------------- | ---------------------------- |
| 打开当前 Router 内的页面         | `<Link to="...">`           |
| 打开外部站点或下载文件           | `<a href="...">`            |
| 明确要求浏览器重新加载目标文档   | 普通 anchor 或 `reloadDocument` |
| 提交、删除、展开等当前页面操作   | `<button type="button">`    |

程序在没有用户链接交互时主动跳转，不属于这张表中的 Link 用法，应交给后续的编程式导航能力。

## 四、用 to 描述目标

### 1. 字符串目标

`To` 的公开类型是：

```ts
type To = string | Partial<Path>
```

最常用形式是字符串：

```tsx
<Link to="/courses">课程目录</Link>
<Link to="details">课程详情</Link>
```

以 `/` 开头的 `/courses` 从 Router 根路径解析。`details` 没有以 `/` 开头，会在当前 route 上下文中
解析。两者都会先生成真实 `href`，再由 Link 决定点击时是否使用客户端导航。

### 2. 对象目标

`Partial<Path>` 可以把一个目标拆成 `pathname`、`search` 和 `hash`：

```tsx
<Link
  to={{
    pathname: '/courses/react-router',
    search: '?section=navigation',
    hash: '#link',
  }}
>
  打开 Link 章节
</Link>
```

生成的目标是：

```text
/courses/react-router?section=navigation#link
```

对象字段都是可选的，不要求每次填写完整三个部分。这里用完整对象观察 URL 组成，但不读取、解析或
更新查询参数状态。

### 3. 相对目标不是字符串拼接

`to="details"`、`to="."` 和 `to=".."` 都是相对目标。默认的 `relative="route"` 按 route 上下文
解析；`relative="path"` 才让 `..` 按 URL 路径段向上移动。

```tsx
<Link to="..">返回父路由</Link>
<Link to=".." relative="path">
  返回上一级路径
</Link>
```

在最简单的 route 中，两种结果可能相同；当一个 route pattern、无 path 的布局 route 或通配段跨越
多个 URL 段时，结果可能不同。本课只使用 `to="details"` 观察简单相对目标，完整层级行为在对应路由
结构课程中再验证。

“Router 根路径绝对目标”也不等于外部绝对 URL：

```tsx
<Link to="/courses">Router 根路径目标</Link>
<a href="https://example.com/courses">外部绝对 URL</a>
```

跨域 URL 会交给浏览器执行文档导航，不应被描述为当前 Router 内的页面切换。

## 五、push、replace 与后退

### 1. 不同目标默认新增 entry

当目标与当前位置不同且没有指定 `replace` 时，普通 Link 导航通常向 history 加入一个 entry：

```text
/catalog -> /catalog/details
```

此时后退一次会回到 `/catalog`。在 `createMemoryRouter` 中，这些 entry 只存在内存里；在浏览器路由中，
相同概念会体现在浏览器的当前会话历史中。

### 2. replace 只替换当前 entry

确认页、登录回跳等流程有时不希望保留中间页面，可以显式替换当前 entry：

```tsx
<Link to="/catalog/receipt" replace>
  完成并查看结果
</Link>
```

假设先从 A 普通导航到 B，再从 B replace 到 C：

```text
导航前：A -> B
替换后：A -> C
后退一次：A
```

`replace` 没有清空整个 history，只替换当时的 B。A 和更早的 entry 仍然存在。

### 3. 同目标是固定版本例外

“不写 `replace` 就一定 push”并不准确。React Router 8.3.0 的 `useLinkClickHandler` 会比较目标与当前
location；当调用方没有显式指定 `replace` 且两者相同时，它会自动使用 replace，避免重复加入完全相同
的 entry。

这是固定版本的可观察行为。应用需要强制选择时应显式传入布尔值；完整的 PUSH、REPLACE、POP 与
Location 模型不在本课展开。

## 六、用 state 附加导航上下文

`state` 可以把客户端上下文关联到目标 history entry：

```tsx
<Link to="/receipt" state={{ from: '课程详情' }}>
  查看结果
</Link>
```

需要同时记住三个边界：

1. `state` 不会出现在地址栏中，复制 URL 不会把它一起分享。
2. 它建立在 `history.state` 上，服务端无法读取。
3. 它不是数据库、缓存或持久化配置的替代品。

订单 ID、筛选条件或任何必须被分享和恢复的信息，应优先进入 path 或 search。`state` 更适合非关键的
来源提示等导航上下文。本课只写入 state；如何从 Location 读取以及刷新后的完整行为留给 Location 与
历史状态课程。

## 七、文档导航与滚动边界

### 1. reloadDocument 交还浏览器处理权

有些站内地址明确需要整页导航，例如由服务器完成会话切换的入口：

```tsx
<Link to="/logout" reloadDocument>
  退出当前会话
</Link>
```

设置 `reloadDocument` 后，Link 不再拦截这次点击，浏览器会像处理普通 `<a href>` 一样请求文档。
如果目标本来就是外部站点或下载资源，直接使用语义明确的普通 anchor 通常更简单。

嵌入式 Demo 不提供可点击的 `reloadDocument` 案例，因为它会离开或刷新承载 Demo 的学习站页面。

### 2. preventScrollReset 依赖 ScrollRestoration

`preventScrollReset` 只在应用使用 `ScrollRestoration` 时阻止新 location 导航完成后的顶部重置：

```tsx
<Link to="?tab=details" preventScrollReset>
  查看详情标签
</Link>
```

它不会单独建立滚动位置存储，也不会阻止浏览器在前进或后退时恢复已经保存的位置。滚动位置的保存
键、恢复策略和真实页面验证属于后续滚动恢复课程。

### 3. 其他 Link 能力的课程边界

React Router 8.3.0 的 Link 还公开了路由发现、预取和 View Transition 相关属性：

- `discover` 与 `prefetch` 依赖 Framework Mode 的路由发现或模块数据语境，不进入当前 Data Mode 基础课。
- `viewTransition` 是稳定能力，但它的状态、CSS 和动画将在专门的 View Transition 课程学习。
- 需要当前页或等待态样式时应选择状态链接组件，具体状态合同属于下一知识点。

这些字段存在于公开类型中，不代表应该在一个基础 Link 中同时开启。

## 八、运行 Demo

下面的同源 Demo 使用 `createMemoryRouter`，因此 Link 只改变嵌入区域里的内存 location，不改变外层
学习站地址。

按顺序操作：

1. 在 `/catalog` 检查“打开课程详情”是可聚焦且带真实 `href` 的链接。
2. 激活相对字符串 Link，进入 `/catalog/details`。
3. 激活带对象 `to`、`replace` 和小型 `state` 的 Link，进入带 search/hash 的结果页。
4. 点击“后退一次（Demo 验证）”，结果应直接回到 `/catalog`。

如果后退后出现 `/catalog/details`，说明中间 entry 没有被 replace。每个页面还会同时显示 Demo 的内存
地址和宿主地址，方便确认两套路由彼此隔离。

:::demo{id="react.router.learn.basics.link-navigation.history-demo"}
按顺序观察相对 Link、replace Link 与后退一次的内存 history 结果
:::

## 九、易错使用提示

:::pitfalls
### 错误：用可点击容器伪造页面链接

**触发条件：** 用 `div onClick` 或普通按钮打开另一个路由页面。

**原因：** 忽略 Link 最终提供的标准 anchor、真实 `href` 和浏览器链接行为。

**后果：** 用户失去链接角色、目标预览、键盘激活和在新标签页打开等原生能力。

**错误示例：**

```tsx
<div onClick={openCourses}>课程列表</div>
```

**正确写法：**

```tsx
<Link to="/courses">课程列表</Link>
```

**验证方式：** 在元素检查器中确认结果是带 `href` 的 anchor，再用 Tab 和 Enter 完成导航。

### 错误：用 Link 表达非导航操作

**触发条件：** 用 `to="#"` 的 Link 执行删除、提交或展开面板。

**原因：** 把“动作”和“前往资源”混成同一种用户意图。

**后果：** 地址与历史记录可能被无意义地改变，控件角色也会误导辅助技术。

**错误示例：**

```tsx
<Link to="#" onClick={deleteDraft}>删除草稿</Link>
```

**正确写法：**

```tsx
<button type="button" onClick={deleteDraft}>删除草稿</button>
```

**验证方式：** 判断操作完成后是否应该得到一个可复制、可打开的新地址；如果不是，就不应伪装成链接。

### 错误：把相对 to 当作 pathname 字符串拼接

**触发条件：** 用当前字符串加 `'/details'` 模拟相对导航，或假定 `..` 总是删除一个 URL 段。

**原因：** 相对目标默认依据 route 上下文解析，复杂 route 与 pathname 字符串并不总是一一对应。

**后果：** 布局 route、多段 pattern 或通配 route 中可能得到错误地址。

**错误示例：**

```tsx
<a href={`${window.location.pathname}/details`}>详情</a>
```

**正确写法：**

```tsx
<Link to="details">详情</Link>
```

**验证方式：** 检查 Link 渲染的 `href`，并在引入 route 层级后分别验证默认 `route` 与 `path` 语义。

### 错误：认为不写 replace 就永远是 push

**触发条件：** 预测任意无 `replace` Link 都会增加 history entry。

**原因：** 8.3.0 对同目标导航有自动 replace 例外。

**后果：** 对重复点击当前链接后的后退结果作出错误判断。

**错误示例：**

```tsx
// 错误结论：每次点击都会新增 entry
<Link to=".">刷新当前视图</Link>
```

**正确写法：**

```tsx
// 只把“不同目标默认 push”作为常规判断
<Link to="details">打开详情</Link>
```

**验证方式：** 分别验证不同目标、同目标和显式 `replace={false}`，不要从一个案例外推全部行为。

### 错误：把 replace 理解为清空历史

**触发条件：** 认为 A -> B 后 replace 到 C 会只剩 C。

**原因：** replace 修改的是当前索引处的 B，不会删除 B 之前的所有 entry。

**后果：** 登录、确认页或向导的后退流程与设计预期不一致。

**错误示例：**

```tsx
// 错误预期：用户从此无法回到 A
<Link to="/result" replace>查看结果</Link>
```

**正确写法：**

```text
A -> B，B replace 为 C，最终 history 是 A -> C
```

**验证方式：** 完成 push -> replace 后只后退一次，结果应回到 A。

### 错误：把 state 当作可分享或服务端可见的数据

**触发条件：** 只把资源 ID、筛选条件或恢复页面所需信息放进 `state`。

**原因：** state 不编码进 URL，并建立在客户端 `history.state` 上。

**后果：** 复制地址、直接打开或服务端处理时缺少关键上下文。

**错误示例：**

```tsx
<Link to="/order" state={{ orderId }}>查看订单</Link>
```

**正确写法：**

```tsx
<Link to={`/orders/${orderId}`} state={{ from: '订单列表' }}>查看订单</Link>
```

**验证方式：** 复制目标地址到新标签页；资源身份仍应由 URL 本身表达。

### 错误：以为 preventScrollReset 单独实现滚动恢复

**触发条件：** 应用没有 `ScrollRestoration`，却期望只加 prop 就保存所有滚动位置。

**原因：** 该 prop 只调整 ScrollRestoration 对新 location 的顶部重置行为。

**后果：** 属性没有预期效果，也无法得到完整的前进/后退恢复策略。

**错误示例：**

```tsx
// 错误结论：这个 prop 会独立保存全部滚动位置
<Link to="?tab=two" preventScrollReset>标签二</Link>
```

**正确写法：**

```tsx
// 先建立 ScrollRestoration，再按导航意图选择该 prop
<Link to="?tab=two" preventScrollReset>标签二</Link>
```

**验证方式：** 在真实启用 ScrollRestoration 的页面分别验证新导航和前进/后退，不能用普通 SPA smoke 替代。

### 错误：在嵌入式 Demo 中点击 reloadDocument

**触发条件：** 为演示 prop，在 memory router Demo 中放置可点击的文档导航链接。

**原因：** reloadDocument 明确把点击交还给浏览器，不再局限于内存 Router。

**后果：** 外层学习站可能被刷新或离开，Demo 隔离失效。

**错误示例：**

```tsx
<Link to="/logout" reloadDocument>在 Demo 中测试退出</Link>
```

**正确写法：**

```tsx
// 只在独立应用的真实文档导航入口使用
<Link to="/logout" reloadDocument>退出当前会话</Link>
```

**验证方式：** 在匹配的独立应用环境检查文档请求；嵌入式教学 Demo 只展示代码和行为边界。
:::

## 十、源码推导与适用场景

### 1. anchor 与点击接管是两层能力

**官方事实：** React Router 8.3.0 的 Link 源码先解析目标并渲染 anchor；当目标与点击条件适合客户端
路由时，再把内部点击处理器交给 anchor。DOM 点击判断排除了非主按钮、修饰键和非当前窗口目标。

**课程推导：** 路由入口应先满足“这是一个链接”的语义，再获得客户端切换优化。测试时既要检查
`href`，也要检查普通点击是否没有触发整页文档请求。

**边界：** 客户端切换不会自动解决导航后的焦点移动与页面公告。完整客户端路由可访问性仍需在应用层
单独设计。

### 2. history 写入方式取决于目标和 replace

**官方事实：** 固定版本源码与官方测试表明，不同目标默认 push；显式 `replace` 会替换当前 entry；未
显式指定时，同目标会自动 replace。

**课程推导：** 先按用户后退预期选择是否保留当前页面，再决定是否加 `replace`。对重要流程，应使用
push -> replace -> back 的可观察序列验证，而不是只检查最终页面。

**边界：** 这里不把内部比较过程或 history 实现细节当成跨版本承诺。升级 React Router 时，应重新核对
同目标这一固定版本行为。

### 3. state 只适合非关键客户端上下文

**官方事实：** Link 的 state 被写入目标 location 对应的 `history.state`，不会进入 URL，服务端无法访问。

**课程推导：** 必须可分享、可直接打开或参与服务端处理的信息应由 path/search 表达；state 可以补充
“从哪个列表进入”等非关键上下文。

**边界：** 本课只验证写入语法，不读取 state，也不承诺它能替代持久化存储。

## 十一、练习

:::exercise

### 为导航意图选择正确控件

**要求：** 为课程目录写三个控件：一个进入站内详情的 Link、一个打开官方文档的普通 anchor，以及
一个收藏课程的按钮。解释为什么三者不能统一写成 `div onClick`。

**验收：** 三个控件分别保留站内链接、外部链接与页面操作的正确语义，并能通过键盘使用。

:::

:::exercise

### 预测 replace 后的历史记录

**要求：** 从 A 普通导航到 B，再从 B 使用 `replace` 进入 C。先写出你预测的 history，再执行一次后退
验证结果。补充说明如果 B 到 C 没有 `replace`，同一次后退会出现什么页面。

**验收：** replace 流程后退到 A，普通 push 流程后退到 B；解释中不把 replace 描述为清空历史。

:::

:::exercise

### 对比字符串与对象目标

**要求：** 把一个同时包含 `pathname`、`search` 和 `hash` 的对象 `to` 改写成字符串目标，并检查两种
写法生成的 `href` 是否一致。不要在练习中读取查询参数或 location state。

**验收：** 两种写法得到相同 `href`，并能分别指出 pathname、search 和 hash 的位置。

:::

## 十二、本节小结

- `Link` 是带真实 `href` 的标准链接，并在合适的站内普通点击中启用客户端导航。
- `to` 接收字符串或 `Partial<Path>`；相对目标按 route 上下文解析，不是 pathname 拼接。
- 不同目标默认新增 entry，`replace` 只替换当前 entry，同目标还存在 8.3.0 的自动 replace 例外。
- `state` 不进入 URL且服务端不可见，关键身份和可分享状态应放在 path 或 search。
- `reloadDocument` 交还浏览器处理；`preventScrollReset` 只有在使用 ScrollRestoration 时才有对应作用。

## 十三、参考资料

- [React Router 8.3.0 Release](https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0) - 核验稳定版本身份。
- [React Router 8.3.0 Link](https://reactrouter.com/8.3.0/api/components/Link) - Link 定位和公开属性合同。
- [React Router v8 LinkProps](https://api.reactrouter.com/v8/interfaces/react-router.LinkProps.html) - LinkProps 精确类型。
- [React Router v8 To](https://api.reactrouter.com/v8/types/react-router.To.html) - 字符串与 `Partial<Path>` 联合。
- [React Router v8 Path](https://api.reactrouter.com/v8/interfaces/react-router.Path.html) - pathname、search 与 hash。
- [React Router 8.3.0 Accessibility](https://reactrouter.com/8.3.0/how-to/accessibility) - anchor 语义与客户端路由可访问性边界。
- [React Router 8.3.0 createMemoryRouter](https://reactrouter.com/8.3.0/api/data-routers/createMemoryRouter) - 内存 location stack 与初始 entry。
- [React Router 8.3.0 Link Source](https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/lib/dom/lib.tsx) - anchor 渲染、点击接管和 replace 选择。
- [React Router 8.3.0 DOM Click Source](https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/lib/dom/dom.ts) - 普通点击接管条件。
- [React Router 8.3.0 Link Href Tests](https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/__tests__/dom/link-href-test.tsx) - 字符串、对象与相对目标的 href。
- [React Router 8.3.0 Link Push Tests](https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/__tests__/dom/link-push-test.tsx) - push、replace 与同目标例外。
- [React Router 8.3.0 Link Click Tests](https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/__tests__/dom/link-click-test.tsx) - 修饰键、窗口目标与文档导航行为。
- [React Router 8.3.0 ScrollRestoration](https://reactrouter.com/8.3.0/api/components/ScrollRestoration) - preventScrollReset 的依赖边界。
