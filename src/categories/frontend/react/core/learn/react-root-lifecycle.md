---
id: react.core.learn.basics.react-root-lifecycle
type: lesson
title: React Root 与页面入口
summary: 掌握 createRoot、render、unmount 与 DOM 容器所有权，正确完成 React 页面入口和退出。
domain: frontend
technology: react
module: core
stage: basics
level: beginner
estimatedMinutes: 70
prerequisites:
  - react.core.learn.basics.jsx-runtime-and-react-element
related: []
tags:
  - React
  - React DOM
  - createRoot
  - render
  - unmount
  - DOM container
appliesTo: React 19.2 / React DOM 19.2.8
verifiedAt: 2026-08-15
objectives:
  - 能解释 DOM 容器、React Root、React node 与容器内部 DOM 之间的职责关系。
  - 能安全取得非空 DOM 容器，调用 createRoot 并用 root.render 完成首次显示。
  - 能区分首次 render、同一 Root 的重复 render、root.unmount 和为同一容器建立新 Root。
  - 能说明 root.unmount 后旧 Root 为什么不可复用，以及外部宿主移除容器前为什么要先卸载。
  - 能判断单 Root、多个独立 Root 与 hydrateRoot 各自适用的入口边界。
recap:
  - createRoot 接收真实 DOM 容器并返回 Root；它本身不会自动显示 React 内容。
  - root.render 接收 React node，首次调用建立内容，再次调用在同一个 Root 中更新。
  - Root 管理容器内部，不应由其他代码同时改写同一区域。
  - root.unmount 会永久结束当前 Root；旧 Root 不可再 render，但同一容器可创建新 Root。
  - 已由 React 服务端生成的 HTML 使用 hydrateRoot；空的客户端入口使用 createRoot 与 root.render。
sources:
  - title: React createRoot
    url: https://react.dev/reference/react-dom/client/createRoot
    sourceType: api-doc
    appliesTo: React DOM 19.2
    claims:
      - createRoot、root.render、root.unmount 的公共合同、容器所有权、多 Root 与 hydration 边界
  - title: React createElement
    url: https://react.dev/reference/react/createElement#what-is-a-react-element-exactly
    sourceType: api-doc
    appliesTo: React 19.2
    claims:
      - React element 是 UI 描述，创建描述不等于显示到 DOM
  - title: React DOM 19.2.8 Root Source
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react-dom/src/client/ReactDOMRoot.js
    sourceType: source-code
    appliesTo: React DOM 19.2.8
    claims:
      - unmount 后 Root 失效、重复 createRoot 的开发提示与当前容器边界
  - title: React DOM Root Tests
    url: https://github.com/react/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMRoot-test.js
    sourceType: official-test
    appliesTo: React DOM 19.2.8
    claims:
      - 首次 render 替换旧 HTML、同容器重建 Root 与宿主销毁顺序
  - title: React hydrateRoot
    url: https://react.dev/reference/react-dom/client/hydrateRoot
    sourceType: api-doc
    appliesTo: React DOM 19.2
    claims:
      - 已有服务端 React HTML 的 hydration 入口边界
  - title: '@types/react-dom 19.2.4'
    url: https://registry.npmjs.org/@types/react-dom/-/react-dom-19.2.4.tgz
    sourceType: source-code
    appliesTo: React DOM types 19.2.4
    claims:
      - Container、Root、render 与 unmount 的 TypeScript 公共类型
  - title: DOM Standard getElementById
    url: https://dom.spec.whatwg.org/#dom-nonelementparentnode-getelementbyid
    sourceType: specification
    appliesTo: DOM Standard
    claims:
      - 页面入口查询不到元素时返回 null
---

# React Root 与页面入口

## 一、学习目标

- 从一段 HTML 入口开始，能指出哪个节点是 React 的 DOM 容器。
- 能写出 `createRoot(container)` 与 `root.render(reactNode)` 的最小启动代码。
- 能解释为什么 `createRoot` 成功后页面仍可能是空白。
- 能在外部宿主销毁区域前调用 `root.unmount()`，并停止使用旧 Root。
- 能判断“更新同一个 Root”“重建一个 Root”“多个独立容器”与“复用服务端 HTML”的不同选择。

本知识点聚焦 Root、页面入口与宿主 DOM 的边界。

## 二、为什么 React element 还不能自己出现在页面上

React element 是 UI 描述：

```tsx
const heading = <h1>React Core</h1>
```

这个值只是 UI 描述。它不知道页面上的哪个 DOM 区域归 React 管，也没有权限直接修改任意节点。
浏览器页面可能同时包含导航、服务端模板、另一套框架和多个 React 区域。React 需要一个明确入口，
回答两个问题：

1. 哪个 DOM 容器交给 React 管理？
2. 哪一份 React node 要显示在这个容器里？

Root 就是这两个世界之间的长期边界对象。

```text
浏览器 DOM 容器
  -> createRoot(container)
  -> React Root
  -> root.render(reactNode)
  -> React 管理容器内部 DOM
```

把 Root 单独理解清楚，才能准确区分“创建描述”“启动应用”“更新内容”和“销毁宿主”。

## 三、先认识四个不同对象

### 1. DOM 容器

HTML 先提供一个真实节点：

```html
<div id="root"></div>
```

在浏览器中，`document.getElementById('root')` 返回 `HTMLElement | null`。找到时，这个 HTMLElement
可以作为 React 容器；找不到时得到 `null`，不能传给 `createRoot`。

容器本身仍属于浏览器 DOM。React 取得的是“管理其内部内容”的责任，不会把这个 `<div>` 替换成
Root 对象。

### 2. React Root

把非空 DOM 容器传给 `createRoot(container)` 会得到 React Root。Root 是一个 JavaScript 对象，
公开方法只有当前学习需要的：

```ts
interface Root {
  render(children: ReactNode): void
  unmount(): void
}
```

它不是 HTMLElement，也不是 React element，更不是组件实例。

### 3. React node

传给 `root.render` 的值是 React node。JSX element 是常见输入；string、number、`null` 等也属于
该参数的类型范围。Root 决定把这份描述送入哪个宿主容器。

### 4. 容器内部 DOM

React 完成工作后，浏览器才在容器里面出现真实节点：

```html
<div id="root">
  <main>课程</main>
</div>
```

这四者不能混用：

| 对象       | 例子                             | 主要职责                        |
| ---------- | -------------------------------- | ------------------------------- |
| DOM 容器   | `HTMLElement`                    | 划定 React 可管理的宿主区域     |
| React Root | `createRoot(container)` 的返回值 | 保存该区域的 React 生命周期入口 |
| React node | `<main />`                       | 描述想显示什么                  |
| 内部 DOM   | 浏览器里的 `HTMLMainElement`     | 用户最终看到和操作的宿主节点    |

## 四、`createRoot`：建立所有权，不负责首次显示

### 1. 完整页面入口

```tsx
import { createRoot } from 'react-dom/client'

const container = document.getElementById('root')
if (!container) {
  throw new Error('页面缺少 React 根容器 #root')
}

const root = createRoot(container)
root.render(<main>React Core</main>)
```

- `createRoot` 来自 `react-dom/client`，不是 `react`。
- `getElementById` 返回 `HTMLElement | null`，必须先排除 `null`。
- `createRoot(container)` 让 React Root 取得容器内部的管理责任，并返回 Root 对象。
- `root.render(reactNode)` 提交首次要显示的 React node，返回 `undefined`。

显式检查 `null` 能在 HTML 模板缺少入口节点时立即给出明确故障，而不是稍后出现模糊空白页。
若项目封装了经过验证的容器查询函数，也可以使用该函数取得非空容器。

### 2. 返回 Root 不等于已有内容

如果完整入口示例只执行到 `createRoot(container)`，React 就只建立了 Root，还没有收到任何 React
node，因此页面不会显示组件。`createRoot` 表示创建 Root，不表示创建并渲染 App。

### 3. 完整 React 应用通常只有一个顶层 Root

若整个应用由 React 构建，通常只在页面入口创建一个顶层 Root。页面结构通过 React node 管理，
不需要为每个组件各建一个 Root。Root 是宿主边界，不是组件复用工具。

## 五、`root.render`：提交 React node

### 1. 第一次 render

```tsx
root.render(<main>第一次内容</main>)
```

官方合同说明，第一次调用会清除容器里原有 HTML，再显示传入的 React node。也就是说，下面的
占位内容不是“自动保留在 React 树外”：

```html
<div id="root">正在加载旧内容</div>
```

首次 `root.render(<App />)` 后，React 接管容器内部，原字符串会被替换。

### 2. `render` 只接受一个参数

容器已经在 `createRoot(container)` 时绑定，不需要再次传入：

```tsx
root.render(<App />)
```

下面是旧 API 心智模型残留：

```tsx
root.render(<App />, container)
```

`root.render` 只接收待显示的 React node；多余参数属于旧 API 的用法。

### 3. 返回值是 `undefined`

`root.render` 返回 `undefined`。不要把返回值当成 DOM、Root 或组件实例：

```tsx
const result = root.render(<App />)
// result 的类型是 void
```

需要保存的是 `createRoot` 返回的 Root，而不是 `render` 返回值。

## 六、Root 复用规则与容器所有权

### 1. 同一容器复用现有 Root

同一个存活 Root 可以多次接收新的 React node：

```tsx
root.render(<main>修订 1</main>)
root.render(<main>修订 2</main>)
```

第二次调用把最新描述提交给同一个 Root，Root 对象没有变化。不要在每次更新时重新执行
`createRoot(container)`；同一时刻，一个容器只应归一个存活 Root 管理。

完整 React 应用的日常交互通常由组件 State 发起更新。外部宿主需要替换顶层输入时，才会由持有
Root 的集成层再次调用 `root.render`。

### 2. 不同独立容器才创建不同 Root

旧页面可能只有两个局部位置由 React 接管：

```tsx
const navigationRoot = createRoot(navigationContainer)
const commentsRoot = createRoot(commentsContainer)

navigationRoot.render(<Navigation />)
commentsRoot.render(<Comments />)
```

这是两个独立 Root，各自有独立生命周期。它们不是同一 React 组件树，Context 等树内机制也不会自动
跨 Root 连接。

### 3. React 管理容器内部，宿主管理边界

调用 Root render 后，应用代码不应再用 `innerHTML`、`replaceChildren` 或另一套渲染器同时修改同一
容器内部。两套所有者会互相覆盖，React 保存的树与实际 DOM 也可能失去一致。

可以这样划分责任：

```text
外部宿主负责：容器何时创建、何时移除、Root 何时启动和结束
React Root 负责：容器内部的 React 树、事件和更新
```

### 4. React 不拥有容器外的兄弟节点

```html
<header>外部宿主导航</header>
<div id="root"></div>
<footer>外部宿主页脚</footer>
```

Root 管理 `#root` 内部，不会自动接管 header 与 footer。这个边界使 React 能嵌入已有页面。

## 七、`root.unmount`：结束当前 Root 的全部生命周期

### 1. unmount 做什么

```tsx
root.unmount()
```

官方合同包含三部分：

- 卸载 Root 中的整棵组件树。
- 从容器中移除 React 渲染的内容。
- 让 React 与该 DOM 容器脱离，包括树内事件与 State。

`root.unmount()` 不接受参数，返回 `undefined`。

### 2. 完整 React 应用通常不手动卸载顶层 Root

如果页面从加载到关闭一直由同一个 React 应用控制，浏览器销毁文档时无需业务代码再手动卸载顶层
Root。频繁 unmount/recreate 顶层应用通常说明生命周期边界设计错了。

### 3. 嵌入外部宿主时必须协调销毁

如果 React 区域位于传统页面、桌面壳或另一框架页面中，外部代码可能先移除容器。
这时应在移除 DOM 前调用：

```tsx
root.unmount()
container.remove()
```

只删除 DOM 节点不等于 React 已收到卸载通知，树内资源也不能依赖 DOM 消失来完成清理。

### 4. unmount 后旧 Root 永久不可复用

```tsx
root.unmount()
root.render(<App />) // 运行时错误
```

React DOM 19.2.8 在这种调用下会抛出：

```text
Cannot update an unmounted root.
```

调用 `unmount` 不会自动清空应用保存的变量。必须通过所有权设计防止旧引用继续流动。

### 5. 同一 DOM 容器可以创建新 Root

旧 Root 不可复用，不代表容器永远报废：

```tsx
const firstRoot = createRoot(container)
firstRoot.render(<p>第一代</p>)
firstRoot.unmount()

const secondRoot = createRoot(container)
secondRoot.render(<p>第二代</p>)
```

`firstRoot !== secondRoot`。这是两个不同生命周期，第二个 Root 重新取得已解除的容器所有权。

## 八、客户端入口选择

```text
客户端新建 React UI -> createRoot + root.render
React 服务端 HTML   -> hydrateRoot
```

## 九、运行 Demo

下面的同源 Demo 依次观察：

1. `createRoot` 与首次 `root.render` 建立第一代 Root。
2. 再次 render 时 Root 代次不变，只增加修订号。
3. unmount 后容器内容清空。
4. 对旧 Root 再 render 得到 `Cannot update an unmounted root.`，错误被播放器捕获，不污染 console。
5. 同一个 DOM 容器可以建立第二代新 Root。

:::demo{id="react.core.learn.basics.react-root-lifecycle.root-lifecycle-demo"}
按生命周期顺序操作 Root，并对比“同 Root 更新”和“同容器新 Root”
:::

## 十、易错使用提示

:::pitfalls

### 错误：只调用 `createRoot` 就等待页面出现内容

**触发条件：** 创建 Root 后没有调用 `root.render`。

**原因：** `createRoot` 只建立 React 与 DOM 容器的所有权对象，没有收到待显示的 React node。

**后果：** 页面保持空白，开发者误查 CSS、路由或 JSX transform。

**错误示例：**

```tsx
createRoot(container)
```

**正确写法：**

```tsx
const root = createRoot(container)
root.render(<App />)
```

**验证方式：** 在容器为空时分别执行两段代码，检查首次 render 前后容器 child 数量。

### 错误：用断言掩盖不存在的容器

**触发条件：** 对查询结果直接写 `as HTMLElement` 或非空断言，但 HTML 中可能没有对应 ID。

**原因：** 类型断言只改变编译器看法，不会在浏览器中创建节点。

**后果：** `createRoot` 在运行时抛出 `Target container is not a DOM element.`。

**错误示例：**

```tsx
const container = document.getElementById('root') as HTMLElement
createRoot(container)
```

**正确写法：**

```tsx
const container = document.getElementById('root')
if (!container) throw new Error('缺少 #root')
createRoot(container)
```

**验证方式：** 删除入口 HTML 的节点，确认应用在查询处给出清晰错误，而不是把 `null` 交给 React。

### 错误：每次更新都重新 `createRoot`

**触发条件：** 把 `createRoot(container)` 放进刷新函数或重复执行的事件中。

**原因：** 把 Root 当作一次性 render 函数，没有保存宿主所有权对象。

**后果：** 同一容器出现多个存活 Root 的所有权冲突、warning 或不可预测更新。

**错误示例：**

```tsx
function refresh(node: ReactNode) {
  createRoot(container).render(node)
}
```

**正确写法：**

```tsx
const root = createRoot(container)

function refresh(node: ReactNode) {
  root.render(node)
}
```

**验证方式：** 记录 Root identity；多次更新必须保持同一实例，除非先明确 unmount。

### 错误：给 `root.render` 再传一次容器或回调

**触发条件：** 从旧 `ReactDOM.render(element, container, callback)` 迁移时保留第二、第三参数。

**原因：** 新 Root API 已在 `createRoot` 时绑定容器，`root.render` 只接收 React node。

**后果：** 参数不符合新 Root API；回调也不会成为可靠的完成通知。

**错误示例：**

```tsx
root.render(<App />, container)
```

**正确写法：**

```tsx
const root = createRoot(container)
root.render(<App />)
```

**验证方式：** 确认容器只传给 `createRoot`，`root.render` 只接收 React node。

### 错误：unmount 后继续复用旧 Root

**触发条件：** 销毁阶段调用 `root.unmount()`，随后启动阶段仍读取旧变量并 `root.render(...)`。

**原因：** unmount 永久结束该 Root 实例，但保存旧 Root 的变量仍然存在。

**后果：** 运行时抛出 `Cannot update an unmounted root.`。

**错误示例：**

```tsx
root.unmount()
root.render(<App />)
```

**正确写法：**

```tsx
root.unmount()
const nextRoot = createRoot(container)
nextRoot.render(<App />)
```

**验证方式：** 在 Demo 中卸载后验证旧 Root 错误，再检查同一容器的新 Root 代次增加。

### 错误：外部宿主直接删除容器，不通知 React

**触发条件：** 外部页面或其他 UI 系统直接执行 `container.remove()`。

**原因：** DOM 节点消失不会自动调用 React 组件卸载流程。

**后果：** 组件无法可靠释放订阅、定时器或全局资源，宿主与 React 生命周期失配。

**错误示例：**

```ts
container.remove()
```

**正确写法：**

```ts
root.unmount()
container.remove()
```

**验证方式：** 宿主销毁测试必须观察 unmount 发生在 DOM 容器移除之前。

### 错误：对服务端 React HTML 使用 `createRoot`

**触发条件：** 容器已有 SSR/SSG 生成的 React 标记，客户端仍调用 `createRoot(...).render(...)`。

**原因：** `createRoot` 首次 render 会清除已有 HTML；它不是 hydration 入口。

**后果：** 服务端 DOM 被重建，失去复用目标，可能出现闪烁、输入丢失或诊断信息。

**错误示例：**

```tsx
createRoot(container).render(<App />)
```

**正确写法：**

```tsx
hydrateRoot(container, <App />)
```

**验证方式：** 先确认 HTML 来源；服务端输出走 hydration 专项测试，空客户端容器才走 createRoot。
:::

## 十一、原理与适用场景

### 1. 官方事实

- `createRoot` 文档把 DOM 容器与 Root 的 `render/unmount` 方法分开。
- 同一个 Root 可重复 render，首次 render 会清空容器原内容。
- `root.unmount` 会让 React 与容器脱离，旧 Root 之后不可再 render。
- 旧 Root 再次调用 `render` 会抛出 `Cannot update an unmounted root.`，同一容器解除旧 Root 后可以创建新 Root。

### 2. 设计结论

- Root 应由页面入口或宿主管理层持有，而不是作为普通业务对象在组件间传播。
- 宿主所有权最好用明确状态表达：未创建、存活、已卸载；不要只看变量是否曾经赋值。
- 更新优先复用存活 Root；只有明确结束旧生命周期后，才为同一容器创建新 Root。
- 外部宿主与 React 的销毁顺序必须明确，不能依赖 DOM 被移除后的偶然行为。

### 3. 适用场景

- React SPA 或静态客户端应用的启动入口。
- React 小部件嵌入服务端模板或传统多页应用。
- 嵌入式 React 小部件的 mount、update、unmount 生命周期。
- Vue 等其他框架中的隔离 React Demo 宿主。
- 排查空白页、重复 Root、容器不存在、旧 Root 复用和 SSR 入口错误。

## 十二、练习

:::exercise

### 为外部宿主设计可验证的 Root 状态机

**要求：** 假设旧页面提供 `mount(container)`、`update(label)`、`destroy()` 三个入口，写出伪代码；
mount 只创建一次存活 Root 并首次 render，update 只复用当前 Root，destroy 先 unmount 再清空引用，
destroy 后 update 明确失败，再次 mount 时可以为同一容器创建新 Root。

**验收：** 能指出 Root identity 何时保持、何时变化；能避免已 unmount Root 被再次使用；能把 SSR
容器排除在这套 `createRoot` 流程之外。
:::

## 十三、本节小结

- DOM 容器划定宿主范围，React Root 保存该范围的 React 生命周期入口，React node 描述要显示什么。
- `createRoot` 只建立 Root；首次内容必须由 `root.render` 提交。
- 同一个 Root 可以再次 render，日常组件交互则通常由 State 更新，不需要业务层反复操作 Root。
- React 管理容器内部，外部宿主管理容器创建与销毁；同一区域不能同时交给多个所有者修改。
- `root.unmount` 永久结束当前 Root。旧 Root 不可复用，但解除所有权后的同一 DOM 容器可创建新 Root。
- 完整 React 应用通常一个顶层 Root；局部嵌入可有多个独立 Root。
- 服务端 React HTML 使用 `hydrateRoot`，不能用 `createRoot` 冒充 hydration。

## 十四、参考资料

- [React `createRoot`](https://react.dev/reference/react-dom/client/createRoot) - Root 创建、更新、卸载、多个 Root 与 hydration 入口边界。
- [React 19.2 `createRoot` 文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/client/createRoot.md) - Root 客户端入口的官方说明。
- [React DOM 19.2.8 `ReactDOMRoot.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react-dom/src/client/ReactDOMRoot.js) - Root 失效错误与当前版本行为。
- [React `hydrateRoot`](https://react.dev/reference/react-dom/client/hydrateRoot) - 已有 React 服务端 HTML 的客户端入口。
